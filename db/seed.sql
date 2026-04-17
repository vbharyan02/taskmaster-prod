-- Run this AFTER schema.sql and AFTER creating a test user.
-- Replace '00000000-0000-0000-0000-000000000001' with your real user UUID
-- from Supabase Dashboard → Authentication → Users.

-- ============================================
-- SEED: tasks
-- ============================================
INSERT INTO tasks (id, user_id, name, description, created_at, updated_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Design homepage',   'Create wireframes and mockups for the landing page',  NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Write API docs',    'Document all REST endpoints using OpenAPI spec',       NOW() - INTERVAL '7 days',  NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Fix login bug',     'Users unable to log in on mobile Safari',             NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Code review',       'Review PRs for the payments module',                  NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Deploy to staging', 'Push latest build and run smoke tests',               NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day');

-- ============================================
-- SEED: time_entries
-- Subqueries reference the tasks inserted above.
-- ============================================
INSERT INTO time_entries (id, user_id, task_id, started_at, stopped_at, duration_seconds, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', t.id,
       NOW() - INTERVAL '9 days',
       NOW() - INTERVAL '9 days' + INTERVAL '2 hours',
       7200,
       NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
FROM tasks t WHERE t.name = 'Design homepage' AND t.user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO time_entries (id, user_id, task_id, started_at, stopped_at, duration_seconds, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', t.id,
       NOW() - INTERVAL '6 days',
       NOW() - INTERVAL '6 days' + INTERVAL '3 hours 30 minutes',
       12600,
       NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
FROM tasks t WHERE t.name = 'Write API docs' AND t.user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO time_entries (id, user_id, task_id, started_at, stopped_at, duration_seconds, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', t.id,
       NOW() - INTERVAL '4 days',
       NOW() - INTERVAL '4 days' + INTERVAL '1 hour 15 minutes',
       4500,
       NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
FROM tasks t WHERE t.name = 'Fix login bug' AND t.user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO time_entries (id, user_id, task_id, started_at, stopped_at, duration_seconds, created_at, updated_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', t.id,
       NOW() - INTERVAL '2 days',
       NULL, NULL,
       NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM tasks t WHERE t.name = 'Deploy to staging' AND t.user_id = '00000000-0000-0000-0000-000000000001';
