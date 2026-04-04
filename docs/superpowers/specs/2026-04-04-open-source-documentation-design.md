# Open-Source Readiness: Documentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create professional English-language documentation that serves both as a portfolio showcase and as a practical guide for users who want to self-host the app.

**Context:** This is Sub-Project 3 of 4 in the open-source readiness initiative. Depends on Sub-Projects 1 and 2 being complete (setup wizard exists, no hardcoded personal data).

**Constraints:**
- All documentation in English
- Code comments in English
- UI text stays German (documented as "German-first" in README)

---

## 1. README.md (Complete Rewrite)

Replace the default create-next-app README with a comprehensive project README. Structure:

### Header
- Project name with emoji: "Haushalt-Quest"
- One-line description: "A gamified household task manager for couples — earn points, unlock achievements, and keep your streak alive."
- Badge row: License (MIT), GitHub Actions build status, Docker image

### Features Section
Bullet list of key features with brief descriptions:
- Task management with points and categories
- Streak system with tier bonuses
- Achievement badges
- Reward store (redeem points for real rewards)
- Statistics and activity feed
- Shared task completions (teamwork bonus)
- Recurring tasks with configurable intervals
- PIN-based authentication (simple, no email needed)
- Mobile-friendly PWA-style UI
- Self-hosted with Docker (SQLite, no external DB needed)

### Screenshots
- Placeholder section with instruction: "Screenshots coming soon" or include actual screenshots if available. Reference a `docs/screenshots/` directory.

### Quick Start (Docker)
Step-by-step:
1. Create a directory and docker-compose.yml
2. Generate a NEXTAUTH_SECRET
3. Run `docker compose up -d`
4. Open browser → Setup wizard guides through initial configuration
5. Log in and start completing tasks

Include a minimal docker-compose.yml example (without Watchtower — keep it simple).

### Development Setup
Step-by-step:
1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env`
4. `npx prisma migrate dev`
5. `npm run seed` (optional, creates example data)
6. `npm run dev`
7. Open `http://localhost:3000`

### Tech Stack
Table or list: Next.js 14, React 18, TypeScript, Prisma + SQLite, NextAuth.js, Tailwind CSS, shadcn/ui, Recharts, Vitest

### Project Structure
Brief overview of `src/` directory layout — not exhaustive, just enough to orient a new contributor.

### Configuration
Brief explanation of the AppConfig system — game settings (streak tiers, levels, bonuses) are configurable via the in-app settings page.

### Contributing
Link to CONTRIBUTING.md.

### License
"MIT License — see LICENSE for details."

---

## 2. LICENSE

MIT License file with copyright holder "Haushalt-Quest Contributors" (not a personal name). Standard MIT text.

---

## 3. CONTRIBUTING.md

Structure:

### Welcome
Brief welcoming message, link to issues for discussion.

### Development Setup
Reference to README's development setup section.

### Code Style
- TypeScript strict mode
- Tailwind CSS for styling (shadcn/ui components)
- Vitest for testing
- Code comments in English
- UI text in German (app's default language)

### Pull Request Process
1. Fork the repo
2. Create a feature branch
3. Write tests for new functionality
4. Ensure `npm test` and `npm run lint` pass
5. Submit PR with description of changes

### Reporting Issues
Use GitHub Issues. Include: steps to reproduce, expected vs actual behavior, environment details.

---

## 4. Code Comments — English Migration

Translate all German code comments to English across the codebase. This includes:
- Comments in `.ts` and `.tsx` files
- Comments in `prisma/seed.ts`
- Comments in `docker-entrypoint.sh`
- Comments in configuration files

**Not included:** UI-facing strings (button labels, page titles, error messages) — these stay German.

**Approach:** Systematic file-by-file review. Focus on:
- `src/lib/*.ts` — utility functions with German comments
- `src/app/**/*.tsx` — page components with German section comments
- `prisma/seed.ts` — seed script comments
- `scripts/docker-entrypoint.sh` — entrypoint comments

---

## Summary of File Changes

| File | Action |
|------|--------|
| `README.md` | Complete rewrite in English |
| `LICENSE` | New: MIT license |
| `CONTRIBUTING.md` | New: Contribution guidelines |
| `src/**/*.ts(x)` | Update: Translate German code comments to English |
| `prisma/seed.ts` | Update: Translate comments to English |
| `scripts/docker-entrypoint.sh` | Update: Translate comments to English |

## Out of Scope

- UI text translation (stays German)
- API documentation (OpenAPI/Swagger)
- Architecture diagrams
- Screenshots (placeholder in README, actual screenshots can be added later)
