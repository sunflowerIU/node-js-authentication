import type { Request } from "express";
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null | undefined;
    role: "user" | "admin";
    isEmailVerified: boolean;
  };
}
