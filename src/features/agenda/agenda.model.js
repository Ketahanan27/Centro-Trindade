export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const FORM_VAZIO = {
  titulo: '',
  descricao: '',
  data_evento: '',
  hora_evento: '',
  local_evento: '',
  estado: 'Agendado',
  publico: false
};
export function dataLocal(data = new Date()) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}
export function diasDoMes(ano, mes) {
  const vazios = Array(new Date(ano, mes, 1).getDay()).fill(null);
  const dias = Array.from({
    length: new Date(ano, mes + 1, 0).getDate()
  }, (_, i) => dataLocal(new Date(ano, mes, i + 1)));
  return [...vazios, ...dias];
}
export function eventosNoMes(eventos, ano, mes) {
  const prefixo = `${ano}-${String(mes + 1).padStart(2, '0')}`;
  return eventos.filter(evento => evento.data_evento?.slice(0, 7) === prefixo).sort((a, b) => a.data_evento.localeCompare(b.data_evento));
}
export function formularioDoEvento(evento) {
  return {
    titulo: evento.titulo,
    descricao: evento.descricao || '',
    data_evento: String(evento.data_evento).slice(0, 10),
    hora_evento: evento.hora_evento || '',
    local_evento: evento.local_evento || '',
    estado: evento.estado,
    publico: evento.publico
  };
}
