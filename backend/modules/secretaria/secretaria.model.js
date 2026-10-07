import { validarVisitante, validarApresentacao, validarAta } from '../../utils/secretariaValidation.js';

// Definições internas: nomes SQL nunca vêm do pedido HTTP.
const areas = {
  visitantes: {
    tabela: 'visitantes', singular: 'Visitante', genero: 'o',
    validar: validarVisitante,
    campos: ['nome', 'telefone', 'email', 'data_visita', 'convidado_por', 'observacoes', 'estado'],
    consulta: 'SELECT * FROM visitantes ORDER BY data_visita DESC',
  },
  apresentacoes: {
    tabela: 'apresentacoes', singular: 'Apresentação', genero: 'a',
    validar: validarApresentacao,
    campos: ['data_apresentacao', 'quantidade', 'observacoes'],
    consulta: 'SELECT * FROM apresentacoes ORDER BY data_apresentacao DESC',
  },
  atas: {
    tabela: 'atas', singular: 'Reunião', genero: 'a',
    validar: validarAta,
    campos: ['titulo', 'data', 'hora', 'local', 'participantes', 'resumo', 'decisoes', 'observacoes'],
    consulta: `SELECT
       id,
       titulo,
       TO_CHAR(data, 'YYYY-MM-DD') AS data,
       TO_CHAR(DATE '2000-01-01' + hora, 'HH24:MI')    AS hora,
       local,
       participantes,
       resumo,
       decisoes,
       observacoes,
       created_at
     FROM atas
     ORDER BY data ASC, hora ASC`,
  },
};

export function obterAreaSecretaria(area) {
  if (!Object.hasOwn(areas, area)) throw new Error('Área da secretaria desconhecida.');
  return areas[area];
}
