// // controllers/user.controller.ts
// import type { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import User from "./User.model.js";
// import Role from "../role/Role.model.js";
// import type { AuthRequest } from "../../../types/auth.js";
// import mongoose from "mongoose";

// export const createUser = async (req: AuthRequest, res: Response) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       role,
//       mobile,
//       companayName,   // typo from frontend
//       companyName,    // correct spelling (optional)
//       address,
//       lat,
//       lng,
//     } = req.body;

//     /* ================= VALIDATION ================= */
//     if (!firstName || !lastName || !email) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Prevent duplicate email
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(409)
//         .json({ message: "User with this email already exists" });
//     }

//     /* ================= ROLE ================= */
//     const roleName = role ? role.toUpperCase() : "USER";

//     const roleDoc = await Role.findOne({ name: roleName });
//     if (!roleDoc) {
//       return res.status(400).json({ message: "Invalid role" });
//     }

//     /* ================= PASSWORD ================= */
//     let defaultPassword: string;
//     switch (roleName) {
//       case "SUPER ADMIN":
//         defaultPassword = "SuperAdmin@123";
//         break;
//       case "ADMIN":
//         defaultPassword = "Admin@123";
//         break;
//       case "SHOP OWNER":
//         defaultPassword = "ShopOwner@123";
//         break;
//       default:
//         defaultPassword = "Welcome@123";
//     }

//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//     /* ================= COMPANY NAME (MERGED FIX) ================= */
//     const finalCompanyName = companayName || companyName;

//     if (!finalCompanyName) {
//       return res.status(400).json({
//         message: "companayName (company name) is required",
//       });
//     }

//     /* ================= CREATE USER ================= */
//     const createData: any = {
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       role: roleDoc._id,
//       mobile,
//       companayName: finalCompanyName,
//       address,
//       lat: lat || 0,
//       lng: lng || 0,
//     };

//     // ✅ Track creator
//     if (req.userId) {
//       createData.createdBy = new mongoose.Types.ObjectId(req.userId);
//     }

//     const user = await User.create(createData);

//     /* ================= POPULATE RESPONSE ================= */
//     const populatedUser = await User.findById(user._id)
//       .populate("role", "name displayName")
//       .populate("createdBy", "firstName lastName")
//       .select("-password");

//     return res.status(201).json({
//       message: "User created successfully",
//       user: {
//         ...populatedUser?.toObject(),
//         role:
//           (populatedUser as any)?.role?.displayName ||
//           (populatedUser as any)?.role?.name,
//         createdBy: populatedUser?.createdBy
//           ? `${(populatedUser.createdBy as any).firstName} ${(populatedUser.createdBy as any).lastName}`
//           : "NEURONET SYSTEMS PVT. LTD",
//       },
//     });
//   } catch (error: any) {
//     console.error("CREATE USER ERROR:", error);
//     return res.status(500).json({
//       message: error.message || "User creation failed",
//     });
//   }
// };




// export const getUsers = async (req: Request, res: Response) => {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const search = (req.query.search as string) || "";

//     const skip = (page - 1) * limit;

//     /* ================= SEARCH ================= */
//     const query = search
//       ? {
//         $or: [
//           { firstName: { $regex: search, $options: "i" } },
//           { lastName: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//           { companayName: { $regex: search, $options: "i" } },
//         ],
//       }
//       : {};

//     const [users, total] = await Promise.all([
//       User.find(query)
//         .populate("role", "displayName name")
//         .populate("createdBy", "firstName lastName")
//         .select("firstName lastName email role mobile companayName createdBy createdAt")
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: 1 }),

//       User.countDocuments(query),
//     ]);

//     /* ================= FRONTEND-SAFE FORMAT ================= */
//     const formattedUsers = users.map((u: any) => ({
//       id: u._id.toString(),     
//       firstName: u.firstName,
//       lastName: u.lastName,
//       email: u.email,
//       role: u.role?.displayName || u.role?.name || "",
//       mobile: u.mobile,
//       companayName: u.companayName || "",
//       createdBy: u.createdBy
//         ? `${u.createdBy.firstName} ${u.createdBy.lastName}`
//         : "NEURONET SYSTEMS PVT. LTD",
//     }));

