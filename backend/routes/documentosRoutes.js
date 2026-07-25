import express from "express";

import {
  getDocumentos,
  createDocumento,
  deleteDocumento
} from "../controllers/documentosController.js";

import { verifyToken, permit } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/",    verifyToken, permit("Administrador", "Secretaria", "Pastor"), getDocumentos);
router.post("/",   verifyToken, permit("Administrador", "Secretaria"), writeLimiter, createDocumento);

router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, deleteDocumento);

export default router;