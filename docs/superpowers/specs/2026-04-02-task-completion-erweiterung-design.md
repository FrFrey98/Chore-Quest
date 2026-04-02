# Task-Completion-Erweiterung Design

## Ziel

Die bestehende Task-Completion-Funktionalität um zwei Features erweitern: gemeinsames Erledigen von Aufgaben (mit Teamwork-Bonus) und mehrfaches Erledigen am selben Tag (mit konfigurierbarem Limit).

## Architektur

Minimale Schema-Erweiterung: Task bekommt `allowMultiple` + `dailyLimit`, TaskCompletion bekommt `withUserId`. Bei gemeinsamer Erledigung werden zwei eigenständige TaskCompletion-Einträge erstellt (einer pro User). Boni (Streak + Teamwork) werden additiv auf die Basis-Punkte angewendet und direkt in `TaskCompletion.points` gespeichert.

## Tech Stack

Next.js, Prisma (SQLite), TypeScript, Tailwind CSS.

---

## 1. Datenmodell-Änderungen

### Task-Modell — zwei neue Felder

```prisma
model Task {
  // ... bestehende Felder ...
  allowMultiple  Boolean  @default(false)
  dailyLimit     Int?     // nur relevant wenn allowMultiple = true, z.B. 3
}
```

- `allowMultiple = false` → Verhalten wie bisher (1x pro Tag, verschwindet nach Completion)
- `allowMultiple = true` + `dailyLimit = 3` → Kann 3x pro Tag erledigt werden
- Bestehende Tasks bekommen automatisch `allowMultiple = false` und `dailyLimit = null` durch Defaults

### TaskCompletion-Modell — ein neues Feld

```prisma
model TaskCompletion {
  // ... bestehende Felder ...
  withUserId  String?
  withUser    User?  @relation("sharedCompletions", fields: [withUserId], references: [id])
}
```

- `withUserId = null` → Normal allein erledigt
- `withUserId = "user-2"` → Zusammen mit dem Partner erledigt

Bei einer gemeinsamen Erledigung werden **zwei TaskCompletion-Einträge** erstellt:
- Completion 1: `userId = Franz, withUserId = Michelle`
- Completion 2: `userId = Michelle, withUserId = Franz`

Beide Einträge sind eigenständig — jeder User hat seinen eigenen Punktestand, Streak-Update und Achievement-Check.

### User-Modell — neue Relation

```prisma
model User {
  // ... bestehende Felder ...
  sharedCompletions  TaskCompletion[]  @relation("sharedCompletions")
}
```

---

## 2. Bonus-Berechnung

### Teamwork-Bonus

Konstante: `TEAMWORK_BONUS_PERCENT = 10`

### Berechnungsformel

Alle Boni (Streak + Teamwork) werden additiv auf die Basis-Punkte angewendet:

```
finalPoints = Math.floor(basePoints * (1 + streakPercent/100 + teamworkPercent/100))
```

Beispiele:
- Einkaufen (35 Pkt), allein, 7er Streak (+10%): `Math.floor(35 * 1.10)` = 38 Pkt
- Einkaufen (35 Pkt), zusammen, 7er Streak (+10% + 10%): `Math.floor(35 * 1.20)` = 42 Pkt
- Abwasch (20 Pkt), zusammen, kein Streak (0% + 10%): `Math.floor(20 * 1.10)` = 22 Pkt

### `applyBonus`-Erweiterung

Die bestehende Funktion in `src/lib/streak.ts` wird um einen optionalen `isShared`-Parameter erweitert:

```typescript
export function applyBonus(basePoints: number, currentStreak: number, isShared: boolean = false): number
```

---

## 3. Completion-Logik

### Gemeinsam Erledigen

Wenn ein User beim Abhaken "Zusammen mit [Partner]" aktiviert:

1. **Streak-Update für beide User** — `updateStreakOnCompletion(userId)` + `updateStreakOnCompletion(partnerId)`
2. **Bonus-Berechnung pro User individuell** — Jeder bekommt seinen eigenen Streak-Bonus + 10% Teamwork-Bonus
3. **Zwei TaskCompletions erstellen** — je eine pro User, mit `withUserId` auf den jeweils anderen zeigend
4. **Achievement-Check für beide** — `checkAndUnlockAchievements(userId)` + `checkAndUnlockAchievements(partnerId)`

Der auslösende User sieht seinen eigenen Toast. Der Partner sieht die Completion im Feed beim nächsten Dashboard-Refresh.

