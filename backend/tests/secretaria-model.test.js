import assert from 'node:assert/strict';
import { test } from 'node:test';
import { consultaContagens, formularioDaAgenda } from '../../src/features/secretaria/models/visitasAtividade.model.js';
import { filtrarVisitantes, formularioDoVisitante } from '../../src/features/secretaria/models/visitantes.model.js';
import { dadosParaEmissao, FORM_VAZIO } from '../../src/features/secretaria/models/documentos.model.js';
import { anosDasApresentacoes, filtrarApresentacoes } from '../../src/features/secretaria/models/apresentacoes.model.js';
import { filtrarReunioes } from '../../src/features/secretaria/models/atas.model.js';

test('activity count export keeps filters and does not restrict results to the current page', () => {
  const filtros = { inicio: '2026-01-01', fim: '2026-12-31', pesquisa: 'Culto & oração' };
  const pagina = new URLSearchParams(consultaContagens(filtros, 3));
  assert.equal(pagina.get('pagina'), '3');
  assert.equal(pagina.get('pesquisa'), 'Culto & oração');
  const exportacao = new URLSearchParams(consultaContagens(filtros, 3, true));
  assert.equal(exportacao.get('exportar'), 'true');
  assert.equal(exportacao.has('pagina'), false);
  assert.equal(exportacao.get('inicio'), filtros.inicio);
  assert.equal(exportacao.get('fim'), filtros.fim);
});

test('selecting an agenda activity keeps count data and clearing it enables manual entry', () => {
  const form = { quantidade: '12', observacoes: 'Exemplo' };
  const eventos = [{ id: 7, titulo: 'Culto', data_evento: '2026-10-07T00:00:00Z' }];
  const selecionado = formularioDaAgenda(form, eventos, '7');
  assert.deepEqual(selecionado, { ...form, evento_id: '7', atividade: 'Culto', data_atividade: '2026-10-07' });
  assert.deepEqual(formularioDaAgenda(selecionado, eventos, ''), { ...form, evento_id: '', atividade: '', data_atividade: '' });
  assert.equal(Object.hasOwn(form, 'evento_id'), false);
});

test('visitor follow-up combines name and status without changing source records', () => {
  const visitantes = [{ nome: 'Alice', estado: 'Visitante' }, { nome: 'ALICE', estado: 'Em acompanhamento' }];
  assert.deepEqual(filtrarVisitantes(visitantes, 'alice', 'Visitante'), [visitantes[0]]);
  assert.equal(filtrarVisitantes(visitantes, 'alice', 'Todos').length, 2);
  const original = { nome: 'Alice', data_visita: '2026-10-07T00:00:00Z' };
  const form = formularioDoVisitante(original);
  assert.equal(form.data_visita, '2026-10-07');
  assert.equal(form.estado, 'Visitante');
  assert.equal(form.telefone, '');
  assert.equal(original.data_visita, '2026-10-07T00:00:00Z');
});

test('document emission takes a dated snapshot unaffected by subsequent form edits', () => {
  const form = { ...FORM_VAZIO, nome_completo: ' Alice ', bi: ' BI-1 ', igreja_destino: 'Outra igreja' };
  const registo = dadosParaEmissao(form, 'Recomendacao', new Date(2026, 9, 7));
  assert.equal(registo.nome_completo, 'Alice');
  assert.equal(registo.bi, 'BI-1');
  assert.equal(registo.tipo, 'Recomendacao');
  assert.equal(registo.data_emissao, '2026-10-07');
  form.igreja_destino = 'Alterada';
  assert.equal(registo.dados_json.igreja_destino, 'Outra igreja');
});

test('presentation years and search use recorded dates including the year boundary', () => {
  const registos = [
    { data_apresentacao: '2026-01-01', observacoes: 'Culto' },
    { data_apresentacao: '2025-12-31', observacoes: null },
    { data_apresentacao: '2026-10-07', observacoes: 'Outra apresentação' },
  ];
  assert.deepEqual(anosDasApresentacoes(registos), [2026, 2025]);
  assert.deepEqual(filtrarApresentacoes(registos, 'CULTO', '2026'), [registos[0]]);
  assert.deepEqual(filtrarApresentacoes(registos, '', '2025'), [registos[1]]);
  assert.equal(filtrarApresentacoes(registos, '', 'Todos').length, 3);
});

test('meeting search keeps original records and case-insensitive matching', () => {
  const reunioes = [{ titulo: 'Reunião pastoral', resumo: 'Ata original' }, { titulo: 'Secretaria' }];
  assert.deepEqual(filtrarReunioes(reunioes, 'PASTORAL'), [reunioes[0]]);
  assert.equal(reunioes.length, 2);
  assert.equal(reunioes[0].resumo, 'Ata original');
});
