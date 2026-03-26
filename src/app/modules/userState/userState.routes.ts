import { Router } from "express";
import { getUserState, updateUserState } from "./userState.controller.js";

const router = Router();

router.get("/:phone", getUserState);
router.post("/", updateUserState);

export default router;