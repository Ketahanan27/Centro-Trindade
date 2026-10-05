import db from '../config/db.js';
import { secretariaCrud } from '../utils/secretariaCrud.js';
import { validarEvento } from '../utils/secretariaValidation.js';
import { InputError, validarId } from '../utils/inputValidation.js';

const hojeLisboa = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const campos = ['titulo', 'descricao', 'data_evento', 'hora_evento', 'local_evento', 'estado', 'publico'];
const crud = secretariaCrud({ tabela: 'eventos', campos, validar: validarEvento, singular: 'Evento' });
const criacao = secretariaCrud({ tabela: 'eventos', campos, singular: 'Evento', validar(payload) {
  const dados = validarEvento(payload);
  if (dados.data_evento < hojeLisboa()) throw new InputError('Não é permitido criar eventos em datas passadas.');
  return dados;
} });
export const createEvent = criacao.criar;
export const updateEvent = crud.atualizar;

const selecionar = `SELECT id, titulo, descricao, TO_CHAR(data_evento, 'YYYY-MM-DD') AS data_evento,
  TO_CHAR(DATE '2000-01-01' + hora_evento, 'HH24:MI') AS hora_evento, local_evento, estado`;
export async function getPublicEvents(_req, res) {
  try {
    res.set('Cache-Control', 'no-store');
    const rows = await db.query(`${selecionar} FROM eventos WHERE publico = true AND estado = 'Agendado' ORDER BY data_evento, hora_evento, id`);
    res.json(rows);
  } catch (error) { console.error('[getPublicEvents]', error.code ?? 'erro'); res.status(500).json({ message: 'Não foi possível carregar o calendário.' }); }
}
export async function getEvents(_req, res) {
  try {
    res.set('Cache-Control', 'private, no-store');
    res.json(await db.query(`${selecionar}, publico FROM eventos ORDER BY data_evento, hora_evento, id`));
  } catch (error) { console.error('[getEvents]', error.code ?? 'erro'); res.status(500).json({ message: 'Não foi possível carregar a agenda.' }); }
}
export async function deleteEvent(req, res) {
  try {
    const id = validarId(req.params.id);
    const result = await db.query('DELETE FROM eventos WHERE id=$1 AND data_evento >= $2::date', [id, hojeLisboa()]);
    if (result.rowCount === 0) {
      const existing = await db.query('SELECT id FROM eventos WHERE id=$1', [id]);
      return res.status(existing.length ? 400 : 404).json({ message: existing.length ? 'Eventos já realizados não podem ser eliminados. Pode corrigir os dados e o estado.' : 'Evento não encontrado.' });
    }
    res.json({ message: 'Evento eliminado com sucesso.' });
  } catch (error) {
    if (error.status === 400) return res.status(400).json({ message: error.message });
    if (error.code === '23503') return res.status(409).json({ message: 'Existem registos associados a este evento.' });
    console.error('[deleteEvent]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível eliminar o evento.' });
  }
}
