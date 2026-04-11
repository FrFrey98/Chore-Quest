"use client"

type Achievement = {
  id: string
  titleDe: string
  emoji: string
  unlockedAt: Date
}

type Props = {
  achievements: Achievement[]
}

export function AchievementsWidget({ achievements }: Props) {
  if (achievements.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {achievements.map((a) => (
        <div
          key={a.id}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full flex-shrink-0"
        >
          <span className="text-sm">{a.emoji}</span>
          <span className="text-xs font-medium">{a.titleDe}</span>
        </div>
      ))}
    </div>
  )
}
