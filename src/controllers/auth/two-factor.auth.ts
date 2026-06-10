import { AuthenticatedRequest } from "../../lib/authenticatedRequest";
import type { Response } from "express";
import { generateSecret, generateURI, verify } from "otplib";
import { User } from "../../models/user.model";
import { decrypt, encrypt } from "../../lib/2fa-encrypt-decrypt";

//when user turns on the 2fa for first time
export async function twoFactorSetupHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authReq = req;
  const authUser = authReq.user;

  if (!authUser) {
    return res.status(401).json({
      message: "Not authenticated.",
    });
  }

  try {
    const user = await User.findById(authUser.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (
      user.twoFactorSecret?.iv ||
      user.twoFactorSecret?.content ||
      user.twoFactorSecret?.tag
    ) {
      return res.status(400).json({
        message: "2fa setup done already",
      });
    }

    //1. create a secret
    const secret = generateSecret();

    //2. issuer means app name
    const issuer = "NodeAuthApp";

    //3. now generate uri
    const otpAuthUrl = generateURI({
      issuer,
      label: user.email,
      secret,
    });

    console.log(otpAuthUrl);

    const twoFactorEncryptedSecret = encrypt(secret);

    console.log(twoFactorEncryptedSecret);
    user.twoFactorSecret = twoFactorEncryptedSecret;
    // user.twoFactorSecret.content = twoFactorEncryptedSecret.content;
    // user.twoFactorSecret.tag = twoFactorEncryptedSecret.tag;
    user.twoFactorEnabled = false;
    await user.save();

    return res.json({
      message: "two factor setup is done",
      otpAuthUrl,
      secret,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}

export async function twoFactorVerifyHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authReq = req;
  const authUser = authReq.user;

  if (!authUser) {
    return res.status(401).json({
      message: "Not authenticated.",
    });
  }

  const { code } = req.body as { code?: string };

  if (!code) {
    return res.status(401).json({
      message: "Two factor code is required.",
    });
  }

  try {
    const user = await User.findById(authUser.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.twoFactorEnabled) {
      return res
        .status(400)
        .json({ message: "2fa has been activated already." });
    }
    if (
      !user.twoFactorSecret?.iv ||
      !user.twoFactorSecret?.content ||
      !user.twoFactorSecret?.tag
    ) {
      return res.status(400).json({
        message: "You dont have 2fa setup.",
      });
    }

    const decrypted2faSecret = decrypt({
      iv: user.twoFactorSecret!.iv,
      content: user.twoFactorSecret!.content,
      tag: user.twoFactorSecret!.tag,
    });
    //verify code sent by user to verify if user has used same authenticator app that is registered with our app
    const isValid = await verify({ secret: decrypted2faSecret, token: code });

    if (!isValid) {
      return res.status(400).json({
        message: "invalid two factor code",
      });
    }

    user.twoFactorEnabled = true;
    await user.save();

    return res.json({ message: "Two factor enabled successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
