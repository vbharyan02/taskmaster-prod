-- Run this AFTER schema.sql and AFTER creating a test user
-- Replace the placeholder user_id with a real user UUID from auth.users

-- ============================================================
-- workouts seed data
-- ============================================================
INSERT INTO workouts (id, user_id, name, date, duration_minutes, notes) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Morning Run',
    '2026-04-14',
    30,
    'Easy 5k around the park'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Upper Body Strength',
    '2026-04-15',
    45,
    'Chest, shoulders and triceps'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Leg Day',
    '2026-04-17',
    60,
    'Squats, lunges and calf raises'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'HIIT Session',
    '2026-04-19',
    25,
    '20-second intervals, 10-second rest'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Yoga & Stretch',
    '2026-04-20',
    40,
    'Recovery day — full body flexibility'
  );

-- ============================================================
-- exercises seed data
-- NOTE: workout_id values below must match real IDs inserted above.
-- For quick testing, insert workouts first, then copy their IDs here.
-- The placeholder workout UUIDs below are illustrative only.
-- ============================================================
INSERT INTO exercises (id, user_id, workout_id, name, sets, reps, weight_kg, duration_seconds) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Bench Press',
    4, 10, 80, NULL
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Overhead Press',
    3, 8, 50, NULL
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000011',
    'Back Squat',
    4, 8, 100, NULL
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000011',
    'Walking Lunges',
    3, 12, 20, NULL
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000012',
    'Burpees',
    NULL, NULL, NULL, 20
  );

-- ============================================================
-- goals seed data
-- ============================================================
INSERT INTO goals (id, user_id, title, target_value, current_value, unit, status) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Run 5km under 25 minutes',
    25,
    28,
    'minutes',
    'in_progress'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Bench Press 100kg',
    100,
    80,
    'kg',
    'in_progress'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Work out 20 times this month',
    20,
    8,
    'sessions',
    'in_progress'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Lose 5kg body weight',
    5,
    5,
    'kg',
    'completed'
  );
