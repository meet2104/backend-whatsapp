import express from "express";
import { getProfile, updateProfile, changePassword } from "./profile.controller.js";
import { protect } from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
