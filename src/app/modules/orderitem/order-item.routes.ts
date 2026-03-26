import express from "express";
import { protect } from "../auth/auth.middleware.js";
import {
  addOrderItem,
  getOrderItems,
  updateOrderItem,
  deleteOrderItem,
  getAllOrders,
} from "./orderItem.controller.js";

const router = express.Router();

/**
 * =========================
 * ORDER ITEM ROUTES
 * =========================
 */

/* ADD SINGLE ORDER ITEM */
router.post("/", protect, addOrderItem);

/* GET ORDER ITEMS BY ORDER ID */
router.get("/order/:orderId", protect, getOrderItems);

/* UPDATE ORDER ITEM (quantity) */
router.put("/:id", protect, updateOrderItem);

/* GET ALL ORDERS */
router.get("/", protect, getAllOrders);

/* DELETE ORDER ITEM (soft delete) */
router.delete("/:id", protect, deleteOrderItem);

export default router;
