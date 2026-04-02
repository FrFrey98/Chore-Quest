# Docker-Deployment mit Auto-Update — Spec

## Ziel

Die bestehende Haushalt-Quest-App soll per Docker-Container auf einer Synology NAS laufen und automatisch aktualisiert werden, wenn neuer Code auf den `main`-Branch gepusht wird. Die Update-Pipeline: GitHub Actions baut ein Multi-Arch-Image → pusht es auf ghcr.io → Watchtower auf der Synology erkennt das neue Image und startet den Container neu.

## Pipeline-Übersicht

```
Entwickler pusht auf main
        ↓
GitHub Actions Workflow
        ↓
Build Multi-Arch Docker-Image (linux/amd64 + linux/arm64)
        ↓
Push auf ghcr.io/<username>/haushalt-quest:latest
        ↓
Watchtower auf Synology (prüft alle 5 Min)
        ↓
Neues Image erkannt → Pull → Container neu starten
```

## Komponenten

### 1. GitHub Actions Workflow

**Datei:** `.github/workflows/build.yml`

**Trigger:** Push auf `main`-Branch.

**Schritte:**

1. Checkout Code
2. Docker Buildx einrichten (für Multi-Arch)
3. Login bei ghcr.io mit `GITHUB_TOKEN` (automatisch verfügbar, kein manuelles Secret nötig)
4. Build + Push: `ghcr.io/<username>/haushalt-quest:latest`

**Plattformen:** `linux/amd64`, `linux/arm64` (Synology NAS-Modelle nutzen beide Architekturen).

**Image-Tags:** Nur `latest`. Kein Versions-Tagging — für eine 2-Personen-App unnötig.

### 2. Docker-Entrypoint-Script

**Datei:** `scripts/docker-entrypoint.sh`

Ersetzt den bisherigen `CMD` im Dockerfile. Ablauf:

1. `npx prisma migrate deploy` — Migrationen anwenden (bei jedem Start, auch bei Updates)
2. **Seed-Guard:** Prüft ob die `User`-Tabelle leer ist. Wenn ja → `npx prisma db seed` ausführen. Wenn nein → überspringen.
3. `exec node server.js` — App starten (`exec` ersetzt die Shell, damit Node PID 1 wird und Signale korrekt empfängt)

**Seed-Guard-Implementierung:** Ein Node-Einzeiler der per SQLite prüft ob mindestens ein User existiert:

```sh
USER_COUNT=$(node -e "
  const Database = require('better-sqlite3');
  const db = new Database(process.env.DATABASE_URL.replace('file:', ''));
  const row = db.prepare('SELECT COUNT(*) as count FROM User').get();
  console.log(row.count);
  db.close();
")

if [ "$USER_COUNT" = "0" ]; then
  echo "Datenbank leer — seede Initialdaten..."
  npx prisma db seed
else
  echo "Datenbank enthält $USER_COUNT User — Seed übersprungen."
fi
```

### 3. Dockerfile-Änderungen

**Aktueller CMD:**
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

**Neu:**
```dockerfile
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
```

Zusätzlich benötigt: `better-sqlite3` muss im Runner-Stage verfügbar sein (für den Seed-Guard). Da es bereits eine Dependency ist und im standalone-Output enthalten sein sollte, muss geprüft werden ob es dort wirklich verfügbar ist. Falls nicht, wird es explizit aus dem Builder-Stage kopiert.

Außerdem: Der Seed-Befehl (`npx prisma db seed`) benötigt `tsx` als Dev-Dependency (der Seed-Script ist TypeScript). Im Production-Image ist `tsx` nicht verfügbar. Lösung: Das Seed-Script wird als Teil des Build-Steps zu JavaScript kompiliert, oder der Seed wird mit einem separaten, vorcompilierten Script ausgeführt.

**Seed im Production-Image — Lösungsansatz:**

