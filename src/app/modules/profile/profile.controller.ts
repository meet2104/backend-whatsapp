import type { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../user/User.model.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { IUser } from "../user/User.model.js";
import mongoose from "mongoose";

/* ================= GET PROFILE ================= */
export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId)
    .select(
      "firstName lastName email companayName role address mobile lat lng profileImage"
    )
    .populate("role", "displayName name");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email,
    companayName: user.companayName,
    address: user.address,
    mobile: user.mobile,
    lat: user.lat,
    lng: user.lng,
    profileImage: user.profileImage ?? null,
  });
};



export const updateProfile = async (req: AuthRequest, res: Response) => {
  const {
    firstName,
    lastName,
    companayName,
    address,
    mobile,
    lat,
    lng,
    profileImage,
  } = req.body;

  const updateData: Partial<IUser> = {
    firstName,
    lastName,
    companayName,
    address,
    mobile,
    lat,
    lng,
    updatedBy: new mongoose.Types.ObjectId(req.userId),
  };

  // ✅ HANDLE PROFILE IMAGE (exactOptionalPropertyTypes safe)
  if (profileImage) {
    // REMOVE IMAGE
    if (profileImage.url === "") {
      updateData.profileImage = {
        url: "",
      };
    }

    // ADD / UPDATE IMAGE
    else if (typeof profileImage.url === "string") {
      updateData.profileImage = {
        url: profileImage.url,
        ...(profileImage.publicId && { publicId: profileImage.publicId }),
      };
    }
  }

  const user = await User.findByIdAndUpdate(req.userId, updateData, {
    new: true,
  })
    .select("firstName lastName role profileImage")
    .populate("role", "displayName name");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImage: user.profileImage ?? null,
  });
};


/* ================= CHANGE PASSWORD ================= */
export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = (await User.findById(req.userId)) as IUser;
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return res.status(400).json({ message: "Current password incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
};
