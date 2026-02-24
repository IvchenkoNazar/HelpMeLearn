    # 🎯 Interview Prep App — Project Roadmap

> AI-powered платформа для підготовки до співбесід з персоналізованою програмою навчання

---

## 📋 Project Overview

| | |
|---|---|
| **Продукт** | AI-powered навчальна платформа для підготовки до співбесід |
| **Платформа** | Web (Angular) → Mobile (iOS, post-MVP) |
| **Монетизація** | Freemium (Free / Premium) |
| **AI** | OpenAI (default) + BYOK (AWS Bedrock Claude, Gemini, інші) |
| **Стек** | Angular + TailwindCSS · NestJS · Supabase (PostgreSQL + Auth + Realtime) · Redis |

---

## 🎯 Product Vision

Додаток допомагає користувачам будь-якої сфери (IT, Marketing, Finance тощо) зручно готуватись до співбесід або поглиблювати знання. AI будує персональну програму навчання, генерує контент, адаптується в процесі і допомагає через контекстний чат. Режим інтерв'юера дозволяє проводити mock interviews і переглядати питання по рівнях.

---

## ✅ Feature List

### 🔐 Auth
- Реєстрація / логін (email + password)
- Login via Google (Supabase OAuth)
- JWT + refresh tokens

### 🚀 Onboarding
- Короткий quiz (сфера, рівень, цілі)
- Skill assessment тест (AI визначає точний рівень)
- Можливість пропустити onboarding
- AI будує персональну програму навчання

### 📚 Навчання
- Розділи / підрозділи з ієрархією (Field → Topic → Subtopic)
- AI генерує: Summary, Cheatsheet, важлива інформація
- Quizzes / міні-тести після розділу
- Bookmark / збережені матеріали
- Власні нотатки до розділів
- Roadmap view — візуальна карта тем
- Search — пошук по темах, cheatsheets, нотатках
- Recently viewed — швидкий доступ до останніх тем
- Export cheatsheet / нотаток в PDF

### 🤖 Adaptive Learning Program
- AI автоматично адаптує програму на основі прогресу і quiz результатів
- Користувач може вручну редагувати програму
- Коригування програми через AI чат

### 💬 AI Чат
- Контекстний чат прив'язаний до теми
- AI пам'ятає історію розмови по темі
- Стрімінг відповідей (Supabase Realtime / WebSocket)

### 📊 Прогрес
- Трекінг пройдених тем
- Streak система (щоденна активність)
- Daily goal (встановлення і трекінг)
- Статистика (% готовності, слабкі місця)
- Spaced repetition (in-app indicator для повторення)

### 🎤 Режим інтерв'юера
- Питання по рівнях (Junior / Middle / Senior)
- Очікувані відповіді для кожного рівня
- Mock interview — AI задає питання, оцінює відповідь, дає фідбек
- Фінальний звіт після mock interview сесії

### ⚙️ Технічні фічі
- BYOK підтримка (AWS Bedrock Claude, Gemini, інші)
- Вибір AI моделі користувачем
- AI Provider абстракційний шар
- Темна / світла тема

### 💳 Freemium
| | Free | Premium |
|---|---|---|
| Теми | Обмежено | Необмежено |
| AI чат | Ліміт повідомлень/день | Необмежено |
| Mock interview | ❌ | ✅ |
| BYOK | ❌ | ✅ |
| Статистика | Базова | Детальна |
| Export PDF | ❌ | ✅ |

---

## 🔵 Post-MVP Backlog

- [ ] Job Market insights (Adzuna, Remotive APIs) — тренди, вакансії, затребувані технології
- [ ] Зображення та графіки в контенті
- [ ] Мобайл додаток (iOS)
- [ ] Email / Push notifications
- [ ] Referral система
- [ ] Certificate of completion
- [ ] Interview scheduler (інтеграція з календарем)
- [ ] Соціальні фічі (шерінг, leaderboard)

---

## 🏗️ Tech Stack

### Backend — NestJS
```
src/
├── auth/           # Supabase Auth інтеграція, JWT guard
├── users/          # Профілі, налаштування
├── onboarding/     # Quiz, skill assessment, генерація програми
├── fields/         # Сфери (IT, Marketing...)
├── topics/         # Ієрархія тем
├── programs/       # Програма навчання, адаптація
├── content/        # AI контент (summary, cheatsheet)
├── quiz/           # Генерація і перевірка тестів
├── interview/      # Режим інтерв'юера, mock interview
├── chat/           # AI чат, WebSocket gateway
├── progress/       # Трекінг, streak, spaced repetition
├── notes/          # Нотатки
├── bookmarks/      # Закладки
├── settings/       # AI налаштування, BYOK
└── ai/
    ├── ai.service.ts
    ├── providers/
    │   ├── openai.provider.ts
    │   ├── bedrock.provider.ts
    │   └── gemini.provider.ts
    ├── prompts/
    │   ├── program.prompt.ts
    │   ├── summary.prompt.ts
    │   ├── cheatsheet.prompt.ts
    │   ├── quiz.prompt.ts
    │   ├── interview.prompt.ts
    │   └── chat.prompt.ts
    └── cache/
        └── ai-cache.service.ts
```

