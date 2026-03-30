# Haushalt-Quest — Design Spec

**Datum:** 2026-03-30
**Status:** Genehmigt

## Übersicht

Haushalt-Quest ist eine gamifizierte Haushaltsverwaltung für zwei Personen im Heimnetz. Alltägliche Aufgaben bringen Punkte, Punkte werden im Store gegen virtuelle Trophäen oder selbst definierte echte Belohnungen eingetauscht. Neue Aufgaben benötigen die Zustimmung beider Personen.

---

## Tech Stack

| Komponente | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Datenbank | SQLite via Prisma ORM |
| Authentifizierung | NextAuth.js (PIN-basiert) |
| UI | Tailwind CSS + shadcn/ui |
| Diagramme | Recharts |
| Deployment | Docker + Docker Compose auf Raspberry Pi |

Die Datenbank ist eine einzelne SQLite-Datei, die als Docker-Volume gemountet wird. Kein separater Datenbankserver erforderlich.

---

## Authentifizierung

- Zwei fest definierte Nutzer (z.B. Franz und Partner)
- Beim Öffnen der App: Nutzerauswahl + PIN-Eingabe
- PIN wird gehasht in der Datenbank gespeichert (bcrypt)
- Session via NextAuth.js, läuft im lokalen Netz ohne HTTPS

---

## Seiten & Navigation

| Route | Beschreibung |
|---|---|
| `/login` | Nutzerauswahl + PIN-Eingabe |
| `/` | Dashboard: Aktivitäts-Feed + Punktestände |
| `/tasks` | Aufgaben nach Kategorien, mit Erledigungsbutton |
| `/store` | Store: Trophäen-Sektion + Belohnungs-Sektion |
| `/stats` | Statistiken: Tab "Meine Stats" + Tab "Vergleich" |
| `/approvals` | Offene Genehmigungsanfragen für neue Aufgaben |
| `/admin` | Verwaltung: Aufgaben, Kategorien, Store-Artikel |

Navigation als Bottom-Bar auf Mobilgeräten, als Sidebar auf Desktop.

---

## Features

### Dashboard (`/`)

- Aktivitäts-Feed: chronologische Liste aller Erledigungen (wer hat was wann getan, mit Punktzahl)
- Punktestand beider Spieler kompakt oben angezeigt
- Badge wenn offene Genehmigungsanfragen warten

### Aufgaben (`/tasks`)

- Aufgaben gruppiert nach Kategorien (z.B. Küche, Bad, Allgemein — frei definierbar)
- Zwei Typen:
  - **Einmalig:** erscheinen bis zur Erledigung, danach archiviert
  - **Wiederkehrend:** tauchen nach Ablauf des Intervalls automatisch wieder auf (täglich / wöchentlich / monatlich)
- Jede Aufgabe hat: Titel, Emoji, Kategorie, Punktwert, Typ (einmalig/wiederkehrend), Intervall
- "Erledigt"-Button → Punkte werden sofort gutgeschrieben, Eintrag im Feed
- Neue Aufgabe anlegen: startet den Genehmigungsprozess

### Genehmigungsprozess

- Person A legt neue Aufgabe an → Status `pending_approval`
- Person B erhält Badge in der Navigation
- Auf `/approvals`: Aufgabe ansehen, genehmigen oder ablehnen
- Genehmigt → Status `active`, Aufgabe erscheint in der Liste
- Abgelehnt → Status `rejected`, Person A sieht Benachrichtigung im Feed
- Verhindert, dass jemand einfache Aufgaben mit überhöhter Punktzahl anlegt

### Punkte-Logik

- Punkte werden bei jeder `TaskCompletion` gutgeschrieben
- Kauf im Store zieht Punkte ab
- Gesamtpunktestand = Summe aller Erledigungen − Summe aller Käufe
- Punkte können nicht negativ werden (Store-Kauf wird blockiert wenn nicht ausreichend Punkte vorhanden)

### Store (`/store`)

**Trophäen-Sektion:**
- Virtuelle Abzeichen (z.B. "Putz-Profi", "Wochen-Star", "Früh-Aufsteher")
- Einmalig pro Person kaufbar (bei Kauf wird geprüft ob bereits eine `Purchase` für diesen Artikel und Nutzer existiert), dauerhaft im Profil sichtbar
- Werden im Admin-Bereich angelegt mit Emoji, Titel, Beschreibung und Punktpreis

**Belohnungs-Sektion:**
- Selbst definierte echte Belohnungen (z.B. "Pizza-Abend aussuchen", "Kino-Film aussuchen", "Abwasch-frei für eine Woche")
- Mehrfach kaufbar
- Nach dem Kauf: Status "ausstehend" (noch nicht eingelöst) → Partner markiert als "eingelöst"
- Offene Einlösungen sichtbar im Store und im Feed

### Statistiken (`/stats`)

Zeitraum-Filter auf beiden Tabs: Woche / Monat / Jahr / Custom (Datepicker von/bis)

