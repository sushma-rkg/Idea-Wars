# IdeaWars

A minimal real-time idea battle app. Create discussion threads, post ideas, upvote favorites, and view the leaderboard.

## Stack

- **Next.js 15** (App Router) — Vercel-ready
- **Supabase** — email auth + Postgres storage
- **Tailwind CSS v4** + **Framer Motion** — modern UI with subtle animations

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Under **Authentication → Providers**, ensure **Email** is enabled
4. Under **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000` (or your Vercel URL)
   - Redirect URLs: `http://localhost:3000/**` and `https://your-app.vercel.app/**`
5. Copy your **Project URL** and **anon public key** from **Settings → API**

> **Tip:** For easier local testing, disable email confirmation under **Authentication → Providers → Email → Confirm email**.

6. Under **Database → Replication**, ensure `ideas` and `upvotes` are enabled for Realtime (the schema SQL handles this, but verify if live updates don't appear).

### 2. Local development

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Update Supabase redirect URLs with your production domain.

## Features

- Email sign up / sign in (Supabase Auth)
- Create threads with optional 5 or 10 minute timers (or no timer)
- Shareable thread URLs (`/thread/[id]`)
- Post ideas and upvote (one vote per user per idea)
- Toggle leaderboard view — ideas ranked by upvotes
- Real-time updates via Supabase Realtime
- Animations on post and upvote actions
