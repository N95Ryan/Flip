#!/usr/bin/env bash
# Run webhook E2E tests against TEST_DATABASE_URL (Neon test branch).
#
# Prerequisites (Neon console):
#   1. Branches → Create branch → name: test-e2e, parent: production
#   2. Prefer "Branch schema only" (tests insert their own data)
#   3. Connection details → copy direct URL → paste in back/.env as TEST_DATABASE_URL
#      Must include ?sslmode=require for Neon (quote the value if it contains &)
#
# Usage:
#   ./scripts/run-webhook-e2e.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Read KEY=value from .env without sourcing (URLs may contain & which breaks `source`).
read_env_var() {
  local key="$1"
  local line value
  [[ -f .env ]] || return 1
  line="$(grep -E "^${key}=" .env | tail -n1 || true)"
  [[ -n "$line" ]] || return 1
  value="${line#"${key}="}"
  value="${value//$'\r'/}"
  if [[ "$value" =~ ^\".*\"$ ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" =~ ^\'.*\'$ ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

TEST_DATABASE_URL="$(read_env_var TEST_DATABASE_URL || true)"
DATABASE_URL="$(read_env_var DATABASE_URL || true)"

if [[ -z "${TEST_DATABASE_URL}" ]]; then
  echo "ERROR: TEST_DATABASE_URL is not set."
  echo "Add it to back/.env (Neon branch test-e2e URL, not production DATABASE_URL)."
  echo "Quote the value if the URL contains &: TEST_DATABASE_URL='postgresql://...?sslmode=require&...'"
  exit 1
fi

if [[ -n "${DATABASE_URL}" && "${TEST_DATABASE_URL}" == "${DATABASE_URL}" ]]; then
  echo "ERROR: TEST_DATABASE_URL must not equal DATABASE_URL (E2E tests TRUNCATE users)."
  exit 1
fi

export TEST_DATABASE_URL

echo "Running webhook E2E tests..."
go test -tags=integration ./test/e2e/ -v "$@"
