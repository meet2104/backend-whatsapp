// import type { Request, Response } from "express";
// import mongoose from "mongoose";
// import Cart from "./cart.model.js";

// /* =========================
//    CREATE CART
// ========================= */
// export const createCart = async (req: Request, res: Response) => {
//   try {
//     const { cartRandomId, customerId, createdBy } = req.body;

//     if (
//       !cartRandomId ||
//       !mongoose.Types.ObjectId.isValid(customerId) ||
//       !mongoose.Types.ObjectId.isValid(createdBy)
//     ) {
//       return res.status(400).json({ message: "Invalid input data" });
//     }

//     const cart = await Cart.create({
//       cartRandomId,
//       customerId,
//       createdBy,
//     });

//     res.status(201).json({ data: cart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to create cart" });
//   }
// };

// /* =========================
//    GET ALL CARTS
// ========================= */
// export const getAllCarts = async (_req: Request, res: Response) => {
//   try {
//     const carts = await Cart.find()
//       .populate("customerId")
//       .populate("createdBy")
//       .sort({ createdAt: -1 });

//     res.json({ data: carts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch carts" });
//   }
// };

// /* =========================
//    GET CART BY ID
// ========================= */
// export const getCartById = async (
//   req: Request<{ id: string }>,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid cart id" });
//     }

//     const cart = await Cart.findById(id)
//       .populate("customerId")
//       .populate("createdBy")
//       .populate("updatedBy");

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     res.json({ data: cart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch cart" });
//   }
// };
// /* =========================
//    GET CARTS BY OWNER ID
// ========================= */
// export const getCartsByOwnerId = async (
//   req: Request<{ ownerId: string }>,
//   res: Response
// ) => {
//   try {
//     const { ownerId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(ownerId)) {
//       return res.status(400).json({ message: "Invalid owner id" });
//     }

//     const carts = await Cart.find({
//       createdBy: new mongoose.Types.ObjectId(ownerId),
//     })
//       .populate("customerId")
//       .populate("createdBy")
//       .sort({ createdAt: -1 });

//     res.json({ data: carts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch carts by owner" });
//   }
// };


// /* =========================
//    UPDATE CART
// ========================= */
// export const updateCart = async (
//   req: Request<{ id: string }>,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid cart id" });
//     }

//     const cart = await Cart.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true }
//     );

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     res.json({ data: cart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update cart" });
//   }
// };

// /* =========================
//    HARD DELETE CART
// ========================= */
// export const deleteCart = async (
//   req: Request<{ id: string }>,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid cart id" });
//     }

//     const cart = await Cart.findByIdAndDelete(id);

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     res.json({ message: "Cart deleted permanently" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to delete cart" });
//   }
// };



// export const syncCartFromOrder = async (req: Request, res: Response) => {
//   try {
//     const { customerId, ownerId, orderId, items, total } = req.body;

//     if (
//       !mongoose.Types.ObjectId.isValid(customerId) ||
//       !mongoose.Types.ObjectId.isValid(ownerId)
//     ) {
//       return res.status(400).json({ message: "Invalid ids" });
//     }

//     const cart = await Cart.findOneAndUpdate(
//       {
//         customerId,
//         createdBy: ownerId,
//       },
//       {
//         customerId,
//         createdBy: ownerId,
//         orderId,
//         items,
//         total,
//       },
//       {
//         upsert: true,
//         new: true,
//       }
//     );

//     res.json({ data: cart });
//   } catch (err) {
//     console.error("syncCartFromOrder error:", err);
//     res.status(500).json({ message: "Failed to sync cart" });
//   }
// };

// /* =========================
//    GET CART BY CUSTOMER ID
// ========================= */
// export const getCartByCustomerId = async (
//   req: Request<{ customerId: string }>,
//   res: Response
// ) => {
//   try {
//     const { customerId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(customerId)) {
//       return res.status(400).json({ message: "Invalid customer id" });
//     }

//     const cart = await Cart.findOne({
//       customerId: new mongoose.Types.ObjectId(customerId),
//       isDeleted: false,
//     })
//       .populate("customerId")
//       .populate("createdBy")
//       .populate("updatedBy")
//       .sort({ updatedAt: -1 });

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found for customer" });
//     }

//     res.json({ data: cart });
//   } catch (error) {
//     console.error("GET CART BY CUSTOMER ID ERROR:", error);
//     res.status(500).json({ message: "Failed to fetch cart by customer" });
//   }
// };


import type { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "./cart.model.js";

/* =========================================
   HELPER: FORMAT CART RESPONSE
========================================= */
const formatCart = (cart: any) => {
  if (!cart) return null;

  return {
    id: cart._id,
    ownerId: cart.createdBy,
    customerId: cart.customerId,
    createdBy: cart.createdBy,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    isDeleted: cart.isDeleted,
    items: cart.items ?? [],
  };
};

/* =========================
   CREATE CART
========================= */
export const createCart = async (req: Request, res: Response) => {
  try {
    const { customerId, createdBy } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(createdBy)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    const cart = await Cart.create({
      customerId,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      data: formatCart(cart),
    });
  } catch (error) {
    console.error("CREATE CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create cart",
    });
  }
};

/* =========================
   GET ALL CARTS
========================= */
export const getAllCarts = async (_req: Request, res: Response) => {
  try {
    const carts = await Cart.find()
      .select("_id customerId createdBy createdAt updatedAt isDeleted items")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: carts.map(formatCart),
    });
  } catch (error) {
    console.error("GET ALL CARTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch carts",
    });
  }
};

/* =========================
   GET CART BY ID
========================= */
export const getCartById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart id",
      });
    }

    const cart = await Cart.findById(id)
      .select("_id customerId createdBy createdAt updatedAt isDeleted items");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    return res.json({
      success: true,
      data: formatCart(cart),
    });
  } catch (error) {
    console.error("GET CART BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

/* =========================
   GET CARTS BY OWNER ID
========================= */
export const getCartsByOwnerId = async (
  req: Request<{ ownerId: string }>,
  res: Response
) => {
  try {
    const { ownerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner id",
      });
    }

    const carts = await Cart.find({
      createdBy: new mongoose.Types.ObjectId(ownerId),
    })
      .select("_id customerId createdBy createdAt updatedAt isDeleted items")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: carts.map(formatCart),
    });
  } catch (error) {
    console.error("GET CARTS BY OWNER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch carts by owner",
    });
  }
};

