import { describe, it, expect } from "vitest"
import { buildSkillExtensionPrompt } from "@/lib/dog-training/prompt-generator"

describe("buildSkillExtensionPrompt", () => {
  const baseInput = {
    dog: { name: "Betty", breed: "Labradoodle", phase: "adult" as const },
    categories: [
      { id: "basic_obedience", nameDe: "Grundgehorsam", nameEn: "Basic Obedience" },
      { id: "tricks", nameDe: "Tricks", nameEn: "Tricks" },
    ],
    selectedCategoryIds: ["tricks"],
    existingSkills: [
      { id: "paw", categoryId: "tricks", nameDe: "Pfote", nameEn: "Paw", difficulty: "beginner" },
      { id: "spin", categoryId: "tricks", nameDe: "Dreh dich", nameEn: "Spin", difficulty: "beginner" },
    ],
    count: 5,
    difficulty: "intermediate" as const,
    focusText: "Tricks für mentale Auslastung",
  }

  it("includes the dog context", () => {
    const prompt = buildSkillExtensionPrompt(baseInput)
    expect(prompt).toContain("Betty")
    expect(prompt).toContain("Labradoodle")
    expect(prompt).toContain("adult")
  })

  it("lists existing skills in selected category only", () => {
    const prompt = buildSkillExtensionPrompt(baseInput)
    expect(prompt).toContain("paw")
    expect(prompt).toContain("spin")
  })

  it("states the count and difficulty", () => {
    const prompt = buildSkillExtensionPrompt(baseInput)
    expect(prompt).toContain("5")
    expect(prompt).toContain("intermediate")
  })

  it("includes JSON schema example", () => {
    const prompt = buildSkillExtensionPrompt(baseInput)
    expect(prompt).toContain("skills")
    expect(prompt).toContain("nameDe")
    expect(prompt).toContain("nameEn")
    expect(prompt).toContain("descriptionDe")
    expect(prompt).toContain("prerequisiteIds")
  })

  it("includes focus text when present", () => {
    const prompt = buildSkillExtensionPrompt(baseInput)
    expect(prompt).toContain("mentale Auslastung")
  })

  it("omits focus section when empty", () => {
    const prompt = buildSkillExtensionPrompt({ ...baseInput, focusText: "" })
    expect(prompt).not.toContain("Zusätzlicher Fokus:")
  })
})
