import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", verifyToken, getDashboardStats);

export default router;