### Mehrfach Erledigen

Wenn ein Task `allowMultiple = true` hat:

1. **Completion-Zähler prüfen** — Zähle heutige Completions dieses Users für diesen Task
2. **Gegen `dailyLimit` prüfen** — Wenn Limit erreicht, Completion ablehnen mit Fehlermeldung
3. **Ansonsten normal abwickeln** — Punkte (inkl. Streak-Bonus), Streak-Update, Achievements

### Recurring-Logik bei Mehrfach-Tasks

Bei `allowMultiple = true` wird `nextDueAt` **nicht** nach der ersten Completion gesetzt, sondern erst wenn das Tageslimit erreicht ist. Am nächsten Tag wird gemäß `recurringInterval` zurückgesetzt.

### Undo bei gemeinsamer Erledigung

Wenn eine Completion ein `withUserId` hat, werden beim Undo **beide Completions** rückgängig gemacht (die eigene + die des Partners).

---

## 4. UI-Änderungen

### Completion-Flow — "Zusammen erledigt" Toggle

Im `TodaySection` / `TaskCard` wird neben dem "Abhaken"-Button ein Toggle/Chip angezeigt:

- **Standard**: "Abhaken" → erledigt nur für den aktuellen User
- **Toggle aktiv**: "Zusammen mit Michelle 👫" → erledigt für beide

Der Toggle ist ein einfacher Button/Chip der vor dem Abhaken aktiviert werden kann. Kein separater Dialog oder Popup — alles inline im Task-Card.

### Completion-Toast bei Teamwork

Statt `"+35 Pkt für Einkaufen"` zeigt der Toast:
`"+38 Pkt für Einkaufen 👫 (inkl. Teamwork-Bonus)"`

### Mehrfach-Tasks im Dashboard

- Tasks mit `allowMultiple = true` zeigen einen Zähler: **"1/3 heute"**
- Der Zähler erscheint als kleines Badge neben den Punkten
- Nach Erreichen des Limits: Task wird ausgegraut mit "Limit erreicht"
- Am nächsten Tag (bei daily) wird der Zähler zurückgesetzt

### Feed-Anzeige bei gemeinsamer Erledigung

Im Activity-Feed werden gemeinsame Completions zusammengefasst:
- Statt zwei separate Einträge → **"Franz & Michelle haben zusammen Einkaufen erledigt 👫"**
- Erkennung über `withUserId` — wenn zwei Completions für denselben Task mit passendem `withUserId` existieren, als Teamwork-Eintrag rendern

### Task-Verwaltung (Tasks-Seite)

Beim Erstellen/Bearbeiten eines Tasks zwei neue optionale Felder:
- **"Mehrfach pro Tag erledigbar"** — Toggle (setzt `allowMultiple`)
- **"Tägliches Limit"** — Zahleneingabe, nur sichtbar wenn Toggle aktiv (setzt `dailyLimit`)

---

## 5. API-Änderungen

| Endpunkt | Methode | Änderung |
|----------|---------|----------|
| `/api/tasks/[id]/complete` | POST | Neuer optionaler Body-Parameter `withUserId`. Wenn gesetzt: zwei Completions erstellen, Teamwork-Bonus berechnen, Streak+Achievements für beide User. Bei `allowMultiple`-Tasks: Tageslimit prüfen. |
| `/api/tasks` | POST | Neue optionale Felder `allowMultiple`, `dailyLimit` beim Erstellen |
| `/api/tasks/[id]` | PUT | Neue optionale Felder `allowMultiple`, `dailyLimit` beim Bearbeiten |
| `/api/tasks/[id]/complete/undo` | POST | Wenn Completion ein `withUserId` hat: beide Completions rückgängig machen |

---

## 6. Streak-Bibliothek (`src/lib/streak.ts`)

Änderungen:

- Neue Konstante: `TEAMWORK_BONUS_PERCENT = 10`
- `applyBonus(basePoints, currentStreak, isShared?)` — addiert Teamwork-Bonus wenn `isShared = true`

---

## 7. Was sich NICHT ändert

- **StreakState-Modell** — bleibt unverändert, wird nur für beide User aufgerufen
- **Achievement-System** — bleibt unverändert, wird nur für beide User geprüft
- **Points-System** (earned - spent) — bleibt unverändert
- **Store/Level-System** — bleibt unverändert
- **Streak-Restore** — bleibt unverändert
- **Bestehende Tasks und Completions** — bleiben vollständig erhalten (neue Felder haben Defaults)
