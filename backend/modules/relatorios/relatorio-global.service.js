import { InputError } from '../../utils/inputValidation.js';
import { validarRelatorioGlobal, SECOES_GLOBAIS, LIMITE_GLOBAL } from './relatorio-global.model.js';
import { relatorioGlobalRepository } from './relatorio-global.repository.js';
export function criarRelatorioGlobalService(repositorio = relatorioGlobalRepository, agora = () => new Date()) {
  return {
    async obter(utilizador, query) {
      const {
        inicio,
        fim,
        modo,
        administrativo,
        financeiro
      } = validarRelatorioGlobal(utilizador, query);
      const sections = await repositorio.comLeituraConsistente(async leitura => {
        const periodo = [inicio, fim];
        const sections = {};
        let totalDetalhes = 0;
        async function adicionar(chave) {
          const {
            titulo,
            colunas
          } = SECOES_GLOBAIS[chave];
          const resumo = (await leitura.resumirSecao(chave, periodo))[0];
          const registos = modo === 'detalhado' ? await leitura.listarSecao(chave, periodo) : [];
          totalDetalhes += registos.length;
          if (totalDetalhes > LIMITE_GLOBAL) {
            throw new InputError('O relatório detalhado excede 5000 registos. Reduza o período ou exporte a versão resumida.');
          }
          sections[chave] = {
            titulo,
            resumo,
            colunas,
            registos
          };
        }
        if (administrativo) {
          const estadosMembros = await leitura.estadosMembros();
          const batizados = (await leitura.batizados())[0].total;
          const estadosVisitantes = await leitura.estadosVisitantes();
          for (const chave of ['membros', 'participacoes', 'acompanhamento', 'agenda', 'apresentacoes', 'documentos', 'atas']) {
            await adicionar(chave);
          }
          sections.membros.estadoAtual = estadosMembros;
          sections.membros.batizadosAtuais = batizados;
          sections.acompanhamento.estadoAtual = estadosVisitantes;
        }
        if (financeiro) {
          await adicionar('tesouraria');
          sections.tesouraria.mensal = await leitura.financeiroMensal(periodo);
        }
        return sections;
      });
      return {
        inicio,
        fim,
        modo,
        emitidoEm: agora().toISOString(),
        abrangencia: administrativo && financeiro ? 'Global' : administrativo ? 'Administrativa' : 'Financeira',
        sections
      };
    }
  };
}
export const relatorioGlobalService = criarRelatorioGlobalService();
