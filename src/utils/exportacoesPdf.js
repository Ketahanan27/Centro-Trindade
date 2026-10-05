import { criarPDFOficial, moedaPDF, dataPDFHoje } from "./pdfOficial.js";
import { formatarData } from "./data.js";

export function criarAtaPDF(reuniao) {
  const pdf = criarPDFOficial({ titulo: "Ata de reunião", departamento: "Secretaria Geral", referencia: reuniao.id ? `Ata n.º ${reuniao.id}` : "" });
  pdf.secao("Identificação da reunião");
  for (const [label, value] of [["Título", reuniao.titulo], ["Data", formatarData(reuniao.data)], ["Hora", reuniao.hora], ["Local", reuniao.local]]) pdf.paragrafo(`${label}: ${value || "-"}`);
  for (const [titulo, campo] of [["Participantes", "participantes"], ["Resumo da reunião", "resumo"], ["Decisões e deliberações", "decisoes"], ["Observações", "observacoes"]]) {
    pdf.secao(titulo); pdf.paragrafo(reuniao[campo] || "Sem informação registada.");
  }
  return pdf.finalizar();
}

export function criarTesourariaPDF(movimentos, { titulo = "Relatório de tesouraria", periodo = "Todos os movimentos", pesquisa = "", natureza = "Todos" } = {}) {
  const pdf = criarPDFOficial({ titulo, departamento: "Tesouraria | Gestão financeira" });
  pdf.secao("Âmbito do relatório");
  pdf.paragrafo(`${periodo}. Natureza: ${natureza}.${pesquisa ? ` Pesquisa: ${pesquisa}.` : ""} Total de movimentos: ${movimentos.length}.`);
  const receitas = movimentos.filter((m) => m.natureza === "Receita").reduce((s, m) => s + Number(m.valor), 0);
  const despesas = movimentos.filter((m) => m.natureza === "Despesa").reduce((s, m) => s + Number(m.valor), 0);
  pdf.secao("Resumo financeiro");
  pdf.tabela(["Receitas", "Despesas", "Saldo"], [[moedaPDF(receitas), moedaPDF(despesas), moedaPDF(receitas - despesas)]], [57, 57, 56]);
  pdf.secao("Movimentos registados");
  pdf.tabela(["Data", "Natureza", "Categoria", "Valor", "Observações"], movimentos.map((m) => [formatarData(m.data), m.natureza, m.tipo, moedaPDF(m.valor), m.observacao || "-"]), [24, 25, 32, 28, 61]);
  return pdf.finalizar();
}

export function criarRelatorioPDF(dados) {
  const pdf = criarPDFOficial({ titulo: `Relatório anual - ${dados.ano}`, departamento: "Secretaria Geral | Relatórios de atividade" });
  const g = dados.geral;
  pdf.secao("Estado atual - indicadores globais");
  pdf.paragrafo("Os indicadores desta secção representam o estado atual dos registos, sem filtro pelo ano selecionado.");
  pdf.tabela(["Indicador", "Total"], [["Membros ativos", g.membros_ativos], ["Total de membros", g.membros_total], ["Total de visitantes", g.visitantes_total], ["Visitantes que se tornaram membros", g.convertidos], ["Próximos eventos", g.proximos_eventos]], [135, 35]);
  for (const [titulo, rows] of [["Membros por estado", dados.membrosEstado], ["Visitantes por estado", dados.visitantesEstado]]) {
    pdf.secao(titulo); pdf.tabela(["Estado", "Total"], rows.length ? rows.map((r) => [r.estado, r.total]) : [["Sem registos", 0]], [135, 35]);
  }
  pdf.secao(`Atividade anual - ${dados.ano}`);
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const mensais = meses.map((mes, i) => {
    const evento = dados.eventosMes.find((r) => Number(r.mes) === i + 1);
    const apresentacao = dados.apresentacoesMes.find((r) => Number(r.mes) === i + 1);
    return [mes, evento?.total ?? 0, apresentacao?.sessoes ?? 0, apresentacao?.criancas ?? 0];
  });
  pdf.tabela(["Mês", "Eventos", "Apresentações", "Crianças"], mensais, [65, 35, 40, 30]);
  if (dados.podeVerFinancas) {
    pdf.secao(`Resumo financeiro - ${dados.ano}`);
    pdf.tabela(["Receitas", "Despesas", "Saldo"], [[moedaPDF(g.receitas_ano), moedaPDF(g.despesas_ano), moedaPDF(Number(g.receitas_ano) - Number(g.despesas_ano))]], [57, 57, 56]);
    pdf.tabela(["Mês", "Receitas", "Despesas", "Saldo"], meses.map((mes, i) => {
      const row = dados.financeiroMensal.find((r) => Number(r.mes) === i + 1);
      return [mes, moedaPDF(row?.receitas), moedaPDF(row?.despesas), moedaPDF(Number(row?.receitas ?? 0) - Number(row?.despesas ?? 0))];
    }), [50, 40, 40, 40]);
  }
  return pdf.finalizar();
}

export { dataPDFHoje };
