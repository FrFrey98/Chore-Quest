#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

echo "Starting TidyQuest..."

# Apply database migrations
echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy

# Check if the database has any users
DB_PATH=$(echo "$DATABASE_URL" | sed 's|file:||')
USER_COUNT=$(DB_PATH="$DB_PATH" node -e "
  const Database = require('better-sqlite3');
  const db = new Database(process.env.DB_PATH);
  try { const r = db.prepare('SELECT COUNT(*) as c FROM User').get(); console.log(r.c); }
  catch (e) { console.log('0'); }
  db.close();
")

if [ "$USER_COUNT" = "0" ]; then
  echo "No users found — setup wizard will handle initial configuration."
fi

# Start the application (exec replaces shell, node becomes PID 1)
echo "Starting server..."
exec node server.js
