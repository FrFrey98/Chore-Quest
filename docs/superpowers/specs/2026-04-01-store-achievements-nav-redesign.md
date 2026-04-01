# Store-Redesign, Achievements & Navigation — Design Spec

## Zusammenfassung

Drei zusammenhängende Änderungen an Haushalt-Quest:

1. **Trophäen raus aus dem Store** — Store wird rein für einlösbare Belohnungen. Trophäen werden zu automatischen Achievements.
2. **Achievements-System** — Neue Seite mit Trophy-Shelf/Vitrine. Achievements werden automatisch freigeschaltet bei Anzahl-, Streak- und Punkte-Meilensteinen.
3. **Navigation & Seitenstruktur** — 5 Tabs (Home, Aufgaben, Store, Erfolge, Profil). Profil vereint Stats + Einstellungen. Freigaben als globaler Banner.
4. **Visuelle Überarbeitung** — Eindeutige Buttons, klare Farbgebung, unmissverständliche Labels.

---

## 0. Visuelle Gestaltung — Grundregeln

Bei allen Änderungen (und bestehenden Komponenten) gelten folgende Regeln:

### Buttons müssen als Buttons erkennbar sein

- Interaktive Elemente brauchen einen klar sichtbaren Rahmen, Hintergrund oder beides
- Kein "Ghost-Button" für primäre Aktionen — primäre Aktionen bekommen einen gefüllten, farbigen Button
- Sekundäre Aktionen dürfen outline/ghost sein, müssen aber einen sichtbaren Border haben

### Labels müssen eindeutig sein

- Button-Texte beschreiben die **Aktion**, nicht den **Zustand**
- Schlecht: "Erledigt" (klingt wie "ist bereits erledigt")
- Gut: "Erledigen" oder "Abhaken" oder ein Checkmark-Icon
- Gleiches Prinzip gilt für "Einlösen", "Kaufen", "Freigeben" etc.

### Farbgebung mit Bedeutung

- **Indigo/Blau:** Primäre Aktionen (Erledigen, Kaufen)
- **Grün:** Erfolg/Bestätigung (Achievement freigeschaltet, Kauf bestätigt)
- **Amber/Orange:** Ausstehend/Wartet (Pending Rewards, offene Freigaben)
- **Rot:** Destruktiv/Fehler (Löschen, Fehlermeldungen)
- **Slate/Grau:** Deaktiviert, sekundär, gesperrte Achievements

### Bestehende Probleme die mitbehoben werden

- **Task-Card:** Button "Erledigt" → umbenennen zu "Abhaken" oder Checkmark-Icon, mit sichtbarem gefülltem Button-Stil
- **Store-Item-Card:** Kaufen-Button prüfen auf Eindeutigkeit und Sichtbarkeit

---

## 1. Navigation

### Mobile Bottom-Bar (5 Tabs)

| Tab | Icon | Route |
|-----|------|-------|
| Home | Home | `/` |
| Aufgaben | CheckSquare | `/tasks` |
| Store | ShoppingBag | `/store` |
| Erfolge | Trophy | `/achievements` |
| Profil | User | `/profile` |

### Desktop-Sidebar

Gleiche 5 Items wie Mobile, vertikal in der Sidebar.

### Freigaben-Banner

- Globaler Banner oben auf **jeder** Seite (im Layout, nicht pro Seite)
- Erscheint nur wenn `approvalCount > 0`
- Zeigt: "X Freigaben offen" + Link zu `/approvals`
- `/approvals`-Seite bleibt bestehen, verliert nur den Nav-Tab
- Kompakt, dezent (z.B. Indigo-Hintergrund, kleine Schrift)

### Entfernte Routen

- `/admin` — Funktionalität wandert in Profil-Seite unter "Einstellungen"
- `/stats` — Funktionalität wandert in Profil-Seite unter "Statistiken"
- Mobile Top-Bar mit Settings-Icon entfällt (wird durch Profil-Tab ersetzt)

---

## 2. Store (vereinfacht)

### Was sich ändert

