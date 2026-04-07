import type { NotificationPayload } from './types'
import { pushProvider } from './push-provider'
import { telegramProvider } from './telegram'
import { ntfyProvider } from './ntfy'
import { prisma } from '../prisma'

const providers = [pushProvider, telegramProvider, ntfyProvider]

export async function dispatchNotification(
  userId: string,
  payload: NotificationPayload
): Promise<{ sent: string[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notificationsEnabled: true,
      telegramChatId: true,
      ntfyEnabled: true,
    },
  })

  if (!user) return { sent: [] }

  const sent: string[] = []
  for (const provider of providers) {
    if (provider.isConfigured() && provider.isEnabledForUser(user)) {
      const success = await provider.send(userId, payload, user)
      if (success) sent.push(provider.name)
    }
  }

  return { sent }
}

export function getConfiguredProviders(): string[] {
  return providers.filter(p => p.isConfigured()).map(p => p.name)
}
