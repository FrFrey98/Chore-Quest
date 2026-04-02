# Docker-Deployment mit Auto-Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Docker-basiertes Deployment auf Synology NAS mit automatischen Updates via GitHub Actions → ghcr.io → Watchtower.

**Architecture:** GitHub Actions baut bei Push auf `main` ein Multi-Arch Docker-Image und pusht es auf ghcr.io. Auf der Synology zieht Watchtower neue Images automatisch und startet den Container neu. Ein Entrypoint-Script kümmert sich um Migrationen und bedingtes Seeding.

**Tech Stack:** Docker, GitHub Actions, GitHub Container Registry (ghcr.io), Watchtower, Next.js standalone, Prisma, SQLite

---

## Dateiübersicht

| Datei | Aktion | Verantwortung |
|-------|--------|---------------|
| `scripts/docker-entrypoint.sh` | Neu | Migration → Seed-Guard → App-Start |
| `.github/workflows/build.yml` | Neu | CI/CD: Build Multi-Arch Image + Push auf ghcr.io |
| `docker-compose.prod.yml` | Neu | Produktions-Compose: App (Port 3333) + Watchtower |
| `Dockerfile` | Ändern | Seed kompilieren, Entrypoint-Script, better-sqlite3 kopieren |
| `.env.example` | Ändern | Produktions-Hinweise ergänzen |
| `.dockerignore` | Ändern | `.github` ausschließen |

---

### Task 1: Docker-Entrypoint-Script erstellen

**Files:**
- Create: `scripts/docker-entrypoint.sh`

Das Entrypoint-Script ersetzt den bisherigen CMD im Dockerfile. Es führt Migrationen aus, prüft ob die Datenbank leer ist (Seed-Guard), und startet die App.

- [ ] **Step 1: Erstelle das Entrypoint-Script**

```bash
#!/bin/sh
set -e

echo "Starte Haushalt-Quest..."

# 1. Migrationen anwenden
echo "Wende Datenbankmigrationen an..."
npx prisma migrate deploy

# 2. Seed-Guard: Nur seeden wenn DB leer ist
DB_PATH=$(echo "$DATABASE_URL" | sed 's|file:||')

USER_COUNT=$(node -e "
  const Database = require('better-sqlite3');
  const db = new Database('$DB_PATH');
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM User').get();
    console.log(row.count);
  } catch (e) {
    console.log('0');
  }
  db.close();
")

if [ "$USER_COUNT" = "0" ]; then
  echo "Datenbank leer — seede Initialdaten..."
  node prisma/seed.js
else
  echo "Datenbank enthält $USER_COUNT User — Seed übersprungen."
fi

# 3. App starten (exec ersetzt Shell, Node wird PID 1)
echo "Starte Server..."
exec node server.js
```

Schreibe diese Datei nach `scripts/docker-entrypoint.sh`.

- [ ] **Step 2: Teste das Script lokal auf Syntax**

Run: `bash -n scripts/docker-entrypoint.sh`
Expected: Keine Ausgabe (= keine Syntaxfehler)

- [ ] **Step 3: Commit**

```bash
git add scripts/docker-entrypoint.sh
git commit -m "feat: add docker entrypoint script with migration and seed guard"
```

---

### Task 2: Dockerfile anpassen

**Files:**
- Modify: `Dockerfile`

Das bestehende Dockerfile wird erweitert: Seed-Script im Builder kompilieren, `better-sqlite3` ins Runner-Image kopieren (für Seed-Guard), CMD durch ENTRYPOINT ersetzen.

- [ ] **Step 1: Lies das aktuelle Dockerfile**

Aktueller Inhalt zur Referenz:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma CLI and engines for migrate deploy
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

- [ ] **Step 2: Ersetze das Dockerfile mit der aktualisierten Version**

Ersetze den gesamten Inhalt von `Dockerfile` mit:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Compile seed.ts to seed.js for production use (no tsx needed at runtime)
RUN npx tsx -e "
  const { readFileSync, writeFileSync } = require('fs');
  const { transformSync } = require('esbuild');
  // tsx uses esbuild internally, so we can use it to compile
" 2>/dev/null || true
RUN node -e "
  const { execSync } = require('child_process');
  execSync('npx esbuild prisma/seed.ts --bundle --platform=node --outfile=prisma/seed.js --external:better-sqlite3 --external:bcryptjs --external:@prisma/client --external:@prisma/adapter-better-sqlite3 --external:dotenv', { stdio: 'inherit' });
"

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma CLI and engines for migrate deploy
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy better-sqlite3 for seed guard check
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Copy bcryptjs for seed script
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Copy dotenv for seed script
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

# Copy compiled seed script
COPY --from=builder /app/prisma/seed.js ./prisma/seed.js

