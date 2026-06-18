import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import blogModel from "../models/blog.model.js";
export const createBlog = async (req: AuthenticatedRequest, res: Response) => {
    const { title, tags, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
    }

    try {
        const blog = new blogModel({
            title,
            tags: tags ?? [],
            content,
            author: req.user!.id,
            status: "draft",
        });
        const savedBlog = await blog.save();
        return res.status(201).json({
            message: "Blog created successfully",
            blog: savedBlog,
        });
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
