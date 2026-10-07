import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filtrarUtilizadores } from '../../src/features/utilizadores/utilizadores.model.js';
import { CAMPOS_PERFIL, dadosParaGuardar, formularioDoPerfil, normalizarCampo } from '../../src/features/minha-area/minha-area.model.js';

test("A pesquisa de utilizadores compara nome, email e perfil sem alterar as contas", () => {
  const contas = [{ id: 1, nome: 'Alice', email: 'alice@exemplo.pt', perfil: 'Secretaria' }, { id: 2, nome: 'Bob', email: 'bob@exemplo.pt', perfil: 'Membro' }];
  for (const pesquisa of ['ALICE', 'alice@', 'secretaria']) assert.deepEqual(filtrarUtilizadores(contas, pesquisa), [contas[0]]);
  assert.deepEqual(filtrarUtilizadores(contas, 'pastor'), []);
  assert.equal(contas.length, 2);
});

test("A atualização pessoal exclui campos de identificação, dados oficiais de membro e associação à conta", () => {
  const dados = dadosParaGuardar({ nome: 'Alterado', email: 'alterado@exemplo.pt', nascimento: '2000-01-01', entrada: '2026-10-07', estado: 'Inativo', batizado: 'Sim', utilizador_id: 999, telemovel: ' 900000000 ', codigo_postal: ' 1000-001 ', morada: 'Lisboa', sexo: 'Masculino', estado_civil: 'Casado(a)' });
  assert.deepEqual(dados, { telemovel: '900000000', sexo: 'Masculino', estado_civil: 'Casado(a)', morada: 'Lisboa', codigo_postal: '1000-001' });
});

test("Os campos opcionais vazios do perfil mantêm os valores nulos usados pela API", () => {
  assert.deepEqual(dadosParaGuardar({}), { telemovel: null, sexo: null, estado_civil: null, morada: null, codigo_postal: null });
});

test("A normalização de telemóvel e código postal aceita introdução parcial e limita o comprimento", () => {
  assert.equal(normalizarCampo('telemovel', '900 123 456 78'), '900123456');
  assert.equal(normalizarCampo('codigo_postal', '123'), '123');
  assert.equal(normalizarCampo('codigo_postal', '1234-56789'), '1234-567');
  assert.equal(normalizarCampo('morada', 'Rua A, 2'), 'Rua A, 2');
});

test("O formulário normaliza datas de membro sem modificar os dados originais", () => {
  const membro = { entrada: '2026-10-07T00:00:00Z', batizado: 'Sim', estado: 'Ativo' };
  const form = formularioDoPerfil(membro);
  assert.equal(form.entrada, '2026-10-07');
  assert.equal(form.batizado, 'Sim');
  assert.equal(form.telemovel, '');
  assert.equal(membro.entrada, '2026-10-07T00:00:00Z');
});

test("Os campos editáveis visíveis excluem a identificação protegida e os dados oficiais de membro", () => {
  assert.deepEqual(CAMPOS_PERFIL.filter(campo => campo.editavel).map(campo => campo.nome), ['telemovel', 'morada', 'codigo_postal', 'estado_civil']);
  for (const nome of ['email', 'nascimento', 'entrada', 'batizado', 'estado']) assert.equal(CAMPOS_PERFIL.find(campo => campo.nome === nome).editavel, undefined);
});
