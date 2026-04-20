-- ============================================================
-- Enable RLS on every table
-- ============================================================
ALTER TABLE workouts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- workouts policies
-- ============================================================
CREATE POLICY "workouts_select" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workouts_delete" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- exercises policies
-- ============================================================
CREATE POLICY "exercises_select" ON exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "exercises_insert" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exercises_update" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "exercises_delete" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- goals policies
-- ============================================================
CREATE POLICY "goals_select" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "goals_insert" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_update" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "goals_delete" ON goals
  FOR DELETE USING (auth.uid() = user_id);
