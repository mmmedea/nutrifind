import { Request, Response, NextFunction } from "express";
import { stripe } from "../utils/stripe";
import prisma from "../utils/prisma";

export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";

  let event;

  try {
    if (!webhookSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }
    
    // Express needs the raw body to verify Stripe signatures.
    // In our app.ts, we need to ensure this route uses express.raw() instead of express.json()
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        
        await prisma.user.updateMany({
          where: { stripeCustomerId: subscription.customer },
          data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status === "active" || subscription.status === "trialing" ? "ACTIVE" : "INACTIVE",
          },
        });
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode === "subscription" && session.subscription) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: session.customer },
            data: {
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: "ACTIVE", // Optimistic update, usually covered by subscription.created
            }
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
