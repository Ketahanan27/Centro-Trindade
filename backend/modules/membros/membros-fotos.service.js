import { savePhoto, removePhoto, readPhoto } from '../../config/photoStorage.js';
import { membrosRepository } from './membros.repository.js';
import { erroMembros, PERFIL_AUSENTE } from './membros.model.js';

export function criarMembrosFotosService(repositorio = membrosRepository, armazenamento = { savePhoto, removePhoto, readPhoto }) {
  return {
    async obter(id, utilizador) {
      if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0 || Number(id) > 2147483647) {
        throw erroMembros(400, 'Membro inválido.');
      }
      const privilegiado = ['Administrador', 'Secretaria', 'Pastor'].includes(utilizador.perfil);
      const membros = await repositorio.fotoAutorizada([id, privilegiado, utilizador.id]);
      if (!membros[0]?.foto) throw erroMembros(404, 'Fotografia não encontrada.');
      return armazenamento.readPhoto(membros[0].foto);
    },
    async carregar(ficheiro, utilizadorId) {
      if (!ficheiro) throw erroMembros(400, 'Selecione uma imagem para carregar.');
      const membros = await repositorio.membrosDaConta([utilizadorId]);
      if (membros.length !== 1) throw erroMembros(404, PERFIL_AUSENTE);

      let guardada;
      let confirmacaoPendente = false;
      try {
        guardada = await armazenamento.savePhoto(ficheiro, utilizadorId);
        confirmacaoPendente = true;
        const resultado = await repositorio.atualizarFoto([guardada.url, membros[0].id, utilizadorId]);
        confirmacaoPendente = false;
        if ((resultado?.rowCount ?? 0) === 0) throw erroMembros(404, PERFIL_AUSENTE);

        const anterior = resultado.rows[0]?.foto_anterior;
        if (anterior && anterior !== guardada.url) {
          await armazenamento.removePhoto(anterior).catch(error => console.error('[photoCleanup]', error.code ?? 'erro'));
        }
        return `/api/membros/${membros[0].id}/foto`;
      } catch (error) {
        // Uma falha na resposta pode ocultar um UPDATE confirmado. Preservar a
        // nova fotografia nesse caso permite reconciliá-la sem perder dados.
        if (guardada && !confirmacaoPendente) await guardada.remove().catch(() => {});
        throw error;
      }
    },
  };
}

export const membrosFotosService = criarMembrosFotosService();
