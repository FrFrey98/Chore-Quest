'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { SummaryCards } from '@/components/stats/summary-cards'
import { ActivityChart } from '@/components/stats/activity-chart'
import { Scoreboard } from '@/components/stats/scoreboard'
import { TopTasks } from '@/components/stats/top-tasks'
import { TaskFilter } from '@/components/stats/task-filter'
import { Heatmap } from '@/components/stats/heatmap'
import { CategoryPieChart } from '@/components/stats/category-pie-chart'
import {
  groupByDay, groupByWeek, groupByCategory, topTasks as computeTopTasks,
  buildHeatmap, buildScoreboard,
} from '@/lib/stats'

type Completion = {
  id: string
  completedAt: string // ISO string from server
  points: number
  userId: string
  taskId: string
  task: { id: string; title: string; emoji: string; categoryId: string }
}

type ParsedCompletion = Omit<Completion, 'completedAt'> & { completedAt: Date }

type StatsClientProps = {
  completions: Completion[]
  users: { id: string; name: string }[]
  currentUserId: string
  categories: { id: string; name: string; emoji: string }[]
  allTasks: { id: string; title: string; emoji: string }[]
  from: string
  to: string
}

function parseDates(completions: Completion[]): ParsedCompletion[] {
  return completions.map((c) => ({ ...c, completedAt: new Date(c.completedAt) }))
}

function daysBetween(from: string, to: string): number {
  const start = new Date(from + 'T00:00:00Z')
  const end = new Date(to + 'T00:00:00Z')
  return Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
}

