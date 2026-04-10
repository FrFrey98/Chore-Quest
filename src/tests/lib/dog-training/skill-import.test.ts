import { describe, it, expect } from "vitest"
import { parseSkillImport, validateSkillImport } from "@/lib/dog-training/skill-import"

const validJson = JSON.stringify({
  skills: [
    {
      id: "leg_weave",
      categoryId: "tricks",
      nameDe: "Durch die Beine",
      nameEn: "Leg Weave",
      descriptionDe:
        "Hund lernt, bei laufendem Gang durch die Beine des Trainers zu weben. Beginne im Stand mit Leckerli-Lure durch eine Lücke.",
      descriptionEn:
        "Teach the dog to weave through the handler's legs while walking. Start standing with a treat lure through one leg gap.",
      difficulty: "intermediate",
      phase: "adult",
      prerequisiteIds: [],
    },
  ],
})

const knownCategoryIds = ["tricks", "basic_obedience"]
const existingSkillIds = ["sit", "paw"]

describe("parseSkillImport", () => {
  it("parses pure JSON", () => {
    const result = parseSkillImport(validJson)
    expect("skills" in result).toBe(true)
  })

  it("parses JSON wrapped in markdown code block", () => {
    const input = "```json\n" + validJson + "\n```"
    const result = parseSkillImport(input)
    expect("skills" in result).toBe(true)
  })

  it("parses JSON with prose before and after", () => {
    const input = "Here are the skills:\n\n" + validJson + "\n\nHope this helps!"
    const result = parseSkillImport(input)
    expect("skills" in result).toBe(true)
  })

  it("returns error on invalid JSON", () => {
    const result = parseSkillImport("this is not json at all")
    expect("errors" in result).toBe(true)
  })
})

describe("validateSkillImport", () => {
  it("accepts valid input", () => {
    const parsed = parseSkillImport(validJson)
    if ("errors" in parsed) throw new Error("unexpected parse error")
    const result = validateSkillImport(parsed, { knownCategoryIds, existingSkillIds })
    expect(result.errors).toEqual([])
    expect(result.imported.length).toBe(1)
  })

  it("rejects invalid id format", () => {
    const bad = JSON.parse(validJson)
    bad.skills[0].id = "Invalid ID!"
    const result = validateSkillImport(bad, { knownCategoryIds, existingSkillIds })
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it("skips duplicate existing skill with warning", () => {
    const bad = JSON.parse(validJson)
    bad.skills[0].id = "sit"
    const result = validateSkillImport(bad, { knownCategoryIds, existingSkillIds })
    expect(result.imported.length).toBe(0)
    expect(result.skipped.length).toBe(1)
    expect(result.skipped[0].reason).toContain("existiert")
  })

  it("rejects unknown categoryId", () => {
    const bad = JSON.parse(validJson)
    bad.skills[0].categoryId = "nonexistent_category"
    const result = validateSkillImport(bad, { knownCategoryIds, existingSkillIds })
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it("rejects description shorter than 20 chars", () => {
    const bad = JSON.parse(validJson)
    bad.skills[0].descriptionDe = "kurz"
    const result = validateSkillImport(bad, { knownCategoryIds, existingSkillIds })
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it("rejects empty skills array", () => {
    const result = validateSkillImport({ skills: [] }, {
      knownCategoryIds,
      existingSkillIds,
    })
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
