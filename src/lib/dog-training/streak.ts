export function calculateStreak(sessionDates: Date[], now: Date): number {
  if (sessionDates.length === 0) return 0

  const toDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

  const dateStrings = new Set(sessionDates.map(toDateString))

  let current = new Date(now)
  const today = toDateString(now)

  if (!dateStrings.has(today)) {
    current.setDate(current.getDate() - 1)
    if (!dateStrings.has(toDateString(current))) return 0
  }

  let streak = 0
  for (let i = 0; i < 365; i++) {
    const key = toDateString(current)
    if (!dateStrings.has(key)) break
    streak++
    current = new Date(current)
    current.setDate(current.getDate() - 1)
  }

  return streak
}
