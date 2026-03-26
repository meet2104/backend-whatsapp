import type { Response } from "express";
import type { AuthRequest } from "../../shared/types/auth.js";
import mongoose from "mongoose";
import Order from "../order/order.model.js";
import OrderStatus from "../orderStatus/orderStatus.model.js";

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const rawId = req.params.id;
  const orderId = Array.isArray(rawId) ? rawId[0] : rawId;

  const { status } = req.body;

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Allowed: ACCEPTED, REJECTED",
    });
  }

  const statusDoc = await OrderStatus.findOne({ label: status }).select("_id");
  if (!statusDoc) {
    return res.status(400).json({ message: `${status} status not found` });
  }

  const order = await Order.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(orderId),
      isDeleted: false,
    },
    {
      statusId: statusDoc._id,
      updatedBy: req.userId,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("_id");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.status(200).json({
    message: `Order ${status.toLowerCase()} successfully`,
    status,
  });
};