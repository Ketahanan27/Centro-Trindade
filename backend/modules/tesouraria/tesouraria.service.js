import { tesourariaRepository } from './tesouraria.repository.js';
import { validarOperacao, calcularResumo } from './tesouraria.model.js';

export function criarTesourariaService(repositorio = tesourariaRepository) {
  return {
    listarMovimentos: () => repositorio.listarMovimentos(),
    listarHistorico: () => repositorio.listarHistorico(),
    async obterResumo() {
      return calcularResumo(await repositorio.obterResumo());
    },

    async escrever(acao, id, payload, autorId) {
      const dados = validarOperacao(acao, id, payload);
      return repositorio.comTransacao(async transacao => {
        const autor = await transacao.obterAutor(autorId);
        if (!autor) throw new Error('Autor inexistente');
        const antes = acao === 'Criado' ? null : await transacao.bloquearMovimento(id);
        if (acao !== 'Criado' && !antes) {
          throw Object.assign(new Error('Movimento não encontrado.'), { status: 404 });
        }
        const movimento = await transacao.escrever(acao, id, dados, autorId);
        const depois = acao === 'Eliminado' ? null : movimento;
        await transacao.registarHistorico({
          id: movimento.id, acao, autorId, autorNome: autor.nome,
          motivo: acao === 'Criado' ? null : dados.motivo.trim(), antes, depois,
        });
        return movimento.id;
      });
    },
  };
}

export const tesourariaService = criarTesourariaService();
