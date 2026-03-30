'use client'
import { useState } from 'react'
import { Heatmap } from '@/components/stats/heatmap'
import { ComparisonChart } from '@/components/stats/comparison-chart'
import { CategoryPieChart } from '@/components/stats/category-pie-chart'

type Level = { level: number; title: string }
type Purchase = { id: string; purchasedAt: string; redeemedAt: string | null; pointsSpent: number; item: { title: string; emoji: string; type: string } }
type Personal = {
  heatmap: Record<string, number>; topTasks: { title: string; emoji: string; count: number }[]
  streak: number; totalCompletions: number; totalPointsEarned: number; level: Level; purchases: Purchase[]
}
type Comparison = {
  byWeek: Record<string, Record<string, number>>
  byCategory: Record<string, Record<string, number>>
  byMonth: Record<string, Record<string, number>>
}

export function StatsClient({
  personal, comparison, categories,
}: {
  personal: Personal; comparison: Comparison; categories: { id: string; name: string }[]
}) {
  const [tab, setTab] = useState<'personal' | 'comparison'>('personal')

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Statistiken</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setTab('personal')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          Meine Stats
        </button>
        <button
          onClick={() => setTab('comparison')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'comparison' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          Vergleich
        </button>
      </div>

      {tab === 'personal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Aufgaben', value: personal.totalCompletions },
              { label: 'Punkte verdient', value: personal.totalPointsEarned },
              { label: '🔥 Streak', value: `${personal.streak} Tage` },
              { label: 'Level', value: `${personal.level.level} · ${personal.level.title}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="font-bold text-indigo-700">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Aktivitäts-Heatmap
            </p>
            <Heatmap data={personal.heatmap} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Top Aufgaben
            </p>
            <div className="space-y-2">
              {personal.topTasks.length === 0 && <p className="text-slate-400 text-sm">Noch keine Aufgaben erledigt.</p>}
              {personal.topTasks.map((t) => (
                <div key={t.title} className="flex items-center gap-2">
                  <span>{t.emoji}</span>
                  <span className="text-sm flex-1">{t.title}</span>
                  <span className="text-sm font-bold text-indigo-600">{t.count}×</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Belohnungs-Historie
            </p>
            {personal.purchases.length === 0 ? (
              <p className="text-slate-400 text-sm">Noch keine Käufe.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left pb-2">Artikel</th>
                    <th className="text-right pb-2">Datum</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.purchases.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2">{p.item.emoji} {p.item.title}</td>
                      <td className="py-2 text-right text-slate-500 text-xs">
                        {new Date(p.purchasedAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-2 text-right">
                        {p.redeemedAt
                          ? <span className="text-green-600 text-xs">Eingelöst</span>
                          : p.item.type === 'real_reward'
                            ? <span className="text-amber-500 text-xs">Ausstehend</span>
                            : <span className="text-indigo-600 text-xs">✓</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'comparison' && (
        <div className="space-y-6">
          {/* Champion Banner */}
          {Object.keys(comparison.byWeek).length > 0 && (() => {
            const totals: Record<string, number> = {}
            Object.values(comparison.byWeek).forEach(week =>
              Object.entries(week).forEach(([name, pts]) => { totals[name] = (totals[name] ?? 0) + pts })
            )
            const champion = Object.entries(totals).sort(([,a],[,b]) => b - a)[0]
            return champion ? (
              <div className="bg-indigo-600 text-white rounded-xl p-4 text-center">
                <p className="text-xs opacity-75 mb-1">🏆 Haushalts-Champion</p>
                <p className="text-2xl font-bold">{champion[0]}</p>
                <p className="text-sm opacity-75">{champion[1].toLocaleString()} Punkte</p>
              </div>
            ) : null
          })()}

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Punkte pro Woche
            </p>
            <ComparisonChart byWeek={comparison.byWeek} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Aufgaben nach Kategorie
            </p>
            <CategoryPieChart byCategory={comparison.byCategory} categories={categories} />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Monatliche Übersicht
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="text-left pb-2">Monat</th>
                  {Object.values(comparison.byWeek)[0] && Object.keys(Object.values(comparison.byWeek)[0]).map(name => (
                    <th key={name} className="text-right pb-2">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparison.byMonth).sort(([a],[b]) => b.localeCompare(a)).slice(0,6).map(([month, users]) => (
                  <tr key={month} className="border-t border-slate-100">
                    <td className="py-2 text-slate-600">{month}</td>
                    {Object.entries(users).map(([name, pts]) => (
                      <td key={name} className="py-2 text-right font-medium">{pts}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
