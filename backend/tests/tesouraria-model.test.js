import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calcularResumo, calcularTotaisPorTipo, filtrarMovimentos, formularioDoMovimento, paginarMovimentos } from '../../src/features/tesouraria/tesouraria.model.js';

const movimentos = [
  { id: 1, natureza: 'Receita', tipo: 'Oferta', valor: '100.50', data: '2026-10-01', observacao: 'Culto' },
  { id: 2, natureza: 'Despesa', tipo: 'Água', valor: '20.25', data: '2026-10-03', observacao: null },
  { id: 3, natureza: 'Receita', tipo: 'Oferta', valor: '10.25', data: '2026-10-02', observacao: '' },
];

test("Os resumos financeiros convertem decimais da base e incluem todos os movimentos", () => {
  assert.deepEqual(calcularResumo(movimentos), { entradas: 110.75, saidas: 20.25, saldo: 90.5 });
  assert.deepEqual(calcularTotaisPorTipo(movimentos), [['Oferta', 110.75], ['Água', 20.25]]);
  assert.deepEqual(calcularResumo([]), { entradas: 0, saidas: 0, saldo: 0 });
});

test("Os filtros combinam texto e natureza e ordenam sem alterar os dados originais", () => {
  assert.deepEqual(filtrarMovimentos(movimentos, 'OFERTA', 'Receita').map(m => m.id), [3, 1]);
  assert.deepEqual(filtrarMovimentos(movimentos, 'culto', 'Todos').map(m => m.id), [1]);
  assert.deepEqual(filtrarMovimentos(movimentos, 'culto', 'Despesa'), []);
  assert.deepEqual(movimentos.map(m => m.id), [1, 2, 3]);
});

test("A paginação limita cada página a dez movimentos e ajusta a página após filtragem ou eliminação", () => {
  const lista = Array.from({ length: 21 }, (_, id) => ({ id }));
  assert.equal(paginarMovimentos(lista, 1).movimentosDaPagina.length, 10);
  assert.deepEqual(paginarMovimentos(lista, 2).movimentosDaPagina.map(m => m.id), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  assert.deepEqual(paginarMovimentos(lista, 8), { totalPaginas: 3, paginaVisivel: 3, movimentosDaPagina: [{ id: 20 }] });
  assert.equal(paginarMovimentos(lista.slice(0, 10), 3).paginaVisivel, 1);
  assert.deepEqual(paginarMovimentos([], 3), { totalPaginas: 0, paginaVisivel: 1, movimentosDaPagina: [] });
});

test("A edição normaliza a data do movimento e exige um novo motivo para a auditoria", () => {
  const movimento = { ...movimentos[0], data: '2026-10-01T00:00:00Z', motivo: 'Motivo anterior' };
  const form = formularioDoMovimento(movimento);
  assert.equal(form.data, '2026-10-01');
  assert.equal(form.valor, '100.50');
  assert.equal(form.motivo, '');
  assert.equal(movimento.motivo, 'Motivo anterior');
});
