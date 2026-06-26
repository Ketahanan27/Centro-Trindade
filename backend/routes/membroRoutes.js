import express from "express";

import {
  createMember,
  getMembers,
  updateMember,
  deleteMember
} from "../controllers/membroController.js";

// ADICIONADO: todas as rotas de membros requerem autenticação JWT.
// Sem isto, qualquer pessoa conseguia listar, criar, editar e eliminar
// membros sem qualquer token — a API estava completamente aberta.
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/",    verifyToken, getMembers);
router.post("/",   verifyToken, createMember);
router.put("/:id", verifyToken, updateMember);
router.delete("/:id", verifyToken, deleteMember);

export default router;