import { apiFetch } from '../../utils/api';

const ENDPOINT = '/api/membros/me';

export const consultarPerfil = () => apiFetch(ENDPOINT);
export const guardarPerfil = dados => apiFetch(ENDPOINT, { method: 'PUT', body: JSON.stringify(dados) });

export function carregarFotografia(ficheiro) {
  const dados = new FormData();
  dados.append('foto', ficheiro);
  return apiFetch(`${ENDPOINT}/foto`, { method: 'POST', body: dados });
}
