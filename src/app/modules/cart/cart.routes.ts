import { Router } from "express";
import {
  createCart,
  getAllCarts,
  getCartById,
  getCartsByOwnerId,
  updateCart,
  deleteCart,
  syncCartFromOrder,
  getCartByCustomerId,
} from "./cart.controller.js";

const router = Router();

router.post("/", createCart);
router.get("/", getAllCarts);
router.get("/:id", getCartById);
router.get("/owner/:ownerId", getCartsByOwnerId);
router.patch("/:id", updateCart);
router.delete("/:id", deleteCart);
router.post("/sync-from-order", syncCartFromOrder);
router.get("/customer/:customerId", getCartByCustomerId);


export default router;
