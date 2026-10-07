import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { criarDocumentoPDF, emitirDocumentoPDF } from '../../src/utils/documentoPdf.js';
import { validarDocumento } from '../../shared/documentos.js';
import { temAcesso } from '../../src/utils/rbac.js';
import { criarAtaPDF, criarTesourariaPDF, criarRelatorioPDF } from '../../src/utils/exportacoesPdf.js';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { pool } = await import('../config/db.js');
const { createDocumento, getDocumentos, deleteDocumento } = await import('../modules/secretaria/documentos.controller.js');
const { getRelatorios } = await import('../modules/relatorios/relatorios.controller.js');
const originalQuery = pool.query;
pool.query = async () => { throw new Error('Unexpected database access'); };
afterEach(() => { pool.query = async () => { throw new Error('Unexpected database access'); }; });
after(async () => { pool.query = originalQuery; await pool.end(); });

function registo(tipo = 'Membro') {
  return {
    tipo, nome_completo: 'Alice Guardada', bi: 'BI-A', data_emissao: '2024-03-15',
    dados_json: { nome_completo: 'Nome antigo no formulario', bi: 'BI-OUTRO', data_nascimento: '1990-06-15',
      data_batismo: '2010-04-10', data_entrada: '2015-09-20', estado: 'Ativo', igreja_destino: 'Igreja Destino', motivo: 'Transferencia' },
  };
}

for (const tipo of ['Batismo', 'Membro', 'Recomendacao']) {
  test(`${tipo}: a reimpressão usa a identificação guardada selecionada e a data de emissão original`, () => {
    const { doc } = criarDocumentoPDF(registo(tipo));
    const pdf = doc.output();
    assert.match(pdf, /Alice Guardada/);
    assert.match(pdf, /BI-A/);
    assert.match(pdf, /Emitido em 15\/03\/2024/);
    assert.doesNotMatch(pdf, /Nome antigo no formulario|BI-OUTRO|Invalid Date/);
  });
}

test("O PDF preserva a cópia dos dados quando outros dados mudam durante a persistência", async () => {
  const selected = registo();
  let saved;
  const result = await emitirDocumentoPDF(selected, async () => {
    selected.nome_completo = 'Nome posterior';
    return true;
  }, (doc) => { saved = doc.output(); });
  assert.equal(result, true);
  assert.match(saved, /Alice Guardada/);
  assert.doesNotMatch(saved, /Nome posterior/);
});

test("Uma falha no registo na base nunca descarrega um PDF", async () => {
  let downloaded = false;
  assert.equal(await emitirDocumentoPDF(registo(), async () => false, () => { downloaded = true; }), false);
  assert.equal(downloaded, false);
});

test("Uma falha de rede nunca descarrega um PDF", async () => {
  let downloaded = false;
  await assert.rejects(emitirDocumentoPDF(registo(), async () => { throw new Error('Offline'); }, () => { downloaded = true; }), /Offline/);
  assert.equal(downloaded, false);
});

test("Datas inválidas e campos obrigatórios ausentes são recusados antes da persistência", async () => {
  const invalid = registo('Batismo');
  invalid.dados_json.data_nascimento = '2025-02-29';
  await assert.rejects(emitirDocumentoPDF(invalid, () => assert.fail('Invalid document persisted')), /datas válidas/);
  invalid.dados_json.data_nascimento = '2024-02-29';
  invalid.dados_json.data_batismo = '2024-03-01';
  assert.equal(validarDocumento(invalid), null);
  invalid.dados_json.data_batismo = '2024-02-28';
  assert.match(validarDocumento(invalid), /anterior/);
  invalid.nome_completo = '';
  assert.match(validarDocumento(invalid), /Nome/);
});

