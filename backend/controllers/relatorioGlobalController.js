import { pool } from '../config/db.js';
import { data, InputError } from '../utils/inputValidation.js';

const ADMIN = ['Administrador', 'Secretaria', 'Pastor'];
const FINANCE = ['Administrador', 'Tesouraria', 'Pastor'];
const LIMIT = 5000;

export async function getRelatorioGlobal(req, res) {
  let client;
  try {
    const administrativo = ADMIN.includes(req.user?.perfil);
    const financeiro = FINANCE.includes(req.user?.perfil);
    if (!administrativo && !financeiro) return res.status(403).json({ message: 'Acesso não permitido.' });
    const inicio = data(req.query.inicio, 'Data inicial');
    const fim = data(req.query.fim, 'Data final');
    const modo = req.query.modo ?? 'resumido';
    if (!inicio || !fim || inicio > fim) throw new InputError('Selecione um período válido.');
    if (!['resumido', 'detalhado'].includes(modo)) throw new InputError('Formato inválido.');
    client = await pool.connect();
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const query = async (sql, params = []) => (await client.query(sql, params)).rows;
    const periodo = [inicio, fim];
    const sections = {};
    let totalDetalhes = 0;
    const section = async (key, titulo, summarySql, detailSql, columns) => {
      const resumo = (await query(summarySql, periodo))[0];
      const registos = modo === 'detalhado' ? await query(`${detailSql} LIMIT ${LIMIT + 1}`, periodo) : [];
      totalDetalhes += registos.length;
      if (totalDetalhes > LIMIT) throw new InputError('O relatório detalhado excede 5000 registos. Reduza o período ou exporte a versão resumida.');
      sections[key] = { titulo, resumo, colunas: columns, registos };
    };
    if (administrativo) {
      const estadoMembros = await query(`SELECT estado, COUNT(*) AS total FROM membros GROUP BY estado ORDER BY estado`);
      const batizados = (await query(`SELECT COUNT(*) AS total FROM membros WHERE batizado = 'Sim'`))[0].total;
      const estadoVisitantes = await query(`SELECT estado, COUNT(*) AS total FROM visitantes GROUP BY estado ORDER BY estado`);
      await section('membros', 'Entradas de membros',
        `SELECT COUNT(*) AS entradas FROM membros WHERE entrada BETWEEN $1::date AND $2::date`,
        `SELECT nome, entrada AS data, estado, batizado FROM membros WHERE entrada BETWEEN $1::date AND $2::date ORDER BY entrada, id`,
        [['nome','Nome'],['data','Entrada'],['estado','Estado atual'],['batizado','Batizado']]);
      sections.membros.estadoAtual = estadoMembros;
      sections.membros.batizadosAtuais = batizados;
      await section('participacoes', 'Visitantes por atividade',
        `SELECT COUNT(*) AS atividades, COALESCE(SUM(quantidade),0) AS participacoes FROM visitas_atividade WHERE data_atividade BETWEEN $1::date AND $2::date`,
        `SELECT atividade, data_atividade AS data, quantidade, observacoes FROM visitas_atividade WHERE data_atividade BETWEEN $1::date AND $2::date ORDER BY data_atividade, id`,
        [['atividade','Atividade'],['data','Data'],['quantidade','Visitantes'],['observacoes','Observações']]);
      await section('acompanhamento', 'Acompanhamento de visitantes',
        `SELECT COUNT(*) AS visitas_registadas FROM visitantes WHERE data_visita BETWEEN $1::date AND $2::date`,
        `SELECT nome, data_visita AS data, estado FROM visitantes WHERE data_visita BETWEEN $1::date AND $2::date ORDER BY data_visita, id`,
        [['nome','Nome'],['data','Visita'],['estado','Estado atual']]);
      sections.acompanhamento.estadoAtual = estadoVisitantes;
      await section('agenda', 'Agenda',
        `SELECT COUNT(*) AS eventos, COUNT(*) FILTER (WHERE estado='Agendado') AS agendados, COUNT(*) FILTER (WHERE estado='Concluído') AS concluidos, COUNT(*) FILTER (WHERE estado='Cancelado') AS cancelados, COUNT(*) FILTER (WHERE publico) AS publicos FROM eventos WHERE data_evento BETWEEN $1::date AND $2::date`,
        `SELECT titulo, data_evento AS data, TO_CHAR(hora_evento,'HH24:MI') AS hora, local_evento AS local, estado, CASE WHEN publico THEN 'Público' ELSE 'Interno' END AS visibilidade FROM eventos WHERE data_evento BETWEEN $1::date AND $2::date ORDER BY data_evento, id`,
        [['titulo','Evento'],['data','Data'],['hora','Hora'],['local','Local'],['estado','Estado'],['visibilidade','Visibilidade']]);
      await section('apresentacoes', 'Apresentações de crianças',
        `SELECT COUNT(*) AS sessoes, COALESCE(SUM(quantidade),0) AS criancas FROM apresentacoes WHERE data_apresentacao BETWEEN $1::date AND $2::date`,
        `SELECT data_apresentacao AS data, quantidade, observacoes FROM apresentacoes WHERE data_apresentacao BETWEEN $1::date AND $2::date ORDER BY data_apresentacao, id`,
        [['data','Data'],['quantidade','Crianças'],['observacoes','Observações']]);
      await section('documentos', 'Documentos emitidos',
        `SELECT COUNT(*) AS documentos FROM documentos WHERE data_emissao BETWEEN $1::date AND $2::date`,
        `SELECT tipo, nome_completo, data_emissao AS data FROM documentos WHERE data_emissao BETWEEN $1::date AND $2::date ORDER BY data_emissao, id`,
        [['tipo','Documento'],['nome_completo','Destinatário'],['data','Emissão']]);
      await section('atas', 'Reuniões e atas',
        `SELECT COUNT(*) AS reunioes FROM atas WHERE data BETWEEN $1::date AND $2::date`,
        `SELECT titulo, data, hora, local, participantes, resumo, decisoes, observacoes FROM atas WHERE data BETWEEN $1::date AND $2::date ORDER BY data, id`,
        [['titulo','Reunião'],['data','Data']]);
    }
    if (financeiro) {
      await section('tesouraria', 'Tesouraria',
        `SELECT COUNT(*) AS movimentos, COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas, COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas, COALESCE(SUM(CASE WHEN natureza='Receita' THEN valor ELSE -valor END),0) AS saldo FROM tesouraria WHERE data BETWEEN $1::date AND $2::date`,
        `SELECT data, natureza, tipo, valor, observacao FROM tesouraria WHERE data BETWEEN $1::date AND $2::date ORDER BY data, id`,
        [['data','Data'],['natureza','Natureza'],['tipo','Tipo'],['valor','Valor'],['observacao','Observação']]);
      sections.tesouraria.mensal = await query(`SELECT TO_CHAR(data,'YYYY-MM') AS mes, COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas, COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas FROM tesouraria WHERE data BETWEEN $1::date AND $2::date GROUP BY TO_CHAR(data,'YYYY-MM') ORDER BY mes`, periodo);
    }
    await client.query('COMMIT');
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ inicio, fim, modo, emitidoEm: new Date().toISOString(), abrangencia: administrativo && financeiro ? 'Global' : administrativo ? 'Administrativa' : 'Financeira', sections });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (error instanceof InputError) return res.status(400).json({ message: error.message });
    console.error('[relatorioGlobal]', error.code ?? 'erro');
    return res.status(500).json({ message: 'Não foi possível gerar o relatório.' });
  } finally { client?.release(); }
}
