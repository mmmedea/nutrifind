import express from "express";
import cors from "cors";
import "dotenv/config";

import { searchProducts } from "./controllers/product.controller";
import { getRecentSearches } from "./controllers/search.controller";
import { createCheckoutSession } from "./controllers/subscription.controller";
import { handleStripeWebhook } from "./controllers/webhook.controller";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());

// Webhook must be parsed as raw body for Stripe signature verification
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

// All other routes can use JSON body parser
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products/search", searchProducts);
app.get("/api/searches/recent", getRecentSearches);
app.post("/api/subscription/checkout", createCheckoutSession);

app.use(errorHandler);

export default app;
