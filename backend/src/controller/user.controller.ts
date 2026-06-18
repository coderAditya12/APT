import type { Request, Response } from "express";
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
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
