import express from "express";
import { enviarContacto } from "../modules/contacto/contacto.controller.js";
import { contactoLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/", contactoLimiter, enviarContacto);

export default router;
