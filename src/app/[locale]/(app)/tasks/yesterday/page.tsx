import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations, getLocale } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { YesterdaySection } from '@/components/tasks/yesterday-section'

export const dynamic = 'force-dynamic'

export default async function YesterdayPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const userId = session.user.id

  const t = await getTranslations('tasks.yesterday')
  const tc = await getTranslations('dashboard')
  const locale = await getLocale()

  const now = new Date()
  const yesterdayStart = new Date(now)
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1)
  yesterdayStart.setUTCHours(0, 0, 0, 0)
  const yesterdayEnd = new Date(yesterdayStart)
  yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() + 1)

  const [yesterdayCompletions, recurringTasks, partner] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { userId, completedAt: { gte: yesterdayStart, lt: yesterdayEnd } },
      include: {
        task: { select: { id: true, emoji: true, title: true, points: true } },
      },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.task.findMany({
      where: {
        status: 'active',
        isRecurring: true,
      },
      select: {
        id: true,
        emoji: true,
        title: true,
        points: true,
        allowMultiple: true,
        dailyLimit: true,
        nextDueAt: true,
        recurringInterval: true,
      },
    }),
    prisma.user.findFirst({
      where: { id: { not: userId } },
      select: { id: true, name: true },
    }),
  ])

  // Completed yesterday
  const completed = yesterdayCompletions.map((c) => ({
    id: c.id,
    taskId: c.task.id,
    emoji: c.task.emoji,
    title: c.task.title,
    points: c.points,
  }))

  // Tasks that were due yesterday but not completed
  const completedTaskIds = new Set(yesterdayCompletions.map((c) => c.taskId))
  const dueTasks = recurringTasks
    .filter((t) => {
      if (completedTaskIds.has(t.id)) return false
      // Task was due yesterday or earlier (overdue)
      if (!t.nextDueAt) return true
      return t.nextDueAt < yesterdayEnd
    })
    .map((t) => ({
      id: t.id,
      emoji: t.emoji,
      title: t.title,
      points: t.points,
      allowMultiple: t.allowMultiple,
      dailyLimit: t.dailyLimit,
    }))

  // Format yesterday date for display
  const yesterdayDate = new Date(yesterdayStart)
  const dateLabel = yesterdayDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{t('heading')}</h1>
      <p className="text-sm text-muted-foreground mb-4">{dateLabel}</p>

      <YesterdaySection
        completed={completed}
        due={dueTasks}
        partnerId={partner?.id}
        partnerName={partner?.name ?? tc('partner')}
      />
    </div>
  )
}
