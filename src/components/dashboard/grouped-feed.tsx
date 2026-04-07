'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { FeedGroup, FeedEntry } from '@/lib/dashboard'

function FeedRow({ entry, currentUserId }: { entry: FeedEntry; currentUserId: string }) {
  const t = useTranslations('dashboard')
  const isMe = entry.user.id === currentUserId
  const nameColor = isMe ? 'text-indigo-600' : 'text-pink-600'
  const emoji = entry.type === 'redemption' ? (entry.item?.emoji ?? '🎁') : (entry.task?.emoji ?? '✅')
  const title = entry.type === 'redemption' ? (entry.item?.title ?? '') : (entry.task?.title ?? '')
  const isShared = entry.type === 'completion' && !!entry.withUser

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm border-b border-slate-50 last:border-b-0">
      <span className="text-base">{emoji}</span>
      <span className={`font-semibold ${nameColor}`}>{entry.user.name}</span>
      {isShared && (
        <span className="text-slate-400">&amp;</span>
      )}
      {isShared && (
        <span className={`font-semibold ${entry.withUser!.id === currentUserId ? 'text-indigo-600' : 'text-pink-600'}`}>
          {entry.withUser!.name}
        </span>
      )}
      <span className="text-slate-600 truncate flex-1">{title}</span>
      {isShared && <span className="text-xs">👫</span>}
      {entry.type === 'redemption' ? (
        <span className="text-xs font-semibold text-amber-600 whitespace-nowrap">{t('feed.reward')}</span>
      ) : (
        <span className={`text-xs font-semibold whitespace-nowrap ${nameColor}`}>+{entry.points}</span>
      )}
    </div>
  )
}

export function GroupedFeed({ groups, currentUserId }: { groups: FeedGroup[]; currentUserId: string }) {
  const t = useTranslations('dashboard')
  // "Today" and "Yesterday" start expanded, rest collapsed
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const g of groups) {
      init[g.label] = g.label !== 'feed.today' && g.label !== 'feed.yesterday'
    }
    return init
  })

  function toggle(label: string) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🚀</p>
        <p className="text-lg font-semibold text-slate-700">{t('feed.empty')}</p>
        <p className="text-sm text-slate-400 mt-1">
          {t('feed.emptySubtitle')}
        </p>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {t('feed.heading')}
      </h2>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {groups.map((group) => (
          <div key={group.label}>
            <button
              onClick={() => toggle(group.label)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-left hover:bg-slate-100 transition-colors"
            >
              {collapsed[group.label] ? <ChevronRight size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              <span className="text-xs font-semibold text-slate-600 flex-1">{t(group.label)}</span>
              {collapsed[group.label] && (
                <span className="text-[10px] text-slate-400">
                  {t('feed.tasksSummary', { tasks: group.totalTasks, points: group.totalPoints })}
                </span>
              )}
            </button>
            {!collapsed[group.label] && (
              <div>
                {group.entries.map((entry) => (
                  <FeedRow key={entry.id} entry={entry} currentUserId={currentUserId} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
