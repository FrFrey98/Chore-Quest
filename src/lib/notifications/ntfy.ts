import type { NotificationPayload, NotificationProvider } from './types'

const NTFY_URL = process.env.NTFY_URL
const NTFY_TOPIC_PREFIX = process.env.NTFY_TOPIC_PREFIX || 'chore-quest'

export function getNtfyTopic(userId: string): string {
  return `${NTFY_TOPIC_PREFIX}-${userId}`
}

export const ntfyProvider: NotificationProvider = {
  name: 'ntfy',
  isConfigured: () => !!NTFY_URL,
  isEnabledForUser: (user) => user.ntfyEnabled,
  send: async (userId, payload) => {
    if (!NTFY_URL) return false
    try {
      const topic = getNtfyTopic(userId)
      const res = await fetch(`${NTFY_URL}/${topic}`, {
        method: 'POST',
        headers: {
          'Title': payload.title,
          'Tags': 'house',
          ...(payload.url ? { 'Click': payload.url } : {}),
        },
        body: payload.body,
      })
      return res.ok
    } catch {
      return false
    }
  },
}
