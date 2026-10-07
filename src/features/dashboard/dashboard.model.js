export const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
export const euro = (value) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value));
export const ESTADOS = [['Visitante', '#0044ff'], ['Em acompanhamento', '#00c9e0'], ['Tornou-se membro', '#a6b9ff']];

export const CLASSES_ESTADO_EVENTO = { Agendado: 'scheduled', 'Concluído': 'completed', Cancelado: 'cancelled' };

export function tituloDoMes(inicioMes) {
  return new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${inicioMes}T12:00:00Z`));
}

export function prepararSerieFinanceira(dados, meses) {
  const linhas = Array.from({ length: meses }, (_, indice) => {
    const mes = indice + 1;
    const registo = dados.find(linha => linha.mes === mes);
    return { mes, receitas: Number(registo?.receitas ?? 0), despesas: Number(registo?.despesas ?? 0) };
  });
  const max = Math.max(1, ...linhas.flatMap(linha => [linha.receitas, linha.despesas]));
  const temDados = linhas.some(linha => linha.receitas || linha.despesas);
  return { linhas, max, temDados };
}

export function prepararVisitantes(dados) {
  const linhas = ESTADOS.map(([estado, cor]) => ({ estado, cor, total: Number(dados.find(linha => linha.estado === estado)?.total ?? 0) }));
  const total = linhas.reduce((soma, linha) => soma + linha.total, 0);
  let inicio = 0;
  const partes = linhas.map(linha => {
    const fim = inicio + (total ? linha.total / total * 100 : 0);
    const parte = `${linha.cor} ${inicio}% ${fim}%`;
    inicio = fim;
    return parte;
  });
  return { linhas, total, partes };
}
