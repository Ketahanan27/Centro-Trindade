import express from "express";

import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent
} from "../controllers/agendaController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET é público — o calendário público (calendario.jsx) também usa este endpoint
router.get("/", getEvents);

// Escrita requer autenticação
router.post("/",      verifyToken, createEvent);
router.put("/:id",    verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);

export default router;