**Tab "Meine Stats":**
- Kennzahlen-Kacheln: Aufgaben erledigt, Punkte gesammelt, Punkte ausgegeben, Netto-Punkte
- Aktuelle Tages-Streak + längste jemals erreichte Streak (ein Tag zählt, wenn mindestens eine Aufgabe erledigt wurde)
- Aktivitäts-Heatmap (GitHub-Stil): ein Kästchen pro Tag, Farbintensität = Punkteanzahl
- Top-5-Aufgaben: am häufigsten erledigte Aufgaben im gewählten Zeitraum
- Level-Verlauf: Zeitstrahl wann welches Level (Gesamtpunkte aller Zeit) erreicht wurde
- Belohnungs-Historie: Tabelle aller Store-Käufe mit Datum und Einlösestatus

**Tab "Vergleich":**
- Balkendiagramm: Punkte nebeneinander (Farbe je Person) — Granularität passt sich dem Zeitraum-Filter an: Woche → täglich, Monat → wöchentlich, Jahr → monatlich
- Aufgabenverteilung: Tortendiagramm nach Kategorien — wer hat wie viele Aufgaben in welchem Bereich erledigt
- Monatstabelle: Punkte, erledigte Aufgaben, eingelöste Belohnungen pro Person
- "Haushalts-Champion": prominente Anzeige der Person mit mehr Punkten im gewählten Zeitraum (humorvoller Titel)

### Admin (`/admin`)

- Aufgaben erstellen, bearbeiten, archivieren (beide Nutzer können das)
- Kategorien erstellen und umbenennen
- Store-Artikel (Trophäen + Belohnungen) erstellen, bearbeiten, deaktivieren
- PIN einer Person ändern

---

## Datenmodell

```prisma
model User {
  id          String   @id @default(cuid())
  name        String
  pin         String   // bcrypt hash
  createdAt   DateTime @default(now())

  completions  TaskCompletion[]
  purchases    Purchase[]
  createdTasks Task[]           @relation("CreatedBy")
  approvedTasks Task[]          @relation("ApprovedBy")
  approvals    TaskApproval[]
}

model Category {
  id    String @id @default(cuid())
  name  String
  emoji String
  tasks Task[]
}

model Task {
  id               String    @id @default(cuid())
  title            String
  emoji            String
  points           Int
  isRecurring      Boolean   @default(false)
  recurringInterval String?  // "daily" | "weekly" | "monthly"
  status           String    @default("pending_approval")
                             // pending_approval | active | archived | rejected
  categoryId       String
  createdById      String
  approvedById     String?
  createdAt        DateTime  @default(now())
  nextDueAt        DateTime?

  category     Category         @relation(fields: [categoryId], references: [id])
  createdBy    User             @relation("CreatedBy", fields: [createdById], references: [id])
  approvedBy   User?            @relation("ApprovedBy", fields: [approvedById], references: [id])
  completions  TaskCompletion[]
  approval     TaskApproval?
}

model TaskApproval {
  id            String   @id @default(cuid())
  taskId        String   @unique
  requestedById String
  status        String   @default("pending") // pending | approved | rejected
  createdAt     DateTime @default(now())

  task          Task @relation(fields: [taskId], references: [id])
  requestedBy   User @relation(fields: [requestedById], references: [id])
}

model TaskCompletion {
  id          String   @id @default(cuid())
  taskId      String
  userId      String
  points      Int
  completedAt DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id])
  user User @relation(fields: [userId], references: [id])
}

model StoreItem {
  id          String   @id @default(cuid())
  title       String
  description String
  emoji       String
  pointCost   Int
  type        String   // "trophy" | "real_reward"
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  purchases Purchase[]
}

model Purchase {
  id          String    @id @default(cuid())
  itemId      String
  userId      String
  pointsSpent Int
  purchasedAt DateTime  @default(now())
  redeemedAt  DateTime? // null = noch nicht eingelöst

  item StoreItem @relation(fields: [itemId], references: [id])
  user User      @relation(fields: [userId], references: [id])
}
```

---

## Deployment

```yaml
# docker-compose.yml
services:
  app:
    image: haushalt-quest:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data  # SQLite-Datei persistent
    environment:
      - DATABASE_URL=file:/app/data/haushalts.db
      - NEXTAUTH_SECRET=<secret>
      - NEXTAUTH_URL=http://<raspberry-pi-ip>:3000
    restart: unless-stopped
```

Update-Prozess: `docker build`, `docker-compose up -d`. Daten bleiben im Volume erhalten.

---

## Level-System

Basierend auf kumulativ verdienten Punkten aller Zeiten — Store-Käufe reduzieren das Level **nicht**. Das bedeutet: `User.level` wird aus der Summe aller `TaskCompletion.points` berechnet, nicht aus dem aktuellen Punktestand.

| Level | Punkte | Titel |
|---|---|---|
| 1 | 0 | Haushaltslehrling |
| 2 | 200 | Ordnungs-Fan |
| 3 | 500 | Putz-Profi |
| 4 | 1.000 | Haushalts-Held |
| 5 | 2.000 | Hygiene-Legende |
| 6 | 4.000 | Wohn-Meister |

---

## Offene Entscheidungen (bei Implementierung klären)

- Benachrichtigungen bei offenen Genehmigungen: Browser-Push, oder nur Badge in der Nav?
- Sollen Trophäen einmalig oder mehrfach kaufbar sein?
- Soll es eine "Rückgängig"-Funktion für versehentlich erledigte Aufgaben geben (z.B. 5-Minuten-Fenster)?
