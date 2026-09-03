import type { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { hasPremiumAccess } from "../utils/premiumAccess";

const DEMO_USER_EMAIL = "demo@example.com";

export async function getSubscriptionStatus(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      return res.status(404).json({
        message: "Demo user not found.",
      });
    }

    return res.status(200).json({
      status: user.subscriptionStatus,
      active: hasPremiumAccess(user.subscriptionStatus),
    });
  } catch (error) {
    next(error);
  }
}
