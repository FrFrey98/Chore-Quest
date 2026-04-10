"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { parseSkillImport, validateSkillImport } from "@/lib/dog-training/skill-import"

export async function importDogSkills(rawInput: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Nicht eingeloggt")

  const parsed = parseSkillImport(rawInput)
  if ("errors" in parsed) {
    return { imported: [], skipped: [], errors: parsed.errors }
  }

  const [categories, existing] = await Promise.all([
    prisma.dogSkillCategory.findMany({ select: { id: true } }),
    prisma.dogSkillDefinition.findMany({ select: { id: true } }),
  ])
  const validation = validateSkillImport(parsed, {
    knownCategoryIds: categories.map((c) => c.id),
    existingSkillIds: existing.map((e) => e.id),
  })

  if (validation.errors.length > 0) {
    return { imported: [], skipped: validation.skipped, errors: validation.errors }
  }

  const created = await prisma.$transaction(async (tx) => {
    const rows = []
    for (const skill of validation.imported) {
      const row = await tx.dogSkillDefinition.create({
        data: {
          id: skill.id,
          categoryId: skill.categoryId,
          nameDe: skill.nameDe,
          nameEn: skill.nameEn,
          descriptionDe: skill.descriptionDe,
          descriptionEn: skill.descriptionEn,
          difficulty: skill.difficulty,
          phase: skill.phase,
          prerequisiteIds: skill.prerequisiteIds.join(",") || null,
          isSystem: false,
          createdById: user.id,
          sortOrder: 999,
        },
      })
      rows.push(row)
    }
    return rows
  })

  revalidatePath("/hunde")
  return { imported: created, skipped: validation.skipped, errors: [] }
}
