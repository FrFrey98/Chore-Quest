-- AlterTable
ALTER TABLE "Task" ADD COLUMN "scheduleDays" TEXT;
ALTER TABLE "Task" ADD COLUMN "scheduleTime" TEXT;

-- CreateTable
CREATE TABLE "TaskScheduleOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "TaskScheduleOverride_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TaskScheduleOverride_taskId_idx" ON "TaskScheduleOverride"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskScheduleOverride_taskId_date_key" ON "TaskScheduleOverride"("taskId", "date");
