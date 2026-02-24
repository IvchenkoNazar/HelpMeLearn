# M1 — Foundation & Auth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the Nx monorepo with NestJS backend (Supabase auth, JWT, profiles) and Angular frontend (auth pages, responsive layouts, theme toggle).

**Architecture:** Parallel tracks with shared API contract. A `shared-types` library defines DTOs consumed by both apps. NestJS wraps Supabase Auth and validates JWTs via passport-jwt. Angular uses standalone components with TailwindCSS, mobile-first responsive layouts.

**Tech Stack:** Nx 19+, NestJS 10, Angular 19, TailwindCSS 3, Supabase JS 2.x, passport-jwt, ioredis, class-validator

---

## Phase 0: Project Setup

### Task 1: Create Nx Monorepo

**Step 1: Create the workspace**

```bash
cd /Users/nazar/Projects/Brainstorm/HelpMeLearn
npx create-nx-workspace@latest helpmelearn --preset=apps --pm=npm --nxCloud=skip
```

Select "No" for remote caching if prompted.

**Step 2: Move contents up (flatten)**

```bash
mv helpmelearn/* helpmelearn/.* . 2>/dev/null
rmdir helpmelearn
```

**Step 3: Initialize git**

```bash
git init
git add -A
git commit -m "chore: initialize Nx workspace"
```

---

### Task 2: Add NestJS Backend App

**Step 1: Install NestJS plugin and generate app**

```bash
npm install -D @nx/nest
npx nx g @nx/nest:app backend --directory=apps/backend
```

**Step 2: Verify it runs**

```bash
npx nx serve backend
```

Expected: NestJS starts on port 3000, "Hello World" at `http://localhost:3000/api`.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: add NestJS backend app"
```

---

### Task 3: Add Angular Frontend App

**Step 1: Install Angular plugin and generate app**

```bash
npm install -D @nx/angular
npx nx g @nx/angular:app frontend --directory=apps/frontend --routing --style=css --standalone
```

**Step 2: Verify it runs**

```bash
npx nx serve frontend
```

Expected: Angular dev server on port 4200, default Nx welcome page.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: add Angular frontend app"
```

---

### Task 4: Create Shared Types Library

**Step 1: Generate library**

```bash
npx nx g @nx/js:lib shared-types --directory=libs/shared-types --bundler=tsc
```

**Step 2: Replace contents of `libs/shared-types/src/index.ts`**

```typescript
// Auth DTOs
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface RefreshRequest {
  refreshToken: string;
}

// Profile
export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  subscriptionTier: 'free' | 'premium';
  streakCount: number;
  lastActivityDate: string | null;
  dailyGoal: number;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
  dailyGoal?: number;
}

// API error
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
```

**Step 3: Verify the library builds**

```bash
npx nx build shared-types
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add shared-types library with auth and profile DTOs"
```

---

### Task 5: Configure TailwindCSS for Angular

**Step 1: Set up Tailwind**

```bash
npx nx g @nx/angular:setup-tailwind frontend
```

**Step 2: Update `apps/frontend/tailwind.config.js`**

```javascript
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/*.{html,ts}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
```

**Step 3: Replace `apps/frontend/src/styles.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 antialiased;
  }
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: configure TailwindCSS with dark mode and custom colors"
```

---

### Task 6: Set Up Environment Configuration

**Files:**
- Create: `.env`
- Create: `.env.example`
- Modify: `.gitignore`
- Create: `apps/backend/src/config/configuration.ts`
- Create: `apps/frontend/src/environments/environment.ts`
- Create: `apps/frontend/src/environments/environment.prod.ts`

**Step 1: Create `.env.example`** (committed to git — no secrets)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
PORT=3000
```

**Step 2: Create `.env`** (gitignored — real values)

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
REDIS_URL=redis://localhost:6379
PORT=3000
```

**Step 3: Add to `.gitignore`**

Append:
```
.env
!.env.example
```

**Step 4: Create `apps/backend/src/config/configuration.ts`**

```typescript
export default () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  supabase: {
    url: process.env['SUPABASE_URL'],
    anonKey: process.env['SUPABASE_ANON_KEY'],
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'],
    jwtSecret: process.env['SUPABASE_JWT_SECRET'],
  },
  redis: {
    url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  },
});
```

