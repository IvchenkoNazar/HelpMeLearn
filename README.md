# HelpMeLearn

AI-powered interview preparation platform. Practice technical interviews, track your progress, and get personalized guidance.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Nx 22 |
| Backend | NestJS 11, Passport JWT (JWKS/ES256) |
| Frontend | Angular 19, TailwindCSS v4 |
| Auth & DB | Supabase (Auth + Postgres) |
| Cache | Redis (ioredis) |
| Shared types | `@org/shared-types` (TypeScript interfaces) |

## Project Structure

```
apps/
  backend/        NestJS API (port 3000)
  frontend/       Angular SPA (port 4200)
libs/
  shared-types/   Shared TypeScript DTOs
```

## Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com) project
- Redis (optional for M1 — used from M3 onwards)

## Local Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

```bash
cp .env.example .env
```

Fill in `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
REDIS_URL=redis://localhost:6379
PORT=3000
```

Update `apps/frontend/src/environments/environment.ts` with the same URL and publishable key.

**3. Set up Supabase**

Run the following SQL in the Supabase SQL Editor to create the profiles table:

```sql
create table public.profiles (
  id                 uuid references auth.users(id) on delete cascade primary key,
  full_name          text,
  avatar_url         text,
  subscription_tier  text not null default 'free',
  streak_count       int not null default 0,
  last_activity_date date,
  daily_goal         int not null default 5,
  created_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Running the Apps

**Backend** (NestJS on port 3000):

```bash
npx nx serve backend
```

**Frontend** (Angular on port 4200):

```bash
npx nx serve frontend
```

**Both simultaneously** (two terminals):

```bash
# Terminal 1
npx nx serve backend

# Terminal 2
npx nx serve frontend
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register with email/password |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/refresh` | No | Refresh access token |
| POST | `/api/auth/logout` | No | Sign out |
| GET | `/api/auth/google` | No | Get Google OAuth URL |
| GET | `/api/profiles/me` | JWT | Get current user profile |
| PUT | `/api/profiles/me` | JWT | Update current user profile |

## Running Tests

```bash
# All backend unit tests
npx nx test backend

# Build all projects
npx nx run-many -t build

# Run affected tasks
npx nx affected -t test,build
```

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (safe for clients) |
| `SUPABASE_SECRET_KEY` | Supabase secret key (server-side only) |
| `REDIS_URL` | Redis connection URL (default: `redis://localhost:6379`) |
| `PORT` | Backend port (default: `3000`) |
