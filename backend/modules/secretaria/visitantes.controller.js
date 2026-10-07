import { criarSecretariaController } from './secretaria.controller.js';

const controller = criarSecretariaController('visitantes');
export const getVisitantes = controller.listar;
export const createVisitante = controller.criar;
export const updateVisitante = controller.atualizar;
export const deleteVisitante = controller.eliminar;