/* =========================
   UPDATE CART
========================= */
export const updateCart = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart id",
      });
    }

    const cart = await Cart.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("_id customerId createdBy createdAt updatedAt isDeleted items");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    return res.json({
      success: true,
      data: formatCart(cart),
    });
  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

/* =========================
   HARD DELETE CART
========================= */
export const deleteCart = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart id",
      });
    }

    const cart = await Cart.findByIdAndDelete(id)
      .select("_id customerId createdBy createdAt updatedAt isDeleted items");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    return res.json({
      success: true,
      data: formatCart(cart),
    });
  } catch (error) {
    console.error("DELETE CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete cart",
    });
  }
};

/* =========================
   SYNC CART FROM ORDER
========================= */
export const syncCartFromOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, ownerId, orderId, items, total } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(ownerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ids",
      });
    }

    const cart = await Cart.findOneAndUpdate(
      {
        customerId,
        createdBy: ownerId,
      },
      {
        customerId,
        createdBy: ownerId,
        orderId,
        items,
        total,
      },
      {
        upsert: true,
        new: true,
      }
    ).select("_id customerId createdBy createdAt updatedAt isDeleted items");

    return res.json({
      success: true,
      data: formatCart(cart),
    });
  } catch (error) {
    console.error("SYNC CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync cart",
    });
  }
};

/* =========================
   GET CART BY CUSTOMER ID
========================= */
export const getCartByCustomerId = async (
  req: Request<{ customerId: string }>,
  res: Response
) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id",
      });
    }

    const cart = await Cart.findOne({
      customerId: new mongoose.Types.ObjectId(customerId),
      isDeleted: false,
    })
      .select("_id customerId createdBy createdAt updatedAt isDeleted items")
      .sort({ updatedAt: -1 });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found for customer",
      });
    }

    return res.json({
      success: true,
      data: formatCart(cart),
    });
  } catch (error) {
    console.error("GET CART BY CUSTOMER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart by customer",
    });
  }
};