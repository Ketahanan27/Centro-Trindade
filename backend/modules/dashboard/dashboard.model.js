import { hojeLisboa } from '../../utils/dataLisboa.js';
export function periodoDashboard(now = new Date()) {
  const hoje = hojeLisboa(now);
  const [ano, mes] = hoje.split('-').map(Number);
  return {
    hoje,
    ano,
    mes,
    inicioMes: `${ano}-${String(mes).padStart(2, '0')}-01`,
    fimMes: `${mes === 12 ? ano + 1 : ano}-${String(mes === 12 ? 1 : mes + 1).padStart(2, '0')}-01`,
    inicioAno: `${ano}-01-01`,
    fimAno: `${ano + 1}-01-01`
  };
}
