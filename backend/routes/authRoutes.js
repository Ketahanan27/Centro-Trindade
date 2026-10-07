import express from "express";
import { verifyToken, adminOnly } from "../middleware/auth.js";
import { authLimiter, writeLimiter } from "../middleware/rateLimit.js";
import {
  register, login, recuperarPassword, redefinirPassword,
} from "../modules/auth/auth.controller.js";

import { getUsers, criarUtilizador, updateUser, deleteUser, resetUserPassword, reenviarConvite } from '../modules/utilizadores/utilizadores.controller.js';

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/recuperar", authLimiter, recuperarPassword);
router.post("/redefinir", authLimiter, redefinirPassword);

router.get("/users", verifyToken, adminOnly, getUsers);
router.post("/users", verifyToken, adminOnly, writeLimiter, criarUtilizador);
router.put("/users/:id", verifyToken, adminOnly, writeLimiter, updateUser);
router.delete("/users/:id", verifyToken, adminOnly, writeLimiter, deleteUser);
router.post("/users/:id/reset", verifyToken, adminOnly, writeLimiter, resetUserPassword);
router.post("/users/:id/convite", verifyToken, adminOnly, writeLimiter, reenviarConvite);

export default router;
