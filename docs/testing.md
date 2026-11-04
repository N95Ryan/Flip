# Testing

## Unit tests

```bash
cd back
go test ./...
```

They use `httptest` and interface-based mocks: no real DB or Stripe calls.

## Webhook E2E (integration)

End-to-end tests exercise the real webhook handler against PostgreSQL: signed Stripe payload → DB update → premium journal access.

**Requirements:** a dedicated test database (`TEST_DATABASE_URL`). Do **not** point this at production Neon.

**Neon setup:** create a branch `test-e2e` (parent: production, _schema only_ preferred), then copy its direct connection URL into `TEST_DATABASE_URL` in `back/.env` (with `?sslmode=require`). Quote the value, since Neon URLs often contain `&`.

```bash
cd back
./scripts/run-webhook-e2e.sh          # Git Bash
# PowerShell: .\scripts\run-webhook-e2e.ps1
# or: go test -tags=integration ./test/e2e/ -v   (loads back/.env automatically)
```

| E2E test                                          | What it validates                                         |
| ------------------------------------------------- | --------------------------------------------------------- |
| `TestWebhookE2E_SubscriptionLifecycle`            | subscribe → journal OK → cancel → journal 403; idempotent |
| `TestWebhookE2E_CheckoutSessionCompletedLifetime` | lifetime checkout webhook activates premium               |
| `TestWebhookE2E_InvalidSignatureRejected`         | bad signature → 400, DB unchanged                         |

The schema is applied automatically from `back/test/fixtures/schema.sql`.

## Forward real Stripe webhooks (local dev)

```bash
cd back
./scripts/stripe-webhook-dev.sh   # copies whsec_... → STRIPE_WEBHOOK_SECRET in .env
go run ./cmd/main.go
```

Then complete a test checkout in Stripe: the webhook updates `subscription_status` in your dev DB.
