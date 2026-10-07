import { criarPDFOficial, moedaPDF } from './pdfOficial.js';
import { formatarData } from './data.js';

export const ROTULOS_RELATORIO = { entradas: 'Entradas no período', atividades: 'Atividades registadas', participacoes: 'Participações de visitantes', visitas_registadas: 'Visitas com acompanhamento', eventos: 'Eventos', agendados: 'Agendados', concluidos: 'Concluídos', cancelados: 'Cancelados', publicos: 'Públicos', sessoes: 'Sessões', criancas: 'Crianças apresentadas', documentos: 'Documentos emitidos', reunioes: 'Reuniões', movimentos: 'Movimentos', receitas: 'Receitas', despesas: 'Despesas', saldo: 'Saldo do período' };
export const valorRelatorio = (key, value) => ['receitas','despesas','saldo','valor'].includes(key) ? moedaPDF(value) : key === 'data' ? formatarData(value) : String(value ?? '-');

export function criarRelatorioGlobalPDF(dados, notas = '') {
  const pdf = criarPDFOficial({ titulo: `Relatório ${dados.abrangencia.toLowerCase()} - ${dados.modo}`, departamento: 'Relatórios de gestão da igreja', data: dados.emitidoEm.slice(0,10), referencia: `${formatarData(dados.inicio)} a ${formatarData(dados.fim)}` });
  pdf.secao('1. Enquadramento');
  pdf.paragrafo(`Período: ${formatarData(dados.inicio)} a ${formatarData(dados.fim)}. Abrangência: ${dados.abrangencia}. Versão: ${dados.modo}.`);
  pdf.paragrafo('As operações são selecionadas pela data registada e refletem os registos existentes na emissão. Os estados de membros e visitantes representam a situação atual. As contagens por atividade medem participações, não pessoas únicas. O saldo financeiro corresponde às receitas menos despesas do período, sem saldo inicial.');
  let numero = 2;
  for (const section of Object.values(dados.sections)) {
    pdf.secao(`${numero++}. ${section.titulo}`);
    pdf.tabela(['Indicador', 'Total'], Object.entries(section.resumo).map(([key,value]) => [ROTULOS_RELATORIO[key] ?? key, valorRelatorio(key,value)]), [120,50]);
    if (section.resumo.agendados != null) pdf.graficoBarras(['agendados','concluidos','cancelados'].map(key => ({ label: ROTULOS_RELATORIO[key], valor: section.resumo[key] })));
    if (section.resumo.receitas != null) pdf.graficoBarras(['receitas','despesas'].map(key => ({ label: ROTULOS_RELATORIO[key], valor: section.resumo[key], texto: moedaPDF(section.resumo[key]) })));
    if (section.estadoAtual) {
      pdf.paragrafo('Estado atual na emissão');
      pdf.tabela(['Estado', 'Total atual'], section.estadoAtual.map(row => [row.estado || 'Sem estado',row.total]), [120,50]);
      if (section.batizadosAtuais != null) pdf.paragrafo(`Membros atualmente batizados: ${section.batizadosAtuais}.`);
    }
    if (section.mensal?.length) pdf.tabela(['Mês','Receitas','Despesas'], section.mensal.map(row => [row.mes,moedaPDF(row.receitas),moedaPDF(row.despesas)]), [60,55,55]);
    if (dados.modo !== 'detalhado') continue;
    if (!section.registos.length) { pdf.paragrafo('Sem registos neste período.'); continue; }
    if (section.titulo === 'Reuniões e atas') {
      for (const row of section.registos) {
        pdf.secao(`${row.titulo.slice(0,65)} — ${formatarData(row.data)}`);
        for (const [key,label] of [['hora','Hora'],['local','Local'],['participantes','Participantes'],['resumo','Resumo'],['decisoes','Decisões'],['observacoes','Observações']]) if (row[key]) pdf.paragrafo(`${label}: ${row[key]}`);
      }
    } else {
      const cols = section.colunas;
      const width = 170 / cols.length;
      pdf.tabela(cols.map(col => col[1]), section.registos.map(row => cols.map(([key]) => valorRelatorio(key,row[key]))), cols.map(() => width));
    }
  }
  pdf.secao(`${numero}. Observações e validação`);
  pdf.paragrafo(notas.trim() || 'Observações: __________________________________________________________');
  return pdf.finalizar();
}
