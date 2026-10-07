export const TIPOS = {
  Receita: ['Dízimo', 'Oferta', 'Voto', 'Contribuição', 'Doação', 'Ação Social', 'T-Shirts', 'Outros'],
  Despesa: ['Água', 'Luz', 'Internet', 'Manutenção', 'Compras', 'Caixa', 'Outros']
};
export const MOVIMENTOS_POR_PAGINA = 10;
export function dataHoje(data = new Date()) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}
export function formularioVazio() {
  return {
    natureza: 'Receita',
    tipo: TIPOS.Receita[0],
    valor: '',
    data: dataHoje(),
    observacao: '',
    motivo: ''
  };
}
export function formularioDoMovimento(movimento) {
  return {
    natureza: movimento.natureza,
    tipo: movimento.tipo,
    valor: String(movimento.valor),
    data: String(movimento.data).slice(0, 10),
    observacao: movimento.observacao || '',
    motivo: ''
  };
}
export function calcularResumo(movimentos) {
  let entradas = 0;
  let saidas = 0;
  for (const movimento of movimentos) {
    if (movimento.natureza === 'Receita') entradas += Number(movimento.valor);
    if (movimento.natureza === 'Despesa') saidas += Number(movimento.valor);
  }
  return {
    entradas,
    saidas,
    saldo: entradas - saidas
  };
}
export function filtrarMovimentos(movimentos, pesquisa, natureza) {
  const termo = pesquisa.toLowerCase();
  return movimentos.filter(movimento => {
    const texto = movimento.tipo.toLowerCase().includes(termo) || (movimento.observacao || '').toLowerCase().includes(termo);
    return texto && (natureza === 'Todos' || movimento.natureza === natureza);
  }).sort((a, b) => new Date(b.data) - new Date(a.data));
}
export function paginarMovimentos(movimentos, pagina) {
  const totalPaginas = Math.ceil(movimentos.length / MOVIMENTOS_POR_PAGINA);
  const paginaVisivel = Math.max(1, Math.min(pagina, Math.max(totalPaginas, 1)));
  const inicio = (paginaVisivel - 1) * MOVIMENTOS_POR_PAGINA;
  return {
    totalPaginas,
    paginaVisivel,
    movimentosDaPagina: movimentos.slice(inicio, inicio + MOVIMENTOS_POR_PAGINA)
  };
}
export function calcularTotaisPorTipo(movimentos) {
  const totais = new Map();
  for (const movimento of movimentos) {
    totais.set(movimento.tipo, (totais.get(movimento.tipo) || 0) + Number(movimento.valor));
  }
  return [...totais.entries()].sort((a, b) => b[1] - a[1]);
}
