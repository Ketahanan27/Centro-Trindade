import express from "express";

import {
  getVisitantes,
  createVisitante,
  updateVisitante,
  deleteVisitante
} from "../controllers/visitantesController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ADICIONADO: autenticação JWT em todas as rotas de visitantes
router.get("/",       verifyToken, getVisitantes);
router.post("/",      verifyToken, createVisitante);
router.put("/:id",    verifyToken, updateVisitante);
router.delete("/:id", verifyToken, deleteVisitante);

export default router;