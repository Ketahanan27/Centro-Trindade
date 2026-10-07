import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepararSerieFinanceira, prepararVisitantes, CLASSES_ESTADO_EVENTO } from '../../src/features/dashboard/dashboard.model.js';
import { datasPreset, nomeDoRelatorio } from '../../src/features/relatorios/relatorios.model.js';

test('financial chart fills missing months and excludes future months without modifying source', () => {
  const dados = [{ mes: 2, receitas: '100.50', despesas: '20' }, { mes: 12, receitas: 999, despesas: 0 }];
  const serie = prepararSerieFinanceira(dados, 3);
  assert.deepEqual(serie.linhas, [{ mes: 1, receitas: 0, despesas: 0 }, { mes: 2, receitas: 100.5, despesas: 20 }, { mes: 3, receitas: 0, despesas: 0 }]);
  assert.equal(serie.max, 100.5);
  assert.equal(serie.temDados, true);
  assert.equal(dados[0].receitas, '100.50');
});

test('empty charts preserve a safe scale and show no-data state', () => {
  const financeiro = prepararSerieFinanceira([], 12);
  assert.equal(financeiro.max, 1);
  assert.equal(financeiro.temDados, false);
  const visitantes = prepararVisitantes([]);
  assert.equal(visitantes.total, 0);
  assert.ok(visitantes.partes.every(parte => !parte.includes('NaN') && !parte.includes('Infinity')));
});

test('visitor distribution sums database counts numerically and completes the chart', () => {
  const dados = [{ estado: 'Visitante', total: '3' }, { estado: 'Em acompanhamento', total: '1' }];
  const resultado = prepararVisitantes(dados);
  assert.equal(resultado.total, 4);
  assert.deepEqual(resultado.linhas.map(linha => linha.total), [3, 1, 0]);
  assert.ok(resultado.partes[0].endsWith('0% 75%'));
  assert.ok(resultado.partes[2].endsWith('100% 100%'));
  assert.equal(dados[0].total, '3');
});

test('report presets respect Lisbon date when the local day crosses a quarter boundary', () => {
  const agora = new Date('2026-06-30T23:30:00Z');
  assert.deepEqual(datasPreset('mes', agora), { inicio: '2026-07-01', fim: '2026-07-01' });
  assert.deepEqual(datasPreset('trimestre', agora), { inicio: '2026-07-01', fim: '2026-07-01' });
  assert.deepEqual(datasPreset('ano', agora), { inicio: '2026-01-01', fim: '2026-07-01' });
});

test('report quarter starts and leap day produce ISO dates', () => {
  for (const [mes, inicio] of [['02', '01'], ['05', '04'], ['08', '07'], ['11', '10']]) {
    assert.deepEqual(datasPreset('trimestre', new Date(`2026-${mes}-15T12:00:00Z`)), { inicio: `2026-${inicio}-01`, fim: `2026-${mes}-15` });
  }
  assert.deepEqual(datasPreset('mes', new Date('2024-02-29T12:00:00Z')), { inicio: '2024-02-01', fim: '2024-02-29' });
});

test('report file names use the returned period and event states keep their distinct styles', () => {
  assert.equal(nomeDoRelatorio('detalhado', { inicio: '2026-01-01', fim: '2026-10-07' }), 'centro-trindade-relatorio-detalhado-2026-01-01-2026-10-07.pdf');
  assert.deepEqual(CLASSES_ESTADO_EVENTO, { Agendado: 'scheduled', 'Concluído': 'completed', Cancelado: 'cancelled' });
});
