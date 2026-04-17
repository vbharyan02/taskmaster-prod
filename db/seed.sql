-- Run this AFTER schema.sql and AFTER creating a test user.
-- Replace '00000000-0000-0000-0000-000000000001' with your real user UUID
-- from Supabase Dashboard → Authentication → Users.

-- ============================================
-- SEED: tasks
-- ============================================
INSERT INTO tasks (id, user_id, title, description, status, created_at, updated_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Design homepage',   'Create wireframes and mockups for the landing page',  'in_progress', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Write API docs',    'Document all REST endpoints using OpenAPI spec',       'todo',        NOW() - INTERVAL '7 days',  NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Fix login bug',     'Users unable to log in on mobile Safari',             'done',        NOW() - INTERVAL '5 days',  NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Code review',       'Review PRs for the payments module',                  'todo',        NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Deploy to staging', 'Push latest build and run smoke tests',               'done',        NOW() - INTERVAL '1 day',   NOW());
