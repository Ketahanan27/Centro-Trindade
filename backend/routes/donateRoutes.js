import express from "express";
import donateCtrl from "../controllers/donateController.js";
import { donateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/create", donateLimiter, donateCtrl.createDonation);
router.get("/status/:id", donateLimiter, donateCtrl.getDonationStatus);

export default router;