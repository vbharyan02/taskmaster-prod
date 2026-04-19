-- Run this AFTER schema.sql and AFTER creating a test user.
-- Replace '00000000-0000-0000-0000-000000000001' with your real user UUID
-- from Supabase Dashboard → Authentication → Users.

-- ============================================
-- SEED: habits
-- ============================================
INSERT INTO habits (id, user_id, name, description, frequency, created_at, updated_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Morning Run',       'Run at least 30 minutes each morning',          'daily',   NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Read a Book',       'Read 20 pages before bed',                      'daily',   NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Weekly Review',     'Review goals and plan the upcoming week',        'weekly',  NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Drink 8 Glasses',   'Stay hydrated throughout the day',              'daily',   NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Meditate',          '10 minutes of mindfulness meditation',          'daily',   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

-- ============================================
-- SEED: habit_completions
-- Subqueries reference the habits inserted above.
-- ============================================
INSERT INTO habit_completions (id, user_id, habit_id, completed_date, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', h.id,
       CURRENT_DATE - INTERVAL '1 day',
       NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM habits h WHERE h.name = 'Morning Run' AND h.user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO habit_completions (id, user_id, habit_id, completed_date, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', h.id,
       CURRENT_DATE - INTERVAL '2 days',
       NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM habits h WHERE h.name = 'Morning Run' AND h.user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO habit_completions (id, user_id, habit_id, completed_date, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', h.id,
       CURRENT_DATE - INTERVAL '1 day',
       NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM habits h WHERE h.name = 'Read a Book' AND h.user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO habit_completions (id, user_id, habit_id, completed_date, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', h.id,
       CURRENT_DATE - INTERVAL '7 days',
       NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
FROM habits h WHERE h.name = 'Weekly Review' AND h.user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO habit_completions (id, user_id, habit_id, completed_date, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', h.id,
       CURRENT_DATE,
       NOW(), NOW()
FROM habits h WHERE h.name = 'Meditate' AND h.user_id = '00000000-0000-0000-0000-000000000001';
