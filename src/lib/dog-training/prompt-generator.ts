import type { DogPhase, SkillDifficulty } from "./types"

export type PromptCategory = {
  id: string
  nameDe: string
  nameEn: string
}

export type PromptSkill = {
  id: string
  categoryId: string
  nameDe: string
  nameEn: string
  difficulty: string
}

export type BuildPromptInput = {
  dog: { name: string; breed: string | null; phase: DogPhase }
  categories: PromptCategory[]
  selectedCategoryIds: string[]
  existingSkills: PromptSkill[]
  count: number
  difficulty: SkillDifficulty | "any" | "mixed"
  focusText: string
}

export function buildSkillExtensionPrompt(input: BuildPromptInput): string {
  const selectedCategories = input.categories.filter((c) =>
    input.selectedCategoryIds.includes(c.id),
  )
  const categoryList = selectedCategories
    .map((c, i) => `${i + 1}. ${c.nameDe} (${c.id})`)
    .join("\n")

  const skillsByCategory = selectedCategories
    .map((cat) => {
      const skills = input.existingSkills.filter((s) => s.categoryId === cat.id)
      if (skills.length === 0) {
        return `(Säule: ${cat.nameDe})\n- [noch keine Skills]`
      }
      const lines = skills
        .map((s) => `- ${s.id} (${s.nameDe} / ${s.nameEn}) — ${s.difficulty}`)
        .join("\n")
      return `(Säule: ${cat.nameDe})\n${lines}`
    })
    .join("\n\n")

  const difficultyStr =
    input.difficulty === "any"
      ? "egal"
      : input.difficulty === "mixed"
        ? "gemischt"
        : input.difficulty

  const focusBlock = input.focusText.trim()
    ? `\nZusätzlicher Fokus: ${input.focusText.trim()}`
    : ""

  return `## Rolle und Kontext
Du bist ein Experte für positive Hundeerziehung (R+ / LIMA).
Ich habe eine Hundetraining-App mit existierenden Skills, die ich erweitern möchte.
Mein Hund heißt ${input.dog.name}${input.dog.breed ? `, ist ein ${input.dog.breed}` : ""}, aktuell in Phase "${input.dog.phase}".

## Gewählte Säulen
${categoryList}

## Existierende Skills in den gewählten Säulen
${skillsByCategory}

## Auftrag
Schlage **${input.count}** neue Skills vor für die oben gewählten Säulen.
Schwierigkeit: **${difficultyStr}**.${focusBlock}

Die neuen Skills dürfen **nicht** mit existierenden überlappen.
Trainingsanleitungen müssen **force-free / positive Verstärkung** sein.
Keine Dominanz-Theorie, keine Leinen-Ruck-Methoden, keine aversiven Mittel.

## Ausgabe-Format (strikt)
Gib ausschließlich ein JSON-Objekt zurück, ohne Erklärung davor oder danach,
ohne Markdown-Codeblöcke. Das JSON-Objekt muss exakt diesem Schema folgen:

{
  "skills": [
    {
      "id": "<lowercase snake_case slug, eindeutig, 3-40 Zeichen>",
      "categoryId": "<eine der oben gelisteten Säulen-IDs>",
      "nameDe": "<Skill-Name auf Deutsch, 1-80 Zeichen>",
      "nameEn": "<Skill-Name auf Englisch, 1-80 Zeichen>",
      "descriptionDe": "<2-3 Sätze Anleitung auf Deutsch, 20-500 Zeichen, force-free>",
      "descriptionEn": "<2-3 Sätze Anleitung auf Englisch, 20-500 Zeichen, force-free>",
      "difficulty": "<beginner | intermediate | advanced>",
      "phase": "<puppy | adolescent | adult | advanced>",
      "prerequisiteIds": ["<optional: IDs von benötigten Vorgänger-Skills, oder leeres Array>"]
    }
  ]
}

Jeder Skill muss alle Felder enthalten. Die "id" muss ein snake_case-Slug sein,
nicht mit existierenden IDs kollidieren, und selbsterklärend (z.B. "leg_weave" oder "bow").
Antworte nur mit dem JSON.`
}
