// // // import type { Response } from "express";
// // // import type { AuthRequest } from "../../../types/auth.js";
// // // import mongoose from "mongoose";
// // // import Order from "../order/order.model.js";
// // // import OrderItem from "../orderitem/order-item.model.js";
// // // import Product from "../product/product.model.js";
// // // import { getIO } from "../../../socket/socket.js";

// // // /* =========================
// // //    HELPERS
// // // ========================= */
// // // const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
// // //   if (!req.userId) return null;
// // //   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
// // //   return new mongoose.Types.ObjectId(req.userId);
// // // };

// // // const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
// // //   if (typeof id !== "string") return null;
// // //   if (!mongoose.Types.ObjectId.isValid(id)) return null;
// // //   return new mongoose.Types.ObjectId(id);
// // // };

// // // const normalizeQuantity = (
// // //   quantity: number,
// // //   unit: string
// // // ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
// // //   switch (unit.toUpperCase()) {
// // //     case "GRAM":
// // //       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
// // //     case "KG":
// // //       return { normalizedQty: quantity, baseUnit: "KG" };
// // //     case "ML":
// // //       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
// // //     case "LITER":
// // //       return { normalizedQty: quantity, baseUnit: "LITER" };
// // //     default:
// // //       throw new Error("Unsupported unit");
// // //   }
// // // };

// // // /**
// // //  * =========================
// // //  * CREATE ORDER (with items)
// // //  * =========================
// // //  */
// // // export const createOrder = async (req: AuthRequest, res: Response) => {
// // //   const userId = getUserObjectId(req);
// // //   if (!userId) {
// // //     return res.status(401).json({ message: "Unauthorized" });
// // //   }

// // //   const { customerId, statusId, items, summary } = req.body;

// // //   if (!Array.isArray(items) || items.length === 0) {
// // //     return res.status(400).json({ message: "Order items required" });
// // //   }

// // //   const session = await mongoose.startSession();
// // //   session.startTransaction();

// // //   try {
// // //     // ✅ CREATE ORDER
// // //     const [order] = await Order.create(
// // //       [
// // //         {
// // //           orderRandomId: Math.floor(100000 + Math.random() * 900000),
// // //           customerId,
// // //           statusId,
// // //           summary,
// // //           createdBy: userId,
// // //         },
// // //       ],
// // //       { session }
// // //     );

// // //     if (!order) throw new Error("Order creation failed");

// // //     // ✅ CREATE ORDER ITEMS
// // //     // const orderItems = items.map((item: any) => ({
// // //     //   orderId: order._id,
// // //     //   productId: item.productId,
// // //     //   quantity: item.quantity,
// // //     //   createdBy: userId,
// // //     // }));

// // //     const orderItems = items.map((item: any) => ({
// // //   orderId: order._id,
// // //   productId: item.productId,
// // //   quantity: item.quantity,
// // //   createdBy: userId,
// // // }));


// // //     await OrderItem.insertMany(orderItems, { session });

// // //     // ✅ FIND PRODUCT OWNERS
// // //     const productIds = items.map((i: any) => i.productId);

// // //     const products = await Product.find(
// // //       { _id: { $in: productIds } },
// // //       { ownerId: 1 }
// // //     ).session(session);

// // //     // ✅ SOCKET NOTIFICATION
// // //     const io = getIO();

// // //     if (io) {
// // //       const ownerIds = [
// // //         ...new Set(
// // //           products
// // //             .map((p) => p.ownerId?.toString())
// // //             .filter(Boolean)
// // //         ),
// // //       ];

// // //       ownerIds.forEach((ownerId) => {
// // //         io.to(ownerId).emit("new-order", {
// // //           orderId: order._id.toString(),
// // //           orderRandomId: order.orderRandomId,
// // //           summary: order.summary,
// // //           createdAt: order.createdAt,
// // //         });
// // //       });
// // //     }

// // //     await session.commitTransaction();

// // //     return res.status(201).json({
// // //       message: "Order created successfully",
// // //       id: order._id,
// // //     });

// // //   } catch (error) {
// // //     await session.abortTransaction();
// // //     console.error("CREATE ORDER ERROR:", error);
// // //     return res.status(500).json({ message: "Order creation failed" });

// // //   } finally {
// // //     session.endSession();
// // //   }
// // // };


// // // /**
// // //  * =========================
// // //  * UPDATE ORDER (with items)
// // //  * =========================
// // //  */
// // // export const updateOrder = async (req: AuthRequest, res: Response) => {
// // //   const userId = getUserObjectId(req);
// // //   if (!userId) {
// // //     return res.status(401).json({ message: "Unauthorized" });
// // //   }

// // //   const orderId = getParamObjectId(req.params.id);
// // //   if (!orderId) {
// // //     return res.status(400).json({ message: "Invalid order ID" });
// // //   }

// // //   const { statusId, summary, items } = req.body;

// // //   const session = await mongoose.startSession();
// // //   session.startTransaction();

// // //   try {
// // //     const order = await Order.findOneAndUpdate(
// // //       { _id: orderId, isDeleted: false },
// // //       {
// // //         ...(statusId && { statusId }),
// // //         ...(summary && { summary }),
// // //         updatedBy: userId,
// // //       },
// // //       { new: true, session }
// // //     );

// // //     if (!order) {
// // //       await session.abortTransaction();
// // //       return res.status(404).json({ message: "Order not found" });
// // //     }

// // //     if (items) {
// // //       if (!Array.isArray(items) || items.length === 0) {
// // //         await session.abortTransaction();
// // //         return res
// // //           .status(400)
// // //           .json({ message: "Order items must be a non-empty array" });
// // //       }

// // //       await OrderItem.updateMany(
// // //         { orderId },
// // //         {
// // //           isDeleted: true,
// // //           deletedAt: new Date(),
// // //           deletedBy: userId,
// // //         },
// // //         { session }
// // //       );

// // //       const newItems = items.map((item: any) => ({
// // //         orderId,
// // //         productId: item.productId,
// // //         quantity: item.quantity,
// // //         createdBy: userId,
// // //       }));

// // //       await OrderItem.insertMany(newItems, { session });
// // //     }

// // //     await session.commitTransaction();
// // //     return res.json({
// // //       message: "Order updated successfully",
// // //     });

// // //   } catch (error) {
// // //     await session.abortTransaction();
// // //     console.error("UPDATE ORDER ERROR:", error);
// // //     return res.status(500).json({ message: "Order update failed" });
// // //   } finally {
// // //     session.endSession();
// // //   }
// // // };


// // // /**
// // //  * =========================
// // //  * GET ORDER LIST
// // //  * =========================
// // //  */
// // // export const getAllOrders = async (req: AuthRequest, res: Response) => {
// // //   try {
// // //     const page = Math.max(Number(req.query.page) || 1, 1);
// // //     const limit = Math.max(Number(req.query.limit) || 10, 1);
// // //     const skip = (page - 1) * limit;

// // //     const filter = { isDeleted: false };

// // //     // 1️⃣ Fetch orders
// // //     const [total, orders] = await Promise.all([
// // //       Order.countDocuments(filter),
// // //       Order.find(filter)
// // //         .populate("statusId", "label")
// // //         .sort({ createdAt: -1 })
// // //         .skip(skip)
// // //         .limit(limit),
// // //     ]);

// // //     if (orders.length === 0) {
// // //       return res.json({
// // //         data: [],
// // //         total,
// // //         page,
// // //         totalPages: 0,
// // //       });
// // //     }

// // //     // 2️⃣ Fetch order items
// // //     const orderIds = orders.map((o) => o._id);

// // //     const orderItems = await OrderItem.find(
// // //       { orderId: { $in: orderIds }, isDeleted: false },
// // //       { orderId: 1, productId: 1 }
// // //     );

// // //     // 3️⃣ Fetch products with owners
// // //     const productIds = [
// // //       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
// // //     ].map((id) => new mongoose.Types.ObjectId(id));

// // //     const products = await Product.find(
// // //       { _id: { $in: productIds } },
// // //       { ownerId: 1 }
// // //     ).populate("ownerId", "firstName lastName");

// // //     // 4️⃣ Map product → owner
// // //     const productOwnerMap = new Map<string, any>();

// // //     products.forEach((p) => {
// // //       if (p.ownerId) {
// // //         productOwnerMap.set(p._id.toString(), {
// // //           id: (p.ownerId as any)._id,
// // //           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
// // //         });
// // //       }
// // //     });

// // //     // 5️⃣ Map order → owner (first matching product owner)
// // //     const orderOwnerMap = new Map<string, any>();

// // //     orderItems.forEach((item) => {
// // //       const orderId = item.orderId.toString();
// // //       const productId = item.productId?.toString();
// // //       if (!orderOwnerMap.has(orderId) && productId) {
// // //         const owner = productOwnerMap.get(productId);
// // //         if (owner) orderOwnerMap.set(orderId, owner);
// // //       }
// // //     });

// // //     // 6️⃣ Final response
// // //     const data = orders.map((o) => ({
// // //       id: o._id.toString(),
// // //       orderId: o.orderRandomId,
// // //       customerId: o.customerId,
// // //       status: (o.statusId as any)?.label || "PENDING",
// // //       summary: o.summary || "",
// // //       createdAt: o.createdAt,
// // //       updatedAt: o.updatedAt,

// // //       // ✅ OWNER INFO (ADMIN)
// // //       owner: orderOwnerMap.get(o._id.toString()) || null,
// // //     }));

// // //     return res.json({
// // //       data,
// // //       total,
// // //       page,
// // //       totalPages: Math.ceil(total / limit),
// // //     });
// // //   } catch (error) {
// // //     console.error("GET ORDERS ERROR:", error);
// // //     return res.status(500).json({ message: "Failed to fetch orders" });
// // //   }
// // // };




// // // /**
// // //  * =========================
// // //  * GET ORDER BY ID
// // //  * =========================
// // //  */
// // // export const getOrderById = async (req: AuthRequest, res: Response) => {
// // //   const orderId = getParamObjectId(req.params.id);
// // //   if (!orderId) {
// // //     return res.status(400).json({ message: "Invalid order ID" });
// // //   }

// // //   const order = await Order.findOne({
// // //     _id: orderId,
// // //     isDeleted: false,
// // //   })
// // //     .populate("customerId", "name")
// // //     .populate("statusId", "label");

// // //   if (!order) {
// // //     return res.status(404).json({ message: "Order not found" });
// // //   }

// // //   const items = await OrderItem.find({
// // //     orderId,
// // //     isDeleted: false,
// // //   }).populate("productId", "name price");

// // //   return res.json({
// // //     order: {
// // //       id: order._id.toString(),
// // //       orderId: order.orderRandomId,
// // //       customerId:
// // //         typeof order.customerId === "object"
// // //           ? (order.customerId as any)._id
// // //           : order.customerId,
// // //       status: (order.statusId as any)?.label || "PENDING",
// // //       summary: order.summary || "",
// // //       createdAt: order.createdAt,
// // //       updatedAt: order.updatedAt,
// // //     },
// // //     items: items
// // //       .filter((i) => i.productId)
// // //       .map((i) => ({
// // //         id: i._id.toString(),
// // //         quantity: i.quantity,
// // //         product: {
// // //           id: (i.productId as any)._id.toString(),
// // //           name: (i.productId as any).name,
// // //           price: (i.productId as any).price,
// // //         },
// // //       })),
// // //   });
// // // };

// // // /**
// // //  * =========================
// // //  * DELETE ORDER (SOFT)
// // //  * =========================
// // //  */
// // // export const deleteOrder = async (req: AuthRequest, res: Response) => {
// // //   const userId = getUserObjectId(req);
// // //   if (!userId) {
// // //     return res.status(401).json({ message: "Unauthorized" });
// // //   }

// // //   const orderId = getParamObjectId(req.params.id);
// // //   if (!orderId) {
// // //     return res.status(400).json({ message: "Invalid order ID" });
// // //   }

// // //   await Order.findByIdAndUpdate(orderId, {
// // //     isDeleted: true,
// // //     deletedAt: new Date(),
// // //     deletedBy: userId,
// // //   });

// // //   await OrderItem.updateMany(
// // //     { orderId },
// // //     { isDeleted: true, deletedAt: new Date() }
// // //   );

// // //   return res.json({
// // //     message: "Order deleted successfully",
// // //   });

// // // };

// // // /* =========================
// // //    GET ORDERS BY OWNER ID
// // // ========================= */
// // // export const getOrdersByOwnerId = async (
// // //   req: AuthRequest,
// // //   res: Response
// // // ) => {
// // //   try {
// // //     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
// // //       return res.status(401).json({ message: "Unauthorized" });
// // //     }

// // //     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

// // //     // 1️⃣ Products owned by logged-in owner
// // //     const products = await Product.find(
// // //       { ownerId: ownerObjectId, isDeleted: false },
// // //       { _id: 1 }
// // //     );

// // //     if (products.length === 0) {
// // //       return res.json({ total: 0, data: [] });
// // //     }

// // //     const productIds = products.map((p) => p._id);

// // //     // 2️⃣ OrderItems using those products
// // //     const orderItems = await OrderItem.find(
// // //       { productId: { $in: productIds }, isDeleted: false },
// // //       { orderId: 1 }
// // //     );

// // //     if (orderItems.length === 0) {
// // //       return res.json({ total: 0, data: [] });
// // //     }

// // //     const orderIds = [
// // //       ...new Set(orderItems.map((i) => i.orderId.toString())),
// // //     ].map((id) => new mongoose.Types.ObjectId(id));

// // //     // 3️⃣ Orders
// // //     const orders = await Order.find({
// // //       _id: { $in: orderIds },
// // //       isDeleted: false,
// // //     })
// // //       .populate("statusId", "label")
// // //       .sort({ createdAt: -1 });

// // //     const data = orders.map((o) => ({
// // //       id: o._id.toString(),
// // //       orderId: o.orderRandomId,
// // //       customerId: o.customerId,
// // //       status: (o.statusId as any)?.label || "PENDING",
// // //       summary: o.summary || "",
// // //       createdAt: o.createdAt,
// // //       updatedAt: o.updatedAt,
// // //     }));

// // //     return res.json({
// // //       total: data.length,
// // //       data,
// // //     });
// // //   } catch (error) {
// // //     console.error("GET ORDERS BY OWNER ERROR:", error);
// // //     return res.status(500).json({ message: "Failed to fetch orders" });
// // //   }
// // // };


// // // import type { Response } from "express";
// // // import type { AuthRequest } from "../../../types/auth.js";
// // // import mongoose from "mongoose";
// // // import Order from "../order/order.model.js";
// // // import OrderItem from "../orderitem/order-item.model.js";
// // // import Product from "../product/product.model.js";
// // // import { getIO } from "../../../socket/socket.js";

// // // /* =========================
// // //    HELPERS
// // // ========================= */
// // // const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
// // //   if (!req.userId) return null;
// // //   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
// // //   return new mongoose.Types.ObjectId(req.userId);
// // // };

// // // const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
// // //   if (typeof id !== "string") return null;
// // //   if (!mongoose.Types.ObjectId.isValid(id)) return null;
// // //   return new mongoose.Types.ObjectId(id);
// // // };

