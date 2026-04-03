import { getLevel } from '@/lib/points'
import { type LevelDef } from '@/lib/config'

type UserStat = { id: string; name: string; earned: number; spent: number }

export function PointsHeader({ users, levels }: { users: UserStat[]; levels?: LevelDef[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {users.map((u, i) => {
        const balance = Math.max(0, u.earned - u.spent)
        const { title } = getLevel(u.earned, levels)
        // Use static classes instead of dynamic bg-${color}-500
        const cardClass = i === 0
          ? 'rounded-2xl p-4 bg-indigo-500 text-white'
          : 'rounded-2xl p-4 bg-pink-500 text-white'
        return (
          <div key={u.id} className={cardClass}>
            <p className="text-xs opacity-75 uppercase tracking-wide">{u.name}</p>
            <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">{title}</p>
          </div>
        )
      })}
    </div>
  )
}
