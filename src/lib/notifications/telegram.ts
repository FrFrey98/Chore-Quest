import type { NotificationPayload, NotificationProvider } from './types'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export const telegramProvider: NotificationProvider = {
  name: 'telegram',
  isConfigured: () => !!BOT_TOKEN,
  isEnabledForUser: (user) => !!user.telegramChatId,
  send: async (userId, payload, user) => {
    if (!BOT_TOKEN || !user.telegramChatId) return false
    try {
      const text = `*${payload.title}*\n${payload.body}`
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegramChatId,
          text,
          parse_mode: 'Markdown',
        }),
      })
      return res.ok
    } catch {
      return false
    }
  },
}
