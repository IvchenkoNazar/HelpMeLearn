# M1 — Foundation & Auth: Design Document

**Date:** 2026-02-24
**Project:** HelpMeLearn (Interview Prep App)
**Milestone:** M1 — Foundation & Auth

---

## Overview

Milestone 1 establishes the working skeleton of the project: Nx monorepo, NestJS backend with Supabase auth, Angular frontend with auth pages and responsive layouts, and the Supabase database with the profiles table.

**Approach:** Parallel tracks with shared API contract. Backend and frontend are developed simultaneously using a defined API contract. Shared TypeScript types live in a shared library consumed by both apps.

---

## Project Structure

```
helpmelearn/
├── apps/
│   ├── backend/          # NestJS application
│   └── frontend/         # Angular application
├── libs/
│   └── shared-types/     # Shared DTOs and interfaces (auth, profiles)
├── nx.json
├── package.json
└── .env                  # Local secrets (gitignored)
```

### Environment Variables

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
REDIS_URL=
PORT=3000
```

---

## Backend — NestJS

### Modules

**AppModule**
- Global `ConfigModule` (loads `.env`)
- `SupabaseModule` (provides Supabase client as injectable)
- `RedisModule` (ioredis, connected but not actively used until M3)
- Imports `AuthModule`, `ProfilesModule`

**AuthModule**
- `AuthController` — HTTP endpoints
- `AuthService` — business logic delegating to Supabase Auth
- `JwtGuard` (PassportJS strategy) — validates Supabase JWT on protected routes
- `JwtStrategy` — extracts and verifies JWT using Supabase public key

**ProfilesModule**
- `ProfilesController` — `GET /profiles/me`, `PUT /profiles/me`
- `ProfilesService` — reads/updates `profiles` table via Supabase client

### Auth Endpoints

```
POST /auth/register          # supabase.auth.signUp()
POST /auth/login             # supabase.auth.signInWithPassword()
POST /auth/logout            # supabase.auth.signOut()
POST /auth/refresh           # supabase.auth.refreshSession()
POST /auth/google            # initiate Supabase Google OAuth
GET  /auth/callback          # OAuth redirect handler
```

### Auth Flow

1. Client sends credentials → NestJS calls Supabase Auth → returns `{ access_token, refresh_token }`
2. Client stores tokens, attaches `Authorization: Bearer <access_token>` to subsequent requests
3. `JwtGuard` verifies the JWT on every protected route
4. On token expiry, client calls `POST /auth/refresh`

### Profile Creation

A Supabase database trigger creates a `profiles` row automatically when a new `auth.users` row is inserted:

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### Key Packages (Backend)

- `@nestjs/config` — environment configuration
- `@nestjs/passport`, `passport`, `passport-jwt` — JWT guard
- `@supabase/supabase-js` — Supabase client
- `ioredis` — Redis connection
- `class-validator`, `class-transformer` — DTO validation

---

## Frontend — Angular

### Core Structure

**CoreModule** (imported once in `AppModule`)
- `AuthService` — wraps Supabase JS client (`signUp`, `signIn`, `signOut`, `getSession`)
- `JwtInterceptor` — attaches `Authorization: Bearer` header to all HTTP requests
- `AuthGuard` — redirects to `/auth/login` if no active session

**SharedModule**
- Standalone components: `ButtonComponent`, `CardComponent`, `BadgeComponent`, `ModalComponent`, `InputComponent`, `SpinnerComponent`
- All styled with TailwindCSS, mobile-first

**ThemeService**
- Dark/light theme toggle
- Persisted in `localStorage` under key `theme`
- Applied as `dark` class on `<html>` element (Tailwind dark mode: `class` strategy)

### Layouts

**AuthLayout** (`/auth/*`)
- Centered card on all screen sizes
- Logo at top, form in card, no navigation

**MainLayout** (protected routes)
- Desktop (`lg:` breakpoint): fixed left sidebar (240px) + main content area
- Mobile: full-width content + fixed bottom navigation bar (5 icon tabs)
- Bottom nav tabs: Dashboard, Roadmap, Chat, Progress, Settings (placeholders for M2+)

### Pages

**LoginPage** (`/auth/login`)
- Email + password fields
- "Continue with Google" button
- Link to register
- Mobile-first: full-width inputs, large tap targets (min 44px height)

**RegisterPage** (`/auth/register`)
- Full name + email + password fields
- "Continue with Google" button
- Link to login

**DashboardPage** (`/dashboard`) — placeholder, protected
- Empty state with "Onboarding coming soon" message (implemented in M2)

### Routing

```
/auth/login        → AuthLayout > LoginPage
/auth/register     → AuthLayout > RegisterPage
/                  → redirect to /dashboard
/dashboard         → MainLayout > DashboardPage (AuthGuard)
```

### Key Packages (Frontend)

- Angular 17+ (standalone components, new control flow)
- TailwindCSS 3 (mobile-first, dark mode via `class` strategy)
- `@supabase/supabase-js` — auth client
- `@angular/common/http` — HTTP client with interceptors

---

## Database — Supabase / PostgreSQL

### Tables Created in M1

```sql
-- profiles table (full schema for the entire project)
create table public.profiles (
  id                 uuid references auth.users(id) on delete cascade primary key,
  full_name          text,
  avatar_url         text,
  subscription_tier  text not null default 'free',
  byok_provider      text,
  byok_api_key       text,         -- application-level encryption in M6
  preferred_ai_model text,
  streak_count       int not null default 0,
  last_activity_date date,
  daily_goal         int not null default 5,
  created_at         timestamptz not null default now()
);
```

### RLS Policies

```sql
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Insert only via service role (trigger)
-- No INSERT policy for authenticated users
```

---

## Decisions & Deferred Items

| Item | Decision |
|---|---|
| Redis usage | Connected in M1, actively used from M3 (AI response caching) |
| `byok_api_key` encryption | Noted; application-level encryption implemented in M6 |
| Supabase deployment | Free tier for development, upgrade to Pro as needed |
| Railway deployment config | Files added in M1, actual deployment in M6 |
| Tests | Written after implementation, covering auth flows and JWT guard |
| Other DB tables | Deferred to their respective milestones (M2–M5) |

---

*Design approved 2026-02-24. Proceed to implementation plan.*
