# NutriFind

NutriFind is a full-stack Next.js and Express application designed to help users search for packaged food products and access their nutritional information. Built as a technical assignment, the application integrates with the Open Food Facts API and uses Stripe to gate detailed nutritional data behind a premium subscription.

## Features

- **Product Search:** Real-time search of packaged foods using the Open Food Facts API.
- **Internationalization (i18n):** User interface localized in English, Dutch, German, and French, with fallback mechanisms.
- **Subscription Gating:** Nutritional information is restricted to subscribed users. Non-subscribers see a lock screen with a prompt to upgrade via Stripe.
- **Recent Searches:** Searches are persisted to a MySQL database and displayed in a sidebar for quick access.
- **Resilient Fallbacks:** In development mode, if the legacy Open Food Facts endpoint returns a 503 (due to rate limits), the backend falls back to mock data to ensure the UI can still be evaluated.

## Architecture

- **Frontend:** Next.js (React), Tailwind CSS.
- **Backend:** Node.js, Express, TypeScript, Vitest (Testing).
- **Database:** MySQL, managed via Prisma 7.
- **Integrations:** Open Food Facts (legacy `/cgi/search.pl`), Stripe Billing.

## Prerequisites

- Node.js (v20+)
- MySQL (or XAMPP)
- Stripe Account (for Webhook and Secret keys)

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   # From the root directory
   npm run install:all
   ```
3. **Database Configuration:**
   - Create a MySQL database named `nutrifind`.
   - In `backend/.env`, set `DATABASE_URL="mysql://root:@localhost:3306/nutrifind"`
   - Note: Prisma connects natively using `mysql2` behind the scenes.
4. **Environment Variables:**
   - Copy `.env.example` in both `frontend/` and `backend/` to `.env` and fill in the required keys, particularly the Stripe secrets if you wish to test the subscription flow.
5. **Run Migrations & Seed:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   *(The seed script creates a demo user `demo@example.com` which is used to track recent searches and test subscription status).*
6. **Start the Development Servers:**
   ```bash
   # From the root directory
   npm run dev
   ```
   - Frontend will run on `http://localhost:3000`
   - Backend will run on `http://localhost:4000`

## Architecture

```text
Browser / Next.js
       │
       ▼
Express Backend
   │       │
   │       ├── Stripe
   │       │
   │       ├── Open Food Facts
   │       │
   ▼       │
Prisma → MySQL
```

The application uses a clean layer separation:
- **Routing:** Express endpoints parse input and delegate to services.
- **Service Layer:** `OpenFoodFactsService` fetches raw data from the legacy OFF API. `ProductAccessService` applies business logic to conditionally strip out nutrition fields based on subscription status.
- **Data Layer:** Prisma abstracts MySQL operations.

## Security & Premium Rules

The premium gate operates securely on the backend:
1. When `SubscriptionStatus` is `INACTIVE`, the backend forces all nutrition data to `null` and sets `nutritionLocked = true` before sending JSON to the frontend.
2. When `ACTIVE`, the full nutrition object is sent.
This ensures detailed metrics (calories, fat, protein, etc.) are never exposed in the raw Network tab for unsubscribed users, unlike implementations that merely hide data using CSS/React state.

**Stripe Webhook Security:** The `/api/webhooks/stripe` route is configured with `express.raw({ type: "application/json" })` to ensure the raw body remains intact, which is strictly required for validating the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`.

## i18n Strategy

A lightweight, custom translation hook (`useTranslation`) was implemented on the frontend without relying on heavy libraries like `next-i18next`. It loads JSON dictionaries for `en`, `nl`, `de`, and `fr`. 
When a product's name is requested, the backend performs a deterministic fallback: `product_name_[lang] ?? product_name_en ?? product_name ?? "Unnamed product"`.

## Open Food Facts Limitation

The Open Food Facts legacy `/cgi/search.pl` endpoint is used because the v2/v3 Product Opener API currently lacks free-text search functionality. 
Because the legacy endpoint can aggressively rate-limit anonymous requests and return `503 Service Unavailable`, the backend is designed to handle this gracefully by throwing a clean `"Product service is temporarily unavailable"` error rather than returning mock data in production or crashing.

## Testing the Application

### 1. Backend Integration Tests
Tests are written with Vitest and Supertest. They use vi.mock to simulate OpenFoodFacts responses.
```bash
cd backend
npm test
```

### 2. Testing Stripe Subscriptions End-to-End
1. In `backend/.env`, configure a real `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from a Stripe Test Mode dashboard.
2. In your terminal, use the Stripe CLI to forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:4000/api/webhooks/stripe
   ```
   *Copy the webhook secret printed by the CLI into your `backend/.env` file.*
3. Open the UI, search a product, and click "Unlock Nutrition". Complete the test checkout.
4. The webhook will fire `checkout.session.completed` and `customer.subscription.created`, updating the MySQL demo user to `ACTIVE`.
5. Refresh the frontend search; the nutrition data will now be fully visible!

## Known Limitations

- **Authentication:** To focus on the core requirements, a single seeded `demo@example.com` user is hardcoded in the controllers. In a real application, this would be replaced by JWT or session-based authentication parsing `req.user`.
- **Search Rate Limits:** Heavy, rapid searching may trigger `503` errors from Open Food Facts if not authenticated with an OFF contributor account.
