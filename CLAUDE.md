# CLAUDE.md — SkillArena

**SkillArena — Play. Prove. Get Hired.** A gamified skill-development and talent-discovery prototype built for an IIT Gandhinagar hackathon. Students complete real-world technical missions, earn XP, unlock badges, climb leaderboards and build a Skill Passport.

This is a **frontend-only, investor-demo prototype**. It is not a production app. Full requirements: `project-scope.txt`.

## Tech stack (strict)

- React 18 + Vite 5, **JavaScript only (no TypeScript)**
- Tailwind CSS 3 (config in `tailwind.config.js`, design tokens there)
- React Router 6 (`BrowserRouter`)
- Lucide React icons, Recharts for charts
- Local JS mock data + LocalStorage persistence
- Fonts bundled via `@fontsource-variable/inter` and `@fontsource/jetbrains-mono`, so the demo works offline

**Never add:** a backend (Spring Boot/Java/Node server), a database, JWT/real auth, external AI APIs, or any network-dependent service. Everything runs in the browser.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build, which must pass before calling a phase done
npm run preview
```

**Deployment:** GitHub Pages via `.github/workflows/deploy.yml` on every push to `main` → https://gurutesdb.github.io/skillarena/. The build uses `BASE_PATH=/skillarena/` (Vite `base` + router `basename`), and `404.html` is a copy of `index.html` so deep links survive refresh. Keep internal links router-relative (`<Link to="/x">`), never hard-coded `/x` hrefs.

## Architecture

```
src/
  data/            # static mock data, the only place content lives
    levels.js      # Beginner…Master XP bands
    badges.js      # badge definitions (id, name, icon, rule description)
    missions.js    # 15 missions × 5 categories, with tasks + predefined answers
    students.js    # 9 simulated peers + demo student profile
    concepts.js    # concept tag + tip for every mission task; job ROLES (category weights)
    solutions.js   # reference code solutions; correctAnswers() powers the Shift+A demo autofill
    cohort.js      # seeded, simulated talent pool (126 students) as raw completions + attempts
  engine/
    gamification.js  # pure functions: XP, levels, evaluation, badges, streak,
                     # leaderboard, skill progress, weekly activity
    storage.js       # LocalStorage load/save/reset + seed state
    coach.js         # Skill Coach: rule-based feedback, skill gaps, role readiness,
                     # next-mission recommendation (no AI API; swappable later)
    talent.js        # College/Recruiter analytics; scores the pool with the same engine
    achievements.js  # before/after diff → achievement pop-ups (rank, batch rank, career band, gap closed)
  audio/
    sfx.js           # synthesized Web Audio sound effects + mute toggle state (no audio files)
  context/
    GameContext.jsx  # single source of truth; exposes derived selectors + actions
  components/      # Layout (sidebar, mobile nav, Student/College/Recruiter switcher),
                   # RewardModal, SkillCoach, StudentProfileModal, ui primitives
  pages/           # Landing, Dashboard, Arena, Challenge, Leaderboard, Passport,
                   # College (placement cell), Recruiter (talent discovery), Business
```

### State rules (important)

- Persisted state holds **only raw facts**: `loggedIn`, `completed` (missionId → {score, xp, completedAt}), `attempts`, `streak`, `lastActiveDate`, `badges` (id → earnedAt).
- **Everything else is derived**: total XP, level, skill progress, leaderboard rank and weekly activity are computed from `completed` via `engine/gamification.js`. Never store derived values, and never duplicate progress data per screen.
- XP is awarded **only** on a passing evaluation (≥ 70%) and **only once per mission**. Re-attempts of a completed mission are practice mode with 0 XP.
- Perfect score (100%) earns a +10% XP bonus.
- Evaluation is deterministic: `mcq` (option index), `input` (normalized accepted answers) and `code` (regex checks with `mustNot` guards). No AI APIs.
- Each attempt also stores `missed` (task ids answered wrongly). Skill gaps = concepts missed in the latest attempt of each mission.
- Role readiness = weighted category skill scores (`ROLES` in `concepts.js`). Bands: Job-ready ≥ 70, Developing 40–69, Needs support < 40.
- College/Recruiter views include the live demo student, so passing a mission visibly moves them in the cohort ranking.
- Achievement pop-ups are a UI queue in GameContext (never persisted), shown after the reward modal closes.
- Simulated data must be deterministic across JS engines: never call the PRNG inside a sort comparator.
- Storage key: `skillarena:v1`. "Reset Demo" restores the seed state.

### Seed state (demo storytelling)

The demo student starts with 4 completed missions (375 XP, Beginner), a 6-day streak that was last active yesterday, and the First Mission badge. Passing one more mission therefore triggers **level-up to Explorer, the 5 Missions badge and the 7-Day Streak badge** in a single reward moment. Keep this property if you change seed data.

## Levels & badges

| Level | XP |
|---|---|
| Beginner | 0–499 |
| Explorer | 500–999 |
| Achiever | 1000–1999 |
| Expert | 2000–3499 |
| Master | 3500+ |

Badges: First Mission, 5 Missions Completed, 10 Missions Completed, Java Master (all Java missions), SQL Explorer (2 SQL missions), 7-Day Streak.

## Design direction

- Dark navy/charcoal base (`ink-*` tokens), one primary accent (`brand`, violet), semantic accents: `xp` amber, `ok` emerald, `streak` orange. Category colors are defined in `missions.js` (`CATEGORIES`).
- Linear-style clean cards, Duolingo-style rewards. Use gradients sparingly and animate with purpose (reward modal, progress bars, hover lifts).
- Responsive: sidebar at `lg+`, bottom tab bar on mobile.
- Avoid generic admin look, placeholder content and non-functional buttons.

## Content & honesty constraints

- All students, stats and leaderboard data are **simulated demo data**, and the UI labels them so.
- The Skill Passport is a record of demonstrated challenge performance and **not an accredited certification**. Keep that disclaimer visible.
- The business page uses **illustrative** pricing (₹149/month student, ₹30,000/year college, ₹10,000/campaign employer). Do not invent users, partners, revenue or traction.

## Conventions

- Functional components + hooks; one component per file in `pages/`; small shared UI in `components/ui.jsx`.
- Gamification rules change only in `engine/gamification.js`, and the pages consume them via `useGame()`.
- Content changes (missions, students) go only in `src/data/`.
