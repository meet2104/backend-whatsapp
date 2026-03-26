import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IexternalCustomerUser extends Document {
    ownerId: Types.ObjectId;
    userRandomId: Number;
    phoneNumber: string;
    customerName: string;

    cartId: Types.ObjectId;

    orderId: Types.ObjectId;

    latitude: number;
    longitude: number;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    deletedBy?: Types.ObjectId;

    isDeleted: boolean;
    deletedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const externalCustomerUser = new Schema<IexternalCustomerUser>(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        userRandomId: {// apdi side thi generate thay che
            type: Number,
            required: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            index: true,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        cartId: {
            type: mongoose.Types.ObjectId,
            ref: "Cart",
        //    required: true,
            index: true,
        },
        orderId: {
            type: mongoose.Types.ObjectId,
            ref: "Order",
          //  required: true,
            index: true,
        },
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90,
        },

        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180,
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
            default: false,
        },

        deletedAt: Date,
    },
    { timestamps: true }
);

export default model<IexternalCustomerUser>(
    "externalCustomerUser",
    externalCustomerUser
);
