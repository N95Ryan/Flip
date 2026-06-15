-- Minimal schema for webhook E2E tests (TEST_DATABASE_URL only).
CREATE TABLE IF NOT EXISTS users (
  id                   uuid PRIMARY KEY,
  email                text UNIQUE NOT NULL,
  username             text,
  avatar_url           text,
  password_hash        text NOT NULL DEFAULT '',
  stripe_customer_id   text,
  subscription_status  text NOT NULL DEFAULT 'free',
  belt_level           text DEFAULT 'white',
  techniques_studied   int DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique
  ON users (username)
  WHERE username IS NOT NULL;

CREATE TABLE IF NOT EXISTS journal_entries (
  id               uuid PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_date     date NOT NULL,
  duration_minutes int NOT NULL DEFAULT 0,
  intensity        int NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  notes            text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries (user_id);
