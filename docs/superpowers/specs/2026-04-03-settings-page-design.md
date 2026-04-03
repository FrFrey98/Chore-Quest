# Settings-Seite Design

## Ziel

Eine dedizierte, umfassende Settings-Seite für Haushalt-Quest, die die bestehende `/admin`-Seite ersetzt und alle konfigurierbaren Parameter der App zentral über eine Tab-Navigation zugänglich macht. Maximale Modifizierbarkeit bei voller Rückwärtskompatibilität — keine bestehenden Daten gehen verloren.

## Architektur

Hybrid-Speicherung: Einfache Parameter (Streak-Boni, Level-Schwellen, Teamwork-Bonus, etc.) werden in einem neuen `AppConfig` Key-Value-Model gespeichert. Strukturierte Daten (Kategorien, Achievements) nutzen ihre bestehenden Prisma-Models und werden CRUD-fähig. Beim ersten Start ist `AppConfig` leer — alle Lib-Funktionen fallen auf die bisherigen hardcodierten Werte als Defaults zurück.

## Tech Stack

Next.js, Prisma (SQLite), TypeScript, Tailwind CSS.

---

## 1. Datenmodell

### Neues AppConfig-Model

```prisma
model AppConfig {
  key       String   @id
  value     String          // JSON-encoded
  updatedAt DateTime @updatedAt
}
```

### Bekannte Keys und ihre Defaults

| Key | Default-Wert | Typ |
|-----|-------------|-----|
| `streak_tiers` | `[{"minDays":30,"percent":50,"name":"Monats-Marathon"},{"minDays":14,"percent":25,"name":"Wochen-Star"},{"minDays":7,"percent":10,"name":"Feuer-Starter"},{"minDays":3,"percent":5,"name":"Warm-up"},{"minDays":0,"percent":0,"name":"Kein Bonus"}]` | `Array<{minDays:number, percent:number, name:string}>` |
| `teamwork_bonus_percent` | `10` | `number` |
| `restore_base_price` | `20` | `number` |
| `restore_per_day_price` | `5` | `number` |
| `level_definitions` | `[{"level":1,"minPoints":0,"title":"Haushaltslehrling"},{"level":2,"minPoints":200,"title":"Ordnungs-Fan"},{"level":3,"minPoints":500,"title":"Putz-Profi"},{"level":4,"minPoints":1000,"title":"Haushalts-Held"},{"level":5,"minPoints":2000,"title":"Hygiene-Legende"},{"level":6,"minPoints":4000,"title":"Wohn-Meister"}]` | `Array<{level:number, minPoints:number, title:string}>` |
| `recurring_intervals` | `{"daily":1,"weekly":7,"monthly":30}` | `Record<string, number>` |

### Bestehende Models — keine Änderungen

Achievements, Kategorien (Category), StoreItems, Users — alle bleiben unverändert. Sie werden lediglich über neue Settings-UI-Endpunkte CRUD-fähig gemacht.

---

## 2. Config-Bibliothek (`src/lib/config.ts`)

Neue Datei mit zwei Kernfunktionen:

```typescript
export async function getConfig<T>(key: string, defaultValue: T): Promise<T>
export async function setConfig<T>(key: string, value: T): Promise<void>
```

- `getConfig` liest den Wert aus `AppConfig`, parsed JSON, gibt `defaultValue` zurück wenn Key nicht existiert
- `setConfig` schreibt/überschreibt einen Eintrag mit `JSON.stringify(value)`

### Default-Konstanten

Die bisherigen hardcodierten Werte werden als benannte Default-Konstanten in `config.ts` exportiert:

```typescript
export const DEFAULT_STREAK_TIERS = [
  { minDays: 30, percent: 50, name: 'Monats-Marathon' },
  { minDays: 14, percent: 25, name: 'Wochen-Star' },
  { minDays: 7, percent: 10, name: 'Feuer-Starter' },
  { minDays: 3, percent: 5, name: 'Warm-up' },
  { minDays: 0, percent: 0, name: 'Kein Bonus' },
]

export const DEFAULT_TEAMWORK_BONUS_PERCENT = 10
export const DEFAULT_RESTORE_BASE_PRICE = 20
export const DEFAULT_RESTORE_PER_DAY_PRICE = 5

export const DEFAULT_LEVEL_DEFINITIONS = [
  { level: 1, minPoints: 0, title: 'Haushaltslehrling' },
  { level: 2, minPoints: 200, title: 'Ordnungs-Fan' },
  { level: 3, minPoints: 500, title: 'Putz-Profi' },
  { level: 4, minPoints: 1000, title: 'Haushalts-Held' },
  { level: 5, minPoints: 2000, title: 'Hygiene-Legende' },
  { level: 6, minPoints: 4000, title: 'Wohn-Meister' },
]

export const DEFAULT_RECURRING_INTERVALS = { daily: 1, weekly: 7, monthly: 30 }
```

