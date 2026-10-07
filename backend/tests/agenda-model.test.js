import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diasDoMes, eventosNoMes, formularioDoEvento } from '../../src/features/agenda/agenda.model.js';

test('calendar includes leap day and keeps weekday alignment across year boundaries', () => {
  const fevereiro = diasDoMes(2024, 1);
  assert.deepEqual(fevereiro.slice(0, 4), [null, null, null, null]);
  assert.equal(fevereiro.at(-1), '2024-02-29');
  assert.equal(diasDoMes(2025, 1).at(-1), '2025-02-28');
  assert.equal(diasDoMes(2027, 0).filter(Boolean)[0], '2027-01-01');
});

test('monthly events exclude adjacent months and sort without mutating source', () => {
  const eventos = [
    { id: 1, data_evento: '2026-10-31T00:00:00Z' },
    { id: 2, data_evento: '2026-11-01' },
    { id: 3, data_evento: '2026-10-01' },
    { id: 4, data_evento: null },
  ];
  assert.deepEqual(eventosNoMes(eventos, 2026, 9).map(e => e.id), [3, 1]);
  assert.deepEqual(eventos.map(e => e.id), [1, 2, 3, 4]);
});

test('editing keeps event visibility and status while normalizing optional fields', () => {
  for (const publico of [true, false]) {
    const evento = { titulo: 'Culto', data_evento: '2026-10-07T00:00:00Z', estado: 'Cancelado', publico };
    const formulario = formularioDoEvento(evento);
    assert.equal(formulario.data_evento, '2026-10-07');
    assert.equal(formulario.publico, publico);
    assert.equal(formulario.estado, 'Cancelado');
    assert.equal(formulario.descricao, '');
    assert.equal(evento.data_evento, '2026-10-07T00:00:00Z');
  }
});
