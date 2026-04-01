import { LEVELS } from '@/lib/points'

type StatPillsProps = {
  streakDays: number
  level: number
  levelTitle: string
  totalEarned: number
  balance: number
}

export function StatPills({ streakDays, level, levelTitle, totalEarned, balance }: StatPillsProps) {
  const currentLevel = LEVELS.find((l) => l.level === level) ?? LEVELS[0]
  const nextLevel = LEVELS.find((l) => l.level === level + 1)
  const progressPercent = nextLevel
    ? Math.round(((totalEarned - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100
  const pointsToNext = nextLevel ? nextLevel.minPoints - totalEarned : 0

  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] gap-3 mb-4">
      {/* Streak */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center">
        <span className="text-2xl">🔥</span>
        <span className="text-2xl font-bold text-slate-800">{streakDays}</span>
        <span className="text-[10px] text-slate-500">Streak</span>
      </div>

      {/* Level Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-slate-800">Lv.{level} {levelTitle}</span>
          <span className="text-xs text-indigo-600 font-semibold">{progressPercent}%</span>
        </div>
        <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {nextLevel ? `${pointsToNext} Pkt bis ${nextLevel.title}` : 'Max Level erreicht!'}
        </p>
      </div>

      {/* Points */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-center flex flex-col items-center justify-center">
        <span className="text-2xl">💰</span>
        <span className="text-2xl font-bold text-slate-800">{balance.toLocaleString()}</span>
        <span className="text-[10px] text-slate-500">Punkte</span>
      </div>
    </div>
  )
}
