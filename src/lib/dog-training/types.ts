export const SKILL_STATUSES = [
  "new",
  "acquisition",
  "fluency",
  "proficiency",
  "maintenance",
  "mastery",
] as const
export type SkillStatus = (typeof SKILL_STATUSES)[number]

export const SKILL_DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const
export type SkillDifficulty = (typeof SKILL_DIFFICULTIES)[number]

export const DOG_PHASES = [
  "puppy",
  "adolescent",
  "adult",
  "senior",
  "advanced",
] as const
export type DogPhase = (typeof DOG_PHASES)[number]

export const SKILL_PHASES = ["puppy", "adolescent", "adult", "advanced"] as const
export type SkillPhase = (typeof SKILL_PHASES)[number]

export const TRAINING_RATINGS = ["poor", "okay", "good"] as const
export type TrainingRating = (typeof TRAINING_RATINGS)[number]

export const MOOD_LEVELS = ["tired", "normal", "excited"] as const
export type MoodLevel = (typeof MOOD_LEVELS)[number]

export const SESSION_TYPES = ["daily", "focused", "walk", "scent"] as const
export type SessionType = (typeof SESSION_TYPES)[number]

export const DOG_SKILL_CATEGORY_IDS = [
  "basic_obedience",
  "impulse_control",
  "recall",
  "leash",
  "socialization",
  "tricks",
  "scent_work",
] as const
export type DogSkillCategoryId = (typeof DOG_SKILL_CATEGORY_IDS)[number]

export const DOG_TRAINING_CATEGORY_ID = "dog_training"
export const APP_CONFIG_FEATURE_KEY = "dog_training_enabled"
