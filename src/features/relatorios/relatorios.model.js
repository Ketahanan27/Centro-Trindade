export function datasPreset(preset, agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(agora);
  const obter = tipo => partes.find(parte => parte.type === tipo).value;
  const ano = obter('year');
  const mes = obter('month');
  const fim = `${ano}-${mes}-${obter('day')}`;
  const inicio = preset === 'mes' ? `${ano}-${mes}-01`
    : preset === 'trimestre' ? `${ano}-${String(Math.floor((Number(mes) - 1) / 3) * 3 + 1).padStart(2, '0')}-01`
      : `${ano}-01-01`;
  return { inicio, fim };
}

export const nomeDoRelatorio = (modo, dados) => `centro-trindade-relatorio-${modo}-${dados.inicio}-${dados.fim}.pdf`;
