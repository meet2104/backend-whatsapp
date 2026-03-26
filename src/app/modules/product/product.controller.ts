// import type { Response } from "express";
// import mongoose from "mongoose";
// import Product from "./product.model.js";
// import type { AuthRequest } from "../../../types/auth.js";

// /**
//  * Utility: pick only required fields
//  */
// const pickProduct = (p: any) => ({
//     id: p._id,
//     name: p.name,
//     description: p.description,
//     price: p.price,
//     quantity: p.quantity,
//     unit: p.unit.displayName || p.unit.name,

//     owner: p.ownerId
//         ? {
//             id: p.ownerId._id,
//             name: `${p.ownerId.firstName ?? ""} ${p.ownerId.lastName ?? ""}`.trim(),
//         }
//         : undefined,
// });

// /**
//  * CREATE PRODUCT
//  */
// export const createItem = async (req: AuthRequest, res: Response) => {
//     try {
//         if (!req.userId) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const { name, description, price, quantity, unit, ownerId } = req.body;

//         if (!name || !price || !unit || !ownerId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "name, price, unit and ownerId are required",
//             });
//         }

//         if (
//             !mongoose.Types.ObjectId.isValid(unit) ||
//             !mongoose.Types.ObjectId.isValid(ownerId)
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid unit or ownerId",
//             });
//         }

//         const product = await Product.create({
//             ownerId,
//             name,
//             description,
//             price,
//             quantity: quantity ?? 0,
//             unit,
//             createdBy: req.userId,
//         });

//         res.status(201).json({
//             success: true,
//             message: "Product created successfully",
//             data: { id: product._id },
//         });
//     } catch (error) {
//         console.error("CREATE PRODUCT ERROR:", error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };

// /**
//  * GET PRODUCTS (PAGINATION)
//  */
// export const getItems = async (req: AuthRequest, res: Response) => {
//     try {
//         const page = Math.max(Number(req.query.page) || 1, 1);
//         const limit = Math.max(Number(req.query.limit) || 10, 1);
//         const skip = (page - 1) * limit;

//         const search =
//             typeof req.query.search === "string"
//                 ? req.query.search.trim()
//                 : "";

//         const pipeline: any[] = [
//             { $match: { isDeleted: false } },

//             // 🔹 JOIN OWNER
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "ownerId",
//                     foreignField: "_id",
//                     as: "owner",
//                 },
//             },
//             { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },

//             // 🔹 JOIN UNIT
//             {
//                 $lookup: {
//                     from: "units",
//                     localField: "unit",
//                     foreignField: "_id",
//                     as: "unit",
//                 },
//             },
//             { $unwind: { path: "$unit", preserveNullAndEmptyArrays: true } },

//             // ✅ CRITICAL FIX: restore ownerId for pickProduct
//             {
//                 $addFields: {
//                     ownerId: "$owner",
//                 },
//             },
//         ];

//         // 🔍 SEARCH
//         if (search && search.length >= 3) {
//             pipeline.push({
//                 $match: {
//                     $or: [
//                         { name: { $regex: search, $options: "i" } },
//                         { "unit.name": { $regex: search, $options: "i" } },
//                         { "unit.displayName": { $regex: search, $options: "i" } },
//                         {
//                             $expr: {
//                                 $regexMatch: {
//                                     input: {
//                                         $concat: [
//                                             { $ifNull: ["$owner.firstName", ""] },
//                                             " ",
//                                             { $ifNull: ["$owner.lastName", ""] },
//                                         ],
//                                     },
//                                     regex: search,
//                                     options: "i",
//                                 },
//                             },
//                         },
//                     ],
//                 },
//             });
//         }

//         const totalResult = await Product.aggregate([
//             ...pipeline,
//             { $count: "count" },
//         ]);

//         const total = totalResult[0]?.count || 0;

//         const products = await Product.aggregate([
//             ...pipeline,
//             { $sort: { createdAt: -1 } },
//             { $skip: skip },
//             { $limit: limit },
//         ]);

//         res.status(200).json({
//             success: true,
//             total,
//             page,
//             totalPages: Math.ceil(total / limit),
//             data: products.map(pickProduct),
//         });
//     } catch (error) {
//         console.error("GET PRODUCTS ERROR:", error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };

// /**
//  * GET SINGLE PRODUCT
//  */
// export const getItemById = async (req: AuthRequest, res: Response) => {
//     try {
//         const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

//         if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid product id" });
//         }

//         const product = await Product.findOne({
//             _id: id,
//             isDeleted: false,
//         })
//             .populate("unit", "displayName name")
//             .populate("ownerId", "firstName lastName");

