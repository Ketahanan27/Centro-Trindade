import { membrosService } from './membros.service.js';
export { uploadMembroFoto } from './membros-fotos.controller.js';

function responderErro(res, error, operacao) {
  if ([400, 403, 404, 409].includes(error.status)) return res.status(error.status).json({ message: error.message });
  if (['createMember', 'updateMember'].includes(operacao)) {
    if (error.code === '23505') return res.status(409).json({ message: 'Esta conta já está associada a outro membro.' });
    if (error.code === '23503') return res.status(409).json({ message: 'A conta selecionada já não está disponível. Atualize a lista de contas.' });
  }
  if (operacao === 'deleteMember' && error.code === '23503') {
    return res.status(409).json({ message: 'Este membro tem registos associados e não pode ser eliminado.' });
  }
  console.error(`[${operacao}]`, error.code ?? 'erro');
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}

export async function createMember(req, res) {
  try {
    await membrosService.criar(req.body, req.user);
    res.status(201).json({ message: 'Membro criado com sucesso.' });
  } catch (error) { responderErro(res, error, 'createMember'); }
}

export async function getMembers(_req, res) {
  try { res.json(await membrosService.listar()); }
  catch (error) { responderErro(res, error, 'getMembers'); }
}

export async function updateMember(req, res) {
  try {
    await membrosService.atualizar(req.params.id, req.body, req.user);
    res.json({ message: 'Membro atualizado com sucesso.' });
  } catch (error) { responderErro(res, error, 'updateMember'); }
}

export async function updateMembroMe(req, res) {
  try {
    await membrosService.atualizarPerfil(req.body, req.user.id);
    res.json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error) { responderErro(res, error, 'updateMembroMe'); }
}

export async function deleteMember(req, res) {
  try {
    await membrosService.eliminar(req.params.id);
    res.json({ message: 'Membro eliminado com sucesso.' });
  } catch (error) { responderErro(res, error, 'deleteMember'); }
}

export async function getMembroMe(req, res) {
  try { res.json(await membrosService.obterPerfil(req.user.id)); }
  catch (error) { responderErro(res, error, 'getMembroMe'); }
}