---

## 3. Lib-Änderungen

### `src/lib/streak.ts`

- `STREAK_TIERS` Konstante wird entfernt. Stattdessen: `getConfig('streak_tiers', DEFAULT_STREAK_TIERS)`
- `TEAMWORK_BONUS_PERCENT` Konstante wird entfernt. Stattdessen: `getConfig('teamwork_bonus_percent', DEFAULT_TEAMWORK_BONUS_PERCENT)`
- `getStreakTier()` wird `async` — lädt Tiers via `getConfig()`
- `applyBonus()` wird `async` — lädt Teamwork-Bonus via `getConfig()`
- `calculateRestorePrice()` wird `async` — lädt Basis-Preis und Pro-Tag-Preis via `getConfig()`

### `src/lib/points.ts`

- `LEVELS` Konstante wird entfernt. Stattdessen: `getConfig('level_definitions', DEFAULT_LEVEL_DEFINITIONS)`
- `getLevel()` wird `async`

### `src/lib/recurring.ts`

- `INTERVAL_DAYS` Konstante wird entfernt. Stattdessen: `getConfig('recurring_intervals', DEFAULT_RECURRING_INTERVALS)`
- `getNextDueAt()` wird `async`

### Auswirkungen auf Aufrufer

Da die Lib-Funktionen `async` werden, müssen alle Aufrufer angepasst werden:
- `src/app/api/tasks/[id]/complete/route.ts` — `await applyBonus(...)`, `await getStreakTier(...)`
- `src/app/(app)/page.tsx` — `await getLevel(...)`, `await getStreakTier(...)`
- `src/app/api/streak/route.ts` — `await calculateRestorePrice(...)`
- Weitere Stellen, die `getLevel`, `getStreakTier`, `applyBonus` oder `getNextDueAt` aufrufen

---

## 4. Settings-Seite

### Navigation & Zugang

- Neue Route: `/settings`
- Zugang: Zahnrad-Icon auf der Profil-Seite (`/profile`)
- `/admin`-Route wird entfernt
- `/manage` bleibt unverändert
- Kein neuer Eintrag in der Hauptnavigation

### Tab-Struktur

Horizontale Tab-Leiste, auf Mobile horizontal scrollbar. 8 Tabs:

| Tab | Inhalt |
|-----|--------|
| **Benutzer** | Name und PIN für beide User bearbeiten |
| **Streak** | Tier-Definitionen (dynamische Liste: minDays, percent, name), Restore-Preisformel (Basis-Preis, Pro-Tag-Preis) |
| **Level** | Level-Definitionen (dynamische Liste: level-Nummer, minPoints, title). Level 1 beginnt immer bei 0 Punkten. |
| **Boni** | Teamwork-Bonus-Prozent, Recurring-Intervalle (dynamische Liste: Name + Tage) |
| **Kategorien** | CRUD: Emoji + Name editierbar, Task-Zähler pro Kategorie, Lösch-Schutz bei zugeordneten Tasks |
| **Achievements** | CRUD: Emoji, Titel, Beschreibung, Bedingungstyp (Dropdown: task_count, category_count, streak_days, total_points, level), conditionValue, conditionMeta (Kategorie-Dropdown bei category_count), sortOrder |
| **Tasks** | Task-Erstellung (übernommen aus /admin): Emoji, Titel, Punkte, Kategorie, Intervall, allowMultiple, dailyLimit. Verweis auf /manage für bestehende Tasks. |
| **Store** | Store-Item-Erstellung + bestehende Items mit aktiv/deaktiv-Toggle (übernommen aus /admin) |

### UI-Pattern pro Tab

- Überschrift + kurze Beschreibung
- Bearbeitbare Felder oder dynamische Listen
- Dynamische Listen: Einträge hinzufügen (+ Button) und entfernen (× Button)
- Speichern-Button pro Tab (kein globaler Save)
- Änderungen werden sofort nach Speichern wirksam
- Beide User haben vollen Zugriff (kein Rollen-System)

---

## 5. API-Endpunkte

### Neue Endpunkte