//     return res.status(200).json({
//       users: formattedUsers,
//       total,
//       page,
//       limit,
//     });
//   } catch (error) {
//     console.error("Get users error:", error);
//     return res.status(500).json({ message: "Failed to fetch users" });
//   }
// };



// export const getUserById = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.params.id)
//       .populate("role", "name displayName")
//       .select(
//         "firstName lastName email role mobile companayName address lat lng"
//       );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // ✅ FRONTEND-SAFE FORMAT (FOR USERFORM)
//     return res.status(200).json({
//       id: user._id.toString(),
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,

//       role:
//         (user as any).role?.displayName ||
//         (user as any).role?.name ||
//         "",

//       mobile: user.mobile,
//       companayName: user.companayName,
//       address: user.address || "",

//       lat: user.lat,
//       lng: user.lng,
//     });
//   } catch (err) {
//     console.error("GET USER BY ID ERROR:", err);
//     return res.status(400).json({ message: "Invalid user id" });
//   }
// };




// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const updateData: any = { ...req.body };

//     // Map frontend fields to MongoDB fields
//     if (updateData.phone !== undefined) {
//       updateData.mobile = updateData.phone;
//       delete updateData.phone;
//     }
//     if (updateData.latitude !== undefined) {
//       updateData.lat = Number(updateData.latitude);
//       delete updateData.latitude;
//     }
//     if (updateData.longitude !== undefined) {
//       updateData.lng = Number(updateData.longitude);
//       delete updateData.longitude;
//     }

//     // Hash password if provided
//     if (updateData.password) {
//       updateData.password = await bcrypt.hash(updateData.password, 10);
//     }

//     // If role is passed (for new user creation) convert to ObjectId
//     if (updateData.role) {
//       const roleDoc = await Role.findOne({ name: updateData.role.toUpperCase() });
//       if (!roleDoc) return res.status(400).json({ message: "Invalid role" });
//       updateData.role = roleDoc._id;
//     }

//     // Update user
//     const user = await User.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     }).populate("role", "name");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Send response with mapped fields for frontend
//     res.json({
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       role: (user as any).role?.name,
//       companayName: user.companayName,
//       address: user.address,
//     });

//   } catch (err) {
//     console.error("UPDATE USER ERROR:", err);
//     res.status(500).json({ message: "User update failed" });
//   }
// };

// export const deleteUser = async (req: Request, res: Response) => {
//   await User.findByIdAndDelete(req.params.id);
//   res.json({ message: "User deleted" });
// };


// controllers/user.controller.ts
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "./User.model.js";
import Role from "../role/Role.model.js";
import type { AuthRequest } from "../../shared/types/auth.js";
import mongoose from "mongoose";

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
      mobile,
      companayName,   // typo from frontend
      companyName,    // correct spelling (optional)
      address,
      lat,
      lng,
    } = req.body;

    /* ================= VALIDATION ================= */
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Prevent duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    /* ================= ROLE ================= */
    const roleName = role ? role.toUpperCase() : "USER";

    const roleDoc = await Role.findOne({ name: roleName });
    if (!roleDoc) {
      return res.status(400).json({ message: "Invalid role" });
    }

    /* ================= PASSWORD ================= */
    let defaultPassword: string;
    switch (roleName) {
      case "SUPER ADMIN":
        defaultPassword = "SuperAdmin@123";
        break;
      case "ADMIN":
        defaultPassword = "Admin@123";
        break;
      case "SHOP OWNER":
        defaultPassword = "ShopOwner@123";
        break;
      default:
        defaultPassword = "Welcome@123";
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    /* ================= COMPANY NAME (MERGED FIX) ================= */
    const finalCompanyName = companayName || companyName;

    if (!finalCompanyName) {
      return res.status(400).json({
        message: "companayName (company name) is required",
      });
    }

    /* ================= CREATE USER ================= */
    const createData: any = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: roleDoc._id,
      mobile,
      companayName: finalCompanyName,
      address,
      lat: lat || 0,
      lng: lng || 0,
    };

    // ✅ Track creator
    if (req.userId) {
      createData.createdBy = new mongoose.Types.ObjectId(req.userId);
    }

    const user = await User.create(createData);

    /* ================= POPULATE RESPONSE ================= */
    const populatedUser = await User.findById(user._id)
      .populate("role", "name displayName")
      .populate("createdBy", "firstName lastName")
      .select("-password");

    return res.status(201).json({
      message: "User created successfully",
      user: {
        ...populatedUser?.toObject(),
        role:
          (populatedUser as any)?.role?.displayName ||
          (populatedUser as any)?.role?.name,
        createdBy: populatedUser?.createdBy
          ? `${(populatedUser.createdBy as any).firstName} ${(populatedUser.createdBy as any).lastName}`
          : "NEURONET SYSTEMS PVT. LTD",
      },
    });
  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);
    return res.status(500).json({
      message: error.message || "User creation failed",
    });
  }
};




