# Flip 🥋

> Your judo companion app — technique library & training journal.

Flip is a mobile app built for judokas. Free access to a structured technique library (positions, throws, rules, glossary), and a premium training journal behind a Stripe paywall.

---

## Features ✨

**Free**

- 📖 Technique library — throws, positions, groundwork
- 📋 Rules & glossary
- 🔍 Search & filter by category

**Premium — Stripe**

- 📓 Training journal — log sessions, notes, intensity
- 📊 Progress tracking & stats
- 🗓️ Unlimited session history

---

## Architecture

```
Flip/
├── front/   # Expo (React Native, TypeScript)
└── back/    # Go (Chi) — REST API, billing, webhooks
```

| Layer    | Tech                                 |
| -------- | ------------------------------------ |
| Mobile   | Expo, React Native, TypeScript       |
| Backend  | Go, Chi                              |
<<<<<<< Updated upstream
| Auth     | Supabase Auth (JWT)                  |
| Database | Supabase PostgreSQL                  |
=======
| Auth     | JWT (custom Go implementation)       |
| Database | Neon PostgreSQL                      |
>>>>>>> Stashed changes
| Billing  | Stripe (subscriptions + webhooks)    |
| Deploy   | Expo EAS (mobile) · Render (backend) |
| Tests    | Go testing + testify                 |

---

## Tech Stack 🖥️

**Frontend**

- React Native + TypeScript
- Expo + Expo Router v3
<<<<<<< Updated upstream
=======
- Zustand (auth state)
>>>>>>> Stashed changes
- StyleSheet (no NativeWind)

**Backend**

- Go + Chi router
- Layered architecture: handler → service → repository
- PostgreSQL via `database/sql` + `lib/pq`
- JWT auth, Stripe webhook-driven state management
- Dependency injection via interfaces — fully testable without DB or network

---

## Getting Started 🚀

```bash
git clone https://github.com/N95Ryan/Flip.git
cd Flip
```

### Backend

```bash
cd back
cp .env.example .env  # fill in your secrets
go mod tidy
go run ./cmd/main.go
```

Server listens on `PORT` (default `8080`).

**Required env vars:**

```env
PORT=8080
JWT_SECRET=
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

### Frontend

```bash
cd front
bun install
bun start          # Expo dev server
bun run android    # Android emulator
bun run ios        # iOS simulator
bun run web        # Web
```

---

## API Routes

```
POST   /auth/register
POST   /auth/login

GET    /techniques              # public
GET    /techniques?category=    # filtered by category
GET    /techniques/:id          # public

POST   /billing/checkout        # [auth]
POST   /billing/webhook         # Stripe webhook handler

GET    /journal                 # [auth + premium]
POST   /journal                 # [auth + premium]
PUT    /journal/:id             # [auth + premium]
DELETE /journal/:id             # [auth + premium]
```
<<<<<<< Updated upstream

### Techniques API

| Method | Path               | Description                      |
| ------ | ------------------ | -------------------------------- |
| `GET`  | `/techniques`      | List all (`?category=` optional) |
| `GET`  | `/techniques/{id}` | One technique by id              |

List response: `{ "data": [...], "count": N }`
Single response: `{ "data": { ... } }`
Not found: `{ "error": "technique not found" }` with HTTP 404.
=======
>>>>>>> Stashed changes

---

## Billing — Webhook flow

```
User signs up
<<<<<<< Updated upstream
  → Supabase user created
=======
  → user created in DB
>>>>>>> Stashed changes
  → Stripe customer created automatically

User subscribes
  → Stripe Checkout session
  → webhook: customer.subscription.created
  → DB: subscription_status = "active"

Payment fails
  → webhook: invoice.payment_failed → retry logic (3 attempts)
  → webhook: customer.subscription.deleted
  → DB: subscription_status = "inactive"
  → app: auto-downgrade to FREE
```

Webhooks handled with idempotency to prevent duplicate processing.

---

## Security

**Webhook signature verification**
Every incoming Stripe webhook is verified with HMAC-SHA256 before any processing. Requests without a valid Stripe signature are rejected immediately with HTTP 400 — the database is never touched.

```
Unsigned request → 400 Bad Request (no DB access)
Valid signature  → process event → update DB
```

**Webhook idempotency**
Subscription status updates are naturally idempotent. Duplicate events from Stripe produce identical DB state with no side effects.

**JWT authentication**
All premium routes require a valid signed token. Subscription status is verified on every request via middleware — a user without `subscription_status = "active"` cannot access journal endpoints.

**Zero trust on incoming requests**
No request is trusted by default, even from Stripe. Every message is cryptographically verified before being acted upon.

---

## Test suite

```bash
cd back
go test ./...
```

| Test                                    | What it validates                                     |
| --------------------------------------- | ----------------------------------------------------- |
| `TestHandleWebhook_InvalidSignature`    | Unsigned requests are rejected with 400, DB untouched |
| `TestHandleWebhook_UnknownEvent`        | Unknown events return 200 silently, no crash          |
| `TestHandleWebhook_SubscriptionCreated` | Valid event sets `subscription_status = "active"`     |
| `TestHandleWebhook_SubscriptionDeleted` | Cancellation sets `subscription_status = "inactive"`  |

Tests use `httptest` and interface-based mocks — no real DB or Stripe calls.

---

## Database schema

```sql
users (
  id                   uuid PRIMARY KEY,
  email                text UNIQUE NOT NULL,
  stripe_customer_id   text,
  subscription_status  text DEFAULT 'free', -- free | active | inactive
  created_at           timestamptz DEFAULT now()
)

subscriptions (
  id                       uuid PRIMARY KEY,
  user_id                  uuid REFERENCES users(id),
  stripe_subscription_id   text UNIQUE,
  status                   text,
  current_period_end       timestamptz,
  created_at               timestamptz DEFAULT now()
)

journal_entries (
  id               uuid PRIMARY KEY,
  user_id          uuid REFERENCES users(id),
  session_date     date NOT NULL,
  duration_minutes int,
  intensity        int CHECK (intensity BETWEEN 1 AND 5),
  notes            text,
  created_at       timestamptz DEFAULT now()
)
```

---

<<<<<<< Updated upstream
## Deployment 🌐

=======
## Go dependencies

| Package                | Role                                |
| ---------------------- | ----------------------------------- |
| `go-chi/chi`           | Router — stdlib-first, idiomatic Go |
| `stripe/stripe-go/v82` | Stripe billing & webhook handling   |
| `golang-jwt/jwt`       | JWT auth                            |
| `lib/pq`               | PostgreSQL driver                   |
| `testify/testify`      | Test assertions                     |
| `joho/godotenv`        | Env vars                            |

---

## Deployment 🌐

>>>>>>> Stashed changes
| Target      | Platform       |
| ----------- | -------------- |
| Mobile app  | Expo EAS Build |
| Backend API | Render         |

---

## Status

🚧 In active development — built summer 2026.
