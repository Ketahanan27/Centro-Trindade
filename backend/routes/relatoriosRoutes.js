import express from "express";
import { getRelatorios } from "../controllers/relatoriosController.js";
import { verifyToken, permit } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, permit("Administrador", "Secretaria", "Pastor", "Tesouraria"), getRelatorios);

export default router;