-- Run this AFTER schema.sql and AFTER creating a test user
-- Replace the placeholder UUID below with an actual user id from auth.users

INSERT INTO expenses (id, user_id, title, amount, category, date) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Grocery run',        85.50,  'Food',          '2026-04-01'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Monthly Netflix',    15.99,  'Entertainment', '2026-04-03'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Electricity bill',  120.00,  'Utilities',     '2026-04-07'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Uber to airport',    42.75,  'Transport',     '2026-04-10'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Coffee shop',         6.80,  'Food',          '2026-04-15');
