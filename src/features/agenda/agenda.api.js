import { apiFetch } from '../../utils/api';
const ENDPOINT = '/api/eventos';
export const AGENDA_INTERNA_ENDPOINT = `${ENDPOINT}/internos`;
export const criar = dados => apiFetch(ENDPOINT, {
  method: 'POST',
  body: JSON.stringify(dados)
});
export const alterar = (id, dados) => apiFetch(`${ENDPOINT}/${id}`, {
  method: 'PUT',
  body: JSON.stringify(dados)
});
export const eliminar = id => apiFetch(`${ENDPOINT}/${id}`, {
  method: 'DELETE'
});
