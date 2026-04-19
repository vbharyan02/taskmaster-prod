# book-tracker — Database Setup

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
2. In `seed.sql`, replace `00000000-0000-0000-0000-000000000001` with your test user's UUID
3. In the SQL Editor, click **New query**
4. Paste the modified `seed.sql`
5. Click **Run**

---

## Table Structure

### `books`
| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `title` | `text` | NO | — | Book title |
| `author` | `text` | NO | — | Author name |
| `genre` | `text` | YES | — | Book genre (optional) |
| `status` | `text` | NO | — | e.g. `read`, `reading`, `want-to-read` |
| `created_at` | `timestamptz` | NO | `now()` | Auto-set on insert |
| `updated_at` | `timestamptz` | NO | `now()` | Auto-updated via trigger |

---

## RLS Policy Summary

All policies on `books` enforce that `auth.uid() = user_id`, meaning each user can only access their own rows.

| Policy | Operation | Rule |
|---|---|---|
| `books_select` | SELECT | User can only read their own books |
| `books_insert` | INSERT | User can only insert rows with their own `user_id` |
| `books_update` | UPDATE | User can only update their own books |
| `books_delete` | DELETE | User can only delete their own books |
