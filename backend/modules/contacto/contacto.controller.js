import { contactoService } from './contacto.service.js';

export async function enviarContacto(req, res) {
  try { res.json(await contactoService.enviar(req.body)); }
  catch (error) {
    if ([400, 502, 503].includes(error.status)) return res.status(error.status).json({ message: error.message });
    console.error('[enviarContacto]', error.code ?? 'erro');
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
