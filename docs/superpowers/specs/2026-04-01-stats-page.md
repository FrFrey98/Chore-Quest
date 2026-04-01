# Statistik-Seite — Spec

## Ziel

Eine dedizierte Statistik-Seite (`/stats`), erreichbar über einen Link am WeekChart des Dashboards. Sie bietet historische Datenvisualisierungen mit flexiblem Datumsbereich, aufgeteilt in zwei Tabs: "Persönlich" (eigene Daten) und "Vergleich" (beide Partner gegenübergestellt). Alle Charts können nach einer spezifischen Aufgabe gefiltert werden (im Vergleich-Tab), und die Y-Achse des Aktivitäts-Verlaufs ist zwischen Aufgaben-Anzahl und Punkten umschaltbar.

## Navigation

Ein expliziter Textlink "Alle Statistiken →" unter dem WeekChart auf dem Dashboard (`src/app/(app)/page.tsx`) verlinkt auf `/stats`. Der WeekChart selbst wird nicht klickbar.

## URL-State

Tab und Datumsbereich werden als Query-Parameter gespeichert:
- `/stats?tab=personal&from=2026-03-01&to=2026-04-01`
- `/stats?tab=comparison&from=2026-03-01&to=2026-04-01`

Defaults: `tab=personal`, `from` = heute minus 30 Tage, `to` = heute.

## Architektur

- `src/app/(app)/stats/page.tsx` — Server Component. Lädt Daten per Prisma basierend auf `from`/`to` Query-Parametern. Gibt aufbereitete Daten als Props an die Client Component weiter.
- `src/app/(app)/stats/stats-client.tsx` — Client Component (`'use client'`). Verwaltet Tab-Wechsel, Datums-Picker, Aufgaben-Filter, Y-Achsen-Toggle. Nutzt `useRouter` + `useSearchParams` für URL-State-Synchronisation. Bei Tab- oder Datumswechsel wird die URL aktualisiert und `router.push()` ausgelöst, sodass der Server Component neue Daten lädt.

### Datenladung

Der Server Component lädt alle `TaskCompletion`-Einträge im gewählten Zeitraum (`completedAt >= from AND completedAt <= to`) inklusive zugehöriger `Task` (id, title, emoji, points, categoryId) und `User` (id, name) Relationen. Zusätzlich werden alle aktiven Tasks geladen (für das Filter-Dropdown) und alle User.

Für die Heatmap im Vergleich-Tab werden Completions beider User geladen. Im Persönlich-Tab nur die des eingeloggten Users.

Die Aufbereitung der Rohdaten in Chart-spezifische Formate geschieht in Pure Functions in `src/lib/stats.ts`, aufgerufen vom Server Component.

### Aufgaben-Filter

Client-seitig. Die vollständigen Daten werden vom Server geladen. Der Filter filtert im Client nach `taskId`. Das ist performant genug für eine 2-Personen-App mit überschaubarem Datenvolumen und vermeidet zusätzliche Server-Roundtrips.

Der Filter wirkt auf **alle Charts** — Scoreboard, Aktivitäts-Verlauf, Kategorie-Verteilung, Top-Aufgaben und Heatmap.

## Seitenaufbau

### Gemeinsamer Header (beide Tabs)

- Seitentitel: "Statistiken"
- Tab-Leiste: "Persönlich" | "Vergleich" als Pill-Buttons
- Datums-Picker: Zwei `<input type="date">`-Felder (Von / Bis) nebeneinander

### Persönlich-Tab

Layout: 2-Spalten Dashboard-Grid. Breitere Charts (`grid-column: 1 / -1`) gehen über volle Breite.

#### Reihe 1 — Zusammenfassungs-Karten (volle Breite)

3er-Grid innerhalb einer weißen Karte (`border-slate-200`, `rounded-xl`):

