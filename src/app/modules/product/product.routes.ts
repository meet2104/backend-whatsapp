// import { Router } from "express";
// import {
//     createItem,
//     getItems,
//     getItemById,
//     updateItem,
//     deleteItem,
//     getItemsByOwnerId
// } from "./product.controller.js";
// import { protect } from "../auth/auth.middleware.js";
// // 👆 adjust path if needed

// const router = Router();


// /**
//  * PRODUCT ROUTES
//  */

// // Create product
// router.post("/", protect, createItem);

// // Get all products (pagination)
// router.get("/", protect, getItems);

// // Get single product by id
// router.get("/:id", protect, getItemById);

// // Update product
// router.put("/:id", protect, updateItem);

// // ⚠️ Use carefully (admin only recommended)
// router.delete("/:id", protect, deleteItem);

// router.get(
//   "/owner/:ownerId",
//   protect,
//   getItemsByOwnerId
// );



// export default router;


import { Router } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemsByOwnerId,
} from "./product.controller.js";
import { protect } from "../auth/auth.middleware.js";
import { authorizeRoles } from "../role/role.middleware.js";

const router = Router();

/**
 * PRODUCT ROUTES
 */

// ✅ Create product
router.post(
  "/",
  protect,
  createItem
);

// ✅ Get products by owner (MUST be before :id)
router.get(
  "/owner/:ownerId",
  protect,
  getItemsByOwnerId
);

// ✅ Get all products (pagination)
router.get(
  "/",
  protect,
  getItems
);

// ✅ Get single product by id
router.get(
  "/:id",
  protect,
  getItemById
);

// ✅ Update product
router.put(
  "/:id",
  protect,
  updateItem
);

// ⚠️ Hard delete (admin recommended)
router.delete(
  "/:id",
  protect,
  deleteItem
);

export default router;