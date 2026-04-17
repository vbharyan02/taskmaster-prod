# fitness-tracker — Database Setup

## How to run

### 1. Run schema.sql
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New query**
4. Paste the contents of `schema.sql`
5. Click **Run**

### 2. Run rls.sql
After schema.sql succeeds:
1. Open a new SQL Editor query
2. Paste the contents of `rls.sql`
3. Click **Run**

### 3. Run seed.sql (optional, for testing)
Before running seed.sql:
- Create a test user via Supabase Auth (Dashboard → Authentication → Users → Invite)
- Replace the placeholder UUID `00000000-0000-0000-0000-000000000001` in `seed.sql` with the real user's UUID

Then:
1. Open a new SQL Editor query
2. Paste the contents of `seed.sql`
3. Click **Run**

---

## Table Structure

### `workouts`

| Column          | Type        | Nullable | Default             | Notes                         |
|-----------------|-------------|----------|---------------------|-------------------------------|
| `id`            | UUID        | NO       | `gen_random_uuid()` | Primary key                   |
| `user_id`       | UUID        | NO       |                     | FK → `auth.users(id)` CASCADE |
| `exercise_name` | TEXT        | NO       |                     | Name of the exercise          |
| `sets`          | INTEGER     | NO       |                     | Number of sets                |
| `reps`          | INTEGER     | NO       |                     | Number of reps per set        |
| `weight`        | INTEGER     | NO       |                     | Weight in kg (0 for bodyweight)|
| `date`          | DATE        | NO       |                     | Date the workout was performed|
| `created_at`    | TIMESTAMPTZ | NO       | `NOW()`             |                               |
| `updated_at`    | TIMESTAMPTZ | NO       | `NOW()`             | Auto-updated via trigger      |

---

## RLS Policy Summary

All policies restrict access so that **each user can only see and modify their own rows** (`auth.uid() = user_id`).

### `workouts`

| Policy             | Operation | Rule                   |
|--------------------|-----------|------------------------|
| `workouts_select`  | SELECT    | `auth.uid() = user_id` |
| `workouts_insert`  | INSERT    | `auth.uid() = user_id` |
| `workouts_update`  | UPDATE    | `auth.uid() = user_id` |
| `workouts_delete`  | DELETE    | `auth.uid() = user_id` |