**Step 5: Create `apps/frontend/src/environments/environment.ts`**

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  apiUrl: 'http://localhost:3000',
};
```

**Step 6: Create `apps/frontend/src/environments/environment.prod.ts`**

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  apiUrl: 'https://api.helpmelearn.app',
};
```

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: add environment configuration for backend and frontend"
```

---

## Phase 1: Supabase Infrastructure

### Task 7: Create Supabase Project and Database Schema

> **Note:** This task requires manual steps in the Supabase dashboard.

**Step 1: Create Supabase project**

Go to https://supabase.com/dashboard → New Project. Note the project URL, anon key, service role key, and JWT secret from Project Settings → API.

**Step 2: Fill in `.env` and `environment.ts` with real values**

Update `.env` (backend) and `apps/frontend/src/environments/environment.ts` (frontend) with the real Supabase credentials.

**Step 3: Run the following SQL in Supabase SQL Editor**

```sql
-- Create profiles table
create table public.profiles (
  id                 uuid references auth.users(id) on delete cascade primary key,
  full_name          text,
  avatar_url         text,
  subscription_tier  text not null default 'free',
  byok_provider      text,
  byok_api_key       text,
  preferred_ai_model text,
  streak_count       int not null default 0,
  last_activity_date date,
  daily_goal         int not null default 5,
  created_at         timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Step 4: Enable Google OAuth in Supabase**

Go to Authentication → Providers → Google → Enable. Set up Google Cloud OAuth credentials and fill in Client ID and Secret.

**Step 5: Commit env changes (only .env.example if anything changed)**

```bash
git add -A
git commit -m "chore: configure Supabase project credentials"
```

---

## Phase 2: NestJS Backend

### Task 8: Install Backend Dependencies

**Step 1: Install packages**

```bash
npm install @nestjs/config @nestjs/passport passport passport-jwt @nestjs/jwt @supabase/supabase-js ioredis class-validator class-transformer
npm install -D @types/passport-jwt
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: install backend dependencies"
```

---

### Task 9: Create Supabase Provider Module

**Files:**
- Create: `apps/backend/src/supabase/supabase.module.ts`
- Create: `apps/backend/src/supabase/supabase.service.ts`

**Step 1: Create `apps/backend/src/supabase/supabase.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.client = createClient(
      this.configService.getOrThrow<string>('supabase.url'),
      this.configService.getOrThrow<string>('supabase.anonKey'),
    );

    this.adminClient = createClient(
      this.configService.getOrThrow<string>('supabase.url'),
      this.configService.getOrThrow<string>('supabase.serviceRoleKey'),
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
```

**Step 2: Create `apps/backend/src/supabase/supabase.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Supabase provider module"
```

---

### Task 10: Create Redis Module

**Files:**
- Create: `apps/backend/src/redis/redis.module.ts`
- Create: `apps/backend/src/redis/redis.service.ts`

**Step 1: Create `apps/backend/src/redis/redis.service.ts`**

```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis(
      this.configService.getOrThrow<string>('redis.url'),
    );
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
```

**Step 2: Create `apps/backend/src/redis/redis.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Redis module (connected, used from M3)"
```

---

### Task 11: Implement JWT Strategy and Guard

**Files:**
- Create: `apps/backend/src/auth/strategies/jwt.strategy.ts`
- Create: `apps/backend/src/auth/guards/jwt-auth.guard.ts`

**Step 1: Create `apps/backend/src/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('supabase.jwtSecret'),
    });
  }

  validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email };
  }
}
```

**Step 2: Create `apps/backend/src/auth/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add JWT strategy and guard for Supabase token validation"
```

---

### Task 12: Implement Auth Module

**Files:**
- Create: `apps/backend/src/auth/auth.module.ts`
- Create: `apps/backend/src/auth/auth.service.ts`
- Create: `apps/backend/src/auth/auth.controller.ts`
- Create: `apps/backend/src/auth/dto/register.dto.ts`
- Create: `apps/backend/src/auth/dto/login.dto.ts`
- Create: `apps/backend/src/auth/decorators/current-user.decorator.ts`

**Step 1: Create `apps/backend/src/auth/dto/register.dto.ts`**

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  fullName: string;
}
```

**Step 2: Create `apps/backend/src/auth/dto/login.dto.ts`**

```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

