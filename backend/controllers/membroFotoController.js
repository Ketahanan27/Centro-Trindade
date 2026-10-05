import db from '../config/db.js';
import { readPhoto } from '../config/photoStorage.js';

export async function getMembroFoto(req, res) {
  if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(Number(req.params.id)) || Number(req.params.id) <= 0 || Number(req.params.id) > 2147483647) return res.status(400).json({ message: 'Membro inválido.' });
  try {
    const privileged = ['Administrador', 'Secretaria', 'Pastor'].includes(req.user.perfil);
    const members = await db.query('SELECT foto FROM membros WHERE id = $1 AND ($2::boolean OR utilizador_id = $3)', [req.params.id, privileged, req.user.id]);
    if (!members[0]?.foto) return res.status(404).json({ message: 'Fotografia não encontrada.' });
    const photo = await readPhoto(members[0].foto);
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.type(photo.contentType).send(photo.buffer);
  } catch (error) {
    console.error('[getMembroFoto]', error.code ?? 'erro');
    res.status(503).json({ message: 'Não foi possível carregar a fotografia.' });
  }
}
