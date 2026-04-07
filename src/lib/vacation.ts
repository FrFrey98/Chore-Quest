/**
 * Check if a user is currently on vacation.
 * Returns true if vacationStart is set and vacationEnd is null or in the future.
 */
export function isOnVacation(
  vacationStart: Date | string | null | undefined,
  vacationEnd: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!vacationStart) return false
  const start = typeof vacationStart === 'string' ? new Date(vacationStart) : vacationStart
  if (now < start) return false // hasn't started yet
  if (!vacationEnd) return true // indefinite
  const end = typeof vacationEnd === 'string' ? new Date(vacationEnd) : vacationEnd
  return now <= end
}

/**
 * Check if a specific date falls within a vacation period.
 */
export function isDateInVacation(
  date: Date,
  vacationStart: Date | string | null | undefined,
  vacationEnd: Date | string | null | undefined
): boolean {
  if (!vacationStart) return false
  const start = typeof vacationStart === 'string' ? new Date(vacationStart) : vacationStart
  if (date < start) return false
  if (!vacationEnd) return true
  const end = typeof vacationEnd === 'string' ? new Date(vacationEnd) : vacationEnd
  return date <= end
}
