#!/usr/bin/env bash
# Forward Stripe test-mode webhooks to the local Flip API.
# Requires: stripe CLI (https://stripe.com/docs/stripe-cli)
#
# Usage:
#   export STRIPE_WEBHOOK_SECRET=whsec_...   # from `stripe listen` output
#   ./scripts/stripe-webhook-dev.sh
set -euo pipefail

PORT="${PORT:-8080}"
FORWARD_URL="http://localhost:${PORT}/billing/webhook"

echo "Forwarding Stripe webhooks to ${FORWARD_URL}"
echo "Copy the whsec_... signing secret into STRIPE_WEBHOOK_SECRET in back/.env"
stripe listen --forward-to "${FORWARD_URL}"
