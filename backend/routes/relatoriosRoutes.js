import express from "express";
import { getRelatorios } from "../controllers/relatoriosController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getRelatorios);

export default router;
