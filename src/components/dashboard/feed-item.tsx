type FeedEntry = {
  id: string
  type: 'completion'
  user: { id: string; name: string }
  task: { title: string; emoji: string }
  points: number
  at: string
}

export function FeedItem({ entry, currentUserId }: { entry: FeedEntry; currentUserId: string }) {
  const isMe = entry.user.id === currentUserId
  const time = new Date(entry.at).toLocaleString('de-DE', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`flex items-start gap-3 p-3 border-l-4 ${isMe ? 'border-indigo-400' : 'border-pink-400'} bg-white rounded-r-lg shadow-sm`}>
      <span className="text-2xl">{entry.task.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          <span className={isMe ? 'text-indigo-600' : 'text-pink-600'}>{entry.user.name}</span>
          {' '}hat{' '}
          <span className="font-semibold">"{entry.task.title}"</span>
          {' '}erledigt
        </p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
      <span className={`text-sm font-bold whitespace-nowrap ${isMe ? 'text-indigo-600' : 'text-pink-600'}`}>
        +{entry.points} Pkt
      </span>
    </div>
  )
}
