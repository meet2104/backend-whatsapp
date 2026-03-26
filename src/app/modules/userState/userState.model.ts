import mongoose, { Schema, Document } from "mongoose";

export interface IUserState extends Document {
  phone: string;
  status: string;
  productId?: mongoose.Types.ObjectId | null;
  tempName?: string;
}

const userStateSchema = new Schema<IUserState>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      default: "idle",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      default: null
    },
    tempName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const UserState = mongoose.model<IUserState>("UserState", userStateSchema);

export default UserState;