import { Router } from "express";
import {
  forgotPaswordHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth/auth.controller";
import {
  googleAuthCallbackHandler,
  googleAuthStartHandler,
} from "../controllers/auth/google-auth.controller";
import requireAuth from "../middleware/requireAuth";
import {
  twoFactorSetupHandler,
  twoFactorVerifyHandler,
} from "../controllers/auth/two-factor.auth";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/verify-email", verifyEmailHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.post("/forgot-password", forgotPaswordHandler);
router.post("/reset-password", resetPasswordHandler);

router.get("/google", googleAuthStartHandler);
router.get("/google/callback", googleAuthCallbackHandler);

router.post("/2fa/setup", requireAuth, twoFactorSetupHandler);
router.post("/2fa/verify", requireAuth, twoFactorVerifyHandler);

export default router;
