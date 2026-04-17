-- ============================================================
-- RLS: workouts
-- ============================================================
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workouts_select" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workouts_delete" ON workouts
  FOR DELETE USING (auth.uid() = user_id);
