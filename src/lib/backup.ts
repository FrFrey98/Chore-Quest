import { prisma } from '@/lib/prisma'

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
  }
}

const EXPECTED_TABLES = [
  'users', 'categories', 'tasks', 'taskCompletions', 'taskApprovals',
  'storeItems', 'purchases', 'achievements', 'userAchievements',
  'streakStates', 'appConfigs', 'taskScheduleOverrides', 'pushSubscriptions',
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

  return {
    meta: {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
    },
    data: {
      users, categories, tasks, taskCompletions, taskApprovals,
      storeItems, purchases, achievements, userAchievements,
      streakStates, appConfigs, taskScheduleOverrides, pushSubscriptions,
    },
  }
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