**Step 3: Create `apps/backend/src/auth/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Step 4: Create `apps/backend/src/auth/auth.service.ts`**

```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string, fullName: string) {
    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: data.user,
    };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    };
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  }

  async logout(accessToken: string) {
    const { error } = await this.supabaseService.getAdminClient().auth.admin.signOut(accessToken);

    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  getGoogleOAuthUrl() {
    const supabaseUrl = this.configService.getOrThrow<string>('supabase.url');
    return `${supabaseUrl}/auth/v1/authorize?provider=google`;
  }
}
```

**Step 5: Create `apps/backend/src/auth/auth.controller.ts`**

```typescript
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.fullName);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Get('google')
  getGoogleOAuthUrl() {
    return { url: this.authService.getGoogleOAuthUrl() };
  }
}
```

**Step 6: Create `apps/backend/src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: implement auth module with register, login, refresh, logout, Google OAuth"
```

---

### Task 13: Implement Profiles Module

**Files:**
- Create: `apps/backend/src/profiles/profiles.module.ts`
- Create: `apps/backend/src/profiles/profiles.service.ts`
- Create: `apps/backend/src/profiles/profiles.controller.ts`

**Step 1: Create `apps/backend/src/profiles/profiles.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfilesService {
  constructor(private supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: data.id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      subscriptionTier: data.subscription_tier,
      streakCount: data.streak_count,
      lastActivityDate: data.last_activity_date,
      dailyGoal: data.daily_goal,
      createdAt: data.created_at,
    };
  }

  async updateProfile(
    userId: string,
    updates: { fullName?: string; avatarUrl?: string; dailyGoal?: number },
  ) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdates['full_name'] = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates['avatar_url'] = updates.avatarUrl;
    if (updates.dailyGoal !== undefined) dbUpdates['daily_goal'] = updates.dailyGoal;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: data.id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      subscriptionTier: data.subscription_tier,
      streakCount: data.streak_count,
      lastActivityDate: data.last_activity_date,
      dailyGoal: data.daily_goal,
      createdAt: data.created_at,
    };
  }
}
```

**Step 2: Create `apps/backend/src/profiles/profiles.controller.ts`**

```typescript
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: CurrentUserData) {
    return this.profilesService.getProfile(user.userId);
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { fullName?: string; avatarUrl?: string; dailyGoal?: number },
  ) {
    return this.profilesService.updateProfile(user.userId, body);
  }
}
```

**Step 3: Create `apps/backend/src/profiles/profiles.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement profiles module with get and update endpoints"
```

---

### Task 14: Wire Up AppModule and Enable Validation

**Files:**
- Modify: `apps/backend/src/app/app.module.ts`
- Modify: `apps/backend/src/main.ts`

**Step 1: Replace `apps/backend/src/app/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { SupabaseModule } from '../supabase/supabase.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SupabaseModule,
    RedisModule,
    AuthModule,
    ProfilesModule,
  ],
})
export class AppModule {}
```

**Step 2: Replace `apps/backend/src/main.ts`**

```typescript
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  Logger.log(`Backend running on http://localhost:${port}/api`);
}

bootstrap();
```

**Step 3: Verify backend starts**

```bash
npx nx serve backend
```

Expected: "Backend running on http://localhost:3000/api"

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire up AppModule with all M1 modules, enable validation and CORS"
```

---

## Phase 3: Angular Frontend

### Task 15: Create Auth Service

**Files:**
- Create: `apps/frontend/src/app/core/auth.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  private sessionSignal = signal<Session | null>(null);

  readonly isAuthenticated = computed(() => !!this.sessionSignal());
  readonly currentUser = computed(() => this.sessionSignal()?.user ?? null);
  readonly accessToken = computed(() => this.sessionSignal()?.access_token ?? null);

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

    this.supabase.auth.getSession().then(({ data }) => {
      this.sessionSignal.set(data.session);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.sessionSignal.set(session);
    });
  }

  async register(email: string, password: string, fullName: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async loginWithGoogle() {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/auth/login']);
  }

  async refreshSession() {
    const { data, error } = await this.supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Angular AuthService wrapping Supabase client"
```

---

### Task 16: Create JWT Interceptor and Auth Guard

**Files:**
- Create: `apps/frontend/src/app/core/jwt.interceptor.ts`
- Create: `apps/frontend/src/app/core/auth.guard.ts`

**Step 1: Create `apps/frontend/src/app/core/jwt.interceptor.ts`**

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
```

**Step 2: Create `apps/frontend/src/app/core/auth.guard.ts`**

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add JWT interceptor and auth guard"
```

---

### Task 17: Create Theme Service

