import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
    ownerId: Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    unit: Types.ObjectId; // Reference to Unit model
    isAvailable: boolean;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    deletedBy?: Types.ObjectId;

    isDeleted: boolean;
    deletedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            default: 0
        },
        unit: {
            type: Schema.Types.ObjectId,
            ref: "Unit", // ✅ MUST MATCH MODEL NAME
            required: true,
            default: "697c60dce285fe43f0dc9051", // Default Unit ObjectId
        },


        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,
    },
    { timestamps: true }
);

export default model<IProduct>("Product", productSchema);