| Endpunkt | Methode | Body | Funktion |
|----------|---------|------|----------|
| `/api/settings/config` | GET | — | Alle AppConfig-Werte laden. Fehlende Keys werden mit Defaults ergänzt. |
| `/api/settings/config` | PUT | `{ entries: { key: string, value: any }[] }` | Mehrere AppConfig-Werte gleichzeitig aktualisieren |
| `/api/settings/users/[id]` | PATCH | `{ name: string }` | User-Name ändern |
| `/api/settings/categories` | GET | — | Alle Kategorien mit `_count.tasks` |
| `/api/settings/categories` | POST | `{ name: string, emoji: string }` | Neue Kategorie erstellen |
| `/api/settings/categories/[id]` | PATCH | `{ name?: string, emoji?: string }` | Kategorie bearbeiten |
| `/api/settings/categories/[id]` | DELETE | — | Kategorie löschen (400 wenn Tasks zugeordnet) |
| `/api/settings/achievements` | GET | — | Alle Achievements, sortiert nach sortOrder |
| `/api/settings/achievements` | POST | `{ title, description, emoji, conditionType, conditionValue, conditionMeta?, sortOrder }` | Neues Achievement erstellen |
| `/api/settings/achievements/[id]` | PATCH | Teilweise Felder | Achievement bearbeiten |
| `/api/settings/achievements/[id]` | DELETE | — | Achievement löschen (UserAchievements bleiben als History, Achievement-Referenz wird entfernt) |

### Bestehende Endpunkte — unverändert

- `/api/tasks` (POST) — Task erstellen, wird weiterhin von Settings → Tasks Tab genutzt
- `/api/tasks/[id]` (DELETE) — Task archivieren
- `/api/store` (POST) — Store-Item erstellen
- `/api/users/[id]/pin` (POST) — PIN ändern

---

## 6. Datei-Struktur

### Neue Dateien

```
src/lib/config.ts                              — getConfig/setConfig + Default-Konstanten
src/app/(app)/settings/page.tsx                — Settings Server-Component (Daten laden)
src/app/(app)/settings/settings-client.tsx     — Settings Client-Component (Tabs + State)
src/app/api/settings/config/route.ts           — GET/PUT für AppConfig
src/app/api/settings/users/[id]/route.ts       — PATCH für User-Name
src/app/api/settings/categories/route.ts       — GET/POST für Kategorien
src/app/api/settings/categories/[id]/route.ts  — PATCH/DELETE für Kategorie
src/app/api/settings/achievements/route.ts     — GET/POST für Achievements
src/app/api/settings/achievements/[id]/route.ts — PATCH/DELETE für Achievement
```

### Geänderte Dateien

```
prisma/schema.prisma                    — AppConfig Model hinzufügen
src/lib/streak.ts                       — Konstanten durch getConfig() ersetzen, Funktionen async
src/lib/points.ts                       — LEVELS durch getConfig() ersetzen, getLevel async
src/lib/recurring.ts                    — INTERVAL_DAYS durch getConfig() ersetzen, getNextDueAt async
src/app/(app)/profile/page.tsx          — Zahnrad-Link zu /settings hinzufügen
src/app/api/tasks/[id]/complete/route.ts — await für async Lib-Funktionen
src/app/(app)/page.tsx                  — await für async Lib-Funktionen
src/app/api/streak/route.ts             — await für async Lib-Funktionen
```

### Gelöschte Dateien

```
src/app/(app)/admin/page.tsx            — Ersetzt durch /settings
src/app/(app)/admin/admin-client.tsx    — Ersetzt durch /settings
```

---

## 7. Migrationsstrategie

- **Prisma-Migration**: Neues `AppConfig`-Model, rein additiv. Keine bestehenden Tabellen werden geändert.
- **AppConfig-Tabelle startet leer**: Alle `getConfig()`-Aufrufe fallen auf Default-Werte zurück. Erst wenn jemand in den Settings etwas ändert, werden Einträge geschrieben.
- **Docker-Entrypoint**: Kein Seed für AppConfig nötig — leere Tabelle = bisheriges Verhalten.
- **Bestehende Daten**: Alle Users, Tasks, Completions, Achievements, Purchases, StreakStates bleiben vollständig erhalten.
- **Rückwärtskompatibilität**: Die App verhält sich identisch zum Vorzustand, solange niemand Settings ändert.

---

## 8. Was sich NICHT ändert

- **`/manage`-Seite** — bleibt als Schnellzugriff für Task/Reward-Bearbeitung
- **Alle bestehenden Prisma-Models** — User, Task, TaskCompletion, Category, Achievement, StoreItem, Purchase, StreakState, TaskApproval, UserAchievement
- **Bestehende API-Endpunkte** — complete, undo, purchase, redeem, approvals, feed, stats
- **Authentifizierung** — NextAuth mit PIN-Provider
- **Dashboard, Feed, Stats, Store-Seiten** — Layout und Funktionalität unverändert
- **Navigation** — 5 Items in der Hauptnavigation (kein neuer Eintrag)
- **Seed-Daten** — Docker-Entrypoint bleibt unverändert
