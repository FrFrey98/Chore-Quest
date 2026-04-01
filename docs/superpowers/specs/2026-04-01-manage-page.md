# Verwaltungsseite (Aufgaben & Belohnungen bearbeiten/löschen) — Spec

## Ziel

Eine dedizierte Verwaltungsseite (`/manage`), erreichbar über "Verwalten"-Links auf `/tasks` und `/store`. Bietet Inline-Editing und Soft-Delete/Archivierung für alle Aufgaben und Belohnungen. Beide Partner haben vollen Zugriff auf alle Einträge.

## Navigation

- Auf `/tasks`: Textlink "Verwalten →" unter der Aufgabenliste, verlinkt auf `/manage?tab=tasks`
- Auf `/store`: Textlink "Verwalten →" unter der Belohnungsliste, verlinkt auf `/manage?tab=rewards`
- Kein eigener Eintrag in der Hauptnavigation

## URL-State

Tab wird als Query-Parameter gespeichert:
- `/manage?tab=tasks` (Default)
- `/manage?tab=rewards`

## Architektur

- `src/app/(app)/manage/page.tsx` — Server Component. Lädt alle Tasks (inklusive archivierte, wartende, abgelehnte) und alle StoreItems (inklusive inaktive) per Prisma. Gibt serialisierte Daten als Props an die Client Component weiter.
- `src/app/(app)/manage/manage-client.tsx` — Client Component (`'use client'`). Verwaltet Tab-Wechsel, Inline-Editing-State, Bestätigungsdialoge. Nutzt `useRouter` + `useSearchParams` für URL-State-Synchronisation.

### Datenladung

Der Server Component lädt:
- Alle `Task`-Einträge (alle Status) inklusive `Category`-Relation (id, name, emoji)
- Alle `Category`-Einträge (für das Kategorie-Dropdown im Edit-Modus)
- Alle `StoreItem`-Einträge (aktive und inaktive)

### Berechtigungen

Beide Partner können alle Aufgaben und Belohnungen bearbeiten und löschen. Keine Einschränkung auf den Ersteller.

## Seitenaufbau

### Gemeinsamer Header

- Seitentitel: "Verwalten"
- Tab-Leiste: "Aufgaben" | "Belohnungen" als Pill-Buttons (gleicher Stil wie `/stats`)

### Aufgaben-Tab

#### Statusgruppen

Tasks werden nach Status gruppiert und in folgender Reihenfolge angezeigt:

| Status | Darstellung | Badge |
|--------|-------------|-------|
| `active` | Normal | — |
| `pending_approval` | Leicht ausgegraut | "Wartend" |
| `rejected` | Ausgegraut | "Abgelehnt" |
| `archived` | Ausgegraut | "Archiviert" |

#### Zeilen-Layout (Anzeigemodus)

Jede Task-Zeile zeigt:
- Links: Emoji + Titel + Punkte-Badge + Kategorie-Badge + Status-Badge (wenn nicht aktiv)
- Rechts: "Bearbeiten"-Button (Stift-Icon) + "Archivieren"-Button (Papierkorb-Icon)
- Archivierte Tasks: statt "Archivieren" ein "Wiederherstellen"-Button

#### Zeilen-Layout (Edit-Modus)

Klick auf "Bearbeiten" schaltet die Zeile in den Edit-Modus. Nur eine Zeile kann gleichzeitig im Edit-Modus sein.

Editierbare Felder:
- Titel → `<Input>` (bestehende UI-Komponente)
- Emoji → `<EmojiPicker>` (bestehende Komponente)
- Punkte → `<Input type="number">`
- Kategorie → `<select>` mit allen Kategorien
- Wiederkehrend → Checkbox + Intervall-Select (täglich/wöchentlich/monatlich)
- Status → `<select>` (aktiv / archiviert)

Buttons: "Speichern" (✓ Häkchen) und "Abbrechen" (✕ Kreuz)

#### Archivieren

Klick auf "Archivieren" öffnet einen Bestätigungsdialog: "Aufgabe '[Titel]' wirklich archivieren?"
- "Ja, archivieren" → `DELETE /api/tasks/[id]` (setzt Status auf "archived")
- "Abbrechen" → Dialog schließen

