import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'
import {
  DEFAULT_STREAK_TIERS,
  DEFAULT_TEAMWORK_BONUS_PERCENT,
  DEFAULT_RESTORE_BASE_PRICE,
  DEFAULT_RESTORE_PER_DAY_PRICE,
  DEFAULT_LEVEL_DEFINITIONS,
  DEFAULT_RECURRING_INTERVALS,
  loadGameConfig,
} from '@/lib/config'

const CONFIG_DEFAULTS: Record<string, unknown> = {
  streak_tiers: DEFAULT_STREAK_TIERS,
  teamwork_bonus_percent: DEFAULT_TEAMWORK_BONUS_PERCENT,
  restore_base_price: DEFAULT_RESTORE_BASE_PRICE,
  restore_per_day_price: DEFAULT_RESTORE_PER_DAY_PRICE,
  level_definitions: DEFAULT_LEVEL_DEFINITIONS,
  recurring_intervals: DEFAULT_RECURRING_INTERVALS,
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await loadGameConfig()
  return NextResponse.json({
    streak_tiers: config.streakTiers,
    teamwork_bonus_percent: config.teamworkBonusPercent,
    restore_base_price: config.restoreBasePrice,
    restore_per_day_price: config.restorePerDayPrice,
    level_definitions: config.levelDefinitions,
    recurring_intervals: config.recurringIntervals,
  })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permError = requirePermission(session.user.role, 'editSettings')
  if (permError) return NextResponse.json({ error: permError.error }, { status: permError.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { entries } = (body as { entries?: unknown }) ?? {}

  if (!Array.isArray(entries)) {
    return NextResponse.json({ error: "Missing or invalid 'entries' field" }, { status: 400 })
  }

  const validKeys = new Set(Object.keys(CONFIG_DEFAULTS))
  for (const entry of entries) {
    if (!validKeys.has(entry.key)) {
      return NextResponse.json({ error: `Unknown config key: ${entry.key}` }, { status: 400 })
    }
  }

  await prisma.$transaction(
    entries.map((entry: { key: string; value: unknown }) =>
      prisma.appConfig.upsert({
        where: { key: entry.key },
        update: { value: JSON.stringify(entry.value) },
        create: { key: entry.key, value: JSON.stringify(entry.value) },
      })
    )
  )

  return NextResponse.json({ success: true })
}
