import express from "express";
import {
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
