# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (Next.js with Turbopack)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (flat config, `eslint.config.mjs`)
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `npx prisma migrate dev` — Run database migrations
- `npx prisma db push` — Push schema to DB without migrations

## Stack

- **Framework:** Next.js 16 with App Router (React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 + DaisyUI 5 (dark theme, `@plugin "daisyui"` in `globals.css`)
- **Database:** PostgreSQL via Prisma ORM (Prisma 7.x with `prisma-client` generator)
- **Cache:** Redis via ioredis (lazy connection)
- **Auth:** NextAuth.js v5 (Google OAuth + Credentials with bcryptjs)
- **Payments:** Stripe (subscriptions with webhook)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Football Data:** API-Sports Football v3
- **i18n:** next-intl (locales: en, tr, fr, it, es, el)
- **Path alias:** `@/*` maps to project root

## Architecture

- **App Router:** `app/[locale]/` for i18n pages, `app/api/` for API routes
- **i18n:** `i18n/routing.ts` defines locales/navigation, `i18n/request.ts` loads messages, `middleware.ts` handles locale detection. Translations in `messages/*.json`
- **Prisma:** Schema at `prisma/schema.prisma`, generated client output at `generated/prisma/`. Import from `@/generated/prisma/client`
- **Lib layer:** `lib/` contains service wrappers (api-sports, redis, claude, stripe, auth, prisma, subscription). Redis and Stripe use lazy initialization to avoid build-time errors
- **Components:** `components/matches/` (MatchCard, MatchList, LeagueGroup), `components/match-detail/` (MatchHeader, TeamForm, H2HStats, InjuredPlayers, AIPreview, SimulationModal), `components/ui/` (Navbar, LanguageSwitcher)
- **Caching:** All API-Sports calls go through Redis cache-first pattern (`lib/redis.ts`). AI previews cached per fixture per locale. Simulations cached 2h per fixture
- **Subscription gating:** First 3 matches free on homepage, rest blurred. Simulations require active subscription. Checked via `lib/subscription.ts`

## Design System

- Primary: `#00DC82` (green), Secondary: `#6366f1` (indigo)
- Background: `#0f172a` (dark navy), Surface: `#1e293b`
- Font: Inter (Google Fonts)
- Dark theme by default (`data-theme="dark"` on html)

## Environment Variables

All required env vars are documented in `.env`. Key ones: `DATABASE_URL`, `REDIS_URL`, `API_SPORTS_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`/`SECRET`.
