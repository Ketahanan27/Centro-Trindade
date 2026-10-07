import { apiFetch } from '../../utils/api';

export const consultarRelatorio = (periodo, modo) => apiFetch(
  `/api/relatorios/global?${new URLSearchParams({ ...periodo, modo })}`,
);
