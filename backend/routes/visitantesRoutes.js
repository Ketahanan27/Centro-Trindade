import express from "express";

import {
  getVisitantes,
  createVisitante,
  updateVisitante,
  deleteVisitante
} from "../controllers/visitantesController.js";

import { verifyToken, permit } from "../middleware/auth.js";

const router = express.Router();

router.get("/",       verifyToken, permit("Administrador", "Secretaria", "Pastor"), getVisitantes);
router.post("/",      verifyToken, permit("Administrador", "Secretaria"), createVisitante);
router.put("/:id",    verifyToken, permit("Administrador", "Secretaria"), updateVisitante);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), deleteVisitante);

export default router;
