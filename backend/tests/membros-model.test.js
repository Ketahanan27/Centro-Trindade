import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dadosParaGuardar, formularioDoMembro } from '../../src/features/membros/membros.model.js';

test('member form keeps account association and normalizes dates without changing the source', () => {
  const membro = { nome:'Exemplo', utilizador_id:7, entrada:'2026-10-01T00:00:00Z', nascimento:null };
  const formulario = formularioDoMembro(membro);
  assert.equal(formulario.utilizador_id,7);
  assert.equal(formulario.entrada,'2026-10-01');
  assert.equal(formulario.nascimento,'');
  assert.equal(membro.entrada,'2026-10-01T00:00:00Z');
});

test('saving a member omits account changes for staff and when account loading failed', () => {
  const formulario = { nome:'Exemplo', utilizador_id:'7' };
  for (const [perfil,erro] of [['Secretaria',false],['Administrador',true]]) {
    assert.equal(Object.hasOwn(dadosParaGuardar(formulario,perfil,erro),'utilizador_id'),false);
  }
  assert.equal(formulario.utilizador_id,'7');
});

test('administrator association and explicit unlinking retain their original semantics', () => {
  assert.equal(dadosParaGuardar({utilizador_id:'7'},'Administrador',false).utilizador_id,7);
  assert.equal(dadosParaGuardar({utilizador_id:''},'Administrador',false).utilizador_id,null);
});
