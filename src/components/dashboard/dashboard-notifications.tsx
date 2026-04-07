'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/toast-provider'

export function DashboardNotifications() {
  const { toast } = useToast()
  const t = useTranslations('dashboard')
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (checked) return
    setChecked(true)

    fetch('/api/notifications/redeemed')
      .then(r => r.ok ? r.json() : [])
      .then((notifications: { id: string; userName: string; itemTitle: string; itemEmoji: string }[]) => {
        if (notifications.length === 0) return

        for (const n of notifications) {
          toast(t('redeemed', { emoji: n.itemEmoji, name: n.userName, title: n.itemTitle }), 'info')
        }

        fetch('/api/notifications/redeemed', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: notifications.map(n => n.id) }),
        }).catch(() => {})
      })
      .catch(() => {})
  }, [checked, toast, t])

  return null
}
