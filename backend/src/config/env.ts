function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export const getEnv = () => ({
  databaseUrl: requireEnv('DATABASE_URL'),
  stripeSecret: requireEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
  stripePriceId: requireEnv('STRIPE_PRICE_ID'),
  frontendUrl: requireEnv('FRONTEND_URL'),
});
