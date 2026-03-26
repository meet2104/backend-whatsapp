import type { Response } from "express";
import type { AuthRequest } from "../../shared/types/auth.js";
import mongoose from "mongoose";
import Order from "../order/order.model.js";
import OrderItem from "./order-item.model.js";

/* =========================
   HELPERS
========================= */
const parseObjectId = (value: unknown): mongoose.Types.ObjectId | null => {
  if (typeof value !== "string") return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

/**
 * =========================
 * ADD ORDER ITEM
 * =========================
 */
export const addOrderItem = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { orderId, productId, quantity } = req.body;

  const orderObjectId = parseObjectId(orderId);
  const productObjectId = parseObjectId(productId);
  const userObjectId = parseObjectId(req.userId);

  if (!orderObjectId || !productObjectId || !userObjectId) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  const item = await OrderItem.create({
    orderId: orderObjectId,
    productId: productObjectId,
    quantity,
    createdBy: userObjectId,
  });

  res.status(201).json({
    message: "Order item added",
    data: item,
  });
};

/**
 * =========================
 * GET ORDER ITEMS BY ORDER ID
 * =========================
 */
export const getOrderItems = async (req: AuthRequest, res: Response) => {
  const orderObjectId = parseObjectId(req.params.orderId);

  if (!orderObjectId) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const items = await OrderItem.find({
      orderId: orderObjectId,
      isDeleted: false,
    }).populate("productId", "name price");

    res.json({ data: items });
  } catch (error) {
    console.error("GET ORDER ITEMS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch order items" });
  }
};

/**
 * =========================
 * UPDATE ORDER ITEM
 * =========================
 */
export const updateOrderItem = async (req: AuthRequest, res: Response) => {
  const itemObjectId = parseObjectId(req.params.id);

  if (!itemObjectId) {
    return res.status(400).json({ message: "Invalid order item ID" });
  }

  const { quantity } = req.body;

  try {
    const item = await OrderItem.findOneAndUpdate(
      { _id: itemObjectId, isDeleted: false },
      { quantity },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }

    res.json({ message: "Order item updated", data: item });
  } catch (error) {
    console.error("UPDATE ORDER ITEM ERROR:", error);
    res.status(500).json({ message: "Failed to update order item" });
  }
};

/**
 * =========================
 * DELETE ORDER ITEM (SOFT)
 * =========================
 */
export const deleteOrderItem = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const itemObjectId = parseObjectId(req.params.id);
  const userObjectId = parseObjectId(req.userId);

  if (!itemObjectId || !userObjectId) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const item = await OrderItem.findOneAndUpdate(
      { _id: itemObjectId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userObjectId,
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }

    res.json({ message: "Order item deleted" });
  } catch (error) {
    console.error("DELETE ORDER ITEM ERROR:", error);
    res.status(500).json({ message: "Failed to delete order item" });
  }
};


/**
 * =========================
 * GET ALL ORDERS (WITH ITEMS)
 * =========================
 */
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    // Optional: only logged-in users
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ isDeleted: false })
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({
          orderId: order._id,
          isDeleted: false,
        }).populate("productId", "name price");

        return {
          ...order.toObject(),
          items,
        };
      })
    );

    res.json({
      count: ordersWithItems.length,
      data: ordersWithItems,
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};