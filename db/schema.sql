-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- updated_at trigger function (shared by all tables)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLE: tasks
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user_id
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Apply updated_at trigger
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TABLE: time_entries
-- ============================================
CREATE TABLE IF NOT EXISTS time_entries (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id          UUID        REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  started_at       TIMESTAMPTZ NOT NULL,
  stopped_at       TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user_id
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);

-- Index on task_id for join performance
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);

-- Apply updated_at trigger
CREATE TRIGGER time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SETUP VERIFICATION
-- Run this query to confirm tables were created:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public';
-- ============================================
