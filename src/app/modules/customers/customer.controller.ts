// import type { Request, Response } from "express";
// import mongoose from "mongoose";
// import CustomerSummary from "./customer.model.js";
// import Order from "../order/order.model.js";

// /* =========================
//    Helper to format customer
// ========================= */
// const formatCustomer = (c: any) => {
//   const order = c.lastOrderOn;

//   return {
//     id: c._id,
//     name: c.name,
//     email: c.email,
//     phone: c.phone,
//     telegramId: c.telegramId,


//     lastOrderOn: order
//       ? {
//         id: order._id,
//         createdAt: order.createdAt,
//       }
//       : null,

//     shopOwner: order?.createdBy
//       ? {
//         id: order.createdBy._id,
//         name: `${order.createdBy.firstName ?? ""} ${order.createdBy.lastName ?? ""}`.trim(),
//       }
//       : null,
//   };
// };

// /**
//  * =========================
//  * CREATE CUSTOMER
//  * =========================
//  */
// export const createCustomer = async (req: Request, res: Response) => {
//   try {
//     const { name, email, phone, lastOrderOn, telegramId } = req.body;

//     if (!name || !email || !phone || !telegramId) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email, phone and telegramId are required",
//       });
//     }

//     if (lastOrderOn && !mongoose.Types.ObjectId.isValid(lastOrderOn)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid lastOrderOn id",
//       });
//     }

//     const customer = await CustomerSummary.create({
//       name,
//       email,
//       phone,
//       telegramId,
//       ...(lastOrderOn && { lastOrderOn }),
//     });

//     const populated = await CustomerSummary.findById(customer._id).populate({
//       path: "lastOrderOn",
//       populate: {
//         path: "createdBy",
//         select: "firstName lastName",
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Customer created successfully",
//       data: populated ? formatCustomer(populated) : null,
//     });
//   } catch (error) {
//     console.error("CREATE CUSTOMER ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create customer",
//     });
//   }
// };

// /**
//  * =========================
//  * GET CUSTOMERS BY SHOP OWNER (PAGINATED)
//  * Derived via lastOrderOn → Order.createdBy
//  * =========================
//  */
// // export const getCustomersByShopOwner = async (
// //   req: Request<{ shopOwnerId: string }>,
// //   res: Response
// // ) => {
// //   try {
// //     const { shopOwnerId } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(shopOwnerId)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid shop owner id",
// //       });
// //     }

// //     const page = Math.max(Number(req.query.page) || 1, 1);
// //     const limit = Math.max(Number(req.query.limit) || 10, 1);
// //     const skip = (page - 1) * limit;

// //     // 🔹 ADD SEARCH (PARAM NOT CHANGED)
// //     const search =
// //       typeof req.query.search === "string"
// //         ? req.query.search.trim()
// //         : "";


// //     // 1️⃣ Orders created by this shop owner
// //     const orders = await Order.find(
// //       { createdBy: shopOwnerId },
// //       { _id: 1 }
// //     );

// //     if (orders.length === 0) {
// //       return res.json({
// //         success: true,
// //         total: 0,
// //         page,
// //         totalPages: 0,
// //         data: [],
// //       });
// //     }

// //     const orderIds = orders.map((o) => o._id);

// //     // 2️⃣ Customers whose lastOrderOn belongs to those orders
// //     const filter: any = { lastOrderOn: { $in: orderIds } };

// // if (search && search.length >= 3) {
// //   filter.$or = [
// //     { name: { $regex: search, $options: "i" } },
// //     { email: { $regex: search, $options: "i" } },
// //   ];
// // }


// //     const [total, customers] = await Promise.all([
// //       CustomerSummary.countDocuments(filter),
// //       CustomerSummary.find(filter)
// //         .populate({
// //           path: "lastOrderOn",
// //           populate: {
// //             path: "createdBy",
// //             select: "firstName lastName",
// //           },
// //         })
// //         .sort({ createdAt: -1 })
// //         .skip(skip)
// //         .limit(limit),
// //     ]);

