# Dashboard Redesign — Spec

## Ziel

Das Dashboard wird von einer einfachen Punkte-Anzeige + Feed-Liste zu einem motivierenden, informativen Hub umgebaut. Es zeigt auf einen Blick: persönlichen Fortschritt (Level, Streak), heutige Aufgaben mit Quick-Actions, einen Wochen-Vergleich mit dem Partner, und einen gruppierten Aktivitäten-Feed.

## Architektur

Die Dashboard-Seite (`src/app/(app)/page.tsx`) bleibt ein Server Component, das alle Daten per Prisma lädt und an Client Components weitergibt. Der Heute-Bereich benötigt Interaktivität (Abhaken-Button), daher wird er als eigene Client Component extrahiert. Der Feed wird ebenfalls eine Client Component (auf-/zuklappbare Gruppen).

Bestehende Komponenten `PointsHeader`, `FeedItem` und `DashboardNotifications` werden ersetzt bzw. umgebaut.

## Bereiche

### 1. Stat-Pills

Drei Karten in einer Zeile direkt unter dem Seitentitel:

| Pill | Breite | Inhalt |
|------|--------|--------|
| Streak | 1fr | Flammen-Emoji, Streak-Tage als große Zahl, Label "Streak" |
| Level-Fortschritt | 2fr | Level-Nummer + Titel, Prozentanzeige, Indigo-Gradient-Fortschrittsbalken, "X Pkt bis [nächstes Level]" |
| Punkte | 1fr | Sack-Emoji, verfügbarer Punktestand als große Zahl, Label "Punkte" |

Alle Pills: weiße Karten mit `border-slate-200`, `rounded-xl`, zentrierter Text (Streak/Punkte) bzw. linksbündig (Level).

**Streak-Berechnung:** Bereits in `src/lib/achievements.ts` als `computeStats` vorhanden (`currentStreakDays`). Wird wiederverwendet.

**Level-Fortschritt:** Aktuelles Level aus `getLevel(totalEarned)`, nächstes Level aus `LEVELS`-Array. Prozent = `(totalEarned - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)`. Bei Max-Level: 100%.

### 2. Partner-Link

Kompakte Karte direkt unter den Stat-Pills (wie bisher). Zeigt Partner-Name, Level-Titel und Achievement-Anzahl. Link zu `/profile/[partnerId]`. Visuell an das neue Card-Design angepasst (gleicher Radius, gleicher Border).

### 3. Heute-Bereich

Weiße Karte mit:
- **Header:** Links "Heute" als Überschrift, rechts grüner Badge "X/Y erledigt"
- **Liste** mit drei Zuständen:

| Zustand | Linker Rand | Hintergrund | Rechte Seite |
|---------|-------------|-------------|--------------|
| Erledigt | `border-l-green-500` | `bg-green-50` | Grünes Häkchen + Punkte (z.B. "✓ +30"), Titel durchgestrichen und grau |
| Offen | `border-l-slate-300` | `bg-slate-50` | Gefüllter Indigo-Button "Abhaken" |
| Vorschlag | `border-l-amber-400` | `bg-amber-50` | Label "Vorschlag" (kein Button) |

**Logik:**

1. **Erledigte Aufgaben:** Alle `TaskCompletion`-Einträge von heute (completedAt ≥ Beginn des heutigen Tages), mit zugehöriger Task-Info (emoji, title, points).

2. **Fällige wiederkehrende Aufgaben:** Tasks mit `isRecurring = true`, deren letzte Completion + Intervall ≤ heute. Intervall-Berechnung:
   - `daily`: letzte Completion nicht heute
   - `weekly`: letzte Completion > 7 Tage her (oder noch nie erledigt)
   - `monthly`: letzte Completion > 30 Tage her (oder noch nie erledigt)
   - Bereits heute erledigte Tasks erscheinen nicht hier (sie sind schon unter "Erledigt")

3. **Vorschläge:** 1-2 zufällige einmalige Tasks (`isRecurring = false`), die vom aktuellen User noch nie erledigt wurden. Nur angezeigt, wenn weniger als 3 fällige Aufgaben vorhanden. Vorschläge haben keinen Abhaken-Button — der User muss dafür auf die Aufgaben-Seite navigieren.

**Abhaken vom Dashboard:** Der "Abhaken"-Button bei offenen Aufgaben ruft denselben Endpunkt auf wie die Aufgaben-Seite: `POST /api/tasks/[id]/complete`. Nach Erfolg: `router.refresh()` + Toast. Achievements werden dabei automatisch geprüft (bereits implementiert im Endpunkt).

