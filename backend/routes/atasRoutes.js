import express from "express";

import {
  getAtas,
  createAta,
  updateAta,
  deleteAta,
} from "../modules/secretaria/atas.controller.js";

import { verifyToken, permit } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/", verifyToken, permit("Administrador", "Secretaria", "Pastor"), getAtas);
router.post("/", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, createAta);
router.put("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, updateAta);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, deleteAta);

export default router;
