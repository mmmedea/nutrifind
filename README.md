# NutriFind

NutriFind is a full‑stack Next.js + Express application that lets users search packaged food products via the Open Food Facts (OFF) API and gates detailed nutrition information behind a Stripe‑based premium subscription.

## Features
- **Product Search** – Real‑time search using the OFF API. Primary source is the modern **Search‑a‑licious** endpoint; a legacy OFF fallback is used when the primary endpoint is unavailable.
- **Internationalisation** – UI available in English, Dutch, German, and French.
- **Subscription Gating** – Nutrition data is visible only for users with an `ACTIVE` or `TRIALING` subscription status.
- **Demo User** – A seeded demo user (`demo@example.com`) is used for the technical assessment.
- **Persisted Searches** – Recent searches are stored in MySQL via Prisma.

## Architecture
```
Browser / Next.js
    │
    ▼
Express API
   │   ├── Stripe (checkout & webhooks)
   │   ├── Open Food Facts (Search‑a‑licious primary, legacy OFF fallback)
   │   └── Prisma → MySQL
```

## Prerequisites
- Node.js ≥ 20
- MySQL (or compatible MariaDB instance)
- Stripe account (test mode)

## Setup
1. **Clone the repository**
   ```
   git clone https://github.com/mmmedea/nutrifind.git
   cd nutrifind
   ```
2. **Install dependencies**
   ```
   npm run install:all   # installs both backend and frontend deps
   ```
3. **Configure the database**
   - Create a MySQL database named `nutrifind`.
   - Copy the root environment example and fill in values:
     ```
     cp .env.example .env
     ```
   - Run Prisma migrations and seed the demo user:
     ```
     cd backend
     npx prisma migrate dev --name init
     npx prisma db seed
     ```
4. **Configure the frontend environment**
   ```
   cp .env.example frontend/.env.local   # creates NEXT_PUBLIC_API_URL
   ```
5. **Run the Stripe CLI to forward webhooks** (test mode)
   ```
   stripe listen --forward-to localhost:4000/api/webhooks/stripe
   # copy the generated webhook secret into backend/.env as STRIPE_WEBHOOK_SECRET
   ```
6. **Start the development servers**
   ```
   npm run dev   # from the repository root – starts both frontend (http://localhost:3000) and backend (http://localhost:4000)
   ```

## Environment Variables
All configuration is accessed through `getEnv()` in the backend.
```
# Backend
DATABASE_URL=                # MySQL connection string
PORT=4000
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=           # Stripe test secret key
STRIPE_WEBHOOK_SECRET=       # Set via Stripe CLI
STRIPE_PRICE_ID=             # Test‑mode recurring monthly price ID
OPEN_FOOD_FACTS_BASE_URL=https://world.openfoodfacts.org
OPEN_FOOD_FACTS_USER_AGENT=NutriFindTechnicalTest/1.0

# Frontend (`frontend/.env.local`)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Tests
- **Backend** – Vitest + Supertest:
  ```
  cd backend
  npm test
  ```
- **Frontend** – Lint and build serve as verification (no unit tests are defined).


## Technical Decisions
- **Search Strategy** – Uses the modern Search‑a‑licious endpoint for speed and reliability; falls back to the legacy OFF `/cgi/search.pl` when the primary endpoint returns a 503.
- **Mock Data** – No development‑time mock data is shipped. All fallback behaviour is handled at runtime.
- **Stripe Integration** – Checkout creates a Stripe customer and subscription in test mode. Subscription status is derived from `customer.subscription.created/updated` events; `checkout.session.completed` only persists IDs.
- **Authentication** – A single demo user is seeded; real‑world authentication is out of scope for this assessment.

- **Build** – Backend compilation is verified via `npm run typecheck`. No separate build script is required.

## Internationalization
NutriFind supports English, Dutch, German, and French through a manual language selector.

Interface text is stored in separate translation dictionaries (`frontend/src/messages/*.json`) and accessed via a frontend translation helper. When the user selects a language, that language code is sent to the backend with product‑search requests (`lang` query parameter). The backend prefers the Open Food Facts localized name for the selected language, falling back to English, the generic product name, and finally "Unnamed product" when no suitable name is available.

## Known Limitations
- Open Food Facts data may be incomplete or unavailable for some products.
- Localized product names depend on translations available in Open Food Facts.
- The application uses one fixed demo user and does not implement authentication.
- Stripe integration runs in test mode only.
