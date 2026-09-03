import Stripe from "stripe";
import { getEnv } from "../config/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const env = getEnv();
    stripeClient = new Stripe(env.stripeSecret);
  }
  return stripeClient;
}
