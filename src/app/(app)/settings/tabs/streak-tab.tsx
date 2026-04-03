'use client'
import { type GameConfig } from '@/lib/config'
export function StreakTab({ config }: { config: GameConfig }) {
  return <div className="text-slate-400 text-sm">Streak-Tab ({config.streakTiers.length} Tiers)</div>
}
