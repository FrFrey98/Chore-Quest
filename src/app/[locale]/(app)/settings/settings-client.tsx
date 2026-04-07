'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
import { BackupTab } from './tabs/backup-tab'

type Category = { id: string; name: string; emoji: string; taskCount: number }
type Achievement = {
  id: string; title: string; description: string; emoji: string
  conditionType: string; conditionValue: number; conditionMeta: string | null; sortOrder: number
}
type StoreItem = { id: string; title: string; emoji: string; pointCost: number; type: string; isActive: boolean }
type Task = { id: string; title: string; emoji: string; points: number; status: string; category: { id: string; name: string; emoji: string } }

const TAB_KEYS = ['users', 'streak', 'level', 'bonus', 'categories', 'achievements', 'tasks', 'store', 'notifications', 'backup'] as const

type TabKey = (typeof TAB_KEYS)[number]

export function SettingsClient({
  config, users, categories, achievements, storeItems, tasks, userId, notificationsEnabled, vapidPublicKey,
}: {
  config: GameConfig
  users: { id: string; name: string; role: string; createdAt: string; vacationStart: string | null; vacationEnd: string | null }[]
  categories: Category[]
  achievements: Achievement[]
  storeItems: StoreItem[]
  tasks: Task[]
  userId: string
  notificationsEnabled: boolean
  vapidPublicKey: string | null
}) {
  const t = useTranslations('settings')
  const [tab, setTab] = useState<TabKey>('users')

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t('heading')}</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-indigo-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {t(`tabs.${key === 'level' ? 'levels' : key}`)}
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
      {tab === 'backup' && <BackupTab />}
    </div>
  )
}
