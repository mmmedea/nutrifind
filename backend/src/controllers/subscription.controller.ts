import type { Request, Response, NextFunction } from "express";
import { getEnv } from "../config/env";
import { getStripe } from "../utils/stripe";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

// Use existing constant if defined elsewhere; fallback defined here for safety
const DEMO_USER_EMAIL = "demo@example.com";

export async function createCheckoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const env = getEnv();
    const stripe = getStripe();

    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      throw new AppError(404, "Demo user not found");
    }

    const priceId = env.stripePriceId;
    if (!priceId) {
      throw new AppError(500, "Stripe price ID is not configured");
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.frontendUrl}/?checkout=success`,
      cancel_url: `${env.frontendUrl}/?checkout=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed:", error);
    return res.status(500).json({ message: "Unable to start checkout. Please try again." });
  }
}
