import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "user1", role: "member" })),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// ---- in-memory prisma stub ----
const store = {
  appConfig: new Map<string, { key: string; value: string }>(),
  dogs: [] as Array<{
    id: string
    name: string
    emoji: string
    photoBase64: string | null
    breed: string | null
    gender: string | null
    birthDate: Date | null
    phase: string
    notes: string | null
    archivedAt: null | Date
  }>,
  tasks: [] as Array<{
    id: string
    title: string
    emoji: string
    points: number
    isRecurring: boolean
    recurringInterval: string | null
    status: string
    categoryId: string
    createdById: string
    allowMultiple: boolean
    isSystem: boolean
  }>,
}

const makeTx = () => ({
  appConfig: {
    findUnique: vi.fn(async ({ where }: any) => store.appConfig.get(where.key) ?? null),
  },
  dog: {
    create: vi.fn(async ({ data }: any) => {
      const dog = { id: `dog-${store.dogs.length + 1}`, archivedAt: null, ...data }
      store.dogs.push(dog)
      return dog
    }),
  },
  task: {
    findFirst: vi.fn(async ({ where }: any) => {
      return (
        store.tasks.find(
          (t) =>
            t.categoryId === where.categoryId &&
            t.isSystem === where.isSystem &&
            t.title === where.title,
        ) ?? null
      )
    }),
    create: vi.fn(async ({ data }: any) => {
      const task = { id: `task-${store.tasks.length + 1}`, ...data }
      store.tasks.push(task)
      return task
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
import { createDog } from "@/app/actions/dog-training/create-dog"

function resetStore() {
  store.appConfig.clear()
  store.dogs.length = 0
  store.tasks.length = 0
}

describe("createDog", () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(makeTx()))
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user1", role: "member" })
  })

  it("creates a dog and returns it", async () => {
    const dog = await createDog({ name: "Betty", phase: "adult", emoji: "🐕" })
    expect(dog).toBeTruthy()
    expect(dog.name).toBe("Betty")
    expect(dog.phase).toBe("adult")
    expect(dog.emoji).toBe("🐕")
    expect(store.dogs).toHaveLength(1)
  })

  it("auto-creates system task when feature is enabled", async () => {
    store.appConfig.set("dog_training_enabled", { key: "dog_training_enabled", value: "true" })
    await createDog({ name: "Betty", phase: "adult", emoji: "🐕" })
    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe("🐕 Betty trainieren")
    expect(store.tasks[0].isSystem).toBe(true)
  })

  it("does not create system task when feature is disabled", async () => {
    store.appConfig.set("dog_training_enabled", { key: "dog_training_enabled", value: "false" })
    await createDog({ name: "Betty", phase: "adult", emoji: "🐕" })
    expect(store.tasks).toHaveLength(0)
  })

  it("does not create system task when feature config is absent", async () => {
    await createDog({ name: "Betty", phase: "adult", emoji: "🐕" })
    expect(store.tasks).toHaveLength(0)
  })

  it("throws when name is empty", async () => {
    await expect(createDog({ name: "", phase: "adult", emoji: "🐕" })).rejects.toThrow()
  })

  it("throws when phase is invalid", async () => {
    await expect(
      createDog({ name: "Betty", phase: "invalid_phase" as any, emoji: "🐕" }),
    ).rejects.toThrow()
  })

  it("throws when user is not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)
    await expect(createDog({ name: "Betty", phase: "adult", emoji: "🐕" })).rejects.toThrow(
      "Nicht eingeloggt",
    )
  })
})
