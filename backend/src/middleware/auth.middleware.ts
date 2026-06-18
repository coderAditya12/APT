import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    mobileNumber: string;
    role: string;
  };
}
export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  try {
    // Verify the token using the same secret used to sign it in verifyOtp
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      mobileNumber: string;
      role: string;
    };
    // if user have other role
    if (decoded.role ==="user"){
      return res.status(403).json({message:"Access denied"})
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Token is invalid or expired" });
  }
};
