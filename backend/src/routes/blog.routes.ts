import express from "express"
import { createBlog } from "../controller/blog.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()
router.post("/v1/blog/create", verifyToken, createBlog)

export default router
