import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IOrder extends Document {
    orderRandomId: Number;

    customerId: string;

    statusId: Types.ObjectId;
    summary: string;
    
    
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    deletedBy?: Types.ObjectId;

    isDeleted: boolean;
    deletedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        orderRandomId: {
            type: Number,
            required: true,
            index: true,
        },

        customerId: {
            type: String,
            required: true,
        },

        statusId: { // Order Status table reference
            type: mongoose.Types.ObjectId,
            ref: "OrderStatus",
            required: true,
            default: "697c4cd185ce39860475074a",
        },

        summary: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
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

export default model<IOrder>("Order", orderSchema);