**Files:**
- Create: `apps/frontend/src/app/core/theme.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    effect(() => {
      const theme = this.themeSignal();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    });
  }

  toggle() {
    this.themeSignal.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add ThemeService with dark/light toggle and localStorage persistence"
```

---

### Task 18: Create Shared UI Components

**Files:**
- Create: `apps/frontend/src/app/shared/components/button/button.component.ts`
- Create: `apps/frontend/src/app/shared/components/input/input.component.ts`
- Create: `apps/frontend/src/app/shared/components/spinner/spinner.component.ts`
- Create: `apps/frontend/src/app/shared/components/card/card.component.ts`

**Step 1: Create `button.component.ts`**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
    >
      @if (loading) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'google' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  get buttonClasses(): string {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] px-4 py-2.5 text-sm';
    const width = this.fullWidth ? 'w-full' : '';
    const disabledClass = this.disabled || this.loading ? 'opacity-50 cursor-not-allowed' : '';

    const variants: Record<string, string> = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      outline:
        'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
      google:
        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    };

    return `${base} ${width} ${disabledClass} ${variants[this.variant]}`;
  }
}
```

**Step 2: Create `input.component.ts`**

```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label) {
        <label [for]="inputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ label }}
        </label>
      }
      <input
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="w-full min-h-[44px] px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900
               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
               dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500
               disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      />
      @if (error) {
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() inputId = '';

  value = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string) {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
}
```

**Step 3: Create `spinner.component.ts`**

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <svg
        class="animate-spin text-primary-600 dark:text-primary-400"
        [class]="sizeClass"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    </div>
  `,
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() containerClass = '';

  get sizeClass(): string {
    const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
    return sizes[this.size];
  }
}
```

**Step 4: Create `card.component.ts`**

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="cardClasses">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() padding = true;

  get cardClasses(): string {
    const base = 'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800';
    return this.padding ? `${base} p-6` : base;
  }
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared UI components (Button, Input, Spinner, Card)"
```

---

### Task 19: Create Auth Layout

**Files:**
- Create: `apps/frontend/src/app/layouts/auth-layout/auth-layout.component.ts`

