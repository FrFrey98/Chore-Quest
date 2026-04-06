# User Management: Family Members with Roles

## Overview

Erweitert Haushalt-Quest um ein Familien-User-Management mit drei Rollen (Admin/Member/Child). Das System verwendet ein einfaches `role`-Feld auf dem User-Model mit einer zentralen Permission-Map für die Berechtigungslogik.

**Ziele:**
- Beliebig viele Familienmitglieder mit differenzierten Rechten
- Abwärtskompatibilität zum bestehenden Live-System (bestehende User werden Admins)
- Angepasster Onboarding-Wizard und nachträgliche Konfiguration über Einstellungen

---

## 1. Datenmodell

### 1.1 User-Model Erweiterung

Neues Enum-Feld `role` auf dem User-Model:

```prisma
enum Role {
  admin
  member
  child
}

model User {
  // ... bestehende Felder ...
  role  Role @default(member)
}
```

### 1.2 Task-Model Erweiterung

Neue many-to-many Relation für optionale Zuweisung:

```prisma
model Task {
  // ... bestehende Felder ...
  assignedUsers  User[] @relation("TaskAssignments")
}

model User {
  // ... bestehende Felder ...
  assignedTasks  Task[] @relation("TaskAssignments")
}
```

### 1.3 Migration

- `role`-Feld hinzufügen mit Default `member`
- Implizite many-to-many Tabelle `_TaskAssignments` wird von Prisma erstellt
- Datenmigration: alle bestehenden User auf `role: admin` setzen

### 1.4 Session-Erweiterung

`role` wird in die NextAuth JWT-Session aufgenommen:

```typescript
// next-auth.d.ts
interface Session {
  user: DefaultSession['user'] & {
    id: string
    role: 'admin' | 'member' | 'child'
  }
}
```

---

## 2. Zentrale Permission-Map

Datei: `src/lib/permissions.ts`

### 2.1 Permission-Definitionen

| Permission           | admin | member | child |
|----------------------|-------|--------|-------|
| `manageUsers`        | yes   | no     | no    |
| `editSettings`       | yes   | no     | no    |
| `manageStore`        | yes   | no     | no    |
| `manageAchievements` | yes   | no     | no    |
| `manageCategories`   | yes   | no     | no    |
| `createTasks`        | yes   | yes    | no    |
| `approveTasks`       | yes   | yes    | no    |
| `completeTasks`      | yes   | yes    | yes   |
| `useStore`           | yes   | yes    | yes   |
| `viewAllProfiles`    | yes   | yes    | yes   |

### 2.2 Helper-Funktionen

```typescript
function hasPermission(role: Role, permission: Permission): boolean
function requirePermission(session: Session, permission: Permission): void // throws 403
function requireRole(session: Session, ...roles: Role[]): void // throws 403
```

---

## 3. Onboarding / Setup-Wizard

Der bestehende Setup-Flow (2 User gleichzeitig) wird zu einem mehrstufigen Wizard:

### Schritt 1 — Admin anlegen
- Name + PIN für den ersten Admin
- Automatisch `role: admin`

### Schritt 2 — Familienmitglieder hinzufügen
- Beliebig viele Mitglieder nacheinander
- Pro Mitglied: Name, PIN, Rollenwahl (Admin/Member/Child)
- Mindestens 1 weiteres Mitglied erforderlich
- "Fertig"-Button um zum nächsten Schritt zu gehen

### Schritt 3 — Seed-Daten
- Default-Kategorien, Store-Items, Achievements werden geseeded
- Streak-States für alle angelegten User erstellt

### Nach Abschluss
- Redirect zum Login

### Abwärtskompatibilität
- Wenn bereits User in der DB existieren, überspringt `/setup` zum Login (wie bisher)
- Die Prisma-Migration setzt bestehende User auf `role: admin`

---

## 4. Einstellungen — User-Verwaltung

### 4.1 Users-Tab (nur Admin)

Funktionen:
- **Mitglieder-Liste**: Name, Rolle, Erstellungsdatum
- **Mitglied hinzufügen**: Name, PIN, Rolle
- **Rolle ändern**: Dropdown (Admin/Member/Child)
- **PIN ändern**: Admin kann PIN jedes Mitglieds zurücksetzen
- **Mitglied entfernen**: Bestätigungsdialog; letzter Admin kann nicht entfernt werden

### 4.2 Tab-Sichtbarkeit nach Rolle

Settings ist nur für Admins zugänglich (siehe Navigation 8.2). Alle Tabs sind Admin-only:

| Tab             | Admin |
|-----------------|-------|
| Users           | yes   |
| Tasks           | yes   |
| Categories      | yes   |
| Achievements    | yes   |
| Store           | yes   |
| Streak          | yes   |
| Level           | yes   |
| Bonus           | yes   |
| Notifications   | yes   |

### 4.3 Eigene PIN ändern

Jeder User kann seine eigene PIN über die Profilseite ändern — unabhängig von den Settings und der Rolle.

### 4.4 Notification-Einstellungen

