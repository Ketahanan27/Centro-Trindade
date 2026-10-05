import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parse } from 'espree';
import { pool } from '../config/db.js';
import * as auth from '../controllers/authController.js';
import * as membros from '../controllers/membroController.js';
import * as agenda from '../controllers/agendaController.js';
import * as visitantes from '../controllers/visitantesController.js';
import * as apresentacoes from '../controllers/apresentacoesController.js';
import * as documentos from '../controllers/documentosController.js';
import * as atas from '../controllers/atasController.js';
import * as tesouraria from '../controllers/tesourariaController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { getRelatorios } from '../controllers/relatoriosController.js';
import { uploadDir } from '../config/photoStorage.js';
import path from 'node:path';

function collectSql(node, output) {
  if (!node || typeof node !== 'object') return;
  const text = node.type === 'Literal' && typeof node.value === 'string' ? node.value
    : node.type === 'TemplateLiteral' && node.expressions.length === 0 ? node.quasis[0].value.cooked : '';
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE)\b/i.test(text)) output.push(text);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => collectSql(child, output));
    else if (value && typeof value === 'object') collectSql(value, output);
  }
}

const request = { body: {}, params: {}, query: {}, user: { id: 0, perfil: 'Administrador' } };
function invoke(handler, overrides = {}) {
  return new Promise((resolve, reject) => {
    let status = 200;
    const timer = setTimeout(() => reject(new Error(`${handler.name}: timeout`)), 20000);
    const res = {
      status(code) { status = code; return this; },
      json(body) {
        clearTimeout(timer);
        if (status >= 400) reject(new Error(`${handler.name}: HTTP ${status}`));
        else resolve(body);
        return this;
      },
    };
    Promise.resolve(handler({ ...request, ...overrides }, res)).catch((error) => { clearTimeout(timer); reject(error); });
  });
}

const client = await pool.connect();
const originalQuery = pool.query.bind(pool);
let lastId;
let queue = Promise.resolve();
// Every controller uses this one transaction; no test records are committed.
pool.query = (sql, params) => {
  const pending = queue.then(async () => {
    const result = await client.query(sql, params);
    if (result.command === 'INSERT') lastId = result.rows[0]?.id;
    return result;
  });
  queue = pending.catch(() => {});
  return pending;
};
try {
  await client.query('BEGIN');
  await client.query("SET LOCAL TIME ZONE 'UTC'");
  let validated = 0;
  for (const file of fs.readdirSync('backend/controllers').filter((name) => name.endsWith('.js'))) {
    const sql = [];
    collectSql(parse(fs.readFileSync(`backend/controllers/${file}`, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' }), sql);
    for (const statement of sql) {
      const count = Math.max(0, ...[...statement.matchAll(/\$(\d+)/g)].map((match) => Number(match[1])));
      await client.query('EXPLAIN ' + statement, Array(count).fill(null));
      validated++;
    }
  }
  console.log(`${validated} consultas validadas pelo PostgreSQL.`);
  for (const handler of [auth.getUsers, membros.getMembers, agenda.getEvents, visitantes.getVisitantes,
    apresentacoes.getApresentacoes, documentos.getDocumentos, atas.getAtas, tesouraria.getMovimentos,
    tesouraria.getResumo, getDashboardStats, getRelatorios]) await invoke(handler);

  const email = `migration-${Date.now()}@example.invalid`;
  await invoke(auth.register, { body: { nome: 'Teste migração', email, password: 'MigrationTest123!' } });
  const userId = lastId;
  request.user.id = userId;
  const login = await invoke(auth.login, { body: { email, password: 'MigrationTest123!' } });
  assert.ok(login.token);
  assert.equal(login.user.id, userId);
  await pool.query('INSERT INTO password_resets (utilizador_id, token, expiry) VALUES ($1, $2, $3)',
    [userId, 'migration-test-token', new Date(Date.now() + 60000)]);
  await invoke(auth.redefinirPassword, { body: { token: 'migration-test-token', nova_password: 'MigrationChanged123!' } });
  await invoke(auth.login, { body: { email, password: 'MigrationChanged123!' } });

  const date = '2099-01-20';
  const scenarios = [
    [membros.createMember, membros.updateMember, membros.deleteMember, { nome: 'Teste', email, telemovel: '910000000', nascimento: '2000-01-01', sexo: 'Masculino', estado_civil: 'Solteiro(a)', morada: 'Teste', codigo_postal: '1000-001', entrada: date, batizado: 'Não', estado: 'Ativo', utilizador_id: userId }],
    [agenda.createEvent, agenda.updateEvent, agenda.deleteEvent, { titulo: 'Teste', descricao: '', data_evento: date, hora_evento: '12:00', local_evento: 'Teste', estado: 'Agendado' }],
    [visitantes.createVisitante, visitantes.updateVisitante, visitantes.deleteVisitante, { nome: 'Teste', telefone: '910000000', email, data_visita: date, convidado_por: 'Teste', observacoes: '', estado: 'Visitante' }],
    [apresentacoes.createApresentacao, apresentacoes.updateApresentacao, apresentacoes.deleteApresentacao, { data_apresentacao: date, quantidade: 1, observacoes: '' }],
    [atas.createAta, atas.updateAta, atas.deleteAta, { titulo: 'Teste', data: date, hora: '12:00', local: 'Teste' }],
    [tesouraria.createMovimento, tesouraria.updateMovimento, tesouraria.deleteMovimento, { natureza: 'Receita', tipo: 'Oferta', valor: '12.34', data: date }],
    [documentos.createDocumento, null, documentos.deleteDocumento, { tipo: 'Membro', nome_completo: 'Teste', bi: 'TEST', data_emissao: date, dados_json: { teste: true } }],
  ];
  for (const [create, update, remove, body] of scenarios) {
    await invoke(create, { body });
    const id = lastId;
    assert.ok(id);
    if (create === membros.createMember) {
      const profile = await invoke(membros.getMembroMe);
      assert.equal(profile.id, id);
      await invoke(membros.updateMembroMe, { body });
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        const upload = await invoke(membros.uploadMembroFoto, { file: { buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64') } });
        fs.unlinkSync(path.join(uploadDir, path.basename(upload.foto)));
      }
    }
    if (create === documentos.createDocumento) {
      const docs = await invoke(documentos.getDocumentos);
      assert.deepEqual(docs.find((doc) => doc.id === id).dados_json, { teste: true });
    }
    if (update) await invoke(update, { body, params: { id } });
    await invoke(remove, { params: { id } });
  }
  for (const perfil of ['Membro', 'Secretaria', 'Tesouraria', 'Pastor']) {
    const user = { id: userId, perfil };
    const dashboard = await invoke(getDashboardStats, { user });
    const reports = await invoke(getRelatorios, { user });
    if (['Membro', 'Secretaria'].includes(perfil)) {
      assert.equal(dashboard.stats.receitas, null);
      assert.equal(reports.geral.receitas_ano, null);
    }
  }
  console.log('Login, leitura, CRUD, perfil, JSON e permissões verificados.');
} catch (error) {
  console.error('Verificação falhou:', error.code ?? '', error.message);
  process.exitCode = 1;
} finally {
  await queue;
  await client.query('ROLLBACK');
  pool.query = originalQuery;
  client.release();
  await pool.end();
  console.log('Transação revertida: nenhum registo de teste guardado.');
}
