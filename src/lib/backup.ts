import { prisma } from '@/lib/prisma'
import packageJson from '../../package.json'

export const BACKUP_VERSION = 1

export type BackupData = {
  meta: {
    version: number
    exportedAt: string
    appVersion: string
  }
  data: {
    users: unknown[]
    categories: unknown[]
    tasks: unknown[]
    taskCompletions: unknown[]
    taskApprovals: unknown[]
    storeItems: unknown[]
    purchases: unknown[]
    achievements: unknown[]
    userAchievements: unknown[]
    streakStates: unknown[]
    appConfigs: unknown[]
    taskScheduleOverrides: unknown[]
    pushSubscriptions: unknown[]
    taskAssignments: unknown[]
  }
}

const EXPECTED_TABLES = [
  'users', 'categories', 'tasks', 'taskCompletions', 'taskApprovals',
  'storeItems', 'purchases', 'achievements', 'userAchievements',
  'streakStates', 'appConfigs', 'taskScheduleOverrides', 'pushSubscriptions',
  'taskAssignments',
] as const

export async function exportAllData(): Promise<BackupData> {
  const [
    users, categories, tasks, taskCompletions, taskApprovals,
    storeItems, purchases, achievements, userAchievements,
    streakStates, appConfigs, taskScheduleOverrides, pushSubscriptions,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.category.findMany(),
    prisma.task.findMany(),
    prisma.taskCompletion.findMany(),
    prisma.taskApproval.findMany(),
    prisma.storeItem.findMany(),
    prisma.purchase.findMany(),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany(),
    prisma.streakState.findMany(),
    prisma.appConfig.findMany(),
    prisma.taskScheduleOverride.findMany(),
    prisma.pushSubscription.findMany(),
  ])

  const taskAssignments = await prisma.$queryRaw`SELECT * FROM "_TaskAssignments"` as unknown[]

  return {
    meta: {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: packageJson.version,
    },
    data: {
      users, categories, tasks, taskCompletions, taskApprovals,
      storeItems, purchases, achievements, userAchievements,
      streakStates, appConfigs, taskScheduleOverrides, pushSubscriptions,
      taskAssignments,
    },
  }
}

export async function restoreAllData(backup: BackupData): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Delete in reverse dependency order
    await tx.pushSubscription.deleteMany()
    await tx.userAchievement.deleteMany()
    await tx.taskScheduleOverride.deleteMany()
    await tx.taskCompletion.deleteMany()
    await tx.taskApproval.deleteMany()
    await tx.purchase.deleteMany()
    await tx.streakState.deleteMany()
    await tx.$executeRaw`DELETE FROM "_TaskAssignments"`
    await tx.task.deleteMany()
    await tx.storeItem.deleteMany()
    await tx.achievement.deleteMany()
    await tx.category.deleteMany()
    await tx.appConfig.deleteMany()
    await tx.user.deleteMany()

    // Insert in dependency order
    if (backup.data.users.length) await tx.user.createMany({ data: backup.data.users as any })
    if (backup.data.categories.length) await tx.category.createMany({ data: backup.data.categories as any })
    if (backup.data.appConfigs.length) await tx.appConfig.createMany({ data: backup.data.appConfigs as any })
    if (backup.data.achievements.length) await tx.achievement.createMany({ data: backup.data.achievements as any })
    if (backup.data.storeItems.length) await tx.storeItem.createMany({ data: backup.data.storeItems as any })
    if (backup.data.tasks.length) await tx.task.createMany({ data: backup.data.tasks as any })
    if (backup.data.taskAssignments.length) {
      for (const row of backup.data.taskAssignments as { A: string; B: string }[]) {
        await tx.$executeRaw`INSERT INTO "_TaskAssignments" ("A", "B") VALUES (${row.A}, ${row.B})`
      }
    }
    if (backup.data.taskCompletions.length) await tx.taskCompletion.createMany({ data: backup.data.taskCompletions as any })
    if (backup.data.taskApprovals.length) await tx.taskApproval.createMany({ data: backup.data.taskApprovals as any })
    if (backup.data.purchases.length) await tx.purchase.createMany({ data: backup.data.purchases as any })
    if (backup.data.streakStates.length) await tx.streakState.createMany({ data: backup.data.streakStates as any })
    if (backup.data.userAchievements.length) await tx.userAchievement.createMany({ data: backup.data.userAchievements as any })
    if (backup.data.taskScheduleOverrides.length) await tx.taskScheduleOverride.createMany({ data: backup.data.taskScheduleOverrides as any })
    if (backup.data.pushSubscriptions.length) await tx.pushSubscription.createMany({ data: backup.data.pushSubscriptions as any })
  }, { timeout: 30000 })
}

export function validateBackup(data: unknown): { valid: true; backup: BackupData } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Ungültiges JSON-Format' }
  }

  const backup = data as Record<string, unknown>

  if (!backup.meta || typeof backup.meta !== 'object') {
    return { valid: false, error: 'Meta-Daten fehlen' }
  }

  const meta = backup.meta as Record<string, unknown>
  if (meta.version !== BACKUP_VERSION) {
    return { valid: false, error: `Inkompatible Version: ${meta.version} (erwartet: ${BACKUP_VERSION})` }
  }

  if (typeof meta.exportedAt !== 'string') {
    return { valid: false, error: 'Export-Zeitpunkt fehlt' }
  }

  if (!backup.data || typeof backup.data !== 'object') {
    return { valid: false, error: 'Daten-Objekt fehlt' }
  }

  const dataObj = backup.data as Record<string, unknown>
  for (const table of EXPECTED_TABLES) {
    if (!Array.isArray(dataObj[table])) {
      return { valid: false, error: `Tabelle "${table}" fehlt oder ist kein Array` }
    }
  }

  return { valid: true, backup: data as BackupData }
}
