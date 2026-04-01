type SummaryCardsProps = {
  taskCount: number
  totalPoints: number
  avgPerDay: number
}

export function SummaryCards({ taskCount, totalPoints, avgPerDay }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-slate-800">{taskCount}</p>
        <p className="text-xs text-slate-500 mt-1">Erledigte Aufgaben</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-slate-800">{totalPoints.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">Verdiente Punkte</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-slate-800">{avgPerDay.toFixed(1)}</p>
        <p className="text-xs text-slate-500 mt-1">Aufgaben / Tag</p>
      </div>
    </div>
  )
}
