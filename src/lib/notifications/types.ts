export interface NotificationPayload {
  title: string
  body: string
  url?: string
}

export interface NotificationProvider {
  name: string
  isConfigured(): boolean
  isEnabledForUser(user: { notificationsEnabled: boolean; telegramChatId: string | null; ntfyEnabled: boolean }): boolean
  send(userId: string, payload: NotificationPayload, user: any): Promise<boolean>
}
