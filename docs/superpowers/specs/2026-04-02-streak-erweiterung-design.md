# Streak-Erweiterung Design

## Ziel

Die bestehende Streak-Funktionalität um drei Features erweitern: prozentualer Punkt-Bonus bei aktiver Streak, kostenpflichtige Streak-Wiederherstellung, und eine dedizierte Streak-Detailseite.

## Architektur

Neues `StreakState`-Modell persistiert den Streak-Zustand pro User in der Datenbank. Zentrale Streak-Logik wird in `src/lib/streak.ts` konsolidiert (ersetzt die 3 duplizierten Berechnungen). Bonus wird direkt in die gespeicherten Punkte eingerechnet, sodass das bestehende Points-System (earned - spent) unverändert bleibt.

## Tech Stack

Next.js, Prisma (SQLite), TypeScript, Tailwind CSS.

---

## 1. Datenmodell

### Neues Modell: `StreakState`

```prisma
model StreakState {
  id             String    @id @default(cuid())
  userId         String    @unique
  currentStreak  Int       @default(0)
  bestStreak     Int       @default(0)
  lastActiveAt   DateTime?
  restoreCount   Int       @default(0)
  lastRestoredAt DateTime?
  updatedAt      DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Relation: 1:1 mit User (über `userId @unique`). User-Modell bekommt ein optionales `streakState StreakState?` Feld.

### Initialisierung

Beim ersten Zugriff auf den StreakState eines Users (kein Eintrag vorhanden) wird der State einmalig aus den bestehenden `TaskCompletions` berechnet und persistiert. Kein separater Migrations-Seed nötig.

---

## 2. Bonus-Staffelung

| Streak       | Bonus | Stufen-Name      |
|-------------|-------|-------------------|
| 0–2 Tage    | +0%   | Kein Bonus        |
| 3–6 Tage    | +5%   | Warm-up           |
| 7–13 Tage   | +10%  | Feuer-Starter     |
| 14–29 Tage  | +25%  | Wochen-Star       |
| 30+ Tage    | +50%  | Monats-Marathon   |

Der Bonus wird bei Task-Completion auf die Basis-Punkte aufgerechnet und direkt in `TaskCompletion.points` gespeichert. Beispiel: Abwasch (20 Punkte) bei 7er Streak = 22 Punkte (`Math.floor(20 * 1.10)`).

---

## 3. Streak-Update-Logik

Bei jeder Task-Completion wird `StreakState` aktualisiert:

1. **Gleicher Tag wie `lastActiveAt`** — Streak bleibt gleich, Punkte mit aktuellem Bonus.
2. **Nächster Tag nach `lastActiveAt`** — `currentStreak + 1`.
3. **2+ Tage Lücke** — Streak auf 1 zurücksetzen (neuer Start).

In allen Fällen: `bestStreak = max(bestStreak, currentStreak)`, `lastActiveAt = heute`.

Die Tagesgrenze wird per UTC-Datum bestimmt (ISO-String `YYYY-MM-DD` Vergleich, konsistent mit bestehender Logik).

---

## 4. Streak-Wiederherstellung (Restore)

### Verfügbarkeit

Restore ist verfügbar wenn alle Bedingungen erfüllt sind:
- `lastActiveAt` = vorgestern (genau 1 Tag Lücke, d.h. gestern wurde keine Aufgabe erledigt)
- Heute noch kein Restore durchgeführt (`lastRestoredAt` ist nicht heute)
- User hat genug Punkte für den Restore-Preis

### Preis

Formel: `20 + (5 × currentStreak)` Punkte.

Beispiele:
- Streak 7 verloren = 55 Punkte
- Streak 14 verloren = 90 Punkte
- Streak 30 verloren = 170 Punkte

### Ablauf

1. User sieht Restore-Alert auf dem Dashboard oder der Streak-Detailseite.
2. Preis wird angezeigt.
3. Bei Bestätigung: Punkte werden als `Purchase` abgezogen (StoreItem-Typ `streak_restore`).
4. `StreakState` Update: `currentStreak` bleibt erhalten, `lastActiveAt` = gestern, `restoreCount + 1`, `lastRestoredAt = now()`.
5. User muss trotzdem heute noch eine Aufgabe erledigen, um die Streak weiterzuführen.

### Zeitfenster

Nur am direkt darauffolgenden Tag nach dem Streak-Bruch. Danach ist die Streak endgültig verloren.

---

## 5. Dashboard Streak-Widget

Das bestehende Streak-Widget in `stat-pills.tsx` wird erweitert:

- **Bonus-Anzeige**: Unter der Streak-Zahl wird der aktive Bonus angezeigt (z.B. "7 Tage · +10%").
- **Klickbar**: Das gesamte Widget verlinkt auf `/streak`.
- **Restore-Alert**: Wenn Streak gestern gebrochen wurde, erscheint ein auffälliger gelb/oranger Banner: "Deine 7-Tage-Streak ist in Gefahr! Für 55 Punkte wiederherstellen" mit Link zur Streak-Seite. Verschwindet nach Restore oder wenn der Tag vorbei ist.

---

## 6. Streak-Detailseite (`/streak`)

Neue Seite unter `src/app/(app)/streak/page.tsx`. Aufbau von oben nach unten:

1. **Header** — Aktuelle Streak-Zahl groß dargestellt mit Flammen-Emoji, aktiver Bonus-Name und Prozent.
2. **Restore-Bereich** (nur sichtbar wenn verfügbar) — Preis, Bestätigungs-Button, kurze Erklärung was passiert.
3. **Nächste Bonus-Stufe** — Fortschrittsbalken mit Text (z.B. "Noch 7 Tage bis +25% Bonus").
4. **Bonus-Staffelung** — Tabelle aller Stufen, aktive Stufe visuell hervorgehoben.
5. **Streak-Historie** — Beste Streak aller Zeiten, Anzahl genutzte Restores.
6. **Heatmap/Kalender** — Aktivitäts-Heatmap (bestehende Komponente aus dem Profil wiederverwenden).
7. **Erklärung** — Kurzer Text: "Erledige jeden Tag mindestens eine Aufgabe, um deine Streak zu halten. Bei aktiver Streak erhältst du Bonus-Punkte auf jede erledigte Aufgabe."

---

## 7. API-Endpunkte

| Endpunkt | Methode | Beschreibung |
|----------|---------|-------------|
| `/api/streak` | GET | Liefert StreakState, berechneten Bonus (Stufe + Prozent), Restore-Verfügbarkeit, Restore-Preis, Heatmap-Daten |
| `/api/streak/restore` | POST | Führt Streak-Restore durch: Punkte-Check, Purchase erstellen, StreakState aktualisieren |
| `/api/tasks/[id]/complete` | POST (ändern) | StreakState aktualisieren, Bonus-Punkte auf Basis-Punkte aufrechnen |

---

## 8. Zentrale Streak-Bibliothek (`src/lib/streak.ts`)

Konsolidiert alle Streak-Logik an einem Ort. Ersetzt die drei duplizierten Berechnungen in `achievements.ts`, `profile-stats.ts` und `api/stats/route.ts`.

Exportierte Funktionen:
- `getStreakBonus(currentStreak: number)` — Gibt `{ percent, name, level }` zurück.
- `calculateRestorePrice(currentStreak: number)` — Gibt den Restore-Preis zurück.
- `applyBonus(basePoints: number, currentStreak: number)` — Gibt Punkte mit Bonus zurück (`Math.floor`).
- `getOrCreateStreakState(userId: string)` — Holt oder initialisiert StreakState aus DB.
- `updateStreakOnCompletion(userId: string)` — Aktualisiert StreakState bei Task-Completion.
- `isRestoreAvailable(streakState: StreakState, currentPoints: number)` — Prüft Restore-Verfügbarkeit.

Die Bonus-Stufen werden als Konstante definiert:
```typescript
const STREAK_TIERS = [
  { minDays: 0,  percent: 0,  name: 'Kein Bonus' },
  { minDays: 3,  percent: 5,  name: 'Warm-up' },
  { minDays: 7,  percent: 10, name: 'Feuer-Starter' },
  { minDays: 14, percent: 25, name: 'Wochen-Star' },
  { minDays: 30, percent: 50, name: 'Monats-Marathon' },
]
```

---

## 9. Was sich NICHT ändert

- **Points-System** (earned - spent) bleibt unverändert — Bonus ist in den gespeicherten Punkten enthalten.
- **Achievement-System** bleibt unverändert — nutzt weiterhin den Streak-Wert, jetzt aus StreakState statt berechnet.
- **Store-System** bleibt unverändert — Restore ist kein Store-Artikel, sondern eigener Endpunkt.
- **Level-System** bleibt unverändert.
