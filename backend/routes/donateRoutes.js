import express from "express";
import donateCtrl from "../controllers/donateController.js";

const router = express.Router();

router.post("/create", donateCtrl.createDonation);
router.get("/status/:id", donateCtrl.getDonationStatus);
router.post("/simulate/:id", donateCtrl.simulateConfirm);

export default router;
