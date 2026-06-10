import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../lib/authenticatedRequest";
import { User } from "../models/user.model";
import { verifyAccessToken } from "../lib/token";

async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "You are not authenticated. Please login first." });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);

    if (!payload.sub || typeof payload.tokenVersion !== "number") {
      return res.status(401).json({ message: "Invalid Token." });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    const authReq = req;

    authReq.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "invalid token." });
  }
}

export default requireAuth;
