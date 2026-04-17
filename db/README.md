# time-tracker — Database Setup

Supabase (Postgres) schema for the **time-tracker** app.

---

## How to run

### 1. Run `schema.sql`
1. Open your Supabase project.
2. Go to **Dashboard → SQL Editor**.
3. Paste the contents of `schema.sql` and click **Run**.
4. This creates the `tasks` and `time_entries` tables, indexes, and `updated_at` triggers.

### 2. Run `rls.sql`
1. In the SQL Editor, paste the contents of `rls.sql` and click **Run**.
2. Enables Row Level Security and creates four policies per table.
3. **Must be run after `schema.sql`.**

### 3. Run `seed.sql` (optional — for testing only)
1. Create a test user via **Dashboard → Authentication → Users → Add user**.
2. Copy the test user's UUID.
3. In `seed.sql`, replace every `00000000-0000-0000-0000-000000000001` with that UUID.
4. Paste into the SQL Editor and click **Run**.
5. **Must be run after `schema.sql`.**

---

## Table structure

### `tasks`

| Column        | Type        | Nullable | Notes |
|---------------|-------------|----------|-------|
| `id`          | `uuid`      | NO       | Primary key, auto-generated |
| `user_id`     | `uuid`      | NO       | FK → `auth.users(id)` ON DELETE CASCADE |
| `name`        | `text`      | NO       | Task title |
| `description` | `text`      | YES      | Optional longer description |
| `created_at`  | `timestamptz` | NO     | Auto-set to NOW() |
| `updated_at`  | `timestamptz` | NO     | Auto-updated via trigger |

### `time_entries`

| Column             | Type        | Nullable | Notes |
|--------------------|-------------|----------|-------|
| `id`               | `uuid`      | NO       | Primary key, auto-generated |
| `user_id`          | `uuid`      | NO       | FK → `auth.users(id)` ON DELETE CASCADE |
| `task_id`          | `uuid`      | NO       | FK → `tasks(id)` ON DELETE CASCADE |
| `started_at`       | `timestamptz` | NO     | When the timer started |
| `stopped_at`       | `timestamptz` | YES    | NULL if timer is still running |
| `duration_seconds` | `integer`   | YES      | Computed duration; NULL while running |
| `created_at`       | `timestamptz` | NO     | Auto-set to NOW() |
| `updated_at`       | `timestamptz` | NO     | Auto-updated via trigger |

---

## RLS policy summary

Row Level Security is enabled on both tables. All policies check `auth.uid() = user_id` — **users can only access their own rows**.

| Table          | Policy                  | Operation | Rule |
|----------------|-------------------------|-----------|------|
| `tasks`        | `tasks_select`          | SELECT    | `auth.uid() = user_id` |
| `tasks`        | `tasks_insert`          | INSERT    | `auth.uid() = user_id` |
| `tasks`        | `tasks_update`          | UPDATE    | `auth.uid() = user_id` |
| `tasks`        | `tasks_delete`          | DELETE    | `auth.uid() = user_id` |
| `time_entries` | `time_entries_select`   | SELECT    | `auth.uid() = user_id` |
| `time_entries` | `time_entries_insert`   | INSERT    | `auth.uid() = user_id` |
| `time_entries` | `time_entries_update`   | UPDATE    | `auth.uid() = user_id` |
| `time_entries` | `time_entries_delete`   | DELETE    | `auth.uid() = user_id` |

---

## Verify setup

After running `schema.sql`, confirm tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected output: `tasks`, `time_entries`.