// // // const normalizeQuantity = (
// // //   quantity: number,
// // //   unit: string
// // // ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
// // //   switch (unit.toUpperCase()) {
// // //     case "GRAM":
// // //       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
// // //     case "KG":
// // //       return { normalizedQty: quantity, baseUnit: "KG" };
// // //     case "ML":
// // //       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
// // //     case "LITER":
// // //       return { normalizedQty: quantity, baseUnit: "LITER" };
// // //     default:
// // //       throw new Error("Unsupported unit");
// // //   }
// // // };

// // // /**
// // //  * =========================
// // //  * CREATE ORDER (with items)
// // //  * =========================
// // //  */
// // // export const createOrder = async (req: AuthRequest, res: Response) => {
// // //   const userId = getUserObjectId(req);
// // //   if (!userId) return res.status(401).json({ message: "Unauthorized" });

// // //   const { customerId, statusId, items, summary } = req.body;
// // //   if (!Array.isArray(items) || items.length === 0) {
// // //     return res.status(400).json({ message: "Order items required" });
// // //   }

// // //   const session = await mongoose.startSession();
// // //   session.startTransaction();

// // //   try {
// // //     /* 1️⃣ Fetch product owners FIRST */
// // //     const productIds = items.map((i: any) => i.productId);

// // //     const products = await Product.find(
// // //       { _id: { $in: productIds } },
// // //       { ownerId: 1 }
// // //     ).session(session);

// // //     if (products.length === 0) {
// // //       throw new Error("Products not found");
// // //     }

// // //     const productOwnerMap = new Map<string, mongoose.Types.ObjectId>();

// // //     products.forEach((p) => {
// // //       if (p.ownerId) {
// // //         productOwnerMap.set(p._id.toString(), p.ownerId);
// // //       }
// // //     });

// // //     /* ✅ Choose PRIMARY SHOP OWNER (first product owner) */
// // //     const primaryOwnerId = productOwnerMap.values().next().value;
// // //     if (!primaryOwnerId) {
// // //       throw new Error("Product owner not found");
// // //     }

// // //     /* 2️⃣ Create order (SHOP OWNER is creator) */
// // //     const createdOrders = await Order.create(
// // //       [
// // //         {
// // //           orderRandomId: Math.floor(100000 + Math.random() * 900000),
// // //           customerId,
// // //           statusId,
// // //           summary,
// // //           createdBy: primaryOwnerId, // ✅ SHOP OWNER
// // //         },
// // //       ],
// // //       { session }
// // //     );

// // //     const order = createdOrders[0];
// // //     if (!order) throw new Error("Order creation failed");

// // //     /* 3️⃣ Create order items (per product owner) */
// // //     const orderItems = items.map((item: any) => {
// // //       const ownerId = productOwnerMap.get(item.productId.toString());
// // //       if (!ownerId) throw new Error("Product owner not found");

// // //       return {
// // //         orderId: order._id,
// // //         productId: item.productId,
// // //         quantity: item.quantity,

// // //         ownerId,                 // shop owner
// // //         createdBy: ownerId,      // shop owner
// // //         ownerCreatedAt: new Date(),
// // //       };
// // //     });

// // //     await OrderItem.insertMany(orderItems, { session });

// // //     /* 4️⃣ Notify shop owners */
// // //     const io = getIO();
// // //     if (io) {
// // //       [...new Set(products.map(p => p.ownerId?.toString()))]
// // //         .filter(Boolean)
// // //         .forEach(ownerId => {
// // //           io.to(ownerId!).emit("new-order", {
// // //             orderId: order._id.toString(),
// // //             orderRandomId: order.orderRandomId,
// // //             summary: order.summary,
// // //             createdAt: order.createdAt,
// // //           });
// // //         });
// // //     }

// // //     await session.commitTransaction();

// // //     return res.status(201).json({
// // //       message: "Order created successfully",
// // //       id: order._id,
// // //     });

// // //   } catch (error) {
// // //     await session.abortTransaction();
// // //     console.error("CREATE ORDER ERROR:", error);
// // //     return res.status(500).json({ message: "Order creation failed" });
// // //   } finally {
// // //     session.endSession();
// // //   }
// // // };


// // // /**
// // //  * =========================
// // //  * UPDATE ORDER (with items)
// // //  * =========================
// // //  */
// // // export const updateOrder = async (req: AuthRequest, res: Response) => {
// // //   const userId = getUserObjectId(req);
// // //   if (!userId) {
// // //     return res.status(401).json({ message: "Unauthorized" });
// // //   }

// // //   const orderId = getParamObjectId(req.params.id);
// // //   if (!orderId) {
// // //     return res.status(400).json({ message: "Invalid order ID" });
// // //   }

// // //   const { statusId, summary, items } = req.body;

// // //   const session = await mongoose.startSession();
// // //   session.startTransaction();

// // //   try {
// // //     const order = await Order.findOneAndUpdate(
// // //       { _id: orderId, isDeleted: false },
// // //       {
// // //         ...(statusId && { statusId }),
// // //         ...(summary && { summary }),
// // //         updatedBy: userId,
// // //       },
// // //       { new: true, session }
// // //     );

// // //     if (!order) {
// // //       await session.abortTransaction();
// // //       return res.status(404).json({ message: "Order not found" });
// // //     }

// // //     if (items) {
// // //       if (!Array.isArray(items) || items.length === 0) {
// // //         await session.abortTransaction();
// // //         return res
// // //           .status(400)
// // //           .json({ message: "Order items must be a non-empty array" });
// // //       }

// // //       await OrderItem.updateMany(
// // //         { orderId },
// // //         {
// // //           isDeleted: true,
// // //           deletedAt: new Date(),
// // //           deletedBy: userId,
// // //         },
// // //         { session }
// // //       );

// // //       const newItems = items.map((item: any) => ({
// // //         orderId,
// // //         productId: item.productId,
// // //         quantity: item.quantity,
// // //         createdBy: userId,
// // //       }));

// // //       await OrderItem.insertMany(newItems, { session });
// // //     }

// // //     await session.commitTransaction();
// // //     return res.json({
// // //       message: "Order updated successfully",
// // //     });

// // //   } catch (error) {
// // //     await session.abortTransaction();
// // //     console.error("UPDATE ORDER ERROR:", error);
// // //     return res.status(500).json({ message: "Order update failed" });
// // //   } finally {
// // //     session.endSession();
// // //   }
// // // };


// // // /**
// // //  * =========================
// // //  * GET ORDER LIST
// // //  * =========================
// // //  */
// // // export const getAllOrders = async (req: AuthRequest, res: Response) => {
// // //   try {
// // //     const page = Math.max(Number(req.query.page) || 1, 1);
// // //     const limit = Math.max(Number(req.query.limit) || 10, 1);
// // //     const skip = (page - 1) * limit;

// // //     const filter = { isDeleted: false };

// // //     // 1️⃣ Fetch orders
// // //     const [total, orders] = await Promise.all([
// // //       Order.countDocuments(filter),
// // //       Order.find(filter)
// // //         .populate("statusId", "label")
// // //         .sort({ createdAt: -1 })
// // //         .skip(skip)
// // //         .limit(limit),
// // //     ]);

// // //     if (orders.length === 0) {
// // //       return res.json({
// // //         data: [],
// // //         total,
// // //         page,
// // //         totalPages: 0,
// // //       });
// // //     }

// // //     // 2️⃣ Fetch order items
// // //     const orderIds = orders.map((o) => o._id);

// // //     const orderItems = await OrderItem.find(
// // //       { orderId: { $in: orderIds }, isDeleted: false },
// // //       { orderId: 1, productId: 1 }
// // //     );

// // //     // 3️⃣ Fetch products with owners
// // //     const productIds = [
// // //       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
// // //     ].map((id) => new mongoose.Types.ObjectId(id));

// // //     const products = await Product.find(
// // //       { _id: { $in: productIds } },
// // //       { ownerId: 1 }
// // //     ).populate("ownerId", "firstName lastName");

// // //     // 4️⃣ Map product → owner
// // //     const productOwnerMap = new Map<string, any>();

// // //     products.forEach((p) => {
// // //       if (p.ownerId) {
// // //         productOwnerMap.set(p._id.toString(), {
// // //           id: (p.ownerId as any)._id,
// // //           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
// // //         });
// // //       }
// // //     });

// // //     // 5️⃣ Map order → owner (first matching product owner)
// // //     const orderOwnerMap = new Map<string, any>();

// // //     orderItems.forEach((item) => {
// // //       const orderId = item.orderId.toString();
// // //       const productId = item.productId?.toString();
// // //       if (!orderOwnerMap.has(orderId) && productId) {
// // //         const owner = productOwnerMap.get(productId);
// // //         if (owner) orderOwnerMap.set(orderId, owner);
// // //       }
// // //     });

// // //     // 6️⃣ Final response
// // //     const data = orders.map((o) => ({
// // //       id: o._id.toString(),
// // //       orderId: o.orderRandomId,
// // //       customerId: o.customerId,
// // //       status: (o.statusId as any)?.label || "PENDING",
// // //       summary: o.summary || "",
// // //       createdAt: o.createdAt,
// // //       updatedAt: o.updatedAt,

// // //       // ✅ OWNER INFO (ADMIN)
// // //       owner: orderOwnerMap.get(o._id.toString()) || null,
// // //     }));

// // //     return res.json({
// // //       data,
// // //       total,
// // //       page,
// // //       totalPages: Math.ceil(total / limit),
// // //     });
// // //   } catch (error) {
// // //     console.error("GET ORDERS ERROR:", error);
// // //     return res.status(500).json({ message: "Failed to fetch orders" });
// // //   }
// // // };




// // // /**
// // //  * =========================
// // //  * GET ORDER BY ID
// // //  * =========================
// // //  */
// // // export const getOrderById = async (req: AuthRequest, res: Response) => {
// // //   const orderId = getParamObjectId(req.params.id);
// // //   if (!orderId) {
// // //     return res.status(400).json({ message: "Invalid order ID" });
// // //   }

// // //   const order = await Order.findOne({
// // //     _id: orderId,
// // //     isDeleted: false,
// // //   })
// // //     .populate("customerId", "name")
// // //     .populate("statusId", "label");

// // //   if (!order) {
// // //     return res.status(404).json({ message: "Order not found" });
// // //   }

// // //   const items = await OrderItem.find({
// // //     orderId,
// // //     isDeleted: false,
// // //   }).populate("productId", "name price");

// // //   return res.json({
// // //     order: {
// // //       id: order._id.toString(),
// // //       orderId: order.orderRandomId,
// // //       customerId:
// // //         typeof order.customerId === "object"
// // //           ? (order.customerId as any)._id
// // //           : order.customerId,
// // //       status: (order.statusId as any)?.label || "PENDING",
// // //       summary: order.summary || "",
// // //       createdAt: order.createdAt,
// // //       updatedAt: order.updatedAt,
// // //     },
// // //     items: items
// // //       .filter((i) => i.productId)
// // //       .map((i) => ({
// // //         id: i._id.toString(),
// // //         quantity: i.quantity,
// // //         product: {
// // //           id: (i.productId as any)._id.toString(),
// // //           name: (i.productId as any).name,
// // //           price: (i.productId as any).price,
// // //         },
// // //       })),
// // //   });
// // // };

// // // /**
// // //  * =========================
// // //  * DELETE ORDER (SOFT)
// // //  * =========================
// // //  */
// // // export const deleteOrder = async (req: AuthRequest, res: Response) => {
// // //   const userId = getUserObjectId(req);
// // //   if (!userId) {
// // //     return res.status(401).json({ message: "Unauthorized" });
// // //   }

// // //   const orderId = getParamObjectId(req.params.id);
// // //   if (!orderId) {
// // //     return res.status(400).json({ message: "Invalid order ID" });
// // //   }

// // //   await Order.findByIdAndUpdate(orderId, {
// // //     isDeleted: true,
// // //     deletedAt: new Date(),
// // //     deletedBy: userId,
// // //   });

// // //   await OrderItem.updateMany(
// // //     { orderId },
// // //     { isDeleted: true, deletedAt: new Date() }
// // //   );

// // //   return res.json({
// // //     message: "Order deleted successfully",
// // //   });

// // // };

// // // /* =========================
// // //    GET ORDERS BY OWNER ID
// // // ========================= */
// // // export const getOrdersByOwnerId = async (
// // //   req: AuthRequest,
// // //   res: Response
// // // ) => {
// // //   try {
// // //     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
// // //       return res.status(401).json({ message: "Unauthorized" });
// // //     }

// // //     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

// // //     // 1️⃣ Products owned by logged-in owner
// // //     const products = await Product.find(
// // //       { ownerId: ownerObjectId, isDeleted: false },
// // //       { _id: 1 }
// // //     );

// // //     if (products.length === 0) {
// // //       return res.json({ total: 0, data: [] });
// // //     }

// // //     const productIds = products.map((p) => p._id);

// // //     // 2️⃣ OrderItems using those products
// // //     const orderItems = await OrderItem.find(
// // //       { productId: { $in: productIds }, isDeleted: false },
// // //       { orderId: 1 }
// // //     );

// // //     if (orderItems.length === 0) {
// // //       return res.json({ total: 0, data: [] });
// // //     }

// // //     const orderIds = [
// // //       ...new Set(orderItems.map((i) => i.orderId.toString())),
// // //     ].map((id) => new mongoose.Types.ObjectId(id));

// // //     // 3️⃣ Orders
// // //     const orders = await Order.find({
// // //       _id: { $in: orderIds },
// // //       isDeleted: false,
// // //     })
// // //       .populate("statusId", "label")
// // //       .sort({ createdAt: -1 });

// // //     const data = orders.map((o) => ({
// // //       id: o._id.toString(),
// // //       orderId: o.orderRandomId,
// // //       customerId: o.customerId,
// // //       status: (o.statusId as any)?.label || "PENDING",
// // //       summary: o.summary || "",
// // //       createdAt: o.createdAt,
// // //       updatedAt: o.updatedAt,
// // //     }));

// // //     return res.json({
// // //       total: data.length,
// // //       data,
// // //     });
// // //   } catch (error) {
// // //     console.error("GET ORDERS BY OWNER ERROR:", error);
// // //     return res.status(500).json({ message: "Failed to fetch orders" });
// // //   }
// // // };

// // import type { Response } from "express";
// // import type { AuthRequest } from "../../../types/auth.js";
// // import mongoose from "mongoose";
// // import Order from "../order/order.model.js";
// // import OrderItem from "../orderitem/order-item.model.js";
// // import Product from "../product/product.model.js";
// // import { getIO } from "../../../socket/socket.js";
// // import CustomerSummary from "../customers/customer.model.js";
// // import { create } from "node:domain";

// // /* =========================
// //    HELPERS
// // ========================= */
// // const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
// //   if (!req.userId) return null;
// //   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
// //   return new mongoose.Types.ObjectId(req.userId);
// // };

// // const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
// //   if (typeof id !== "string") return null;
// //   if (!mongoose.Types.ObjectId.isValid(id)) return null;
// //   return new mongoose.Types.ObjectId(id);
// // };

// // const normalizeQuantity = (
// //   quantity: number,
// //   unit: string
// // ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
// //   switch (unit.toUpperCase()) {
// //     case "GRAM":
// //       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
// //     case "KG":
// //       return { normalizedQty: quantity, baseUnit: "KG" };
// //     case "ML":
// //       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
// //     case "LITER":
// //       return { normalizedQty: quantity, baseUnit: "LITER" };
// //     default:
// //       throw new Error("Unsupported unit");
// //   }
// // };

