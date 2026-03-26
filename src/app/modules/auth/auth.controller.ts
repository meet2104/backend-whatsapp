import type { Request, Response } from "express";
import User from "../user/User.model.js";
import type { IUser } from "../user/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../../shared/utils/sendEmail.js";
import { getIO } from "../../cors/socket/socket.js";


 //LOGIN

export const login = async (req: Request, res: Response) => {
  try {
    const allowedKeys = ["email", "password"];
    const bodyKeys = Object.keys(req.body);

    if (bodyKeys.some((key) => !allowedKeys.includes(key))) {
      return res.status(400).json({
        message: "Only email and password are allowed for login",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).populate("role", "name");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.role) {
      return res.status(403).json({
        message: "User role not assigned. Contact admin.",
      });
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return res.status(500).json({
        message: "JWT secrets not configured",
      });
    }

    const roleName = (user.role as any).name;

    const accessToken = jwt.sign(
      {
        id: user._id,
        role: roleName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // 🔔 SOCKET (SAFE)
    const io = getIO();
    if (io) {
      io.to(user._id.toString()).emit("notification", {
        message: "User logged in successfully",
        time: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/*REFRESH TOKEN*/
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as any;

    const user = await User.findById(decoded.id).populate("role", "name");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        role: (user.role as any).name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};


/* FORGOT PASSWORD*/
export const forgotPassword = async (req: Request, res: Response) => {
  const user = (await User.findOne({
    email: req.body.email,
  })) as IUser;

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(20).toString("hex");

  user.resetToken = token;
  user.resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail(user.email, token);

  res.json({ message: "Reset link sent" });
};

/* RESET PASSWORD*/
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = (await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: new Date() },
    })) as IUser;

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch {
    res.status(500).json({ message: "Reset password failed" });
  }
};
