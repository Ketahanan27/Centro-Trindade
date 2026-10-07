import { data, InputError } from '../../utils/inputValidation.js';
export const LIMITE_GLOBAL = 5000;
export const SECOES_GLOBAIS = {
  'membros': {
    titulo: 'Entradas de membros',
    colunas: [['nome', 'Nome'], ['data', 'Entrada'], ['estado', 'Estado atual'], ['batizado', 'Batizado']]
  },
  'participacoes': {
    titulo: 'Visitantes por atividade',
    colunas: [['atividade', 'Atividade'], ['data', 'Data'], ['quantidade', 'Visitantes'], ['observacoes', 'Observações']]
  },
  'acompanhamento': {
    titulo: 'Acompanhamento de visitantes',
    colunas: [['nome', 'Nome'], ['data', 'Visita'], ['estado', 'Estado atual']]
  },
  'agenda': {
    titulo: 'Agenda',
    colunas: [['titulo', 'Evento'], ['data', 'Data'], ['hora', 'Hora'], ['local', 'Local'], ['estado', 'Estado'], ['visibilidade', 'Visibilidade']]
  },
  'apresentacoes': {
    titulo: 'Apresentações de crianças',
    colunas: [['data', 'Data'], ['quantidade', 'Crianças'], ['observacoes', 'Observações']]
  },
  'documentos': {
    titulo: 'Documentos emitidos',
    colunas: [['tipo', 'Documento'], ['nome_completo', 'Destinatário'], ['data', 'Emissão']]
  },
  'atas': {
    titulo: 'Reuniões e atas',
    colunas: [['titulo', 'Reunião'], ['data', 'Data']]
  },
  'tesouraria': {
    titulo: 'Tesouraria',
    colunas: [['data', 'Data'], ['natureza', 'Natureza'], ['tipo', 'Tipo'], ['valor', 'Valor'], ['observacao', 'Observação']]
  }
};
export function validarRelatorioGlobal(utilizador, query) {
  const administrativo = ['Administrador', 'Secretaria', 'Pastor'].includes(utilizador?.perfil);
  const financeiro = ['Administrador', 'Tesouraria', 'Pastor'].includes(utilizador?.perfil);
  if (!administrativo && !financeiro) throw Object.assign(new Error('Acesso não permitido.'), {
    status: 403
  });
  const inicio = data(query.inicio, 'Data inicial');
  const fim = data(query.fim, 'Data final');
  const modo = query.modo ?? 'resumido';
  if (!inicio || !fim || inicio > fim) throw new InputError('Selecione um período válido.');
  if (!['resumido', 'detalhado'].includes(modo)) throw new InputError('Formato inválido.');
  return {
    inicio,
    fim,
    modo,
    administrativo,
    financeiro
  };
}
