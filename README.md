# GHOSTLINE // Learn SQL by Hacking NEXACORP

A dark, cyberpunk, story-driven mobile game that teaches **SQL** — from absolute
beginner to advanced — across 5 narrative arcs and 25 missions.

> *"The city runs on data. You run on SQL."*

You play a young data hacker recruited by the rebel collective **GHOSTLINE** to
take down the all-seeing megacorporation **NEXACORP**. Your only weapon is the
SQL query. Every mission is a real SQLite database. Every wrong query raises the
**trace meter**. Get traced four times and the mission locks.

---

## Features

- **5 Arcs · 25 Episodes · 25+ missions** of progressive SQL teaching
  - Arc 1 — *First Contact*: `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `DELETE`
  - Arc 2 — *Deeper In*: `JOIN`, `GROUP BY`, `HAVING`, aggregates
  - Arc 3 — *Ghost Protocol*: subqueries, `UNION`, window functions, `RANK`, `PARTITION BY`
  - Arc 4 — *Architects*: `CREATE TABLE`, indexes, views, CTEs
  - Arc 5 — *Endgame*: transactions, triggers, complex multi-step logic
- **Real SQLite engine** in the browser via `sql.js` (WASM) — no fake pattern matching
- **Mobile-first** neon terminal UI with glitch / scanline effects (works on desktop)
- **Trace meter** mechanic that punishes guessing and rewards thinking
- **Accounts + cloud save** — XP, rank, and per-mission progress sync across devices
- **Email + Google auth**
- Cryptic in-character hints when you fail; lore-driven story beats when you win

---

## Tech Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | **TanStack Start v1** (React 19 + Vite 7, SSR)      |
| Styling      | **Tailwind CSS v4** (semantic tokens in `oklch`)    |
| SQL engine   | **sql.js** — SQLite compiled to WebAssembly         |
| Backend      | **Lovable Cloud** (Supabase: Postgres + Auth + RLS) |
| State / data | TanStack Query + TanStack Router                    |
| Runtime      | Cloudflare Workers (edge) via `nodejs_compat`       |
| Language     | TypeScript (strict)                                 |

---

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx                  # app shell, head/meta, providers
│   ├── index.tsx                   # landing page
│   ├── auth.tsx                    # email + Google sign-in
│   └── _authenticated/
│       ├── route.tsx               # auth gate (redirects to /auth)
│       ├── play.tsx                # mission select / HQ
│       └── mission.$id.tsx         # MAIN GAME SCREEN (terminal + trace meter)
├── game/
│   ├── types.ts                    # Mission / Episode / Arc types
│   └── content.ts                  # all 25 missions, story beats, setup SQL
├── lib/
│   └── sql-engine.ts               # sql.js wrapper + result comparator
├── integrations/supabase/          # auto-generated client (do not edit)
└── styles.css                      # neon cyberpunk design tokens

supabase/migrations/                # profiles + mission_progress tables, RLS
public/wasm/sql-wasm.wasm           # SQLite WASM binary
```

The **main gameplay file** is [`src/routes/_authenticated/mission.$id.tsx`](src/routes/_authenticated/mission.$id.tsx).
The **content / curriculum** lives in [`src/game/content.ts`](src/game/content.ts).

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (or Node 20+)
- A Supabase project (free tier is fine) — or use Lovable Cloud which provisions one for you

### Install
```bash
bun install
```

### Configure environment
Copy `.env.example` to `.env` and fill in:
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
```

### Run migrations
Apply files in `supabase/migrations/` via the Supabase CLI:
```bash
supabase db push
```

### Dev
```bash
bun run dev
```
Open http://localhost:5173.

### Build
```bash
bun run build
```

---

## How a Mission Works

1. Player opens a mission → story beat is shown in-character.
2. A fresh in-memory SQLite database is created from the mission's `setupSql`.
3. The canonical `expectedSql` is executed once to compute the target result set.
4. Player types a query into the neon terminal and runs it.
5. Result set is compared to the expected one (`compareResults`, order-insensitive by default).
6. **Correct** → XP awarded, mission marked complete in `mission_progress`, next episode unlocks.
7. **Wrong** → trace meter +25%, cryptic glitch hint shown. 4 strikes = mission locked until reset.

---

## Adding New Content

Edit `src/game/content.ts`. Each mission is:

```ts
{
  id: "2.3",
  title: "Cross-Reference",
  story: "GHOSTLINE intercepted a shipping manifest...",
  objective: "List every courier who delivered to the Spire.",
  hint: "INNER JOIN on courier_id.",
  setupSql: `CREATE TABLE couriers (...); INSERT INTO ...;`,
  expectedSql: `SELECT c.name FROM couriers c JOIN drops d ON ...`,
  xp: 120,
  concepts: ["JOIN", "INNER JOIN"],
}
```

No code changes required — the route automatically picks up new missions.

---

## Roadmap

- [ ] Multiple missions per episode (currently 1 each for breadth)
- [ ] Timed "hot" missions with countdown
- [ ] Achievement badges (`JOIN Master`, `Window Function Wizard`, ...)
- [ ] Cosmetic unlocks (avatar frames, terminal skins, glitch palettes)
- [ ] Ambient audio + SFX (synthwave, keystrokes, alarm)
- [ ] Side-quest "darknet" missions for extra practice
- [ ] PWA install + offline play

---

## License

MIT — go hack the planet.
