import { criarSecretariaController } from './secretaria.controller.js';

const controller = criarSecretariaController('atas');
export const getAtas = controller.listar;
export const createAta = controller.criar;
export const updateAta = controller.atualizar;
export const deleteAta = controller.eliminar;