**Client Component:** `TodaySection` — erhält die aufbereiteten Listen (erledigt, offen, vorschläge) als Props vom Server Component. Interaktivität nur für die Abhaken-Buttons.

### 4. Wochenübersicht

Weiße Karte mit Überschrift "Wochenübersicht".

**Balkendiagramm (reines CSS/HTML, keine Chart-Library):**
- 7 Spalten (Mo–So)
- Pro Tag zwei nebeneinander stehende Balken: Indigo (`bg-indigo-400`) für aktuellen User, Pink (`bg-pink-400`) für Partner
- Balkenhöhe proportional zur Anzahl erledigter Aufgaben des Tages, relativ zum Maximum der Woche
- Vergangene Tage: kräftige Farben. Zukünftige Tage: `bg-slate-100` Platzhalter
- Unter den Balken: Wochentags-Labels (Mo, Di, Mi, Do, Fr, Sa, So)
- Kompakte Legende darunter: farbiges Quadrat + User-Name

**Datenquelle:** `TaskCompletion`-Einträge der aktuellen Kalenderwoche (Montag 00:00 bis Sonntag 23:59), gruppiert nach `completedAt`-Wochentag und `userId`. Gezählt wird die Anzahl Completions (nicht Punkte).

**Server Component** — keine Interaktivität nötig.

### 5. Aktivitäten-Feed (gruppiert)

Weiße Karte mit Überschrift "Aktivitäten".

**Gruppierung nach Tagen:**
- "Heute", "Gestern", "Diese Woche" (restliche Tage der aktuellen Woche), "Letzte Woche"
- Jede Gruppe: grauer Header-Streifen (`bg-slate-50`) mit Gruppentitel

**Einträge innerhalb einer Gruppe:**
- Kompakte Zeilen: Emoji, User-Name (indigo für eigenen, pink für Partner), Aufgabentitel, rechts Punkte
- Redemptions: gleicher Stil, aber rechts amber "Belohnung"-Label statt Punkte

**Auf-/Zuklapp-Logik:**
- "Heute" und "Gestern": initial ausgeklappt
- "Diese Woche" und "Letzte Woche": initial zugeklappt, Header zeigt Zusammenfassung (z.B. "5 Aufgaben, 180 Pkt")
- Klick auf Gruppen-Header togglet auf/zu

**Begrenzung:** Maximal 30 Einträge geladen (wie bisher).

**Leer-Zustand:** Bestehender Empty-State (Rakete + "Noch keine Aktivitäten") bleibt.

**Client Component:** `GroupedFeed` — erhält die Feed-Einträge als Props, gruppiert und rendert sie mit Toggle-State.

## Zu löschende / zu ersetzende Komponenten

| Datei | Aktion |
|-------|--------|
| `src/components/dashboard/points-header.tsx` | Löschen — wird durch Stat-Pills ersetzt |
| `src/components/dashboard/feed-item.tsx` | Löschen — wird durch inline-Rendering in GroupedFeed ersetzt |
| `src/components/dashboard/dashboard-notifications.tsx` | Beibehalten — unverändert |

## Neue Komponenten

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `src/components/dashboard/stat-pills.tsx` | Server | Streak, Level-Fortschritt, Punkte |
| `src/components/dashboard/today-section.tsx` | Client | Heute-Bereich mit Abhaken-Buttons |
| `src/components/dashboard/week-chart.tsx` | Server | Wochen-Balkendiagramm |
| `src/components/dashboard/grouped-feed.tsx` | Client | Gruppierter, auf-/zuklappbarer Feed |

## Daten-Anforderungen an page.tsx

Der Server Component `page.tsx` muss folgende Daten laden und aufbereiten:

1. **Stat-Pills:** `computeStats(userId)` für Streak, `getTotalEarned` + `getLevel` für Level/Punkte, Spent für Balance
2. **Partner:** Partner-User mit Level + Achievement-Count (wie bisher)
3. **Heute:** Heutige Completions + fällige wiederkehrende Tasks + Vorschläge
4. **Wochen-Chart:** Completions der aktuellen Kalenderwoche, gruppiert nach Tag und User
5. **Feed:** Letzte 30 Completions + Redemptions (wie bisher), aber zusätzlich gruppiert nach Tag

## Keine Änderungen an

- API-Endpunkte (Completion-Endpunkt wird wiederverwendet)
- Prisma-Schema
- Navigation
- DashboardNotifications
