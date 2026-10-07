import { relatoriosService } from './relatorios.service.js';
export async function getRelatorios(req, res) {
  try {
    res.json(await relatoriosService.obter(req.user, req.query));
  } catch (error) {
    if ([400, 403].includes(error.status)) return res.status(error.status).json({
      message: error.message
    });
    console.error('[getRelatorios]', error.code ?? 'erro');
    res.status(500).json({
      message: 'Erro interno do servidor.'
    });
  }
}
