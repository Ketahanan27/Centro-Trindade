export const vazio = {
  evento_id: '',
  atividade: '',
  data_atividade: '',
  quantidade: '',
  observacoes: ''
};

export const CONTAGENS_POR_PAGINA = 25;

export function consultaContagens(filtros, pagina, exportar = false) {
  return new URLSearchParams({
    ...filtros,
    ...(exportar ? { exportar: 'true' } : { pagina: String(pagina) }),
  }).toString();
}

export function formularioDaAgenda(formulario, eventos, eventoId) {
  const evento = eventos.find(registo => String(registo.id) === eventoId);
  return {
    ...formulario,
    evento_id: eventoId,
    atividade: evento?.titulo ?? '',
    data_atividade: evento?.data_evento?.slice(0, 10) ?? '',
  };
}
