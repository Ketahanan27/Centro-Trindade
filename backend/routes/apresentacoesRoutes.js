import express from "express";

import {
  getApresentacoes,
  createApresentacao,
  updateApresentacao,
  deleteApresentacao
} from "../controllers/apresentacoesController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ADICIONADO: autenticação JWT em todas as rotas de apresentações
router.get("/",       verifyToken, getApresentacoes);
router.post("/",      verifyToken, createApresentacao);
router.put("/:id",    verifyToken, updateApresentacao);
router.delete("/:id", verifyToken, deleteApresentacao);

export default router;