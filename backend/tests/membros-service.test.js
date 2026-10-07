import test, { after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.BLOB_READ_WRITE_TOKEN = '';
const { pool } = await import('../config/db.js');
pool.query = async () => { throw new Error('Acesso à base proibido neste teste.'); };
pool.connect = pool.query;
after(() => pool.end());
const { criarMembrosService } = await import('../modules/membros/membros.service.js');
const { criarMembrosFotosService } = await import('../modules/membros/membros-fotos.service.js');

test("A Secretaria não pode associar ou desassociar explicitamente uma conta de membro", async () => {
  const service = criarMembrosService({});
  for (const utilizador_id of [7, null]) {
    await assert.rejects(service.criar({ nome: 'Membro', utilizador_id }, { perfil: 'Secretaria' }), { status: 403 });
  }
});

test("A edição sem o campo da conta preserva a associação existente", async () => {
  let parameters;
  const service = criarMembrosService({ atualizar: async params => { parameters = params; return { rowCount: 1 }; } });
  await service.atualizar('4', { nome: 'Membro' }, { perfil: 'Secretaria' });
  assert.equal(parameters[12], '4');
  assert.equal(parameters[13], false);
});

test("Uma associação inalterada não exige que a conta continue ativa", async () => {
  const service = criarMembrosService({
    associacaoAtual: async () => [{ utilizador_id: 7 }],
    atualizar: async params => { assert.equal(params[11], 7); return { rowCount: 1 }; },
  });
  await service.atualizar('4', { nome: 'Membro', utilizador_id: '7' }, { perfil: 'Administrador' });
});

test("Uma associação duplicada é recusada antes de criar o membro", async () => {
  const service = criarMembrosService({ contaAtiva: async () => [{ id: 7 }], membroAssociado: async () => [{ id: 4 }] });
  await assert.rejects(service.criar({ nome: 'Membro', utilizador_id: 7 }, { perfil: 'Administrador' }), { status: 409 });
});

test("O carregamento de fotografias exige exatamente um membro associado antes de guardar o ficheiro", async () => {
  for (const membros of [[], [{ id: 1 }, { id: 2 }]]) {
    const service = criarMembrosFotosService({ membrosDaConta: async () => membros }, {});
    await assert.rejects(service.carregar({}, 7), { status: 404 });
  }
});

function uploadFixture(atualizarFoto, removePhoto = async () => {}) {
  let removidas = 0;
  const service = criarMembrosFotosService({ membrosDaConta: async () => [{ id: 4 }], atualizarFoto }, {
    savePhoto: async () => ({ url: 'nova-foto', remove: async () => { removidas++; } }),
    removePhoto,
  });
  return { service, removidas: () => removidas };
}

test("Uma atualização incerta da base preserva a fotografia carregada para reconciliação", async () => {
  const failure = new Error('Resposta perdida');
  const fixture = uploadFixture(async () => { throw failure; });
  await assert.rejects(fixture.service.carregar({}, 7), failure);
  assert.equal(fixture.removidas(), 0);
});

test("A ausência confirmada do membro remove o novo ficheiro exatamente uma vez", async () => {
  const fixture = uploadFixture(async () => ({ rowCount: 0, rows: [] }));
  await assert.rejects(fixture.service.carregar({}, 7), { status: 404 });
  assert.equal(fixture.removidas(), 1);
});

test("Um carregamento bem-sucedido limpa a fotografia anterior e devolve apenas um URL protegido", async () => {
  const previous = [];
  const fixture = uploadFixture(async params => {
    assert.deepEqual(params, ['nova-foto', 4, 7]);
    return { rowCount: 1, rows: [{ foto_anterior: 'foto-antiga' }] };
  }, async foto => { previous.push(foto); });
  assert.equal(await fixture.service.carregar({}, 7), '/api/membros/4/foto');
  assert.deepEqual(previous, ['foto-antiga']);
  assert.equal(fixture.removidas(), 0);
});

test("Uma falha na limpeza da fotografia anterior não desfaz um carregamento bem-sucedido", async () => {
  const fixture = uploadFixture(async () => ({ rowCount: 1, rows: [{ foto_anterior: 'antiga' }] }), async () => { throw new Error('Limpeza indisponível'); });
  assert.equal(await fixture.service.carregar({}, 7), '/api/membros/4/foto');
  assert.equal(fixture.removidas(), 0);
});

test("O acesso da Tesouraria à fotografia limita-se ao membro associado à sua conta", async () => {
  let parameters;
  const service = criarMembrosFotosService({ fotoAutorizada: async params => { parameters = params; return []; } }, {});
  await assert.rejects(service.obter('4', { id: 7, perfil: 'Tesouraria' }), { status: 404 });
  assert.deepEqual(parameters, ['4', false, 7]);
});
