import express from "express";

import {
  getMovimentos,
  getResumo,
  createMovimento,
  updateMovimento,
  deleteMovimento,
} from "../controllers/tesourariaController.js";

import { verifyToken, permit } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/resumo", verifyToken, permit("Administrador", "Tesouraria", "Pastor"), getResumo);
router.get("/", verifyToken, permit("Administrador", "Tesouraria", "Pastor"), getMovimentos);
router.post("/", verifyToken, permit("Administrador", "Tesouraria"), writeLimiter, createMovimento);
router.put("/:id", verifyToken, permit("Administrador", "Tesouraria"), writeLimiter, updateMovimento);
router.delete("/:id", verifyToken, permit("Administrador", "Tesouraria"), writeLimiter, deleteMovimento);

export default router;
