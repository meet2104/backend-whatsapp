import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id?: string;
    role?: string;
  };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
  req.userId = decoded.id;
  
  // Set user info including role for authorization
  req.user = {
    id: decoded.id,
    role: decoded.role
  };
  
  next();
};
