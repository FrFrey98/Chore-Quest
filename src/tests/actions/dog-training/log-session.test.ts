import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "user1", role: "member" })),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// ---- in-memory store ----
const store = {
  dogs: [] as Array<{
    id: string
    name: string
    phase: string
    archivedAt: Date | null
    vacationStart: Date | null
    vacationEnd: Date | null
  }>,
  users: [] as Array<{ vacationStart: Date | null; vacationEnd: Date | null }>,
  skillDefs: [] as Array<{
    id: string
    phase: string
    prerequisiteIds: string | null
    categoryId?: string
  }>,
  skillProgresses: [] as Array<{
    dogId: string
    skillDefinitionId: string
    status: string
    progress: number
    bestStatus: string
    trainedCount: number
    firstTrainedAt: Date | null
    lastTrainedAt: Date | null
  }>,
  sessions: [] as Array<{
    id: string
    dogId: string
    userId: string
    pointsAwarded: number
    completedAt?: Date
    withUserId?: string | null
  }>,
  tasks: [] as Array<{
    id: string
    title: string
    categoryId: string
    isSystem: boolean
  }>,
  taskCompletions: [] as Array<{ id: string; taskId: string; userId: string; points: number }>,
  achievements: [] as Array<{ id: string; conditionType: string; conditionValue: number; conditionMeta: any }>,
  userDogAchievements: [] as Array<{ id: string; userId: string; dogId: string; achievementId: string }>,
}

const makeTx = () => ({
  dog: {
    findUnique: vi.fn(async ({ where }: any) => store.dogs.find((d) => d.id === where.id) ?? null),
  },
  user: {
    findMany: vi.fn(async () => store.users),
  },
  dogSkillDefinition: {
    findMany: vi.fn(async (args?: any) => {
      const where = args?.where
      if (where?.id?.in) {
        return store.skillDefs.filter((d) => where.id.in.includes(d.id))
      }
      return store.skillDefs
    }),
  },
  dogSkillProgress: {
    findMany: vi.fn(async ({ where }: any) =>
      store.skillProgresses.filter((p) => p.dogId === where.dogId),
    ),
    upsert: vi.fn(async ({ where, create, update }: any) => {
      const idx = store.skillProgresses.findIndex(
        (p) =>
          p.dogId === where.dogId_skillDefinitionId.dogId &&
          p.skillDefinitionId === where.dogId_skillDefinitionId.skillDefinitionId,
      )
      if (idx >= 0) {
        Object.assign(store.skillProgresses[idx], update)
        return store.skillProgresses[idx]
      }
      store.skillProgresses.push(create)
      return create
    }),
  },
  dogTrainingSession: {
    aggregate: vi.fn(async () => ({ _sum: { pointsAwarded: 0 } })),
    findMany: vi.fn(async ({ where }: any) =>
      store.sessions.filter((s) => s.dogId === where.dogId),
    ),
    create: vi.fn(async ({ data }: any) => {
      const session = {
        id: `session-${store.sessions.length + 1}`,
        dogId: data.dogId,
        userId: data.userId,
        pointsAwarded: data.pointsAwarded,
        durationMinutes: data.durationMinutes,
        moodLevel: data.moodLevel ?? null,
        sessionType: data.sessionType ?? null,
        notes: data.notes ?? null,
        taskCompletionId: data.taskCompletionId ?? null,
        completedAt: data.completedAt ?? new Date(),
        withUserId: data.withUserId ?? null,
      }
      store.sessions.push(session)
      return session
    }),
  },
  dogAchievement: {
    findMany: vi.fn(async () => store.achievements),
  },
  userDogAchievement: {
    findMany: vi.fn(async ({ where }: any) =>
      store.userDogAchievements.filter(
        (u) => u.userId === where.userId && u.dogId === where.dogId,
      ),
    ),
    create: vi.fn(async ({ data }: any) => {
      const entry = { id: `uda-${store.userDogAchievements.length + 1}`, ...data }
      store.userDogAchievements.push(entry)
      return entry
    }),
  },
  task: {
    findFirst: vi.fn(async ({ where }: any) =>
      store.tasks.find(
        (t) => t.categoryId === where.categoryId && t.isSystem === where.isSystem && t.title === where.title,
      ) ?? null,
    ),
  },
  taskCompletion: {
    create: vi.fn(async ({ data }: any) => {
      const c = { id: `tc-${store.taskCompletions.length + 1}`, ...data }
      store.taskCompletions.push(c)
      return c
    }),
  },
})

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (cb: any) => cb(makeTx())),
  },
}))

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { logDogTrainingSession } from "@/app/actions/dog-training/log-session"

