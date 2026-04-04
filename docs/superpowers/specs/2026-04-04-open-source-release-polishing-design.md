# Open-Source Readiness: Release Polishing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Final polish and preparation for the first public release (v1.0.0) of Haushalt-Quest as an open-source project.

**Context:** This is Sub-Project 4 of 4 in the open-source readiness initiative. All previous sub-projects (Seed Cleanup, Setup Wizard, Documentation) must be complete.

---

## 1. docker-compose.prod.yml — Generalize

**Current state:** References `ghcr.io/frfrey98/haushalt-quest:latest` and includes Watchtower with user-specific config path.

**Target state:**
- Use a placeholder image name with clear documentation: `ghcr.io/<your-username>/haushalt-quest:latest`
- Add comments explaining how to set up the image name
- Keep Watchtower section but with generalized paths and comments explaining the setup
- Add a comment about the `~/.docker/config.json` needing to contain GHCR credentials

Alternatively: Remove Watchtower from prod compose entirely (it's optional infrastructure, not core to the app) and document it separately in the README as an optional auto-update setup.

**Decision:** Remove Watchtower from `docker-compose.prod.yml`. It adds complexity for a first-time user and is deployment-specific. Document it as an optional section in the README instead. The prod compose becomes a simple single-service file.

---

## 2. package.json Cleanup

- Remove `"private": true` (allows publishing, signals open-source intent)
- Verify `"name"` and `"version"` are correct
- Add `"description"`: "A gamified household task manager for couples"
- Add `"license"`: "MIT"
- Add `"repository"` field pointing to the GitHub repo (use placeholder if needed)
- Add `"keywords"`: ["household", "gamification", "tasks", "nextjs", "prisma", "couples"]

---

## 3. GitHub Actions — Add Tests

**Current state:** CI only builds and pushes the Docker image. No test step.

**Enhancement:** Add a test job that runs before the build:
1. Install dependencies
2. Generate Prisma client
3. Run `npm test`
4. Run `npm run lint`
5. Only proceed to build-and-push if tests pass

This demonstrates CI best practices (important for portfolio).

---

## 4. CHANGELOG.md

Create an initial changelog following Keep a Changelog format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2026-04-04

### Added
- Task management with points and categories
- Streak system with tier bonuses (Warm-up, Feuer-Starter, Wochen-Star, Monats-Marathon)
- Achievement system with 13 unlockable badges
- Reward store for redeeming points
- Statistics page with charts and leaderboard
- Activity feed with shared completions
- Recurring tasks (daily, weekly, monthly)
- PIN-based authentication for 2 users
- Setup wizard for first-run configuration
- Docker deployment with SQLite
- GitHub Actions CI/CD pipeline
- In-app settings for game configuration
```

---

## 5. Version Bump

Update `package.json` version from `0.1.0` to `1.0.0` to mark the first public release.

---

## 6. Final Review Checklist

Before tagging the release, verify:
- [ ] No personal names (Franz, Michelle) in any committed file
- [ ] No hardcoded GitHub username in committed files (except CI which uses `${{ github.repository }}`)
- [ ] `.env` is in `.gitignore` and not committed
- [ ] `LICENSE` file exists
- [ ] `README.md` is comprehensive and in English
- [ ] `CONTRIBUTING.md` exists
- [ ] All code comments are in English
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] Docker build succeeds locally
- [ ] Setup wizard works on fresh database

---

## Summary of File Changes

| File | Action |
|------|--------|
| `docker-compose.prod.yml` | Simplify: remove Watchtower, generalize image name |
| `package.json` | Remove `private`, add description/license/keywords, bump to 1.0.0 |
| `.github/workflows/build.yml` | Add test job before build |
| `CHANGELOG.md` | New: Initial changelog |

## Out of Scope

- Git tag creation (user does this manually after review)
- GitHub Release creation (user does this manually)
- GitHub repo settings (description, topics, about) — these are set via GitHub UI, not code