test("Um texto de recomendação longo é paginado e mantém a data de emissão em todas as páginas", () => {
  const selected = registo('Recomendacao');
  selected.dados_json.motivo = 'Texto longo para uma recomendacao. '.repeat(50);
  const { doc } = criarDocumentoPDF(selected);
  assert.ok(doc.getNumberOfPages() > 1);
  assert.equal((doc.output().match(/Emitido em 15\/03\/2024/g) ?? []).length, doc.getNumberOfPages());
});

function invoke(handler, req) {
  return new Promise((resolve, reject) => {
    let code = 200;
    const res = { status(value) { code = value; return this; }, json(body) { resolve({ code, body }); return this; } };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

test("A API recusa dados de documento malformados antes de aceder ao PostgreSQL", async () => {
  for (const body of [null, undefined, [], 'texto']) {
    assert.equal((await invoke(createDocumento, { body })).code, 400);
  }
});

test("A listagem interpreta JSON antigo e preserva a identificação e a data de emissão guardadas", async () => {
  const saved = registo();
  pool.query = async sql => {
    assert.match(sql, /ORDER BY id DESC/);
    return { command: 'SELECT', rows: [
      { ...saved, id: 1, dados_json: JSON.stringify(saved.dados_json) },
      { ...saved, id: 2 },
      { ...saved, id: 3, dados_json: '{invalid' },
      { ...saved, id: 4, dados_json: null },
    ] };
  };
  const result = await invoke(getDocumentos, {});
  assert.equal(result.code, 200);
  for (const document of result.body) {
    assert.equal(document.nome_completo, saved.nome_completo);
    assert.equal(document.data_emissao, saved.data_emissao);
  }
  assert.deepEqual(result.body[0].dados_json, saved.dados_json);
  assert.deepEqual(result.body[1].dados_json, saved.dados_json);
  assert.deepEqual(result.body[2].dados_json, {});
  assert.deepEqual(result.body[3].dados_json, {});
});

test("A eliminação de documentos valida identificadores e assinala registos ausentes", async () => {
  for (const id of ['0', 'abc', '2147483648']) {
    assert.equal((await invoke(deleteDocumento, { params: { id } })).code, 400);
  }
  pool.query = async (sql, params) => {
    assert.match(sql, /DELETE FROM documentos/);
    assert.deepEqual(params, [9]);
    return { command: 'DELETE', rowCount: 0, rows: [] };
  };
  assert.equal((await invoke(deleteDocumento, { params: { id: '9' } })).code, 404);
});

test("A API recusa documentos incompletos sem escrever no PostgreSQL", async () => {
  const result = await invoke(createDocumento, { body: { tipo: 'Membro', nome_completo: 'Name', bi: 'BI' } });
  assert.equal(result.code, 400);
});

test("A API guarda a cópia completa dos dados com a data de emissão original", async () => {
  const selected = registo();
  pool.query = async (sql, params) => {
    assert.match(sql, /^INSERT INTO documentos/);
    assert.equal(params[3], '2024-03-15');
    assert.deepEqual(JSON.parse(params[4]), selected.dados_json);
    return { command: 'INSERT', rowCount: 1, rows: [{ id: 9 }] };
  };
  const result = await invoke(createDocumento, { body: selected });
  assert.equal(result.code, 201);
  assert.equal(result.body.id, 9);
});

function reportFixture(sql, params) {
  if (/AS membros_ativos/.test(sql)) {
    const converted = sql.includes("estado = 'Tornou-se membro'") ? 2 : 0;
    return { command: 'SELECT', rows: [{ membros_ativos: 8, membros_total: 10, visitantes_total: 5, convertidos: converted, receitas_ano: '125.50', despesas_ano: '25.00' }] };
  }
  if (/FROM tesouraria/.test(sql)) {
    assert.deepEqual(params, [2024]);
    return { command: 'SELECT', rows: [{ mes: '3', receitas: '125.50', despesas: '25.00' }] };
  }
  return { command: 'SELECT', rows: [] };
}

test("Os relatórios contam visitantes que se tornaram membros e respeitam o ano financeiro pedido", async () => {
  pool.query = async (sql, params) => reportFixture(sql, params);
  const { code, body } = await invoke(getRelatorios, { query: { ano: '2024' }, user: { perfil: 'Administrador' } });
  assert.equal(code, 200);
  assert.equal(body.geral.convertidos, 2);
  assert.equal(body.podeVerFinancas, true);
  assert.equal(body.financeiroMensal[0].receitas, '125.50');
  assert.equal(body.referencia.anuais, 2024);
});

test("Os relatórios da Secretaria não expõem totais financeiros nem movimentos mensais", async () => {
  pool.query = async (sql, params) => reportFixture(sql, params);
  const { body } = await invoke(getRelatorios, { query: { ano: '2024' }, user: { perfil: 'Secretaria' } });
  assert.equal(body.podeVerFinancas, false);
  assert.deepEqual(body.financeiroMensal, []);
  assert.equal(body.geral.receitas_ano, null);
  assert.equal(body.geral.despesas_ano, null);
});

test("Um ano de relatório inválido não consulta a base de dados", async () => {
  for (const ano of ['abc', '0', '2024.5', '10000']) {
    assert.equal((await invoke(getRelatorios, { query: { ano }, user: { perfil: 'Administrador' } })).code, 400);
  }
});

test("Os relatórios só estão disponíveis no menu lateral para a equipa autorizada", () => {
  for (const perfil of ['Administrador', 'Secretaria', 'Tesouraria', 'Pastor', 'Membro']) {
    assert.equal(temAcesso(perfil, 'relatorios'), perfil !== 'Membro');
  }
  for (const perfil of ['Administrador', 'Secretaria', 'Pastor']) assert.equal(temAcesso(perfil, 'secretaria'), true);
  assert.equal(temAcesso('Membro', 'secretaria'), false);
});

function verificarIdentidade(doc) {
  const pdf = doc.output();
  assert.match(pdf, /CENTRO TRINDADE/);
  assert.match(pdf, /\/Subtype \/Image/);
  assert.match(pdf, /Secretaria/);
  assert.match(pdf, /Pastor/);
  assert.match(pdf, /1 de/);
}

test("Todos os modelos de declarações incluem o logótipo da igreja e espaços para assinaturas", () => {
  for (const tipo of ['Batismo', 'Membro', 'Recomendacao']) verificarIdentidade(criarDocumentoPDF(registo(tipo)).doc);
});

test("As atas preservam conteúdo longo e incluem a identificação da igreja e assinaturas", () => {
  const doc = criarAtaPDF({ id: 12, titulo: 'Reuniao exemplo', data: '2026-10-05', resumo: 'Texto para testar a continuidade da ata. '.repeat(120), decisoes: 'DECISAO_FINAL' });
  verificarIdentidade(doc);
  assert.ok(doc.getNumberOfPages() > 1);
  assert.match(doc.output(), /DECISAO_FINAL/);
});

test("A Tesouraria divide uma célula muito longa sem perder o final do texto ou os totais", () => {
  const doc = criarTesourariaPDF([{ data: '2026-10-05', tipo: 'Oferta', natureza: 'Receita', valor: '205.50', observacao: 'Descricao longa dentro da tabela. '.repeat(150) + 'FIM_OBSERVACAO' }]);
  verificarIdentidade(doc);
  assert.ok(doc.getNumberOfPages() > 1);
  assert.match(doc.output(), /FIM_OBSERVACAO/);
  assert.match(doc.output(), /205,50/);
});

test("O PDF anual inclui apresentações mensais e exclui finanças para a Secretaria", () => {
  const dados = { ano: 2026, geral: {}, membrosEstado: [], visitantesEstado: [], eventosMes: [], apresentacoesMes: [], financeiroMensal: [], podeVerFinancas: false };
  const doc = criarRelatorioPDF(dados);
  verificarIdentidade(doc);
  assert.doesNotMatch(doc.output(), /Resumo financeiro/);
  assert.match(doc.output(), /Crian/);
});
