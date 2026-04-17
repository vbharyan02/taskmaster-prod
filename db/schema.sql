-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: workouts
-- ============================================================
CREATE TABLE IF NOT EXISTS workouts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT        NOT NULL,
  sets          INTEGER     NOT NULL,
  reps          INTEGER     NOT NULL,
  weight        INTEGER     NOT NULL,
  date          DATE        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index on user_id for every table (always add this)
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

-- ============================================================
-- updated_at trigger function (add once, reuse)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply trigger to workouts
CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
