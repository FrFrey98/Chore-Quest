-- CreateTable
CREATE TABLE "_TaskAssignments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TaskAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TaskAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "installPromptDismissed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("createdAt", "id", "installPromptDismissed", "name", "notificationsEnabled", "pin") SELECT "createdAt", "id", "installPromptDismissed", "name", "notificationsEnabled", "pin" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_TaskAssignments_AB_unique" ON "_TaskAssignments"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskAssignments_B_index" ON "_TaskAssignments"("B");

-- Set all existing users to admin for backwards compatibility
UPDATE "User" SET "role" = 'admin' WHERE "role" = 'member';