function resetStore() {
  store.dogs.length = 0
  store.users.length = 0
  store.skillDefs.length = 0
  store.skillProgresses.length = 0
  store.sessions.length = 0
  store.tasks.length = 0
  store.taskCompletions.length = 0
  store.achievements.length = 0
  store.userDogAchievements.length = 0
}

function seedDog(overrides: Partial<(typeof store.dogs)[0]> = {}) {
  const dog = {
    id: "dog1",
    name: "Bello",
    phase: "adult",
    archivedAt: null,
    vacationStart: null,
    vacationEnd: null,
    ...overrides,
  }
  store.dogs.push(dog)
  return dog
}

function seedSkillDef(id: string) {
  const def = { id, phase: "adult", prerequisiteIds: null }
  store.skillDefs.push(def)
  return def
}

const VALID_INPUT = {
  dogId: "dog1",
  skills: [{ skillDefinitionId: "skill1", rating: "good" as const }],
  durationMinutes: 15,
}

describe("logDogTrainingSession", () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(makeTx()))
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user1", role: "member" })
  })

  it("throws when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)
    seedDog()
    seedSkillDef("skill1")
    await expect(logDogTrainingSession(VALID_INPUT)).rejects.toThrow("Nicht eingeloggt")
  })

  it("throws validation error for empty skills array", async () => {
    seedDog()
    await expect(
      logDogTrainingSession({ ...VALID_INPUT, skills: [] }),
    ).rejects.toThrow()
  })

  it("throws validation error for invalid duration", async () => {
    seedDog()
    seedSkillDef("skill1")
    await expect(
      logDogTrainingSession({ ...VALID_INPUT, durationMinutes: 99 }),
    ).rejects.toThrow()
  })

  it("throws when dog is not found", async () => {
    // no dog seeded
    seedSkillDef("skill1")
    await expect(logDogTrainingSession(VALID_INPUT)).rejects.toThrow("Hund nicht gefunden")
  })

  it("throws when dog is archived", async () => {
    seedDog({ archivedAt: new Date() })
    seedSkillDef("skill1")
    await expect(logDogTrainingSession(VALID_INPUT)).rejects.toThrow("Hund ist archiviert")
  })

  it("throws when skill definition is unknown", async () => {
    seedDog()
    // skill1 not seeded
    await expect(logDogTrainingSession(VALID_INPUT)).rejects.toThrow("Unbekannter Skill im Input")
  })

  it("returns session with pointsAwarded >= 0 for valid input", async () => {
    seedDog()
    seedSkillDef("skill1")
    const result = await logDogTrainingSession(VALID_INPUT)
    expect(result).toBeTruthy()
    expect(result.session).toBeTruthy()
    expect(result.pointsAwarded).toBeGreaterThanOrEqual(0)
    expect(typeof result.capped).toBe("boolean")
    expect(Array.isArray(result.newAchievements)).toBe(true)
  })

  it("creates a skill progress entry for the trained skill", async () => {
    seedDog()
    seedSkillDef("skill1")
    await logDogTrainingSession(VALID_INPUT)
    expect(store.skillProgresses).toHaveLength(1)
    expect(store.skillProgresses[0].skillDefinitionId).toBe("skill1")
  })

  it("creates a TaskCompletion when a system task exists", async () => {
    seedDog()
    seedSkillDef("skill1")
    store.tasks.push({
      id: "task1",
      title: "🐕 Bello trainieren",
      categoryId: "dog_training",
      isSystem: true,
    })
    await logDogTrainingSession(VALID_INPUT)
    expect(store.taskCompletions).toHaveLength(1)
    expect(store.taskCompletions[0].taskId).toBe("task1")
    expect(store.sessions[0].taskCompletionId).toBe("tc-1")
  })

  it("does not create a TaskCompletion when no system task exists", async () => {
    seedDog()
    seedSkillDef("skill1")
    await logDogTrainingSession(VALID_INPUT)
    expect(store.taskCompletions).toHaveLength(0)
    expect(store.sessions[0].taskCompletionId).toBeNull()
  })
})
