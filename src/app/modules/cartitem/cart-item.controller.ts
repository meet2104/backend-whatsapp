import type { Response } from "express";
import type { AuthRequest } from "../../shared/types/auth.js";
import mongoose from "mongoose";
import CartItem from "./cart-item.model.js";

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
 * ADD CART ITEM
 * =========================
 */
export const addCartItem = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { cartId, productId, quantity } = req.body;

  const cartObjectId = parseObjectId(cartId);
  const productObjectId = parseObjectId(productId);
  const userObjectId = parseObjectId(req.userId);

  if (!cartObjectId || !productObjectId || !userObjectId) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  try {
    const item = await CartItem.create({
      cartId: cartObjectId,
      productId: productObjectId,
      quantity,
      createdBy: userObjectId,
    });

    res.status(201).json({
      message: "Cart item added",
      data: item,
    });
  } catch (error) {
    console.error("ADD CART ITEM ERROR:", error);
    res.status(500).json({ message: "Failed to add cart item" });
  }
};

/**
 * =========================
 * GET CART ITEMS BY CART ID
 * =========================
 */
export const getCartItems = async (req: AuthRequest, res: Response) => {
  const cartObjectId = parseObjectId(req.params.cartId);

  if (!cartObjectId) {
    return res.status(400).json({ message: "Invalid cart ID" });
  }

  try {
    const items = await CartItem.find({
      cartId: cartObjectId,
      isDeleted: false,
    }).populate("productId", "name price");

    res.json({ data: items });
  } catch (error) {
    console.error("GET CART ITEMS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch cart items" });
  }
};

/**
 * =========================
 * UPDATE CART ITEM (quantity)
 * =========================
 */
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const itemObjectId = parseObjectId(req.params.id);

  if (!itemObjectId) {
    return res.status(400).json({ message: "Invalid cart item ID" });
  }

  const { quantity } = req.body;

  try {
    const item = await CartItem.findOneAndUpdate(
      { _id: itemObjectId, isDeleted: false },
      { quantity },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Cart item updated", data: item });
  } catch (error) {
    console.error("UPDATE CART ITEM ERROR:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};

/**
 * =========================
 * DELETE CART ITEM (HARD)
 * =========================
 */
export const deleteCartItemHard = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const itemObjectId = parseObjectId(req.params.id);

  if (!itemObjectId) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    // Hard delete
    const deletedItem = await CartItem.findOneAndDelete({ _id: itemObjectId });

    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Cart item permanently deleted" });
  } catch (error) {
    console.error("HARD DELETE CART ITEM ERROR:", error);
    res.status(500).json({ message: "Failed to delete cart item" });
  }
};

export const getAllCartItems = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const pipeline: any[] = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    ];

    // 🔍 Optional search by product name
    if (search.length >= 3) {
      pipeline.push({
        $match: {
          "product.name": { $regex: search, $options: "i" },
        },
      });
    }

    // 🔢 Total count
    const totalResult = await CartItem.aggregate([
      ...pipeline,
      { $count: "count" },
    ]);
    const total = totalResult[0]?.count || 0;

    // 📦 Pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const items = await CartItem.aggregate(pipeline);

    const data = items.map((i) => ({
      id: i._id.toString(),
      cartId: i.cartId,
      product: i.product
        ? {
            id: i.product._id.toString(),
            name: i.product.name,
            price: i.product.price,
          }
        : null,
      quantity: i.quantity,
      createdBy: i.createdBy,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));

    return res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET ALL CART ITEMS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch cart items" });
  }
}; 
