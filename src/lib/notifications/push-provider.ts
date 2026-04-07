import { sendPush, isPushConfigured } from '../push'
import type { NotificationPayload, NotificationProvider } from './types'
import { prisma } from '../prisma'

export const pushProvider: NotificationProvider = {
  name: 'push',
  isConfigured: () => isPushConfigured(),
  isEnabledForUser: (user) => user.notificationsEnabled,
  send: async (userId, payload) => {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })
    let sent = false
    for (const sub of subscriptions) {
      const result = await sendPush(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        {
          title: payload.title,
          body: payload.body,
          data: payload.url ? { url: payload.url } : undefined,
        },
      )
      if (result) sent = true
      if (result === false) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      }
    }
    return sent
  },
}
