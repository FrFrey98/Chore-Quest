// prisma/seed/dog-training/skills/impulse-control.ts
import type { SkillSeed } from "../types"

export const IMPULSE_CONTROL_SKILLS: SkillSeed[] = [
  {
    id: "leave_it_food",
    categoryId: "impulse_control",
    nameDe: "Leckerli liegen lassen",
    nameEn: "Leave It (Food)",
    descriptionDe:
      "Leckerli in geschlossener Faust, Hund schnüffelt und knabbert — ignorieren. Sobald er aufhört oder wegschaut, markiere und belohne aus der **anderen** Hand. Niemals das \"verbotene\" Leckerli geben.",
    descriptionEn:
      "Hold a treat in a closed fist. The dog sniffs and nibbles — ignore. The instant he stops or looks away, mark and reward from your **other** hand. Never give him the \"forbidden\" treat.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit",
    sortOrder: 1,
  },
  {
    id: "wait_for_bowl",
    categoryId: "impulse_control",
    nameDe: "Warten am Napf",
    nameEn: "Wait for Food Bowl",
    descriptionDe:
      "Napf langsam zum Boden senken. Springt der Hund vor → Napf wieder hoch. Bleibt er sitzen → Napf absetzen und Freigabe-Signal \"Okay!\" geben. Baut Ruhe vor Ressourcen auf.",
    descriptionEn:
      "Slowly lower the food bowl. If the dog lunges → lift the bowl. If he stays sitting → set the bowl down and give the release cue \"Okay!\" Builds calmness around resources.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit",
    sortOrder: 2,
  },
  {
    id: "door_manners",
    categoryId: "impulse_control",
    nameDe: "Warten an der Tür",
    nameEn: "Door Manners",
    descriptionDe:
      "Hund ins Sitz, Türklinke anfassen. Bewegt er sich → Hand weg. Bleibt er → Tür einen Spalt öffnen. Schrittweise bis zur vollständig offenen Tür aufbauen, dann Freigabe-Signal zum Durchgehen.",
    descriptionEn:
      "Dog in sit, touch the door handle. If he moves → remove hand. If he stays → open the door a crack. Build up gradually to a fully open door, then release cue to go through.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit,stay",
    sortOrder: 3,
  },
  {
    id: "four_on_floor",
    categoryId: "impulse_control",
    nameDe: "Vier Pfoten am Boden",
    nameEn: "Four on the Floor",
    descriptionDe:
      "Wenn der Hund hochspringt, wortlos wegdrehen und Aufmerksamkeit entziehen. Sobald alle vier Pfoten am Boden sind, markiere und begrüße ruhig. Von allen Haushaltsmitgliedern konsequent umsetzen.",
    descriptionEn:
      "When the dog jumps up, silently turn away and withdraw attention. The instant all four paws are on the floor, mark and greet calmly. All household members must be consistent.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit",
    sortOrder: 4,
  },
  {
    id: "settle_on_mat",
    categoryId: "impulse_control",
    nameDe: "Ruhe auf der Decke",
    nameEn: "Settle on Mat",
    descriptionDe:
      "Lege eine Decke hin, markiere jedes Interesse daran und belohne. Shape schrittweise in Richtung Liegen auf der Decke. Dauer aufbauen. Ziel: Hund legt sich von selbst ab, sobald die Decke erscheint.",
    descriptionEn:
      "Lay out a mat, mark any interest in it, and reward. Shape progressively toward lying down on the mat. Build duration. Goal: the dog voluntarily settles when the mat appears.",
    difficulty: "intermediate",
    phase: "puppy",
    prerequisiteIds: "down",
    sortOrder: 5,
  },
  {
    id: "out_toy",
    categoryId: "impulse_control",
    nameDe: "Aus (Spielzeug)",
    nameEn: "Out (Toy)",
    descriptionDe:
      "Während des Zerrspiels \"Aus\" sagen und mit einem hochwertigen Leckerli tauschen. Sobald der Hund das Spielzeug loslässt, markiere und belohne. Spielzeug direkt zurückgeben, damit er lernt: Aus beendet das Spiel nicht.",
    descriptionEn:
      "During tug play, say \"Out\" and trade for a high-value treat. The instant he releases, mark and reward. Return the toy immediately so he learns: \"Out\" does not end the game.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "drop_it",
    sortOrder: 6,
  },
  {
    id: "car_wait",
    categoryId: "impulse_control",
    nameDe: "Warten vor dem Auto",
    nameEn: "Car Wait",
    descriptionDe:
      "Am Auto angekommen, Hund ins Sitz. Tür öffnen — Hund bleibt sitzen. Freigabe-Signal zum Einsteigen. Gleiches Muster beim Aussteigen. Sicherheitskritisch — nie überspringen.",
    descriptionEn:
      "At the car, cue sit. Open the door — the dog stays sitting. Release cue to enter. Same pattern when exiting. Safety-critical — never skip.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "stay",
    sortOrder: 7,
  },
  {
    id: "zen_bowl",
    categoryId: "impulse_control",
    nameDe: "Entscheidungsspiel",
    nameEn: "It's Your Choice",
    descriptionDe:
      "Offene Hand mit Leckerli zeigen. Will der Hund rangehen, Hand schließen. Weicht er zurück, Hand öffnen. Hund lernt: Ruhe und Abstand öffnen die Hand. Später mit Blickkontakt-Kriterium kombinieren.",
    descriptionEn:
      "Show a treat on an open palm. If the dog goes for it, close the hand. If he backs off, open the hand. He learns: calmness and distance open the hand. Later combine with an eye-contact criterion.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "leave_it_food",
    sortOrder: 8,
  },
  {
    id: "doorbell_calm",
    categoryId: "impulse_control",
    nameDe: "Türklingel-Ruhe",
    nameEn: "Doorbell Calm",
    descriptionDe:
      "Türklingel als Signal für \"Geh auf deine Decke\" aufbauen. Anfangs selbst klingeln, sofort auf die Decke lotsen und belohnen. Schrittweise echte Besucher einbauen. Braucht Wochen bis zur Zuverlässigkeit.",
    descriptionEn:
      "Build the doorbell as a cue for \"Go to your mat.\" Start by ringing yourself, luring to the mat, rewarding. Gradually add real visitors. Takes weeks to become reliable.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "settle_on_mat,down",
    sortOrder: 9,
  },
  {
    id: "delayed_gratification",
    categoryId: "impulse_control",
    nameDe: "Frustrationstoleranz",
    nameEn: "Delayed Gratification",
    descriptionDe:
      "Langes Warten vor bekannten Belohnungen in zunehmender Intensität — Futter in Sichtweite, Spielzeug auf Abstand, Ballwurf mit Warten. Baut Selbstkontrolle auf, eine der wichtigsten Fähigkeiten für Alltagstauglichkeit.",
    descriptionEn:
      "Extended waiting before known rewards in increasing intensity — food in view, a toy at a distance, a ball throw with wait. Builds self-control, one of the most important real-world skills.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "leave_it_food,wait_for_bowl,zen_bowl",
    sortOrder: 10,
  },
]