// // /**
// //  * =========================
// //  * CREATE ORDER (with items)
// //  * =========================
// //  */
// // export const createOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) return res.status(401).json({ message: "Unauthorized" });

// //   const { customerId, statusId, items, summary } = req.body;
// //   if (!Array.isArray(items) || items.length === 0) {
// //     return res.status(400).json({ message: "Order items required" });
// //   }

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     /* 1️⃣ Fetch product owners FIRST */
// //     const productIds = items.map((i: any) => i.productId);
// //     const products = await Product.find(
// //       { _id: { $in: productIds } },
// //       { ownerId: 1 }
// //     ).session(session);

// //     if (products.length === 0) {
// //       throw new Error("Products not found");
// //     }

// //     const productOwnerMap = new Map<string, mongoose.Types.ObjectId>();
// //     products.forEach((p) => {
// //       if (p.ownerId) {
// //         productOwnerMap.set(p._id.toString(), p.ownerId);
// //       }
// //     });

// //     /* ✅ Choose PRIMARY SHOP OWNER (first product owner) */
// //     const primaryOwnerId = productOwnerMap.values().next().value || userId;

// //     /* 2️⃣ Create order (SHOP OWNER as creator) */
// //     const [order] = await Order.create(
// //       [
// //         {
// //           orderRandomId: Math.floor(100000 + Math.random() * 900000),
// //           customerId,
// //           statusId,
// //           summary,
// //           createdBy: primaryOwnerId, // product owner or fallback to user
// //         },
// //       ],
// //       { session }
// //     );

// //     if (!order) throw new Error("Order creation failed");

// //     /* 3️⃣ Create order items (per product owner) */
// //     const orderItems = items.map((item: any) => {
// //       const ownerId = productOwnerMap.get(item.productId.toString()) || userId;

// //       return {
// //         orderId: order._id,
// //         productId: item.productId,
// //         quantity: item.quantity,
// //         ownerId,                 // product owner
// //         createdBy: ownerId,      // product owner
// //         ownerCreatedAt: new Date(),
// //       };
// //     });

// //     await OrderItem.insertMany(orderItems, { session });

// //     /* 4️⃣ Update CustomerSummary: lastOrderOn & shopOwner */
// //     await CustomerSummary.findByIdAndUpdate(
// //       customerId,
// //       {
// //         lastOrderOn: order._id,
// //         shopOwner: primaryOwnerId,
// //       },
// //       { session, new: true }
// //     );

// //     /* 5️⃣ Notify all product owners */
// //     const io = getIO();
// //     if (io) {
// //       [...new Set(products.map(p => p.ownerId?.toString()))]
// //         .filter(Boolean)
// //         .forEach(ownerId => {
// //           io.to(ownerId!).emit("new-order", {
// //             orderId: order._id.toString(),
// //             orderRandomId: order.orderRandomId,
// //             summary: order.summary,
// //             createdAt: order.createdAt,
// //           });
// //         });
// //     }

// //     await session.commitTransaction();

// //     return res.status(201).json({
// //       message: "Order created successfully",
// //       id: order._id,
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("CREATE ORDER ERROR:", error);
// //     return res.status(500).json({ message: "Order creation failed" });
// //   } finally {
// //     session.endSession();
// //   }
// // };


