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
| Auth     | JWT (custom Go implementation)       |
| Database | Neon PostgreSQL                      |
| Billing  | Stripe (subscriptions + webhooks)    |
| Deploy   | Expo EAS (mobile) · Render (backend) |
| Tests    | Go testing + testify                 |

---

## Tech Stack 🖥️

**Frontend**

- React Native + TypeScript
- Expo + Expo Router v3
- Zustand (auth state)
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

# Avatar storage (local dev default: ./uploads/avatars served at /avatars/*)
AVATAR_UPLOAD_DIR=./uploads/avatars
AVATAR_PUBLIC_BASE_URL=http://localhost:8080

# Optional S3-compatible storage (Cloudflare R2, AWS S3)
# S3_BUCKET=
# S3_REGION=auto
# S3_ENDPOINT=
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# S3_PUBLIC_BASE_URL=
```

### Frontend

Create `front/.env` (see `front/.env.example` if present) with at least:

```env
EXPO_PUBLIC_API_URL=https://flip-back-m624.onrender.com
```

Use **one** `EXPO_PUBLIC_API_URL` line only — duplicate keys make the last value win and can point the app at an unreachable local IP on a physical device.

| Target | `EXPO_PUBLIC_API_URL` |
|--------|------------------------|
| Expo Go on phone (recommended) | Render HTTPS URL |
| Web + local Go API | `front/.env.local` with `http://localhost:8080` (gitignored) |

After changing `.env`, restart Metro with a clean cache:

```bash
cd front
npx expo start -c
```

In dev, the app logs `[Flip] API_URL = ...` on startup so you can confirm the loaded URL.

```bash
cd front
bun install
bun start          # Expo dev server
bun run android    # Android emulator
bun run ios        # iOS simulator
bun run web        # Web
```

**Render (profile Save + photo):**

1. Push `develop` (or your connected branch) — includes `back/` profile routes and [`render.yaml`](render.yaml).
2. Render Dashboard → service `flip-back-m624` → **Manual Deploy** (Root Directory: `back`, or sync blueprint).
3. **Environment** (required):
   - `DATABASE_URL` — Neon DB used in production. On each deploy, the server auto-applies [`003_user_profile.sql`](back/migrations/003_user_profile.sql) and [`004_belt_techniques.sql`](back/migrations/004_belt_techniques.sql) (idempotent).
   - `JWT_SECRET`, `STRIPE_*` (unchanged if login already works).

**Login returns `could not log in` (HTTP 500):** usually missing `belt_level` / `techniques_studied` on Neon. Redeploy `flip-back` after pulling latest `back/`, or run migrations manually:

```bash
cd back
go run ./cmd/migrate 003_user_profile.sql 004_belt_techniques.sql
```

(`DATABASE_URL` must be the **production** Neon URL.) Or paste those SQL files in the Neon SQL editor.

Verify login (expect **401** for wrong password, not 500). Save JSON to a file first (PowerShell quoting is awkward):

```json
{"email":"test@example.com","password":"wrongpassword123"}
```

```bash
curl.exe -s -w "\nHTTP %{http_code}\n" -X POST https://flip-back-m624.onrender.com/auth/login -H "Content-Type: application/json" -d "@login-test.json"
```
4. **Photos on Render** — set S3-compatible vars (see [`back/.env.example`](back/.env.example)): `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`. Without `S3_BUCKET`, username Save can work but avatars are unreliable.

Verify deployment:

```bash
curl.exe -s -o NUL -w "%{http_code}" https://flip-back-m624.onrender.com/techniques
# expect 200

curl.exe -s -o NUL -w "%{http_code}" -X PATCH https://flip-back-m624.onrender.com/users/me -H "Content-Type: application/json" -d "{\"username\":\"test\"}"
# expect 401 (unauthorized) once profile routes are deployed; 404 means redeploy back/
```

Then Expo: `npx expo start -c` → Profil → Save `Big_Nayru` → check Neon `username` column.

---

## API Routes

```
POST   /auth/register
POST   /auth/login

GET    /users/me                # [auth]
PATCH  /users/me                # [auth] — body: { "username": "..." }
POST   /users/me/avatar         # [auth] — multipart field "file"
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

## Billing — Webhook flow

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

---

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

| Target      | Platform       |
| ----------- | -------------- |
| Mobile app  | Expo EAS Build |
| Backend API | Render         |

---

## Status

🚧 In active development — built summer 2026.
