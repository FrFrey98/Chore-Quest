# Backup/Restore: Export full database as JSON

## Zusammenfassung

Admin-only Feature zum Exportieren aller Datenbank-Daten als JSON-Datei und Wiederherstellen aus einem Backup. Integriert als Abschnitt in der bestehenden Settings-Seite. Vor jedem Restore wird automatisch ein Backup der aktuellen Daten erstellt.

## API-Endpunkte

### `GET /api/settings/backup` — Export

- Berechtigung: `editSettings` (nur Admins)
- Liest alle 13 Tabellen über Prisma aus
- Response-Header: `Content-Disposition: attachment; filename="haushalt-quest-backup-YYYY-MM-DD.json"`
- Gibt strukturiertes JSON zurück (siehe Format unten)

### `POST /api/settings/backup/restore` — Import

- Berechtigung: `editSettings` (nur Admins)
- Nimmt JSON-Datei als Request-Body entgegen
- Validiert Grundstruktur (Version, erwartete Tabellen-Keys, Arrays)
- Erstellt automatisches Pre-Restore-Backup unter `/app/data/backups/pre-restore-YYYY-MM-DD-HHmmss.json`
- Maximal 5 Pre-Restore-Backups behalten, älteste werden gelöscht
- Führt Restore in einer Prisma-Transaktion durch
- Next.js Body-Size-Limit auf 5 MB für diesen Endpunkt

## JSON-Format

```json
{
  "meta": {
    "version": 1,
    "exportedAt": "2026-04-07T12:00:00Z",
    "appVersion": "1.0.0"
  },
  "data": {
    "users": [],
    "categories": [],
    "tasks": [],
    "taskCompletions": [],
    "taskApprovals": [],
    "storeItems": [],
    "purchases": [],
    "achievements": [],
    "userAchievements": [],
    "streakStates": [],
    "taskScheduleOverrides": [],
    "appConfigs": [],
    "pushSubscriptions": []
  }
}
```

## Restore-Logik

### Reihenfolge beim Löschen (umgekehrte Abhängigkeit)

1. PushSubscription, UserAchievement, TaskScheduleOverride
2. TaskCompletion, TaskApproval, Purchase, StreakState
3. Task, StoreItem, Achievement
4. Category, AppConfig
5. User

### Reihenfolge beim Einfügen (Abhängigkeiten zuerst)

1. User, Category, AppConfig
2. Achievement, StoreItem
3. Task (referenziert User + Category)
4. TaskCompletion, TaskApproval, Purchase, StreakState
5. UserAchievement, TaskScheduleOverride, PushSubscription

Alles in einer Prisma-Transaktion — schlägt ein Schritt fehl, wird nichts geändert.

### Validierung

- `meta.version` muss vorhanden und kompatibel sein
- Alle erwarteten Tabellen-Keys in `data` müssen existieren
- Grundlegende Typprüfung (Arrays erwartet)
- Keine tiefe Feld-Validierung — Prisma wirft bei ungültigen Daten einen Fehler, der die Transaktion zurückrollt

### Pre-Restore-Backup

- Gleiche Export-Logik wie der GET-Endpunkt
- Gespeichert unter `/app/data/backups/pre-restore-YYYY-MM-DD-HHmmss.json`
- Maximal 5 Backups, älteste werden gelöscht
- Schlägt das Pre-Restore-Backup fehl, wird der Restore abgebrochen

## UI

### Platzierung

Neuer Abschnitt "Datensicherung" in der bestehenden Settings-Seite, unterhalb der bisherigen Einstellungen.

### Elemente

- Abschnitts-Überschrift: "Datensicherung"
- Beschreibung: "Exportiere alle Daten als JSON-Datei oder stelle sie aus einem Backup wieder her."
- **Button "Backup exportieren"** — löst Download aus via `GET /api/settings/backup`
- **Button "Backup wiederherstellen"** — öffnet Datei-Dialog (nur `.json`), danach Bestätigungsdialog

### Bestätigungsdialog

- Warnung: "Alle aktuellen Daten werden überschrieben. Ein automatisches Backup wird vorher erstellt."
- Info: Exportdatum aus `meta.exportedAt` der hochgeladenen Datei
- Buttons: "Abbrechen" / "Wiederherstellen"

### Feedback

- Loading-States auf beiden Buttons während Ausführung
- Erfolgs-Toast nach Export: "Backup heruntergeladen"
- Erfolgs-Toast nach Restore: "Daten wiederhergestellt. Seite wird neu geladen."
- Fehler-Toast bei Problemen mit Fehlermeldung
- Nach erfolgreichem Restore: automatischer Seiten-Reload

### Stil

Bestehende shadcn/ui-Komponenten (Button, Dialog, Toast). Kein neues Styling.

## Edge Cases & Sicherheit

- **Session nach Restore:** Falls der eingeloggte User im Import nicht existiert, leitet das bestehende Middleware automatisch zu `/login` weiter. Kein spezielles Handling nötig.
- **Datenmengen:** Bei einer Haushalts-App mit wenigen Usern < 1 MB. Keine Streaming-/Chunking-Logik nötig.
- **Gehashte PINs:** Werden vollständig exportiert (bcrypt-Hashes, kein Klartext). Ermöglicht nahtlosen Login nach Restore.

## Nicht im Scope

- Kein geplantes/automatisches Backup (Cron)
- Keine Versionsmigration (Schema v1 → v2)
- Keine selektive Wiederherstellung einzelner Tabellen
- Kein UI zum Verwalten der Pre-Restore-Backups auf dem Server
