// prisma/seed/dog-training/skills/basic-obedience.ts
import type { SkillSeed } from "../types"

export const BASIC_OBEDIENCE_SKILLS: SkillSeed[] = [
  {
    id: "name",
    categoryId: "basic_obedience",
    nameDe: "Name",
    nameEn: "Name Recognition",
    descriptionDe:
      "Sage den Namen des Hundes, sobald er dich anschaut, markere den Moment und gib ein Leckerli. 10-20 Wiederholungen pro Session in ruhiger Umgebung. Nutze den Namen niemals als Schimpfwort.",
    descriptionEn:
      "Say the dog's name the moment he looks at you, mark the look, and give a treat. 10-20 reps per session in a quiet environment. Never use the name as a reprimand.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 1,
  },
  {
    id: "sit",
    categoryId: "basic_obedience",
    nameDe: "Sitz",
    nameEn: "Sit",
    descriptionDe:
      "Halte ein Leckerli vor die Nase und führe es langsam über den Kopf nach hinten — der Hund folgt und setzt sich automatisch. Markere den Moment des Sitzens und belohne. Nach 10-15 Wiederholungen das Signalwort \"Sitz\" einführen.",
    descriptionEn:
      "Hold a treat in front of the dog's nose and slowly guide it up and over his head. As he tracks it, his hindquarters lower. Mark the moment of sitting and reward. Introduce the cue \"Sit\" after 10-15 reps.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "name",
    sortOrder: 2,
  },
  {
    id: "down",
    categoryId: "basic_obedience",
    nameDe: "Platz",
    nameEn: "Down",
    descriptionDe:
      "Aus dem Sitz ein Leckerli langsam zum Boden zwischen die Pfoten führen und leicht wegziehen — der Hund folgt und legt sich ab. Markere und belohne. Signalwort \"Platz\" einführen, sobald das Verhalten sicher sitzt.",
    descriptionEn:
      "From a sit, slowly guide a treat to the floor between the paws and draw it slightly outward. The dog follows and lies down. Mark and reward. Add the cue \"Down\" once the behavior is reliable.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit",
    sortOrder: 3,
  },
  {
    id: "stand",
    categoryId: "basic_obedience",
    nameDe: "Steh",
    nameEn: "Stand",
    descriptionDe:
      "Aus dem Sitz ein Leckerli waagrecht von der Nase wegziehen — der Hund steht auf. Anfangs nur eine Sekunde Stehen verlangen, markere im Stand und belohne. Dauer später schrittweise erhöhen.",
    descriptionEn:
      "From a sit, draw a treat horizontally away from the dog's nose. He stands up to follow. Require only one second of standing at first, mark in place, reward. Build duration gradually.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit",
    sortOrder: 4,
  },
  {
    id: "watch_me",
    categoryId: "basic_obedience",
    nameDe: "Schau",
    nameEn: "Watch Me",
    descriptionDe:
      "Halte ein Leckerli neben dein Auge. Sobald der Hund dich anschaut, markiere und belohne. Später Leckerli seitlich halten, aber nur Blickkontakt zum Auge belohnen. Fundament für jede Ablenkungsarbeit.",
    descriptionEn:
      "Hold a treat next to your eye. The instant the dog makes eye contact, mark and reward. Later hold the treat to the side but only reward when the dog looks at your eye. Foundation for all distraction work.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "name",
    sortOrder: 5,
  },
  {
    id: "stay",
    categoryId: "basic_obedience",
    nameDe: "Bleib",
    nameEn: "Stay",
    descriptionDe:
      "Hund ins Sitz oder Platz, flache Hand zeigen, eine Sekunde warten, markern, belohnen. Dauer schrittweise erhöhen (1s → 3s → 5s → 10s). Später Distanz und Ablenkung einbauen — aber nur eine dieser drei D's gleichzeitig steigern.",
    descriptionEn:
      "Cue sit or down, present a flat-hand signal, wait one second, mark, reward. Gradually build duration (1s → 3s → 5s → 10s). Later add distance and distraction — but never increase two of the three D's at once.",
    difficulty: "intermediate",
    phase: "puppy",
    prerequisiteIds: "sit,down",
    sortOrder: 6,
  },
  {
    id: "come_close",
    categoryId: "basic_obedience",
    nameDe: "Hier (Nahdistanz)",
    nameEn: "Come (Close)",
    descriptionDe:
      "Ein bis zwei Meter entfernt fröhlich \"Hier!\" rufen. Sobald der Hund kommt, Jackpot belohnen (mehrere Leckerlis, Lob, Spiel). Nie rufen, wenn du nicht sicher bist, dass er kommt — sonst lernt er, das Signal zu ignorieren.",
    descriptionEn:
      "From 1-2 meters, call \"Come!\" in a happy voice. The moment he arrives, jackpot reward (multiple treats, praise, play). Never call unless you are confident he will come — otherwise he learns to ignore the cue.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "name",
    sortOrder: 7,
  },
  {
    id: "drop_it",
    categoryId: "basic_obedience",
    nameDe: "Aus",
    nameEn: "Drop It",
    descriptionDe:
      "Hund hält ein niedrig-wertiges Spielzeug. Biete ein hochwertiges Leckerli an — er lässt das Spielzeug los. Sage \"Aus\" im Moment des Loslassens, belohne und gib das Spielzeug zurück. Das verhindert Ressourcenverteidigung.",
    descriptionEn:
      "The dog holds a low-value toy. Offer a high-value treat — he releases the toy. Say \"Drop It\" as he releases, reward, and give the toy back. This prevents resource guarding.",
    difficulty: "intermediate",
    phase: "puppy",
    prerequisiteIds: "sit",
    sortOrder: 8,
  },
  {
    id: "no_reward_marker",
    categoryId: "basic_obedience",
    nameDe: "Abbruch-Marker",
    nameEn: "No-Reward Marker",
    descriptionDe:
      "Ein neutrales Wort wie \"Versuch's nochmal\" verknüpft mit: \"Das war nicht richtig, kein Leckerli, aber kein Drama.\" Sofort neuen Versuch anbieten. Kein Strafton, keine emotionale Aufladung — reine Information.",
    descriptionEn:
      "A neutral word like \"Try again\" paired with: \"That wasn't right, no treat, but no drama.\" Immediately offer another try. No scolding, no emotional charge — pure information.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "sit",
    sortOrder: 9,
  },
  {
    id: "distance_stay",
    categoryId: "basic_obedience",
    nameDe: "Bleib auf Distanz",
    nameEn: "Distance Stay",
    descriptionDe:
      "Hund im Bleib. Gehe einen Schritt zurück, kehre zurück, markern und belohnen. Distanz schrittweise in 30 cm-Schritten erhöhen. Bei Fehlern: Distanz sofort zurücknehmen, einfacher Erfolg, dann wieder aufbauen.",
    descriptionEn:
      "Cue stay. Step back once, return, mark, reward. Gradually increase distance in 30 cm increments. On failure: immediately reduce distance, rebuild from success.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "stay",
    sortOrder: 10,
  },
  {
    id: "down_stay_recall",
    categoryId: "basic_obedience",
    nameDe: "Rückruf aus dem Platz",
    nameEn: "Down-Stay Recall",
    descriptionDe:
      "Hund liegt im Platz, du gehst weg, drehst dich um und rufst \"Hier\". Hund löst den Platz und kommt. Jackpot am Anfang. Trainiert Signalflexibilität und Unterscheidung von Bleib- und Komm-Kontexten.",
    descriptionEn:
      "Dog lies in down-stay, you walk away, turn around, and call \"Come.\" The dog releases the down and comes. Jackpot initially. Trains cue flexibility and distinguishing stay- from come-contexts.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "down,come_close,stay",
    sortOrder: 11,
  },
  {
    id: "behavior_chains",
    categoryId: "basic_obedience",
    nameDe: "Signalketten",
    nameEn: "Behavior Chains",
    descriptionDe:
      "Mehrere bekannte Signale zu einer Kette verknüpfen, z.B. \"Sitz → Platz → Steh → Sitz\". Anfangs jedes Signal einzeln belohnen, später nur am Kettenende. Verbessert Kommunikation und geistige Auslastung.",
    descriptionEn:
      "Chain multiple known cues together, e.g. \"Sit → Down → Stand → Sit.\" Reward each cue individually at first, later only at the end of the chain. Improves communication and mental engagement.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "sit,down,stand",
    sortOrder: 12,
  },
]
