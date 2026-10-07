import express from "express";
import donateCtrl from "../modules/contribuicoes/contribuicoes.controller.js";
import { donateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/create", donateLimiter, donateCtrl.createDonation);
router.get("/status/:id", donateLimiter, donateCtrl.getDonationStatus);

export default router;
