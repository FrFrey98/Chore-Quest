-- CreateTable
CREATE TABLE "StreakState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME,
    "restoreCount" INTEGER NOT NULL DEFAULT 0,
    "lastRestoredAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StreakState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StreakState_userId_key" ON "StreakState"("userId");
