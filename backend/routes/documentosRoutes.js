import express from "express";

import {
  getDocumentos,
  createDocumento,
  deleteDocumento   
} from "../controllers/documentosController.js";

import { verifyToken, permit } from "../middleware/auth.js"; 

const router = express.Router();

router.get("/",    verifyToken, permit("Administrador", "Secretaria", "Pastor"), getDocumentos);
router.post("/",   verifyToken, permit("Administrador", "Secretaria"), createDocumento);

router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), deleteDocumento);

export default router;
