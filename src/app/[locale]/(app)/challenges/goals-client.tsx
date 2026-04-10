'use client'
import { ComponentProps, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChallengesClient } from './challenges-client'
import { QuestsClient } from '../quests/quests-client'

type GoalsClientProps = {
  initialTab: 'challenges' | 'quests'
  challengesProps: ComponentProps<typeof ChallengesClient>
  questsProps: ComponentProps<typeof QuestsClient>
}

export function GoalsClient({ initialTab, challengesProps, questsProps }: GoalsClientProps) {
  const t = useTranslations('goals')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'challenges' | 'quests'>(initialTab)

  // Sync tab from URL on mount and when searchParams change
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'quests' || tabParam === 'challenges') {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  function switchTab(tab: 'challenges' | 'quests') {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'challenges') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    const query = params.toString()
    router.replace(query ? `?${query}` : '?', { scroll: false })
  }

  return (
    <div>
      <h1 className="text-[1.75rem] font-light uppercase tracking-wide leading-tight mb-1">
        {t('heading')}
      </h1>
      <p className="text-sm text-muted-foreground mb-4">{t('subtitle')}</p>

      {/* Top-level tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => switchTab('challenges')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'challenges'
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {t('challengesTab')}
        </button>
        <button
          onClick={() => switchTab('quests')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'quests'
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {t('questsTab')}
        </button>
      </div>

      {activeTab === 'challenges' && <ChallengesClient {...challengesProps} />}
      {activeTab === 'quests' && <QuestsClient {...questsProps} />}
    </div>
  )
}