#### Wiederherstellen

Klick auf "Wiederherstellen" bei archivierten Tasks setzt den Status zurück auf "active" via `PATCH /api/tasks/[id]` mit `{ status: "active" }`.

### Belohnungen-Tab

#### Statusgruppen

StoreItems werden nach isActive gruppiert:

| Status | Darstellung | Badge |
|--------|-------------|-------|
| `isActive: true` | Normal | — |
| `isActive: false` | Ausgegraut | "Inaktiv" |

#### Zeilen-Layout (Anzeigemodus)

Jede Belohnungs-Zeile zeigt:
- Links: Emoji + Titel + Beschreibung (gekürzt, max. 50 Zeichen) + Punktekosten-Badge + Status-Badge (wenn inaktiv)
- Rechts: "Bearbeiten"-Button (Stift-Icon) + "Archivieren"-Button (Papierkorb-Icon)
- Inaktive Items: statt "Archivieren" ein "Reaktivieren"-Button

#### Zeilen-Layout (Edit-Modus)

Editierbare Felder:
- Titel → `<Input>`
- Emoji → `<EmojiPicker>`
- Beschreibung → `<Input>`
- Punktekosten → `<Input type="number">`
- isActive → Checkbox/Toggle

Buttons: "Speichern" (✓) und "Abbrechen" (✕)

#### Archivieren

Bestätigungsdialog: "Belohnung '[Titel]' wirklich deaktivieren?"
- "Ja, deaktivieren" → `DELETE /api/store/[id]` (setzt isActive auf false)
- "Abbrechen" → Dialog schließen

#### Reaktivieren

Klick auf "Reaktivieren" setzt `isActive: true` via `PATCH /api/store/[id]`.

## API-Änderungen

### Bestehend: `PATCH /api/tasks/[id]`

Erweitern um `status`-Feld. Akzeptierte Werte: `"active"`, `"archived"`. Wird ein anderer Wert übergeben, wird das `status`-Feld ignoriert (restliche Felder werden trotzdem aktualisiert).

### Bestehend: `DELETE /api/tasks/[id]`

Keine Änderung — setzt bereits `status: "archived"` (Soft-Delete).

### Neu: `PATCH /api/store/[id]`

Akzeptierte Felder: `title`, `emoji`, `description`, `pointCost`, `isActive`.
- Validierung analog zu `POST /api/store`
- 404 wenn StoreItem nicht gefunden

### Neu: `DELETE /api/store/[id]`

Soft-Delete: setzt `isActive: false`.
- 404 wenn StoreItem nicht gefunden
- Gibt 204 zurück

## Neue Dateien

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `src/app/(app)/manage/page.tsx` | Server | Datenladung per Prisma (alle Tasks + StoreItems + Categories) |
| `src/app/(app)/manage/manage-client.tsx` | Client | Tab-Wechsel, Listen, Inline-Editing-State |
| `src/components/manage/task-row.tsx` | Client | Aufgaben-Zeile mit Anzeige-/Edit-Modus |
| `src/components/manage/reward-row.tsx` | Client | Belohnungs-Zeile mit Anzeige-/Edit-Modus |
| `src/components/manage/confirm-dialog.tsx` | Client | Wiederverwendbarer Bestätigungsdialog |
| `src/app/api/store/[id]/route.ts` | API | PATCH + DELETE für StoreItems |

## Zu modifizierende Dateien

| Datei | Änderung |
|-------|----------|
| `src/app/(app)/tasks/page.tsx` | "Verwalten →"-Link einfügen |
| `src/app/(app)/store/page.tsx` | "Verwalten →"-Link einfügen |
| `src/app/api/tasks/[id]/route.ts` | PATCH um `status`-Feld erweitern |

## Keine Änderungen an

- Prisma-Schema (alle benötigten Felder existieren bereits)
- Bestehende Komponenten (TaskCard, StoreItemCard, CreateTaskDialog, CreateItemDialog)
- Navigation-Komponente (kein neuer Nav-Eintrag)
- Bestehende API-Endpunkte (außer der `status`-Erweiterung bei PATCH tasks)