### Frontend — Angular
```
src/
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── shared/
│   ├── components/     # Button, Card, Badge, Modal, Input
│   ├── directives/
│   └── pipes/
├── layouts/
│   ├── main-layout/
│   └── auth-layout/
└── features/
    ├── onboarding/
    ├── dashboard/
    ├── roadmap/
    ├── learning/
    │   ├── topic-detail/
    │   ├── summary/
    │   ├── cheatsheet/
    │   └── quiz/
    ├── interview/
    │   ├── interviewer-mode/
    │   └── mock-interview/
    ├── chat/
    ├── progress/
    ├── bookmarks/
    ├── notes/
    └── settings/
```

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

```sql
-- Профілі користувачів
profiles (id, full_name, avatar_url, subscription_tier, byok_provider,
          byok_api_key, preferred_ai_model, streak_count, last_activity_date,
          daily_goal, created_at)

-- Сфери знань
fields (id, title, description, icon, created_at)

-- Теми (ієрархічні)
topics (id, field_id, title, description, order_index,
        parent_topic_id, difficulty_level, created_at)

-- Програма навчання
learning_programs (id, user_id, field_id, goal, target_date,
                   current_level, status, created_at, updated_at)

-- Теми в програмі
program_topics (id, program_id, topic_id, status, priority_score,
                scheduled_review_at, completed_at)

-- AI контент (кеш)
topic_content (id, topic_id, user_id, content_type, content jsonb,
               ai_provider, ai_model, created_at, expires_at)

-- Результати тестів
quiz_results (id, user_id, topic_id, score, total_questions,
              weak_areas jsonb, created_at)

-- Mock interview сесії
interview_sessions (id, user_id, topic_id, level, status,
                    overall_score, created_at)

-- Повідомлення в interview
interview_messages (id, session_id, role, content, ai_feedback,
                    score, created_at)

-- AI чат сесії
chat_sessions (id, user_id, topic_id, created_at, updated_at)

-- Повідомлення в чаті
chat_messages (id, session_id, role, content, created_at)

-- Нотатки
notes (id, user_id, topic_id, content, created_at, updated_at)

-- Закладки
bookmarks (id, user_id, topic_id, content_id, created_at)
```

---

## 🗺️ API Design

### Auth
```
POST /auth/register
POST /auth/login
POST /auth/google
POST /auth/logout
POST /auth/refresh
```

### Onboarding
```
POST /onboarding/quiz
POST /onboarding/skill-assessment
POST /onboarding/generate-program
```

### Learning Program
```
GET  /programs/me
PUT  /programs/me
POST /programs/me/regenerate
POST /programs/me/adapt
```

### Topics & Content
```
GET  /fields
GET  /fields/:id/topics
GET  /topics/:id
GET  /topics/:id/content          # summary, cheatsheet (кеш або генерація)
POST /topics/:id/content/refresh
GET  /topics/:id/quiz
POST /topics/:id/quiz/submit
```

### Chat
```
GET  /chat/sessions/:topicId
POST /chat/sessions/:topicId/message  # stream
```

### Interview
```
POST /interview/sessions
GET  /interview/sessions/:id
POST /interview/sessions/:id/answer
GET  /interview/sessions/:id/feedback
GET  /interview/questions
```

### Progress
```
GET  /progress/me
GET  /progress/me/streak
GET  /progress/me/weak-areas
POST /progress/topics/:id/complete
```

### Notes & Bookmarks
```
GET/POST       /notes/:topicId
PUT/DELETE     /notes/:id
GET/POST       /bookmarks
DELETE         /bookmarks/:id
GET            /bookmarks/me
```

### Settings
```
GET /settings/ai
PUT /settings/ai
```

---

## 🚀 Milestones & Task Breakdown

---

### Milestone 1 — Foundation & Auth
> **Ціль:** Робочий проект з авторизацією і базовою навігацією

