import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const pin1 = await bcrypt.hash('1234', 10)
  const pin2 = await bcrypt.hash('5678', 10)

  const franz = await prisma.user.upsert({
    where: { id: 'user-1' },
    update: {},
    create: { id: 'user-1', name: 'Franz', pin: pin1 },
  })

  const michelle = await prisma.user.upsert({
    where: { id: 'user-2' },
    update: { name: 'Michelle' },
    create: { id: 'user-2', name: 'Michelle', pin: pin2 },
  })

  const categories = [
    { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
    { id: 'cat-bath', name: 'Bad', emoji: '🚿' },
    { id: 'cat-general', name: 'Allgemein', emoji: '🏠' },
    { id: 'cat-laundry', name: 'Wäsche', emoji: '👕' },
    { id: 'cat-outdoor', name: 'Draußen', emoji: '🌿' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }

  // Initiale Aufgaben (status: 'active', da vom System angelegt)
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

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        ...t,
        status: 'active',
        createdById: franz.id,
        approvedById: michelle.id,
      },
    })
  }

  // Initiale Store-Items
  const storeItems = [
    { id: 'item-trophy-putzprofi', title: 'Putz-Profi', description: 'Für 50 erledigte Aufgaben', emoji: '🧹', pointCost: 500, type: 'trophy' },
    { id: 'item-trophy-kochstar', title: 'Koch-Star', description: 'Meister am Herd', emoji: '⭐', pointCost: 300, type: 'trophy' },
    { id: 'item-trophy-wochenstar', title: 'Wochen-Star', description: 'Eine ganze Woche ohne Pause', emoji: '🌟', pointCost: 700, type: 'trophy' },
    { id: 'item-trophy-earlybird', title: 'Früh-Aufsteher', description: 'Immer die erste Aufgabe des Tages', emoji: '🐦', pointCost: 400, type: 'trophy' },
    { id: 'item-reward-pizza', title: 'Pizza-Abend aussuchen', description: 'Du darfst bestimmen was bestellt wird', emoji: '🍕', pointCost: 200, type: 'real_reward' },
    { id: 'item-reward-movie', title: 'Film-Abend aussuchen', description: 'Du wählst den Film', emoji: '🎬', pointCost: 150, type: 'real_reward' },
    { id: 'item-reward-sleep', title: 'Ausschlafen', description: 'Kein Wecker, keine Pflichten am Morgen', emoji: '😴', pointCost: 250, type: 'real_reward' },
    { id: 'item-reward-massage', title: 'Massage (15 Min)', description: '15 Minuten Schulter-/Rückenmassage', emoji: '💆', pointCost: 350, type: 'real_reward' },
    { id: 'item-reward-dishfree', title: 'Abwasch-frei (1 Woche)', description: 'Eine Woche lang kein Abwasch', emoji: '✨', pointCost: 500, type: 'real_reward' },
  ]

  for (const item of storeItems) {
    await prisma.storeItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, isActive: true },
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
