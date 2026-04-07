'use client'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Heatmap } from '@/components/stats/heatmap'

type Purchase = {
  id: string
  purchasedAt: string
  redeemedAt: string | null
  pointsSpent: number
  item: { title: string; emoji: string; type: string }
}
type Level = { level: number; title: string; minPoints: number }

type Personal = {
  heatmap: Record<string, number>
  topTasks: { id: string; title: string; emoji: string; count: number }[]
  streak: number
  totalCompletions: number
  totalPointsEarned: number
  level: Level
  purchases: Purchase[]
}

type AchievementsSummary = {
  total: number
  unlocked: number
  previews: { id: string; emoji: string; unlocked: boolean }[]
}

export function ProfileClient({
  userName,
  userId,
  personal,
  achievementsSummary,
  isOwnProfile,
}: {
  userName: string
  userId: string
  personal: Personal
  achievementsSummary: AchievementsSummary
  isOwnProfile: boolean
}) {
  const t = useTranslations('profile')
  const tc = useTranslations('common')
  const ta = useTranslations('achievements')
  const locale = useLocale()

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{userName}</h1>
            <p className="text-sm text-slate-500">
              {t('levelSubtitle', { level: personal.level.level, title: personal.level.title })}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-400">{tc('pointsFull')}</p>
            <p className="font-bold text-indigo-700">{personal.totalPointsEarned.toLocaleString()}</p>
          </div>
          {isOwnProfile && (
            <Link href="/settings" className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <span>🔥</span>
            <span className="font-semibold">{t('stats.streakValue', { days: personal.streak })}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <span>✓</span>
            <span className="font-semibold">{personal.totalCompletions}</span>
            <span className="text-slate-400">{t('stats.tasks')}</span>
          </div>
        </div>

        {/* Achievements preview */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {achievementsSummary.previews.slice(0, 8).map((a) => (
              <span
                key={a.id}
                className={`text-lg ${a.unlocked ? '' : 'opacity-25 grayscale'}`}
                title={a.unlocked ? ta('unlocked') : ta('locked')}
              >
                {a.emoji}
              </span>
            ))}
          </div>
          <Link
            href="/achievements"
            className="text-xs text-indigo-600 ml-auto hover:underline"
          >
            {achievementsSummary.unlocked}/{achievementsSummary.total} →
          </Link>
        </div>
      </div>

      {/* Stats section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('stats.heading')}</h2>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('stats.tasks'), value: personal.totalCompletions },
            { label: t('stats.pointsEarned'), value: personal.totalPointsEarned.toLocaleString() },
            { label: t('stats.streak'), value: t('stats.streakValue', { days: personal.streak }) },
            { label: t('stats.level'), value: t('stats.levelValue', { level: personal.level.level, title: personal.level.title }) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="font-bold text-indigo-700">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t('heatmap')}
          </p>
          <Heatmap data={personal.heatmap} />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t('topTasks')}
          </p>
          <div className="space-y-2">
            {personal.topTasks.length === 0 && (
              <p className="text-slate-400 text-sm">{t('noTasks')}</p>
            )}
            {personal.topTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span>{t.emoji}</span>
                <span className="text-sm flex-1">{t.title}</span>
                <span className="text-sm font-bold text-indigo-600">{t.count}×</span>
              </div>
            ))}
          </div>
        </div>

        {isOwnProfile && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {t('purchaseHistory')}
            </p>
            {personal.purchases.length === 0 ? (
              <p className="text-slate-400 text-sm">{t('noPurchases')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left pb-2">{t('tableHeaders.item')}</th>
                    <th className="text-right pb-2">{t('tableHeaders.date')}</th>
                    <th className="text-right pb-2">{t('tableHeaders.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.purchases.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2">
                        {p.item.emoji} {p.item.title}
                      </td>
                      <td className="py-2 text-right text-slate-500 text-xs">
                        {new Date(p.purchasedAt).toLocaleDateString(locale)}
                      </td>
                      <td className="py-2 text-right">
                        {p.redeemedAt ? (
                          <span className="text-green-600 text-xs">{t('statusRedeemed')}</span>
                        ) : p.item.type === 'real_reward' ? (
                          <span className="text-amber-500 text-xs">{t('statusPending')}</span>
                        ) : (
                          <span className="text-indigo-600 text-xs">✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