export function StatsClient({ completions, users, currentUserId, categories, allTasks, from, to }: StatsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'personal'
  const [metric, setMetric] = useState<'count' | 'points'>('count')
  const [filterTaskId, setFilterTaskId] = useState<string | null>(null)

  const parsed = useMemo(() => parseDates(completions), [completions])

  const filtered = useMemo(() => {
    if (!filterTaskId) return parsed
    return parsed.filter((c) => c.taskId === filterTaskId)
  }, [parsed, filterTaskId])

  const partner = useMemo(() => users.find((u) => u.id !== currentUserId), [users, currentUserId])
  const me = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId])
  const numDays = useMemo(() => daysBetween(from, to), [from, to])
  const useWeeks = numDays > 60

  function setTab(newTab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', newTab)
    router.push(`/stats?${params.toString()}`)
    setFilterTaskId(null)
  }

  function setDateRange(newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', newFrom)
    params.set('to', newTo)
    router.push(`/stats?${params.toString()}`)
  }

  // --- Personal tab data ---
  const myCompletions = useMemo(() => filtered.filter((c) => c.userId === currentUserId), [filtered, currentUserId])
  const myDayData = useMemo(() => groupByDay(myCompletions), [myCompletions])
  const myWeekData = useMemo(() => groupByWeek(myCompletions), [myCompletions])
  const myTotalTasks = myCompletions.length
  const myTotalPoints = myCompletions.reduce((s, c) => s + c.points, 0)
  const myAvgPerDay = numDays > 0 ? myTotalTasks / numDays : 0
  const myCategoryData = useMemo(() => groupByCategory(myCompletions, categories), [myCompletions, categories])
  const myTopTasks = useMemo(() => computeTopTasks(myCompletions), [myCompletions])
  const myHeatmap = useMemo(() => buildHeatmap(myCompletions), [myCompletions])

  // --- Comparison tab data ---
  const myFilteredCompletions = useMemo(
    () => filtered.filter((c) => c.userId === currentUserId),
    [filtered, currentUserId]
  )
  const partnerFilteredCompletions = useMemo(
    () => partner ? filtered.filter((c) => c.userId === partner.id) : [],
    [filtered, partner]
  )

  const scoreboard = useMemo(() => buildScoreboard(filtered, users), [filtered, users])
  const comparisonDayData = useMemo(() => {
    const userDays = groupByDay(filtered, currentUserId)
    const partnerDays = partner ? groupByDay(filtered, partner.id) : []
    const allDates = new Set([...userDays.map((d) => d.date), ...partnerDays.map((d) => d.date)])
    return Array.from(allDates).sort().map((date) => {
      const u = userDays.find((d) => d.date === date)
      const p = partnerDays.find((d) => d.date === date)
      return {
        date,
        userCount: u?.count ?? 0, userPoints: u?.points ?? 0,
        partnerCount: p?.count ?? 0, partnerPoints: p?.points ?? 0,
      }
    })
  }, [filtered, currentUserId, partner])
  const comparisonWeekData = useMemo(() => {
    const userWeeks = groupByWeek(filtered, currentUserId)
    const partnerWeeks = partner ? groupByWeek(filtered, partner.id) : []
    const allWeeks = new Set([...userWeeks.map((w) => w.week), ...partnerWeeks.map((w) => w.week)])
    return Array.from(allWeeks).sort().map((week) => {
      const u = userWeeks.find((w) => w.week === week)
      const p = partnerWeeks.find((w) => w.week === week)
      return {
        date: week,
        userCount: u?.count ?? 0, userPoints: u?.points ?? 0,
        partnerCount: p?.count ?? 0, partnerPoints: p?.points ?? 0,
      }
    })
  }, [filtered, currentUserId, partner])
  const partnerTopTasks = useMemo(() => {
    if (!partner) return []
    return computeTopTasks(partnerFilteredCompletions)
  }, [partnerFilteredCompletions, partner])
  const myTopTasksComparison = useMemo(() => computeTopTasks(myFilteredCompletions), [myFilteredCompletions])
  const userHeatmap = useMemo(() => buildHeatmap(myFilteredCompletions), [myFilteredCompletions])
  const partnerHeatmap = useMemo(() => {
    if (!partner) return {}
    return buildHeatmap(partnerFilteredCompletions)
  }, [partnerFilteredCompletions, partner])
  const userCategoryData = useMemo(() => groupByCategory(myFilteredCompletions, categories), [myFilteredCompletions, categories])
  const partnerCategoryData = useMemo(() => {
    if (!partner) return []
    return groupByCategory(partnerFilteredCompletions, categories)
  }, [partnerFilteredCompletions, partner, categories])

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Statistiken</h1>

      {/* Tab pills */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('personal')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'personal' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Persönlich
        </button>
        <button
          type="button"
          onClick={() => setTab('comparison')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'comparison' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Vergleich
        </button>
      </div>

      {/* Date picker */}
      <div className="flex gap-2 mb-6">
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => setDateRange(e.target.value, to)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <span className="text-slate-400 self-center">—</span>
        <input
          type="date"
          value={to}
          min={from}
          onChange={(e) => setDateRange(from, e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {tab === 'personal' ? (
        <div className="space-y-4">
          {/* Row 1: Summary cards */}
          <SummaryCards taskCount={myTotalTasks} totalPoints={myTotalPoints} avgPerDay={myAvgPerDay} />

          {/* Row 2: Activity chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Aktivitäts-Verlauf</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setMetric('count')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'count' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Aufgaben
                </button>
                <button
                  onClick={() => setMetric('points')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'points' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Punkte
                </button>
              </div>
            </div>
            <ActivityChart
              mode="personal"
              metric={metric}
              personalData={useWeeks ? myWeekData.map((w) => ({ date: w.week, count: w.count, points: w.points })) : myDayData}
            />
          </div>

          {/* Row 3: Category + Top Tasks (2 col grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Kategorie-Verteilung</h2>
              <CategoryPieChart
                byCategory={Object.fromEntries(myCategoryData.map((c) => [c.categoryId, { [me?.name ?? 'Ich']: c.count }]))}
                categories={categories}
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Top-Aufgaben</h2>
              <TopTasks tasks={myTopTasks} />
            </div>
          </div>

          {/* Row 4: Heatmap */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Heatmap</h2>
            <Heatmap data={myHeatmap} from={from} to={to} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Row 1: Scoreboard */}
          <Scoreboard entries={scoreboard} />

          {/* Row 2: Filter + Activity chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-700">Aktivitäts-Verlauf</h2>
                <TaskFilter tasks={allTasks} value={filterTaskId} onChange={setFilterTaskId} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setMetric('count')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'count' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Aufgaben
                </button>
                <button
                  onClick={() => setMetric('points')}
                  className={`px-2 py-0.5 rounded text-xs ${metric === 'points' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Punkte
                </button>
              </div>
            </div>
            <ActivityChart
              mode="comparison"
              metric={metric}
              comparisonData={useWeeks ? comparisonWeekData : comparisonDayData}
              userName={me?.name ?? 'Ich'}
              partnerName={partner?.name ?? 'Partner'}
            />
          </div>

          {/* Row 3: Category + Top Tasks (2 col grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Kategorie-Verteilung</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 mb-1">{me?.name ?? 'Ich'}</p>
                  <CategoryPieChart
                    byCategory={Object.fromEntries(userCategoryData.map((c) => [c.categoryId, { [me?.name ?? 'Ich']: c.count }]))}
                    categories={categories}
                  />
                </div>
                {partner && (
                  <div>
                    <p className="text-xs font-semibold text-pink-600 mb-1">{partner.name}</p>
                    <CategoryPieChart
                      byCategory={Object.fromEntries(partnerCategoryData.map((c) => [c.categoryId, { [partner.name]: c.count }]))}
                      categories={categories}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Top-Aufgaben</h2>
              <div className="space-y-4">
                <TopTasks tasks={myTopTasksComparison} barColor="bg-indigo-400" label={`${me?.name ?? 'Ich'} Top 5`} />
                {partner && (
                  <TopTasks tasks={partnerTopTasks} barColor="bg-pink-400" label={`${partner.name} Top 5`} />
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Heatmaps */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Heatmaps</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-indigo-600 mb-1">{me?.name ?? 'Ich'}</p>
                <Heatmap data={userHeatmap} from={from} to={to} />
              </div>
              {partner && (
                <div>
                  <p className="text-xs font-semibold text-pink-600 mb-1">{partner.name}</p>
                  <Heatmap data={partnerHeatmap} from={from} to={to} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
