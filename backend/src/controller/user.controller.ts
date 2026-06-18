import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
export const sentOtp = async (req: Request, res: Response) => {
  if (!req.body.mobileNumber || req.body.mobileNumber.length !== 10) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }

  try {
    const existingUser = await userModel.findOne({
      mobileNumber: req.body.mobileNumber,
    }); //TODO:what if i only user the mobileNumber
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    console.log("otp", otp, "otpExpiry", otpExpiry);
    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;
    await existingUser.save();
    console.log(`OTP for ${existingUser.mobileNumber}: ${otp}`);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    throw error;
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  //1. validate the request body or otp
  if (
    !req.body ||
    !req.body.otp ||
    !req.body.mobileNumber ||
    req.body.mobileNumber.length !== 10 ||
    req.body.otp.length !== 6
  ) {
    return res.status(400).json({ message: "mobile number or otp is invalid" });
  }
  try {
    const user = await userModel.findOne({
      mobileNumber: req.body.mobileNumber,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("user otp", user.otp);
    if (
      user.otp !== req.body.otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const accessToken = jwt.sign(
      { id: user._id, mobileNumber: user.mobileNumber, role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "24h" },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      // accessToken,
      // refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createUser = async (req: AuthenticatedRequest, res: Response) => {


  const { userName, mobileNumber, role } = req.body;


  if (!userName || !mobileNumber || !role) {
    return res.status(400).json({ message: "userName, mobileNumber, and role are required" });
  }
  if (req.user?.role !== "super-admin") {
    return res.status(403).json({ message: "access denied" });
  }

  if (mobileNumber.length !== 10) {
    return res.status(400).json({ message: "Mobile number must be 10 digits" });
  }

  try {
    const existingUser = await userModel.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this mobile number already exists" });
    }
    const newUser = new userModel({ userName, mobileNumber, role });
    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        userName: newUser.userName,
        mobileNumber: newUser.mobileNumber,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