| Karte | Inhalt |
|-------|--------|
| Erledigte Aufgaben | Gesamtzahl der Completions im Zeitraum, große Zahl |
| Verdiente Punkte | Summe der Punkte im Zeitraum, große Zahl |
| Durchschnitt/Tag | Aufgaben ÷ Anzahl Tage im Zeitraum, auf eine Dezimalstelle gerundet |

#### Reihe 2 — Aktivitäts-Verlauf (volle Breite)

Weiße Karte mit:
- **Header:** "Aktivitäts-Verlauf" links, rechts kleiner Toggle "Aufgaben | Punkte"
- **Chart:** Recharts `LineChart`. X-Achse: Tage. Bei Zeitraum > 60 Tage: automatisch nach Wochen aggregiert. Y-Achse: je nach Toggle Aufgaben-Anzahl oder Punkte. Indigo-Linie (`#818cf8`) mit Dots. Recharts `Tooltip` bei Hover zeigt Datum + Wert.
- **Aggregation bei Wochen:** Montag als Wochen-Start, Label "KW X" auf X-Achse.

#### Reihe 3 — Kategorie-Verteilung (linke Spalte) + Top-Aufgaben (rechte Spalte)

**Kategorie-Verteilung:**
- Wiederverwendung von `CategoryPieChart` (`src/components/stats/category-pie-chart.tsx`), angepasst für Single-User-Daten
- Recharts `PieChart` mit Legende darunter (Kategorie-Emoji + Name + Anzahl)
- Farbpalette: bestehende 5er-Palette (Indigo, Pink, Amber, Grün, Blau)

**Top-Aufgaben:**
- Rangliste der 5 am häufigsten erledigten Aufgaben
- Pro Zeile: Emoji + Titel + horizontaler Fortschrittsbalken (relativ zum Maximum) + Anzahl
- Balkenfarbe: Indigo

#### Reihe 4 — Heatmap (volle Breite)

- Wiederverwendung von `Heatmap` (`src/components/stats/heatmap.tsx`), erweitert für dynamischen Zeitraum
- Aktuell zeigt die Heatmap fest 26 Wochen. Anpassung: Anzahl der Spalten wird aus dem Zeitraum berechnet (Anzahl Kalenderwochen zwischen `from` und `to`)
- Zeilen: Mo–So (7 Zeilen). Spalten: Kalenderwochen im Zeitraum
- Farbskala: bestehende Indigo-Abstufungen (0 Punkte → grau, <50 → hell, <150 → mittel, <300 → kräftig, 300+ → dunkel)
- Daten: Punkte pro Tag (`YYYY-MM-DD` → Punkte), wie bestehende `computeProfileStats`

### Vergleich-Tab

Gleiches Grid-Layout. Der Aufgaben-Filter erscheint zusätzlich.

#### Reihe 1 — Scoreboard (volle Breite)

Weiße Karte mit zwei Spalten:

| Links (Indigo) | Mitte | Rechts (Pink) |
|-----------------|-------|----------------|
| User-Name | "vs." | Partner-Name |
| X Aufgaben | | Y Aufgaben |
| X Punkte | | Y Punkte |

Wer mehr Aufgaben hat, bekommt ein Kronen-Emoji (👑) neben dem Namen. Bei Gleichstand: kein Akzent.

#### Reihe 2 — Aufgaben-Filter + Aktivitäts-Verlauf (volle Breite)

Weiße Karte mit:
- **Filter-Zeile oben:** Dropdown-Select mit "Alle Aufgaben" als Default + alle aktiven Tasks (Emoji + Titel). Bei Auswahl: alle Charts auf der Seite filtern sich auf Completions dieser Aufgabe.
- **Toggle:** "Aufgaben | Punkte" rechts neben dem Filter
- **Chart:** Recharts `BarChart` mit `stackId`. Zwei Serien: User (Indigo `#818cf8`) und Partner (Pink `#f472b6`). Gestapelt. Gleiche X-Achsen-Logik wie im Persönlich-Tab (Tage, bei >60 Tagen Wochen).

