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
else
  echo "Datenbank enthält $USER_COUNT User — prüfe fehlende Stammdaten..."
fi

# INSERT OR IGNORE stellt sicher, dass nur fehlende Einträge eingefügt werden
DB_PATH="$DB_PATH" node -e "
    const Database = require('better-sqlite3');
    const bcrypt = require('bcryptjs');
    const db = new Database(process.env.DB_PATH);

    const pin1 = bcrypt.hashSync('1234', 10);
    const pin2 = bcrypt.hashSync('5678', 10);
    const now = new Date().toISOString();

    const insertUser = db.prepare('INSERT OR IGNORE INTO User (id, name, pin, createdAt) VALUES (?, ?, ?, ?)');
    insertUser.run('user-1', 'Franz', pin1, now);
    insertUser.run('user-2', 'Michelle', pin2, now);

    const insertCat = db.prepare('INSERT OR IGNORE INTO Category (id, name, emoji) VALUES (?, ?, ?)');
    [['cat-kitchen','Küche','🍳'],['cat-bath','Bad','🚿'],['cat-general','Allgemein','🏠'],['cat-laundry','Wäsche','👕'],['cat-outdoor','Draußen','🌿']].forEach(c => insertCat.run(...c));

    const insertTask = db.prepare('INSERT OR IGNORE INTO Task (id, title, emoji, points, categoryId, isRecurring, recurringInterval, status, createdById, approvedById, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    [
      ['task-dishes','Abwasch machen','🍽️',20,'cat-kitchen',1,'daily','active','user-1','user-2',now],
      ['task-cook','Kochen','👨‍🍳',40,'cat-kitchen',1,'daily','active','user-1','user-2',now],
      ['task-wipe-kitchen','Arbeitsflächen abwischen','🧽',15,'cat-kitchen',1,'daily','active','user-1','user-2',now],
      ['task-fridge','Kühlschrank aufräumen','🧊',30,'cat-kitchen',1,'weekly','active','user-1','user-2',now],
      ['task-bathroom-clean','Bad putzen','🧹',40,'cat-bath',1,'weekly','active','user-1','user-2',now],
      ['task-toilet','Toilette reinigen','🚽',25,'cat-bath',1,'weekly','active','user-1','user-2',now],
      ['task-mirror','Spiegel putzen','🪞',10,'cat-bath',1,'weekly','active','user-1','user-2',now],
      ['task-vacuum','Staubsaugen','🧹',30,'cat-general',1,'weekly','active','user-1','user-2',now],
      ['task-mop','Wischen','🪣',30,'cat-general',1,'weekly','active','user-1','user-2',now],
      ['task-dust','Staubwischen','🪶',20,'cat-general',1,'weekly','active','user-1','user-2',now],
      ['task-trash','Müll rausbringen','🗑️',10,'cat-general',1,'daily','active','user-1','user-2',now],
      ['task-laundry-wash','Wäsche waschen','🫧',20,'cat-laundry',1,'weekly','active','user-1','user-2',now],
      ['task-laundry-hang','Wäsche aufhängen','👕',15,'cat-laundry',1,'weekly','active','user-1','user-2',now],
      ['task-laundry-fold','Wäsche zusammenlegen','🧺',15,'cat-laundry',1,'weekly','active','user-1','user-2',now],
      ['task-plants','Pflanzen gießen','🪴',10,'cat-outdoor',1,'daily','active','user-1','user-2',now],
      ['task-groceries','Einkaufen','🛒',35,'cat-general',1,'weekly','active','user-1','user-2',now]
    ].forEach(t => insertTask.run(...t));

    const insertItem = db.prepare('INSERT OR IGNORE INTO StoreItem (id, title, description, emoji, pointCost, type, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)');
    [
      ['item-reward-pizza','Pizza-Abend aussuchen','Du darfst bestimmen was bestellt wird','🍕',200,'real_reward',1],
      ['item-reward-movie','Film-Abend aussuchen','Du wählst den Film','🎬',150,'real_reward',1],
      ['item-reward-sleep','Ausschlafen','Kein Wecker, keine Pflichten am Morgen','😴',250,'real_reward',1],
      ['item-reward-massage','Massage (15 Min)','15 Minuten Schulter-/Rückenmassage','💆',350,'real_reward',1],
      ['item-reward-dishfree','Abwasch-frei (1 Woche)','Eine Woche lang kein Abwasch','✨',500,'real_reward',1]
    ].forEach(i => insertItem.run(...i));

    const insertAch = db.prepare('INSERT OR IGNORE INTO Achievement (id, title, description, emoji, conditionType, conditionValue, conditionMeta, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    [
      ['ach-first-task','Erste Schritte','Erste Aufgabe erledigt','⭐','task_count',1,null,1],
      ['ach-task-10','Fleißig','10 Aufgaben erledigt','💪','task_count',10,null,2],
      ['ach-task-50','Putz-Profi','50 Aufgaben erledigt','🧹','task_count',50,null,3],
      ['ach-task-100','Centurion','100 Aufgaben erledigt','💯','task_count',100,null,4],
      ['ach-kitchen-20','Koch-Star','20 Küchen-Aufgaben erledigt','👨‍🍳','category_count',20,'cat-kitchen',5],
      ['ach-bath-10','Glanz & Gloria','10 Bad-Aufgaben erledigt','✨','category_count',10,'cat-bath',6],
      ['ach-streak-7','Feuer-Starter','7 Tage in Folge eine Aufgabe erledigt','🔥','streak_days',7,null,7],
      ['ach-streak-14','Wochen-Star','14 Tage in Folge eine Aufgabe erledigt','🏆','streak_days',14,null,8],
      ['ach-streak-30','Monats-Marathon','30 Tage in Folge eine Aufgabe erledigt','⚡','streak_days',30,null,9],
      ['ach-points-500','Punktesammler','500 Punkte verdient','💰','total_points',500,null,10],
      ['ach-points-2000','Diamant-Sammler','2000 Punkte verdient','💎','total_points',2000,null,11],
      ['ach-level-4','Haushalts-Held','Level 4 erreicht','🎓','level',4,null,12],
      ['ach-level-6','Wohn-Meister','Level 6 erreicht','👑','level',6,null,13]
    ].forEach(a => insertAch.run(...a));

    db.close();
    console.log('Stammdaten geprüft: 2 User, 5 Kategorien, 16 Tasks, 5 Belohnungen, 13 Achievements');
  "

# 3. App starten (exec ersetzt Shell, Node wird PID 1)
echo "Starte Server..."
exec node server.js