Push-Notification-Einstellungen (an/aus, Subscriptions) werden auf die Profilseite verschoben, damit alle Rollen Zugriff haben — nicht nur Admins über Settings.

### 4.5 Mitglied entfernen

Beim Entfernen eines Mitglieds werden die historischen Daten (TaskCompletions, Purchases, Achievements) beibehalten, um Stats und Leaderboards nicht zu verfälschen. Der User wird aus der DB gelöscht, aber referenzierte Daten bleiben über die bestehenden Relationen erhalten (Prisma `onDelete` entsprechend konfigurieren). Der entfernte User kann sich nicht mehr einloggen.

---

## 5. API-Absicherung

### 5.1 Neue API-Routes

| Route                      | Methode | Berechtigung                        |
|----------------------------|---------|-------------------------------------|
| `/api/users`               | POST    | `manageUsers`                       |
| `/api/users/[id]`          | DELETE  | `manageUsers` + nicht letzter Admin |
| `/api/users/[id]/role`     | PUT     | `manageUsers`                       |
| `/api/users/[id]/pin`      | PUT     | Admin: jede PIN; sonst nur eigene   |

### 5.2 Bestehende Routes absichern

| Route-Bereich              | Schutz                                              |
|----------------------------|------------------------------------------------------|
| `POST /api/setup`          | Nur wenn keine User existieren (wie bisher)          |
| `POST/PUT/DELETE /api/settings/*` | `requirePermission('editSettings')`            |
| `POST /api/tasks`          | `requirePermission('createTasks')`                   |
| `POST /api/approvals/*`    | `requirePermission('approveTasks')` + nicht Ersteller |
| `POST /api/tasks/[id]/complete` | `requirePermission('completeTasks')`            |
| `POST /api/store/purchase` | `requirePermission('useStore')`                      |
| `GET /api/users`, `GET /api/stats` | Alle authentifizierten User                   |

---

## 6. Teamwork-Bonus & Task-Zuweisung

### 6.1 Skalierender Teamwork-Bonus

- Beim Abschließen eines Tasks: mehrere Beteiligte auswählbar
- Formel: `bonusPercent = teamworkBonusPercent * (anzahlBeteiligte - 1)`
- Beispiel: `teamworkBonusPercent = 10%`, 3 Beteiligte -> jeder bekommt 20% Bonus
- Nutzt die bestehende `sharedCompletions`-Relation (bereits many-to-many)

### 6.2 Optionale Task-Zuweisung

- Neue many-to-many Relation `assignedUsers` auf Task
- Wenn leer: Task ist für alle sichtbar (wie bisher)
- Wenn gesetzt: Task wird bei zugewiesenen Usern hervorgehoben (Badge/Icon), bleibt aber für alle erledbar
- Zuweisung bei Task-Erstellung und -Bearbeitung (Multi-Select)
- Nur Admins und Members können Zuweisungen setzen

---

## 7. Task-Erstellung & -Bearbeitung

### 7.1 CreateTaskDialog erweitern

Neues Feld:
- **Zugewiesene Mitglieder**: Multi-Select aller Familienmitglieder (optional, leer = für alle)

Nur sichtbar für Admins und Members (Children können keine Tasks erstellen).

### 7.2 TasksTab in Settings vereinheitlichen

Der TasksTab in den Settings wird um die fehlenden Felder `scheduleDays` und `scheduleTime` erweitert, sodass beide UIs (CreateTaskDialog und Settings-TasksTab) funktional identisch sind.

### 7.3 TaskRow (Bearbeitung) erweitern

`assignedUsers`-Feld auch in der Task-Bearbeitung (TaskRow-Komponente) verfügbar.

---

## 8. Login & Navigation

### 8.1 Login-Seite

- Bleibt beim bestehenden Prinzip: User-Auswahl + PIN
- Rolle wird dezent unter dem Namen als Badge angezeigt (z.B. "Admin", "Kind")

### 8.2 Navigation

Items werden basierend auf `session.user.role` ein-/ausgeblendet:

| Bereich       | Admin | Member | Child |
|---------------|-------|--------|-------|
| Dashboard     | yes   | yes    | yes   |
| Tasks         | yes   | yes    | yes   |
| Approvals     | yes   | yes    | no    |
| Store         | yes   | yes    | yes   |
| Streak        | yes   | yes    | yes   |
| Achievements  | yes   | yes    | yes   |
| Stats         | yes   | yes    | yes   |
| Profil        | yes   | yes    | yes   |
| Manage        | yes   | yes    | no    |
| Settings      | yes   | no     | no    |

Nicht-berechtigte Items tauchen nicht in der Navigation auf. Server-seitig trotzdem per API-Layer abgesichert.

### 8.3 Approval-Seite

- Children werden aus der Approver-Liste ausgeblendet
- Jeder Admin/Member kann genehmigen (außer Ersteller des Tasks)

### 8.4 Profil-Seite

- Jeder User kann eigenes Profil bearbeiten (Name, PIN ändern)
- Alle Profile für alle sichtbar (Stats, Level, Achievements)
