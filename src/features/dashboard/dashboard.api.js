import { apiFetch } from '../../utils/api';

export const consultarIndicadores = () => apiFetch('/api/dashboard/stats');