- **Trophäen-Sektion komplett entfernt** — kein `type: 'trophy'` mehr im Store
- **CreateItemDialog** erstellt nur noch `real_reward`-Items (Type-Dropdown entfällt)
- **Selbst-Einlösung** statt Partner-Redemption

### Neuer Kauf- und Einlöse-Flow

1. Nutzer kauft Belohnung → Punkte werden sofort abgezogen → `Purchase`-Eintrag erstellt
2. Gekaufte Belohnung erscheint in "Meine Belohnungen"-Sektion auf der Store-Seite
3. Nutzer löst selbst ein, wann er möchte → setzt `redeemedAt`
4. Bei Einlösung: Partner wird benachrichtigt (Toast beim nächsten Seitenaufruf + Activity-Eintrag auf Home)

### API-Änderungen

**`POST /api/store/[id]/redeem`:**
- Prüfung wird invertiert: `purchase.userId === session.user.id` (Selbst-Einlösung)
- Alte Prüfung `userId !== session.user.id` entfällt
- Trophy-Block bleibt (Trophäen können ohnehin nicht mehr gekauft werden, aber als Safety-Check)

**`POST /api/store` (Create):**
- `type`-Feld wird immer auf `'real_reward'` gesetzt, kein Dropdown mehr im Frontend

### Store-Seite Layout

1. Header: Titel + Punktestand + CreateItemDialog-Button
2. "Meine Belohnungen" — Gekaufte, noch nicht eingelöste Items mit "Einlösen"-Button
3. "Belohnungen" — Alle verfügbaren Items zum Kaufen

### Partner-Benachrichtigung bei Einlösung

- **Activity-Eintrag:** Das `Purchase`-Modell hat bereits `redeemedAt`. Die Home-Seite zeigt kürzlich eingelöste Purchases des Partners an (z.B. `redeemedAt` in den letzten 7 Tagen) als "Michelle hat 'Pizza-Abend aussuchen' eingelöst".
- **Toast:** Neues Feld `notifiedAt` (DateTime, nullable) auf dem `Purchase`-Modell. Beim Seitenaufruf prüft ein API-Call ob es Purchases gibt, die `redeemedAt IS NOT NULL` und `notifiedAt IS NULL` haben und dem Partner gehören. Falls ja: Toast anzeigen + `notifiedAt` setzen. So wird der Toast genau einmal angezeigt.

---

## 3. Achievements-System

### Datenmodell

**Neues Modell `Achievement`:**
- `id` (cuid)
- `title` (String) — z.B. "Putz-Profi"
- `description` (String) — z.B. "50 Aufgaben erledigt"
- `emoji` (String)
- `conditionType` (String) — `'task_count'`, `'category_count'`, `'streak_days'`, `'streak_weeks'`, `'total_points'`, `'level'`
- `conditionValue` (Int) — Schwellwert, z.B. 50
- `conditionMeta` (String, optional) — z.B. Category-ID für kategorie-spezifische Achievements
- `sortOrder` (Int) — Reihenfolge in der Vitrine

**Neues Modell `UserAchievement`:**
- `id` (cuid)
- `userId` (String, FK → User)
- `achievementId` (String, FK → Achievement)
- `unlockedAt` (DateTime)
- Unique Constraint auf `[userId, achievementId]`

### Bedingungstypen

| conditionType | conditionValue | conditionMeta | Beschreibung |
|---------------|---------------|---------------|--------------|
| `task_count` | 50 | null | 50 Aufgaben insgesamt erledigt |
| `category_count` | 10 | `categoryId` | 10 Aufgaben in einer bestimmten Kategorie |
| `streak_days` | 7 | null | 7 Tage in Folge mindestens eine Aufgabe |
| `streak_weeks` | 4 | null | 4 Wochen hintereinander alle wöchentlichen Aufgaben |
| `total_points` | 1000 | null | 1000 Punkte insgesamt verdient |
| `level` | 4 | null | Level 4 erreicht |

### Prüf-Logik

