'use client'
import { useTranslations, useLocale } from 'next-intl'

type Achievement = {
  id: string; title: string; description: string; emoji: string
  unlocked: boolean; unlockedAt: string | null
  progress: number; progressMax: number
}

export function AchievementsClient({
  achievements, totalUnlocked, total,
}: {
  achievements: Achievement[]; totalUnlocked: number; total: number
}) {
  const t = useTranslations('achievements')
  const locale = useLocale()
  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)
  const nextGoals = locked
    .map((a) => ({ ...a, percent: a.progressMax > 0 ? a.progress / a.progressMax : 0 }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[1.75rem] font-light uppercase tracking-wide leading-tight">{t('heading')}</h1>
        <span className="text-sm text-accent font-semibold">{t('unlockedCount', { unlocked: totalUnlocked, total })}</span>
      </div>

      {/* Trophy Shelf */}
      <h2 className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground mb-3">
        {t('showcase')}
      </h2>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {unlocked.map((a) => (
          <div key={a.id} className="group relative bg-card rounded-xl p-3 text-center border border-border aspect-square flex flex-col items-center justify-center cursor-default">
            <span className="text-3xl">{a.emoji}</span>
            <span className="text-[10px] text-muted-foreground mt-1 leading-tight line-clamp-2">{a.title}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center shadow-lg">
              <p className="font-semibold">{a.title}</p>
              <p className="text-muted-foreground/50 mt-0.5">{a.description}</p>
              <p className="text-muted-foreground mt-1">{a.progress}/{a.progressMax} · {a.unlockedAt ? t('since', { date: new Date(a.unlockedAt).toLocaleDateString(locale) }) : ''}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        ))}
        {locked.map((a) => (
          <div key={a.id} className="group relative bg-muted/50 rounded-xl p-3 text-center border border-dashed border-border aspect-square flex flex-col items-center justify-center cursor-default">
            <span className="text-3xl grayscale opacity-30">{a.emoji}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center shadow-lg">
              <p className="font-semibold">{a.title}</p>
              <p className="text-muted-foreground/50 mt-0.5">{a.description}</p>
              <div className="mt-1.5 bg-slate-600 rounded-full h-1 overflow-hidden">
                <div className="bg-accent h-full rounded-full" style={{ width: `${a.progressMax > 0 ? Math.round((a.progress / a.progressMax) * 100) : 0}%` }} />
              </div>
              <p className="text-muted-foreground mt-1">{a.progress}/{a.progressMax}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Next Goals */}
      {nextGoals.length > 0 && (
        <>
          <h2 className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground mb-3">
            {t('nextGoals')}
          </h2>
          <div className="space-y-3">
            {nextGoals.map((a) => (
              <div key={a.id} className="bg-card rounded-xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-2xl grayscale-[50%]">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  <div className="mt-2 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full transition-all"
                      style={{ width: `${Math.round(a.percent * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-accent mt-1">
                    {a.progress}/{a.progressMax}
                    {a.percent >= 0.7 && ` — ${t('almostDone')}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
