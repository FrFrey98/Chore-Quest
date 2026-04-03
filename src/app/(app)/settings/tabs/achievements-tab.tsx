'use client'
type Category = { id: string; name: string; emoji: string; taskCount: number }
type Achievement = {
  id: string; title: string; description: string; emoji: string
  conditionType: string; conditionValue: number; conditionMeta: string | null; sortOrder: number
}
export function AchievementsTab({ achievements, categories }: { achievements: Achievement[]; categories: Category[] }) {
  return <div className="text-slate-400 text-sm">Achievements-Tab ({achievements.length} Achievements)</div>
}
