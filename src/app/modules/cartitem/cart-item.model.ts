import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface ICartItem extends Document {
    cartId: Types.ObjectId;

    productId: Types.ObjectId;
    quantity: number;
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    deletedBy?: Types.ObjectId;

    isDeleted: boolean;
    deletedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
    {
        cartId: {
            type: mongoose.Types.ObjectId,
            ref: "Cart",
            required: true,
        },

        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
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

export default model<ICartItem>("CartItem", cartItemSchema);