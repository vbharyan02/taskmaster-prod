-- ============================================
-- habit-tracker — schema.sql
-- Run in Supabase: Dashboard → SQL Editor → paste → Run
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: habits
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  frequency   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user_id for every table (always add this)
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- ============================================
-- TABLE: habit_completions
-- ============================================
CREATE TABLE IF NOT EXISTS habit_completions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id       UUID        REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user_id for every table (always add this)
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);

-- ============================================
-- updated_at trigger function (add once, reuse)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply trigger to habits
CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply trigger to habit_completions
CREATE TRIGGER habit_completions_updated_at
  BEFORE UPDATE ON habit_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SETUP VERIFICATION
-- Run this query to confirm tables were created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public';
-- ============================================
