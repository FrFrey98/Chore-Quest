/**
 * Calculate the health percentage of a recurring task.
 * Returns 1.0 if not yet due, 0.0 if fully decayed.
 * When vacation dates are provided, vacation time is excluded from decay.
 */
export function calculateHealth(
  nextDueAt: Date | string | null,
  decayHours: number,
  now: Date = new Date(),
  vacationStart?: Date | string | null,
  vacationEnd?: Date | string | null
): number {
  if (!nextDueAt || decayHours <= 0) return 1
  const dueDate = typeof nextDueAt === 'string' ? new Date(nextDueAt) : nextDueAt

  let effectiveNow = now

  // If vacation dates are provided, subtract vacation time from elapsed time
  if (vacationStart) {
    const vStart = typeof vacationStart === 'string' ? new Date(vacationStart) : vacationStart
    const vEnd = vacationEnd
      ? (typeof vacationEnd === 'string' ? new Date(vacationEnd) : vacationEnd)
      : now

    // Calculate overlap between [dueDate, now] and [vStart, vEnd]
    const overlapStart = Math.max(dueDate.getTime(), vStart.getTime())
    const overlapEnd = Math.min(now.getTime(), vEnd.getTime())

    if (overlapEnd > overlapStart) {
      const vacationMs = overlapEnd - overlapStart
      effectiveNow = new Date(now.getTime() - vacationMs)
    }
  }

  const hoursSinceDue = (effectiveNow.getTime() - dueDate.getTime()) / (1000 * 60 * 60)
  if (hoursSinceDue <= 0) return 1
  return Math.max(0, 1 - hoursSinceDue / decayHours)
}

/**
 * Get the effective decay hours for a task.
 */
export function getDecayHours(
  taskDecayHours: number | null | undefined,
  recurringInterval: string | null | undefined,
  decayHoursByInterval: Record<string, number>
): number {
  if (taskDecayHours && taskDecayHours > 0) return taskDecayHours
  if (recurringInterval && decayHoursByInterval[recurringInterval]) {
    return decayHoursByInterval[recurringInterval]
  }
  return 48
}

/**
 * Apply point decay to base points. Returns at least 1 point.
 */
export function applyPointDecay(basePoints: number, healthPercent: number): number {
  return Math.max(1, Math.floor(basePoints * Math.max(0.01, healthPercent)))
}

/**
 * Get the color class for a health percentage.
 */
export function getHealthColor(health: number): string {
  if (health > 0.5) return 'bg-success'
  if (health > 0.25) return 'bg-warning'
  if (health > 0) return 'bg-danger'
  return 'bg-danger'
}

/**
 * Check if the health bar should pulse (critically low).
 */
export function shouldPulse(health: number): boolean {
  return health > 0 && health <= 0.1
}
