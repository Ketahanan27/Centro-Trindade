import { criarSecretariaController } from './secretaria.controller.js';

const controller = criarSecretariaController('apresentacoes');
export const getApresentacoes = controller.listar;
export const createApresentacao = controller.criar;
export const updateApresentacao = controller.atualizar;
export const deleteApresentacao = controller.eliminar;
