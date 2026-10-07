import { apiFetch, apiFetchArray } from '../../utils/api';

export const MEMBROS_ENDPOINT = '/api/membros';

export const listarContas = () => apiFetchArray('/api/auth/users');
export const guardarMembro = (id, dados) => apiFetch(id ? `${MEMBROS_ENDPOINT}/${id}` : MEMBROS_ENDPOINT, {
  method: id ? 'PUT' : 'POST',
  body: JSON.stringify(dados)
});
export const apagarMembro = id => apiFetch(`${MEMBROS_ENDPOINT}/${id}`, {
  method: 'DELETE'
});