export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    /* ================= SEARCH ================= */
    const query = search
      ? {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { companayName: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .populate("role", "displayName name")
        .populate("createdBy", "firstName lastName")
        .select("firstName lastName email role mobile companayName createdBy createdAt")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 1 }),

      User.countDocuments(query),
    ]);

    /* ================= FRONTEND-SAFE FORMAT ================= */
    const formattedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role?.displayName || u.role?.name || "",
      mobile: u.mobile,
      companayName: u.companayName || "",
      createdBy: u.createdBy
        ? `${u.createdBy.firstName} ${u.createdBy.lastName}`
        : "NEURONET SYSTEMS PVT. LTD",
    }));

    return res.status(200).json({
      users: formattedUsers,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};



export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("role", "name displayName")
      .select(
        "firstName lastName email role mobile companayName address lat lng"
      );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FRONTEND-SAFE FORMAT (FOR USERFORM)
    return res.status(200).json({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,

      role:
        (user as any).role?.displayName ||
        (user as any).role?.name ||
        "",

      mobile: user.mobile,
      companayName: user.companayName,
      address: user.address || "",

      lat: user.lat,
      lng: user.lng,
    });
  } catch (err) {
    console.error("GET USER BY ID ERROR:", err);
    return res.status(400).json({ message: "Invalid user id" });
  }
};




export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateData: any = { ...req.body };

    // Map frontend fields to MongoDB fields
    if (updateData.phone !== undefined) {
      updateData.mobile = updateData.phone;
      delete updateData.phone;
    }
    if (updateData.latitude !== undefined) {
      updateData.lat = Number(updateData.latitude);
      delete updateData.latitude;
    }
    if (updateData.longitude !== undefined) {
      updateData.lng = Number(updateData.longitude);
      delete updateData.longitude;
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // If role is passed (for new user creation) convert to ObjectId
    if (updateData.role) {
      const roleDoc = await Role.findOne({ name: updateData.role.toUpperCase() });
      if (!roleDoc) return res.status(400).json({ message: "Invalid role" });
      updateData.role = roleDoc._id;
    }

    // Update user
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("role", "name");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Send response with mapped fields for frontend
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: (user as any).role?.name,
      companayName: user.companayName,
      address: user.address,
    });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: "User update failed" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};


export const getAllShopOwners = async (req: Request, res: Response) => {
  try {
    // Find the Role document for SHOP_OWNER
    const shopOwnerRole = await Role.findOne({
      $or: [{ name: "SHOP_OWNER" }, { displayName: "Shop Owner" }],
    });

    if (!shopOwnerRole) {
      return res.status(404).json({
        success: false,
        message: "Shop Owner role not found",
      });
    }

    // Find all users with that role
    const shopOwners = await User.find({ role: shopOwnerRole._id })
      .select("firstName lastName email mobile companayName createdAt")
      .populate("role", "name displayName");

    // Map to frontend-friendly format
    const formattedOwners = shopOwners.map(u => ({
      id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      mobile: u.mobile,
      companayName: u.companayName || "",
      role: (u.role as any)?.displayName || (u.role as any)?.name,
    }));

    return res.status(200).json({
      success: true,
      count: formattedOwners.length,
      data: formattedOwners,
    });
  } catch (error) {
    console.error("Fetch Shop Owners Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop owners",
    });
  }
};