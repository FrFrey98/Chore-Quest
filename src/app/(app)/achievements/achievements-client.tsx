'use client'

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
  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)
  const nextGoals = locked
    .map((a) => ({ ...a, percent: a.progressMax > 0 ? a.progress / a.progressMax : 0 }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Erfolge</h1>
        <span className="text-sm text-indigo-600 font-semibold">{totalUnlocked}/{total} freigeschaltet</span>
      </div>

      {/* Trophy Shelf */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Deine Vitrine
      </h2>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {unlocked.map((a) => (
          <div key={a.id} className="bg-white rounded-xl p-3 text-center border border-slate-200 aspect-square flex flex-col items-center justify-center">
            <span className="text-3xl">{a.emoji}</span>
            <span className="text-[10px] text-slate-600 mt-1 leading-tight line-clamp-2">{a.title}</span>
          </div>
        ))}
        {locked.map((a) => (
          <div key={a.id} className="bg-slate-50 rounded-xl p-3 text-center border border-dashed border-slate-300 aspect-square flex flex-col items-center justify-center">
            <span className="text-3xl grayscale opacity-30">{a.emoji}</span>
          </div>
        ))}
      </div>

      {/* Next Goals */}
      {nextGoals.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Nächste Ziele
          </h2>
          <div className="space-y-3">
            {nextGoals.map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                <span className="text-2xl grayscale-[50%]">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-slate-400">{a.description}</p>
                  <div className="mt-2 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.round(a.percent * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-indigo-600 mt-1">
                    {a.progress}/{a.progressMax}
                    {a.percent >= 0.7 && ' — fast geschafft!'}
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
