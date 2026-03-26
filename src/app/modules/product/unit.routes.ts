import { Router } from "express";
import Unit from "./unit.model.js";
import { protect } from "../auth/auth.middleware.js";

const router = Router();

// GET ALL UNITS
router.get("/", protect, async (_req, res) => {
    const units = await Unit.find().select("_id name displayName").lean();
    res.status(200).json({
        success: true,
        data: units,
    });
});

export default router;
