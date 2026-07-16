import express from "express";

import {
  getApresentacoes,
  createApresentacao,
  updateApresentacao,
  deleteApresentacao
} from "../controllers/apresentacoesController.js";

import { verifyToken, permit } from "../middleware/auth.js";

const router = express.Router();

router.get("/",       verifyToken, getApresentacoes);
router.post("/",      verifyToken, permit("Administrador", "Secretaria"), createApresentacao);
router.put("/:id",    verifyToken, permit("Administrador", "Secretaria"), updateApresentacao);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), deleteApresentacao);

export default router;
