import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface ICart extends Document {

    customerId: Types.ObjectId;
   
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    deletedBy?: Types.ObjectId;

    isDeleted: boolean;
    deletedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
    {

        customerId: {
            type: mongoose.Types.ObjectId,
            ref: "Customer",
            required: true,
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

export default model<ICart>("Cart", cartSchema);