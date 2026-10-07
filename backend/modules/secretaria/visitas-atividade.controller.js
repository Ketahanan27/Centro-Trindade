import { visitasAtividadeService } from './visitas-atividade.service.js';

function responderErro(res, error) {
  if ([400, 404].includes(error.status)) return res.status(error.status).json({ message: error.message });
  if (error.code === '23505') return res.status(409).json({ message: 'Esta atividade já tem uma contagem nesta data. Edite o registo existente.' });
  if (error.code === '23503') return res.status(409).json({ message: 'O evento já não está disponível. Atualize a Agenda.' });
  console.error('[visitasAtividade]', error.code ?? 'erro');
  return res.status(500).json({ message: 'Não foi possível concluir a operação.' });
}

export async function listarContagens(req, res) {
  try {
    const resultado = await visitasAtividadeService.listar(req.query);
    res.set('Cache-Control', 'private, no-store');
    res.json(resultado);
  } catch (error) { responderErro(res, error); }
}

export async function criarContagem(req, res) {
  try {
    const id = await visitasAtividadeService.criar(req.body, req.user.id);
    res.status(201).json({ message: 'Contagem registada.', id });
  } catch (error) { responderErro(res, error); }
}

export async function atualizarContagem(req, res) {
  try {
    const id = await visitasAtividadeService.atualizar(req.params.id, req.body, req.user.id);
    res.json({ message: 'Contagem atualizada.', id });
  } catch (error) { responderErro(res, error); }
}

export async function eliminarContagem(req, res) {
  try {
    await visitasAtividadeService.eliminar(req.params.id);
    res.json({ message: 'Contagem eliminada.' });
  } catch (error) { responderErro(res, error); }
}
