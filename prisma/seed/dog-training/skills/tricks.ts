// prisma/seed/dog-training/skills/tricks.ts
import type { SkillSeed } from "../types"

export const TRICKS_SKILLS: SkillSeed[] = [
  {
    id: "hand_touch",
    categoryId: "tricks",
    nameDe: "Handzielhand",
    nameEn: "Hand Touch",
    descriptionDe:
      "Flache Hand 5 cm vor die Nase halten. Hund schnüffelt → im Moment der Berührung markern, belohnen. 10 Wiederholungen, dann Signal \"Touch\". Fundament für viele andere Skills (Apportieren, Lichtschalter, etc.).",
    descriptionEn:
      "Hold a flat palm 5 cm from the dog's nose. As he sniffs → mark at the moment of contact, reward. 10 reps, then add the cue \"Touch.\" Foundation for many other skills (retrieve, light switch, etc.).",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 1,
  },
  {
    id: "paw",
    categoryId: "tricks",
    nameDe: "Pfote",
    nameEn: "Paw",
    descriptionDe:
      "Hund sitzt. Halte ein Leckerli in der Faust direkt vor seiner Brust. Er kratzt oder hebt die Pfote → markern, Faust öffnen, belohnen. Signal \"Pfote\" einführen.",
    descriptionEn:
      "Dog sits. Hold a treat in a closed fist right in front of his chest. He paws or lifts → mark, open the fist, reward. Add the cue \"Paw.\"",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit",
    sortOrder: 2,
  },
  {
    id: "high_five",
    categoryId: "tricks",
    nameDe: "High Five",
    nameEn: "High Five",
    descriptionDe:
      "Wie Pfote, aber deine Hand höher und senkrecht halten. Die Pfote trifft deine Handfläche → markern, belohnen. Signal \"High Five\" einführen.",
    descriptionEn:
      "Like Paw, but hold your hand higher and vertical. The paw hits your palm → mark, reward. Add the cue \"High Five.\"",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "paw",
    sortOrder: 3,
  },
  {
    id: "spin",
    categoryId: "tricks",
    nameDe: "Dreh dich",
    nameEn: "Spin",
    descriptionDe:
      "Leckerli vor die Nase, in großem Kreis um den Hund führen, er folgt mit Kopf und Körper. Volle Drehung → markern, belohnen. Signal \"Dreh\" nach 10-15 Wiederholungen. Ein großartiger Aufwärm-Skill.",
    descriptionEn:
      "Treat in front of the nose, guide in a large circle around the dog — he follows with head and body. Full turn → mark, reward. Add the cue \"Spin\" after 10-15 reps. A great warm-up skill.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 4,
  },
  {
    id: "chin_rest",
    categoryId: "tricks",
    nameDe: "Kopf ablegen",
    nameEn: "Chin Rest",
    descriptionDe:
      "Flache Hand hinhalten, Hund legt das Kinn ab → markern, belohnen. Start mit Leckerli unter der Hand locken. Später freiwilliger Chin-Rest als Signal \"Ich bin bereit für Untersuchung oder Pflege\".",
    descriptionEn:
      "Hold a flat hand, dog rests chin on it → mark, reward. Start by luring a treat under the hand. Later a voluntary chin-rest is the signal \"I'm ready for exam or care.\"",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "handling",
    sortOrder: 5,
  },
  {
    id: "roll_over",
    categoryId: "tricks",
    nameDe: "Rolle",
    nameEn: "Roll Over",
    descriptionDe:
      "Hund im Platz. Leckerli von der Nase zur Schulter führen, er dreht den Kopf, dann den Körper. Belohne Teilschritte (Shaping). Volle Rolle → Jackpot. Nur für Hunde, die sich freiwillig auf den Rücken legen.",
    descriptionEn:
      "Dog in down. Guide a treat from the nose to the shoulder — he turns his head, then his body. Reward partial steps (shaping). Full roll → jackpot. Only for dogs who voluntarily lie on their back.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "down",
    sortOrder: 6,
  },
  {
    id: "sit_pretty",
    categoryId: "tricks",
    nameDe: "Männchen",
    nameEn: "Sit Pretty (Beg)",
    descriptionDe:
      "Hund sitzt. Leckerli langsam über den Kopf hinausführen — vordere Pfoten lösen sich. Sekundenweise aufbauen. Erfordert Rumpfstabilität — nicht für junge Hunde oder Hunde mit Rückenproblemen.",
    descriptionEn:
      "Dog sits. Slowly lift a treat above the head — the front paws lift off. Build up by seconds. Requires core stability — not for young dogs or those with back issues.",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "sit",
    sortOrder: 7,
  },
  {
    id: "bow",
    categoryId: "tricks",
    nameDe: "Verbeugung",
    nameEn: "Play Bow",
    descriptionDe:
      "Hund steht. Leckerli von der Nase zu den Vorderpfoten führen, Schultern senken sich, Hinterteil bleibt oben. Sofort markern, bevor der Hund ablegt. Signal \"Bitte\" oder \"Bow\".",
    descriptionEn:
      "Dog stands. Guide a treat from the nose toward the front paws — shoulders lower, hindquarters stay up. Mark immediately before he lies down. Cue: \"Bow\" or \"Please.\"",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "stand",
    sortOrder: 8,
  },
  {
    id: "play_dead",
    categoryId: "tricks",
    nameDe: "Tot stellen",
    nameEn: "Play Dead",
    descriptionDe:
      "Erweiterung der Rolle: Hund legt sich auf die Seite und bleibt. \"Peng!\"-Signal mit Fingerpistole oder Wort. Dauer aufbauen. Ein Klassiker, aber setzt entspanntes Auf-dem-Rücken-Liegen voraus.",
    descriptionEn:
      "Extension of Roll Over: dog lies on his side and stays. Cue with \"Bang!\" and a finger gun or word. Build duration. A classic, but requires comfort with lying on the back.",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "down,roll_over",
    sortOrder: 9,
  },
  {
    id: "leg_weave",
    categoryId: "tricks",
    nameDe: "Durch die Beine",
    nameEn: "Leg Weave",
    descriptionDe:
      "Stehen mit gespreizten Beinen. Leckerli-Lure führt den Hund von hinten durch die Beine. Später im Gehen: abwechselnd linke/rechte Lücke beim Laufen. Körperlich und mental fordernd.",
    descriptionEn:
      "Stand with legs spread. A treat lure guides the dog from behind through the legs. Later while walking: alternating left/right gap with each step. Physically and mentally demanding.",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "hand_touch",
    sortOrder: 10,
  },
  {
    id: "target_stick",
    categoryId: "tricks",
    nameDe: "Target-Stick",
    nameEn: "Target Stick",
    descriptionDe:
      "Langer Stab mit Ball am Ende. Hund lernt, den Ball mit der Nase zu berühren (wie Hand Touch). Nützlich, um den Hund auf Distanz zu dirigieren — Fundament für komplexe Tricks.",
    descriptionEn:
      "A long stick with a ball at the tip. Dog learns to touch the ball with his nose (like Hand Touch). Useful for directing the dog at a distance — foundation for complex tricks.",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "hand_touch",
    sortOrder: 11,
  },
  {
    id: "retrieve",
    categoryId: "tricks",
    nameDe: "Apportieren",
    nameEn: "Retrieve",
    descriptionDe:
      "Für Retrieve-motivierte Hunde (Labradoodle!): Spielzeug werfen, bei Aufnahme jubeln, bei Rückkehr gegen Leckerli tauschen. Sonst Shaping: Interesse → Berühren → Maul öffnen → Aufheben → Halten → Bringen.",
    descriptionEn:
      "For retrieve-motivated breeds (Labradoodle!): throw a toy, cheer on pickup, trade for a treat on return. Otherwise shape: interest → touch → mouth open → pick up → hold → bring.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "drop_it,hand_touch",
    sortOrder: 12,
  },
  {
    id: "tidy_up",
    categoryId: "tricks",
    nameDe: "Aufräumen",
    nameEn: "Tidy Up Toys",
    descriptionDe:
      "Kombination aus Apportieren und Aus über einer Kiste. Hund bringt Spielzeug, \"Aus\" über der Kiste → fällt rein → Jackpot. Später Signal \"Aufräumen\" mit mehreren Gegenständen in Folge.",
    descriptionEn:
      "Combines retrieve and drop over a box. Dog brings a toy, \"Drop\" over the box → it falls in → jackpot. Later a \"Tidy Up\" cue with multiple items in sequence.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "retrieve,drop_it",
    sortOrder: 13,
  },
  {
    id: "light_switch",
    categoryId: "tricks",
    nameDe: "Licht anmachen",
    nameEn: "Turn On Light Switch",
    descriptionDe:
      "Target-Sticker an den Lichtschalter kleben. Hund berührt den Sticker → markern, belohnen. Schrittweise Druck aufbauen, bis das Licht tatsächlich angeht. Impressive Show-Trick.",
    descriptionEn:
      "Stick a target sticker on a light switch. Dog touches the sticker → mark, reward. Gradually build pressure until the light actually turns on. Impressive show trick.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "target_stick,hand_touch",
    sortOrder: 14,
  },
  {
    id: "object_discrimination",
    categoryId: "tricks",
    nameDe: "Gegenstände benennen",
    nameEn: "Object Discrimination",
    descriptionDe:
      "Hund lernt, bestimmte Gegenstände beim Namen zu apportieren. Beginne mit 1 Gegenstand und Namen, belohne jede korrekte Wahl. Schrittweise weitere Gegenstände hinzufügen. Einige Hunde lernen dutzende Wörter.",
    descriptionEn:
      "Dog learns to retrieve specific objects by name. Start with 1 object and a name, reward each correct choice. Gradually add more objects. Some dogs learn dozens of words.",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "retrieve",
    sortOrder: 15,
  },
]
