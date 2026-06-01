-- Run in Neon SQL editor.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique
  ON users (username)
  WHERE username IS NOT NULL;
