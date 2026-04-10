// prisma/seed/dog-training/categories.ts
export const DOG_TRAINING_CATEGORIES = [
  {
    id: "basic_obedience",
    nameDe: "Grundgehorsam",
    nameEn: "Basic Obedience",
    emoji: "📋",
    sortOrder: 1,
  },
  {
    id: "impulse_control",
    nameDe: "Impulskontrolle",
    nameEn: "Impulse Control",
    emoji: "🛑",
    sortOrder: 2,
  },
  {
    id: "recall",
    nameDe: "Rückruf & Distanz",
    nameEn: "Recall & Distance Work",
    emoji: "🎯",
    sortOrder: 3,
  },
  {
    id: "leash",
    nameDe: "Leinenführigkeit",
    nameEn: "Leash Skills",
    emoji: "🦮",
    sortOrder: 4,
  },
  {
    id: "socialization",
    nameDe: "Sozialisierung & Alltag",
    nameEn: "Socialization & Real-World",
    emoji: "🤝",
    sortOrder: 5,
  },
  {
    id: "tricks",
    nameDe: "Tricks & Beschäftigung",
    nameEn: "Tricks & Enrichment",
    emoji: "✨",
    sortOrder: 6,
  },
  {
    id: "scent_work",
    nameDe: "Nasenarbeit",
    nameEn: "Scent Work & Mental",
    emoji: "👃",
    sortOrder: 7,
  },
] as const
