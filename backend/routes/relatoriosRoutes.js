import express from "express";
import { getRelatorios } from "../controllers/relatoriosController.js";
import { getRelatorioGlobal } from "../controllers/relatorioGlobalController.js";
import { verifyToken, permit } from "../middleware/auth.js";

const router = express.Router();
router.get("/global", verifyToken, permit("Administrador", "Secretaria", "Pastor", "Tesouraria"), getRelatorioGlobal);

router.get("/", verifyToken, permit("Administrador", "Secretaria", "Pastor"), getRelatorios);

export default router;
