# habit-tracker — Database Setup

Supabase (Postgres) schema for the **habit-tracker** app.

---

## How to run

### 1. Run `schema.sql`
1. Open your Supabase project.
2. Go to **Dashboard → SQL Editor**.
3. Paste the contents of `schema.sql` and click **Run**.
4. This creates the `habits` and `habit_completions` tables, indexes on `user_id`, and the `updated_at` trigger.

### 2. Run `rls.sql`
1. In the SQL Editor, paste the contents of `rls.sql` and click **Run**.
2. Enables Row Level Security and creates four policies on each table.
3. **Must be run after `schema.sql`.**

### 3. Run `seed.sql` (optional — for testing only)
1. Create a test user via **Dashboard → Authentication → Users → Add user**.
2. Copy the test user's UUID.
3. In `seed.sql`, replace every `00000000-0000-0000-0000-000000000001` with that UUID.
4. Paste into the SQL Editor and click **Run**.
5. **Must be run after `schema.sql`.**

---

## Table structure

### `habits`

| Column        | Type          | Nullable | Notes                                         |
|---------------|---------------|----------|-----------------------------------------------|
| `id`          | `uuid`        | NO       | Primary key, auto-generated                   |
| `user_id`     | `uuid`        | NO       | FK → `auth.users(id)` ON DELETE CASCADE       |
| `name`        | `text`        | NO       | Habit name (e.g. "Morning Run")               |
| `description` | `text`        | YES      | Optional longer description                   |
| `frequency`   | `text`        | NO       | e.g. `daily`, `weekly`, `monthly`             |
| `created_at`  | `timestamptz` | NO       | Auto-set to NOW()                             |
| `updated_at`  | `timestamptz` | NO       | Auto-updated via trigger                      |

### `habit_completions`

| Column           | Type          | Nullable | Notes                                         |
|------------------|---------------|----------|-----------------------------------------------|
| `id`             | `uuid`        | NO       | Primary key, auto-generated                   |
| `user_id`        | `uuid`        | NO       | FK → `auth.users(id)` ON DELETE CASCADE       |
| `habit_id`       | `uuid`        | NO       | FK → `habits(id)` ON DELETE CASCADE           |
| `completed_date` | `date`        | NO       | The date the habit was completed              |
| `created_at`     | `timestamptz` | NO       | Auto-set to NOW()                             |
| `updated_at`     | `timestamptz` | NO       | Auto-updated via trigger                      |

---

## RLS policy summary

Row Level Security is enabled on all tables. All policies check `auth.uid() = user_id` — **users can only access their own rows**.

| Table               | Policy                         | Operation | Rule                   |
|---------------------|--------------------------------|-----------|------------------------|
| `habits`            | `habits_select`                | SELECT    | `auth.uid() = user_id` |
| `habits`            | `habits_insert`                | INSERT    | `auth.uid() = user_id` |
| `habits`            | `habits_update`                | UPDATE    | `auth.uid() = user_id` |
| `habits`            | `habits_delete`                | DELETE    | `auth.uid() = user_id` |
| `habit_completions` | `habit_completions_select`     | SELECT    | `auth.uid() = user_id` |
| `habit_completions` | `habit_completions_insert`     | INSERT    | `auth.uid() = user_id` |
| `habit_completions` | `habit_completions_update`     | UPDATE    | `auth.uid() = user_id` |
| `habit_completions` | `habit_completions_delete`     | DELETE    | `auth.uid() = user_id` |

---

## Verify setup

After running `schema.sql`, confirm tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected output: `habits`, `habit_completions`.
