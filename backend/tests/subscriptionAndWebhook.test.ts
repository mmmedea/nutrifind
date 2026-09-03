// backend/tests/subscriptionAndWebhook.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import prisma from "../src/utils/prisma";
import { getEnv } from "../src/config/env";
import Stripe from "stripe";

// Helper to reset demo user to a known baseline before each test
async function resetDemoUser() {
  const DEMO_EMAIL = "demo@example.com";
  await prisma.user.updateMany({
    where: { email: DEMO_EMAIL },
    data: {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "INACTIVE",
    },
  });
}

describe("Subscription status enforcement", () => {
  beforeEach(async () => {
    await resetDemoUser();
  });

  const cases = [
    { status: "ACTIVE", expectNutrition: true },
    { status: "TRIALING", expectNutrition: true },
    { status: "PAST_DUE", expectNutrition: false },
    { status: "UNPAID", expectNutrition: false },
    { status: "CANCELED", expectNutrition: false },
    { status: "INACTIVE", expectNutrition: false },
  ];

  for (const { status, expectNutrition } of cases) {
    it(
      `should ${expectNutrition ? "expose" : "lock"} nutrition for status ${status}`,
      async () => {
      await prisma.user.update({
        where: { email: "demo@example.com" },
        data: { subscriptionStatus: status as any },
      });
      const res = await request(app).get("/api/products/search?q=mock");
      expect(res.status).toBe(200);
      const product = res.body.products[0];
      if (expectNutrition) {
        expect(product.nutrition).not.toBeNull();
        expect(product.nutritionLocked).toBe(false);
      } else {
        expect(product.nutrition).toBeNull();
        expect(product.nutritionLocked).toBe(true);
      }
    });
  }
});

describe("/api/subscription/status endpoint", () => {
  beforeEach(async () => {
    await resetDemoUser();
  });

  it("returns active:true for ACTIVE status", async () => {
    await prisma.user.update({
      where: { email: "demo@example.com" },
      data: { subscriptionStatus: "ACTIVE" },
    });
    const res = await request(app).get("/api/subscription/status");
    expect(res.status).toBe(200);
    expect(res.body.active).toBe(true);
  });

  it("returns active:true for TRIALING status", async () => {
    await prisma.user.update({
      where: { email: "demo@example.com" },
      data: { subscriptionStatus: "TRIALING" },
    });
    const res = await request(app).get("/api/subscription/status");
    expect(res.status).toBe(200);
    expect(res.body.active).toBe(true);
  });

  it("returns active:false for INACTIVE status", async () => {
    const res = await request(app).get("/api/subscription/status");
    expect(res.status).toBe(200);
    expect(res.body.active).toBe(false);
  });
});

describe("Stripe webhook handling", () => {
  const env = getEnv();
  const stripe = new Stripe(env.stripeSecret);
  const webhookSecret = env.stripeWebhookSecret;

  beforeEach(async () => {
    await resetDemoUser();
  });

  it("rejects request with invalid signature", async () => {
    const payload = JSON.stringify({ id: "evt_invalid", type: "customer.subscription.created", data: { object: {} } });
    const res = await request(app)
      .post("/api/webhooks/stripe")
      .set("stripe-signature", "invalid-signature")
      .set("Content-Type", "application/json")
      .send(payload);
    expect(res.status).toBe(400);
  });

  it("processes customer.subscription.created and updates user", async () => {
    const payload = JSON.stringify({
      id: "evt_1",
      type: "customer.subscription.created",
      data: {
        object: {
          id: "sub_123",
          status: "active",
          customer: "cus_456",
        },
      },
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });
    const res = await request(app)
      .post("/api/webhooks/stripe")
      .set("stripe-signature", signature)
      .set("Content-Type", "application/json")
      .send(payload);
    expect(res.status).toBe(200);
    const user = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
    expect(user?.stripeCustomerId).toBe("cus_456");
    expect(user?.stripeSubscriptionId).toBe("sub_123");
    expect(user?.subscriptionStatus).toBe("ACTIVE");
  });

  it("processes checkout.session.completed without changing status", async () => {
    await prisma.user.update({
      where: { email: "demo@example.com" },
      data: { subscriptionStatus: "ACTIVE" },
    });
    const payload = JSON.stringify({
      id: "evt_2",
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          customer: "cus_789",
          subscription: "sub_999",
        },
      },
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });
    const res = await request(app)
      .post("/api/webhooks/stripe")
      .set("stripe-signature", signature)
      .set("Content-Type", "application/json")
      .send(payload);
    expect(res.status).toBe(200);
    const user = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
    expect(user?.stripeCustomerId).toBe("cus_789");
    expect(user?.stripeSubscriptionId).toBe("sub_999");
    expect(user?.subscriptionStatus).toBe("ACTIVE");
  });
});
