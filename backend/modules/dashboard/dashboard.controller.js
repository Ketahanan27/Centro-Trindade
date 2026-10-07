import { dashboardService } from './dashboard.service.js';
export async function getDashboardStats(req, res) {
  try {
    const resultado = await dashboardService.obter(req.user);
    res.set('Cache-Control', 'private, no-store');
    res.json(resultado);
  } catch (error) {
    console.error('[dashboard]', error.code ?? 'erro');
    res.status(500).json({
      message: 'Não foi possível carregar os indicadores da igreja.'
    });
  }
}
