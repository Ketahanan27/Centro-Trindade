export function hojeLisboa(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(agora);
  const obter = tipo => partes.find(parte => parte.type === tipo).value;
  return `${obter('year')}-${obter('month')}-${obter('day')}`;
}
