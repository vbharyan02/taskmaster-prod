-- ============================================
-- RLS: tasks
-- ============================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS: time_entries
-- ============================================
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_select" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "time_entries_insert" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "time_entries_update" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "time_entries_delete" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);
