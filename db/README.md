# fitness-tracker — Database Setup

## Running the SQL Files

### 1. schema.sql (required, run first)
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New query**
5. Paste the contents of `schema.sql`
6. Click **Run**

### 2. rls.sql (required, run after schema.sql)
1. In the SQL Editor, click **New query**
2. Paste the contents of `rls.sql`
3. Click **Run**

### 3. seed.sql (optional, for testing)
1. Create a test user in **Authentication → Users** and note their UUID
2. In `seed.sql`, replace every `00000000-0000-0000-0000-000000000001` with your test user's UUID
3. In the SQL Editor, click **New query**
4. Paste the modified `seed.sql`
5. Click **Run**

---

## Table Structure

### `workouts`
| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | `text` | NO | — | Workout name |
| `date` | `date` | NO | — | Date of the workout |
| `duration_minutes` | `integer` | YES | — | Total duration in minutes |
| `notes` | `text` | YES | — | Free-form notes |
| `created_at` | `timestamptz` | NO | `now()` | Auto-set on insert |
| `updated_at` | `timestamptz` | NO | `now()` | Auto-updated via trigger |

### `exercises`
| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `workout_id` | `uuid` | NO | — | FK → `workouts(id)` ON DELETE CASCADE |
| `name` | `text` | NO | — | Exercise name |
| `sets` | `integer` | YES | — | Number of sets |
| `reps` | `integer` | YES | — | Reps per set |
| `weight_kg` | `integer` | YES | — | Weight used in kg |
| `duration_seconds` | `integer` | YES | — | Duration for timed exercises |
| `created_at` | `timestamptz` | NO | `now()` | Auto-set on insert |
| `updated_at` | `timestamptz` | NO | `now()` | Auto-updated via trigger |

### `goals`
| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `title` | `text` | NO | — | Goal description |
| `target_value` | `integer` | NO | — | Target number to reach |
| `current_value` | `integer` | NO | — | Current progress value |
| `unit` | `text` | NO | — | Unit of measurement (e.g. `kg`, `minutes`, `sessions`) |
| `status` | `text` | NO | — | e.g. `in_progress`, `completed`, `abandoned` |
| `created_at` | `timestamptz` | NO | `now()` | Auto-set on insert |
| `updated_at` | `timestamptz` | NO | `now()` | Auto-updated via trigger |

---

## RLS Policy Summary

All policies enforce `auth.uid() = user_id` — each user can only access their own rows.

### `workouts`
| Policy | Operation | Rule |
|---|---|---|
| `workouts_select` | SELECT | User can only read their own workouts |
| `workouts_insert` | INSERT | User can only insert rows with their own `user_id` |
| `workouts_update` | UPDATE | User can only update their own workouts |
| `workouts_delete` | DELETE | User can only delete their own workouts |

### `exercises`
| Policy | Operation | Rule |
|---|---|---|
| `exercises_select` | SELECT | User can only read their own exercises |
| `exercises_insert` | INSERT | User can only insert rows with their own `user_id` |
| `exercises_update` | UPDATE | User can only update their own exercises |
| `exercises_delete` | DELETE | User can only delete their own exercises |

### `goals`
| Policy | Operation | Rule |
|---|---|---|
| `goals_select` | SELECT | User can only read their own goals |
| `goals_insert` | INSERT | User can only insert rows with their own `user_id` |
| `goals_update` | UPDATE | User can only update their own goals |
| `goals_delete` | DELETE | User can only delete their own goals |
