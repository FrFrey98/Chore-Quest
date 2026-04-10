import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "admin1", role: "admin" })),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// ---- in-memory prisma stub ----
const store = {
  appConfig: new Map<string, { key: string; value: string }>(),
  categories: new Map<string, { id: string; name: string; emoji: string; isSystem: boolean }>(),
  dogs: [] as Array<{ id: string; name: string; archivedAt: null | Date }>,
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

let txCallCount = 0

const makeTx = () => ({
  appConfig: {
    upsert: vi.fn(async ({ where, create, update }: any) => {
      const existing = store.appConfig.get(where.key)
      if (existing) {
        Object.assign(existing, update)
        return existing
      }
      store.appConfig.set(create.key, create)
      return create
    }),
  },
  category: {
    upsert: vi.fn(async ({ where, create, update }: any) => {
      const existing = store.categories.get(where.id)
      if (existing) {
        Object.assign(existing, update)
        return existing
      }
      store.categories.set(create.id, create)
      return create
    }),
  },
  dog: {
    findMany: vi.fn(async ({ where }: any) => {
      return store.dogs.filter((d) => {
        if (where?.archivedAt === null) return d.archivedAt === null
        return true
      })
    }),
  },
  task: {
    findFirst: vi.fn(async ({ where }: any) => {
      return (
        store.tasks.find(
          (t) =>
            t.categoryId === where.categoryId &&
            t.isSystem === where.isSystem &&
            (where.dogId !== undefined ? (t as any).dogId === where.dogId : t.title === where.title),
        ) ?? null
      )
    }),
    create: vi.fn(async ({ data }: any) => {
      const task = { id: `task-${store.tasks.length + 1}`, ...data }
      store.tasks.push(task)
      return task
    }),
    findMany: vi.fn(async ({ where }: any) => {
      return store.tasks.filter(
        (t) => t.categoryId === where.categoryId && t.isSystem === where.isSystem,
      )
    }),
  },
  dogSkillCategory: {
    upsert: vi.fn(async ({ create }: any) => create),
  },
  dogSkillDefinition: {
    upsert: vi.fn(async ({ create }: any) => create),
  },
  dogAchievement: {
    upsert: vi.fn(async ({ create }: any) => create),
  },
})

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (cb: any) => {
      txCallCount++
      return cb(makeTx())
    }),
    appConfig: {
      findUnique: vi.fn(async ({ where }: any) => store.appConfig.get(where.key) ?? null),
    },
    category: {
      findUnique: vi.fn(async ({ where }: any) => store.categories.get(where.id) ?? null),
    },
    task: {
      findMany: vi.fn(async ({ where }: any) => {
        return store.tasks.filter(
          (t) => t.categoryId === where.categoryId && t.isSystem === where.isSystem,
        )
      }),
    },
  },
}))

import { prisma } from "@/lib/prisma"
import { toggleDogTrainingFeature } from "@/app/actions/dog-training/toggle-feature"

function resetStore() {
  store.appConfig.clear()
  store.categories.clear()
  store.dogs.length = 0
  store.tasks.length = 0
  txCallCount = 0
}

describe("toggleDogTrainingFeature", () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
    // Re-bind mocks that capture store at closure time
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      txCallCount++
      return cb(makeTx())
    })
    vi.mocked(prisma.appConfig.findUnique).mockImplementation(
      (async ({ where }: any) => store.appConfig.get(where.key) ?? null) as any,
    )
    vi.mocked(prisma.category.findUnique).mockImplementation(
      (async ({ where }: any) => store.categories.get(where.id) ?? null) as any,
    )
    vi.mocked(prisma.task.findMany).mockImplementation(
      (async ({ where }: any) =>
        store.tasks.filter(
          (t) => t.categoryId === where.categoryId && t.isSystem === where.isSystem,
        )) as any,
    )
  })

  it("creates the dog_training category when enabled", async () => {
    await toggleDogTrainingFeature(true)
    const cat = await prisma.category.findUnique({ where: { id: "dog_training" } })
    expect(cat).toBeTruthy()
    expect(cat?.isSystem).toBe(true)
  })

  it("creates a recurring system task for each non-archived dog", async () => {
    store.dogs.push({ id: "dog-1", name: "Betty", archivedAt: null })
    store.dogs.push({ id: "dog-2", name: "Charlie", archivedAt: null })
    await toggleDogTrainingFeature(true)
    const tasks = await prisma.task.findMany({
      where: { categoryId: "dog_training", isSystem: true },
    })
    expect(tasks.length).toBe(2)
    expect(tasks[0].isRecurring).toBe(true)
    expect(tasks[0].recurringInterval).toBe("daily")
  })

  it("persists AppConfig key", async () => {
    await toggleDogTrainingFeature(true)
    const cfg = await prisma.appConfig.findUnique({ where: { key: "dog_training_enabled" } })
    expect(cfg?.value).toBe("true")
  })

  it("is idempotent — calling twice doesn't duplicate tasks", async () => {
    store.dogs.push({ id: "dog-1", name: "Betty", archivedAt: null })
    await toggleDogTrainingFeature(true)
    await toggleDogTrainingFeature(true)
    const tasks = await prisma.task.findMany({
      where: { categoryId: "dog_training", isSystem: true },
    })
    expect(tasks.length).toBe(1)
  })
})