//         if (!product) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Product not found" });
//         }

//         res.status(200).json({
//             success: true,
//             data: pickProduct(product),
//         });
//     } catch (error) {
//         console.error("GET PRODUCT ERROR:", error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };

// /**
//  * UPDATE PRODUCT
//  */
// export const updateItem = async (req: AuthRequest, res: Response) => {
//     try {
//         if (!req.userId) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

//         if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid product id" });
//         }

//         const product = await Product.findOneAndUpdate(
//             { _id: id, isDeleted: false },
//             {
//                 ...req.body,
//                 updatedBy: req.userId,
//             },
//             { new: true, runValidators: true }
//         );

//         if (!product) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Product not found" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Product updated successfully",
//             data: { id: product._id },
//         });
//     } catch (error) {
//         console.error("UPDATE PRODUCT ERROR:", error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };

// /**
//  * HARD DELETE PRODUCT (PERMANENT)
//  */
// export const deleteItem = async (req: AuthRequest, res: Response) => {
//     try {
//         if (!req.userId) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

//         if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid product id" });
//         }

//         const product = await Product.findByIdAndDelete(id);

//         if (!product) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Product not found" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Product permanently deleted",
//         });
//     } catch (error) {
//         console.error("HARD DELETE PRODUCT ERROR:", error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };

// /**
//  * GET PRODUCTS BY OWNER ID (PAGINATION)
//  */
// export const getItemsByOwnerId = async (req: AuthRequest, res: Response) => {
//     try {
//         const ownerId = Array.isArray(req.params.ownerId)
//             ? req.params.ownerId[0]
//             : req.params.ownerId;

//         if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid ownerId",
//             });
//         }

//         const page = Math.max(Number(req.query.page) || 1, 1);
//         const limit = Math.max(Number(req.query.limit) || 10, 1);
//         const skip = (page - 1) * limit;

//         // 🔹 KEEP EXISTING FILTER
//         const filter: any = {
//             isDeleted: false,
//             ownerId: new mongoose.Types.ObjectId(ownerId),
//         };

//         // 🔹 ADD SEARCH (PARAM NAME NOT CHANGED)
//         const search =
//             typeof req.query.search === "string"
//                 ? req.query.search.trim()
//                 : "";

//         if (search && search.length >= 3) {
//             filter.$or = [
//                 { name: { $regex: search, $options: "i" } },
//                 { "unit.name": { $regex: search, $options: "i" } },
//                 { "unit.displayName": { $regex: search, $options: "i" } },
//             ];
//         }

//         const [total, products] = await Promise.all([
//             Product.countDocuments(filter),
//             Product.find(filter)
//                 .populate("unit", "displayName name")
//                 .sort({ createdAt: -1 })
//                 .skip(skip)
//                 .limit(limit),
//         ]);

//         return res.status(200).json({
//             success: true,
//             total,
//             page,
//             totalPages: Math.ceil(total / limit),
//             data: products.map(pickProduct),
//         });
//     } catch (error) {
//         console.error("GET PRODUCTS BY OWNER ERROR:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Server Error",
//         });
//     }
// };

import type { Response } from "express";
import mongoose from "mongoose";
import Product from "./product.model.js";
import User from "../user/User.model.js";
import type { AuthRequest } from "../../shared/types/auth.js";

/**
 * Utility: pick only required fields
 */
const pickProduct = (p: any) => ({
    id: p._id,

    // ✅ ADD THIS
    ownerId: p.ownerId?._id || p.ownerId,

    name: p.name,
    description: p.description,
    price: p.price,
    quantity: p.quantity,
    unit: p.unit?.displayName || p.unit?.name,
});


/**
 * CREATE PRODUCT
 */
