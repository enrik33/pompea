import { Router, raw } from "express";
import { createCheckoutSession, verifyPayment } from "../controllers/bookingController.js";

const router = Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook", raw({ type: "application/json" }), verifyPayment);

export default router;