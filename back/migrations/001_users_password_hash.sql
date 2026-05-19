-- Run in Supabase SQL editor if users table exists without password_hash.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash text NOT NULL DEFAULT '';

-- Remove default after backfill if you had existing rows; new signups always set hash.
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;
