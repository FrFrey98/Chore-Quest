-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringInterval" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_approval',
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextDueAt" DATETIME,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "dailyLimit" INTEGER,
    CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("approvedById", "categoryId", "createdAt", "createdById", "emoji", "id", "isRecurring", "nextDueAt", "points", "recurringInterval", "status", "title") SELECT "approvedById", "categoryId", "createdAt", "createdById", "emoji", "id", "isRecurring", "nextDueAt", "points", "recurringInterval", "status", "title" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_TaskCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withUserId" TEXT,
    CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskCompletion_withUserId_fkey" FOREIGN KEY ("withUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TaskCompletion" ("completedAt", "id", "points", "taskId", "userId") SELECT "completedAt", "id", "points", "taskId", "userId" FROM "TaskCompletion";
DROP TABLE "TaskCompletion";
ALTER TABLE "new_TaskCompletion" RENAME TO "TaskCompletion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
