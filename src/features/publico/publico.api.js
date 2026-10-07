import { apiFetchArray } from '../../utils/api.js';

export const listarEventosPublicos = () => apiFetchArray('/api/eventos');

export function enviarContacto(dados) {
  return fetch('/api/contacto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
}
