import express from "express";

import {
  getApresentacoes,
  createApresentacao,
  updateApresentacao,
  deleteApresentacao,
} from "../modules/secretaria/apresentacoes.controller.js";

import { verifyToken, permit } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/", verifyToken, permit("Administrador", "Secretaria", "Pastor"), getApresentacoes);
router.post("/", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, createApresentacao);
router.put("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, updateApresentacao);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, deleteApresentacao);

export default router;
