import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../lib/authenticatedRequest";

async function checkAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authReq = req;

  const user = authReq.user;
  if (!user) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (user.role !== "admin") {
    console.log("haha");
    return res
      .status(403)
      .json({ message: "Sorry, only admin can access this route." });
  }

  next();
}

export default checkAdmin;
