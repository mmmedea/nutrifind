import { Request, Response, NextFunction } from "express";
import { stripe } from "../utils/stripe";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

const DEMO_USER_EMAIL = "demo@example.com";

export async function createCheckoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      throw new AppError(404, "Demo user not found");
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      throw new AppError(500, "Stripe price ID is not configured");
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
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
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/?checkout=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed:", error);
    res.status(500).json({
      error: "Unable to create checkout session.",
    });
  }
}
