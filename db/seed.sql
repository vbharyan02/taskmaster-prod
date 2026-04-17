-- Run this AFTER schema.sql and AFTER creating a test user
-- Replace the placeholder UUID below with an actual user id from auth.users

INSERT INTO workouts (id, user_id, exercise_name, sets, reps, weight, date) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bench Press',    4, 8,  80,  '2026-04-14'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Squat',          5, 5,  100, '2026-04-15'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Deadlift',       3, 6,  120, '2026-04-15'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Overhead Press', 4, 10, 50,  '2026-04-16'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Pull-Up',        3, 12, 0,   '2026-04-17');
