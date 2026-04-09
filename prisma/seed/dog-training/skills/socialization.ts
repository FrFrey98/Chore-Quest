// prisma/seed/dog-training/skills/socialization.ts
import type { SkillSeed } from "../index"

export const SOCIALIZATION_SKILLS: SkillSeed[] = [
  {
    id: "handling",
    categoryId: "socialization",
    nameDe: "Körperhandling",
    nameEn: "Cooperative Care - Handling",
    descriptionDe:
      "Kurze Berührung (Pfote, Ohr, Maul) → markern → Leckerli. Sekundenweise aufbauen. Der Hund lernt: Berührung sagt Leckerli an. Bei Unbehagen sofort pausieren und Kriterium senken.",
    descriptionEn:
      "Brief touch (paw, ear, mouth) → mark → treat. Build up second by second. The dog learns: touch predicts treats. On discomfort immediately pause and lower the criterion.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 1,
  },
  {
    id: "paw_handling",
    categoryId: "socialization",
    nameDe: "Pfoten kontrollieren",
    nameEn: "Paw Handling",
    descriptionDe:
      "Kurz eine Pfote heben, markern, belohnen. Dauer aufbauen. Später Nägel nur berühren, später Nagelknipser zeigen, später den Knips-Sound. Jeder Schritt einzeln konditioniert. Fundament für Krallenpflege.",
    descriptionEn:
      "Briefly lift one paw, mark, reward. Build duration. Later just touch the nails, later show the clipper, later the clipping sound. Each step conditioned separately. Foundation for nail care.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "handling",
    sortOrder: 2,
  },
  {
    id: "calm_car",
    categoryId: "socialization",
    nameDe: "Entspanntes Autofahren",
    nameEn: "Calm Car Rides",
    descriptionDe:
      "Anfangs nur ins Auto einsteigen und belohnen, Motor aus. Dann Motor an, keine Fahrt. Dann 30 Sekunden Fahrt, ruhiges Aussteigen, belohnen. Schrittweise zu längeren Fahrten aufbauen.",
    descriptionEn:
      "Start by just entering the car and rewarding, engine off. Then engine on, no drive. Then a 30-second drive, calm exit, reward. Build up to longer drives step by step.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "settle_on_mat",
    sortOrder: 3,
  },
  {
    id: "short_alone",
    categoryId: "socialization",
    nameDe: "Kurz alleine bleiben",
    nameEn: "Short Alone Time",
    descriptionDe:
      "Hund auf Matte, du gehst 5 Sekunden aus dem Raum und kommst zurück, kein großes Hallo. Dauer langsam steigern (Sekunden → Minuten). Kauartikel als Beschäftigung beim Gehen. Frühzeitig beginnen, bevor Trennungsangst entsteht.",
    descriptionEn:
      "Dog on mat, you leave the room for 5 seconds, return, no big hello. Build duration slowly (seconds → minutes). Chew item for distraction on departure. Start early, before separation anxiety develops.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "settle_on_mat",
    sortOrder: 4,
  },
  {
    id: "muzzle_training",
    categoryId: "socialization",
    nameDe: "Maulkorbtraining",
    nameEn: "Muzzle Training",
    descriptionDe:
      "Maulkorb zeigen, jedes Interesse markern. Leckerli durch den Korb reichen, Hund steckt die Nase rein → markern, belohnen. Schrittweise Dauer, dann Verschluss. Ein gut trainierter Maulkorb ist ein Sicherheits- und Freiheitswerkzeug.",
    descriptionEn:
      "Show the muzzle, mark any interest. Reach a treat through the basket, dog puts his nose in → mark, reward. Gradually build duration, then closure. A well-trained muzzle is a safety and freedom tool.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "handling",
    sortOrder: 5,
  },
  {
    id: "vet_visit",
    categoryId: "socialization",
    nameDe: "Tierarztbesuch",
    nameEn: "Vet Visit Cooperation",
    descriptionDe:
      "Probebesuche in der Praxis ohne Behandlung — nur reingehen, auf der Waage stehen, Leckerli, rausgehen. Chin-Rest als Kooperationssignal etablieren. Nimmt dem echten Termin den Schrecken.",
    descriptionEn:
      "Practice visits to the clinic without treatment — just go in, stand on the scale, treat, leave. Establish chin-rest as a cooperation signal. Removes the dread of real appointments.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "handling,paw_handling",
    sortOrder: 6,
  },
  {
    id: "child_greeting",
    categoryId: "socialization",
    nameDe: "Begegnung mit Kindern",
    nameEn: "Child Greeting",
    descriptionDe:
      "Kind erklärt man: \"Nicht über den Kopf streicheln, nicht umarmen, nicht direkt anstarren.\" Hund bekommt bei ruhiger Begegnung Leckerli. Immer mit Erwachsenen-Supervision. Kinder sollten lernen, Hundesprache zu lesen.",
    descriptionEn:
      "Teach the child: no petting over the head, no hugging, no direct staring. The dog gets treats for calm greetings. Always with adult supervision. Children should learn to read dog body language.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "four_on_floor,watch_me",
    sortOrder: 7,
  },
  {
    id: "dog_greeting",
    categoryId: "socialization",
    nameDe: "Hundebegegnung",
    nameEn: "Dog Greeting",
    descriptionDe:
      "An der lockeren Leine einem anderen Hund kurz (3 Sekunden) begegnen, dann weitergehen. Bogen laufen statt frontal. Nicht jeder Hund möchte grüßen — Körpersprache lesen und respektieren.",
    descriptionEn:
      "Brief (3-second) greeting with another dog on a slack leash, then move on. Approach in an arc, not frontally. Not every dog wants to greet — read and respect body language.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "loose_leash",
    sortOrder: 8,
  },
  {
    id: "extended_alone",
    categoryId: "socialization",
    nameDe: "Lang alleine bleiben",
    nameEn: "Extended Alone Time",
    descriptionDe:
      "Baue aus \"kurz alleine\" zu 30 Min → 1 h → 2 h → 4 h aufbauen. Bei Anzeichen von Stress (Bellen, Pinkeln, Kauen) Schritt zurück. Videoaufzeichnung nutzen, um den Stresslevel während der Abwesenheit zu messen.",
    descriptionEn:
      "From short alone time build up to 30 min → 1 hr → 2 hr → 4 hr. At signs of stress (barking, wetting, chewing) step back. Use video recording to measure stress during absences.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "short_alone",
    sortOrder: 9,
  },
  {
    id: "vet_stand",
    categoryId: "socialization",
    nameDe: "Stehen zur Untersuchung",
    nameEn: "Vet Stand for Exam",
    descriptionDe:
      "Hund steht ruhig, während du (oder der Tierarzt) den ganzen Körper abtastet. Start mit kurzen Berührungen, Pausen, Belohnung. Nutze Chin-Rest als \"Ich bin bereit\"-Signal.",
    descriptionEn:
      "The dog stands still while you (or the vet) palpates the whole body. Start with brief touches, pauses, rewards. Use chin-rest as an \"I'm ready\" signal.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "stand,handling",
    sortOrder: 10,
  },
  {
    id: "cafe_settle",
    categoryId: "socialization",
    nameDe: "Café-Ruhe",
    nameEn: "Cafe Settle",
    descriptionDe:
      "Zuhause Settle on Mat perfektionieren. Dann mit Decke an immer belebtere Orte. Mitbringen: Kauartikel, hochwertige Belohnungen. Kurze Sessions (5-10 Min), positiv beenden. Erfordert Geduld über Wochen.",
    descriptionEn:
      "Perfect settle on mat at home first. Then take the mat to progressively busier locations. Bring: chew items, high-value treats. Short sessions (5-10 min), positive endings. Takes weeks of patience.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "settle_on_mat,short_alone",
    sortOrder: 11,
  },
  {
    id: "public_transport",
    categoryId: "socialization",
    nameDe: "Öffentliche Verkehrsmittel",
    nameEn: "Public Transport",
    descriptionDe:
      "Start an der Haltestelle ohne Einsteigen. Dann 1 Station, dann 3 Stationen. Leise, ruhig, hochwertige Belohnungen. Rush-Hour meiden. Sicherheitsgeschirr verwenden.",
    descriptionEn:
      "Start at the stop without boarding. Then 1 station, then 3 stations. Quiet, calm, high-value treats. Avoid rush hour. Use a safety harness.",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "cafe_settle,handling",
    sortOrder: 12,
  },
]