#### Reihe 3 — Kategorie-Verteilung (linke Spalte) + Top-Aufgaben (rechte Spalte)

**Kategorie-Verteilung:**
- Zwei PieCharts nebeneinander (oder übereinander bei schmaler Spalte): einer pro Partner
- Gleiche Farbpalette, User-Name als Label über jedem Chart

**Top-Aufgaben:**
- Zwei Ranglisten untereinander: "Franz Top 5" und "Michelle Top 5"
- Gleicher Stil wie im Persönlich-Tab, aber Indigo-Balken für User, Pink-Balken für Partner

#### Reihe 4 — Heatmaps (volle Breite)

Zwei Heatmaps untereinander:
- Oben: User-Heatmap mit Name als Label
- Unten: Partner-Heatmap mit Name als Label
- Identische Dimensionen und Farbskala für direkte Vergleichbarkeit
- Bei aktivem Aufgaben-Filter: nur Completions der gefilterten Aufgabe

## Neue Dateien

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `src/app/(app)/stats/page.tsx` | Server | Datenladung per Prisma, Query-Param-Parsing |
| `src/app/(app)/stats/stats-client.tsx` | Client | Tab-Wechsel, Datums-Picker, Filter, Y-Toggle |
| `src/lib/stats.ts` | Shared | Pure Helper-Funktionen für Datenaufbereitung |
| `src/components/stats/activity-chart.tsx` | Client | Linien- oder Balkendiagramm (Recharts) |
| `src/components/stats/scoreboard.tsx` | Server | Vergleichs-Karte User vs. Partner |
| `src/components/stats/task-filter.tsx` | Client | Dropdown für Aufgaben-Filter |
| `src/components/stats/summary-cards.tsx` | Server | Drei Stat-Karten (Aufgaben, Punkte, Durchschnitt) |

## Zu modifizierende Dateien

| Datei | Änderung |
|-------|----------|
| `src/app/(app)/page.tsx` | "Alle Statistiken →" Link unter WeekChart einfügen |
| `src/components/stats/heatmap.tsx` | Dynamischen Zeitraum unterstützen (nicht mehr fest 26 Wochen) |
| `src/components/stats/category-pie-chart.tsx` | Eventuell anpassen für Single-User-Daten (aktuell Multi-User) |

## Wiederverwendete Komponenten

| Datei | Nutzung |
|-------|---------|
| `src/components/stats/heatmap.tsx` | Heatmap in beiden Tabs (erweitert) |
| `src/components/stats/category-pie-chart.tsx` | Kategorie-Verteilung (angepasst) |

## Helper-Funktionen in `src/lib/stats.ts`

| Funktion | Input | Output |
|----------|-------|--------|
| `groupByDay(completions, userId?)` | Completions-Array, optionaler userId-Filter | `{date: string, count: number, points: number}[]` |
| `groupByWeek(completions, userId?)` | Completions-Array, optionaler userId-Filter | `{week: string, count: number, points: number}[]` |
| `groupByCategory(completions, categories, userId?)` | Completions + Kategorien | `{categoryId: string, name: string, emoji: string, count: number}[]` |
| `topTasks(completions, limit?)` | Completions, default limit=5 | `{taskId: string, title: string, emoji: string, count: number}[]` |
| `buildHeatmap(completions)` | Completions-Array | `Record<string, number>` (YYYY-MM-DD → Punkte) |
| `buildScoreboard(completions, users)` | Completions + User-Array | `{userId: string, name: string, taskCount: number, points: number}[]` |

## Keine Änderungen an

- Prisma-Schema (alle benötigten Daten sind bereits im Schema)
- API-Endpunkte (Daten werden direkt per Prisma im Server Component geladen)
- Navigation/Layout (kein neuer Nav-Eintrag, Zugang nur über Dashboard-Link)
- Bestehende Dashboard-Komponenten (außer dem Link-Zusatz in page.tsx)
