import express from "express"
import {sentOtp,verifyOtp} from "../controller/user.controller.js"
const router = express.Router()
router.post("/v1/user/login", sentOtp)
router.post("/v1/user/verify-otp", verifyOtp)

export default router