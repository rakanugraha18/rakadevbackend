import express from "express";
import { getProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMidleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);

export default router;
