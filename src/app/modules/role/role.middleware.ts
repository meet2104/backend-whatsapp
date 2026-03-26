import type{ Request, Response, NextFunction } from "express";

export const authorizeRoles = (...roles: string[]) => {
  return (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
