import { NextRequest, NextResponse } from 'next/server'
import { generateWeeklyChallenges } from '@/lib/challenges'

export async function GET(req: NextRequest) {
  // Authenticate via cron secret (same pattern as notifications cron)
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('x-cron-secret')
  if (!cronSecret || authHeader !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await generateWeeklyChallenges()
  return NextResponse.json(result)
}
