'use client'
import { type GameConfig } from '@/lib/config'
export function LevelTab({ config }: { config: GameConfig }) {
  return <div className="text-slate-400 text-sm">Level-Tab ({config.levelDefinitions.length} Level)</div>
}