- Wird serverseitig ausgelöst bei **jeder Task-Completion** (`POST /api/tasks/[id]/complete`)
- Nach dem Erstellen der `TaskCompletion`: alle noch nicht freigeschalteten Achievements des Nutzers laden, Bedingungen prüfen, neue `UserAchievement`-Einträge erstellen
- Bei neu freigeschalteten Achievements: Info in der API-Response zurückgeben, damit der Client einen Toast anzeigen kann
- Streak-Berechnung basiert auf `TaskCompletion.completedAt`-Daten

### Achievements-Seite (`/achievements`)

**Trophy-Shelf / Vitrine:**
- Emoji-Grid (4 Spalten) mit allen Achievements
- Freigeschaltete: farbig mit Name
- Gesperrte: ausgegraut, gestrichelt umrandet
- Klick auf ein Achievement zeigt Details (Beschreibung, Fortschritt, Datum der Freischaltung)

**Nächste Ziele:**
- Unterhalb der Vitrine
- Die 3-4 Achievements mit dem höchsten Fortschritt (prozentual)
- Jedes mit Fortschrittsbalken und Text (z.B. "7/10 — fast geschafft!")

### Seed-Achievements

Initiale Achievements im Seed-Script (Beispiele):

| Emoji | Titel | Typ | Wert |
|-------|-------|-----|------|
| ⭐ | Erste Schritte | task_count | 1 |
| 🧹 | Putz-Profi | task_count | 50 |
| 💯 | Centurion | task_count | 100 |
| 🔥 | Feuer-Starter | streak_days | 7 |
| 🏆 | Wochen-Star | streak_days | 14 |
| ⚡ | Monats-Marathon | streak_days | 30 |
| 💰 | Punktesammler | total_points | 500 |
| 💎 | Diamant-Sammler | total_points | 2000 |
| 🎓 | Haushalts-Held | level | 4 |
| 👑 | Wohn-Meister | level | 6 |

---

## 4. Profil-Seite (`/profile` und `/profile/[userId]`)

### Eigenes Profil (`/profile`)

Drei Sektionen:

1. **Header:** Name, Level-Anzeige, Punkte (verdient/verfügbar), kompakte Achievements-Vorschau ("5/12 freigeschaltet" als Mini-Grid oder Text, Link zur vollen Achievements-Seite)
2. **Statistiken:** Erledigte Aufgaben (gesamt + diese Woche), aktueller Streak, Lieblingskategorie, Punkte-Verlauf — migriert von der aktuellen `/stats`-Seite
3. **Einstellungen:** Store-Items verwalten, Tasks verwalten, sonstige Admin-Funktionen — migriert von der aktuellen `/admin`-Seite

### Partner-Profil (`/profile/[userId]`)

- Gleiche Seite, aber read-only
- Zeigt Header + Statistiken + Achievements-Vorschau
- **Kein** Einstellungen-Bereich
- Erreichbar über Partner-Sektion auf dem Dashboard

---

## 5. Home-Seite / Dashboard

### Änderungen

- **Partner-Profil-Link:** Sektion die den Partner zeigt (Name, Level, Achievement-Count) — klickbar, öffnet `/profile/[partnerId]`
- **Activity-Feed:** Erweitert um eingelöste Belohnungen des Partners ("Michelle hat 'Pizza-Abend' eingelöst")
- **Freigaben-Banner:** Wird im Layout gerendert (nicht auf Home), erscheint global auf jeder Seite

### Was bleibt

Das Dashboard behält seine bestehende Funktionalität (Tagesübersicht, letzte Aktivitäten, Punktestand).

---

## 6. Migration / Aufräumen

- `StoreItem`-Einträge mit `type: 'trophy'` aus dem Seed entfernen
- Bestehende Trophy-Purchases in der DB werden zu historischen Einträgen (kein aktiver Schaden, aber nicht mehr angezeigt)
- `StoreItem.type`-Feld kann bestehen bleiben (alle neuen Items sind `'real_reward'`), oder komplett entfernt werden da nur noch ein Typ existiert
- `/admin`-Route und `/stats`-Route entfernen, Redirects optional
- Navigation-Komponente komplett überarbeiten (5 Tabs statt aktuell 5 + Admin)
- `PendingRewards`-Komponente wird zu "Meine Belohnungen" umgebaut (Selbst-Einlösung)
