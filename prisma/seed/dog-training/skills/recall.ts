// prisma/seed/dog-training/skills/recall.ts
import type { SkillSeed } from "../types"

export const RECALL_SKILLS: SkillSeed[] = [
  {
    id: "close_recall",
    categoryId: "recall",
    nameDe: "Rückruf (Nahdistanz)",
    nameEn: "Close Recall",
    descriptionDe:
      "In der Familienrunde abwechselnd den Hund rufen und bei Ankunft mit Leckerli, Lob und Spiel belohnen. Mache es zur besten Sache des Tages. Nie für negative Dinge (Bad, Leineanlegen zum Heimgehen) rufen.",
    descriptionEn:
      "In a family circle, take turns calling the dog. On arrival reward with treats, praise, and play. Make it the best thing of the day. Never call for negative things (bath, leashing to go home).",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "name",
    sortOrder: 1,
  },
  {
    id: "whistle_recall",
    categoryId: "recall",
    nameDe: "Pfeifenrückruf",
    nameEn: "Whistle Recall",
    descriptionDe:
      "Pfiff → sofort Leckerli direkt in die Schnauze (klassische Konditionierung). 30-50 Wiederholungen über mehrere Tage, ohne einen echten Rückruf zu verlangen. Danach Pfiff als Signal in zunehmenden Distanzen nutzen.",
    descriptionEn:
      "Whistle → treat directly to the mouth (classical conditioning). 30-50 reps over several days without asking for an actual recall. Then use the whistle as a cue at progressive distances.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "close_recall",
    sortOrder: 2,
  },
  {
    id: "recall_distraction",
    categoryId: "recall",
    nameDe: "Rückruf mit Ablenkung",
    nameEn: "Recall with Distraction",
    descriptionDe:
      "Beginne mit leichten Ablenkungen (Ball am Boden), Hund an der Schleppleine. Rufe bei niedriger Ablenkung, Jackpot belohnen. Ablenkung schrittweise steigern. Bei Fehlversuchen: Kriterium senken, nicht bestrafen.",
    descriptionEn:
      "Start with mild distractions (a ball on the ground), dog on a long line. Call during low distraction, jackpot reward. Raise distraction gradually. On failures: lower the criterion, don't punish.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "close_recall",
    sortOrder: 3,
  },
  {
    id: "emergency_recall",
    categoryId: "recall",
    nameDe: "Notfallrückruf",
    nameEn: "Emergency Recall",
    descriptionDe:
      "Ein einzigartiges neues Signal (z.B. Pfiff oder \"Turbo!\"), das NIE für irgendetwas anderes verwendet wird. 2 Wochen lang 3× täglich mit Jackpot (super-wertig) konditionieren. Danach sehr sparsam und nur für echte Notfälle.",
    descriptionEn:
      "A unique new cue (e.g. a whistle or \"Turbo!\") NEVER used for anything else. For 2 weeks, condition 3x daily with a jackpot (super high-value). Afterwards use very sparingly, only for true emergencies.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "close_recall,whistle_recall",
    sortOrder: 4,
  },
  {
    id: "recall_from_play",
    categoryId: "recall",
    nameDe: "Rückruf aus dem Spiel",
    nameEn: "Recall from Play",
    descriptionDe:
      "Während der Hund mit einem anderen Hund spielt, rufen. Erwartung: kurzes Pause, komm, belohnen (hochwertig), dann **zurück ins Spiel schicken**. So lernt er: Rückruf = kurze Unterbrechung, nicht Spielende.",
    descriptionEn:
      "While the dog plays with another dog, call him. Expectation: brief pause, come, reward (high-value), then **release back to play**. He learns: recall = brief interruption, not end of fun.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "recall_distraction",
    sortOrder: 5,
  },
  {
    id: "recall_wildlife",
    categoryId: "recall",
    nameDe: "Rückruf vom Wild",
    nameEn: "Recall off Wildlife",
    descriptionDe:
      "Extrem schwieriger Skill. Hund an der Schleppleine, wenn er Wild wittert, Notfallrückruf auslösen. Jackpot mit etwas Besserem als der Jagdtrieb (rohes Fleisch, etc.). Jahrelanges Training — niemals als sicher annehmen.",
    descriptionEn:
      "Extremely difficult. Dog on a long line — when he scents wildlife, fire the emergency recall. Jackpot with something better than prey drive (raw meat, etc.). Years of training — never assume reliability.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "emergency_recall",
    sortOrder: 6,
  },
  {
    id: "distance_down",
    categoryId: "recall",
    nameDe: "Platz auf Distanz",
    nameEn: "Distance Down",
    descriptionDe:
      "Hund kennt Platz aus der Nähe. Einen Schritt zurücktreten, Platz-Signal. Klappt es → zum Hund gehen und belohnen. Distanz langsam steigern (30 cm-Schritte). Deutliches Handzeichen hilft.",
    descriptionEn:
      "Dog knows down from close. Step back once, cue down. If it works → walk to the dog and reward. Build distance slowly (30 cm increments). A clear hand signal helps.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "down,stay",
    sortOrder: 7,
  },
  {
    id: "directionals",
    categoryId: "recall",
    nameDe: "Richtungssignale",
    nameEn: "Directionals",
    descriptionDe:
      "Aus dem Distance Down Richtungssignale aufbauen: \"links\", \"rechts\", \"weiter\", \"zurück\". Nutzlich für Dummy-Training und Agility. Shape via Handzielhand, später rein verbal.",
    descriptionEn:
      "From distance down, build directional signals: \"left,\" \"right,\" \"forward,\" \"back.\" Useful for dummy work and agility. Shape via hand target, later verbal only.",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "distance_down",
    sortOrder: 8,
  },
]
