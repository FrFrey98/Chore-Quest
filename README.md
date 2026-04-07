# Chore Quest

A gamified household task manager — earn points, unlock achievements, and keep your streak alive.

[![Build](https://github.com/FrFrey98/chore-quest/actions/workflows/build.yml/badge.svg)](https://github.com/FrFrey98/chore-quest/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ghcr.io-blue.svg)](https://github.com/FrFrey98/chore-quest/pkgs/container/chore-quest)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

## Screenshots

<!-- Add screenshots to docs/screenshots/ and uncomment:
<table>
  <tr>
    <td><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="300"/></td>
    <td><img src="docs/screenshots/tasks.png" alt="Tasks" width="300"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/store.png" alt="Store" width="300"/></td>
    <td><img src="docs/screenshots/stats.png" alt="Statistics" width="300"/></td>
  </tr>
</table>
-->

Screenshots will be added soon. To see the app in action, follow the [Quick Start](#quick-start-docker) below.

## Features

- **Task management with points** — organize chores by category, each worth configurable points
- **Streak system** — maintain daily streaks to earn tier-based bonus multipliers
- **Achievements** — unlock badges for milestones (task counts, streaks, points, levels)
- **Reward store** — redeem earned points for custom rewards
- **Statistics & activity feed** — charts, heatmaps, leaderboard, and shared activity feed
- **Calendar scheduling** — assign tasks to specific weekdays with schedule overrides
- **User management** — admin, member, and child roles with permission-based access control
- **Backup & restore** — export/import full database as JSON with automatic pre-restore backup
- **Push notifications** — PWA notifications for task reminders with offline support
- **Shared completions** — complete tasks together for a teamwork bonus
- **PIN-based auth** — simple login with a 4-digit PIN, no email required
- **Mobile-first PWA** — responsive interface with install prompt and offline capability
- **Self-hosted** — Docker deployment with SQLite, no external database needed

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org/) | Full-stack React framework (App Router) |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript (strict mode) |
| [Prisma](https://www.prisma.io/) + SQLite | Database ORM and storage |
| [NextAuth.js](https://next-auth.js.org/) | Authentication (credentials provider) |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI components |
| [Recharts](https://recharts.org/) | Charts and data visualization |
| [Zod](https://zod.dev/) | Schema validation |
| [Vitest](https://vitest.dev/) | Unit and integration testing |

## Architecture

**Frontend:** Next.js App Router with a mix of Server and Client Components. UI built with Tailwind CSS and shadcn/ui. The app is a PWA with service worker for offline support, push notifications, and background sync.

**API Layer:** RESTful route handlers in `app/api/` with role-based permission guards. All mutations validate input and check authorization before touching the database.

**Database:** Prisma ORM with SQLite (via better-sqlite3 driver). 13 models covering users, tasks, completions, achievements, streaks, store items, and push subscriptions. Full backup/restore via JSON export with transactional imports.

**Auth:** NextAuth.js credentials provider with PIN-based login. Roles (admin/member/child) are embedded in the JWT and checked by a central permission system.

**Deployment:** Multi-stage Docker build published to GHCR. SQLite database persisted via volume mount. CI/CD pipeline runs tests, lints, builds, and pushes the image on every push to main.

## Quick Start (Docker)

1. Create a project directory and a `docker-compose.yml`:

```yaml
services:
  chore-quest:
    image: ghcr.io/frfrey98/chore-quest:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/chore-quest.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    restart: unless-stopped
```

2. Create a `.env` file with a secret:

```bash
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env
```

3. Start the app:

```bash
docker compose up -d
```

4. Open `http://localhost:3000` — the setup wizard will guide you through creating users and configuring the app.

<details>
<summary>Optional: Auto-updates with Watchtower</summary>

Add a [Watchtower](https://containrrr.dev/watchtower/) service to automatically pull new images:

```yaml
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.docker/config.json:/config.json:ro
    environment:
      - WATCHTOWER_POLL_INTERVAL=300
      - WATCHTOWER_CLEANUP=true
    restart: unless-stopped
```

Note: If your registry requires authentication (e.g., GHCR with a private repo), make sure `~/.docker/config.json` contains valid credentials.

</details>

## Development Setup

```bash
git clone https://github.com/FrFrey98/chore-quest.git
cd chore-quest
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed    # optional: load example data
npm run dev
```

Open `http://localhost:3000` to see the app.

## Project Structure

```
src/
  app/
    (app)/          # Main app pages (dashboard, tasks, store, stats, settings)
    (auth)/         # Login and setup wizard
    api/            # API routes (tasks, store, streak, achievements, backup, etc.)
  components/       # Reusable UI components
  lib/              # Core logic (auth, streak, points, achievements, permissions, backup)
  types/            # TypeScript type declarations
  middleware.ts     # Auth and setup redirect middleware
prisma/
  schema.prisma     # Database schema (13 models)
  seed.ts           # Development seed data
```

## Configuration

All game settings (streak tiers, level thresholds, bonus multipliers) are configurable through the in-app Settings page — no config files to edit.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
