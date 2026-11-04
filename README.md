# Flip 🥋

> Your judo companion app: technique library & training journal.

Flip is a mobile app built for judokas. Free access to a structured technique library (positions, throws, rules, glossary), and a premium training journal behind a Stripe paywall.

---

## Features ✨

**Free**

- 📖 Technique library: throws, positions, groundwork
- 📋 Rules & glossary
- 🔍 Search & filter by category

**Premium (Stripe)**

- 📓 Training journal: log sessions, notes, intensity
- 📊 Progress tracking & stats
- 🗓️ Unlimited session history

---

## Architecture

```
Flip/
├── front/   # Expo (React Native, TypeScript)
└── back/    # Go (Chi): REST API, billing, webhooks
    ├── Dockerfile           # multi-stage build, distroless image
    ├── docker-compose.yml   # local stack: Postgres 17 + migrations + API
    └── docker/initdb/       # base schema loaded on first DB start
```

| Layer     | Tech                                 |
| --------- | ------------------------------------ |
| Mobile    | Expo, React Native, TypeScript       |
| Backend   | Go, Chi                              |
| Auth      | JWT (custom Go implementation)       |
| Database  | Neon PostgreSQL                      |
| Billing   | Stripe (subscriptions + webhooks)    |
| Container | Docker, Docker Compose               |
| Deploy    | Expo EAS (mobile) · Render (backend) |
| Tests     | Go testing + testify                 |

**Frontend**: React Native + TypeScript, Expo Router v3, Zustand (auth state), StyleSheet.

**Backend**: Go + Chi, layered architecture (handler → service → repository), PostgreSQL via `database/sql` + `lib/pq`, JWT auth, Stripe webhook-driven state. Dependency injection via interfaces: fully testable without DB or network.

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

The server listens on `PORT` (default `8080`).

```env
PORT=8080
JWT_SECRET=
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_YEARLY=
STRIPE_PRICE_LIFETIME=
STRIPE_WEBHOOK_SECRET=

# Avatar storage (local dev default)
AVATAR_UPLOAD_DIR=./uploads/avatars
AVATAR_PUBLIC_BASE_URL=http://localhost:8080
```

Optional S3-compatible storage (Cloudflare R2, AWS S3) is documented in [`back/.env.example`](back/.env.example).

### Backend with Docker 🐳

Run the whole backend, database included, with a single command. No local Go or Postgres needed:

```bash
cd back
cp .env.example .env  # fill in JWT_SECRET and Stripe TEST keys
docker compose up --build
```

| Service   | Role                                                                           |
| --------- | ------------------------------------------------------------------------------ |
| `db`      | PostgreSQL 17, loads the base schema from `back/docker/initdb/` on first start |
| `migrate` | Applies the SQL migrations, then exits                                         |
| `api`     | Go API on port `8080`, starts only after migrations succeed                    |

Compose overrides `DATABASE_URL` to point at the local `db` container, so the Neon URL in your `.env` is never used. The database is also exposed on `localhost:5433`.

```bash
curl http://localhost:8080/health   # → ok
docker compose down                 # stop (add -v to wipe the local database)
```

The image is built in two stages (`golang:1.25-alpine` → `distroless/static:nonroot`) and weighs about 46 MB. `.env` and `uploads/` are excluded through `.dockerignore`.

> Use Stripe **test** keys only for local work.

### Frontend

Create `front/.env` with:

```env
EXPO_PUBLIC_API_URL=https://flip-back-m624.onrender.com
```

For a local API on web, put `http://localhost:8080` in `front/.env.local` (gitignored). Then:

```bash
cd front
bun install
bun start          # Expo dev server (use `npx expo start -c` after changing .env)
bun run android    # Android emulator
bun run ios        # iOS simulator
bun run web        # Web
```

Production deployment on Render: see [`docs/deploy-render.md`](docs/deploy-render.md).

---

## API Routes

```
GET    /health                  # public, liveness probe (used by load balancers)

POST   /auth/register
POST   /auth/login

GET    /users/me                # [auth]
PATCH  /users/me                # [auth] body: { "username": "..." }
POST   /users/me/avatar         # [auth] multipart field "file"
DELETE /users/me/avatar         # [auth]

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

---

## Billing: webhook flow

```
User signs up
  → user created in DB
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

---

## Security 🔐

**Webhook signature verification.** Every incoming Stripe webhook is verified with HMAC-SHA256 before any processing. Requests without a valid signature are rejected with HTTP 400, and the database is never touched.

```
Unsigned request → 400 Bad Request (no DB access)
Valid signature  → process event → update DB
```

**Webhook idempotency.** Subscription status updates are naturally idempotent: duplicate events from Stripe produce identical DB state with no side effects.

**JWT authentication.** All premium routes require a valid signed token. Subscription status is checked on every request via middleware: a user without `subscription_status = "active"` cannot access journal endpoints.

**Zero trust.** No request is trusted by default, even from Stripe. Every message is cryptographically verified before being acted upon.

---

## Tests 🧪

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

Unit tests use `httptest` and interface-based mocks: no real DB or Stripe calls. Integration tests run the real webhook handler against PostgreSQL (signed payload → DB update → premium access). Setup and details: [`docs/testing.md`](docs/testing.md).

---

## Database schema

```sql
users (
  id                   uuid PRIMARY KEY,
  email                text UNIQUE NOT NULL,
  username             text UNIQUE,
  avatar_url           text,
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

A schema-only export of the production database lives in [`back/docker/initdb/000_base_schema.sql`](back/docker/initdb/000_base_schema.sql). Docker Compose loads it on first start, so migrations can be replayed from an empty database.

---

## Go dependencies

| Package                | Role                               |
| ---------------------- | ---------------------------------- |
| `go-chi/chi`           | Router, stdlib-first, idiomatic Go |
| `stripe/stripe-go/v82` | Stripe billing & webhook handling  |
| `golang-jwt/jwt`       | JWT auth                           |
| `lib/pq`               | PostgreSQL driver                  |
| `testify/testify`      | Test assertions                    |
| `joho/godotenv`        | Env vars                           |

---

## Deployment 🌐

| Target      | Platform       |
| ----------- | -------------- |
| Mobile app  | Expo EAS Build |
| Backend API | Render         |

---

## Status

🚧 In active development, built summer 2026.
