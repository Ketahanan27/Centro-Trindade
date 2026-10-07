import { membrosFotosService } from './membros-fotos.service.js';

export async function getMembroFoto(req, res) {
  try {
    const foto = await membrosFotosService.obter(req.params.id, req.user);
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.type(foto.contentType).send(foto.buffer);
  } catch (error) {
    if (error.name === 'MembrosError' && [400, 404].includes(error.status)) return res.status(error.status).json({ message: error.message });
    console.error('[getMembroFoto]', error.code ?? 'erro');
    res.status(503).json({ message: 'Não foi possível carregar a fotografia.' });
  }
}

export async function uploadMembroFoto(req, res) {
  try {
    const foto = await membrosFotosService.carregar(req.file, req.user.id);
    res.json({ message: 'Foto de perfil atualizada com sucesso.', foto });
  } catch (error) {
    if (error.status === 400 || (error.name === 'MembrosError' && error.status === 404)) return res.status(error.status).json({ message: error.message });
    console.error('[uploadMembroFoto]', error.code ?? 'erro');
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
