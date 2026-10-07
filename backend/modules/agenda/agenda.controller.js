import { agendaService } from './agenda.service.js';

export async function getPublicEvents(_req, res) {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(await agendaService.listarPublicos());
  } catch (error) {
    console.error('[getPublicEvents]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível carregar o calendário.' });
  }
}

export async function getEvents(_req, res) {
  try {
    res.set('Cache-Control', 'private, no-store');
    res.json(await agendaService.listarInternos());
  } catch (error) {
    console.error('[getEvents]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível carregar a agenda.' });
  }
}

function erroDeEscrita(error, res, acao) {
  if (error.status === 400 || error.status === 404) return res.status(error.status).json({ message: error.message });
  if (error.code === '23503') return res.status(409).json({ message: 'Existem registos associados que impedem esta operação.' });
  if (error.code === '23505') return res.status(409).json({ message: 'Já existe um registo com estes dados.' });
  console.error(`[eventos:${acao}]`, error.code ?? 'erro');
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}

export async function createEvent(req, res) {
  try {
    const id = await agendaService.criar(req.body);
    res.status(201).json({ message: 'Evento registado com sucesso.', id });
  } catch (error) {
    return erroDeEscrita(error, res, 'criar');
  }
}

export async function updateEvent(req, res) {
  try {
    await agendaService.atualizar(req.params.id, req.body);
    res.status(200).json({ message: 'Evento atualizado com sucesso.' });
  } catch (error) {
    return erroDeEscrita(error, res, 'atualizar');
  }
}

export async function deleteEvent(req, res) {
  try {
    await agendaService.eliminar(req.params.id);
    res.json({ message: 'Evento eliminado com sucesso.' });
  } catch (error) {
    if (error.status === 400 || error.status === 404) return res.status(error.status).json({ message: error.message });
    if (error.code === '23503') return res.status(409).json({ message: 'Existem registos associados a este evento.' });
    console.error('[deleteEvent]', error.code ?? 'erro');
    return res.status(500).json({ message: 'Não foi possível eliminar o evento.' });
  }
}
