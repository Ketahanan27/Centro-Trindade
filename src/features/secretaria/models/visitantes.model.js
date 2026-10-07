export const FORM_VAZIO = {
  nome: "",
  telefone: "",
  email: "",
  data_visita: "",
  convidado_por: "",
  observacoes: "",
  estado: "Visitante"
};

export function formularioDoVisitante(visitante) {
  return {
    nome: visitante.nome || '', telefone: visitante.telefone || '', email: visitante.email || '',
    data_visita: visitante.data_visita?.split('T')[0] || '',
    convidado_por: visitante.convidado_por || '', observacoes: visitante.observacoes || '',
    estado: visitante.estado || 'Visitante',
  };
}

export function filtrarVisitantes(visitantes, pesquisa, estado) {
  return visitantes.filter(visitante =>
    (visitante.nome || '').toLowerCase().includes(pesquisa.toLowerCase()) &&
    (estado === 'Todos' || visitante.estado === estado),
  );
}
