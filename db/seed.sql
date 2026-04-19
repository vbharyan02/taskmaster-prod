-- Run this AFTER schema.sql and AFTER creating a test user
-- Replace the placeholder user_id with a real user UUID from auth.users

INSERT INTO books (id, user_id, title, author, genre, status) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'The Pragmatic Programmer',
    'David Thomas, Andrew Hunt',
    'Technology',
    'read'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Dune',
    'Frank Herbert',
    'Science Fiction',
    'reading'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Sapiens',
    'Yuval Noah Harari',
    'Non-Fiction',
    'want-to-read'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Clean Code',
    'Robert C. Martin',
    'Technology',
    'read'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    'Fiction',
    'want-to-read'
  );
