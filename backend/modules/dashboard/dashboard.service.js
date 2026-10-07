import { dashboardRepository } from './dashboard.repository.js';
import { periodoDashboard } from './dashboard.model.js';
const FINANCAS = ['Administrador', 'Tesouraria', 'Pastor'];
const MEMBROS = ['Administrador', 'Secretaria', 'Pastor'];
export function criarDashboardService(repositorio = dashboardRepository, obterPeriodo = periodoDashboard) {
  return {
    async obter(utilizador) {
      const podeVerFinancas = FINANCAS.includes(utilizador?.perfil);
      const podeVerMembros = MEMBROS.includes(utilizador?.perfil);
      const admin = utilizador?.perfil === 'Administrador';
      const periodo = obterPeriodo();
      const mes = [periodo.inicioMes, periodo.fimMes];
      const ano = [periodo.inicioAno, periodo.fimAno];
      const [membros, novos, visitantes, eventos, visitantesAtividade, estados, financeiro, graficoAnual, semConta, convites] = await Promise.all([
        repositorio.membrosAtivos(),
        podeVerMembros ? repositorio.novosMembros(mes) : [],
        podeVerMembros ? repositorio.visitantes() : [],
        repositorio.proximosEventos([periodo.hoje, podeVerMembros]),
        podeVerMembros ? repositorio.visitantesAtividade(ano) : [],
        podeVerMembros ? repositorio.visitantesPorEstado() : [],
        podeVerFinancas ? repositorio.financeiroMensal(mes) : [],
        podeVerFinancas ? repositorio.financeiroAnual(ano) : [],
        podeVerMembros ? repositorio.membrosSemConta() : [],
        admin ? repositorio.convitesPendentes() : []
      ]);
      const receita = Number(financeiro[0]?.receitas ?? 0),
        despesa = Number(financeiro[0]?.despesas ?? 0);
      return {
        periodo,
        podeVerFinancas,
        podeVerMembros,
        stats: {
          membros: Number(membros[0]?.total ?? 0),
          novosMembros: podeVerMembros ? Number(novos[0]?.total ?? 0) : null,
          visitantes: podeVerMembros ? Number(visitantes[0]?.total ?? 0) : null,
          eventos: Number(eventos[0]?.total ?? 0),
          receitas: podeVerFinancas ? receita.toFixed(2) : null,
          despesas: podeVerFinancas ? despesa.toFixed(2) : null,
          saldo: podeVerFinancas ? (receita - despesa).toFixed(2) : null
        },
        proximosEventos: eventos.map(({
          id,
          titulo,
          data,
          hora_evento,
          local_evento,
          publico,
          estado
        }) => ({
          id,
          titulo,
          data,
          hora_evento,
          local_evento,
          publico,
          estado
        })),
        visitantesAtividade: visitantesAtividade,
        visitantesPorEstado: estados.map(row => ({
          estado: row.estado,
          total: Number(row.total)
        })),
        graficoAnual: graficoAnual.map(row => ({
          mes: Number(row.mes),
          receitas: Number(row.receitas),
          despesas: Number(row.despesas)
        })),
        pendencias: {
          membrosSemConta: podeVerMembros ? Number(semConta[0]?.total ?? 0) : null,
          contasPorAtivar: admin ? Number(convites[0]?.total ?? 0) : null
        }
      };
    }
  };
}
export const dashboardService = criarDashboardService();
