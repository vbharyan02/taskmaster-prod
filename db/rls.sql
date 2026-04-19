-- Enable RLS on every table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 4 policies per table — users only see and touch their own rows
CREATE POLICY "books_select" ON books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "books_insert" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "books_update" ON books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "books_delete" ON books
  FOR DELETE USING (auth.uid() = user_id);
