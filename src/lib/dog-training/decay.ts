import type { SkillStatus } from "./types"
import { DECAY_RATES } from "./constants"
import { previousStatus, statusRank, maxStatus } from "./status"

export type VacationRange = {
  vacationStart: Date | null
  vacationEnd: Date | null
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfDay(d: Date): number {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

function isDayInRange(dayStart: number, range: VacationRange): boolean {
  if (!range.vacationStart || !range.vacationEnd) return false
  const start = startOfDay(range.vacationStart)
  const end = startOfDay(range.vacationEnd)
  return dayStart >= start && dayStart <= end
}

export function calculateActiveDays(
  from: Date,
  to: Date,
  dog: VacationRange,
  householdUsers: VacationRange[],
): number {
  const fromTs = startOfDay(from)
  const toTs = startOfDay(to)
  if (toTs <= fromTs) return 0

  let active = 0
  for (let ts = fromTs + MS_PER_DAY; ts <= toTs; ts += MS_PER_DAY) {
    const dogVacation = isDayInRange(ts, dog)
    const allUsersVacation =
      householdUsers.length > 0 &&
      householdUsers.every((u) => isDayInRange(ts, u))
    if (!dogVacation && !allUsersVacation) {
      active++
    }
  }
  return active
}

export type ApplyDecayInput = {
  status: SkillStatus
  progress: number
  bestStatus: SkillStatus
  lastTrainedAt: Date | null
  now: Date
  dog: VacationRange
  users: VacationRange[]
}

export type EffectiveState = {
  status: SkillStatus
  progress: number
}

export function applyDecay(input: ApplyDecayInput): EffectiveState {
  if (input.status === "new" || !input.lastTrainedAt) {
    return { status: input.status, progress: input.progress }
  }

  const activeDays = calculateActiveDays(
    input.lastTrainedAt,
    input.now,
    input.dog,
    input.users,
  )
  if (activeDays === 0) {
    return { status: input.status, progress: input.progress }
  }

  let status = input.status
  let progress = input.progress
  let remainingDays = activeDays

  while (remainingDays > 0 && status !== "new") {
    const rate = DECAY_RATES[status]
    if (rate === 0) break

    const daysUntilZero = progress / rate
    if (daysUntilZero >= remainingDays) {
      progress = progress - rate * remainingDays
      remainingDays = 0
    } else {
      remainingDays = remainingDays - daysUntilZero
      const prev = previousStatus(status)
      if (!prev || prev === "new") {
        status = "new"
        progress = 0
        remainingDays = 0
        break
      }
      status = prev
      progress = 1.0
    }
  }

  // bestStatus floor
  if (statusRank(status) < statusRank(input.bestStatus)) {
    status = input.bestStatus
    progress = 0
  }

  return { status, progress: Math.max(0, progress) }
}
