import express from "express";
import { getRelatorios } from "../modules/relatorios/relatorios.controller.js";
import { getRelatorioGlobal } from "../modules/relatorios/relatorio-global.controller.js";
import { verifyToken, permit } from "../middleware/auth.js";

const router = express.Router();
router.get("/global", verifyToken, permit("Administrador", "Secretaria", "Pastor", "Tesouraria"), getRelatorioGlobal);

router.get("/", verifyToken, permit("Administrador", "Secretaria", "Pastor"), getRelatorios);

export default router;
