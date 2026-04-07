import { prisma } from '@/lib/prisma'

/**
 * Returns true if at least one user exists in the database.
 * Used to determine if the setup wizard has already been completed.
 */
export async function isSetupComplete(): Promise<boolean> {
  const count = await prisma.user.count()
  return count > 0
}

// Keep in sync with prisma/seed.ts
export const DEFAULT_CATEGORIES = [
  { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
  { id: 'cat-bath', name: 'Bad', emoji: '🚿' },
  { id: 'cat-general', name: 'Allgemein', emoji: '🏠' },
  { id: 'cat-laundry', name: 'Wäsche', emoji: '👕' },
  { id: 'cat-outdoor', name: 'Draußen', emoji: '🌿' },
]

// Keep in sync with prisma/seed.ts
export const DEFAULT_STORE_ITEMS = [
  { id: 'item-reward-pizza', title: 'Pizza-Abend aussuchen', description: 'Du darfst bestimmen was bestellt wird', emoji: '🍕', pointCost: 200, type: 'real_reward' },
  { id: 'item-reward-movie', title: 'Film-Abend aussuchen', description: 'Du wählst den Film', emoji: '🎬', pointCost: 150, type: 'real_reward' },
  { id: 'item-reward-sleep', title: 'Ausschlafen', description: 'Kein Wecker, keine Pflichten am Morgen', emoji: '😴', pointCost: 250, type: 'real_reward' },
  { id: 'item-reward-massage', title: 'Massage (15 Min)', description: '15 Minuten Schulter-/Rückenmassage', emoji: '💆', pointCost: 350, type: 'real_reward' },
  { id: 'item-reward-dishfree', title: 'Abwasch-frei (1 Woche)', description: 'Eine Woche lang kein Abwasch', emoji: '✨', pointCost: 500, type: 'real_reward' },
]

// Keep in sync with prisma/seed.ts
export const DEFAULT_ACHIEVEMENTS = [
  { id: 'ach-first-task', title: 'Erste Schritte', description: 'Erste Aufgabe erledigt', emoji: '⭐', conditionType: 'task_count', conditionValue: 1, sortOrder: 1 },
  { id: 'ach-task-10', title: 'Fleißig', description: '10 Aufgaben erledigt', emoji: '💪', conditionType: 'task_count', conditionValue: 10, sortOrder: 2 },
  { id: 'ach-task-50', title: 'Putz-Profi', description: '50 Aufgaben erledigt', emoji: '🧹', conditionType: 'task_count', conditionValue: 50, sortOrder: 3 },
  { id: 'ach-task-100', title: 'Centurion', description: '100 Aufgaben erledigt', emoji: '💯', conditionType: 'task_count', conditionValue: 100, sortOrder: 4 },
  { id: 'ach-kitchen-20', title: 'Koch-Star', description: '20 Küchen-Aufgaben erledigt', emoji: '👨‍🍳', conditionType: 'category_count', conditionValue: 20, conditionMeta: 'cat-kitchen', sortOrder: 5 },
  { id: 'ach-bath-10', title: 'Glanz & Gloria', description: '10 Bad-Aufgaben erledigt', emoji: '✨', conditionType: 'category_count', conditionValue: 10, conditionMeta: 'cat-bath', sortOrder: 6 },
  { id: 'ach-streak-7', title: 'Feuer-Starter', description: '7 Tage in Folge eine Aufgabe erledigt', emoji: '🔥', conditionType: 'streak_days', conditionValue: 7, sortOrder: 7 },
  { id: 'ach-streak-14', title: 'Wochen-Star', description: '14 Tage in Folge eine Aufgabe erledigt', emoji: '🏆', conditionType: 'streak_days', conditionValue: 14, sortOrder: 8 },
  { id: 'ach-streak-30', title: 'Monats-Marathon', description: '30 Tage in Folge eine Aufgabe erledigt', emoji: '⚡', conditionType: 'streak_days', conditionValue: 30, sortOrder: 9 },
  { id: 'ach-points-500', title: 'Punktesammler', description: '500 Punkte verdient', emoji: '💰', conditionType: 'total_points', conditionValue: 500, sortOrder: 10 },
  { id: 'ach-points-2000', title: 'Diamant-Sammler', description: '2000 Punkte verdient', emoji: '💎', conditionType: 'total_points', conditionValue: 2000, sortOrder: 11 },
  { id: 'ach-level-4', title: 'Haushalts-Held', description: 'Level 4 erreicht', emoji: '🎓', conditionType: 'level', conditionValue: 4, sortOrder: 12 },
  { id: 'ach-level-6', title: 'Wohn-Meister', description: 'Level 6 erreicht', emoji: '👑', conditionType: 'level', conditionValue: 6, sortOrder: 13 },
]

interface SetupOptions {
  categories?: Array<{ name: string; emoji: string }>
  tasks?: Array<{
    title: string
    emoji: string
    points: number
    categoryName: string
    isRecurring: boolean
    recurringInterval?: string
  }>
  locale?: string
}

/**
 * Seeds default categories, achievements, store items, and streak states
 * within a Prisma transaction context.
 * Optionally accepts custom categories, tasks, and locale via SetupOptions.
 */
export async function seedDefaults(tx: any, userIds: string[], options?: SetupOptions) { // eslint-disable-line
  // Use custom categories if provided, otherwise DEFAULT_CATEGORIES
  const categoriesToSeed = options?.categories?.length
    ? options.categories.map((c, i) => ({
        id: `cat-custom-${i}`,
        name: c.name,
        emoji: c.emoji,
      }))
    : DEFAULT_CATEGORIES

  // Seed categories and build a name->id map
  const categoryMap: Record<string, string> = {}
  for (const cat of categoriesToSeed) {
    const created = await tx.category.create({ data: cat })
    categoryMap[cat.name] = created.id
  }

  // Seed store items
  for (const item of DEFAULT_STORE_ITEMS) {
    await tx.storeItem.create({
      data: { ...item, isActive: true },
    })
  }

  // Seed achievements
  for (const ach of DEFAULT_ACHIEVEMENTS) {
    await tx.achievement.create({ data: ach })
  }

  // Seed streak states for all users
  for (const userId of userIds) {
    await tx.streakState.create({ data: { userId } })
  }

  // Seed tasks if provided
  if (options?.tasks?.length) {
    const adminId = userIds[0]
    for (const task of options.tasks) {
      const categoryId = categoryMap[task.categoryName]
      if (!categoryId) continue
      await tx.task.create({
        data: {
          title: task.title,
          emoji: task.emoji,
          points: task.points,
          categoryId,
          isRecurring: task.isRecurring,
          recurringInterval: task.recurringInterval || null,
          status: 'active',
          createdById: adminId,
          approvedById: adminId,
          nextDueAt: task.isRecurring ? new Date() : null,
        },
      })
    }
  }

  // Set locale for all users if specified
  if (options?.locale) {
    for (const userId of userIds) {
      await tx.user.update({
        where: { id: userId },
        data: { locale: options.locale },
      })
    }
  }
}
