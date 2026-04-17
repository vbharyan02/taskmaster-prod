-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT        NOT NULL,
  amount      NUMERIC     NOT NULL,
  category    TEXT        NOT NULL,
  date        DATE        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user_id for every table (always add this)
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- ============================================================
-- updated_at trigger function (add once, reuse)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply trigger to expenses
CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SETUP VERIFICATION
-- Run this query to confirm tables were created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public';
-- ============================================
