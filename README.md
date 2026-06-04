# ⚡ GHOSTLINE — Learn SQL by Hacking NEXACORP

> *"The city runs on data. You run on SQL."*

A dark, cyberpunk, story-driven SQL learning game that takes you from absolute beginner to advanced — across 5 narrative arcs and 25 missions. Your only weapon is SQL.

## 🌐 Live Demo
> https://sqlchronicles.lovable.app

---

## 🎮 Concept
You are a data hacker recruited by the rebel collective **GHOSTLINE** to take down the all-seeing megacorporation **NEXACORP**. Every mission runs a real SQLite database. Every wrong query raises the **trace meter**. 4 strikes — mission locked.

---

## 🗺️ Curriculum

| Arc | Theme | SQL Concepts |
|-----|-------|-------------|
| 1 — First Contact | Rookie Operator | SELECT, WHERE, ORDER BY, LIMIT, DELETE |
| 2 — Deeper In | Inside Man | JOIN, GROUP BY, HAVING, Aggregates |
| 3 — Ghost Protocol | Deep Systems | Subqueries, UNION, Window Functions, RANK |
| 4 — Architects | DB Design | CREATE TABLE, Indexes, Views, CTEs |
| 5 — Endgame | Ghostline Protocol | Transactions, Triggers, Complex Logic |

**Total: 5 Arcs · 25 Episodes · 25+ Missions**

---

## ✨ Features
- ⚡ Real SQLite engine via sql.js (WebAssembly) — no fake pattern matching
- 🎯 Trace meter mechanic — punishes guessing, rewards thinking
- 📱 Mobile-first neon terminal UI with glitch and scanline effects
- 🔐 Email + Google authentication via Supabase
- ☁️ Cloud save — XP, rank, progress synced across devices
- 🌆 Cyberpunk story beats and cryptic in-character hints
- 🏆 XP system and hacker rank progression

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Styling | Tailwind CSS v4 |
| SQL Engine | sql.js (SQLite → WebAssembly) |
| Backend | Supabase (Postgres + Auth + RLS) |
| State | TanStack Query + TanStack Router |
| Runtime | Cloudflare Workers (edge) |
| Language | TypeScript (strict) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── GameToaster.tsx           # In-game notifications
├── game/
│   ├── content.ts                # All 25 missions and story beats
│   └── types.ts                  # Mission / Episode / Arc types
├── hooks/                        # Custom React hooks
├── integrations/
│   └── supabase/                 # Auto-generated Supabase client
├── lib/
│   ├── api/                      # API utilities
│   ├── sql-engine.ts             # sql.js wrapper + result comparator
│   ├── config.server.ts          # Server configuration
│   ├── error-capture.ts          # Error handling
│   ├── error-page.ts             # Error page utils
│   └── utils.ts                  # Utility functions
├── routes/
│   ├── _authenticated/           # Auth-protected routes
│   ├── __root.tsx                # App shell, head/meta, providers
│   ├── auth.tsx                  # Email + Google sign-in
│   └── index.tsx                 # Landing page
├── routeTree.gen.ts              # Auto-generated route tree
├── router.tsx                    # Router configuration
├── server.ts                     # Server entry point
├── start.ts                      # App start
└── styles.css                    # Neon cyberpunk design tokens

public/
└── wasm/
    └── sql-wasm.wasm             # SQLite WASM binary

supabase/
└── migrations/                   # DB tables + RLS policies
```

---

## 🎯 How a Mission Works

1. Story beat shown in-character
2. Fresh SQLite database created from mission setup
3. Player writes SQL query in neon terminal
4. Result compared to expected output
5. ✅ Correct → XP awarded, next mission unlocks
6. ❌ Wrong → trace meter +25%, cryptic hint shown
7. 💀 4 strikes → mission locked until reset

---

## 🚀 Run Locally

```bash
bun install
cp .env.example .env
supabase db push
bun run dev
```

Open http://localhost:5173

---

## 🗺️ Roadmap
- [ ] Timed missions with countdown
- [ ] Achievement badges (JOIN Master, Window Wizard...)
- [ ] Terminal skins and cosmetic unlocks
- [ ] Ambient synthwave audio + SFX
- [ ] PWA offline play

---

## 📜 License
MIT — go hack the planet.

---
*Built with React 19 · TypeScript · sql.js · Supabase · Tailwind CSS · Lovable*
