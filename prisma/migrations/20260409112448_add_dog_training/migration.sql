-- CreateTable
CREATE TABLE "Dog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🐕',
    "photoBase64" TEXT,
    "breed" TEXT,
    "gender" TEXT,
    "birthDate" DATETIME,
    "phase" TEXT NOT NULL DEFAULT 'adult',
    "notes" TEXT,
    "vacationStart" DATETIME,
    "vacationEnd" DATETIME,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DogSkillCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameDe" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "DogSkillDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "nameDe" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionDe" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "prerequisiteIds" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DogSkillDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DogSkillCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DogSkillDefinition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DogSkillProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dogId" TEXT NOT NULL,
    "skillDefinitionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "progress" REAL NOT NULL DEFAULT 0,
    "bestStatus" TEXT NOT NULL DEFAULT 'new',
    "trainedCount" INTEGER NOT NULL DEFAULT 0,
    "firstTrainedAt" DATETIME,
    "lastTrainedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DogSkillProgress_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DogSkillProgress_skillDefinitionId_fkey" FOREIGN KEY ("skillDefinitionId") REFERENCES "DogSkillDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DogTrainingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dogId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "withUserId" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "moodLevel" TEXT,
    "sessionType" TEXT,
    "notes" TEXT,
    "pointsAwarded" INTEGER NOT NULL,
    "taskCompletionId" TEXT,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DogTrainingSession_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DogTrainingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DogTrainingSession_withUserId_fkey" FOREIGN KEY ("withUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DogTrainingSession_taskCompletionId_fkey" FOREIGN KEY ("taskCompletionId") REFERENCES "TaskCompletion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DogSessionSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "skillDefinitionId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    CONSTRAINT "DogSessionSkill_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DogTrainingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DogSessionSkill_skillDefinitionId_fkey" FOREIGN KEY ("skillDefinitionId") REFERENCES "DogSkillDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DogAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleDe" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionDe" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "conditionValue" INTEGER NOT NULL,
    "conditionMeta" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "UserDogAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserDogAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserDogAchievement_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserDogAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "DogAchievement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Category" ("emoji", "id", "name") SELECT "emoji", "id", "name" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
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
    "scheduleDays" TEXT,
    "scheduleTime" TEXT,
    "decayHours" INTEGER,
    "lastNotifiedAt" DATETIME,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("allowMultiple", "approvedById", "categoryId", "createdAt", "createdById", "dailyLimit", "decayHours", "emoji", "id", "isRecurring", "lastNotifiedAt", "nextDueAt", "points", "recurringInterval", "scheduleDays", "scheduleTime", "status", "title") SELECT "allowMultiple", "approvedById", "categoryId", "createdAt", "createdById", "dailyLimit", "decayHours", "emoji", "id", "isRecurring", "lastNotifiedAt", "nextDueAt", "points", "recurringInterval", "scheduleDays", "scheduleTime", "status", "title" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DogSkillDefinition_categoryId_idx" ON "DogSkillDefinition"("categoryId");

-- CreateIndex
CREATE INDEX "DogSkillProgress_dogId_idx" ON "DogSkillProgress"("dogId");

-- CreateIndex
CREATE UNIQUE INDEX "DogSkillProgress_dogId_skillDefinitionId_key" ON "DogSkillProgress"("dogId", "skillDefinitionId");

-- CreateIndex
CREATE INDEX "DogTrainingSession_dogId_idx" ON "DogTrainingSession"("dogId");

-- CreateIndex
CREATE INDEX "DogTrainingSession_userId_idx" ON "DogTrainingSession"("userId");

-- CreateIndex
CREATE INDEX "DogTrainingSession_completedAt_idx" ON "DogTrainingSession"("completedAt");

-- CreateIndex
CREATE INDEX "DogSessionSkill_sessionId_idx" ON "DogSessionSkill"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "DogSessionSkill_sessionId_skillDefinitionId_key" ON "DogSessionSkill"("sessionId", "skillDefinitionId");

-- CreateIndex
CREATE INDEX "UserDogAchievement_dogId_idx" ON "UserDogAchievement"("dogId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDogAchievement_userId_dogId_achievementId_key" ON "UserDogAchievement"("userId", "dogId", "achievementId");
