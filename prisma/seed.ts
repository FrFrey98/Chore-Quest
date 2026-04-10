import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { seedDogTraining } from './seed-dog-training'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

// Keep in sync with src/lib/setup.ts
const categories = [
  { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
  { id: 'cat-bath', name: 'Bad', emoji: '🚿' },
  { id: 'cat-general', name: 'Allgemein', emoji: '🏠' },
  { id: 'cat-laundry', name: 'Wäsche', emoji: '👕' },
  { id: 'cat-outdoor', name: 'Draußen', emoji: '🌿' },
]

// Keep in sync with src/lib/setup.ts
const tasks = [
  { id: 'task-dishes', title: 'Abwasch machen', emoji: '🍽️', points: 20, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'daily' },
  { id: 'task-cook', title: 'Kochen', emoji: '👨‍🍳', points: 40, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'daily' },
  { id: 'task-wipe-kitchen', title: 'Arbeitsflächen abwischen', emoji: '🧽', points: 15, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'daily' },
  { id: 'task-fridge', title: 'Kühlschrank aufräumen', emoji: '🧊', points: 30, categoryId: 'cat-kitchen', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-bathroom-clean', title: 'Bad putzen', emoji: '🧹', points: 40, categoryId: 'cat-bath', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-toilet', title: 'Toilette reinigen', emoji: '🚽', points: 25, categoryId: 'cat-bath', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-mirror', title: 'Spiegel putzen', emoji: '🪞', points: 10, categoryId: 'cat-bath', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-vacuum', title: 'Staubsaugen', emoji: '🧹', points: 30, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-mop', title: 'Wischen', emoji: '🪣', points: 30, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-dust', title: 'Staubwischen', emoji: '🪶', points: 20, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-trash', title: 'Müll rausbringen', emoji: '🗑️', points: 10, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'daily' },
  { id: 'task-laundry-wash', title: 'Wäsche waschen', emoji: '🫧', points: 20, categoryId: 'cat-laundry', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-laundry-hang', title: 'Wäsche aufhängen', emoji: '👕', points: 15, categoryId: 'cat-laundry', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-laundry-fold', title: 'Wäsche zusammenlegen', emoji: '🧺', points: 15, categoryId: 'cat-laundry', isRecurring: true, recurringInterval: 'weekly' },
  { id: 'task-plants', title: 'Pflanzen gießen', emoji: '🪴', points: 10, categoryId: 'cat-outdoor', isRecurring: true, recurringInterval: 'daily' },
  { id: 'task-groceries', title: 'Einkaufen', emoji: '🛒', points: 35, categoryId: 'cat-general', isRecurring: true, recurringInterval: 'weekly' },
]

// Keep in sync with src/lib/setup.ts
const storeItems = [
  { id: 'item-reward-pizza', title: 'Pizza-Abend aussuchen', description: 'Du darfst bestimmen was bestellt wird', emoji: '🍕', pointCost: 200, type: 'real_reward' },
  { id: 'item-reward-movie', title: 'Film-Abend aussuchen', description: 'Du wählst den Film', emoji: '🎬', pointCost: 150, type: 'real_reward' },
  { id: 'item-reward-sleep', title: 'Ausschlafen', description: 'Kein Wecker, keine Pflichten am Morgen', emoji: '😴', pointCost: 250, type: 'real_reward' },
  { id: 'item-reward-massage', title: 'Massage (15 Min)', description: '15 Minuten Schulter-/Rückenmassage', emoji: '💆', pointCost: 350, type: 'real_reward' },
  { id: 'item-reward-dishfree', title: 'Abwasch-frei (1 Woche)', description: 'Eine Woche lang kein Abwasch', emoji: '✨', pointCost: 500, type: 'real_reward' },
]

// Keep in sync with src/lib/setup.ts
const achievements = [
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

async function main() {
  // Hash PINs for seed users (dev credentials only)
  const pin1 = await bcrypt.hash('1234', 10)
  const pin2 = await bcrypt.hash('5678', 10)

  // Create seed users
  const alice = await prisma.user.upsert({
    where: { id: 'seed-user-1' },
    update: {},
    create: { id: 'seed-user-1', name: 'Alice', pin: pin1, role: 'admin' },
  })

  const bob = await prisma.user.upsert({
    where: { id: 'seed-user-2' },
    update: {},
    create: { id: 'seed-user-2', name: 'Bob', pin: pin2, role: 'member' },
  })

  // Seed categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }

  // Initial tasks (status: 'active', created by system seed)
  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        ...t,
        status: 'active',
        createdById: alice.id,
        approvedById: bob.id,
      },
    })
  }

  // Initial store items (rewards)
  for (const item of storeItems) {
    await prisma.storeItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, isActive: true },
    })
  }

  // Achievements
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: {},
      create: ach,
    })
  }

  // Streak states for both users
  for (const user of [alice, bob]) {
    const existing = await prisma.streakState.findUnique({ where: { userId: user.id } })
    if (!existing) {
      await prisma.streakState.create({ data: { userId: user.id } })
    }
  }

  // Dog training seed
  await seedDogTraining(prisma)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