// // /**
// //  * =========================
// //  * UPDATE ORDER (with items)
// //  * =========================
// //  */
// // export const updateOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   const { statusId, summary, items } = req.body;

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const order = await Order.findOneAndUpdate(
// //       { _id: orderId, isDeleted: false },
// //       {
// //         ...(statusId && { statusId }),
// //         ...(summary && { summary }),
// //         updatedBy: userId,
// //       },
// //       { new: true, session }
// //     );

// //     if (!order) {
// //       await session.abortTransaction();
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     if (items) {
// //       if (!Array.isArray(items) || items.length === 0) {
// //         await session.abortTransaction();
// //         return res
// //           .status(400)
// //           .json({ message: "Order items must be a non-empty array" });
// //       }

// //       await OrderItem.updateMany(
// //         { orderId },
// //         {
// //           isDeleted: true,
// //           deletedAt: new Date(),
// //           deletedBy: userId,
// //         },
// //         { session }
// //       );

// //       const newItems = items.map((item: any) => ({
// //         orderId,
// //         productId: item.productId,
// //         quantity: item.quantity,
// //         createdBy: userId,
// //       }));

// //       await OrderItem.insertMany(newItems, { session });
// //     }

// //     await session.commitTransaction();
// //     return res.json({
// //       message: "Order updated successfully",
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("UPDATE ORDER ERROR:", error);
// //     return res.status(500).json({ message: "Order update failed" });
// //   } finally {
// //     session.endSession();
// //   }
// // };


// // /**
// //  * =========================
// //  * GET ORDER LIST
// //  * =========================
// //  */
// // export const getAllOrders = async (req: AuthRequest, res: Response) => {
// //   try {
// //     const page = Math.max(Number(req.query.page) || 1, 1);
// //     const limit = Math.max(Number(req.query.limit) || 10, 1);
// //     const skip = (page - 1) * limit;

// //     const filter = { isDeleted: false };

// //     // 1️⃣ Fetch orders
// //     const [total, orders] = await Promise.all([
// //       Order.countDocuments(filter),
// //       Order.find(filter)
// //         .populate("statusId", "label")
// //         .sort({ createdAt: -1 })
// //         .skip(skip)
// //         .limit(limit),
// //     ]);

// //     if (orders.length === 0) {
// //       return res.json({
// //         data: [],
// //         total,
// //         page,
// //         totalPages: 0,
// //       });
// //     }

// //     // 2️⃣ Fetch order items
// //     const orderIds = orders.map((o) => o._id);

// //     const orderItems = await OrderItem.find(
// //       { orderId: { $in: orderIds }, isDeleted: false },
// //       { orderId: 1, productId: 1 }
// //     );

// //     // 3️⃣ Fetch products with owners
// //     const productIds = [
// //       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
// //     ].map((id) => new mongoose.Types.ObjectId(id));

// //     const products = await Product.find(
// //       { _id: { $in: productIds } },
// //       { ownerId: 1 }
// //     ).populate("ownerId", "firstName lastName");

// //     // 4️⃣ Map product → owner
// //     const productOwnerMap = new Map<string, any>();

// //     products.forEach((p) => {
// //       if (p.ownerId) {
// //         productOwnerMap.set(p._id.toString(), {
// //           id: (p.ownerId as any)._id,
// //           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
// //         });
// //       }
// //     });

// //     // 5️⃣ Map order → owner (first matching product owner)
// //     const orderOwnerMap = new Map<string, any>();

// //     orderItems.forEach((item) => {
// //       const orderId = item.orderId.toString();
// //       const productId = item.productId?.toString();
// //       if (!orderOwnerMap.has(orderId) && productId) {
// //         const owner = productOwnerMap.get(productId);
// //         if (owner) orderOwnerMap.set(orderId, owner);
// //       }
// //     });

// //     // 6️⃣ Final response
// //     const data = orders.map((o) => ({
// //       id: o._id.toString(),
// //       orderId: o.orderRandomId,
// //       customerId: o.customerId,
// //       status: (o.statusId as any)?.label || "PENDING",
// //       summary: o.summary || "",
// //       createdAt: o.createdAt,
// //       updatedAt: o.updatedAt,

// //       // ✅ OWNER INFO (ADMIN)
// //       owner: orderOwnerMap.get(o._id.toString()) || null,
// //     }));

// //     return res.json({
// //       data,
// //       total,
// //       page,
// //       totalPages: Math.ceil(total / limit),
// //     });
// //   } catch (error) {
// //     console.error("GET ORDERS ERROR:", error);
// //     return res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };




// // /**
// //  * =========================
// //  * GET ORDER BY ID
// //  * =========================
// //  */
// // export const getOrderById = async (req: AuthRequest, res: Response) => {
// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   const order = await Order.findOne({
// //     _id: orderId,
// //     isDeleted: false,
// //   })
// //     .populate("customerId", "name")
// //     .populate("statusId", "label");

// //   if (!order) {
// //     return res.status(404).json({ message: "Order not found" });
// //   }

// //   const items = await OrderItem.find({
// //     orderId,
// //     isDeleted: false,
// //   }).populate("productId", "name price");

// //   return res.json({
// //     order: {
// //       id: order._id.toString(),
// //       orderId: order.orderRandomId,
// //       customerId:
// //         typeof order.customerId === "object"
// //           ? (order.customerId as any)._id
// //           : order.customerId,
// //       status: (order.statusId as any)?.label || "PENDING",
// //       summary: order.summary || "",
// //       createdAt: order.createdAt,
// //       updatedAt: order.updatedAt,
// //     },
// //     items: items
// //       .filter((i) => i.productId)
// //       .map((i) => ({
// //         id: i._id.toString(),
// //         quantity: i.quantity,
// //         product: {
// //           id: (i.productId as any)._id.toString(),
// //           name: (i.productId as any).name,
// //           price: (i.productId as any).price,
// //         },
// //       })),
// //   });
// // };

// // /**
// //  * =========================
// //  * DELETE ORDER (SOFT)
// //  * =========================
// //  */
// // export const deleteOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   await Order.findByIdAndUpdate(orderId, {
// //     isDeleted: true,
// //     deletedAt: new Date(),
// //     deletedBy: userId,
// //   });

// //   await OrderItem.updateMany(
// //     { orderId },
// //     { isDeleted: true, deletedAt: new Date() }
// //   );

// //   return res.json({
// //     message: "Order deleted successfully",
// //   });

// // };

// // /* =========================
// //    GET ORDERS BY OWNER ID
// // ========================= */
// // export const getOrdersByOwnerId = async (
// //   req: AuthRequest,
// //   res: Response
// // ) => {
// //   try {
// //     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

// //     // 1️⃣ Products owned by logged-in owner
// //     const products = await Product.find(
// //       { ownerId: ownerObjectId, isDeleted: false },
// //       { _id: 1 }
// //     );

// //     if (products.length === 0) {
// //       return res.json({ total: 0, data: [] });
// //     }

// //     const productIds = products.map((p) => p._id);

// //     // 2️⃣ OrderItems using those products
// //     const orderItems = await OrderItem.find(
// //       { productId: { $in: productIds }, isDeleted: false },
// //       { orderId: 1 }
// //     );

// //     if (orderItems.length === 0) {
// //       return res.json({ total: 0, data: [] });
// //     }

// //     const orderIds = [
// //       ...new Set(orderItems.map((i) => i.orderId.toString())),
// //     ].map((id) => new mongoose.Types.ObjectId(id));

// //     // 3️⃣ Orders
// //     const orders = await Order.find({
// //       _id: { $in: orderIds },
// //       isDeleted: false,
// //     })
// //       .populate("statusId", "label")
// //       .sort({ createdAt: -1 });

// //     const data = orders.map((o) => ({
// //       id: o._id.toString(),
// //       orderId: o.orderRandomId,
// //       customerId: o.customerId,
// //       status: (o.statusId as any)?.label || "PENDING",
// //       summary: o.summary || "",
// //       createdAt: o.createdAt,
// //       updatedAt: o.updatedAt,
// //     }));

// //     return res.json({
// //       total: data.length,
// //       data,
// //     });
// //   } catch (error) {
// //     console.error("GET ORDERS BY OWNER ERROR:", error);
// //     return res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };


// // export const getOrdersByCustomerId = async (req: AuthRequest, res: Response) => {
// //   try {
// //     let customerId = req.params.customerId;
// //     if (Array.isArray(customerId)) customerId = customerId[0];
// //     if (!customerId) return res.status(400).json({ message: "Invalid customer ID" });

// //     // Convert to ObjectId
// //     let customerObjectId: mongoose.Types.ObjectId;
// //     try {
// //       customerObjectId = new mongoose.Types.ObjectId(customerId);
// //     } catch {
// //       return res.status(400).json({ message: "Invalid customer ID format" });
// //     }

// //     const page = Math.max(Number(req.query.page) || 1, 1);
// //     const limit = Math.max(Number(req.query.limit) || 10, 1);
// //     const skip = (page - 1) * limit;

// //     const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
// //     const status =
// //       typeof req.query.status === "string" && req.query.status.toUpperCase() !== "ALL"
// //         ? req.query.status
// //         : null;

// //     /* =========================
// //        AGGREGATION PIPELINE
// //     ========================= */
// //     const pipeline: any[] = [
// //       {
// //         // Convert string customerId in DB to ObjectId if needed
// //         $addFields: {
// //           customerIdObj: {
// //             $cond: [
// //               { $eq: [{ $type: "$customerId" }, "string"] },
// //               { $toObjectId: "$customerId" },
// //               "$customerId",
// //             ],
// //           },
// //           orderRandomIdStr: { $toString: "$orderRandomId" },
// //         },
// //       },
// //       {
// //         $match: {
// //           customerIdObj: customerObjectId,
// //           isDeleted: false,
// //         },
// //       },
// //     ];

// //     // 🔍 Search by orderRandomId (>= 3 chars)
// //     if (search.length >= 3) {
// //       pipeline.push({
// //         $match: { orderRandomIdStr: { $regex: search, $options: "i" } },
// //       });
// //     }

// //     // 🔗 Join status
// //     pipeline.push(
// //       {
// //         $lookup: {
// //           from: "orderstatuses",
// //           localField: "statusId",
// //           foreignField: "_id",
// //           as: "status",
// //         },
// //       },
// //       { $unwind: { path: "$status", preserveNullAndEmptyArrays: true } }
// //     );

// //     // 🔹 Status filter
// //     if (status) {
// //       pipeline.push({ $match: { "status.label": status } });
// //     }

// //     // Count total orders
// //     const totalResult = await Order.aggregate([...pipeline, { $count: "count" }]);
// //     const total = totalResult[0]?.count || 0;

// //     // Pagination
// //     pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });

// //     // Lookup items
// //     pipeline.push(
// //       {
// //         $lookup: {
// //           from: "orderitems",
// //           localField: "_id",
// //           foreignField: "orderId",
// //           as: "items",
// //         },
// //       },
// //       {
// //         $unwind: { path: "$items", preserveNullAndEmptyArrays: true },
// //       },
// //       {
// //         $lookup: {
// //           from: "products",
// //           localField: "items.productId",
// //           foreignField: "_id",
// //           as: "items.product",
// //         },
// //       },
// //       { $unwind: { path: "$items.product", preserveNullAndEmptyArrays: true } },
// //       {
// //         $group: {
// //           _id: "$_id",
// //           orderRandomId: { $first: "$orderRandomId" },
// //           customerId: { $first: "$customerId" },
// //           status: { $first: "$status" },
// //           summary: { $first: "$summary" },
// //           createdBy: { $first: "$createdBy" },
// //           createdAt: { $first: "$createdAt" },
// //           updatedAt: { $first: "$updatedAt" },
// //           items: {
// //             $push: {
// //               $cond: [
// //                 { $ifNull: ["$items._id", false] },
// //                 {
// //                   id: "$items._id",
// //                   quantity: "$items.quantity",
// //                   product: {
// //                     id: "$items.product._id",
// //                     name: "$items.product.name",
// //                     price: "$items.product.price",
// //                   },
// //                 },
// //                 "$$REMOVE",
// //               ],
// //             },
// //           },
// //         },
// //       }
// //     );

// //     const orders = await Order.aggregate(pipeline);

// //     if (!orders.length) {
// //       return res.json({ data: [], total, page, totalPages: 0 });
// //     }

// //     // Format final response
// //     const data = orders.map((o) => ({
// //       id: o._id.toString(),
// //       orderId: o.orderRandomId,
// //       customerId: o.customerId,
// //       status: o.status?.label || "PENDING",
// //       summary: o.summary || "",
// //       createdBy: o.createdBy,
// //       createdAt: o.createdAt,
// //       updatedAt: o.updatedAt,
// //       items: o.items || [],
// //     }));

// //     return res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
// //   } catch (error) {
// //     console.error("GET ORDERS BY CUSTOMER ERROR:", error);
// //     return res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };


// // import type { Response } from "express";
// // import type { AuthRequest } from "../../../types/auth.js";
// // import mongoose from "mongoose";
// // import Order from "../order/order.model.js";
// // import OrderItem from "../orderitem/order-item.model.js";
// // import Product from "../product/product.model.js";
// // import { getIO } from "../../../socket/socket.js";

// // /* =========================
// //    HELPERS
// // ========================= */
// // const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
// //   if (!req.userId) return null;
// //   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
// //   return new mongoose.Types.ObjectId(req.userId);
// // };

// // const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
// //   if (typeof id !== "string") return null;
// //   if (!mongoose.Types.ObjectId.isValid(id)) return null;
// //   return new mongoose.Types.ObjectId(id);
// // };

// // const normalizeQuantity = (
// //   quantity: number,
// //   unit: string
// // ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
// //   switch (unit.toUpperCase()) {
// //     case "GRAM":
// //       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
// //     case "KG":
// //       return { normalizedQty: quantity, baseUnit: "KG" };
// //     case "ML":
// //       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
// //     case "LITER":
// //       return { normalizedQty: quantity, baseUnit: "LITER" };
// //     default:
// //       throw new Error("Unsupported unit");
// //   }
// // };

// // /**
// //  * =========================
// //  * CREATE ORDER (with items)
// //  * =========================
// //  */
// // export const createOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const { customerId, statusId, items, summary } = req.body;

// //   if (!Array.isArray(items) || items.length === 0) {
// //     return res.status(400).json({ message: "Order items required" });
// //   }

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     // ✅ CREATE ORDER
// //     const [order] = await Order.create(
// //       [
// //         {
// //           orderRandomId: Math.floor(100000 + Math.random() * 900000),
// //           customerId,
// //           statusId,
// //           summary,
// //           createdBy: userId,
// //         },
// //       ],
// //       { session }
// //     );

// //     if (!order) throw new Error("Order creation failed");

// //     // ✅ CREATE ORDER ITEMS
// //     // const orderItems = items.map((item: any) => ({
// //     //   orderId: order._id,
// //     //   productId: item.productId,
// //     //   quantity: item.quantity,
// //     //   createdBy: userId,
// //     // }));

// //     const orderItems = items.map((item: any) => ({
// //   orderId: order._id,
// //   productId: item.productId,
// //   quantity: item.quantity,
// //   createdBy: userId,
// // }));


// //     await OrderItem.insertMany(orderItems, { session });

// //     // ✅ FIND PRODUCT OWNERS
// //     const productIds = items.map((i: any) => i.productId);

// //     const products = await Product.find(
// //       { _id: { $in: productIds } },
// //       { ownerId: 1 }
// //     ).session(session);

// //     // ✅ SOCKET NOTIFICATION
// //     const io = getIO();

// //     if (io) {
// //       const ownerIds = [
// //         ...new Set(
// //           products
// //             .map((p) => p.ownerId?.toString())
// //             .filter(Boolean)
// //         ),
// //       ];

// //       ownerIds.forEach((ownerId) => {
// //         io.to(ownerId).emit("new-order", {
// //           orderId: order._id.toString(),
// //           orderRandomId: order.orderRandomId,
// //           summary: order.summary,
// //           createdAt: order.createdAt,
// //         });
// //       });
// //     }

// //     await session.commitTransaction();

// //     return res.status(201).json({
// //       message: "Order created successfully",
// //       id: order._id,
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("CREATE ORDER ERROR:", error);
// //     return res.status(500).json({ message: "Order creation failed" });

// //   } finally {
// //     session.endSession();
// //   }
// // };


// // /**
// //  * =========================
// //  * UPDATE ORDER (with items)
// //  * =========================
// //  */
// // export const updateOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   const { statusId, summary, items } = req.body;

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const order = await Order.findOneAndUpdate(
// //       { _id: orderId, isDeleted: false },
// //       {
// //         ...(statusId && { statusId }),
// //         ...(summary && { summary }),
// //         updatedBy: userId,
// //       },
// //       { new: true, session }
// //     );

// //     if (!order) {
// //       await session.abortTransaction();
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     if (items) {
// //       if (!Array.isArray(items) || items.length === 0) {
// //         await session.abortTransaction();
// //         return res
// //           .status(400)
// //           .json({ message: "Order items must be a non-empty array" });
// //       }

// //       await OrderItem.updateMany(
// //         { orderId },
// //         {
// //           isDeleted: true,
// //           deletedAt: new Date(),
// //           deletedBy: userId,
// //         },
// //         { session }
// //       );

// //       const newItems = items.map((item: any) => ({
// //         orderId,
// //         productId: item.productId,
// //         quantity: item.quantity,
// //         createdBy: userId,
// //       }));

// //       await OrderItem.insertMany(newItems, { session });
// //     }

// //     await session.commitTransaction();
// //     return res.json({
// //       message: "Order updated successfully",
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("UPDATE ORDER ERROR:", error);
// //     return res.status(500).json({ message: "Order update failed" });
// //   } finally {
// //     session.endSession();
// //   }
// // };


// // /**
// //  * =========================
// //  * GET ORDER LIST
// //  * =========================
// //  */
// // export const getAllOrders = async (req: AuthRequest, res: Response) => {
// //   try {
// //     const page = Math.max(Number(req.query.page) || 1, 1);
// //     const limit = Math.max(Number(req.query.limit) || 10, 1);
// //     const skip = (page - 1) * limit;

// //     const filter = { isDeleted: false };

// //     // 1️⃣ Fetch orders
// //     const [total, orders] = await Promise.all([
// //       Order.countDocuments(filter),
// //       Order.find(filter)
// //         .populate("statusId", "label")
// //         .sort({ createdAt: -1 })
// //         .skip(skip)
// //         .limit(limit),
// //     ]);

// //     if (orders.length === 0) {
// //       return res.json({
// //         data: [],
// //         total,
// //         page,
// //         totalPages: 0,
// //       });
// //     }

// //     // 2️⃣ Fetch order items
// //     const orderIds = orders.map((o) => o._id);

// //     const orderItems = await OrderItem.find(
// //       { orderId: { $in: orderIds }, isDeleted: false },
// //       { orderId: 1, productId: 1 }
// //     );

// //     // 3️⃣ Fetch products with owners
// //     const productIds = [
// //       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
// //     ].map((id) => new mongoose.Types.ObjectId(id));

// //     const products = await Product.find(
// //       { _id: { $in: productIds } },
// //       { ownerId: 1 }
// //     ).populate("ownerId", "firstName lastName");

// //     // 4️⃣ Map product → owner
// //     const productOwnerMap = new Map<string, any>();

// //     products.forEach((p) => {
// //       if (p.ownerId) {
// //         productOwnerMap.set(p._id.toString(), {
// //           id: (p.ownerId as any)._id,
// //           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
// //         });
// //       }
// //     });

// //     // 5️⃣ Map order → owner (first matching product owner)
// //     const orderOwnerMap = new Map<string, any>();

// //     orderItems.forEach((item) => {
// //       const orderId = item.orderId.toString();
// //       const productId = item.productId?.toString();
// //       if (!orderOwnerMap.has(orderId) && productId) {
// //         const owner = productOwnerMap.get(productId);
// //         if (owner) orderOwnerMap.set(orderId, owner);
// //       }
// //     });

// //     // 6️⃣ Final response
// //     const data = orders.map((o) => ({
// //       id: o._id.toString(),
// //       orderId: o.orderRandomId,
// //       customerId: o.customerId,
// //       status: (o.statusId as any)?.label || "PENDING",
// //       summary: o.summary || "",
// //       createdAt: o.createdAt,
// //       updatedAt: o.updatedAt,

// //       // ✅ OWNER INFO (ADMIN)
// //       owner: orderOwnerMap.get(o._id.toString()) || null,
// //     }));

// //     return res.json({
// //       data,
// //       total,
// //       page,
// //       totalPages: Math.ceil(total / limit),
// //     });
// //   } catch (error) {
// //     console.error("GET ORDERS ERROR:", error);
// //     return res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };




// // /**
// //  * =========================
// //  * GET ORDER BY ID
// //  * =========================
// //  */
// // export const getOrderById = async (req: AuthRequest, res: Response) => {
// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   const order = await Order.findOne({
// //     _id: orderId,
// //     isDeleted: false,
// //   })
// //     .populate("customerId", "name")
// //     .populate("statusId", "label");

// //   if (!order) {
// //     return res.status(404).json({ message: "Order not found" });
// //   }

// //   const items = await OrderItem.find({
// //     orderId,
// //     isDeleted: false,
// //   }).populate("productId", "name price");

// //   return res.json({
// //     order: {
// //       id: order._id.toString(),
// //       orderId: order.orderRandomId,
// //       customerId:
// //         typeof order.customerId === "object"
// //           ? (order.customerId as any)._id
// //           : order.customerId,
// //       status: (order.statusId as any)?.label || "PENDING",
// //       summary: order.summary || "",
// //       createdAt: order.createdAt,
// //       updatedAt: order.updatedAt,
// //     },
// //     items: items
// //       .filter((i) => i.productId)
// //       .map((i) => ({
// //         id: i._id.toString(),
// //         quantity: i.quantity,
// //         product: {
// //           id: (i.productId as any)._id.toString(),
// //           name: (i.productId as any).name,
// //           price: (i.productId as any).price,
// //         },
// //       })),
// //   });
// // };

// // /**
// //  * =========================
// //  * DELETE ORDER (SOFT)
// //  * =========================
// //  */
// // export const deleteOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   await Order.findByIdAndUpdate(orderId, {
// //     isDeleted: true,
// //     deletedAt: new Date(),
// //     deletedBy: userId,
// //   });

// //   await OrderItem.updateMany(
// //     { orderId },
// //     { isDeleted: true, deletedAt: new Date() }
// //   );

// //   return res.json({
// //     message: "Order deleted successfully",
// //   });

// // };

// // /* =========================
// //    GET ORDERS BY OWNER ID
// // ========================= */
// // export const getOrdersByOwnerId = async (
// //   req: AuthRequest,
// //   res: Response
// // ) => {
// //   try {
// //     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

// //     // 1️⃣ Products owned by logged-in owner
// //     const products = await Product.find(
// //       { ownerId: ownerObjectId, isDeleted: false },
// //       { _id: 1 }
// //     );

// //     if (products.length === 0) {
// //       return res.json({ total: 0, data: [] });
// //     }

// //     const productIds = products.map((p) => p._id);

// //     // 2️⃣ OrderItems using those products
// //     const orderItems = await OrderItem.find(
// //       { productId: { $in: productIds }, isDeleted: false },
// //       { orderId: 1 }
// //     );

// //     if (orderItems.length === 0) {
// //       return res.json({ total: 0, data: [] });
// //     }

// //     const orderIds = [
// //       ...new Set(orderItems.map((i) => i.orderId.toString())),
// //     ].map((id) => new mongoose.Types.ObjectId(id));

// //     // 3️⃣ Orders
// //     const orders = await Order.find({
// //       _id: { $in: orderIds },
// //       isDeleted: false,
// //     })
// //       .populate("statusId", "label")
// //       .sort({ createdAt: -1 });

// //     const data = orders.map((o) => ({
// //       id: o._id.toString(),
// //       orderId: o.orderRandomId,
// //       customerId: o.customerId,
// //       status: (o.statusId as any)?.label || "PENDING",
// //       summary: o.summary || "",
// //       createdAt: o.createdAt,
// //       updatedAt: o.updatedAt,
// //     }));

// //     return res.json({
// //       total: data.length,
// //       data,
// //     });
// //   } catch (error) {
// //     console.error("GET ORDERS BY OWNER ERROR:", error);
// //     return res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };


// // import type { Response } from "express";
// // import type { AuthRequest } from "../../../types/auth.js";
// // import mongoose from "mongoose";
// // import Order from "../order/order.model.js";
// // import OrderItem from "../orderitem/order-item.model.js";
// // import Product from "../product/product.model.js";
// // import { getIO } from "../../../socket/socket.js";

// // /* =========================
// //    HELPERS
// // ========================= */
// // const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
// //   if (!req.userId) return null;
// //   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
// //   return new mongoose.Types.ObjectId(req.userId);
// // };

// // const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
// //   if (typeof id !== "string") return null;
// //   if (!mongoose.Types.ObjectId.isValid(id)) return null;
// //   return new mongoose.Types.ObjectId(id);
// // };

// // const normalizeQuantity = (
// //   quantity: number,
// //   unit: string
// // ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
// //   switch (unit.toUpperCase()) {
// //     case "GRAM":
// //       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
// //     case "KG":
// //       return { normalizedQty: quantity, baseUnit: "KG" };
// //     case "ML":
// //       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
// //     case "LITER":
// //       return { normalizedQty: quantity, baseUnit: "LITER" };
// //     default:
// //       throw new Error("Unsupported unit");
// //   }
// // };

// // /**
// //  * =========================
// //  * CREATE ORDER (with items)
// //  * =========================
// //  */
// // export const createOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) return res.status(401).json({ message: "Unauthorized" });

// //   const { customerId, statusId, items, summary } = req.body;
// //   if (!Array.isArray(items) || items.length === 0) {
// //     return res.status(400).json({ message: "Order items required" });
// //   }

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     /* 1️⃣ Fetch product owners FIRST */
// //     const productIds = items.map((i: any) => i.productId);

// //     const products = await Product.find(
// //       { _id: { $in: productIds } },
// //       { ownerId: 1 }
// //     ).session(session);

// //     if (products.length === 0) {
// //       throw new Error("Products not found");
// //     }

// //     const productOwnerMap = new Map<string, mongoose.Types.ObjectId>();

// //     products.forEach((p) => {
// //       if (p.ownerId) {
// //         productOwnerMap.set(p._id.toString(), p.ownerId);
// //       }
// //     });

// //     /* ✅ Choose PRIMARY SHOP OWNER (first product owner) */
// //     const primaryOwnerId = productOwnerMap.values().next().value;
// //     if (!primaryOwnerId) {
// //       throw new Error("Product owner not found");
// //     }

// //     /* 2️⃣ Create order (SHOP OWNER is creator) */
// //     const createdOrders = await Order.create(
// //       [
// //         {
// //           orderRandomId: Math.floor(100000 + Math.random() * 900000),
// //           customerId,
// //           statusId,
// //           summary,
// //           createdBy: primaryOwnerId, // ✅ SHOP OWNER
// //         },
// //       ],
// //       { session }
// //     );

// //     const order = createdOrders[0];
// //     if (!order) throw new Error("Order creation failed");

// //     /* 3️⃣ Create order items (per product owner) */
// //     const orderItems = items.map((item: any) => {
// //       const ownerId = productOwnerMap.get(item.productId.toString());
// //       if (!ownerId) throw new Error("Product owner not found");

// //       return {
// //         orderId: order._id,
// //         productId: item.productId,
// //         quantity: item.quantity,

// //         ownerId,                 // shop owner
// //         createdBy: ownerId,      // shop owner
// //         ownerCreatedAt: new Date(),
// //       };
// //     });

// //     await OrderItem.insertMany(orderItems, { session });

// //     /* 4️⃣ Notify shop owners */
// //     const io = getIO();
// //     if (io) {
// //       [...new Set(products.map(p => p.ownerId?.toString()))]
// //         .filter(Boolean)
// //         .forEach(ownerId => {
// //           io.to(ownerId!).emit("new-order", {
// //             orderId: order._id.toString(),
// //             orderRandomId: order.orderRandomId,
// //             summary: order.summary,
// //             createdAt: order.createdAt,
// //           });
// //         });
// //     }

// //     await session.commitTransaction();

// //     return res.status(201).json({
// //       message: "Order created successfully",
// //       id: order._id,
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("CREATE ORDER ERROR:", error);
// //     return res.status(500).json({ message: "Order creation failed" });
// //   } finally {
// //     session.endSession();
// //   }
// // };


// // /**
// //  * =========================
// //  * UPDATE ORDER (with items)
// //  * =========================
// //  */
// // export const updateOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   const { statusId, summary, items } = req.body;

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const order = await Order.findOneAndUpdate(
// //       { _id: orderId, isDeleted: false },
// //       {
// //         ...(statusId && { statusId }),
// //         ...(summary && { summary }),
// //         updatedBy: userId,
// //       },
// //       { new: true, session }
// //     );

// //     if (!order) {
// //       await session.abortTransaction();
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     if (items) {
// //       if (!Array.isArray(items) || items.length === 0) {
// //         await session.abortTransaction();
// //         return res
// //           .status(400)
// //           .json({ message: "Order items must be a non-empty array" });
// //       }

// //       await OrderItem.updateMany(
// //         { orderId },
// //         {
// //           isDeleted: true,
// //           deletedAt: new Date(),
// //           deletedBy: userId,
// //         },
// //         { session }
// //       );

// //       const newItems = items.map((item: any) => ({
// //         orderId,
// //         productId: item.productId,
// //         quantity: item.quantity,
// //         createdBy: userId,
// //       }));

// //       await OrderItem.insertMany(newItems, { session });
// //     }

// //     await session.commitTransaction();
// //     return res.json({
// //       message: "Order updated successfully",
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("UPDATE ORDER ERROR:", error);
// //     return res.status(500).json({ message: "Order update failed" });
// //   } finally {
// //     session.endSession();
// //   }
// // };


// // /**
// //  * =========================
// //  * GET ORDER LIST
// //  * =========================
// //  */
// // export const getAllOrders = async (req: AuthRequest, res: Response) => {
// //   try {
// //     const page = Math.max(Number(req.query.page) || 1, 1);
// //     const limit = Math.max(Number(req.query.limit) || 10, 1);
// //     const skip = (page - 1) * limit;

// //     const filter = { isDeleted: false };

// //     // 1️⃣ Fetch orders
// //     const [total, orders] = await Promise.all([
// //       Order.countDocuments(filter),
// //       Order.find(filter)
// //         .populate("statusId", "label")
// //         .sort({ createdAt: -1 })
// //         .skip(skip)
// //         .limit(limit),
// //     ]);

// //     if (orders.length === 0) {
// //       return res.json({
// //         data: [],
// //         total,
// //         page,
// //         totalPages: 0,
// //       });
// //     }

// //     // 2️⃣ Fetch order items
// //     const orderIds = orders.map((o) => o._id);

// //     const orderItems = await OrderItem.find(
// //       { orderId: { $in: orderIds }, isDeleted: false },
// //       { orderId: 1, productId: 1 }
// //     );

// //     // 3️⃣ Fetch products with owners
// //     const productIds = [
// //       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
// //     ].map((id) => new mongoose.Types.ObjectId(id));

// //     const products = await Product.find(
// //       { _id: { $in: productIds } },
// //       { ownerId: 1 }
// //     ).populate("ownerId", "firstName lastName");

// //     // 4️⃣ Map product → owner
// //     const productOwnerMap = new Map<string, any>();

// //     products.forEach((p) => {
// //       if (p.ownerId) {
// //         productOwnerMap.set(p._id.toString(), {
// //           id: (p.ownerId as any)._id,
// //           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
// //         });
// //       }
// //     });

// //     // 5️⃣ Map order → owner (first matching product owner)
// //     const orderOwnerMap = new Map<string, any>();

// //     orderItems.forEach((item) => {
// //       const orderId = item.orderId.toString();
// //       const productId = item.productId?.toString();
// //       if (!orderOwnerMap.has(orderId) && productId) {
// //         const owner = productOwnerMap.get(productId);
// //         if (owner) orderOwnerMap.set(orderId, owner);
// //       }
// //     });

// //     // 6️⃣ Final response
// //     const data = orders.map((o) => ({
// //       id: o._id.toString(),
// //       orderId: o.orderRandomId,
// //       customerId: o.customerId,
// //       status: (o.statusId as any)?.label || "PENDING",
// //       summary: o.summary || "",
// //       createdAt: o.createdAt,
// //       updatedAt: o.updatedAt,

// //       // ✅ OWNER INFO (ADMIN)
// //       owner: orderOwnerMap.get(o._id.toString()) || null,
// //     }));

// //     return res.json({
// //       data,
// //       total,
// //       page,
// //       totalPages: Math.ceil(total / limit),
// //     });
// //   } catch (error) {
// //     console.error("GET ORDERS ERROR:", error);
// //     return res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };




// // /**
// //  * =========================
// //  * GET ORDER BY ID
// //  * =========================
// //  */
// // export const getOrderById = async (req: AuthRequest, res: Response) => {
// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   const order = await Order.findOne({
// //     _id: orderId,
// //     isDeleted: false,
// //   })
// //     .populate("customerId", "name")
// //     .populate("statusId", "label");

// //   if (!order) {
// //     return res.status(404).json({ message: "Order not found" });
// //   }

// //   const items = await OrderItem.find({
// //     orderId,
// //     isDeleted: false,
// //   }).populate("productId", "name price");

// //   return res.json({
// //     order: {
// //       id: order._id.toString(),
// //       orderId: order.orderRandomId,
// //       customerId:
// //         typeof order.customerId === "object"
// //           ? (order.customerId as any)._id
// //           : order.customerId,
// //       status: (order.statusId as any)?.label || "PENDING",
// //       summary: order.summary || "",
// //       createdAt: order.createdAt,
// //       updatedAt: order.updatedAt,
// //     },
// //     items: items
// //       .filter((i) => i.productId)
// //       .map((i) => ({
// //         id: i._id.toString(),
// //         quantity: i.quantity,
// //         product: {
// //           id: (i.productId as any)._id.toString(),
// //           name: (i.productId as any).name,
// //           price: (i.productId as any).price,
// //         },
// //       })),
// //   });
// // };

// // /**
// //  * =========================
// //  * DELETE ORDER (SOFT)
// //  * =========================
// //  */
// // export const deleteOrder = async (req: AuthRequest, res: Response) => {
// //   const userId = getUserObjectId(req);
// //   if (!userId) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const orderId = getParamObjectId(req.params.id);
// //   if (!orderId) {
// //     return res.status(400).json({ message: "Invalid order ID" });
// //   }

// //   await Order.findByIdAndUpdate(orderId, {
// //     isDeleted: true,
// //     deletedAt: new Date(),
// //     deletedBy: userId,
// //   });

// //   await OrderItem.updateMany(
// //     { orderId },
// //     { isDeleted: true, deletedAt: new Date() }
// //   );

// //   return res.json({
// //     message: "Order deleted successfully",
// //   });

// // };

// // /* =========================
// //    GET ORDERS BY OWNER ID
// // ========================= */
// // export const getOrdersByOwnerId = async (
// //   req: AuthRequest,
// //   res: Response
// // ) => {
// //   try {
// //     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

// //     // 1️⃣ Products owned by logged-in owner
// //     const products = await Product.find(
// //       { ownerId: ownerObjectId, isDeleted: false },
// //       { _id: 1 }
// //     );

// //     if (products.length === 0) {
// //       return res.json({ total: 0, data: [] });
// //     }

// //     const productIds = products.map((p) => p._id);

// //     // 2️⃣ OrderItems using those products
// //     const orderItems = await OrderItem.find(
// //       { productId: { $in: productIds }, isDeleted: false },
// //       { orderId: 1 }
// //     );

// //     if (orderItems.length === 0) {
// //       return res.json({ total: 0, data: [] });
// //     }

// //     const orderIds = [
// //       ...new Set(orderItems.map((i) => i.orderId.toString())),
// //     ].map((id) => new mongoose.Types.ObjectId(id));

// //     // 3️⃣ Orders
// //     const orders = await Order.find({
// //       _id: { $in: orderIds },
// //       isDeleted: false,
// //     })
// //       .populate("statusId", "label")
// //       .sort({ createdAt: -1 });

// //     const data = orders.map((o) => ({
// //       id: o._id.toString(),
// //       orderId: o.orderRandomId,
// //       customerId: o.customerId,
// //       status: (o.statusId as any)?.label || "PENDING",
// //       summary: o.summary || "",
// //       createdAt: o.createdAt,
// //       updatedAt: o.updatedAt,
// //     }));

// //     return res.json({
// //       total: data.length,
// //       data,
// //     });
// //   } catch (error) {
// //     console.error("GET ORDERS BY OWNER ERROR:", error);
// //     return res.status(500).json({ message: "Failed to fetch orders" });
// //   }
// // };

// import type { Response } from "express";
// import type { AuthRequest } from "../../../types/auth.js";
// import mongoose from "mongoose";
// import Order from "../order/order.model.js";
// import OrderItem from "../orderitem/order-item.model.js";
// import Product from "../product/product.model.js";
// import { getIO } from "../../../socket/socket.js";
// import CustomerSummary from "../customers/customer.model.js";
// import { create } from "node:domain";

// /* =========================
//    HELPERS
// ========================= */
// const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
//   if (!req.userId) return null;
//   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
//   return new mongoose.Types.ObjectId(req.userId);
// };

// const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
//   if (typeof id !== "string") return null;
//   if (!mongoose.Types.ObjectId.isValid(id)) return null;
//   return new mongoose.Types.ObjectId(id);
// };

// const normalizeQuantity = (
//   quantity: number,
//   unit: string
// ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
//   switch (unit.toUpperCase()) {
//     case "GRAM":
//       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
//     case "KG":
//       return { normalizedQty: quantity, baseUnit: "KG" };
//     case "ML":
//       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
//     case "LITER":
//       return { normalizedQty: quantity, baseUnit: "LITER" };
//     default:
//       throw new Error("Unsupported unit");
//   }
// };

// /**
//  * =========================
//  * CREATE ORDER (with items)
//  * =========================
//  */
// export const createOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) return res.status(401).json({ message: "Unauthorized" });

//   const { customerId, statusId, items, summary } = req.body;
//   if (!Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "Order items required" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     /* 1️⃣ Fetch product owners FIRST */
//     const productIds = items.map((i: any) => i.productId);
//     const products = await Product.find(
//       { _id: { $in: productIds } },
//       { ownerId: 1 }
//     ).session(session);

//     if (products.length === 0) {
//       throw new Error("Products not found");
//     }

//     const productOwnerMap = new Map<string, mongoose.Types.ObjectId>();
//     products.forEach((p) => {
//       if (p.ownerId) {
//         productOwnerMap.set(p._id.toString(), p.ownerId);
//       }
//     });

//     /* ✅ Choose PRIMARY SHOP OWNER (first product owner) */
//     const primaryOwnerId = productOwnerMap.values().next().value || userId;

//     /* 2️⃣ Create order (SHOP OWNER as creator) */
//     const [order] = await Order.create(
//       [
//         {
//           orderRandomId: Math.floor(100000 + Math.random() * 900000),
//           customerId,
//           statusId,
//           summary,
//           createdBy: primaryOwnerId, // product owner or fallback to user
//         },
//       ],
//       { session }
//     );

//     if (!order) throw new Error("Order creation failed");

//     /* 3️⃣ Create order items (per product owner) */
//     const orderItems = items.map((item: any) => {
//       const ownerId = productOwnerMap.get(item.productId.toString()) || userId;

//       return {
//         orderId: order._id,
//         productId: item.productId,
//         quantity: item.quantity,
//         ownerId,                 // product owner
//         createdBy: ownerId,      // product owner
//         ownerCreatedAt: new Date(),
//       };
//     });

//     await OrderItem.insertMany(orderItems, { session });

//     /* 4️⃣ Update CustomerSummary: lastOrderOn & shopOwner */
//     await CustomerSummary.findByIdAndUpdate(
//       customerId,
//       {
//         lastOrderOn: order._id,
//         shopOwner: primaryOwnerId,
//       },
//       { session, new: true }
//     );

//     /* 5️⃣ Notify all product owners */
//     /* 5️⃣ Notify all product owners with FULL DATA */
//     const io = getIO();

//     if (io) {
//       // 🔹 Fetch customer
//       const customer = await CustomerSummary.findById(customerId, { name: 1 });

//       // 🔹 Fetch products (name + price)
//       const productDetails = await Product.find(
//         { _id: { $in: productIds } },
//         { name: 1, price: 1 }
//       );

//       // 🔹 Create product map
//       const productMap = new Map<string, any>();
//       productDetails.forEach((p) => {
//         productMap.set(p._id.toString(), p);
//       });

//       // 🔹 Build detailed product array
//       let totalAmount = 0;

//       const detailedItems = items.map((item: any) => {
//         const product = productMap.get(item.productId.toString());

//         const price = product?.price || 0;
//         const quantity = item.quantity;
//         const total = price * quantity;

//         totalAmount += total;

//         return {
//           productId: item.productId,
//           name: product?.name || "Unknown",
//           price,
//           quantity,
//           total,
//         };
//       });

//       const notificationPayload = {
//         id: order._id.toString(),
//         orderId: order.orderRandomId,
//         customerName: customer?.name || "Unknown",
//         items: detailedItems,        // ✅ full product details
//         totalAmount,                 // ✅ grand total
//         summary: order.summary || "",
//         createdAt: order.createdAt,
//       };

//       // 🔹 Emit to all unique shop owners
//       [...new Set(products.map((p) => p.ownerId?.toString()))]
//         .filter(Boolean)
//         .forEach((ownerId) => {
//           io.to(ownerId!).emit("new-order", notificationPayload);
//         });
//     }



//     await session.commitTransaction();

//     return res.status(201).json({
//       message: "Order created successfully",
//       id: order._id,
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error("CREATE ORDER ERROR:", error);
//     return res.status(500).json({ message: "Order creation failed" });
//   } finally {
//     session.endSession();
//   }
// };


// /**
//  * =========================
//  * UPDATE ORDER (with items)
//  * =========================
//  */
// export const updateOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   const { statusId, summary, items } = req.body;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const order = await Order.findOneAndUpdate(
//       { _id: orderId, isDeleted: false },
//       {
//         ...(statusId && { statusId }),
//         ...(summary && { summary }),
//         updatedBy: userId,
//       },
//       { new: true, session }
//     );

//     if (!order) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (items) {
//       if (!Array.isArray(items) || items.length === 0) {
//         await session.abortTransaction();
//         return res
//           .status(400)
//           .json({ message: "Order items must be a non-empty array" });
//       }

//       await OrderItem.updateMany(
//         { orderId },
//         {
//           isDeleted: true,
//           deletedAt: new Date(),
//           deletedBy: userId,
//         },
//         { session }
//       );

//       const newItems = items.map((item: any) => ({
//         orderId,
//         productId: item.productId,
//         quantity: item.quantity,
//         createdBy: userId,
//       }));

//       await OrderItem.insertMany(newItems, { session });
//     }

//     await session.commitTransaction();
//     return res.json({
//       message: "Order updated successfully",
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error("UPDATE ORDER ERROR:", error);
//     return res.status(500).json({ message: "Order update failed" });
//   } finally {
//     session.endSession();
//   }
// };


// /**
//  * =========================
//  * GET ORDER LIST
//  * =========================
//  */
// export const getAllOrders = async (req: AuthRequest, res: Response) => {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const skip = (page - 1) * limit;

//     const filter = { isDeleted: false };

//     // 1️⃣ Fetch orders
//     const [total, orders] = await Promise.all([
//       Order.countDocuments(filter),
//       Order.find(filter)
//         .populate("statusId", "label")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//     ]);

//     if (orders.length === 0) {
//       return res.json({
//         data: [],
//         total,
//         page,
//         totalPages: 0,
//       });
//     }

//     // 2️⃣ Fetch order items
//     const orderIds = orders.map((o) => o._id);

//     const orderItems = await OrderItem.find(
//       { orderId: { $in: orderIds }, isDeleted: false },
//       { orderId: 1, productId: 1 }
//     );

//     // 3️⃣ Fetch products with owners
//     const productIds = [
//       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
//     ].map((id) => new mongoose.Types.ObjectId(id));

//     const products = await Product.find(
//       { _id: { $in: productIds } },
//       { ownerId: 1 }
//     ).populate("ownerId", "firstName lastName");

//     // 4️⃣ Map product → owner
//     const productOwnerMap = new Map<string, any>();

//     products.forEach((p) => {
//       if (p.ownerId) {
//         productOwnerMap.set(p._id.toString(), {
//           id: (p.ownerId as any)._id,
//           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
//         });
//       }
//     });

//     // 5️⃣ Map order → owner (first matching product owner)
//     const orderOwnerMap = new Map<string, any>();

//     orderItems.forEach((item) => {
//       const orderId = item.orderId.toString();
//       const productId = item.productId?.toString();
//       if (!orderOwnerMap.has(orderId) && productId) {
//         const owner = productOwnerMap.get(productId);
//         if (owner) orderOwnerMap.set(orderId, owner);
//       }
//     });

//     // 6️⃣ Final response
//     const data = orders.map((o) => ({
//       id: o._id.toString(),
//       orderId: o.orderRandomId,
//       customerId: o.customerId,
//       status: (o.statusId as any)?.label || "PENDING",
//       summary: o.summary || "",
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt,

//       // ✅ OWNER INFO (ADMIN)
//       owner: orderOwnerMap.get(o._id.toString()) || null,
//     }));

//     return res.json({
//       data,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     console.error("GET ORDERS ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };




// /**
//  * =========================
//  * GET ORDER BY ID
//  * =========================
//  */
// export const getOrderById = async (req: AuthRequest, res: Response) => {
//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   const order = await Order.findOne({
//     _id: orderId,
//     isDeleted: false,
//   })
//     .populate("customerId", "name")
//     .populate("statusId", "label");

//   if (!order) {
//     return res.status(404).json({ message: "Order not found" });
//   }

//   const items = await OrderItem.find({
//     orderId,
//     isDeleted: false,
//   }).populate("productId", "name price");

//   return res.json({
//     order: {
//       id: order._id.toString(),
//       orderId: order.orderRandomId,
//       customerId:
//         typeof order.customerId === "object"
//           ? (order.customerId as any)._id
//           : order.customerId,
//       status: (order.statusId as any)?.label || "PENDING",
//       summary: order.summary || "",
//       createdAt: order.createdAt,
//       updatedAt: order.updatedAt,
//     },
//     items: items
//       .filter((i) => i.productId)
//       .map((i) => ({
//         id: i._id.toString(),
//         quantity: i.quantity,
//         product: {
//           id: (i.productId as any)._id.toString(),
//           name: (i.productId as any).name,
//           price: (i.productId as any).price,
//         },
//       })),
//   });
// };

// /**
//  * =========================
//  * DELETE ORDER (SOFT)
//  * =========================
//  */
// export const deleteOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   await Order.findByIdAndUpdate(orderId, {
//     isDeleted: true,
//     deletedAt: new Date(),
//     deletedBy: userId,
//   });

//   await OrderItem.updateMany(
//     { orderId },
//     { isDeleted: true, deletedAt: new Date() }
//   );

//   return res.json({
//     message: "Order deleted successfully",
//   });

// };

// /* =========================
//    GET ORDERS BY OWNER ID
// ========================= */
// export const getOrdersByOwnerId = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

//     // 1️⃣ Products owned by logged-in owner
//     const products = await Product.find(
//       { ownerId: ownerObjectId, isDeleted: false },
//       { _id: 1 }
//     );

//     if (products.length === 0) {
//       return res.json({ total: 0, data: [] });
//     }

//     const productIds = products.map((p) => p._id);

//     // 2️⃣ OrderItems using those products
//     const orderItems = await OrderItem.find(
//       { productId: { $in: productIds }, isDeleted: false },
//       { orderId: 1 }
//     );

//     if (orderItems.length === 0) {
//       return res.json({ total: 0, data: [] });
//     }

//     const orderIds = [
//       ...new Set(orderItems.map((i) => i.orderId.toString())),
//     ].map((id) => new mongoose.Types.ObjectId(id));

//     // 3️⃣ Orders
//     const orders = await Order.find({
//       _id: { $in: orderIds },
//       isDeleted: false,
//     })
//       .populate("statusId", "label")
//       .sort({ createdAt: -1 });

//     const data = orders.map((o) => ({
//       id: o._id.toString(),
//       orderId: o.orderRandomId,
//       customerId: o.customerId,
//       status: (o.statusId as any)?.label || "PENDING",
//       summary: o.summary || "",
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt,
//     }));

//     return res.json({
//       total: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error("GET ORDERS BY OWNER ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };


// export const getOrdersByCustomerId = async (req: AuthRequest, res: Response) => {
//   try {
//     let customerId = req.params.customerId;
//     if (Array.isArray(customerId)) customerId = customerId[0];
//     if (!customerId) return res.status(400).json({ message: "Invalid customer ID" });

//     // Convert to ObjectId
//     let customerObjectId: mongoose.Types.ObjectId;
//     try {
//       customerObjectId = new mongoose.Types.ObjectId(customerId);
//     } catch {
//       return res.status(400).json({ message: "Invalid customer ID format" });
//     }

//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const skip = (page - 1) * limit;

//     const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
//     const status =
//       typeof req.query.status === "string" && req.query.status.toUpperCase() !== "ALL"
//         ? req.query.status
//         : null;

//     /* =========================
//        AGGREGATION PIPELINE
//     ========================= */
//     const pipeline: any[] = [
//       {
//         // Convert string customerId in DB to ObjectId if needed
//         $addFields: {
//           customerIdObj: {
//             $cond: [
//               { $eq: [{ $type: "$customerId" }, "string"] },
//               { $toObjectId: "$customerId" },
//               "$customerId",
//             ],
//           },
//           orderRandomIdStr: { $toString: "$orderRandomId" },
//         },
//       },
//       {
//         $match: {
//           customerIdObj: customerObjectId,
//           isDeleted: false,
//         },
//       },
//     ];

//     // 🔍 Search by orderRandomId (>= 3 chars)
//     if (search.length >= 3) {
//       pipeline.push({
//         $match: { orderRandomIdStr: { $regex: search, $options: "i" } },
//       });
//     }

//     // 🔗 Join status
//     pipeline.push(
//       {
//         $lookup: {
//           from: "orderstatuses",
//           localField: "statusId",
//           foreignField: "_id",
//           as: "status",
//         },
//       },
//       { $unwind: { path: "$status", preserveNullAndEmptyArrays: true } }
//     );

//     // 🔹 Status filter
//     if (status) {
//       pipeline.push({ $match: { "status.label": status } });
//     }

//     // Count total orders
//     const totalResult = await Order.aggregate([...pipeline, { $count: "count" }]);
//     const total = totalResult[0]?.count || 0;

//     // Pagination
//     pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });

//     // Lookup items
//     pipeline.push(
//       {
//         $lookup: {
//           from: "orderitems",
//           localField: "_id",
//           foreignField: "orderId",
//           as: "items",
//         },
//       },
//       {
//         $unwind: { path: "$items", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "items.productId",
//           foreignField: "_id",
//           as: "items.product",
//         },
//       },
//       { $unwind: { path: "$items.product", preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: "$_id",
//           orderRandomId: { $first: "$orderRandomId" },
//           customerId: { $first: "$customerId" },
//           status: { $first: "$status" },
//           summary: { $first: "$summary" },
//           createdBy: { $first: "$createdBy" },
//           createdAt: { $first: "$createdAt" },
//           updatedAt: { $first: "$updatedAt" },
//           items: {
//             $push: {
//               $cond: [
//                 { $ifNull: ["$items._id", false] },
//                 {
//                   id: "$items._id",
//                   quantity: "$items.quantity",
//                   product: {
//                     id: "$items.product._id",
//                     name: "$items.product.name",
//                     price: "$items.product.price",
//                   },
//                 },
//                 "$$REMOVE",
//               ],
//             },
//           },
//         },
//       }
//     );

//     const orders = await Order.aggregate(pipeline);

//     if (!orders.length) {
//       return res.json({ data: [], total, page, totalPages: 0 });
//     }

//     // Format final response
//     const data = orders.map((o) => ({
//       id: o._id.toString(),
//       orderId: o.orderRandomId,
//       customerId: o.customerId,
//       status: o.status?.label || "PENDING",
//       summary: o.summary || "",
//       createdBy: o.createdBy,
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt,
//       items: o.items || [],
//     }));

//     return res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
//   } catch (error) {
//     console.error("GET ORDERS BY CUSTOMER ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

// import type { Response } from "express";
// import type { AuthRequest } from "../../../types/auth.js";
// import mongoose from "mongoose";
// import Order from "../order/order.model.js";
// import OrderItem from "../orderitem/order-item.model.js";
// import Product from "../product/product.model.js";
// import { getIO } from "../../../socket/socket.js";

// /* =========================
//    HELPERS
// ========================= */
// const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
//   if (!req.userId) return null;
//   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
//   return new mongoose.Types.ObjectId(req.userId);
// };

// const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
//   if (typeof id !== "string") return null;
//   if (!mongoose.Types.ObjectId.isValid(id)) return null;
//   return new mongoose.Types.ObjectId(id);
// };

// const normalizeQuantity = (
//   quantity: number,
//   unit: string
// ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
//   switch (unit.toUpperCase()) {
//     case "GRAM":
//       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
//     case "KG":
//       return { normalizedQty: quantity, baseUnit: "KG" };
//     case "ML":
//       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
//     case "LITER":
//       return { normalizedQty: quantity, baseUnit: "LITER" };
//     default:
//       throw new Error("Unsupported unit");
//   }
// };

// /**
//  * =========================
//  * CREATE ORDER (with items)
//  * =========================
//  */
// export const createOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const { customerId, statusId, items, summary } = req.body;

//   if (!Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "Order items required" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // ✅ CREATE ORDER
//     const [order] = await Order.create(
//       [
//         {
//           orderRandomId: Math.floor(100000 + Math.random() * 900000),
//           customerId,
//           statusId,
//           summary,
//           createdBy: userId,
//         },
//       ],
//       { session }
//     );

//     if (!order) throw new Error("Order creation failed");

//     // ✅ CREATE ORDER ITEMS
//     // const orderItems = items.map((item: any) => ({
//     //   orderId: order._id,
//     //   productId: item.productId,
//     //   quantity: item.quantity,
//     //   createdBy: userId,
//     // }));

//     const orderItems = items.map((item: any) => ({
//   orderId: order._id,
//   productId: item.productId,
//   quantity: item.quantity,
//   createdBy: userId,
// }));


//     await OrderItem.insertMany(orderItems, { session });

//     // ✅ FIND PRODUCT OWNERS
//     const productIds = items.map((i: any) => i.productId);

//     const products = await Product.find(
//       { _id: { $in: productIds } },
//       { ownerId: 1 }
//     ).session(session);

//     // ✅ SOCKET NOTIFICATION
//     const io = getIO();

//     if (io) {
//       const ownerIds = [
//         ...new Set(
//           products
//             .map((p) => p.ownerId?.toString())
//             .filter(Boolean)
//         ),
//       ];

//       ownerIds.forEach((ownerId) => {
//         io.to(ownerId).emit("new-order", {
//           orderId: order._id.toString(),
//           orderRandomId: order.orderRandomId,
//           summary: order.summary,
//           createdAt: order.createdAt,
//         });
//       });
//     }

//     await session.commitTransaction();

//     return res.status(201).json({
//       message: "Order created successfully",
//       id: order._id,
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error("CREATE ORDER ERROR:", error);
//     return res.status(500).json({ message: "Order creation failed" });

//   } finally {
//     session.endSession();
//   }
// };


// /**
//  * =========================
//  * UPDATE ORDER (with items)
//  * =========================
//  */
// export const updateOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   const { statusId, summary, items } = req.body;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const order = await Order.findOneAndUpdate(
//       { _id: orderId, isDeleted: false },
//       {
//         ...(statusId && { statusId }),
//         ...(summary && { summary }),
//         updatedBy: userId,
//       },
//       { new: true, session }
//     );

//     if (!order) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (items) {
//       if (!Array.isArray(items) || items.length === 0) {
//         await session.abortTransaction();
//         return res
//           .status(400)
//           .json({ message: "Order items must be a non-empty array" });
//       }

//       await OrderItem.updateMany(
//         { orderId },
//         {
//           isDeleted: true,
//           deletedAt: new Date(),
//           deletedBy: userId,
//         },
//         { session }
//       );

//       const newItems = items.map((item: any) => ({
//         orderId,
//         productId: item.productId,
//         quantity: item.quantity,
//         createdBy: userId,
//       }));

//       await OrderItem.insertMany(newItems, { session });
//     }

//     await session.commitTransaction();
//     return res.json({
//       message: "Order updated successfully",
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error("UPDATE ORDER ERROR:", error);
//     return res.status(500).json({ message: "Order update failed" });
//   } finally {
//     session.endSession();
//   }
// };


// /**
//  * =========================
//  * GET ORDER LIST
//  * =========================
//  */
// export const getAllOrders = async (req: AuthRequest, res: Response) => {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const skip = (page - 1) * limit;

//     const filter = { isDeleted: false };

//     // 1️⃣ Fetch orders
//     const [total, orders] = await Promise.all([
//       Order.countDocuments(filter),
//       Order.find(filter)
//         .populate("statusId", "label")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//     ]);

//     if (orders.length === 0) {
//       return res.json({
//         data: [],
//         total,
//         page,
//         totalPages: 0,
//       });
//     }

//     // 2️⃣ Fetch order items
//     const orderIds = orders.map((o) => o._id);

//     const orderItems = await OrderItem.find(
//       { orderId: { $in: orderIds }, isDeleted: false },
//       { orderId: 1, productId: 1 }
//     );

//     // 3️⃣ Fetch products with owners
//     const productIds = [
//       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
//     ].map((id) => new mongoose.Types.ObjectId(id));

//     const products = await Product.find(
//       { _id: { $in: productIds } },
//       { ownerId: 1 }
//     ).populate("ownerId", "firstName lastName");

//     // 4️⃣ Map product → owner
//     const productOwnerMap = new Map<string, any>();

//     products.forEach((p) => {
//       if (p.ownerId) {
//         productOwnerMap.set(p._id.toString(), {
//           id: (p.ownerId as any)._id,
//           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
//         });
//       }
//     });

//     // 5️⃣ Map order → owner (first matching product owner)
//     const orderOwnerMap = new Map<string, any>();

//     orderItems.forEach((item) => {
//       const orderId = item.orderId.toString();
//       const productId = item.productId?.toString();
//       if (!orderOwnerMap.has(orderId) && productId) {
//         const owner = productOwnerMap.get(productId);
//         if (owner) orderOwnerMap.set(orderId, owner);
//       }
//     });

//     // 6️⃣ Final response
//     const data = orders.map((o) => ({
//       id: o._id.toString(),
//       orderId: o.orderRandomId,
//       customerId: o.customerId,
//       status: (o.statusId as any)?.label || "PENDING",
//       summary: o.summary || "",
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt,

//       // ✅ OWNER INFO (ADMIN)
//       owner: orderOwnerMap.get(o._id.toString()) || null,
//     }));

//     return res.json({
//       data,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     console.error("GET ORDERS ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };




// /**
//  * =========================
//  * GET ORDER BY ID
//  * =========================
//  */
// export const getOrderById = async (req: AuthRequest, res: Response) => {
//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   const order = await Order.findOne({
//     _id: orderId,
//     isDeleted: false,
//   })
//     .populate("customerId", "name")
//     .populate("statusId", "label");

//   if (!order) {
//     return res.status(404).json({ message: "Order not found" });
//   }

//   const items = await OrderItem.find({
//     orderId,
//     isDeleted: false,
//   }).populate("productId", "name price");

//   return res.json({
//     order: {
//       id: order._id.toString(),
//       orderId: order.orderRandomId,
//       customerId:
//         typeof order.customerId === "object"
//           ? (order.customerId as any)._id
//           : order.customerId,
//       status: (order.statusId as any)?.label || "PENDING",
//       summary: order.summary || "",
//       createdAt: order.createdAt,
//       updatedAt: order.updatedAt,
//     },
//     items: items
//       .filter((i) => i.productId)
//       .map((i) => ({
//         id: i._id.toString(),
//         quantity: i.quantity,
//         product: {
//           id: (i.productId as any)._id.toString(),
//           name: (i.productId as any).name,
//           price: (i.productId as any).price,
//         },
//       })),
//   });
// };

// /**
//  * =========================
//  * DELETE ORDER (SOFT)
//  * =========================
//  */
// export const deleteOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   await Order.findByIdAndUpdate(orderId, {
//     isDeleted: true,
//     deletedAt: new Date(),
//     deletedBy: userId,
//   });

//   await OrderItem.updateMany(
//     { orderId },
//     { isDeleted: true, deletedAt: new Date() }
//   );

//   return res.json({
//     message: "Order deleted successfully",
//   });

// };

// /* =========================
//    GET ORDERS BY OWNER ID
// ========================= */
// export const getOrdersByOwnerId = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

//     // 1️⃣ Products owned by logged-in owner
//     const products = await Product.find(
//       { ownerId: ownerObjectId, isDeleted: false },
//       { _id: 1 }
//     );

//     if (products.length === 0) {
//       return res.json({ total: 0, data: [] });
//     }

//     const productIds = products.map((p) => p._id);

//     // 2️⃣ OrderItems using those products
//     const orderItems = await OrderItem.find(
//       { productId: { $in: productIds }, isDeleted: false },
//       { orderId: 1 }
//     );

//     if (orderItems.length === 0) {
//       return res.json({ total: 0, data: [] });
//     }

//     const orderIds = [
//       ...new Set(orderItems.map((i) => i.orderId.toString())),
//     ].map((id) => new mongoose.Types.ObjectId(id));

//     // 3️⃣ Orders
//     const orders = await Order.find({
//       _id: { $in: orderIds },
//       isDeleted: false,
//     })
//       .populate("statusId", "label")
//       .sort({ createdAt: -1 });

//     const data = orders.map((o) => ({
//       id: o._id.toString(),
//       orderId: o.orderRandomId,
//       customerId: o.customerId,
//       status: (o.statusId as any)?.label || "PENDING",
//       summary: o.summary || "",
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt,
//     }));

//     return res.json({
//       total: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error("GET ORDERS BY OWNER ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };


// import type { Response } from "express";
// import type { AuthRequest } from "../../../types/auth.js";
// import mongoose from "mongoose";
// import Order from "../order/order.model.js";
// import OrderItem from "../orderitem/order-item.model.js";
// import Product from "../product/product.model.js";
// import { getIO } from "../../../socket/socket.js";

// /* =========================
//    HELPERS
// ========================= */
// const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
//   if (!req.userId) return null;
//   if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
//   return new mongoose.Types.ObjectId(req.userId);
// };

// const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
//   if (typeof id !== "string") return null;
//   if (!mongoose.Types.ObjectId.isValid(id)) return null;
//   return new mongoose.Types.ObjectId(id);
// };

// const normalizeQuantity = (
//   quantity: number,
//   unit: string
// ): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
//   switch (unit.toUpperCase()) {
//     case "GRAM":
//       return { normalizedQty: quantity / 1000, baseUnit: "KG" };
//     case "KG":
//       return { normalizedQty: quantity, baseUnit: "KG" };
//     case "ML":
//       return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
//     case "LITER":
//       return { normalizedQty: quantity, baseUnit: "LITER" };
//     default:
//       throw new Error("Unsupported unit");
//   }
// };

// /**
//  * =========================
//  * CREATE ORDER (with items)
//  * =========================
//  */
// export const createOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) return res.status(401).json({ message: "Unauthorized" });

//   const { customerId, statusId, items, summary } = req.body;
//   if (!Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "Order items required" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     /* 1️⃣ Fetch product owners FIRST */
//     const productIds = items.map((i: any) => i.productId);

//     const products = await Product.find(
//       { _id: { $in: productIds } },
//       { ownerId: 1 }
//     ).session(session);

//     if (products.length === 0) {
//       throw new Error("Products not found");
//     }

//     const productOwnerMap = new Map<string, mongoose.Types.ObjectId>();

//     products.forEach((p) => {
//       if (p.ownerId) {
//         productOwnerMap.set(p._id.toString(), p.ownerId);
//       }
//     });

//     /* ✅ Choose PRIMARY SHOP OWNER (first product owner) */
//     const primaryOwnerId = productOwnerMap.values().next().value;
//     if (!primaryOwnerId) {
//       throw new Error("Product owner not found");
//     }

//     /* 2️⃣ Create order (SHOP OWNER is creator) */
//     const createdOrders = await Order.create(
//       [
//         {
//           orderRandomId: Math.floor(100000 + Math.random() * 900000),
//           customerId,
//           statusId,
//           summary,
//           createdBy: primaryOwnerId, // ✅ SHOP OWNER
//         },
//       ],
//       { session }
//     );

//     const order = createdOrders[0];
//     if (!order) throw new Error("Order creation failed");

//     /* 3️⃣ Create order items (per product owner) */
//     const orderItems = items.map((item: any) => {
//       const ownerId = productOwnerMap.get(item.productId.toString());
//       if (!ownerId) throw new Error("Product owner not found");

//       return {
//         orderId: order._id,
//         productId: item.productId,
//         quantity: item.quantity,

//         ownerId,                 // shop owner
//         createdBy: ownerId,      // shop owner
//         ownerCreatedAt: new Date(),
//       };
//     });

//     await OrderItem.insertMany(orderItems, { session });

//     /* 4️⃣ Notify shop owners */
//     const io = getIO();
//     if (io) {
//       [...new Set(products.map(p => p.ownerId?.toString()))]
//         .filter(Boolean)
//         .forEach(ownerId => {
//           io.to(ownerId!).emit("new-order", {
//             orderId: order._id.toString(),
//             orderRandomId: order.orderRandomId,
//             summary: order.summary,
//             createdAt: order.createdAt,
//           });
//         });
//     }

//     await session.commitTransaction();

//     return res.status(201).json({
//       message: "Order created successfully",
//       id: order._id,
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error("CREATE ORDER ERROR:", error);
//     return res.status(500).json({ message: "Order creation failed" });
//   } finally {
//     session.endSession();
//   }
// };


// /**
//  * =========================
//  * UPDATE ORDER (with items)
//  * =========================
//  */
// export const updateOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   const { statusId, summary, items } = req.body;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const order = await Order.findOneAndUpdate(
//       { _id: orderId, isDeleted: false },
//       {
//         ...(statusId && { statusId }),
//         ...(summary && { summary }),
//         updatedBy: userId,
//       },
//       { new: true, session }
//     );

//     if (!order) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (items) {
//       if (!Array.isArray(items) || items.length === 0) {
//         await session.abortTransaction();
//         return res
//           .status(400)
//           .json({ message: "Order items must be a non-empty array" });
//       }

//       await OrderItem.updateMany(
//         { orderId },
//         {
//           isDeleted: true,
//           deletedAt: new Date(),
//           deletedBy: userId,
//         },
//         { session }
//       );

//       const newItems = items.map((item: any) => ({
//         orderId,
//         productId: item.productId,
//         quantity: item.quantity,
//         createdBy: userId,
//       }));

//       await OrderItem.insertMany(newItems, { session });
//     }

//     await session.commitTransaction();
//     return res.json({
//       message: "Order updated successfully",
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error("UPDATE ORDER ERROR:", error);
//     return res.status(500).json({ message: "Order update failed" });
//   } finally {
//     session.endSession();
//   }
// };


// /**
//  * =========================
//  * GET ORDER LIST
//  * =========================
//  */
// export const getAllOrders = async (req: AuthRequest, res: Response) => {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const skip = (page - 1) * limit;

//     const filter = { isDeleted: false };

//     // 1️⃣ Fetch orders
//     const [total, orders] = await Promise.all([
//       Order.countDocuments(filter),
//       Order.find(filter)
//         .populate("statusId", "label")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//     ]);

//     if (orders.length === 0) {
//       return res.json({
//         data: [],
//         total,
//         page,
//         totalPages: 0,
//       });
//     }

//     // 2️⃣ Fetch order items
//     const orderIds = orders.map((o) => o._id);

//     const orderItems = await OrderItem.find(
//       { orderId: { $in: orderIds }, isDeleted: false },
//       { orderId: 1, productId: 1 }
//     );

//     // 3️⃣ Fetch products with owners
//     const productIds = [
//       ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
//     ].map((id) => new mongoose.Types.ObjectId(id));

//     const products = await Product.find(
//       { _id: { $in: productIds } },
//       { ownerId: 1 }
//     ).populate("ownerId", "firstName lastName");

//     // 4️⃣ Map product → owner
//     const productOwnerMap = new Map<string, any>();

//     products.forEach((p) => {
//       if (p.ownerId) {
//         productOwnerMap.set(p._id.toString(), {
//           id: (p.ownerId as any)._id,
//           name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
//         });
//       }
//     });

//     // 5️⃣ Map order → owner (first matching product owner)
//     const orderOwnerMap = new Map<string, any>();

//     orderItems.forEach((item) => {
//       const orderId = item.orderId.toString();
//       const productId = item.productId?.toString();
//       if (!orderOwnerMap.has(orderId) && productId) {
//         const owner = productOwnerMap.get(productId);
//         if (owner) orderOwnerMap.set(orderId, owner);
//       }
//     });

//     // 6️⃣ Final response
//     const data = orders.map((o) => ({
//       id: o._id.toString(),
//       orderId: o.orderRandomId,
//       customerId: o.customerId,
//       status: (o.statusId as any)?.label || "PENDING",
//       summary: o.summary || "",
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt,

//       // ✅ OWNER INFO (ADMIN)
//       owner: orderOwnerMap.get(o._id.toString()) || null,
//     }));

//     return res.json({
//       data,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     console.error("GET ORDERS ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };




// /**
//  * =========================
//  * GET ORDER BY ID
//  * =========================
//  */
// export const getOrderById = async (req: AuthRequest, res: Response) => {
//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   const order = await Order.findOne({
//     _id: orderId,
//     isDeleted: false,
//   })
//     .populate("customerId", "name")
//     .populate("statusId", "label");

//   if (!order) {
//     return res.status(404).json({ message: "Order not found" });
//   }

//   const items = await OrderItem.find({
//     orderId,
//     isDeleted: false,
//   }).populate("productId", "name price");

//   return res.json({
//     order: {
//       id: order._id.toString(),
//       orderId: order.orderRandomId,
//       customerId:
//         typeof order.customerId === "object"
//           ? (order.customerId as any)._id
//           : order.customerId,
//       status: (order.statusId as any)?.label || "PENDING",
//       summary: order.summary || "",
//       createdAt: order.createdAt,
//       updatedAt: order.updatedAt,
//     },
//     items: items
//       .filter((i) => i.productId)
//       .map((i) => ({
//         id: i._id.toString(),
//         quantity: i.quantity,
//         product: {
//           id: (i.productId as any)._id.toString(),
//           name: (i.productId as any).name,
//           price: (i.productId as any).price,
//         },
//       })),
//   });
// };

// /**
//  * =========================
//  * DELETE ORDER (SOFT)
//  * =========================
//  */
// export const deleteOrder = async (req: AuthRequest, res: Response) => {
//   const userId = getUserObjectId(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const orderId = getParamObjectId(req.params.id);
//   if (!orderId) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   await Order.findByIdAndUpdate(orderId, {
//     isDeleted: true,
//     deletedAt: new Date(),
//     deletedBy: userId,
//   });

//   await OrderItem.updateMany(
//     { orderId },
//     { isDeleted: true, deletedAt: new Date() }
//   );

//   return res.json({
//     message: "Order deleted successfully",
//   });

// };

// /* =========================
//    GET ORDERS BY OWNER ID
// ========================= */
// export const getOrdersByOwnerId = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

//     // 1️⃣ Products owned by logged-in owner
//     const products = await Product.find(
//       { ownerId: ownerObjectId, isDeleted: false },
//       { _id: 1 }
//     );

//     if (products.length === 0) {
//       return res.json({ total: 0, data: [] });
//     }

//     const productIds = products.map((p) => p._id);

//     // 2️⃣ OrderItems using those products
//     const orderItems = await OrderItem.find(
//       { productId: { $in: productIds }, isDeleted: false },
//       { orderId: 1 }
//     );

//     if (orderItems.length === 0) {
//       return res.json({ total: 0, data: [] });
//     }

//     const orderIds = [
//       ...new Set(orderItems.map((i) => i.orderId.toString())),
//     ].map((id) => new mongoose.Types.ObjectId(id));

//     // 3️⃣ Orders
//     const orders = await Order.find({
//       _id: { $in: orderIds },
//       isDeleted: false,
//     })
//       .populate("statusId", "label")
//       .sort({ createdAt: -1 });

//     const data = orders.map((o) => ({
//       id: o._id.toString(),
//       orderId: o.orderRandomId,
//       customerId: o.customerId,
//       status: (o.statusId as any)?.label || "PENDING",
//       summary: o.summary || "",
//       createdAt: o.createdAt,
//       updatedAt: o.updatedAt,
//     }));

//     return res.json({
//       total: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error("GET ORDERS BY OWNER ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

import type { Response } from "express";
import type { AuthRequest } from "../../shared/types/auth.js";
import mongoose from "mongoose";
import Order from "../order/order.model.js";
import OrderItem from "../orderitem/order-item.model.js";
import Product from "../product/product.model.js";
import { getIO } from "../../cors/socket/socket.js";
import CustomerSummary from "../customers/customer.model.js";
import { create } from "node:domain";

/* =========================
   HELPERS
========================= */
const getUserObjectId = (req: AuthRequest): mongoose.Types.ObjectId | null => {
  if (!req.userId) return null;
  if (!mongoose.Types.ObjectId.isValid(req.userId)) return null;
  return new mongoose.Types.ObjectId(req.userId);
};

const getParamObjectId = (id: unknown): mongoose.Types.ObjectId | null => {
  if (typeof id !== "string") return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

const normalizeQuantity = (
  quantity: number,
  unit: string
): { normalizedQty: number; baseUnit: "KG" | "LITER" } => {
  switch (unit.toUpperCase()) {
    case "GRAM":
      return { normalizedQty: quantity / 1000, baseUnit: "KG" };
    case "KG":
      return { normalizedQty: quantity, baseUnit: "KG" };
    case "ML":
      return { normalizedQty: quantity / 1000, baseUnit: "LITER" };
    case "LITER":
      return { normalizedQty: quantity, baseUnit: "LITER" };
    default:
      throw new Error("Unsupported unit");
  }
};

/**
 * =========================
 * CREATE ORDER (with items)
 * =========================
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  const userId = getUserObjectId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { customerId, statusId, items, summary } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order items required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* 1️⃣ Fetch product owners FIRST */
    const productIds = items.map((i: any) => i.productId);
    const products = await Product.find(
      { _id: { $in: productIds } },
      { ownerId: 1 }
    ).session(session);

    if (products.length === 0) {
      throw new Error("Products not found");
    }

    const productOwnerMap = new Map<string, mongoose.Types.ObjectId>();
    products.forEach((p) => {
      if (p.ownerId) {
        productOwnerMap.set(p._id.toString(), p.ownerId);
      }
    });

    /* ✅ Choose PRIMARY SHOP OWNER (first product owner) */
    const primaryOwnerId = productOwnerMap.values().next().value || userId;

    /* 2️⃣ Create order (SHOP OWNER as creator) */
    const [order] = await Order.create(
      [
        {
          orderRandomId: Math.floor(100000 + Math.random() * 900000),
          customerId,
          statusId,
          summary,
          createdBy: primaryOwnerId, // product owner or fallback to user
        },
      ],
      { session }
    );

    if (!order) throw new Error("Order creation failed");

    /* 3️⃣ Create order items (per product owner) */
    const orderItems = items.map((item: any) => {
      const ownerId = productOwnerMap.get(item.productId.toString()) || userId;

      return {
        orderId: order._id,
        productId: item.productId,
        quantity: item.quantity,
        ownerId,                 // product owner
        createdBy: ownerId,      // product owner
        ownerCreatedAt: new Date(),
      };
    });

    await OrderItem.insertMany(orderItems, { session });

    /* 4️⃣ Update CustomerSummary: lastOrderOn & shopOwner */
    await CustomerSummary.findByIdAndUpdate(
      customerId,
      {
        lastOrderOn: order._id,
        shopOwner: primaryOwnerId,
      },
      { session, new: true }
    );

    /* 5️⃣ Notify all product owners */
    /* 5️⃣ Notify all product owners with FULL DATA */
    const io = getIO();

    if (io) {
      // 🔹 Fetch customer
      const customer = await CustomerSummary.findById(customerId, { name: 1 });

      // 🔹 Fetch products (name + price)
      const productDetails = await Product.find(
        { _id: { $in: productIds } },
        { name: 1, price: 1 }
      );

      // 🔹 Create product map
      const productMap = new Map<string, any>();
      productDetails.forEach((p) => {
        productMap.set(p._id.toString(), p);
      });

      // 🔹 Build detailed product array
      let totalAmount = 0;

      const detailedItems = items.map((item: any) => {
        const product = productMap.get(item.productId.toString());

        const price = product?.price || 0;
        const quantity = item.quantity;
        const total = price * quantity;

        totalAmount += total;

        return {
          productId: item.productId,
          name: product?.name || "Unknown",
          price,
          quantity,
          total,
        };
      });

      const notificationPayload = {
        id: order._id.toString(),
        orderId: order.orderRandomId,
        customerName: customer?.name || "Unknown",
        items: detailedItems,        // ✅ full product details
        totalAmount,                 // ✅ grand total
        summary: order.summary || "",
        createdAt: order.createdAt,
      };

      // 🔹 Emit to all unique shop owners
      [...new Set(products.map((p) => p.ownerId?.toString()))]
        .filter(Boolean)
        .forEach((ownerId) => {
          io.to(ownerId!).emit("new-order", notificationPayload);
        });
    }



    await session.commitTransaction();

    return res.status(201).json({
      message: "Order created successfully",
      id: order._id,
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Order creation failed" });
  } finally {
    session.endSession();
  }
};


/**
 * =========================
 * UPDATE ORDER (with items)
 * =========================
 */
export const updateOrder = async (req: AuthRequest, res: Response) => {
  const userId = getUserObjectId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orderId = getParamObjectId(req.params.id);
  if (!orderId) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  const { statusId, summary, items } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, isDeleted: false },
      {
        ...(statusId && { statusId }),
        ...(summary && { summary }),
        updatedBy: userId,
      },
      { new: true, session }
    );

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Order items must be a non-empty array" });
      }

      await OrderItem.updateMany(
        { orderId },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
        { session }
      );

      const newItems = items.map((item: any) => ({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        createdBy: userId,
      }));

      await OrderItem.insertMany(newItems, { session });
    }

    await session.commitTransaction();
    return res.json({
      message: "Order updated successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("UPDATE ORDER ERROR:", error);
    return res.status(500).json({ message: "Order update failed" });
  } finally {
    session.endSession();
  }
};


/**
 * =========================
 * GET ORDER LIST
 * =========================
 */
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    // 1️⃣ Fetch orders
    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate("statusId", "label")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    if (orders.length === 0) {
      return res.json({
        data: [],
        total,
        page,
        totalPages: 0,
      });
    }

    // 2️⃣ Fetch order items
    const orderIds = orders.map((o) => o._id);

    const orderItems = await OrderItem.find(
      { orderId: { $in: orderIds }, isDeleted: false },
      { orderId: 1, productId: 1 }
    );

    // 3️⃣ Fetch products with owners
    const productIds = [
      ...new Set(orderItems.map((i) => i.productId?.toString()).filter(Boolean)),
    ].map((id) => new mongoose.Types.ObjectId(id));

    const products = await Product.find(
      { _id: { $in: productIds } },
      { ownerId: 1 }
    ).populate("ownerId", "firstName lastName");

    // 4️⃣ Map product → owner
    const productOwnerMap = new Map<string, any>();

    products.forEach((p) => {
      if (p.ownerId) {
        productOwnerMap.set(p._id.toString(), {
          id: (p.ownerId as any)._id,
          name: `${(p.ownerId as any).firstName ?? ""} ${(p.ownerId as any).lastName ?? ""}`.trim(),
        });
      }
    });

    // 5️⃣ Map order → owner (first matching product owner)
    const orderOwnerMap = new Map<string, any>();

    orderItems.forEach((item) => {
      const orderId = item.orderId.toString();
      const productId = item.productId?.toString();
      if (!orderOwnerMap.has(orderId) && productId) {
        const owner = productOwnerMap.get(productId);
        if (owner) orderOwnerMap.set(orderId, owner);
      }
    });

    // 6️⃣ Final response
    const data = orders.map((o) => ({
      id: o._id.toString(),
      orderId: o.orderRandomId,
      customerId: o.customerId,
      status: (o.statusId as any)?.label || "PENDING",
      summary: o.summary || "",
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,

      // ✅ OWNER INFO (ADMIN)
      owner: orderOwnerMap.get(o._id.toString()) || null,
    }));

    return res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};




/**
 * =========================
 * GET ORDER BY ID
 * =========================
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const orderId = getParamObjectId(req.params.id);
  if (!orderId) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  const order = await Order.findOne({
    _id: orderId,
    isDeleted: false,
  })
    .populate("customerId", "name")
    .populate("statusId", "label");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const items = await OrderItem.find({
    orderId,
    isDeleted: false,
  }).populate("productId", "name price");

  return res.json({
    order: {
      id: order._id.toString(),
      orderId: order.orderRandomId,
      customerId:
        typeof order.customerId === "object"
          ? (order.customerId as any)._id
          : order.customerId,
      status: (order.statusId as any)?.label || "PENDING",
      summary: order.summary || "",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
    items: items
      .filter((i) => i.productId)
      .map((i) => ({
        id: i._id.toString(),
        quantity: i.quantity,
        product: {
          id: (i.productId as any)._id.toString(),
          name: (i.productId as any).name,
          price: (i.productId as any).price,
        },
      })),
  });
};

/**
 * =========================
 * DELETE ORDER (SOFT)
 * =========================
 */
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  const userId = getUserObjectId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orderId = getParamObjectId(req.params.id);
  if (!orderId) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  await Order.findByIdAndUpdate(orderId, {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: userId,
  });

  await OrderItem.updateMany(
    { orderId },
    { isDeleted: true, deletedAt: new Date() }
  );

  return res.json({
    message: "Order deleted successfully",
  });

};

/* =========================
   GET ORDERS BY OWNER ID
========================= */
export const getOrdersByOwnerId = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const ownerObjectId = new mongoose.Types.ObjectId(req.userId);

    // 1️⃣ Products owned by logged-in owner
    const products = await Product.find(
      { ownerId: ownerObjectId, isDeleted: false },
      { _id: 1 }
    );

    if (products.length === 0) {
      return res.json({ total: 0, data: [] });
    }

    const productIds = products.map((p) => p._id);

    // 2️⃣ OrderItems using those products
    const orderItems = await OrderItem.find(
      { productId: { $in: productIds }, isDeleted: false },
      { orderId: 1 }
    );

    if (orderItems.length === 0) {
      return res.json({ total: 0, data: [] });
    }

    const orderIds = [
      ...new Set(orderItems.map((i) => i.orderId.toString())),
    ].map((id) => new mongoose.Types.ObjectId(id));

    // ✅ 3️⃣ Get total count BEFORE pagination
    const total = await Order.countDocuments({
      _id: { $in: orderIds },
      isDeleted: false,
    });

    // 3️⃣ Orders with pagination
    const orders = await Order.find({
      _id: { $in: orderIds },
      isDeleted: false,
    })
      .populate("statusId", "label")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const data = orders.map((o) => ({
      id: o._id.toString(),
      orderId: o.orderRandomId,
      customerId: o.customerId,
      status: (o.statusId as any)?.label || "PENDING",
      summary: o.summary || "",
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));

    return res.json({
      total,        // ✅ total count for pagination
      page,         // optional helpful info
      limit,        // optional helpful info
      data,
    });
  } catch (error) {
    console.error("GET ORDERS BY OWNER ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};



export const getOrdersByCustomerId = async (req: AuthRequest, res: Response) => {
  try {
    let customerId = req.params.customerId;
    if (Array.isArray(customerId)) customerId = customerId[0];
    if (!customerId) return res.status(400).json({ message: "Invalid customer ID" });

    // Convert to ObjectId
    let customerObjectId: mongoose.Types.ObjectId;
    try {
      customerObjectId = new mongoose.Types.ObjectId(customerId);
    } catch {
      return res.status(400).json({ message: "Invalid customer ID format" });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status =
      typeof req.query.status === "string" && req.query.status.toUpperCase() !== "ALL"
        ? req.query.status
        : null;

    /* =========================
       AGGREGATION PIPELINE
    ========================= */
    const pipeline: any[] = [
      {
        // Convert string customerId in DB to ObjectId if needed
        $addFields: {
          customerIdObj: {
            $cond: [
              { $eq: [{ $type: "$customerId" }, "string"] },
              { $toObjectId: "$customerId" },
              "$customerId",
            ],
          },
          orderRandomIdStr: { $toString: "$orderRandomId" },
        },
      },
      {
        $match: {
          customerIdObj: customerObjectId,
          isDeleted: false,
        },
      },
    ];

    // 🔍 Search by orderRandomId (>= 3 chars)
    if (search.length >= 3) {
      pipeline.push({
        $match: { orderRandomIdStr: { $regex: search, $options: "i" } },
      });
    }

    // 🔗 Join status
    pipeline.push(
      {
        $lookup: {
          from: "orderstatuses",
          localField: "statusId",
          foreignField: "_id",
          as: "status",
        },
      },
      { $unwind: { path: "$status", preserveNullAndEmptyArrays: true } }
    );

    // 🔹 Status filter
    if (status) {
      pipeline.push({ $match: { "status.label": status } });
    }

    // Count total orders
    const totalResult = await Order.aggregate([...pipeline, { $count: "count" }]);
    const total = totalResult[0]?.count || 0;

    // Pagination
    pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });

    // Lookup items
    pipeline.push(
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "orderId",
          as: "items",
        },
      },
      {
        $unwind: { path: "$items", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "items.product",
        },
      },
      { $unwind: { path: "$items.product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          orderRandomId: { $first: "$orderRandomId" },
          customerId: { $first: "$customerId" },
          status: { $first: "$status" },
          summary: { $first: "$summary" },
          createdBy: { $first: "$createdBy" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          items: {
            $push: {
              $cond: [
                { $ifNull: ["$items._id", false] },
                {
                  id: "$items._id",
                  quantity: "$items.quantity",
                  product: {
                    id: "$items.product._id",
                    name: "$items.product.name",
                    price: "$items.product.price",
                  },
                },
                "$$REMOVE",
              ],
            },
          },
        },
      }
    );

    const orders = await Order.aggregate(pipeline);

    if (!orders.length) {
      return res.json({ data: [], total, page, totalPages: 0 });
    }

    // Format final response
    const data = orders.map((o) => ({
      id: o._id.toString(),
      orderId: o.orderRandomId,
      customerId: o.customerId,
      status: o.status?.label || "PENDING",
      summary: o.summary || "",
      createdBy: o.createdBy,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items || [],
    }));

    return res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET ORDERS BY CUSTOMER ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};