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
    └── migrations/          # SQL migrations, build the full schema from an empty database
```

| Layer     | Tech                                                         |
| --------- | ------------------------------------------------------------ |
| Mobile    | Expo, React Native, TypeScript                               |
| Backend   | Go, Chi                                                      |
| Auth      | JWT (custom Go implementation)                               |
| Database  | Neon PostgreSQL                                              |
| Billing   | Stripe (subscriptions + webhooks)                            |
| Container | Docker, Docker Compose                                       |
| Cloud     | AWS: ECR, ECS Fargate, ALB, RDS, Secrets Manager, CloudWatch |
| Deploy    | Expo EAS (mobile) · Render (backend) · AWS (on-demand demo)  |
| Tests     | Go testing + testify                                         |

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

| Service   | Role                                                               |
| --------- | ------------------------------------------------------------------ |
| `db`      | PostgreSQL 17 (empty on first start; no init scripts)              |
| `migrate` | Applies migrations `000`–`005` from `back/migrations/`, then exits |
| `api`     | Go API on port `8080`, starts only after migrations succeed        |

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

## AWS deployment (on-demand demo) ☁️

Production runs on Render. The same backend image also runs on AWS as a **demo environment**: it is provisioned for a session, verified end to end, then fully destroyed. No resource is left running, so the environment has no monthly cost.

```
Internet
   │  HTTP :80
   ▼
Application Load Balancer          public subnets, 2 Availability Zones
   │  :8080 · health check GET /health
   ▼
ECS Fargate task (flip-back)       public subnet, public IP, no NAT gateway
   │  :5432 · TLS (sslmode=require)
   ▼
RDS PostgreSQL 17                  not publicly accessible, encrypted at rest
```

| Component       | Role                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| ECR             | Private registry for the `linux/amd64` backend image                                      |
| VPC             | `10.0.0.0/16`, 2 public and 2 private subnets across 2 AZs, Internet Gateway, no NAT      |
| ALB             | Public entry point; target group in `ip` mode, health check on `/health`                  |
| ECS Fargate     | Runs the API container (0.25 vCPU, 512 MB); the service keeps one healthy task registered |
| RDS             | PostgreSQL 17, single-AZ, smallest instance class                                         |
| Secrets Manager | `DATABASE_URL`, `JWT_SECRET` and the Stripe key, injected as env vars at task start       |
| CloudWatch Logs | Container stdout, 1-day retention                                                         |

**Network security**: security groups are chained so that each layer only accepts traffic from the previous one.

| Security group | Inbound rule                     |
| -------------- | -------------------------------- |
| ALB            | HTTP 80 from the Internet        |
| ECS            | TCP 8080 from the ALB group only |
| RDS            | TCP 5432 from the ECS group only |

**Design choices**

- **No NAT gateway.** Tasks get a public IP to reach ECR, Secrets Manager and CloudWatch, but their security group only accepts traffic from the load balancer, so they are not reachable directly from the Internet. This avoids the most expensive networking component for a demo.
- **Least privilege.** The task execution role can pull the image, write logs and read one single secret.
- **No secrets in the image or in Git.** All configuration comes from environment variables; sensitive values live in Secrets Manager.
- **Self-bootstrapping schema.** The API applies idempotent migrations on startup, so it initializes an empty RDS database without any manual step.
- **Clean teardown.** Resources are deleted in dependency order (service, load balancer, database, secret, cluster, IAM role, registry, network), then verified, including RDS snapshots.

**Next step**: describe the same infrastructure in Terraform, so the environment can be created and destroyed with `terraform apply` and `terraform destroy`.

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

The full schema is built by the idempotent SQL migrations in [`back/migrations/`](back/migrations/), starting from an empty database (local Docker or AWS RDS). On an existing database, they are a no-op.

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

| Target           | Platform                                    |
| ---------------- | ------------------------------------------- |
| Mobile app       | Expo EAS Build                              |
| Backend API      | Render                                      |
| Backend API demo | AWS ECS Fargate (on demand, then destroyed) |

---

## Status

🚧 In active development, built summer 2026.
