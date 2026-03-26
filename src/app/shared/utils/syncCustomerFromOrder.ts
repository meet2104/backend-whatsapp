import mongoose from "mongoose";
import CustomerSummary from "../../modules/customers/customer.model.js";
import Order from "../../modules/order/order.model.js";

export const syncCustomerFromOrder = async (order: any) => {
  if (!order) return;

  const { customerName, customerEmail, customerPhone } = order;

  if (!customerPhone) return;

  // 🔍 Find existing customer by phone (primary) or email
  let customer = await CustomerSummary.findOne({
    $or: [
      { phone: customerPhone },
      ...(customerEmail ? [{ email: customerEmail }] : []),
    ],
  });

  // 🆕 If customer does not exist → create
  if (!customer) {
    customer = await CustomerSummary.create({
      name: customerName || "Unknown",
      email: customerEmail || "",
      phone: customerPhone,
      lastOrderOn: order._id,
    });
    return;
  }

  // 🔁 Update last order reference
  await CustomerSummary.findByIdAndUpdate(customer._id, {
    lastOrderOn: order._id,
  });
};