Im Builder-Stage den Seed als JavaScript kompilieren:
```dockerfile
# Im builder stage:
RUN npx tsx --compile prisma/seed.ts > prisma/seed.js
```

Dann im Entrypoint `node prisma/seed.js` statt `npx prisma db seed` verwenden.

Alternativ: `tsx` als Production-Dependency hinzufügen. Da es nur beim allerersten Start benötigt wird und die Image-Größe minimal erhöht, ist das vertretbar.

**Entscheidung:** `seed.ts` wird im Builder-Stage zu `seed.js` kompiliert und ins Runner-Image kopiert. Der Entrypoint ruft `node prisma/seed.js` auf. Keine zusätzliche Runtime-Dependency nötig.

### 4. Produktions-Compose

**Datei:** `docker-compose.prod.yml`

Separate Datei neben der bestehenden `docker-compose.yml` (die bleibt für lokale Entwicklung unverändert).

```yaml
services:
  app:
    image: ghcr.io/<username>/haushalt-quest:latest
    ports:
      - "3333:3000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/haushalts.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped

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

**App-Service-Label** für Watchtower-Scope:
```yaml
  app:
    labels:
      - "com.centurylinklabs.watchtower.scope=haushalt-quest"
```

Dies stellt sicher, dass Watchtower nur den Haushalt-Quest-Container überwacht, nicht andere Container auf der Synology.

**WATCHTOWER_CLEANUP=true** entfernt alte Images nach dem Update, spart Speicherplatz auf der NAS.

### 5. Environment-Variablen

**Auf der Synology** wird eine `.env`-Datei neben `docker-compose.prod.yml` angelegt (nicht im Repo):

```env
NEXTAUTH_SECRET=<generiert mit: openssl rand -base64 32>
NEXTAUTH_URL=http://<synology-ip>:3333
```

`DATABASE_URL` ist fest in der Compose-Datei, da der Pfad immer gleich ist.

### 6. .env.example aktualisieren

Ergänzt um Produktions-Hinweise:

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

## Ersteinrichtung auf der Synology

Schritt-für-Schritt-Anleitung (gehört in die README, nicht in den Code):

1. Docker/Container Manager installieren (falls nicht vorhanden)
2. Per SSH verbinden
3. GitHub Personal Access Token (PAT) erstellen mit `read:packages` Scope
4. Docker-Login: `docker login ghcr.io -u <github-username> -p <PAT>`
5. Projektverzeichnis anlegen: `mkdir -p ~/haushalt-quest && cd ~/haushalt-quest`
6. `docker-compose.prod.yml` und `.env` auf die Synology kopieren
7. `docker compose -f docker-compose.prod.yml up -d`
8. App erreichbar unter `http://<synology-ip>:3333`

## Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `.github/workflows/build.yml` | GitHub Actions: Build + Push Multi-Arch Image |
| `docker-compose.prod.yml` | Produktions-Compose: App (Port 3333) + Watchtower |
| `scripts/docker-entrypoint.sh` | Entrypoint: Migration → Seed-Guard → App-Start |

## Zu modifizierende Dateien

| Datei | Änderung |
|-------|----------|
| `Dockerfile` | CMD → ENTRYPOINT mit docker-entrypoint.sh, Seed-JS kopieren |
| `.env.example` | Produktions-Variablen als Kommentar ergänzen |
| `.dockerignore` | `.github` hinzufügen (Actions-Workflow nicht im Image nötig) |

## Keine Änderungen an

- `docker-compose.yml` (bleibt für lokale Entwicklung)
- `prisma/schema.prisma` (keine Schema-Änderungen)
- Bestehender Anwendungscode (keine Code-Änderungen nötig)
- `next.config.mjs` (`output: 'standalone'` ist bereits konfiguriert)

## Spätere Erweiterungen (out of scope)

- Reverse Proxy (Nginx/Traefik) für HTTPS und eigene Domain
- Health-Check-Endpoint für Container-Monitoring
- Backup-Script für die SQLite-Datenbank
