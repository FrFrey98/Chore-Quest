-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleDe" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionDe" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "bonusPoints" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "taskId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionDe" TEXT NOT NULL,
    CONSTRAINT "QuestStep_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestStep_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "currentStepOrder" INTEGER NOT NULL DEFAULT 1,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserQuestStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userQuestId" TEXT NOT NULL,
    "questStepId" TEXT NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "UserQuestStep_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserQuestStep_questStepId_fkey" FOREIGN KEY ("questStepId") REFERENCES "QuestStep" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "QuestStep_questId_idx" ON "QuestStep"("questId");

-- CreateIndex
CREATE INDEX "UserQuest_questId_idx" ON "UserQuest"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuest_userId_questId_key" ON "UserQuest"("userId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestStep_userQuestId_questStepId_key" ON "UserQuestStep"("userQuestId", "questStepId");
