import { relatorioGlobalService } from './relatorio-global.service.js';
export async function getRelatorioGlobal(req, res) {
  try {
    const resultado = await relatorioGlobalService.obter(req.user, req.query);
    res.setHeader('Cache-Control', 'no-store');
    res.json(resultado);
  } catch (error) {
    if ([400, 403].includes(error.status)) return res.status(error.status).json({
      message: error.message
    });
    console.error('[relatorioGlobal]', error.code ?? 'erro');
    res.status(500).json({
      message: 'Não foi possível gerar o relatório.'
    });
  }
}
