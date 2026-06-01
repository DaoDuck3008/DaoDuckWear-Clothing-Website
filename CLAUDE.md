# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DaoDuckWear is a full-stack e-commerce clothing shop. It is a monorepo with two independent apps — no root package.json.

- `apps/backend/` — NestJS 11 + MongoDB (Mongoose 9) + Redis
- `apps/frontend/` — Next.js 16 (App Router) + React 19 + Tailwind CSS 4

## Commands

Run these from inside each app directory.

### Backend (`apps/backend/`)

```bash
npm run start:dev      # Hot-reload dev server (port 5000)
npm run build          # Compile to dist/
npm run start:prod     # Run compiled output
npm run lint           # ESLint with auto-fix
npm run format         # Prettier
npm run test           # Jest unit tests
npm run test:watch     # Jest watch
npm run test:cov       # Coverage report
npm run test:e2e       # E2E tests
npm run seed           # Seed the database (tsx src/database/seeders/seed.ts)
```

### Frontend (`apps/frontend/`)

```bash
npm run dev     # Dev server (port 3000)
npm run build   # Production build
npm run lint    # ESLint
```

### Infrastructure

```bash
docker-compose up   # Start Redis on port 6380 (required for backend)
```

## Architecture

### Backend

Feature-based NestJS modules in `src/modules/` — each module owns its controller, service, and Mongoose schema. Modules include: auth, users, products, orders, cart, shops, categories, colors, favorites, inventory, roles, audit-logs, banners, payments, posts, reviews, vouchers, cloudinary, health.

Key wiring in `src/main.ts`:
- `cookieParser()` for HTTP-only cookies
- Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform)
- `LoggingInterceptor` and `HttpExceptionFilter` applied globally
- CORS scoped to `FRONTEND_URL`

Authentication uses JWT access + refresh tokens with Google OAuth 2.0. Custom decorators: `@CurrentUser()`, `@CurrentShop()`, `@Roles()`.

Error handling: `BusinessException` for domain errors, standard `HttpException` for HTTP errors.

### Frontend

Next.js App Router with grouped route layouts:
- `app/(app)/` — customer-facing storefront
- `app/(admin)/` — admin dashboard
- `app/(auth)/` — login/register flows

State is managed via Zustand stores (`stores/`) for auth, cart, favorites, and buy-now. API calls go through Axios instances (`apis/`) with interceptors that auto-attach JWT tokens and silently refresh on 401 using a request queue.

Prefer Server Components; use `'use client'` only when interactivity or browser APIs are required.

## Coding Conventions

These are project rules from `AGENT_RULES.md` files in both apps:

- **No repository pattern** — use Mongoose models directly in services
- **No React Hook Form or Zod** — keep validation simple
- **Naming**: camelCase for files and functions, PascalCase for classes and components
- **Create seed files** when developing new database features
- **UI style**: hover effects, glassmorphism, smooth transitions; primary accent `#b91446`

## Environment Variables

**Backend** (`.env` in `apps/backend/`): `PORT`, `FRONTEND_URL`, `MONGODB_URI`, `JWT_*` (secret + expiry), `CLOUDINARY_*`, `GOOGLE_CLIENT_ID`.

**Frontend** (`.env` in `apps/frontend/`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_NODE_ENV`, `NEXT_PUBLIC_GOOGLE_OAUTH_*`.

## SKU Format

`[BrandPrefix][TypePrefix][Day][Warehouse] - [Size] - [ColorCode]`  
Example: `UNLE15HCM - S - H`  
Logic lives in `apps/frontend/utils/product.util.ts`.

## Skills

Skills are detailed reference files stored in `.claude/skills/`. Load them before starting any relevant task — they contain patterns, conventions, and checklists that override general knowledge.

### Available Skills

| Skill | File | Auto-load when |
|-------|------|----------------|
| **backend** | `.claude/skills/backend/SKILL.md` | Creating/editing any NestJS module, service, controller, schema, DTO in `apps/backend/` |
| **backend › auth** | `.claude/skills/backend/skill-auth.md` | Working on auth, JWT, guards, protected routes, `@CurrentUser`, Google OAuth, cookies — load alongside `backend` |
| **backend › redis** | `.claude/skills/backend/skill-redis.md` | Working on Redis, caching (`cacheable`, `delByPrefix`), TTL data (OTP, reset code), or cache invalidation — load alongside `backend` |
| **next** | `.claude/skills/next/SKILL.md` | Creating/editing any `.tsx` page, component, or layout in `apps/frontend/` |
| **diagrams** | `.claude/skills/diagrams/SKILL.md` | Creating/editing any `.mmd`, `.md` in `docs/diagrams/`, or any task mentioning: diagram, sequence, mermaid, flowchart, ER diagram |
| **git** | `.claude/skills/git/SKILL.md` | Any git commit or push — writing commit messages, staging, or subtree-pushing to the backend/frontend sub-repos |

### Trigger Rules

- **Backend task** (module, service, controller, schema, DTO, endpoint) → load `backend/SKILL.md` first.
- **Auth/JWT/guard task** → load both `backend/SKILL.md` AND `backend/skill-auth.md`.
- **Redis/cache task** (caching, `cacheable`, invalidation, TTL data like OTP, anything touching `RedisService`) → load both `backend/SKILL.md` AND `backend/skill-redis.md`.
- **Frontend task** (page, component, layout, UI) → load `next/SKILL.md` first.
- **Diagram task** (tạo/chỉnh sửa `.mmd`, `.md` trong `docs/diagrams/`, hoặc từ khóa: diagram, sequence, mermaid, flowchart, ER) → load `diagrams/SKILL.md` first.
- **Git/commit task** (commit, "commit giúp tôi", viết commit message, push, subtree) → load `git/SKILL.md` first.
- **Full-stack task** → load all relevant skills before starting.

### Adding a New Skill

When creating a new skill file under `.claude/skills/`:

1. Place it in the correct subfolder (`backend/`, `next/`, or a new folder).
2. Name it `skill-{topic}.md` (e.g., `skill-payments.md`). The main entry point of each folder is `SKILL.md`.
3. **Update this `CLAUDE.md`** — add a row to the table above and a trigger rule so the skill is auto-loaded in future sessions.
4. Optionally add a cross-reference inside the parent `SKILL.md` if the new skill is a sub-skill.
