'use client'
import { type GameConfig } from '@/lib/config'
export function BonusTab({ config }: { config: GameConfig }) {
  return <div className="text-slate-400 text-sm">Boni-Tab ({config.teamworkBonusPercent}% Teamwork)</div>
}
