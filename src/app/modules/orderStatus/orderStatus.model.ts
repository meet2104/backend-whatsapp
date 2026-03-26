import { Schema, model } from "mongoose";

const orderStatusSchema = new Schema(
    {
        label: {
            type: String,
            required: true, // Pending, Confirmed, Delivered...
        },
    },
    { timestamps: true }
);

export default model("OrderStatus", orderStatusSchema);
