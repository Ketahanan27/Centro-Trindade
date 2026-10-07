import db from '../config/db.js';
const q = (sql, params = []) => db.query(sql, params);
const FINANCAS = ['Administrador', 'Tesouraria', 'Pastor'];
const MEMBROS = ['Administrador', 'Secretaria', 'Pastor'];
export function periodoDashboard(now = new Date()) {
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const [ano, mes] = hoje.split('-').map(Number);
  return { hoje, ano, mes, inicioMes: `${ano}-${String(mes).padStart(2, '0')}-01`, fimMes: `${mes === 12 ? ano + 1 : ano}-${String(mes === 12 ? 1 : mes + 1).padStart(2, '0')}-01`, inicioAno: `${ano}-01-01`, fimAno: `${ano + 1}-01-01` };
}
export const getDashboardStats = async (req, res) => {
  try {
    const podeVerFinancas = FINANCAS.includes(req.user?.perfil);
    const podeVerMembros = MEMBROS.includes(req.user?.perfil);
    const admin = req.user?.perfil === 'Administrador';
    const periodo = periodoDashboard();
    const mes = [periodo.inicioMes, periodo.fimMes];
    const ano = [periodo.inicioAno, periodo.fimAno];
    const [membros, novos, visitantes, eventos, crescimento, estados, financeiro, graficoAnual, semConta, convites] = await Promise.all([
      q("SELECT COUNT(*) AS total FROM membros WHERE estado='Ativo'"),
      podeVerMembros ? q('SELECT COUNT(*) AS total FROM membros WHERE entrada >= $1::date AND entrada < $2::date', mes) : [],
      podeVerMembros ? q('SELECT COUNT(*) AS total FROM visitantes WHERE data_visita >= $1::date AND data_visita < $2::date', mes) : [],
      q(`SELECT id,titulo,TO_CHAR(data_evento,'YYYY-MM-DD') AS data,hora_evento,local_evento,
         COUNT(*) OVER() AS total FROM eventos WHERE estado='Agendado' AND data_evento >= $1::date
         AND ($2::boolean OR publico=true) ORDER BY data_evento,hora_evento NULLS LAST,id LIMIT 4`, [periodo.hoje, podeVerMembros]),
      podeVerMembros ? q('SELECT EXTRACT(MONTH FROM entrada)::integer AS mes,COUNT(*) AS total FROM membros WHERE entrada >= $1::date AND entrada < $2::date GROUP BY 1 ORDER BY 1', ano) : [],
      podeVerMembros ? q('SELECT estado,COUNT(*) AS total FROM visitantes GROUP BY estado ORDER BY estado') : [],
      podeVerFinancas ? q("SELECT COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas,COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas FROM tesouraria WHERE data >= $1::date AND data < $2::date", mes) : [],
      podeVerFinancas ? q("SELECT EXTRACT(MONTH FROM data)::integer AS mes,COALESCE(SUM(valor) FILTER (WHERE natureza='Receita'),0) AS receitas,COALESCE(SUM(valor) FILTER (WHERE natureza='Despesa'),0) AS despesas FROM tesouraria WHERE data >= $1::date AND data < $2::date GROUP BY 1 ORDER BY 1", ano) : [],
      podeVerMembros ? q('SELECT COUNT(*) AS total FROM membros WHERE utilizador_id IS NULL') : [],
      admin ? q("SELECT COUNT(*) AS total FROM utilizadores WHERE convite_pendente=true AND estado='Ativo'") : [],
    ]);
    const receita = Number(financeiro[0]?.receitas ?? 0), despesa = Number(financeiro[0]?.despesas ?? 0);
    res.set('Cache-Control', 'private, no-store');
    res.json({ periodo, podeVerFinancas, podeVerMembros,
      stats: { membros: Number(membros[0]?.total ?? 0), novosMembros: podeVerMembros ? Number(novos[0]?.total ?? 0) : null,
        visitantes: podeVerMembros ? Number(visitantes[0]?.total ?? 0) : null, eventos: Number(eventos[0]?.total ?? 0),
        receitas: podeVerFinancas ? receita.toFixed(2) : null, despesas: podeVerFinancas ? despesa.toFixed(2) : null,
        saldo: podeVerFinancas ? (receita - despesa).toFixed(2) : null },
      proximosEventos: eventos.map(({ id, titulo, data, hora_evento, local_evento }) => ({ id, titulo, data, hora_evento, local_evento })),
      crescimento: crescimento.map((row) => ({ mes: Number(row.mes), total: Number(row.total) })),
      visitantesPorEstado: estados.map((row) => ({ estado: row.estado, total: Number(row.total) })),
      graficoAnual: graficoAnual.map((row) => ({ mes: Number(row.mes), receitas: Number(row.receitas), despesas: Number(row.despesas) })),
      pendencias: { membrosSemConta: podeVerMembros ? Number(semConta[0]?.total ?? 0) : null, contasPorAtivar: admin ? Number(convites[0]?.total ?? 0) : null },
    });
  } catch (error) {
    console.error('[dashboard]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível carregar os indicadores da igreja.' });
  }
};
