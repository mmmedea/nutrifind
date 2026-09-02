import Stripe from "stripe";
import "dotenv/config";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "sk_test_mock";

export const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-06-20" as any, // Bypass TS error for specific Stripe package version
});
