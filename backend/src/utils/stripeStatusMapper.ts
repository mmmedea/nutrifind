import { SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";

/**
 * Maps Stripe subscription status to our Prisma SubscriptionStatus enum.
 * Includes all relevant Stripe statuses and a fallback to INACTIVE.
 */
export function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "unpaid":
      return SubscriptionStatus.UNPAID;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.INACTIVE;
  }
}
