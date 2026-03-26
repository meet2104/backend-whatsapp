import { Router } from "express";
import {
  createCustomer,
  getCustomersByShopOwner,
  getCustomerById,
  updateCustomer,
  getAllCustomers,
  deleteCustomer,
  getCustomerByTelegramId,
  getCustomerByPhone,
  registerCustomerViaWhatsApp,
} from "./customer.controller.js";

const router = Router();

/* =========================
   WhatsApp Registration
========================= */
router.get("/phone/:phone", getCustomerByPhone);
router.post("/register-whatsapp", registerCustomerViaWhatsApp);

/* =========================
   Existing Routes
========================= */
router.get("/shop/:shopOwnerId", getCustomersByShopOwner);
// router.get("/by-telegram/:telegramId", getCustomerByTelegramId);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;