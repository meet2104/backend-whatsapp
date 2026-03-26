import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByOwnerId, 
  getOrdersByCustomerId, 
} from "../order/order.controller.js";

import {
  getOrderStatuses,
} from "../orderStatus/orderStatus.controller.js";

import {
  updateOrderStatus
} from "../order/orderAction.controller.js";

import { protect } from "../auth/auth.middleware.js";
const router = express.Router();
router.get("/statuses/list", protect, getOrderStatuses);
router.get("/owner", protect, getOrdersByOwnerId);
router.put(
  "/:id/status",
  protect,
  updateOrderStatus
);

router.post("/", protect, createOrder);
router.get("/", protect, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);
router.get("/customer/:customerId", getOrdersByCustomerId);

export default router;