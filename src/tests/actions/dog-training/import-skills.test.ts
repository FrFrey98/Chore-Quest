import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => ({ id: "user-1", role: "admin" })),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// ---- in-memory prisma stub ----
const store = {
  categories: new Map<string, { id: string }>(),
  skills: new Map<
    string,
    {
      id: string
      categoryId: string
      nameDe: string
      nameEn: string
      descriptionDe: string
      descriptionEn: string
      difficulty: string
      phase: string
      prerequisiteIds: string | null
      isSystem: boolean
      createdById: string
      sortOrder: number
    }
  >(),
}

const makeTx = () => ({
  dogSkillDefinition: {
    create: vi.fn(async ({ data }: any) => {
      const row = { ...data }
      store.skills.set(data.id, row)
      return row
    }),
  },
})

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (cb: any) => cb(makeTx())),
    dogSkillCategory: {
      findMany: vi.fn(async () => Array.from(store.categories.values())),
    },
    dogSkillDefinition: {
      findMany: vi.fn(async () => Array.from(store.skills.values())),
    },
  },
}))

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { importDogSkills } from "@/app/actions/dog-training/import-skills"

const validJson = JSON.stringify({
  skills: [
    {
      id: "custom_test_skill",
      categoryId: "tricks",
      nameDe: "Test Skill",
      nameEn: "Test Skill",
      descriptionDe: "Dies ist eine ausreichend lange Beschreibung zum Testen.",
      descriptionEn: "This is a sufficiently long description for testing.",
      difficulty: "intermediate",
      phase: "adult",
      prerequisiteIds: [],
    },
  ],
})

function resetStore() {
  store.categories.clear()
  store.skills.clear()
}

describe("importDogSkills", () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1", role: "admin" } as any)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(makeTx()))
    vi.mocked(prisma.dogSkillCategory.findMany).mockImplementation(
      (async () => Array.from(store.categories.values())) as any,
    )
    vi.mocked(prisma.dogSkillDefinition.findMany).mockImplementation(
      (async () => Array.from(store.skills.values())) as any,
    )
    // seed the known category
    store.categories.set("tricks", { id: "tricks" })
  })

  it("imports a valid skill with isSystem: false and createdById set", async () => {
    const result = await importDogSkills(validJson)

    expect(result.errors).toHaveLength(0)
    expect(result.skipped).toHaveLength(0)
    expect(result.imported).toHaveLength(1)

    const skill = result.imported[0]
    expect(skill.id).toBe("custom_test_skill")
    expect(skill.isSystem).toBe(false)
    expect(skill.createdById).toBe("user-1")
  })

  it("returns errors for invalid JSON input", async () => {
    const result = await importDogSkills("not valid json at all")

    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.imported).toHaveLength(0)
  })

  it("skips a skill whose ID already exists", async () => {
    // pre-seed the skill as already existing
    store.skills.set("custom_test_skill", {
      id: "custom_test_skill",
      categoryId: "tricks",
      nameDe: "Old",
      nameEn: "Old",
      descriptionDe: "Old description that is long enough.",
      descriptionEn: "Old description that is long enough.",
      difficulty: "beginner",
      phase: "puppy",
      prerequisiteIds: null,
      isSystem: true,
      createdById: "system",
      sortOrder: 1,
    })

    const result = await importDogSkills(validJson)

    expect(result.skipped).toHaveLength(1)
    expect(result.skipped[0].id).toBe("custom_test_skill")
    expect(result.imported).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it("returns errors for an unknown category", async () => {
    const jsonWithBadCategory = JSON.stringify({
      skills: [
        {
          id: "custom_test_skill",
          categoryId: "nonexistent_category",
          nameDe: "Test Skill",
          nameEn: "Test Skill",
          descriptionDe: "Dies ist eine ausreichend lange Beschreibung zum Testen.",
          descriptionEn: "This is a sufficiently long description for testing.",
          difficulty: "intermediate",
          phase: "adult",
          prerequisiteIds: [],
        },
      ],
    })

    const result = await importDogSkills(jsonWithBadCategory)

    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.imported).toHaveLength(0)
  })

  it("throws when user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any)

    await expect(importDogSkills(validJson)).rejects.toThrow("Nicht eingeloggt")
  })
})
