-- ============================================================
-- RLS: expenses
-- ============================================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "expenses_delete" ON expenses
  FOR DELETE USING (auth.uid() = user_id);
