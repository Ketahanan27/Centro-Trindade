import { utilizadoresService } from './utilizadores.service.js';
import { criarContaConvite, emitirLinkConta } from '../convites/convites.controller.js';

function responderErro(res, error, operacao) {
  if ([400, 404].includes(error.status)) return res.status(error.status).json({ message: error.message });
  if (operacao === 'deleteUser' && error.code === '23503') {
    return res.status(409).json({ message: 'Esta conta tem registos associados. Desative-a em vez de eliminar.' });
  }
  console.error(`[${operacao}]`, error.code ?? 'erro');
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}

export async function getUsers(_req, res) {
  try { res.json(await utilizadoresService.listar()); }
  catch (error) { responderErro(res, error, 'getUsers'); }
}

export async function updateUser(req, res) {
  try {
    await utilizadoresService.atualizar(req.params.id, req.body, req.user.id);
    res.json({ message: 'Utilizador atualizado com sucesso.' });
  } catch (error) { responderErro(res, error, 'updateUser'); }
}

export async function deleteUser(req, res) {
  try {
    await utilizadoresService.eliminar(req.params.id, req.user.id);
    res.json({ message: 'Utilizador eliminado com sucesso.' });
  } catch (error) { responderErro(res, error, 'deleteUser'); }
}

export const criarUtilizador = criarContaConvite;
export const reenviarConvite = emitirLinkConta('convite');
export const resetUserPassword = emitirLinkConta('reset');
