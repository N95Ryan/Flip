-- Base schema, aligned with production (Neon). Idempotent: no-op on existing databases.
-- Columns username, avatar_url, belt_level, techniques_studied are added by 003 and 004.
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text NOT NULL UNIQUE,
  password_hash       text,
  stripe_customer_id  text,
  subscription_status text DEFAULT 'free',
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid REFERENCES users(id),
  stripe_subscription_id text UNIQUE,
  status                 text,
  current_period_end     timestamptz,
  created_at             timestamptz DEFAULT now()
);
