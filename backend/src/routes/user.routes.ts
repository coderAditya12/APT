import express from "express"
import { sentOtp, verifyOtp, createUser } from "../controller/user.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/v1/user/login", sentOtp)
router.post("/v1/user/verify-otp", verifyOtp)
router.post("/v1/user/create", verifyToken, createUser)

export default router