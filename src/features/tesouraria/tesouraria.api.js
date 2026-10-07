import { apiFetch, apiFetchArray } from '../../utils/api';
const ENDPOINT = '/api/tesouraria';
export const listarMovimentos = () => apiFetchArray(ENDPOINT);
export const guardarMovimento = (id, dados) => apiFetch(id ? `${ENDPOINT}/${id}` : ENDPOINT, {
  method: id ? 'PUT' : 'POST',
  body: JSON.stringify(dados)
});
export const eliminarMovimento = (id, motivo) => apiFetch(`${ENDPOINT}/${id}`, {
  method: 'DELETE',
  body: JSON.stringify({
    motivo
  })
});