// //     res.json({
// //       success: true,
// //       total,
// //       page,
// //       totalPages: Math.ceil(total / limit),
// //       data: customers.map(formatCustomer),
// //     });
// //   } catch (error) {
// //     console.error("GET CUSTOMERS BY OWNER ERROR:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch customers",
// //     });
// //   }
// // };

// export const getCustomersByShopOwner = async (
//   req: Request<{ shopOwnerId: string }>,
//   res: Response
// ) => {
//   try {
//     const { shopOwnerId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(shopOwnerId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid shop owner id",
//       });
//     }

//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const skip = (page - 1) * limit;

//     // ✅ FIXED FIELD NAME
//     const orders = await Order.find(
//       { createdBy: shopOwnerId },
//       { customerId: -1 }
//     ).lean();

//     if (!orders.length) {
//       return res.json({
//         success: true,
//         total: 0,
//         page,
//         totalPages: 0,
//         data: [],
//       });
//     }

//     const customerIds = orders
//       .map((o) => o.customerId)
//       .filter(Boolean);

//     const filter = { _id: { $in: customerIds } };

//     const [total, customers] = await Promise.all([
//       CustomerSummary.countDocuments(filter),
//       CustomerSummary.find(filter)
//         .populate({
//           path: "lastOrderOn",
//           populate: {
//             path: "createdBy",
//             select: "firstName lastName",
//           },
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//     ]);

//     res.json({
//       success: true,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//       data: customers.map(formatCustomer),
//     });
//   } catch (error) {
//     console.error("GET CUSTOMERS BY OWNER ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch customers",
//     });
//   }
// };

// /**
//  * =========================
//  * GET ALL CUSTOMERS (PAGINATED)
//  * =========================
//  */
// export const getAllCustomers = async (req: Request, res: Response) => {
//   try {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const skip = (page - 1) * limit;

//     // 🔹 ADD SEARCH (PARAM NOT CHANGED)
//     const search =
//       typeof req.query.search === "string"
//         ? req.query.search.trim()
//         : "";

//     const filter: any = {};

//     if (search && search.length >= 3) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: [
//                   { $ifNull: ["$lastOrderOn.createdBy.firstName", ""] },
//                   " ",
//                   { $ifNull: ["$lastOrderOn.createdBy.lastName", ""] },
//                 ],
//               },
//               regex: search,
//               options: "i",
//             },
//           },
//         },
//       ];
//     }

//     const [total, customers] = await Promise.all([
//       CustomerSummary.countDocuments(),
//       CustomerSummary.find()
//         .populate({
//           path: "lastOrderOn",
//           populate: {
//             path: "createdBy",
//             select: "firstName lastName",
//           },
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//     ]);

//     res.json({
//       success: true,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//       data: customers.map(formatCustomer),
//     });
//   } catch (error) {
//     console.error("GET ALL CUSTOMERS ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch customers",
//     });
//   }
// };

// /**
//  * =========================
//  * UPDATE CUSTOMER
//  * =========================
//  */
// export const updateCustomer = async (
//   req: Request<{ id: string }>,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid customer id",
//       });
//     }

//     if (
//       req.body.lastOrderOn &&
//       !mongoose.Types.ObjectId.isValid(req.body.lastOrderOn)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid lastOrderOn id",
//       });
//     }

//     const customer = await CustomerSummary.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true }
//     ).populate({
//       path: "lastOrderOn",
//       populate: {
//         path: "createdBy",
//         select: "firstName lastName",
//       },
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Customer updated successfully",
//       data: formatCustomer(customer),
//     });
//   } catch (error) {
//     console.error("UPDATE CUSTOMER ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update customer",
//     });
//   }
// };

// /**
//  * =========================
//  * DELETE CUSTOMER
//  * =========================
//  */
// export const deleteCustomer = async (
//   req: Request<{ id: string }>,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid customer id",
//       });
//     }

