#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

echo "Starte Haushalt-Quest..."

# 1. Migrationen anwenden
echo "Wende Datenbankmigrationen an..."
node_modules/.bin/prisma migrate deploy

# 2. Seed-Guard: Nur seeden wenn DB leer ist
DB_PATH=$(echo "$DATABASE_URL" | sed 's|file:||')

USER_COUNT=$(DB_PATH="$DB_PATH" node -e "
  const Database = require('better-sqlite3');
  const db = new Database(process.env.DB_PATH);
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM User').get();
    console.log(row.count);
  } catch (e) {
    console.log('0');
  }
  db.close();
")

if [ "$USER_COUNT" = "0" ]; then
  echo "Datenbank leer — seede Initialdaten..."
  node prisma/seed.js
else
  echo "Datenbank enthält $USER_COUNT User — Seed übersprungen."
fi

# 3. App starten (exec ersetzt Shell, Node wird PID 1)
echo "Starte Server..."
exec node server.js
