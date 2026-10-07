export const FORM_VAZIO = {
  data_apresentacao: "",
  quantidade: "",
  observacoes: ""
};

export function anosDasApresentacoes(apresentacoes) {
  return [...new Set(apresentacoes.map(item => Number(String(item.data_apresentacao).slice(0, 4))))].sort((a, b) => b - a);
}

export function filtrarApresentacoes(apresentacoes, pesquisa, ano) {
  return apresentacoes.filter(item =>
    (item.observacoes || '').toLowerCase().includes(pesquisa.toLowerCase()) &&
    (ano === 'Todos' || String(item.data_apresentacao).slice(0, 4) === ano),
  );
}
