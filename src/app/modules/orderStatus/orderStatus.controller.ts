import type { Request, Response } from "express";
import OrderStatus from "./orderStatus.model.js";

export const getOrderStatuses = async (_req: Request, res: Response) => {
  try {
    const statuses = await OrderStatus.find().sort({ createdAt: 1 });
    res.json({ data: statuses });
  } catch {
    res.status(500).json({ message: "Failed to fetch order statuses" });
  }
};