**Step 1: Create the component**

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">HelpMeLearn</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-powered interview preparation</p>
        </div>

        <!-- Theme toggle -->
        <div class="absolute top-4 right-4">
          <button
            (click)="themeService.toggle()"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            @if (themeService.theme() === 'light') {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            } @else {
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            }
          </button>
        </div>

        <router-outlet />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  constructor(public themeService: ThemeService) {}
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add auth layout with centered card and theme toggle"
```

---

### Task 20: Create Login Page

**Files:**
- Create: `apps/frontend/src/app/features/auth/login/login.component.ts`

**Step 1: Create the component**

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
  template: `
    <app-card>
      <h2 class="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">Sign in</h2>

      @if (errorMessage()) {
        <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {{ errorMessage() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <app-input
          label="Email"
          type="email"
          placeholder="you@example.com"
          inputId="login-email"
          [(ngModel)]="email"
          name="email"
        />
        <app-input
          label="Password"
          type="password"
          placeholder="Your password"
          inputId="login-password"
          [(ngModel)]="password"
          name="password"
        />
        <app-button type="submit" [fullWidth]="true" [loading]="loading()" variant="primary">
          Sign in
        </app-button>
      </form>

      <div class="my-4 flex items-center">
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        <span class="px-3 text-sm text-gray-400">or</span>
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      <app-button variant="google" [fullWidth]="true" (click)="onGoogleLogin()">
        <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </app-button>

      <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?
        <a routerLink="/auth/register" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
          Sign up
        </a>
      </p>
    </app-card>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogleLogin() {
    try {
      await this.authService.loginWithGoogle();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Google login failed');
    }
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add login page with email/password and Google OAuth"
```

---

### Task 21: Create Register Page

**Files:**
- Create: `apps/frontend/src/app/features/auth/register/register.component.ts`

**Step 1: Create the component**

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
  template: `
    <app-card>
      <h2 class="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">Create account</h2>

      @if (errorMessage()) {
        <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {{ errorMessage() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <app-input
          label="Full name"
          type="text"
          placeholder="John Doe"
          inputId="register-name"
          [(ngModel)]="fullName"
          name="fullName"
        />
        <app-input
          label="Email"
          type="email"
          placeholder="you@example.com"
          inputId="register-email"
          [(ngModel)]="email"
          name="email"
        />
        <app-input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          inputId="register-password"
          [(ngModel)]="password"
          name="password"
        />
        <app-button type="submit" [fullWidth]="true" [loading]="loading()" variant="primary">
          Create account
        </app-button>
      </form>

      <div class="my-4 flex items-center">
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        <span class="px-3 text-sm text-gray-400">or</span>
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      <app-button variant="google" [fullWidth]="true" (click)="onGoogleRegister()">
        <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </app-button>

      <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?
        <a routerLink="/auth/login" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
          Sign in
        </a>
      </p>
    </app-card>
  `,
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.register(this.email, this.password, this.fullName);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogleRegister() {
    try {
      await this.authService.loginWithGoogle();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Google sign-up failed');
    }
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add register page with email/password and Google OAuth"
```

---

### Task 22: Create Main Layout

**Files:**
- Create: `apps/frontend/src/app/layouts/main-layout/main-layout.component.ts`

**Step 1: Create the component**

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Desktop sidebar -->
    <aside class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <!-- Logo -->
      <div class="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800">
        <span class="text-lg font-bold text-primary-600 dark:text-primary-400">HelpMeLearn</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span [innerHTML]="item.icon"></span>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Bottom actions -->
      <div class="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button
          (click)="themeService.toggle()"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {{ themeService.theme() === 'light' ? 'Dark mode' : 'Light mode' }}
        </button>
        <button
          (click)="authService.logout()"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="lg:pl-60 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div class="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <router-outlet />
      </div>
    </main>

    <!-- Mobile bottom navigation -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50">
      <div class="flex items-center justify-around h-16">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-primary-600 dark:text-primary-400"
            class="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 text-xs min-w-[48px] py-1"
          >
            <span [innerHTML]="item.icon"></span>
            {{ item.label }}
          </a>
        }
      </div>
    </nav>
  `,
})
export class MainLayoutComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '&#9776;' },
    { path: '/roadmap', label: 'Roadmap', icon: '&#128204;' },
    { path: '/chat', label: 'Chat', icon: '&#128172;' },
    { path: '/progress', label: 'Progress', icon: '&#128200;' },
    { path: '/settings', label: 'Settings', icon: '&#9881;' },
  ];

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
  ) {}
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add main layout with responsive sidebar and bottom navigation"
```

---

### Task 23: Create Dashboard Placeholder and Set Up Routing

**Files:**
- Create: `apps/frontend/src/app/features/dashboard/dashboard.component.ts`
- Create: `apps/frontend/src/app/features/auth/callback/auth-callback.component.ts`
- Modify: `apps/frontend/src/app/app.routes.ts`
- Modify: `apps/frontend/src/app/app.config.ts`

**Step 1: Create `apps/frontend/src/app/features/dashboard/dashboard.component.ts`**

```typescript
import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent],
  template: `
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard</h1>
    <app-card>
      <div class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-lg">Welcome to HelpMeLearn</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Onboarding and learning program coming in M2.</p>
      </div>
    </app-card>
  `,
})
export class DashboardComponent {}
```

**Step 2: Create `apps/frontend/src/app/features/auth/callback/auth-callback.component.ts`**

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <app-spinner size="lg" />
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Supabase JS client handles the OAuth callback automatically
    // via onAuthStateChange. Just redirect after a short delay.
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}
```

**Step 3: Replace `apps/frontend/src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./features/auth/callback/auth-callback.component').then(
            (m) => m.AuthCallbackComponent,
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
```

**Step 4: Update `apps/frontend/src/app/app.config.ts`**

Add `provideHttpClient(withInterceptors([jwtInterceptor]))` and `provideRouter(appRoutes)`:

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { jwtInterceptor } from './core/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
```

**Step 5: Update `apps/frontend/src/app/app.component.ts`**

Replace template to just render the router outlet:

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

**Step 6: Verify frontend starts**

```bash
npx nx serve frontend
```

Expected: App loads at `http://localhost:4200`, redirects to `/auth/login`, shows login form.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add routing, dashboard placeholder, auth callback, wire up app config"
```

---

## Phase 4: Tests

### Task 24: Write Backend Auth Tests

**Files:**
- Create: `apps/backend/src/auth/auth.service.spec.ts`
- Create: `apps/backend/src/auth/auth.controller.spec.ts`

**Step 1: Create `apps/backend/src/auth/auth.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: jest.Mocked<any>;

  const mockSupabaseClient = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      refreshSession: jest.fn(),
    },
  };

  const mockSupabaseAdminClient = {
    auth: {
      admin: { signOut: jest.fn() },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient,
            getAdminClient: () => mockSupabaseAdminClient,
          },
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('http://localhost') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should return tokens on successful registration', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          session: { access_token: 'at', refresh_token: 'rt' },
          user: { id: '1', email: 'test@test.com' },
        },
        error: null,
      });

      const result = await service.register('test@test.com', 'password', 'Test');
      expect(result.accessToken).toBe('at');
      expect(result.refreshToken).toBe('rt');
    });

    it('should throw BadRequestException on Supabase error', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {},
        error: { message: 'User already registered' },
      });

      await expect(service.register('test@test.com', 'pw', 'Test')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'at', refresh_token: 'rt' },
          user: { id: '1' },
        },
        error: null,
      });

      const result = await service.login('test@test.com', 'password');
      expect(result.accessToken).toBe('at');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {},
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should return new tokens', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: { access_token: 'new-at', refresh_token: 'new-rt' } },
        error: null,
      });

      const result = await service.refresh('old-rt');
      expect(result.accessToken).toBe('new-at');
    });
  });
});
```

**Step 2: Run tests**

```bash
npx nx test backend
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add -A
git commit -m "test: add auth service unit tests"
```

---

### Task 25: Write Backend JWT Guard Test

**Files:**
- Create: `apps/backend/src/auth/guards/jwt-auth.guard.spec.ts`

**Step 1: Create the test**

```typescript
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should return user data from valid payload', () => {
    const result = strategy.validate({ sub: 'user-123', email: 'test@test.com', role: 'authenticated' });
    expect(result).toEqual({ userId: 'user-123', email: 'test@test.com' });
  });

  it('should throw UnauthorizedException for missing sub', () => {
    expect(() => strategy.validate({ sub: '', email: '', role: '' })).toThrow(
      UnauthorizedException,
    );
  });
});
```

**Step 2: Run tests**

```bash
npx nx test backend
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add -A
git commit -m "test: add JWT strategy unit tests"
```

---

### Task 26: Write Profiles Service Test

**Files:**
- Create: `apps/backend/src/profiles/profiles.service.spec.ts`

**Step 1: Create the test**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();

  const mockAdminClient = {
    from: jest.fn().mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: SupabaseService,
          useValue: { getAdminClient: () => mockAdminClient },
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProfile', () => {
    it('should return a mapped profile', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: '1',
          full_name: 'Test User',
          avatar_url: null,
          subscription_tier: 'free',
          streak_count: 0,
          last_activity_date: null,
          daily_goal: 5,
          created_at: '2026-01-01',
        },
        error: null,
      });

      const result = await service.getProfile('1');
      expect(result.fullName).toBe('Test User');
      expect(result.subscriptionTier).toBe('free');
    });

    it('should throw NotFoundException when profile not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });

      await expect(service.getProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
```

