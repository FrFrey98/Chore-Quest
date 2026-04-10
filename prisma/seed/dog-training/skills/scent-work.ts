// prisma/seed/dog-training/skills/scent-work.ts
import type { SkillSeed } from "../types"

export const SCENT_WORK_SKILLS: SkillSeed[] = [
  {
    id: "food_dummy",
    categoryId: "scent_work",
    nameDe: "Futterdummy suchen",
    nameEn: "Food Dummy Search",
    descriptionDe:
      "Leckerli sichtbar werfen, \"Such!\" — Hund rennt hin, frisst. Schwieriger: Leckerli verstecken, während der Hund wegschaut. Nasenarbeit ermüdet Hunde schneller als körperliche Auslastung.",
    descriptionEn:
      "Throw a treat visibly, cue \"Find it!\" — the dog runs over and eats. Harder: hide the treat while the dog looks away. Scent work tires dogs faster than physical exercise.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 1,
  },
  {
    id: "treat_hunt",
    categoryId: "scent_work",
    nameDe: "Leckerli-Suchspiel",
    nameEn: "Treat Hunt",
    descriptionDe:
      "Mehrere Leckerlis in einem abgegrenzten Bereich verstecken (Garten, Wohnzimmer). Hund darf suchen. \"Such!\"-Signal. Schwieriger durch Verstecken an höheren Stellen oder in Verstecken.",
    descriptionEn:
      "Hide several treats in a defined area (garden, living room). Dog gets to search. Cue \"Find it!\". Harder with hides up high or in containers.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "food_dummy",
    sortOrder: 2,
  },
  {
    id: "snuffle_mat",
    categoryId: "scent_work",
    nameDe: "Schnüffelteppich",
    nameEn: "Snuffle Mat",
    descriptionDe:
      "Trockenfutter in einen Schnüffelteppich einstreuen, Hund frei schnüffeln lassen. Kein Training, reine Entspannung und mentale Auslastung. Ideal für Regentage oder Ruhephasen.",
    descriptionEn:
      "Sprinkle dry food into a snuffle mat, let the dog freely forage. Not training — pure enrichment and mental decompression. Ideal for rainy days or quiet times.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 3,
  },
  {
    id: "puzzle_toy",
    categoryId: "scent_work",
    nameDe: "Intelligenzspielzeug",
    nameEn: "Puzzle Toy",
    descriptionDe:
      "Spielzeuge mit Futterbelohnung, die der Hund durch Schieben, Drehen oder Öffnen löst. Mit leichten Puzzles beginnen, Schwierigkeit steigern. Nicht frustrierend gestalten — immer lösbar halten.",
    descriptionEn:
      "Toys with food rewards the dog solves by pushing, turning, or opening. Start with easy puzzles, raise difficulty. Keep it non-frustrating — always solvable.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 4,
  },
  {
    id: "indicate_object",
    categoryId: "scent_work",
    nameDe: "Gegenstand anzeigen",
    nameEn: "Indicate Object",
    descriptionDe:
      "Hund findet einen Gegenstand → soll ein Signalverhalten zeigen (Sitz, Platz, Bellen). Beim Finden ins gewünschte Verhalten lotsen, markern, am Fundort belohnen. Belohnung immer am Objekt, nicht beim Hundeführer.",
    descriptionEn:
      "Dog finds an object → should show a signal behavior (sit, down, bark). On the find, lure into the desired behavior, mark, reward at the find spot. Reward always at the object, not at the handler.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "sit,down",
    sortOrder: 5,
  },
  {
    id: "lost_object",
    categoryId: "scent_work",
    nameDe: "Verloren-Suche",
    nameEn: "Lost Object Search",
    descriptionDe:
      "Bekanntes Apportel vor Hundeaugen verstecken, \"Such verloren!\" — Hund bringt. Schwieriger: Verstecken außer Sicht, größere Distanz, komplexere Umgebung. Jagdliche Arbeitsform.",
    descriptionEn:
      "Hide a known retrieve dummy in front of the dog, cue \"Find lost!\" — dog brings. Harder: hide out of sight, greater distance, more complex environment. A hunting work style.",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "retrieve",
    sortOrder: 6,
  },
  {
    id: "problem_solving",
    categoryId: "scent_work",
    nameDe: "Problemlösung",
    nameEn: "Problem Solving Games",
    descriptionDe:
      "Mehrstufige Puzzles: Decke von einer Schachtel schütteln, Deckel drücken, Seil ziehen. Fördert kreatives Problemlösen und Frustrationstoleranz. Immer lösbar halten, nicht zu früh helfen.",
    descriptionEn:
      "Multi-step puzzles: shake a blanket off a box, press a lid, pull a rope. Builds creative problem-solving and frustration tolerance. Always keep it solvable, don't help too early.",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "puzzle_toy",
    sortOrder: 7,
  },
  {
    id: "person_search",
    categoryId: "scent_work",
    nameDe: "Personensuche",
    nameEn: "Person Search",
    descriptionDe:
      "Eine bekannte Person versteckt sich, du gehst mit dem Hund suchen. \"Such Franz!\" — bei Ankunft Party machen. Schrittweise anspruchsvoller: unbekannte Verstecke, größere Distanz.",
    descriptionEn:
      "A familiar person hides, you go searching with the dog. \"Find Franz!\" — party on arrival. Gradually more challenging: unfamiliar hiding spots, greater distance.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "close_recall,indicate_object",
    sortOrder: 8,
  },
  {
    id: "scent_discrimination",
    categoryId: "scent_work",
    nameDe: "Geruchsunterscheidung",
    nameEn: "Scent Discrimination",
    descriptionDe:
      "Hund lernt, einen bestimmten Geruch unter anderen zu erkennen. Beginne mit 1 Zielgeruch gegen neutral, steigere auf 1 gegen mehrere. Basis für Mantrailing und Nosework-Sport.",
    descriptionEn:
      "Dog learns to identify one target scent among others. Start with 1 target vs neutral, scale to 1 vs several. Foundation for mantrailing and nosework sport.",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "indicate_object",
    sortOrder: 9,
  },
  {
    id: "beginner_tracking",
    categoryId: "scent_work",
    nameDe: "Fährtenarbeit (Anfang)",
    nameEn: "Beginner Tracking",
    descriptionDe:
      "Kurze gerade Fährte (5 Meter) in der Wiese treten, alle 2 Schritte ein Leckerli in den Fußtritt legen, am Ende Jackpot. Hund lernt: Nase unten = Leckerli. Schrittweise längere Fährten, später Winkel.",
    descriptionEn:
      "Short straight track (5 meters) in grass, place a treat in every second footstep, jackpot at the end. The dog learns: nose down = treats. Gradually longer tracks, later corners.",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "indicate_object,food_dummy",
    sortOrder: 10,
  },
]
