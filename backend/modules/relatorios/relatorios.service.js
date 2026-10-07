import { InputError } from '../../utils/inputValidation.js';
import { relatoriosRepository } from './relatorios.repository.js';
export function criarRelatoriosService(repositorio = relatoriosRepository, anoAtual = () => new Date().getFullYear()) {
  return {
    async obter(utilizador, query) {
      if (!['Administrador', 'Secretaria', 'Pastor'].includes(utilizador?.perfil)) throw Object.assign(new Error('Acesso não permitido.'), {
        status: 403
      });
      const ano = query.ano === undefined ? anoAtual() : Number(query.ano);
      if (!Number.isInteger(ano) || ano < 1900 || ano > 9999) throw new InputError('Ano inválido.');
      const podeVerFinancas = ['Administrador', 'Tesouraria', 'Pastor'].includes(utilizador?.perfil);
      const [membrosEstado, visitantesEstado, financeiroMensal, eventosMes, apresentacoesMes, [geral]] = await Promise.all([
        repositorio.membrosEstado(),
        repositorio.visitantesEstado(),
        podeVerFinancas ? repositorio.financeiroMensal([ano]) : Promise.resolve([]),
        repositorio.eventosMes([ano]),
        repositorio.apresentacoesMes([ano]),
        repositorio.geral(podeVerFinancas ? [ano, ano, ano, ano] : [ano, ano], podeVerFinancas)
      ]);

      // Perfis sem acesso financeiro não consultam nem recebem estes totais.
      const geralFinal = geral ?? {};
      if (!podeVerFinancas) {
        geralFinal.receitas_ano = null;
        geralFinal.despesas_ano = null;
      }
      return {
        ano,
        referencia: {
          globais: "Estado atual, sem filtro por ano",
          anuais: ano
        },
        membrosEstado,
        visitantesEstado,
        financeiroMensal,
        eventosMes,
        apresentacoesMes,
        geral: geralFinal,
        podeVerFinancas
      };
    }
  };
}
export const relatoriosService = criarRelatoriosService();
