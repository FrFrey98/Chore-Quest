'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Check } from 'lucide-react'

type CompletedTask = {
  id: string
  emoji: string
  title: string
  points: number
}

type DueTask = {
  id: string
  emoji: string
  title: string
  points: number
}

type SuggestedTask = {
  id: string
  emoji: string
  title: string
}

type TodaySectionProps = {
  completed: CompletedTask[]
  due: DueTask[]
  suggestions: SuggestedTask[]
}

export function TodaySection({ completed, due, suggestions }: TodaySectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())

  const totalTasks = completed.length + due.length
  const doneCount = completed.length + doneIds.size

  async function handleComplete(task: DueTask) {
    setLoadingId(task.id)
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDoneIds((prev) => new Set(prev).add(task.id))
      toast(`+${task.points} Pkt für "${task.title}"`, 'success')

      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a: { emoji: string; title: string }, i: number) => {
          setTimeout(() => {
            toast(`${a.emoji} Achievement freigeschaltet: ${a.title}`, 'success')
          }, 1500 + i * 1500)
        })
      }

      router.refresh()
    } catch {
      toast('Fehler beim Erledigen', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Heute</h2>
        <span className="bg-green-50 text-green-700 text-xs font-semibold rounded-full px-2 py-0.5">
          {doneCount}/{totalTasks} erledigt
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {/* Completed tasks */}
        {completed.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-2.5 bg-green-50 rounded-lg border-l-[3px] border-green-500">
            <span className="text-lg">{t.emoji}</span>
            <span className="flex-1 text-sm text-slate-400 line-through truncate">{t.title}</span>
            <span className="text-xs text-green-600 font-semibold">✓ +{t.points}</span>
          </div>
        ))}
        {/* Due tasks */}
        {due.filter((t) => !doneIds.has(t.id)).map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border-l-[3px] border-slate-300">
            <span className="text-lg">{t.emoji}</span>
            <span className="flex-1 text-sm text-slate-800 truncate">{t.title}</span>
            <button
              onClick={() => handleComplete(t)}
              disabled={loadingId === t.id}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {loadingId === t.id ? '…' : <><Check size={14} /> Abhaken</>}
            </button>
          </div>
        ))}
        {/* Suggested tasks */}
        {suggestions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-lg border-l-[3px] border-amber-400 opacity-70">
            <span className="text-lg">{t.emoji}</span>
            <span className="flex-1 text-sm text-amber-900 truncate">{t.title}</span>
            <span className="text-[10px] text-amber-600 font-semibold">Vorschlag</span>
          </div>
        ))}
        {/* Empty state */}
        {completed.length === 0 && due.length === 0 && suggestions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">Keine Aufgaben für heute</p>
        )}
      </div>
    </div>
  )
}
