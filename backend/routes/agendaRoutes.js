import express from "express";

import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent
} from "../controllers/agendaController.js";

import { verifyToken, permit } from "../middleware/auth.js";
import { publicReadLimiter, writeLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/", publicReadLimiter, getEvents);

router.post("/",      verifyToken, permit("Administrador", "Secretaria"), writeLimiter, createEvent);
router.put("/:id",    verifyToken, permit("Administrador", "Secretaria"), writeLimiter, updateEvent);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, deleteEvent);

export default router;