export const createItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { name, description, price, quantity, unit, ownerId } = req.body;

        if (!name || !price || !unit) {
            return res.status(400).json({
                success: false,
                message: "name, price and unit are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(unit)) {
            return res.status(400).json({ success: false, message: "Invalid unit" });
        }

        let finalOwnerId: string;

        if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
            finalOwnerId = ownerId;
        } else {
            finalOwnerId = req.userId;
        }

        if (!mongoose.Types.ObjectId.isValid(finalOwnerId)) {
            return res.status(400).json({ success: false, message: "Invalid ownerId" });
        }

        const product = await Product.create({
            ownerId: finalOwnerId,
            name,
            description,
            price,
            quantity: quantity ?? 0,
            unit,
            createdBy: req.userId,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: { id: product._id },
        });
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * GET PRODUCTS (PAGINATION)
 */
export const getItems = async (req: AuthRequest, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const search =
            typeof req.query.search === "string" ? req.query.search.trim() : "";

        const pipeline: any[] = [
            { $match: { isDeleted: false } },

            // 🔹 UNIT
            {
                $lookup: {
                    from: "units",
                    localField: "unit",
                    foreignField: "_id",
                    as: "unit",
                },
            },
            { $unwind: { path: "$unit", preserveNullAndEmptyArrays: true } },

            // 🔹 OWNER (REAL PRODUCT OWNER)
            {
                $lookup: {
                    from: "users",
                    localField: "ownerId",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        ];

        // 🔍 SEARCH
        if (search && search.length >= 3) {
            pipeline.push({
                $match: {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { "unit.name": { $regex: search, $options: "i" } },
                        { "unit.displayName": { $regex: search, $options: "i" } },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: {
                                        $concat: [
                                            { $ifNull: ["$owner.firstName", ""] },
                                            " ",
                                            { $ifNull: ["$owner.lastName", ""] },
                                        ],
                                    },
                                    regex: search,
                                    options: "i",
                                },
                            },
                        },
                    ],
                },
            });
        }

        const totalResult = await Product.aggregate([
            ...pipeline,
            { $count: "count" },
        ]);

        const total = totalResult[0]?.count || 0;

        const products = await Product.aggregate([
            ...pipeline,
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        return res.status(200).json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: products.map((p) => ({
                id: p._id,
                name: p.name,
                description: p.description,
                price: p.price,
                quantity: p.quantity,
                unit: p.unit?.displayName || p.unit?.name,
                owner: p.owner
                    ? {
                        name: `${p.owner.firstName ?? ""} ${p.owner.lastName ?? ""}`.trim(),
                    }
                    : null,
            })),
        });
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};


/**
 * GET SINGLE PRODUCT
 */
export const getItemById = async (req: AuthRequest, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product id",
            });
        }

        const product = await Product.findOne({
            _id: id,
            isDeleted: false,
        })
            .populate("unit", "displayName name")
            .populate("ownerId", "_id firstName lastName") // ✅ REQUIRED
            .populate("createdBy", "firstName lastName")
            .populate("updatedBy", "firstName lastName");


        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: pickProduct(product),
        });

    } catch (error) {
        console.error("GET PRODUCT ERROR:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * UPDATE PRODUCT
 */
export const updateItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const productId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product id",
            });
        }

        // 🔑 Logged-in user
        const loggedInUser = await User.findById(req.userId).select("role");
        if (!loggedInUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const updateData: any = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            unit: req.body.unit,
            updatedBy: req.userId, // ✅ WHO UPDATED
        };

        /**
         * 🔐 OWNER RULE (FINAL & CORRECT)
         * - ADMIN / SUPER_ADMIN → can change ownerId
         * - SHOP_OWNER → cannot change ownerId
         */
        if (
            (String(loggedInUser.role) === "ADMIN" ||
                String(loggedInUser.role) === "SUPER ADMIN") &&
            req.body.ownerId &&
            mongoose.Types.ObjectId.isValid(req.body.ownerId)
        ) {
            updateData.ownerId = req.body.ownerId; // ✅ SELECTED SHOP OWNER
        }

        const product = await Product.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: { id: product._id },
        });
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};






/**
 * HARD DELETE PRODUCT
 */
export const deleteItem = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Product permanently deleted",
        });
    } catch (error) {
        console.error("HARD DELETE PRODUCT ERROR:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * GET PRODUCTS BY OWNER ID (PAGINATION)
 */
export const getItemsByOwnerId = async (req: AuthRequest, res: Response) => {
    try {
        const ownerId = Array.isArray(req.params.ownerId)
            ? req.params.ownerId[0]
            : req.params.ownerId;

        if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ownerId",
            });
        }

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const filter: any = {
            isDeleted: false,
            ownerId: new mongoose.Types.ObjectId(ownerId),
        };

        const search =
            typeof req.query.search === "string" ? req.query.search.trim() : "";

        if (search && search.length >= 3) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { "unit.name": { $regex: search, $options: "i" } },
                { "unit.displayName": { $regex: search, $options: "i" } },
            ];
        }

        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .populate("unit", "displayName name")
                .populate("createdBy", "firstName lastName")
                .populate("updatedBy", "firstName lastName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: products.map((p) =>
                pickProduct({
                    ...p.toObject(),
                    assignedUser: p.updatedBy || p.createdBy,
                })
            ),
        });
    } catch (error) {
        console.error("GET PRODUCTS BY OWNER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};