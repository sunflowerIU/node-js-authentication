import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "./auth.schema";
import { User } from "../../models/user.model";
import { checkPassword, hashPassword } from "../../lib/hash";
import crypto from "crypto";
import { sendEmail } from "../../lib/email";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../../lib/token";
import { verify } from "otplib";
import { decrypt } from "../../lib/2fa-encrypt-decrypt";

function getAppUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
}

// create new account
export async function registerHandler(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({ message: "invalid data", errors: result.error });
    }

    const { name, email, password } = result.data;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "This email has been used already.",
      });
    }

    //if not then hash password
    const passwordHash = await hashPassword(password);

    //create user
    const newlyCreatedUser = await User.create({
      email: normalizedEmail,
      passwordHash,
      name,
      role: "user",
      isEmailVerified: false,
      twoFactorEnabled: false,
    });

    //email verification
    const verifyToken = jwt.sign(
      { sub: newlyCreatedUser.id },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    const verifyUrl = `${getAppUrl()}/auth/verify-email?token=${verifyToken}`;

    await sendEmail(
      newlyCreatedUser.email,
      "Verify your email",
      `<p>Please verify your email by clicking this link: </p>
        <p>
            <a href="${verifyUrl}">
            ${verifyUrl}
            </a>
        </p>    
        `,
    );

    return res.status(200).json({
      message: "User registered",
      user: {
        id: newlyCreatedUser.id,
        email: newlyCreatedUser.email,
        role: newlyCreatedUser.role,
        isEmailVerified: newlyCreatedUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// verify email
export async function verifyEmailHandler(req: Request, res: Response) {
  const token = req.query.token as string | undefined;

  if (!token) {
    return res.status(400).json({ message: "Verification token is missing." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      sub: string;
    };

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (user.isEmailVerified) {
      return res.json({ message: "Email is verified already." });
    }

    user.isEmailVerified = true;
    await user.save();
    res.status(200).json({
      message: "Email is now verified. You can now login.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
}

//login handle
export async function loginHandler(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "invalid data.",
        errors: result.error,
      });
    }

    const { email, password, twoFactorCode } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
      });
    }

    //check password
    const ok = await checkPassword(password, user.passwordHash);

    if (!ok) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    //return if email isnot verified
    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    //need twoFactorCode if twoFactor is enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode || typeof twoFactorCode !== "string") {
        return res.status(400).json({
          message: "Two factor code is required.",
        });
      }

      if (
        !user.twoFactorSecret!.iv ||
        !user.twoFactorSecret!.content ||
        !user.twoFactorSecret!.tag
      ) {
        return res.status(400).json({
          message: "Two factor misconfigured in this account.",
        });
      }

      //first decrypt secret of 2fa
      const decrypted2faSecret = decrypt({
        iv: user.twoFactorSecret!.iv,
        content: user.twoFactorSecret!.content,
        tag: user.twoFactorSecret!.tag,
      });

      //verify code using otplib
      const isValidCode = await verify({
        secret: decrypted2faSecret,
        token: twoFactorCode,
      });
      console.log(isValidCode);

      if (!isValidCode.valid) {
        return res.status(400).json({ message: "invalid two factor code." });
      }
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh", //tell browser to send this cookie only for this route
    });

    return res.status(200).json({
      message: "Login Successful.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

//refresh handler
export async function refreshHandler(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      return res.status(401).json({ message: "refresh token missing" });
    }
    const payload = verifyRefreshToken(token);

    const { sub: userId, tokenVersion } = payload;

    const user = await User.findById(userId);

    if (!user) return res.status(401).json({ message: "User not found." });

    if (tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Refresh token invalid" });
    }

    //create new access token
    const newAccessToken = createAccessToken(
      userId,
      user.role,
      user.tokenVersion,
    );

    const newRefreshToken = createRefreshToken(userId, user.tokenVersion);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh", //tell browser to send this cookie only for this route
    });
    return res.status(200).json({
      message: "token refresh Successful.",
      accessToken: newAccessToken,
      user: {
        id: userId,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

//logout
export async function logoutHandler(_req: Request, res: Response) {
  res.clearCookie("refreshToken", { path: "/auth/refresh" });
  return res.status(200).json({
    message: "Logout successful.",
  });
}

//forgot password handler
export async function forgotPaswordHandler(req: Request, res: Response) {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  const normalisedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalisedEmail });

    if (!user) {
      return res.json({
        message: "If this email exists then we will send a link to your email.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordToken = tokenHash;

    await user.save();

    const resetPassUrl = `${getAppUrl()}/auth/reset-password?token=${rawToken}`;
    await sendEmail(
      user.email,
      "Reset password",
      `
      <p>click on the link below to reset the password: 
      </p>

      <p>
        <a href="${resetPassUrl}">${resetPassUrl}</a>
      </p>
      
      `,
    );
    return res.json({
      message: "If this email exists then we will send a link to your email.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}

//reset password handler
export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { token, password } = req.body as {
      token?: string;
      password: string;
    };

    if (!token) {
      return res.status(400).json({ message: "No reset token available" });
    }

    if (!password) {
      return res.status(400).json({ message: "New password is required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password me must be more than 6 character." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    const newPasswordHash = await hashPassword(password);
    user.passwordHash = newPasswordHash;
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    user.tokenVersion += 1;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful. Please login again.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}
