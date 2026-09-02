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

## Testing

Backend integration tests are written using Vitest and Supertest.
```bash
cd backend
npm test
```

## Assumptions & Decisions

- **Open Food Facts API:** We used the legacy `/cgi/search.pl` endpoint because the current v2/v3 Product Opener APIs do not natively support full-text search. This is isolated behind the `OpenFoodFactsService`.
- **Demo User Authentication:** Full JWT authentication was omitted as per requirements. We default to querying a seeded `demo@example.com` user for tracking searches and subscription status.
- **Stripe Webhooks:** The Express app was explicitly configured to use `express.raw()` for the `/api/webhooks/stripe` route to ensure Stripe signature validation succeeds.
