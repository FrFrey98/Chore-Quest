# Open-Source Readiness: Seed Data Externalization & Cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove all hardcoded personal data and references from the repository so it can be published as a clean open-source project.

**Context:** This is Sub-Project 1 of 4 in the open-source readiness initiative. Subsequent sub-projects cover: Setup Wizard (2), Documentation (3), and Release Polishing (4).

**Constraints:**
- UI text stays German (no i18n in this sub-project)
- App remains a 2-user model (pair/WG duo)
- No new features — this is purely cleanup and externalization

---

## 1. Remove Personal References

### docker-compose.prod.yml
- Replace `ghcr.io/frfrey98/haushalt-quest:latest` with `ghcr.io/<your-github-username>/haushalt-quest:latest` and add a comment explaining the user must substitute their own GitHub username.

### .env.example
- Translate all comments from German to English.
- Replace `<synology-ip>` with `<your-server-ip>`.
- Generalize production section (remove Synology-specific wording).

### .gitignore
- Change `.env` + `.env*.local` pattern to `.env*` combined with `!.env.example` to catch all variants (`.env.production`, `.env.staging`, etc.).

### Git config (note, not a task)
- Existing commits retain the personal email — this is acceptable. For future commits, consider using GitHub's noreply address.

---

## 2. Reduce docker-entrypoint.sh to Migrations Only

**Current state:** ~111 lines with inline Node.js scripts that seed users, tasks, categories, store items, and achievements.

**Target state:** The entrypoint script should:
1. Validate `DATABASE_URL` is set.
2. Run `npx prisma migrate deploy`.
3. Check if the database has any users. If not, log a message indicating the setup wizard will handle initial configuration. (Sub-Project 2 detects first-run state via DB query, not a marker file.)
4. Start Next.js (`node server.js`).

All seed logic (user creation, task creation, category creation, etc.) is removed from the entrypoint. No data is written to the database by the entrypoint.

---

## 3. Generalize prisma/seed.ts

**Current state:** Hardcoded "Franz"/"Michelle" with PINs 1234/5678, German tasks, achievements, etc.

**Target state:**
- User names: "Alice" and "Bob" (internationally recognized placeholder names).
- User IDs: `seed-user-1` and `seed-user-2` (clearly marked as seed data).
- PINs: remain 1234/5678 (obviously development credentials).
- Categories, tasks, store items, achievements: remain in German (app's default language) — content unchanged.
- All code comments in English.

`seed.ts` becomes the single source of truth for development example data. The duplication with `docker-entrypoint.sh` is eliminated.

---

## 4. Update Tests

Tests that reference hardcoded user IDs or names must be updated:
- `user-1` / `user-2` → `seed-user-1` / `seed-user-2` where tests rely on seed data IDs.
- "Franz" / "Michelle" → "Alice" / "Bob" where tests reference user names.
- Purely functional tests (e.g., `streak.test.ts`, `config.test.ts`) that test logic without user references need no changes.

Affected test directories: `src/tests/api/`, `src/tests/lib/` — each test file must be checked for user references.

---

## Summary of File Changes

| File | Action |
|------|--------|
| `scripts/docker-entrypoint.sh` | Reduce to migrations + empty-DB check + server start |
| `prisma/seed.ts` | Rename users to Alice/Bob, update IDs, English comments |
| `docker-compose.prod.yml` | Replace GitHub username with placeholder |
| `.env.example` | Translate comments to English, generalize server references |
| `.gitignore` | Use `.env*` + `!.env.example` pattern |
| `src/tests/**` | Update user ID and name references to match new seed data |

## Out of Scope

- UI text changes (stays German)
- Setup Wizard implementation (Sub-Project 2)
- README, LICENSE, CONTRIBUTING.md (Sub-Project 3)
- Release tagging and polishing (Sub-Project 4)
