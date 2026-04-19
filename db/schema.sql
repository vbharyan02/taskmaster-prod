-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user_id for every table (always add this)
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);

-- updated_at trigger function (add once, reuse)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply trigger to books table
CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SETUP VERIFICATION
-- Run this query to confirm tables were created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public';
-- ============================================
