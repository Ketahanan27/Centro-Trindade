import express from "express";

import {
  getDocumentos,
  createDocumento,
  deleteDocumento   // CORRIGIDO: import do novo handler DELETE
} from "../controllers/documentosController.js";

import { verifyToken } from "../middleware/auth.js"; // ADICIONADO: proteção JWT

const router = express.Router();

// Todas as rotas de documentos requerem autenticação
router.get("/",    verifyToken, getDocumentos);
router.post("/",   verifyToken, createDocumento);

// CORRIGIDO: rota DELETE completamente em falta —
// documentos.jsx chamava DELETE /api/documentos/:id e recebia 404
router.delete("/:id", verifyToken, deleteDocumento);

export default router;