# Copy entrypoint script
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
```

- [ ] **Step 3: Teste den Docker-Build lokal**

Run: `docker build -t haushalt-quest-test .`
Expected: Build erfolgreich. Die Ausgabe sollte alle Stages durchlaufen ohne Fehler.

- [ ] **Step 4: Teste den Container-Start lokal**

Run:
```bash
mkdir -p /tmp/hq-test-data
docker run --rm -e DATABASE_URL=file:/app/data/test.db -e NEXTAUTH_SECRET=test-secret -e NEXTAUTH_URL=http://localhost:3000 -v /tmp/hq-test-data:/app/data -p 3333:3000 haushalt-quest-test
```

Expected: Container startet, Migrationen laufen, Seed wird ausgeführt (DB ist leer), Server startet auf Port 3000. Prüfe im Output:
- "Wende Datenbankmigrationen an..."
- "Datenbank leer — seede Initialdaten..."
- "Starte Server..."

Stoppe den Container mit Ctrl+C.

- [ ] **Step 5: Teste dass Seed nicht erneut läuft**

Run: Starte den gleichen Container nochmal (gleiches Volume):
```bash
docker run --rm -e DATABASE_URL=file:/app/data/test.db -e NEXTAUTH_SECRET=test-secret -e NEXTAUTH_URL=http://localhost:3000 -v /tmp/hq-test-data:/app/data -p 3333:3000 haushalt-quest-test
```

Expected: "Datenbank enthält 2 User — Seed übersprungen."

Räume auf:
```bash
rm -rf /tmp/hq-test-data
docker rmi haushalt-quest-test
```

- [ ] **Step 6: Commit**

```bash
git add Dockerfile
git commit -m "feat: add seed compilation and entrypoint to Dockerfile"
```

---

### Task 3: GitHub Actions Workflow erstellen

**Files:**
- Create: `.github/workflows/build.yml`

Der Workflow baut bei jedem Push auf `main` ein Multi-Arch Docker-Image und pusht es auf ghcr.io.

- [ ] **Step 1: Erstelle den Workflow**

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

Schreibe diese Datei nach `.github/workflows/build.yml`.

**Hinweise:**
- `IMAGE_NAME: ${{ github.repository }}` ergibt automatisch `<username>/haushalt-quest` (oder wie das Repo heißt)
- `secrets.GITHUB_TOKEN` ist automatisch verfügbar, kein manuelles Secret nötig
- `cache-from/cache-to: type=gha` nutzt den GitHub Actions Cache für schnellere Builds
- `platforms: linux/amd64,linux/arm64` baut für beide Architekturen (Synology kann beides sein)

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/build.yml
git commit -m "feat: add GitHub Actions workflow for multi-arch Docker image build"
```

---

### Task 4: Produktions-Compose erstellen

**Files:**
- Create: `docker-compose.prod.yml`

Die Produktions-Compose-Datei definiert App + Watchtower. Sie wird auf die Synology kopiert.

- [ ] **Step 1: Erstelle docker-compose.prod.yml**

```yaml
services:
  app:
    image: ghcr.io/<github-username>/haushalt-quest:latest
    ports:
      - "3333:3000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/haushalts.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped
    labels:
      - "com.centurylinklabs.watchtower.scope=haushalt-quest"

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.docker/config.json:/config.json:ro
    environment:
      - WATCHTOWER_POLL_INTERVAL=300
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_SCOPE=haushalt-quest
    labels:
      - "com.centurylinklabs.watchtower.scope=haushalt-quest"
    restart: unless-stopped
```

Schreibe diese Datei nach `docker-compose.prod.yml`.

**Hinweis:** `<github-username>` muss durch den echten GitHub-Username ersetzt werden, sobald das Repository erstellt ist (z.B. `ghcr.io/franzfreynhofer/haushalt-quest:latest`).

- [ ] **Step 2: Commit**

```bash
git add docker-compose.prod.yml
git commit -m "feat: add production docker-compose with Watchtower auto-update"
```

---

### Task 5: .dockerignore und .env.example aktualisieren

**Files:**
- Modify: `.dockerignore`
- Modify: `.env.example`

- [ ] **Step 1: Ergänze .dockerignore um .github**

Aktuelle `.dockerignore`:
```
.git
.next
node_modules
*.db
.env*
.superpowers
docs
```

Füge `.github` am Ende hinzu:
```
.git
.next
node_modules
*.db
.env*
.superpowers
docs
.github
```

- [ ] **Step 2: Aktualisiere .env.example**

Ersetze den gesamten Inhalt von `.env.example` mit:

```env
# Entwicklung
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-here-run-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Produktion (Synology / Docker)
# DATABASE_URL=file:/app/data/haushalts.db
# NEXTAUTH_SECRET=<openssl rand -base64 32>
# NEXTAUTH_URL=http://<synology-ip>:3333
```

- [ ] **Step 3: Commit**

```bash
git add .dockerignore .env.example
git commit -m "chore: update dockerignore and env.example for production deployment"
```

---

## Zusammenfassung der Commits

| # | Commit-Message |
|---|---------------|
| 1 | `feat: add docker entrypoint script with migration and seed guard` |
| 2 | `feat: add seed compilation and entrypoint to Dockerfile` |
| 3 | `feat: add GitHub Actions workflow for multi-arch Docker image build` |
| 4 | `feat: add production docker-compose with Watchtower auto-update` |
| 5 | `chore: update dockerignore and env.example for production deployment` |

## Nach der Implementierung

Manuelle Schritte (nicht Teil des Plans, aber nötig):

1. **GitHub-Repo erstellen** und als Remote hinzufügen
2. Auf `main` pushen → erster GitHub Actions Build wird getriggert
3. **Synology einrichten:** SSH → `docker login ghcr.io` → `.env` anlegen → `docker compose -f docker-compose.prod.yml up -d`
4. `<github-username>` in `docker-compose.prod.yml` durch echten Username ersetzen
