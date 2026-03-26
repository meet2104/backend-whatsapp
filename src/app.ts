import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "../src/app/modules/auth/auth.routes.js";
import userRoutes from "../src/app/modules/user/user.routes.js";
import profileRoutes from "../src/app/modules/profile/profile.routes.js";
import orderRoutes from "../src/app/modules/order/order.routes.js";
import orderItemRoutes from "../src/app/modules/orderitem/order-item.routes.js";
import productRoutes from "../src/app/modules/product/product.routes.js";
import unitRoutes from "../src/app/modules/product/unit.routes.js";
import customerRoutes from "../src/app/modules/customers/customer.routes.js";
// ✅ Ensure models are registered
import "../src/app/modules/product/unit.model.js";
import "../src/app/modules/role/Role.model.js";

dotenv.config();

const app = express();

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* =========================
   CORS CONFIG
========================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/products", productRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/carts", (await import("../src/app/modules/cart/cart.routes.js")).default);
app.use("/api/cart-items", (await import("../src/app/modules/cartitem/cart-item.routes.js")).default);


/* =========================
   404 HANDLER
========================= */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "API route not found" });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
);

/* Test Route */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

export default app;
