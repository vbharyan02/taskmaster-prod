-- ============================================
-- habit-tracker — rls.sql
-- Run AFTER schema.sql
-- ============================================

-- ============================================
-- RLS: habits
-- ============================================
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_select" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "habits_insert" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_update" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "habits_delete" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS: habit_completions
-- ============================================
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_completions_select" ON habit_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "habit_completions_insert" ON habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_completions_update" ON habit_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "habit_completions_delete" ON habit_completions
  FOR DELETE USING (auth.uid() = user_id);
