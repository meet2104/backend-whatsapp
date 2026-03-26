import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  name?: string;

  email: string;
  password: string;
  role: mongoose.Types.ObjectId;

  mobile: number;
  companayName: string;
  address?: string;

  lat: number;
  lng: number;

  isActive: boolean;

  // ✅ NEW
  profileImage?: {
    url: string;
    publicId?: string; // for cloud providers (optional)
  };

  resetToken?: string | null;
  resetTokenExpire?: Date | null;

  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    name: { type: String },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    mobile: {
      type: Number,
      required: true,
      trim: true,
    },

    companayName: {
      type: String,
      required: true,
    },

    address: String,

    lat: {
      type: Number,
      required: true,
    },

    lng: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ PROFILE IMAGE
    profileImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
      },
    },

    resetToken: String,
    resetTokenExpire: Date,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const User = mongoose.model<IUser>("User", userSchema);
export default User;