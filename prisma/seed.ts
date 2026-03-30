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

  await prisma.user.upsert({
    where: { id: 'user-1' },
    update: {},
    create: { id: 'user-1', name: 'Franz', pin: pin1 },
  })

  await prisma.user.upsert({
    where: { id: 'user-2' },
    update: {},
    create: { id: 'user-2', name: 'Partner', pin: pin2 },
  })

  for (const cat of [
    { id: 'cat-kitchen', name: 'Küche', emoji: '🍳' },
    { id: 'cat-bath', name: 'Bad', emoji: '🚿' },
    { id: 'cat-general', name: 'Allgemein', emoji: '🏠' },
  ]) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
