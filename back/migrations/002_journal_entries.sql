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
