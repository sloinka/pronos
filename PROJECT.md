You are an expert full-stack developer. Build "Pronos.io" — an AI-powered 
football prediction platform. Here are the complete specifications:

---

## 🏗️ TECH STACK
- **Framework:** Next.js 15 (App Router)
- **Styling:** TailwindCSS + DaisyUI
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache:** Redis (via ioredis)
- **Auth:** NextAuth.js v5 (Google OAuth + Email/Password)
- **Payments:** Stripe (webhooks + subscriptions)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Football Data:** API-Sports Football v3 (https://api-sports.io)
- **Language:** TypeScript throughout

---

## 📁 PROJECT STRUCTURE

pronos-io/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Homepage - match list
│   │   ├── match/[id]/page.tsx         # Match detail page
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   └── pricing/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── matches/route.ts
│   │   ├── matches/[id]/route.ts
│   │   ├── matches/[id]/simulate/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   └── stripe/checkout/route.ts
├── components/
│   ├── matches/
│   │   ├── MatchCard.tsx
│   │   ├── MatchList.tsx
│   │   ├── LeagueGroup.tsx
│   │   └── CountryFlag.tsx
│   ├── match-detail/
│   │   ├── MatchHeader.tsx
│   │   ├── TeamForm.tsx               # Last 5 matches W/L/D
│   │   ├── H2HStats.tsx               # Head-to-head last 10
│   │   ├── InjuredPlayers.tsx
│   │   ├── AIPreview.tsx              # Short AI preview text
│   │   └── SimulationModal.tsx        # Full AI simulation
│   ├── ui/
│   │   ├── LanguageSwitcher.tsx
│   │   ├── SubscriptionBanner.tsx
│   │   └── Navbar.tsx
├── lib/
│   ├── api-sports.ts                  # API-Sports wrapper
│   ├── redis.ts                       # Redis client + helpers
│   ├── prisma.ts
│   ├── claude.ts                      # Claude AI helper
│   └── stripe.ts
├── prisma/schema.prisma
├── messages/                          # i18n translations
│   ├── en.json
│   ├── tr.json
│   ├── fr.json
│   ├── it.json
│   ├── es.json
│   └── el.json
└── middleware.ts                      # i18n + auth middleware

---

## 🌍 INTERNATIONALIZATION
Use **next-intl** library for i18n.
Supported locales: tr, en, fr, it, es, el
Default locale: en
URL structure: /en/... /tr/... /fr/...

Translate ALL UI text. Store translations in /messages/*.json
Key namespaces: common, matches, matchDetail, auth, pricing, simulation

---

## 🏠 HOMEPAGE — Match List

Fetch today's football matches from API-Sports.

**Display rules:**
- Group matches by league (show league name + country flag emoji)
- Each match card shows: home team, away team, match time, league name, 
  country flag
- Sort by kickoff time ASCENDING (earliest first)
- NEVER show finished matches (status: FT, AET, PEN, ABD, CANC, AWD, WO)
- Only show: NS (Not Started), TBD, PST statuses
- Show match time in USER'S LOCAL TIMEZONE using Intl.DateTimeFormat
- Show "Today" / "Tomorrow" labels if applicable

**MatchCard component:**
- Clean card with team logos, team names
- Kickoff time prominently displayed
- League badge + country flag
- Hover effect → navigate to /match/[id]
- If user is not subscribed → blur overlay on some matches 
  (first 3 free, rest blurred with "Subscribe to unlock" CTA)

---

## ⚡ CACHING STRATEGY (Critical — API has strict limits)

Use Redis for ALL API-Sports calls:
```typescript
// Cache TTL strategy:
const CACHE_TTL = {
  dailyMatches: 60 * 5,        // 5 minutes (today's matches)
  matchDetails: 60 * 10,       // 10 minutes
  teamForm: 60 * 60 * 6,       // 6 hours (last 5 matches)
  h2h: 60 * 60 * 24,           // 24 hours (head-to-head)
  injuries: 60 * 60 * 2,       // 2 hours
  standings: 60 * 60 * 12,     // 12 hours
}

// Redis key naming:
// matches:date:2025-01-15
// match:details:fixture:123456
// team:form:teamId:123
// h2h:team1:123:team2:456
// injuries:team:123
```

Implement a **cache-first** pattern:
1. Check Redis → if hit, return cached data
2. If miss → fetch from API-Sports → store in Redis → return
3. Add cache stampede protection with Redis SET NX

Also store API call count in Redis daily:
`api:calls:count:2025-01-15` → increment on each real API call
Alert in console if approaching daily limit (100 calls free tier)

---

## 📄 MATCH DETAIL PAGE

### Header Section
- Home team logo + name vs Away team logo + name
- League name, country, round
- Kickoff date and time (user's timezone, clearly labeled)
- Match status badge

### Team Form — Last 5 Matches
For each team, show last 5 match results as colored badges:
- 🟢 Green circle = Win
- 🔴 Red circle = Loss  
- ⚪ Gray circle = Draw
Fetch from: GET /fixtures?team={id}&last=5
Show: opponent name, score, H/A indicator

### Head-to-Head — Last 10 Matches
Fetch from: GET /fixtures/headtohead?h2h={team1}-{team2}&last=10
Display:
- Summary bar: "Team A won X | Draws Y | Team B won Z"
- Visual bar chart showing dominance
- List of last 10 matches with scores and dates

### Injured / Unavailable Players
Fetch from: GET /injuries?fixture={id}
Group by team, show:
- Player name + position
- Injury type / reason
- Status (Doubtful / Out)
Use colored badges: red = Out, yellow = Doubtful

### AI Preview (Free — shown to all users)
Auto-generate on page load using Claude API:
- 2-3 paragraph preview about the match
- Mention team form, key facts, general outlook
- Keep it SHORT and engaging
- Localize based on user's selected language
- Cache in Redis for 1 hour per fixture per language

Prompt template for AI Preview:
"""
You are a professional football analyst. Write a SHORT 2-3 paragraph 
match preview for: {homeTeam} vs {awayTeam} in {league}, {country}.
Match date: {date}. 
Home team last 5: {homeForm} (W/L/D sequence)
Away team last 5: {awayForm}
H2H summary: In last 10 meetings, {homeTeam} won {homeWins}, 
{awayTeam} won {awayWins}, {draws} draws.
Key absences - {homeTeam}: {homeInjuries}. {awayTeam}: {awayInjuries}.
Write in {language}. Be concise, insightful, and engaging.
Return plain text only, no markdown.
"""

---

## 🤖 AI MATCH SIMULATION (Premium Feature)

Triggered by "Simulate This Match" button (subscribers only).
Show loading animation while generating.
Display results in a beautiful modal/drawer.

### Data to collect before simulation:
- Team form (last 5)
- H2H stats (last 10)
- Current injuries
- League standings (team positions, points, GD)
- Home/Away specific form

### Claude Prompt for Simulation:
"""
You are an advanced football analytics AI. Analyze this match and provide 
detailed predictions in valid JSON format.

Match: {homeTeam} vs {awayTeam}
Competition: {league} - {country}
Date: {matchDate}

TEAM DATA:
Home Team ({homeTeam}):
- League position: {homePosition}/{totalTeams}, Points: {homePoints}
- Home form (last 5 home games): {homeFormHome}
- Overall last 5: {homeFormOverall}  
- Goals scored avg (home): {homeGoalsAvg}
- Goals conceded avg (home): {homeGoalsAgainstAvg}
- Key absences: {homeInjuries}

Away Team ({awayTeam}):
- League position: {awayPosition}/{totalTeams}, Points: {awayPoints}
- Away form (last 5 away games): {awayFormAway}
- Overall last 5: {awayFormOverall}
- Goals scored avg (away): {awayGoalsAvg}
- Goals conceded avg (away): {awayGoalsAgainstAvg}  
- Key absences: {awayInjuries}

HEAD-TO-HEAD (Last 10):
{h2hData}

Provide your analysis as JSON with this EXACT structure:
{
  "scorePrediction": {
    "homeGoals": number,
    "awayGoals": number,
    "confidence": number (0-100),
    "explanation": "string"
  },
  "matchOutcome": {
    "homeWin": number (percentage),
    "draw": number (percentage),
    "awayWin": number (percentage)
  },
  "possession": {
    "home": number (percentage),
    "away": number (percentage)
  },
  "corners": {
    "home": number (predicted),
    "away": number (predicted),
    "total": number,
    "explanation": "string"
  },
  "shots": {
    "home": number,
    "away": number,
    "homeOnTarget": number,
    "awayOnTarget": number
  },
  "cards": {
    "homeYellow": number,
    "awayYellow": number,
    "homeRed": number,
    "awayRed": number
  },
  "btts": {
    "probability": number (percentage),
    "prediction": boolean
  },
  "over25Goals": {
    "probability": number (percentage),
    "prediction": boolean
  },
  "keyFactors": ["string", "string", "string"],
  "riskLevel": "low" | "medium" | "high",
  "valueBets": ["string"],
  "matchTempo": "slow" | "medium" | "high",
  "detailedAnalysis": "string (3-4 paragraphs in {language})"
}

Return ONLY valid JSON, no markdown, no explanation outside JSON.
"""

### Simulation Results UI:
Display results in organized sections:
1. **Score Prediction** — Big scoreline display with confidence %
2. **Outcome Probabilities** — Visual pie/donut chart (Home/Draw/Away %)
3. **Possession** — Horizontal bar chart
4. **Corners** — Home vs Away predicted corners
5. **Shots** — Total shots + on target
6. **Cards** — Yellow/Red predictions
7. **BTTS & Over 2.5** — Probability badges
8. **Key Factors** — Bullet list of 3 key factors
9. **Risk Level** — Badge (Low/Medium/High)
10. **Value Bets** — Highlighted suggestions
11. **Detailed Analysis** — Full text paragraphs

Cache simulation results in Redis for 2 hours per fixture.

---

## 🔐 AUTHENTICATION

Use NextAuth.js v5:

**Providers:**
1. Google OAuth (GoogleProvider)
2. Credentials (email + bcrypt password)

**Database schema (Prisma):**
- User: id, email, name, image, hashedPassword, createdAt
- Account: (NextAuth standard)
- Session: (NextAuth standard)  
- Subscription: userId, stripeCustomerId, stripePriceId, 
  stripeSubscriptionId, status, currentPeriodEnd, plan (weekly/monthly/yearly)
- SimulationUsage: userId, fixtureId, createdAt (track usage)

**Auth pages:**
- /auth/signin — Email/password form + "Continue with Google" button
- /auth/signup — Registration form
- Both pages: clean, minimal design matching site theme

---

## 💳 STRIPE SUBSCRIPTIONS

**Plans:**
```typescript
const PLANS = {
  weekly: {
    priceId: process.env.STRIPE_WEEKLY_PRICE_ID,
    name: "Weekly",
    price: 4.99,
    currency: "USD",
    interval: "week"
  },
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID, 
    name: "Monthly",
    price: 12.99,
    currency: "USD",
    interval: "month"
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID,
    name: "Yearly", 
    price: 89.99,
    currency: "USD",
    interval: "year",
    badge: "Best Value — Save 42%"
  }
}
```

**Pricing page (/pricing):**
- 3 plan cards side by side
- Yearly highlighted as "Best Value"
- Feature comparison list:
  ✓ All matches unlocked
  ✓ Full match details
  ✓ AI match previews
  ✓ AI match simulations (Premium)
  ✓ Unlimited predictions
- "Current plan" badge if subscribed

**Stripe integration:**
- POST /api/stripe/checkout → create checkout session
- POST /api/stripe/webhook → handle subscription events:
  - customer.subscription.created → update DB
  - customer.subscription.updated → update DB  
  - customer.subscription.deleted → mark expired

---

## 🎨 DESIGN SYSTEM

Use DaisyUI with a dark theme as default.

**Color palette:**
- Primary: #00DC82 (green — football/success)
- Secondary: #6366f1 (indigo)
- Background: #0f172a (dark navy)
- Surface: #1e293b
- Text: #f1f5f9

**Typography:**
- Font: Inter (Google Fonts)
- Match scores: font-bold text-2xl
- Team names: font-semibold

**Key UI patterns:**
- Cards with subtle border + hover glow effect
- Loading skeletons for all async content
- Toast notifications (success/error)
- Responsive: mobile-first design
- Smooth page transitions

---

## 🌐 API-SPORTS ENDPOINTS TO USE

GET /fixtures?date=YYYY-MM-DD&timezone=UTC          # Today's matches
GET /fixtures?id={fixtureId}                         # Match details
GET /fixtures?team={teamId}&last=5                   # Team form
GET /fixtures/headtohead?h2h={t1}-{t2}&last=10      # H2H
GET /injuries?fixture={fixtureId}                    # Injuries
GET /standings?league={leagueId}&season={year}       # Standings

**API wrapper (lib/api-sports.ts):**
```typescript
const API_BASE = "https://v3.football.api-sports.io"
headers: { "x-apisports-key": process.env.API_SPORTS_KEY }
```

Always go through cache layer before hitting API.
Log every real API call to monitor quota usage.

---

## 📦 ENVIRONMENT VARIABLES NEEDED
```env
# Database
DATABASE_URL=

# Redis  
REDIS_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# API Sports
API_SPORTS_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_WEEKLY_PRICE_ID=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_YEARLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## ✅ IMPLEMENTATION CHECKLIST

Build in this order:
1. Project setup (Next.js + Tailwind + DaisyUI + next-intl)
2. Prisma schema + PostgreSQL connection
3. Redis client setup
4. API-Sports wrapper with caching layer
5. Auth (NextAuth — Google + Credentials)
6. Homepage with match list
7. Match detail page (form, H2H, injuries)
8. AI Preview integration
9. AI Simulation feature
10. Stripe pricing + subscription flow
11. i18n translations for all 6 languages
12. Mobile responsive polish
13. Loading states + error boundaries

Start with step 1. Ask me before proceeding to each next step.