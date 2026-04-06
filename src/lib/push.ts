import webpush from 'web-push'

let vapidInitialized = false

function ensureVapid() {
  if (vapidInitialized) return
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!pub || !priv || !subject) return
  webpush.setVapidDetails(subject, pub, priv)
  vapidInitialized = true
}

export function isPushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT)
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null
}

export async function sendPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: object,
): Promise<boolean> {
  ensureVapid()
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode
    if (status === 410 || status === 404) {
      return false // subscription expired
    }
    throw err
  }
}

export type NotificationPayload = {
  title: string
  body: string
  data: { url: string }
}

export function buildNotificationPayload(task: { emoji: string; title: string }): NotificationPayload {
  return {
    title: 'Chore-Quest',
    body: `${task.emoji} ${task.title}`,
    data: { url: '/tasks' },
  }
}

type TaskForNotification = {
  scheduleTime: string | null
  scheduleDays: string | null
  nextDueAt: Date | null
  lastNotifiedAt: Date | null
}

const DAY_MAP: Record<number, string> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
}

export function isTaskDueForNotification(task: TaskForNotification, now: Date): boolean {
  if (!task.scheduleTime) return false

  const [hours, minutes] = task.scheduleTime.split(':').map(Number)
  if (now.getUTCHours() !== hours || now.getUTCMinutes() !== minutes) return false

  // Check if already notified today
  if (task.lastNotifiedAt) {
    const lastStr = task.lastNotifiedAt.toISOString().slice(0, 10)
    const nowStr = now.toISOString().slice(0, 10)
    if (lastStr === nowStr) return false
  }

  // Check if due today via nextDueAt
  if (task.nextDueAt) {
    const todayStr = now.toISOString().slice(0, 10)
    const dueStr = task.nextDueAt.toISOString().slice(0, 10)
    if (dueStr <= todayStr) return true
  }

  // Check if due today via scheduleDays
  if (task.scheduleDays) {
    const todayDay = DAY_MAP[now.getUTCDay()]
    return task.scheduleDays.split(',').includes(todayDay)
  }

  return false
}
