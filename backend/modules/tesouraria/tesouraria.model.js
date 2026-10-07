import { InputError } from '../../utils/inputValidation.js';
const TIPOS = {
  Receita: ['Dízimo', 'Oferta', 'Voto', 'Contribuição', 'Doação', 'Ação Social', 'T-Shirts', 'Outros'],
  Despesa: ['Água', 'Luz', 'Internet', 'Manutenção', 'Compras', 'Caixa', 'Outros'],
};

export function validarMovimento(body) {
  if (!body || typeof body.natureza !== 'string' || !Object.hasOwn(TIPOS, body.natureza) || !TIPOS[body.natureza].includes(body.tipo)) return 'Natureza ou tipo inválido.';
  if (!['number', 'string'].includes(typeof body.valor) || !/^\d+(\.\d{1,2})?$/.test(String(body.valor)) || !Number.isFinite(Number(body.valor)) || Number(body.valor) <= 0 || Number(body.valor) > 99999999.99) return 'O valor deve ser positivo, até 99 999 999,99 €, com no máximo duas casas decimais.';
  if (typeof body.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.data) || body.data.slice(0, 4) < '1900') return 'Data inválida.';
  const parsed = new Date(`${body.data}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== body.data) return 'Data inválida.';
  if (body.observacao != null && (typeof body.observacao !== 'string' || body.observacao.length > 2000)) return 'Observação inválida (máximo 2000 caracteres).';
  return null;
}

const idValido = (id) => /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0 && Number(id) <= 2147483647;


export function validarOperacao(acao, id, payload) {
  if (acao !== 'Criado' && !idValido(id)) throw new InputError('Movimento inválido.');
  const dados = payload ?? {};
  if (acao !== 'Eliminado') {
    const erro = validarMovimento(dados);
    if (erro) throw new InputError(erro);
  }
  if (acao !== 'Criado' && (typeof dados.motivo !== 'string' || dados.motivo.trim().length < 5 || dados.motivo.length > 500)) {
    throw new InputError('Indique o motivo da operação (5 a 500 caracteres).');
  }
  return dados;
}

export function calcularResumo(rows) {
  const resumo = { receitas: 0, despesas: 0, saldo: 0 };
  for (const row of rows) {
    if (row.natureza === 'Receita') resumo.receitas = Number(row.total);
    if (row.natureza === 'Despesa') resumo.despesas = Number(row.total);
  }
  resumo.saldo = resumo.receitas - resumo.despesas;
  return resumo;
}
