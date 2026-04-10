// prisma/seed/dog-training/index.ts
import { DOG_TRAINING_CATEGORIES } from "./categories"
import { DOG_TRAINING_ACHIEVEMENTS } from "./achievements"
import { BASIC_OBEDIENCE_SKILLS } from "./skills/basic-obedience"
import { IMPULSE_CONTROL_SKILLS } from "./skills/impulse-control"
import { RECALL_SKILLS } from "./skills/recall"
import { LEASH_SKILLS } from "./skills/leash"
import { SOCIALIZATION_SKILLS } from "./skills/socialization"
import { TRICKS_SKILLS } from "./skills/tricks"
import { SCENT_WORK_SKILLS } from "./skills/scent-work"

export type { SkillSeed } from "./types"

export const ALL_DOG_SKILLS = [
  ...BASIC_OBEDIENCE_SKILLS,
  ...IMPULSE_CONTROL_SKILLS,
  ...RECALL_SKILLS,
  ...LEASH_SKILLS,
  ...SOCIALIZATION_SKILLS,
  ...TRICKS_SKILLS,
  ...SCENT_WORK_SKILLS,
]

export { DOG_TRAINING_CATEGORIES, DOG_TRAINING_ACHIEVEMENTS }
