import { apiFetch, apiFetchArray } from '../../utils/api';

export const ENDPOINTS = {
  visitas: '/api/visitas-atividade',
  visitantes: '/api/visitantes',
  documentos: '/api/documentos',
  apresentacoes: '/api/apresentacoes',
  atas: '/api/atas',
};

function criarRecurso(endpoint) {
  const guardar = (id, dados) => apiFetch(
    id !== null && id !== undefined ? `${endpoint}/${id}` : endpoint,
    { method: id !== null && id !== undefined ? 'PUT' : 'POST', body: JSON.stringify(dados) },
  );
  return {
    consultar: (query) => apiFetch(query ? `${endpoint}?${query}` : endpoint),
    criar: (dados) => guardar(null, dados),
    alterar: (id, dados) => guardar(id, dados),
    guardar,
    eliminar: (id) => apiFetch(`${endpoint}/${id}`, { method: 'DELETE' }),
  };
}

export const visitasApi = criarRecurso(ENDPOINTS.visitas);
export const visitantesApi = criarRecurso(ENDPOINTS.visitantes);
export const documentosApi = criarRecurso(ENDPOINTS.documentos);
export const apresentacoesApi = criarRecurso(ENDPOINTS.apresentacoes);
export const atasApi = criarRecurso(ENDPOINTS.atas);

export const listarEventosInternos = () => apiFetchArray('/api/eventos/internos');
