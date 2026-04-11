-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "installPromptDismissed" BOOLEAN NOT NULL DEFAULT false,
    "telegramChatId" TEXT,
    "ntfyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "vacationStart" DATETIME,
    "vacationEnd" DATETIME
);
INSERT INTO "new_User" ("createdAt", "id", "installPromptDismissed", "locale", "name", "notificationsEnabled", "pin", "role", "vacationEnd", "vacationStart") SELECT "createdAt", "id", "installPromptDismissed", "locale", "name", "notificationsEnabled", "pin", "role", "vacationEnd", "vacationStart" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
