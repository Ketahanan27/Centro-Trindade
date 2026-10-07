import { validarId, validarMembro } from '../../utils/inputValidation.js';
import { removePhoto } from '../../config/photoStorage.js';
import { membrosRepository } from './membros.repository.js';
import { comFotoProtegida, erroMembros, parametrosMembro, PERFIL_AUSENTE } from './membros.model.js';

export function criarMembrosService(repositorio = membrosRepository, removerFoto = removePhoto) {
  async function validarAssociacao(dados, utilizador, membroId = null) {
    if (!Object.hasOwn(dados, 'utilizador_id')) return;
    if (utilizador.perfil !== 'Administrador') {
      throw erroMembros(403, 'Só o administrador pode associar contas a membros.');
    }
    const id = dados.utilizador_id;
    if (id === null) return;
    if (membroId !== null) {
      const atual = await repositorio.associacaoAtual([membroId]);
      if (atual[0]?.utilizador_id === id) return;
    }
    if (!(await repositorio.contaAtiva([id])).length) {
      throw erroMembros(400, 'Selecione uma conta ativa.');
    }
    if ((await repositorio.membroAssociado([id, membroId])).length) {
      throw erroMembros(409, 'Esta conta já está associada a outro membro.');
    }
  }

  return {
    async criar(payload, utilizador) {
      const dados = validarMembro(payload);
      await validarAssociacao(dados, utilizador);
      await repositorio.criar(parametrosMembro(dados));
    },
    async listar() {
      return (await repositorio.listar()).map(comFotoProtegida);
    },
    async atualizar(id, payload, utilizador) {
      validarId(id);
      const dados = validarMembro(payload);
      await validarAssociacao(dados, utilizador, id);
      const resultado = await repositorio.atualizar([
        ...parametrosMembro(dados), id, Object.hasOwn(dados, 'utilizador_id'),
      ]);
      if (resultado.rowCount === 0) throw erroMembros(404, 'Membro não encontrado.');
    },
    async atualizarPerfil(payload, utilizadorId) {
      const dados = validarMembro(payload, true);
      const resultado = await repositorio.atualizarPerfil([
        dados.telemovel, dados.sexo, dados.estado_civil, dados.morada,
        dados.codigo_postal, utilizadorId,
      ]);
      if ((resultado?.rowCount ?? 0) === 0) throw erroMembros(404, 'Perfil de membro não encontrado.');
    },
    async eliminar(id) {
      validarId(id);
      const resultado = await repositorio.eliminar([id]);
      if (resultado.rowCount === 0) throw erroMembros(404, 'Membro não encontrado.');
      if (resultado.rows[0]?.foto) {
        await removerFoto(resultado.rows[0].foto).catch(error => console.error('[photoCleanup]', error.code ?? 'erro'));
      }
    },
    async obterPerfil(utilizadorId) {
      const resultado = await repositorio.obterPerfil([utilizadorId]);
      if (!resultado.length) throw erroMembros(404, PERFIL_AUSENTE);
      return comFotoProtegida(resultado[0]);
    },
  };
}

export const membrosService = criarMembrosService();
