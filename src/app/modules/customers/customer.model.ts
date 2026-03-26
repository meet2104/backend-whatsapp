import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerSummary extends Document {
    name: string;
    email: string;
    phone: string;
    telegramId?: number;
    lastOrderOn?: mongoose.Types.ObjectId;
    shopOwner: mongoose.Types.ObjectId;
}

const customerSchema = new Schema<ICustomerSummary>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // telegramId: {
        //     type: Number,
        // },

        lastOrderOn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },  

        shopOwner: {
            type: Schema.Types.ObjectId,
            ref: "User", // ✅ correct
            default: null,
        },

    },
    { timestamps: true }
);

const CustomerSummary = mongoose.model<ICustomerSummary>("Customer", customerSchema);

export default CustomerSummary;