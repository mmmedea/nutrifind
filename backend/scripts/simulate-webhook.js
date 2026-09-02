const Stripe = require("stripe");
const axios = require("axios");
require("dotenv").config();

const secret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

async function main() {
  const eventType = process.argv[2] || "customer.subscription.created";
  
  const payload = JSON.stringify({
    id: "evt_test_123",
    type: eventType,
    data: {
      object: {
        customer: "cus_test123", // Matches our mock user
        id: "sub_test123",
        status: eventType === "customer.subscription.deleted" ? "canceled" : "active"
      }
    }
  });

  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });

  try {
    const res = await axios.post("http://localhost:4000/api/webhooks/stripe", payload, {
      headers: {
        "stripe-signature": header,
        "Content-Type": "application/json"
      }
    });
    console.log(`Webhook ${eventType} delivered successfully!`, res.data);
  } catch (err) {
    console.error("Webhook failed:", err.response?.data || err.message);
  }
}

main();
