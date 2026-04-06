'use client'
import { useState } from 'react'
import { type GameConfig } from '@/lib/config'
import { UsersTab } from './tabs/users-tab'
import { StreakTab } from './tabs/streak-tab'
import { LevelTab } from './tabs/level-tab'
import { BonusTab } from './tabs/bonus-tab'
import { CategoriesTab } from './tabs/categories-tab'
import { AchievementsTab } from './tabs/achievements-tab'
import { TasksTab } from './tabs/tasks-tab'
import { StoreTab } from './tabs/store-tab'
import { NotificationsTab } from './tabs/notifications-tab'

type Category = { id: string; name: string; emoji: string; taskCount: number }
type Achievement = {
  id: string; title: string; description: string; emoji: string
  conditionType: string; conditionValue: number; conditionMeta: string | null; sortOrder: number
}
type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: { id: string; name: string; emoji: string } }

const TABS = [
  { key: 'users', label: 'Benutzer' },
  { key: 'streak', label: 'Streak' },
  { key: 'level', label: 'Level' },
  { key: 'bonus', label: 'Boni' },
  { key: 'categories', label: 'Kategorien' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'store', label: 'Store' },
  { key: 'notifications', label: 'Benachrichtigungen' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function SettingsClient({
  config, users, categories, achievements, storeItems, tasks, userId, notificationsEnabled, vapidPublicKey,
}: {
  config: GameConfig
  users: { id: string; name: string; role: string; createdAt: string }[]
  categories: Category[]
  achievements: Achievement[]
  storeItems: StoreItem[]
  tasks: Task[]
  userId: string
  notificationsEnabled: boolean
  vapidPublicKey: string | null
}) {
  const [tab, setTab] = useState<TabKey>('users')

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Einstellungen</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab users={users} currentUserId={userId} />}
      {tab === 'streak' && <StreakTab config={config} />}
      {tab === 'level' && <LevelTab config={config} />}
      {tab === 'bonus' && <BonusTab config={config} />}
      {tab === 'categories' && <CategoriesTab categories={categories} />}
      {tab === 'achievements' && <AchievementsTab achievements={achievements} categories={categories} />}
      {tab === 'tasks' && <TasksTab tasks={tasks} categories={categories} users={users.map((u) => ({ id: u.id, name: u.name }))} userId={userId} />}
      {tab === 'store' && <StoreTab storeItems={storeItems} />}
      {tab === 'notifications' && <NotificationsTab userId={userId} notificationsEnabled={notificationsEnabled} vapidPublicKey={vapidPublicKey} />}
    </div>
  )
}
