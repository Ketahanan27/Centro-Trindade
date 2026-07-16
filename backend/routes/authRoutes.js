import express from "express";
import { verifyToken, adminOnly } from "../middleware/auth.js";
import {
  register, login, recuperarPassword, redefinirPassword,
  getUsers, criarUtilizador, updateUser, deleteUser, resetUserPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register",  register);
router.post("/login",     login);
router.post("/recuperar", recuperarPassword);
router.post("/redefinir", redefinirPassword);

router.get("/users",            verifyToken, adminOnly, getUsers);
router.post("/users",           verifyToken, adminOnly, criarUtilizador);
router.put("/users/:id",        verifyToken, adminOnly, updateUser);
router.delete("/users/:id",     verifyToken, adminOnly, deleteUser);
router.post("/users/:id/reset", verifyToken, adminOnly, resetUserPassword);

export default router;
