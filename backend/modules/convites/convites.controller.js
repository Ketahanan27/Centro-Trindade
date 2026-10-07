import { convitesService } from './convites.service.js';

export async function criarContaConvite(req, res) {
  try { res.status(201).json(await convitesService.criar(req.body)); }
  catch (error) {
    if ([400, 409].includes(error.status)) return res.status(error.status).json({ message: error.message });
    if (error.code === '23505') return res.status(409).json({ message: 'Email já registado.' });
    console.error('[criarContaConvite]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível criar a conta e o convite.' });
  }
}

export const emitirLinkConta = modo => async (req, res) => {
  try {
    const resultado = await convitesService.emitir(modo, req.body, req.params?.id);
    res.status(resultado.status).json(resultado.body);
  } catch (error) {
    if ([400, 404, 409].includes(error.status)) return res.status(error.status).json({ message: error.message });
    console.error('[emitirLinkConta]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível preparar o link.' });
  }
};
