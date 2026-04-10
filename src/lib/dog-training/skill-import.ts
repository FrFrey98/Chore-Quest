import { z } from "zod"
import type { SkillDifficulty, SkillPhase } from "./types"
import { SKILL_DIFFICULTIES, SKILL_PHASES } from "./types"

const ID_REGEX = /^[a-z][a-z0-9_]{2,40}$/

const importedSkillSchema = z.object({
  id: z.string().regex(ID_REGEX, "id muss snake_case sein, 3-40 Zeichen"),
  categoryId: z.string().min(1),
  nameDe: z.string().min(1).max(80),
  nameEn: z.string().min(1).max(80),
  descriptionDe: z.string().min(20).max(500),
  descriptionEn: z.string().min(20).max(500),
  difficulty: z.enum(SKILL_DIFFICULTIES as unknown as [SkillDifficulty, ...SkillDifficulty[]]),
  phase: z.enum(SKILL_PHASES as unknown as [SkillPhase, ...SkillPhase[]]),
  prerequisiteIds: z.array(z.string()).default([]),
})

const importPayloadSchema = z.object({
  skills: z.array(importedSkillSchema).min(1, "Es muss mindestens ein Skill vorhanden sein"),
})

export type ImportedSkill = z.infer<typeof importedSkillSchema>
export type ImportPayload = z.infer<typeof importPayloadSchema>

export type ParseResult = ImportPayload | { errors: string[] }

function extractJson(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{")) return trimmed
  // Markdown code block
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) return codeBlock[1].trim()
  // First { to last }
  const firstBrace = trimmed.indexOf("{")
  const lastBrace = trimmed.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }
  return null
}

export function parseSkillImport(rawInput: string): ParseResult {
  const extracted = extractJson(rawInput)
  if (!extracted) {
    return { errors: ["Konnte kein JSON im Input finden."] }
  }
  try {
    const parsed = JSON.parse(extracted)
    const validated = importPayloadSchema.safeParse(parsed)
    if (!validated.success) {
      return {
        errors: validated.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      }
    }
    return validated.data
  } catch (e) {
    return { errors: [`JSON konnte nicht geparst werden: ${(e as Error).message}`] }
  }
}

export type ValidateContext = {
  knownCategoryIds: string[]
  existingSkillIds: string[]
}

export type ValidationResult = {
  imported: ImportedSkill[]
  skipped: Array<{ id: string; reason: string }>
  errors: string[]
}

export function validateSkillImport(
  payload: unknown,
  ctx: ValidateContext,
): ValidationResult {
  // Re-run the zod schema to catch raw input bugs as well
  const schemaResult = importPayloadSchema.safeParse(payload)
  if (!schemaResult.success) {
    return {
      imported: [],
      skipped: [],
      errors: schemaResult.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    }
  }
  const validatedPayload = schemaResult.data

  const errors: string[] = []
  const imported: ImportedSkill[] = []
  const skipped: Array<{ id: string; reason: string }> = []
  const seenInBatch = new Set<string>()

  for (const skill of validatedPayload.skills) {
    if (!ctx.knownCategoryIds.includes(skill.categoryId)) {
      errors.push(
        `Skill "${skill.id}": categoryId "${skill.categoryId}" ist keine bekannte Säule`,
      )
      continue
    }
    if (seenInBatch.has(skill.id)) {
      errors.push(`Skill "${skill.id}": Doppelte ID im Import-Batch`)
      continue
    }
    if (ctx.existingSkillIds.includes(skill.id)) {
      skipped.push({ id: skill.id, reason: `Skill "${skill.id}" existiert bereits` })
      continue
    }
    seenInBatch.add(skill.id)
    imported.push(skill)
  }

  return { imported, skipped, errors }
}
