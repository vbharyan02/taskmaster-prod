# Expense Tracker — Frontend

A React + Supabase expense tracking application built with Vite and Tailwind CSS. Deployable on Netlify with zero extra servers.

## Prerequisites

- Node.js 18+
- A Supabase project with the database schema applied (see `../../db/README.md` for SQL steps)

## Setup

### 1. Configure Supabase

1. Go to [supabase.com](https://supabase.com) and open your project.
2. Navigate to **Settings → API**.
3. Copy your **Project URL** and **anon/public key**.

### 2. Create `.env`

```bash
cp .env.example .env
```

Fill in your values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Netlify Deployment

1. Push this directory to a GitHub repository.
2. Connect the repo to Netlify (New site → Import from Git).
3. Netlify will detect the `netlify.toml` and use:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. In Netlify dashboard go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Trigger a redeploy. The SPA redirect rule in `netlify.toml` handles client-side routing.

## Features

- Email/password auth via Supabase Auth
- Create, view, edit, and delete expenses
- Organise expenses by category
- Dashboard with summary stats (total spend, category breakdown, recent expenses)
- Color-coded categories
- Mobile-responsive layout