#### Backend
- [ ] Ініціалізація NestJS проекту, налаштування модульної структури
- [ ] Підключення Supabase (client, auth, database)
- [ ] Налаштування Redis (кешування)
- [ ] Реалізація JWT guard та interceptors
- [ ] Auth модуль: register, login, logout, refresh token
- [ ] Google OAuth інтеграція через Supabase
- [ ] Profiles модуль: автоматичне створення профілю після реєстрації
- [ ] Базові Supabase RLS політики для всіх таблиць

#### Frontend
- [ ] Ініціалізація Angular проекту + TailwindCSS
- [ ] Налаштування TailwindCSS з mobile-first підходом: визначити breakpoints (sm/md/lg/xl) і grid систему
- [ ] Налаштування Supabase client
- [ ] Core модуль: auth service, HTTP interceptor (JWT), auth guard
- [ ] Layouts: auth-layout, main-layout — sidebar на десктопі, bottom navigation на мобайлі
- [ ] Сторінки: Login, Register (email + Google) — адаптовані для мобайлу
- [ ] ThemeService: темна/світла тема
- [ ] Базові shared компоненти: Button, Card, Badge, Modal, Input, Spinner — всі mobile-first

---

### Milestone 2 — Onboarding & Learning Program
> **Ціль:** Користувач проходить onboarding і отримує AI програму навчання

#### Backend
- [ ] Fields модуль: CRUD, seed початкових сфер
- [ ] Topics модуль: ієрархічна структура, seed базових тем
- [ ] AI модуль: AIProviderInterface (абстракційний шар)
- [ ] OpenAI provider реалізація
- [ ] AWS Bedrock provider реалізація
- [ ] Gemini provider реалізація
- [ ] AI Provider Factory (вибір провайдера по налаштуваннях)
- [ ] Промпт: program generation
- [ ] Onboarding модуль: зберегти quiz відповіді
- [ ] Skill assessment: AI генерує тест, оцінює рівень
- [ ] Programs модуль: генерація та збереження програми в БД

#### Frontend
- [ ] Onboarding flow: multi-step wizard компонент — fullscreen на мобайлі, centered card на десктопі
- [ ] Quiz компонент (вибір сфери, рівня, цілей) — великі tap-friendly кнопки вибору
- [ ] Skill assessment компонент — адаптований layout для мобайлу
- [ ] Skip onboarding можливість
- [ ] Loading/skeleton стан поки AI генерує програму
- [ ] Settings сторінка: AI налаштування (вибір моделі, BYOK ключ)
- [ ] BYOK UI: введення і валідація ключів

---

### Milestone 3 — Learning & Content
> **Ціль:** Користувач може вчитись — переглядати теми, читати AI контент, проходити тести

#### Backend
- [ ] Content модуль: генерація summary (промпт + кеш логіка)
- [ ] Content модуль: генерація cheatsheet
- [ ] Content модуль: генерація quiz питань
- [ ] AI Cache сервіс: збереження в Redis + PostgreSQL, expires логіка
- [ ] Quiz модуль: submit відповідей, підрахунок score, визначення weak areas
- [ ] Notes модуль: повний CRUD
- [ ] Bookmarks модуль: додати/видалити/список
- [ ] Search: повнотекстовий пошук (PostgreSQL FTS)
- [ ] Recently viewed: трекінг останніх відкритих тем

#### Frontend
- [ ] Roadmap view: grid layout на десктопі, вертикальний список з прогрес-індикатором на мобайлі
- [ ] Topic detail сторінка: tabs (Summary, Cheatsheet, Quiz, Notes) — swipeable tabs на мобайлі
- [ ] Summary компонент: відображення AI контенту з markdown, зручне читання на малих екранах
- [ ] Cheatsheet компонент: структурований вигляд, горизонтальний scroll для таблиць на мобайлі
- [ ] Export в PDF (cheatsheet та нотатки)
- [ ] Quiz компонент: питання, відповіді, результат з фідбеком — великі tap targets
- [ ] Notes компонент: rich text редактор — мобільно-оптимізований toolbar
- [ ] Bookmarks сторінка: список збережених матеріалів
- [ ] Search компонент: глобальний пошук — fullscreen overlay на мобайлі
- [ ] Recently viewed секція на dashboard

---

### Milestone 4 — Progress & Adaptive Learning
> **Ціль:** Система трекінгу прогресу і адаптація програми навчання

#### Backend
- [ ] Progress модуль: позначити тему як пройдену
- [ ] Progress модуль: підрахунок % готовності
- [ ] Streak сервіс: трекінг щоденної активності
- [ ] Daily goal: збереження і трекінг
- [ ] Spaced repetition: логіка розрахунку дат повторення (1-3-7-14-30 днів)
- [ ] Weak areas: аналіз quiz результатів і визначення проблемних тем
- [ ] Programs адаптація: AI переглядає програму на основі прогресу
- [ ] Programs ручне редагування: додати/видалити/змінити пріоритет тем

