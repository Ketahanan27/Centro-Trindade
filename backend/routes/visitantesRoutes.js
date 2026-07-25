import express from "express";

import {
  getVisitantes,
  createVisitante,
  updateVisitante,
  deleteVisitante
} from "../controllers/visitantesController.js";

import { verifyToken, permit } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/",       verifyToken, permit("Administrador", "Secretaria", "Pastor"), getVisitantes);
router.post("/",      verifyToken, permit("Administrador", "Secretaria"), writeLimiter, createVisitante);
router.put("/:id",    verifyToken, permit("Administrador", "Secretaria"), writeLimiter, updateVisitante);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, deleteVisitante);

export default router;