import { photoAccess } from '../config/photoStorage.js';

const DAY = 24 * 60 * 60 * 1000;
const managedPath = /^membros\/\d+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(?:-[a-zA-Z0-9]+)?\.(?:jpg|png|gif|webp)$/;

// New uploads use unique names. Never reuse an old storage URL for a member.
export async function reconcilePhotos({ database, listPage, remove, apply = false, now = Date.now() }) {
  if (!Number.isFinite(now)) throw new Error('Invalid reconciliation time');
  const references = new Set((await database.query('SELECT foto FROM membros WHERE foto IS NOT NULL')).rows.map((row) => row.foto));
  const items = new Map(); const cursors = new Set(); let cursor;
  // Finish the inventory before allowing deletion; listing failures are fail-closed.
  do {
    const page = await listPage({ prefix: 'membros/', limit: 1000, ...(cursor ? { cursor } : {}) });
    for (const blob of page.blobs) items.set(blob.url, blob);
    if (!page.hasMore) break;
    if (!page.cursor || cursors.has(page.cursor)) throw new Error('Invalid storage pagination');
    cursor = page.cursor; cursors.add(cursor);
  } while (cursor);
  const summary = { scanned: items.size, referenced: 0, recent: 0, ignored: 0, candidates: 0, deleted: 0, relinked: 0, failed: 0 };
  const candidates = [];
  for (const blob of items.values()) {
    let privatePhoto = false;
    try { privatePhoto = photoAccess(blob.url) === 'private' && decodeURIComponent(new URL(blob.url).pathname.slice(1)) === blob.pathname; } catch { /* Ignore untrusted entries. */ }
    if (!privatePhoto || !managedPath.test(blob.pathname)) { summary.ignored++; continue; }
    if (references.has(blob.url)) { summary.referenced++; continue; }
    const uploaded = new Date(blob.uploadedAt).getTime();
    if (!Number.isFinite(uploaded)) { summary.ignored++; continue; }
    if (uploaded > now - DAY) { summary.recent++; continue; }
    candidates.push(blob.url); summary.candidates++;
  }
  if (!apply) return summary;
  // A small batch bounds each run; repeat later for any remaining candidates.
  for (const url of candidates.slice(0, 100)) {
    const current = await database.query('SELECT id FROM membros WHERE foto=$1 LIMIT 1', [url]);
    if (current.rows.length) { summary.relinked++; continue; }
    try { await remove(url); summary.deleted++; } catch { summary.failed++; }
  }
  return summary;
}