//     const customer = await CustomerSummary.findByIdAndDelete(id);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Customer deleted successfully",
//     });
//   } catch (error) {
//     console.error("DELETE CUSTOMER ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete customer",
//     });
//   }
// };

// /**
//  * =========================
//  * GET CUSTOMER BY ID
//  * =========================
//  */
// export const getCustomerById = async (
//   req: Request<{ id: string }>,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid customer id",
//       });
//     }

//     const customer = await CustomerSummary.findById(id).populate({
//       path: "lastOrderOn",
//       populate: {
//         path: "createdBy",
//         select: "firstName lastName",
//       },
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     return res.json({
//       success: true,
//       data: formatCustomer(customer),
//     });
//   } catch (error) {
//     console.error("GET CUSTOMER BY ID ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch customer",
//     });
//   }
// };
// /**
//  * =========================
//  * GET CUSTOMER BY TELEGRAM ID
//  * =========================
//  */
// export const getCustomerByTelegramId = async (
//   req: Request<{ telegramId: string }>,
//   res: Response
// ) => {
//   try {
//     const { telegramId } = req.params;

//     const customer = await CustomerSummary.findOne({ telegramId: Number(telegramId) }).populate({
//       path: "lastOrderOn",
//       populate: {
//         path: "createdBy",
//         select: "firstName lastName",
//       },
//     });

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     return res.json({
//       success: true,
//       data: formatCustomer(customer),
//     });
//   } catch (error) {
//     console.error("GET CUSTOMER BY TELEGRAM ID ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch customer",
//     });
//   }
// };



import type { Request, Response } from "express";
import mongoose from "mongoose";
import CustomerSummary from "./customer.model.js";
import Order from "../order/order.model.js";

/* =========================
   Helper to format customer
========================= */
const formatCustomer = (c: any) => {
  const order = c.lastOrderOn;

  return {
    id: c._id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    // telegramId: c.telegramId,


    lastOrderOn: order
      ? {
        id: order._id,
        createdAt: order.createdAt,
      }
      : null,

    shopOwner: order?.createdBy
      ? {
        id: order.createdBy._id,
        name: `${order.createdBy.firstName ?? ""} ${order.createdBy.lastName ?? ""}`.trim(),
      }
      : null,
  };
};

/**
 * =========================
 * CREATE CUSTOMER
 * =========================
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, lastOrderOn, telegramId } = req.body;

    if (!name || !email || !phone /* || !telegramId */) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and telegramId are required",
      });
    }

    if (lastOrderOn && !mongoose.Types.ObjectId.isValid(lastOrderOn)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lastOrderOn id",
      });
    }

    const customer = await CustomerSummary.create({
      name,
      email,
      phone,
      // telegramId,
      ...(lastOrderOn && { lastOrderOn }),
    });

    const populated = await CustomerSummary.findById(customer._id).populate({
      path: "lastOrderOn",
      populate: {
        path: "createdBy",
        select: "firstName lastName",
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: populated ? formatCustomer(populated) : null,
    });
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

/**
 * =========================
 * GET CUSTOMERS BY SHOP OWNER (PAGINATED)
 * Derived via lastOrderOn → Order.createdBy
 * =========================
 */
export const getCustomersByShopOwner = async (
  req: Request<{ shopOwnerId: string }>,
  res: Response
) => {
  try {
    const { shopOwnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(shopOwnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop owner id",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // 🔹 ADD SEARCH (PARAM NOT CHANGED)
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";


    // 1️⃣ Orders created by this shop owner
    const orders = await Order.find(
      { createdBy: shopOwnerId },
      { _id: 1 }
    );

    if (orders.length === 0) {
      return res.json({
        success: true,
        total: 0,
        page,
        totalPages: 0,
        data: [],
      });
    }

    const orderIds = orders.map((o) => o._id);

    // 2️⃣ Customers whose lastOrderOn belongs to those orders
    const filter: any = { lastOrderOn: { $in: orderIds } };

if (search && search.length >= 3) {
  filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
}


    const [total, customers] = await Promise.all([
      CustomerSummary.countDocuments(filter),
      CustomerSummary.find(filter)
        .populate({
          path: "lastOrderOn",
          populate: {
            path: "createdBy",
            select: "firstName lastName",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: customers.map(formatCustomer),
    });
  } catch (error) {
    console.error("GET CUSTOMERS BY OWNER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

/**
 * =========================
 * GET ALL CUSTOMERS (PAGINATED)
 * =========================
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // 🔹 ADD SEARCH (PARAM NOT CHANGED)
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const filter: any = {};

    if (search && search.length >= 3) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: [
                  { $ifNull: ["$lastOrderOn.createdBy.firstName", ""] },
                  " ",
                  { $ifNull: ["$lastOrderOn.createdBy.lastName", ""] },
                ],
              },
              regex: search,
              options: "i",
            },
          },
        },
      ];
    }

    const [total, customers] = await Promise.all([
      CustomerSummary.countDocuments(),
      CustomerSummary.find()
        .populate({
          path: "lastOrderOn",
          populate: {
            path: "createdBy",
            select: "firstName lastName",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: customers.map(formatCustomer),
    });
  } catch (error) {
    console.error("GET ALL CUSTOMERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

/**
 * =========================
 * UPDATE CUSTOMER
 * =========================
 */
export const updateCustomer = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id",
      });
    }

    if (
      req.body.lastOrderOn &&
      !mongoose.Types.ObjectId.isValid(req.body.lastOrderOn)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lastOrderOn id",
      });
    }

    const customer = await CustomerSummary.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate({
      path: "lastOrderOn",
      populate: {
        path: "createdBy",
        select: "firstName lastName",
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: formatCustomer(customer),
    });
  } catch (error) {
    console.error("UPDATE CUSTOMER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

/**
 * =========================
 * DELETE CUSTOMER
 * =========================
 */
export const deleteCustomer = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id",
      });
    }

    const customer = await CustomerSummary.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};

/**
 * =========================
 * GET CUSTOMER BY ID
 * =========================
 */
export const getCustomerById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id",
      });
    }

    const customer = await CustomerSummary.findById(id).populate({
      path: "lastOrderOn",
      populate: {
        path: "createdBy",
        select: "firstName lastName",
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: formatCustomer(customer),
    });
  } catch (error) {
    console.error("GET CUSTOMER BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};
/**
 * =========================
 * GET CUSTOMER BY TELEGRAM ID
 * =========================
 */
export const getCustomerByTelegramId = async (
  req: Request<{ telegramId: string }>,
  res: Response
) => {
  try {
    const { telegramId } = req.params;

    const customer = await CustomerSummary.findOne({ telegramId: Number(telegramId) }).populate({
      path: "lastOrderOn",
      populate: {
        path: "createdBy",
        select: "firstName lastName",
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: formatCustomer(customer),
    });
  } catch (error) {
    console.error("GET CUSTOMER BY TELEGRAM ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

/**get customer by phone number for whatsapp registration */

export const getCustomerByPhone = async (
  req: Request<{ phone: string }>,
  res: Response
) => {
  try {
    const { phone } = req.params;

    const customer = await CustomerSummary.findOne({ phone });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: formatCustomer(customer),
    });
  } catch (error) {
    console.error("GET CUSTOMER BY PHONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

/** WhatsApp Registration */

export const registerCustomerViaWhatsApp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, name, email } = req.body;

    if (!phone || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Phone, name and email are required",
      });
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existing = await CustomerSummary.findOne({ phone });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Customer already registered",
      });
    }

    const customer = await CustomerSummary.create({
      phone,
      name,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: formatCustomer(customer),
    });
  } catch (error) {
    console.error("REGISTER CUSTOMER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register customer",
    });
  }
};