'use client'

import { useTranslations } from 'next-intl'

type ScoreboardProps = {
  entries: { userId: string; name: string; taskCount: number; points: number }[]
}

export function Scoreboard({ entries }: ScoreboardProps) {
  const t = useTranslations('stats')
  const [left, right] = entries.length >= 2
    ? [entries[0], entries[1]]
    : [entries[0] ?? { name: '–', taskCount: 0, points: 0 }, { name: '–', taskCount: 0, points: 0 }]

  const leftWins = left.taskCount > right.taskCount
  const rightWins = right.taskCount > left.taskCount

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-600">
            {leftWins && '👑 '}{left.name}
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{left.taskCount}</p>
          <p className="text-xs text-slate-500">{t('scoreboard.tasks')}</p>
          <p className="text-lg font-bold text-slate-700 mt-2">{left.points.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{t('scoreboard.points')}</p>
        </div>
        <div className="text-slate-300 text-lg font-bold">{t('vs')}</div>
        <div className="text-center">
          <p className="text-sm font-semibold text-pink-600">
            {rightWins && '👑 '}{right.name}
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{right.taskCount}</p>
          <p className="text-xs text-slate-500">{t('scoreboard.tasks')}</p>
          <p className="text-lg font-bold text-slate-700 mt-2">{right.points.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{t('scoreboard.points')}</p>
        </div>
      </div>
    </div>
  )
}
