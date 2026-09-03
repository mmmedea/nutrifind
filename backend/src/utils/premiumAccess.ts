import { SubscriptionStatus } from "@prisma/client";

/**
 * Determines whether a user with the given subscription status has premium access.
 * Premium is granted for ACTIVE and TRIALING statuses.
 */
export function hasPremiumAccess(status: SubscriptionStatus): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;
}