#### Frontend
- [ ] Dashboard: загальна статистика, streak, daily goal — card-based layout зручний на мобайлі
- [ ] Progress сторінка: графіки (Chart.js або D3) — responsive, scrollable на малих екранах
- [ ] Weak areas секція: теми які потребують уваги
- [ ] Spaced repetition indicator: badge в bottom navigation на мобайлі, в sidebar на десктопі
- [ ] Daily goal компонент: встановлення цілі і трекінг
- [ ] Program editor: UI для ручного редагування програми — drag-and-drop на десктопі, reorder кнопки на мобайлі

---

### Milestone 5 — AI Chat & Interview Mode
> **Ціль:** Контекстний AI чат і повноцінний режим інтерв'юера

#### Backend
- [ ] Chat модуль: створення сесії прив'язаної до теми
- [ ] Chat модуль: збереження і завантаження історії повідомлень
- [ ] Chat WebSocket gateway: стрімінг AI відповідей
- [ ] Chat промпт: системний промпт з контекстом теми + історія розмови
- [ ] Program адаптація через чат: AI розпізнає запити на зміну програми
- [ ] Interview модуль: генерація питань по рівнях (Junior/Middle/Senior)
- [ ] Interview модуль: очікувані відповіді для режиму інтерв'юера
- [ ] Mock interview: управління сесією, AI задає питання послідовно
- [ ] Mock interview: оцінка відповіді користувача + фідбек по кожному питанню
- [ ] Mock interview: генерація фінального звіту по сесії

#### Frontend
- [ ] Chat компонент: fullscreen на мобайлі, panel на десктопі, typing indicator і стрімінг
- [ ] Chat history: завантаження попередніх повідомлень по темі
- [ ] Interviewer mode сторінка: browse питань — фільтри як bottom sheet на мобайлі
- [ ] Mock interview сторінка: адаптований інтерфейс сесії для мобайлу (питання → відповідь → фідбек)
- [ ] Mock interview результати: детальний звіт зі score і рекомендаціями

---

### Milestone 6 — Freemium, Polish & Launch
> **Ціль:** Продакшн-готовий продукт з монетизацією

#### Backend
- [ ] Subscription модуль: free/premium логіка і зберігання
- [ ] Feature gates: middleware для перевірки доступу до premium фічей
- [ ] Rate limiting: ліміти AI запитів для free користувачів
- [ ] BYOK валідація: перевірка і безпечне зберігання API ключів
- [ ] Global exception filter і structured logging
- [ ] Environment конфігурація: production-ready (.env, secrets)
- [ ] Database індекси для оптимізації запитів

#### Frontend
- [ ] Paywall компоненти: upgrade prompts в потрібних місцях
- [ ] Subscription сторінка: порівняння планів Free vs Premium
- [ ] Error handling: toast notifications, error pages (404, 500)
- [ ] Loading скелетони для всіх основних компонентів
- [ ] Responsive QA: фінальне cross-device тестування на реальних пристроях (iPhone, Android, tablet, desktop)
- [ ] Performance: lazy loading модулів, оптимізація bundle size
- [ ] Accessibility: базові a11y атрибути (aria-labels, keyboard nav)

---

## ⚠️ Potential Risks

| Ризик | Ймовірність | Вплив | Мітигація |
|---|---|---|---|
| Висока вартість AI запитів | Висока | Критичний | Redis кешування + ліміти для free tier |
| Якість AI контенту нестабільна | Середня | Високий | Версіонування промптів, можливість регенерувати |
| Supabase free tier обмеження | Середня | Середній | Планувати міграцію на Pro при зростанні |
| BYOK ключі — безпека | Середня | Критичний | Шифрування at-rest, ніколи не логувати |
| Складність абстракції AI провайдерів | Низька | Середній | Чіткий інтерфейс з самого початку |

---

## 📅 Estimated Timeline

| Milestone | Орієнтовний час |
|---|---|
| M1 — Foundation & Auth | 1-2 тижні |
| M2 — Onboarding & Program | 2-3 тижні |
| M3 — Learning & Content | 3-4 тижні |
| M4 — Progress & Adaptive | 2-3 тижні |
| M5 — Chat & Interview | 3-4 тижні |
| M6 — Freemium & Launch | 2-3 тижні |
| **Разом** | **~3-4 місяці** |

> Оцінки для соло-розробника з фокусованими сесіями. Можуть варіюватись в залежності від досвіду з конкретними інструментами.

---

*Документ згенеровано в процесі product planning сесії. Версія 1.0*
