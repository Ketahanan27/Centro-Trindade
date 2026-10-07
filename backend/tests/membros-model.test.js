import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dadosParaGuardar, formularioDoMembro } from '../../src/features/membros/membros.model.js';

test("O formulário de membro preserva a associação à conta e normaliza datas sem alterar os dados originais", () => {
  const membro = { nome:'Exemplo', utilizador_id:7, entrada:'2026-10-01T00:00:00Z', nascimento:null };
  const formulario = formularioDoMembro(membro);
  assert.equal(formulario.utilizador_id,7);
  assert.equal(formulario.entrada,'2026-10-01');
  assert.equal(formulario.nascimento,'');
  assert.equal(membro.entrada,'2026-10-01T00:00:00Z');
});

test("A gravação do membro omite alterações à conta para a equipa e quando o carregamento de contas falha", () => {
  const formulario = { nome:'Exemplo', utilizador_id:'7' };
  for (const [perfil,erro] of [['Secretaria',false],['Administrador',true]]) {
    assert.equal(Object.hasOwn(dadosParaGuardar(formulario,perfil,erro),'utilizador_id'),false);
  }
  assert.equal(formulario.utilizador_id,'7');
});

test("A associação pelo administrador e a desassociação explícita mantêm o comportamento original", () => {
  assert.equal(dadosParaGuardar({utilizador_id:'7'},'Administrador',false).utilizador_id,7);
  assert.equal(dadosParaGuardar({utilizador_id:''},'Administrador',false).utilizador_id,null);
});
