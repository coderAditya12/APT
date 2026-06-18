import express from "express";
import type { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/user.routes.js";
import connectDB from "./database/db.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

interface CustomError extends Error {
  statusCode?: number;
}

app.use(express.json());
app.use("/api", userRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "internal server error";
  res.status(statusCode).json({ success: false, statusCode, message });
});
app.listen(3000, () => {
  connectDB();
  console.log("server is running on port 3000");
});
