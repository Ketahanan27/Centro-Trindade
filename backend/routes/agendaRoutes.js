import express from "express";

import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent
} from "../controllers/agendaController.js";

import { verifyToken, permit } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getEvents);

router.post("/",      verifyToken, permit("Administrador", "Secretaria"), createEvent);
router.put("/:id",    verifyToken, permit("Administrador", "Secretaria"), updateEvent);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), deleteEvent);

export default router;
