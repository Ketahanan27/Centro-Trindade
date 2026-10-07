import { apiFetch } from '../../utils/api';

export const UTILIZADORES_ENDPOINT = '/api/auth/users';

export const guardarUtilizador = (id, dados) => apiFetch(
  id ? `${UTILIZADORES_ENDPOINT}/${id}` : UTILIZADORES_ENDPOINT,
  { method: id ? 'PUT' : 'POST', body: JSON.stringify(dados) },
);

export const eliminarUtilizador = id => apiFetch(`${UTILIZADORES_ENDPOINT}/${id}`, { method: 'DELETE' });

export const enviarAcesso = utilizador => apiFetch(
  `${UTILIZADORES_ENDPOINT}/${utilizador.id}/${utilizador.convite_pendente ? 'convite' : 'reset'}`,
  { method: 'POST' },
);
