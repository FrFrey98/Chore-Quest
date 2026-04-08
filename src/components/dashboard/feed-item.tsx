'use client'
import { useTranslations, useLocale } from 'next-intl'

type FeedEntry = {
  id: string
  type: 'completion'
  user: { id: string; name: string }
  task: { title: string; emoji: string }
  points: number
  at: string
}

export function FeedItem({ entry, currentUserId }: { entry: FeedEntry; currentUserId: string }) {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const locale = useLocale()
  const isMe = entry.user.id === currentUserId
  const time = new Date(entry.at).toLocaleString(locale, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`flex items-start gap-3 p-3 border-l-4 ${isMe ? 'border-accent' : 'border-partner'} bg-card rounded-r-lg shadow-sm`}>
      <span className="text-2xl">{entry.task.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          <span className={isMe ? 'text-accent' : 'text-partner'}>{entry.user.name}</span>
          {t('feed.verb') ? ` ${t('feed.verb')} ` : ' '}
          <span className="font-semibold">&ldquo;{entry.task.title}&rdquo;</span>
          {' '}{t('feed.completed')}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <span className={`text-sm font-bold whitespace-nowrap ${isMe ? 'text-accent' : 'text-partner'}`}>
        +{entry.points} {tc('points')}
      </span>
    </div>
  )
}
