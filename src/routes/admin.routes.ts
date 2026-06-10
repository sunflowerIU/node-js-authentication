import type { Request, Response } from "express";
import { Router } from "express";

const router = Router();

router.get("/me", (_req: Request, res: Response) => {
  res.status(200).json({ message: "hello this is admin." });
});

export default router;
