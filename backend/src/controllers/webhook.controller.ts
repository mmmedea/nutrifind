import type { Request, Response, NextFunction } from "express";
import { SubscriptionStatus } from "@prisma/client";
import { getEnv } from "../config/env";
import { getStripe } from "../utils/stripe";
import { mapStripeStatus } from "../utils/stripeStatusMapper";
import prisma from "../utils/prisma";
const DEMO_USER_EMAIL = "demo@example.com";
export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  // Extract and validate Stripe signature header
const signatureHeader = req.headers["stripe-signature"];
if (!signatureHeader || Array.isArray(signatureHeader)) {
  return res.status(400).json({
    message: "Missing or invalid Stripe signature.",
  });
}
const signature = signatureHeader as string;

  try {
    const env = getEnv();
    const stripe = getStripe();
// duplicate stripe initialization removed
    // Verify Stripe signature; if verification fails, an error is thrown and caught by the outer catch block
    const event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

        // Try to find the user by either Stripe IDs first
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { stripeCustomerId: customerId },
            ],
          },
        });
        // Fallback to the known demo user if not found
        if (!user) {
          user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
        }
        if (!user) {
          throw new Error("Demo user not found");
        }
        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: mapStripeStatus(subscription.status),
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;
        // Try to find the user by either Stripe IDs first
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { stripeCustomerId: customerId },
            ],
          },
        });
        // Fallback to demo user if not found
        if (!user) {
          user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
        }
        if (!user) {
          throw new Error("Demo user not found");
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: SubscriptionStatus.INACTIVE },
        });
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode === "subscription" && session.subscription) {
          const customerId = typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
          const subscriptionId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

          // Update demo user with Stripe IDs only; status will be set by subscription events
          await prisma.user.update({
            where: { email: DEMO_USER_EMAIL },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            },
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook verification failed:", error);
    return res.status(400).json({ message: "Invalid webhook signature." });
  }
}
