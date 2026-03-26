import express from "express";
import { protect } from "../auth/auth.middleware.js";
import {
  addCartItem,
  getCartItems,
  updateCartItem,
  getAllCartItems,
  deleteCartItemHard,
} from "./cart-item.controller.js";

const router = express.Router();
router.post("/", protect, addCartItem);
router.get("/cart/:cartId", protect, getCartItems);
router.get("/items", getAllCartItems);
router.put("/:id", protect, updateCartItem);
router.delete("/:id", protect, deleteCartItemHard);

export default router;
