# Haushalt-Quest

A gamified household task manager for couples — earn points, unlock achievements, and keep your streak alive.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build](https://github.com/FrFrey98/haushalt-quest/actions/workflows/build.yml/badge.svg)](https://github.com/FrFrey98/haushalt-quest/actions/workflows/build.yml)
[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue.svg)](https://github.com/FrFrey98/haushalt-quest/pkgs/container/haushalt-quest)

## Features

- **Task management with points and categories** — organize chores by room or type, each worth configurable points
- **Streak system with tier bonuses** — maintain daily streaks to earn bonus multipliers
- **Achievement badges** — unlock achievements for milestones like completing tasks or reaching streaks
- **Reward store** — redeem earned points for real-life rewards (e.g., "Partner cooks dinner")
- **Statistics and activity feed** — track progress with charts, heatmaps, and a shared activity feed
- **Shared task completions** — complete tasks together for a teamwork bonus
- **Recurring tasks** — set tasks to repeat daily, weekly, or at custom intervals
- **PIN-based authentication** — simple login with a 4-digit PIN, no email required
- **Mobile-friendly UI** — responsive PWA-style interface built for phones and tablets
- **Self-hosted with Docker** — runs on SQLite, no external database needed

## Screenshots

Screenshots coming soon. See `docs/screenshots/` for future additions.

## Quick Start (Docker)

1. Create a project directory and a `docker-compose.yml`:

```yaml
services:
  haushalt-quest:
    image: ghcr.io/frfrey98/haushalt-quest:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/haushalts.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    restart: unless-stopped
```

2. Create a `.env` file next to `docker-compose.yml` with a secret:

```bash
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env
```

3. Start the app:

```bash
docker compose up -d
```

4. Open `http://localhost:3000` in your browser. The setup wizard will guide you through creating your first two users and configuring the app.

5. Log in with your PIN and start completing tasks!

### Optional: Auto-Updates with Watchtower

To automatically pull new images when they are pushed to the container registry, add a [Watchtower](https://containrrr.dev/watchtower/) service to your `docker-compose.yml`:

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

Note: If your registry requires authentication (e.g., GHCR with a private repo), make sure `~/.docker/config.json` contains valid credentials. On some systems (like Synology NAS), this file may be cleared on reboot — consider storing it in a persistent location.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/FrFrey98/haushalt-quest.git
cd haushalt-quest

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize the database
npx prisma migrate dev

# (Optional) Seed example data
npm run seed

# Start the dev server
npm run dev
```

Open `http://localhost:3000` to see the app.

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | Full-stack React framework (App Router) |
| [React 18](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Prisma](https://www.prisma.io/) + SQLite | Database ORM and storage |
| [NextAuth.js](https://next-auth.js.org/) | Authentication (credentials provider) |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI components |
| [Recharts](https://recharts.org/) | Charts and data visualization |
| [Vitest](https://vitest.dev/) | Unit and integration testing |

## Project Structure

```
src/
  app/
    (app)/          # Main app pages (dashboard, tasks, store, stats, etc.)
    (auth)/         # Login and setup wizard
    api/            # API routes (tasks, store, streak, achievements, etc.)
  components/       # Reusable UI components (nav, dashboard, store, stats)
  lib/              # Core logic (auth, streak, points, achievements, config)
  types/            # TypeScript type declarations
  middleware.ts     # Auth and setup redirect middleware
prisma/
  schema.prisma     # Database schema
  seed.ts           # Development seed data
scripts/
  docker-entrypoint.sh  # Docker container entrypoint
```

## Configuration

Game settings like streak tier thresholds, level XP requirements, and bonus multipliers are all configurable through the in-app **Settings** page. No need to edit config files — admins can adjust everything from the browser.

## Language

The UI is **German-first** — all labels, buttons, and messages are in German. Code comments and documentation are in English. Seed data (task names, categories, achievements) uses German strings but can be customized through the settings page or by modifying the seed script.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.
