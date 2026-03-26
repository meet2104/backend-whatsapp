// import express from "express";
// import {
//   createUser,
//   getUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
// } from "./user.controller.js";
// import { protect } from "../auth/auth.middleware.js";

// const router = express.Router();

// router.post("/", protect, createUser);
// router.get("/", protect, getUsers);
// router.get("/:id", protect, getUserById);
// router.put("/:id", protect, updateUser);
// router.delete("/:id", protect, deleteUser);

// export default router;


// import express from "express";
// import {
//   createUser,
//   getUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
// } from "./user.controller.js";
// import { protect } from "../auth/auth.middleware.js";

// const router = express.Router();

// router.post("/", protect, createUser);
// router.get("/", protect, getUsers);
// router.get("/:id", protect, getUserById);
// router.put("/:id", protect, updateUser);
// router.delete("/:id", protect, deleteUser);

// export default router;


import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllShopOwners,
} from "./user.controller.js";
import { protect } from "../auth/auth.middleware.js";
import { authorizeRoles } from "../role/role.middleware.js";

const router = express.Router();

// Create user - only SUPER ADMIN and ADMIN can create users
router.post("/", protect, authorizeRoles("SUPER ADMIN", "ADMIN"), createUser);

// Get all users with optional search/pagination
router.get("/", protect, getUsers);

// ✅ Get only shop owners (must be BEFORE /:id)
router.get(
  "/shop-owners",
  protect,
  getAllShopOwners
);

// Get single user by id
router.get("/:id", protect, getUserById);

// Update user
router.put("/:id", protect, updateUser);

// Delete user
router.delete("/:id", protect, deleteUser);

export default router;