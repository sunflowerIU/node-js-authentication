import express from "express";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/me", (_req: Request, res: Response) => {
  res.status(200).json({ message: "hello its me" });
});

export default router;
