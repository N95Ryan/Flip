# Flip 🥋

> Your judo companion app — technique library & training journal.

Flip is a mobile app built for judokas. Free access to a structured technique library (positions, throws, rules, glossary), and a premium training journal behind a Stripe paywall.

---

## Architecture

```
Flip/
├── front/   # Expo (React Native, TypeScript)
└── back/    # Go (Chi) — REST API, billing, webhooks
```

| Layer | Tech |
|-------|------|
| Mobile | Expo, React Native, TypeScript |
| Backend | Go, Chi |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Billing | Stripe (subscriptions + webhooks) |
| Deploy | Expo EAS · Railway |
| Tests | Go testing + testify |

---

## Dependencies

| Package | Role |
|---------|------|
| `go-chi/chi` | Router — stdlib-first, idiomatic Go |
| `supabase-community/supabase-go` | Supabase client — auth & database |
| `stripe/stripe-go` | Stripe billing & webhook handling |
| `testify/testify` | Test assertions |
| `joho/godotenv` | Env vars |

---

## Features

**Free**
- 📖 Technique library — throws, positions, groundwork
- 📋 Rules & glossary
- 🔍 Search & filter by category

**Premium — Stripe**
- 📓 Training journal — log sessions, notes, intensity
- 📊 Progress tracking & stats
- 🗓️ Unlimited session history

---

## Billing — Webhook flow

```
User signs up
  → Supabase user created
  → Stripe customer created

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

Webhooks handled with idempotency keys to prevent duplicate processing.

---

## Database schema

```sql
users (
  id                   uuid PRIMARY KEY,
  email                text UNIQUE NOT NULL,
  stripe_customer_id   text,
  subscription_status  text DEFAULT 'free', -- free | active | past_due | cancelled
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

## API Routes

```
POST   /auth/register
POST   /auth/login

GET    /techniques        # public
GET    /techniques/:id    # public

POST   /billing/checkout  # create Stripe Checkout session [auth]
POST   /billing/webhook   # Stripe webhook handler

GET    /journal           # [auth + premium]
POST   /journal           # [auth + premium]
PUT    /journal/:id       # [auth + premium]
DELETE /journal/:id       # [auth + premium]
```

---

## Getting started

**Backend**
```bash
cd flip-back
cp .env.example .env
go mod tidy
go run cmd/main.go
```

**Frontend**
```bash
cd flip-front
npm install
npx expo start
```

**Tests**
```bash
cd flip-back
go test ./...
```

---

## Status

🚧 In active development — built summer 2026.
