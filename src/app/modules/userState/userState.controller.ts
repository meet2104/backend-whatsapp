import type { Request, Response } from "express";
import UserState from "./userState.model.js";

export const getUserState = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone parameter is required",
      });
    }

    const state = await UserState.findOne({ phone });

    if (!state) {
      return res.json({
        success: true,
        data: null,
      });
    }

    return res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user state",
    });
  }
};

export const updateUserState = async (req: Request, res: Response) => {
  try {
    const { phone, status, tempName, productId } = req.body;

    const state = await UserState.findOneAndUpdate(
      { phone },
      { status, tempName, productId },   // 👈 added productId
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user state",
    });
  }
};