**Step 2: Run tests**

```bash
npx nx test backend
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add -A
git commit -m "test: add profiles service unit tests"
```

---

## Verification

### Task 27: End-to-End Smoke Test

**Step 1: Start both apps**

Terminal 1:
```bash
npx nx serve backend
```

Terminal 2:
```bash
npx nx serve frontend
```

**Step 2: Verify these flows manually:**

1. Navigate to `http://localhost:4200` → redirected to `/auth/login`
2. Click "Sign up" link → navigate to `/auth/register`
3. Fill in name, email, password → click "Create account" → redirected to `/dashboard`
4. Dashboard shows placeholder content, sidebar visible on desktop, bottom nav on mobile
5. Click "Sign out" → redirected to `/auth/login`
6. Login with the created credentials → back to `/dashboard`
7. Toggle dark/light theme → persists on page reload

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: M1 Foundation & Auth complete"
```

---

## Summary

| Phase | Tasks | What's built |
|---|---|---|
| Phase 0 | Tasks 1–6 | Nx monorepo, NestJS app, Angular app, shared-types lib, Tailwind, env config |
| Phase 1 | Task 7 | Supabase project, profiles table, RLS, auth trigger |
| Phase 2 | Tasks 8–14 | NestJS auth (register/login/logout/refresh/Google), JWT guard, profiles CRUD |
| Phase 3 | Tasks 15–23 | Angular auth service, interceptor, guard, theme, shared components, layouts, auth pages, routing |
| Phase 4 | Tasks 24–26 | Unit tests for auth service, JWT strategy, profiles service |
| Verify | Task 27 | Manual smoke test of full auth flow |
