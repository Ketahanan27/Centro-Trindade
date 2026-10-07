import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reconcilePhotos } from '../utils/photoReconciliation.js';
const now = Date.UTC(2026, 9, 6);
function photo(id, changes = {}) {
  const pathname = `membros/1/00000000-0000-0000-0000-${String(id).padStart(12, '0')}.webp`;
  return { pathname, url: `https://store.private.blob.vercel-storage.com/${pathname}`, uploadedAt: new Date(now - 48 * 3600000), ...changes };
}
function setup(blobs, references = [], relinked = []) {
  const removed = []; const checked = [];
  return { removed, checked, database: { async query(sql, params) {
    if (!params) return { rows: references.map((foto) => ({ foto })) };
    checked.push(params[0]); assert.match(sql, /WHERE foto=\$1/);
    return { rows: relinked.includes(params[0]) ? [{ id: 1 }] : [] };
  } }, listPage: async () => ({ blobs, hasMore: false }), remove: async (url) => { removed.push(url); }, now };
}
test("A análise preserva objetos referenciados, recentes, desconhecidos e públicos sem eliminar nada", async () => {
  const linked = photo(1); const recent = photo(2, { uploadedAt: new Date(now - 1000) });
  const unknown = photo(3, { pathname: 'membros/notes.txt' }); const publicBlob = photo(4); publicBlob.url = publicBlob.url.replace('.private.', '.public.');
  const state = setup([linked, recent, unknown, publicBlob, photo(5)], [linked.url]);
  const result = await reconcilePhotos(state);
  assert.deepEqual(result, { scanned: 5, referenced: 1, recent: 1, ignored: 2, candidates: 1, deleted: 0, relinked: 0, failed: 0 });
  assert.equal(state.removed.length, 0);
});
test("A aplicação verifica novamente as referências antes de eliminar e continua após uma falha individual no armazenamento", async () => {
  const blobs = [photo(1), photo(2), photo(3)]; const state = setup(blobs, [], [blobs[0].url]);
  state.remove = async (url) => { if (url === blobs[1].url) throw new Error('storage failure'); state.removed.push(url); };
  const result = await reconcilePhotos({ ...state, apply: true });
  assert.equal(result.relinked, 1); assert.equal(result.failed, 1); assert.equal(result.deleted, 1);
  assert.deepEqual(state.removed, [blobs[2].url]); assert.equal(state.checked.length, 3);
});
test("A paginação termina antes de qualquer eliminação e uma falha na listagem interrompe a operação em segurança", async () => {
  const state = setup([]); let calls = 0;
  state.listPage = async ({ cursor }) => { calls++; if (calls === 1) return { blobs: [photo(1)], hasMore: true, cursor: 'next' }; assert.equal(cursor, 'next'); throw new Error('listing failure'); };
  await assert.rejects(reconcilePhotos({ ...state, apply: true }), /listing failure/);
  assert.equal(state.removed.length, 0);
});
test("A paginação elimina duplicados e rejeita um cursor repetido", async () => {
  const state = setup([]); let calls = 0;
  state.listPage = async () => ++calls === 1 ? { blobs: [photo(1)], hasMore: true, cursor: 'next' } : { blobs: [photo(1), photo(2)], hasMore: false };
  assert.equal((await reconcilePhotos(state)).candidates, 2);
  state.listPage = async () => ({ blobs: [], hasMore: true, cursor: 'same' });
  await assert.rejects(reconcilePhotos({ ...state, apply: true }), /pagination/);
});
test("Uma falha na nova verificação da base interrompe a eliminação e cada lote tem no máximo 100 objetos", async () => {
  const state = setup(Array.from({ length: 101 }, (_, i) => photo(i)));
  assert.equal((await reconcilePhotos({ ...state, apply: true })).deleted, 100);
  state.removed.length = 0;
  state.database.query = async (sql, params) => { if (params) throw new Error('database unavailable'); return { rows: [] }; };
  await assert.rejects(reconcilePhotos({ ...state, apply: true }), /database unavailable/);
  assert.equal(state.removed.length, 0);
});
test("Datas inválidas e caminhos de objetos incompatíveis são ignorados", async () => {
  const state = setup([photo(1, { uploadedAt: 'invalid' }), photo(2, { pathname: photo(3).pathname })]);
  const result = await reconcilePhotos({ ...state, apply: true }); assert.equal(result.ignored, 2); assert.equal(result.deleted, 0);
});
