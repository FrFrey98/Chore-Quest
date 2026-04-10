// prisma/seed/dog-training/skills/leash.ts
import type { SkillSeed } from "../types"

export const LEASH_SKILLS: SkillSeed[] = [
  {
    id: "harness_acceptance",
    categoryId: "leash",
    nameDe: "Geschirr akzeptieren",
    nameEn: "Harness Acceptance",
    descriptionDe:
      "Geschirr auf den Boden legen, jedes Interesse markern. Geschirr hochhalten, Nase durchstecken — Leckerli durch die Öffnung. Schrittweise Schließen mit Leckerli verknüpfen. Nie über den Kopf zwingen, wenn der Hund Angst zeigt.",
    descriptionEn:
      "Place the harness on the floor, mark any interest. Hold it up, thread a treat through the opening so the dog pokes his nose through. Gradually pair closing with treats. Never force over the head if the dog shows fear.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 1,
  },
  {
    id: "loose_leash",
    categoryId: "leash",
    nameDe: "Lockere Leine",
    nameEn: "Loose Leash Walking",
    descriptionDe:
      "Jeder Schritt mit durchhängender Leine wird markiert und belohnt. Bei straffer Leine stehenbleiben (Baum-Technik) oder Richtung wechseln. Der Hund lernt: Ziehen führt nirgendwohin, Mitgehen zahlt sich aus.",
    descriptionEn:
      "Every step with a slack leash is marked and rewarded. When the leash tightens, stop walking (tree technique) or change direction. The dog learns: pulling leads nowhere, walking with you pays off.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "name,watch_me",
    sortOrder: 2,
  },
  {
    id: "curb_stop",
    categoryId: "leash",
    nameDe: "Warten am Bordstein",
    nameEn: "Curb Stop",
    descriptionDe:
      "Am Bordstein automatisch Sitz, bevor es weitergeht. Signal wird mit der Zeit vom Bordstein selbst übernommen. Sicherheit im Stadtverkehr.",
    descriptionEn:
      "At every curb, automatic sit before continuing. Over time the cue transfers to the curb itself. A city safety skill.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit,stay",
    sortOrder: 3,
  },
  {
    id: "heel_position",
    categoryId: "leash",
    nameDe: "Fuß-Position",
    nameEn: "Heel Position",
    descriptionDe:
      "Hund steht an deiner linken Hüfte, Schulter auf Höhe deines Knies. Leckerli-Lure an der Hüfte halten. Jede Sekunde korrekter Position markern und belohnen. Fundament für Bei Fuß gehen.",
    descriptionEn:
      "Dog stands at your left hip, shoulder at knee level. Hold a treat lure at your hip. Mark and reward every second of correct position. Foundation for formal heeling.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "loose_leash",
    sortOrder: 4,
  },
  {
    id: "heel_walking",
    categoryId: "leash",
    nameDe: "Bei Fuß gehen",
    nameEn: "Heel Walking",
    descriptionDe:
      "Aus der Fußposition Schritte aufbauen. Hoher Belohnungssatz (alle 2-3 Schritte am Anfang). Signalwort \"Fuß\" einführen. Für Labradoodles hohe Ablenkbarkeit — lieber kürzere Sessions mit hoher Belohnungsrate.",
    descriptionEn:
      "Build steps out of the heel position. High reinforcement rate (every 2-3 steps initially). Add the cue \"Heel.\" For easily distracted breeds, prefer shorter sessions with a higher reinforcement rate.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "heel_position",
    sortOrder: 5,
  },
  {
    id: "u_turn_leash",
    categoryId: "leash",
    nameDe: "Richtungswechsel",
    nameEn: "U-Turn on Leash",
    descriptionDe:
      "\"Komm\" oder eigenes Signal, gleichzeitig 180° drehen, Hund mit Leckerli-Lure mitziehen. Belohnen nach der Drehung. Sehr nützlich bei Trigger-Begegnungen auf dem Spaziergang.",
    descriptionEn:
      "Say \"Come\" or your own cue while making a 180° turn, luring the dog with a treat. Reward after the turn. Very useful for avoiding trigger encounters on walks.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "loose_leash",
    sortOrder: 6,
  },
  {
    id: "leash_greeting",
    categoryId: "leash",
    nameDe: "Begegnung an der Leine",
    nameEn: "Leash Greeting",
    descriptionDe:
      "Anderen Hund an der Leine passieren — nicht grüßen, sondern vorbeigehen. Schau-Signal nutzen, um Aufmerksamkeit zu halten. Belohnen für ruhiges Vorbeigehen. Vermeidet Leinenaggression durch Frustration.",
    descriptionEn:
      "Passing another leashed dog — not greeting, just walking by. Use the watch-me cue to hold attention. Reward calm passing. Prevents leash reactivity driven by frustration.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "loose_leash,watch_me",
    sortOrder: 7,
  },
  {
    id: "crowd_walking",
    categoryId: "leash",
    nameDe: "Gehen in der Menschenmenge",
    nameEn: "Walking in Crowds",
    descriptionDe:
      "Belebte Straßen, Märkte, Fußgängerzonen. Hund lernt, auch in stark ablenkender Umgebung an der lockeren Leine zu bleiben. Kurze Sessions am Anfang, hohe Belohnungsrate, Positiv-Ende.",
    descriptionEn:
      "Busy streets, markets, pedestrian zones. The dog learns to maintain a loose leash in highly distracting environments. Short sessions at first, high reinforcement rate, positive ending.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "heel_walking,watch_me",
    sortOrder: 8,
  },
]
