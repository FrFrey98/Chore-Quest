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
    stepsDe: [
      "Flache Hand seitlich neben dem Körper halten, etwa 5 cm von der Hundenase entfernt.",
      "Hund schnüffelt oder berührt die Hand → sofort markern und belohnen.",
      "10 erfolgreiche Wiederholungen, dann die Hand in verschiedenen Positionen anbieten (links, rechts, höher, tiefer).",
      "Signal \"Touch\" einführen: Wort sagen, Hand hinhalten, Berührung → Marker + Belohnung.",
      "Distanz schrittweise erhöhen — Hund muss sich zur Hand bewegen.",
    ],
    stepsEn: [
      "Hold a flat hand to the side of your body, about 5 cm from the dog's nose.",
      "Dog sniffs or touches the hand → mark and reward immediately.",
      "After 10 successful reps, offer the hand in different positions (left, right, higher, lower).",
      "Introduce the cue \"Touch\": say the word, hold out the hand, contact → marker + reward.",
      "Gradually increase distance — the dog must move toward the hand.",
    ],
    mistakesDe: [
      "Hand auf den Hund zubewegen statt still zu halten — der Hund soll sich zur Hand bewegen.",
      "Zu lange warten mit dem Marker — der Klick/das Markerwort muss im Moment der Berührung kommen.",
      "Zu schnell das Signal einführen, bevor das Verhalten zuverlässig ist.",
    ],
    mistakesEn: [
      "Moving the hand toward the dog instead of holding it still — the dog should move to the hand.",
      "Delaying the marker — the click/marker word must come at the exact moment of contact.",
      "Introducing the cue too early, before the behavior is reliable.",
    ],
    progressionDe:
      "Hand erst nah und still → verschiedene Positionen → größere Distanz → Ablenkungen hinzufügen → Transfer auf andere Oberflächen (Target-Sticker, Gegenstände).",
    progressionEn:
      "Hand close and still first → different positions → greater distance → add distractions → transfer to other surfaces (target stickers, objects).",
    proTipDe:
      "Nutze Hand Touch als Reset-Signal: Wenn der Hund unsicher oder abgelenkt ist, bringt ein schneller Touch ihn zurück in den Arbeitsmodus.",
    proTipEn:
      "Use Hand Touch as a reset cue: when the dog is uncertain or distracted, a quick touch brings him back into working mode.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 3,
    methodology: "luring",
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
    stepsDe: [
      "Hund in Sitz bringen. Leckerli in der geschlossenen Faust auf Brusthöhe des Hundes halten.",
      "Warten — der Hund wird schnüffeln, lecken, dann irgendwann die Pfote heben oder kratzen.",
      "Im Moment des Pfotenhebens markern und Faust öffnen → Leckerli freigeben.",
      "Wiederholen, bis der Hund sofort die Pfote hebt, wenn die Faust erscheint.",
      "Signal \"Pfote\" einführen und die Faust durch eine offene Hand ersetzen.",
    ],
    stepsEn: [
      "Put the dog in a sit. Hold a treat in a closed fist at the dog's chest height.",
      "Wait — the dog will sniff, lick, then eventually lift or paw at the fist.",
      "Mark the moment the paw lifts and open the fist → release the treat.",
      "Repeat until the dog immediately lifts the paw when the fist appears.",
      "Introduce the cue \"Paw\" and replace the fist with an open hand.",
    ],
    mistakesDe: [
      "Zu früh markern, wenn der Hund nur schnüffelt statt die Pfote hebt.",
      "Die Faust zu hoch halten — der Hund soll nicht aufstehen, sondern die Pfote im Sitz heben.",
      "Ungeduld: Wenn der Hund nicht kratzt, die Faust leicht an der Pfote antippen, um die Idee zu geben.",
    ],
    mistakesEn: [
      "Marking too early when the dog is only sniffing instead of lifting the paw.",
      "Holding the fist too high — the dog should lift the paw while sitting, not stand up.",
      "Impatience: if the dog doesn't paw, lightly tap the fist near the paw to give the idea.",
    ],
    progressionDe:
      "Faust auf Brusthöhe → offene Hand → Hand höher → Hand weiter weg → linke und rechte Pfote differenzieren.",
    progressionEn:
      "Fist at chest height → open hand → hand higher → hand farther away → differentiate left and right paw.",
    proTipDe:
      "Trainiere beide Pfoten mit unterschiedlichen Signalen (\"Pfote\" / \"Andere Pfote\") — das fördert die Körperwahrnehmung.",
    proTipEn:
      "Train both paws with different cues (\"Paw\" / \"Other paw\") — this improves body awareness.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 5,
    methodology: "capturing",
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
    stepsDe: [
      "Pfote-Verhalten abrufen, aber die Hand etwas höher halten als gewohnt.",
      "Hand schrittweise von horizontal auf senkrecht drehen.",
      "Nur markern, wenn die Pfote die senkrechte Handfläche berührt.",
      "Signal \"High Five\" einführen, wenn das Verhalten zuverlässig kommt.",
    ],
    stepsEn: [
      "Cue the paw behavior but hold the hand slightly higher than usual.",
      "Gradually rotate the hand from horizontal to vertical.",
      "Only mark when the paw touches the vertical palm.",
      "Introduce the cue \"High Five\" once the behavior is reliable.",
    ],
    mistakesDe: [
      "Zu schnell von Pfote zu High Five wechseln — der Hund verwechselt die beiden Signale.",
      "Hand so hoch halten, dass der Hund aufstehen muss — er soll im Sitz bleiben.",
    ],
    mistakesEn: [
      "Switching from Paw to High Five too quickly — the dog confuses the two cues.",
      "Holding the hand so high that the dog has to stand up — he should remain sitting.",
    ],
    progressionDe:
      "Pfote auf flache Hand → Hand leicht drehen → Hand senkrecht → Hand höher → Signal differenzieren von \"Pfote\".",
    progressionEn:
      "Paw on flat hand → slightly rotate hand → hand vertical → hand higher → differentiate cue from \"Paw.\"",
    proTipDe:
      "High Five ist ein toller Publikumstrick — übe ihn auch mit Fremden, damit der Hund das Verhalten generalisiert.",
    proTipEn:
      "High Five is a great crowd-pleaser — practice with strangers so the dog generalizes the behavior.",
    durationMin: 3,
    frequencyPerDay: 2,
    estimatedDays: 4,
    methodology: "shaping",
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
    stepsDe: [
      "Leckerli direkt vor die Nase des stehenden Hundes halten.",
      "Hand langsam in einem großen Kreis führen — der Hund folgt mit Kopf und Körper.",
      "Volle 360°-Drehung → markern und belohnen.",
      "Lockbewegung schrittweise verkleinern, bis eine kleine Handdrehung reicht.",
      "Signal \"Dreh\" einführen; später nur das Wortsignal ohne Handzeichen.",
    ],
    stepsEn: [
      "Hold a treat right in front of the standing dog's nose.",
      "Slowly guide your hand in a large circle — the dog follows with head and body.",
      "Full 360° turn → mark and reward.",
      "Gradually reduce the luring motion until a small hand rotation is enough.",
      "Introduce the cue \"Spin\"; later use only the verbal cue without the hand signal.",
    ],
    mistakesDe: [
      "Zu schnell führen — der Hund verliert die Nase-Leckerli-Verbindung und dreht sich nicht vollständig.",
      "Immer in dieselbe Richtung üben — trainiere Linksdrehung und Rechtsdrehung separat.",
      "Den Lockkreis zu klein machen, bevor der Hund die Bewegung versteht.",
    ],
    mistakesEn: [
      "Guiding too fast — the dog loses the nose-treat connection and doesn't complete the turn.",
      "Always practicing the same direction — train left spin and right spin separately.",
      "Making the luring circle too small before the dog understands the movement.",
    ],
    progressionDe:
      "Großer Kreis mit Leckerli → kleinerer Kreis → Handgeste ohne Leckerli → nur Wortsignal → beide Richtungen auf Signal.",
    progressionEn:
      "Large circle with treat → smaller circle → hand gesture without treat → verbal cue only → both directions on cue.",
    proTipDe:
      "Spin eignet sich hervorragend als Aufwärmübung vor dem Training und hilft, aufgeregten Hunden Energie abzubauen.",
    proTipEn:
      "Spin works perfectly as a warm-up before training sessions and helps excited dogs burn off energy.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 4,
    methodology: "luring",
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
    stepsDe: [
      "Flache Hand auf Nasenhöhe des Hundes anbieten, Leckerli unter der Handfläche.",
      "Hund senkt die Nase zum Leckerli → Kinn berührt die Handfläche → sofort markern.",
      "Dauer schrittweise aufbauen: erst 1 Sekunde Kinnkontakt, dann 2, dann 5.",
      "Leckerli aus der Hand entfernen — Hund legt das Kinn freiwillig auf die leere Hand.",
      "Transfer auf andere Oberflächen: Knie, Tisch, Untersuchungsliege.",
    ],
    stepsEn: [
      "Offer a flat hand at the dog's nose height with a treat under the palm.",
      "Dog lowers nose toward the treat → chin touches the palm → mark immediately.",
      "Gradually build duration: first 1 second of chin contact, then 2, then 5.",
      "Remove the treat from the hand — dog rests chin voluntarily on the empty hand.",
      "Transfer to other surfaces: knee, table, examination table.",
    ],
    mistakesDe: [
      "Dauer zu schnell steigern — der Hund hebt den Kopf und wird frustriert.",
      "Die Hand zum Hund bewegen statt den Hund zum Kinnablegen kommen lassen.",
      "Vergessen, das Kinnablegen als Kooperationssignal für Pflegeübungen zu nutzen.",
    ],
    mistakesEn: [
      "Increasing duration too quickly — the dog lifts the head and gets frustrated.",
      "Moving the hand toward the dog instead of letting the dog come to rest the chin.",
      "Forgetting to use chin rest as a cooperative care signal for grooming exercises.",
    ],
    progressionDe:
      "Kurzer Kinnkontakt → längere Dauer → verschiedene Oberflächen → Chin Rest während Pflege (Ohren, Pfoten) → Chin Rest beim Tierarzt.",
    progressionEn:
      "Brief chin contact → longer duration → different surfaces → chin rest during grooming (ears, paws) → chin rest at the vet.",
    proTipDe:
      "Chin Rest ist ein Schlüsselverhalten in der kooperativen Pflege: Der Hund signalisiert damit aktiv seine Einwilligung. Hebt er den Kopf, pausierst du sofort.",
    proTipEn:
      "Chin Rest is a key behavior in cooperative care: the dog actively signals consent. If he lifts his head, you pause immediately.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 7,
    methodology: "luring",
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
    stepsDe: [
      "Hund ins Platz bringen. Leckerli von der Nase zur Schulter führen — der Kopf dreht sich.",
      "Kopfdrehung markern und belohnen (erster Teilschritt).",
      "Leckerli weiter über die Schulter führen — der Hund kippt auf die Seite. Markern und belohnen.",
      "Von der Seite weiter auf den Rücken und dann zur anderen Seite durchrollen lassen.",
      "Volle Rolle → Jackpot. Signal \"Rolle\" einführen.",
      "Lockbewegung schrittweise zu einer kleinen Kreisbewegung der Hand reduzieren.",
    ],
    stepsEn: [
      "Put the dog in a down. Guide a treat from the nose to the shoulder — the head turns.",
      "Mark and reward the head turn (first approximation).",
      "Guide the treat further over the shoulder — the dog tips onto the side. Mark and reward.",
      "From the side, continue over the back and through to the other side.",
      "Full roll → jackpot. Introduce the cue \"Roll Over.\"",
      "Gradually reduce the luring motion to a small circular hand movement.",
    ],
    mistakesDe: [
      "Zu schnell die volle Rolle verlangen, statt Teilschritte zu belohnen.",
      "Auf hartem Boden üben — das ist unangenehm. Immer auf weicher Unterlage trainieren.",
      "Hunde mit Rückenproblemen oder großrassige Hunde mit Gelenkempfindlichkeit zum Rollen zwingen — vorher tierärztlich abklären.",
    ],
    mistakesEn: [
      "Demanding a full roll too soon instead of rewarding approximations.",
      "Practicing on hard floors — this is uncomfortable. Always train on a soft surface.",
      "Forcing dogs with back problems or large breeds with joint sensitivity to roll — consult a vet first.",
    ],
    progressionDe:
      "Kopfdrehung → auf die Seite kippen → volle Rolle mit Lure → volle Rolle mit Handsignal → nur Wortsignal.",
    progressionEn:
      "Head turn → tip onto side → full roll with lure → full roll with hand signal → verbal cue only.",
    proTipDe:
      "Beobachte, auf welche Seite sich dein Hund natürlich legt — starte die Rolle immer zu dieser bevorzugten Seite. Erst später die andere Seite trainieren.",
    proTipEn:
      "Watch which side your dog naturally lies on — always start the roll toward that preferred side. Train the other side later.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 10,
    methodology: "shaping",
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
    stepsDe: [
      "Hund in Sitz bringen. Leckerli langsam von der Nase nach oben führen.",
      "Sobald sich die Vorderpfoten leicht vom Boden lösen → sofort markern und belohnen.",
      "Dauer schrittweise steigern: 1 Sekunde → 2 Sekunden → 5 Sekunden.",
      "Eine Wand oder deine Hand als Stütze anbieten, damit der Hund Balance lernt.",
      "Stütze schrittweise entfernen. Signal \"Männchen\" einführen.",
    ],
    stepsEn: [
      "Put the dog in a sit. Slowly lift a treat from the nose upward.",
      "As soon as the front paws slightly leave the ground → mark and reward immediately.",
      "Gradually increase duration: 1 second → 2 seconds → 5 seconds.",
      "Offer a wall or your hand as support so the dog learns balance.",
      "Gradually remove the support. Introduce the cue \"Sit Pretty.\"",
    ],
    mistakesDe: [
      "Zu schnell Dauer verlangen — der Hund kippt um und wird frustriert.",
      "Ohne Stütze starten — Rumpfmuskulatur muss erst aufgebaut werden.",
      "Bei Welpen oder Junghunden unter 12 Monaten trainieren — die Wirbelsäule ist noch nicht belastbar.",
    ],
    mistakesEn: [
      "Demanding duration too quickly — the dog topples over and gets frustrated.",
      "Starting without support — core muscles must be built up first.",
      "Training with puppies or young dogs under 12 months — the spine is not yet fully developed.",
    ],
    progressionDe:
      "Pfoten heben mit Stütze → kurz frei halten → Dauer steigern → ohne Stütze → Wortsignal auf Distanz.",
    progressionEn:
      "Paws lift with support → brief free hold → increase duration → without support → verbal cue at distance.",
    proTipDe:
      "Männchen ist ein echtes Krafttraining für den Rumpf. Übertreibe es nicht — maximal 5 Wiederholungen pro Session. Bei Hunden mit Rückenproblemen, Hüftdysplasie oder im Wachstum: komplett weglassen.",
    proTipEn:
      "Sit Pretty is genuine core strength training. Don't overdo it — 5 reps per session max. For dogs with back problems, hip dysplasia, or still growing: skip this trick entirely.",
    durationMin: 3,
    frequencyPerDay: 2,
    estimatedDays: 21,
    methodology: "luring",
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
    stepsDe: [
      "Hund steht. Leckerli von der Nase langsam Richtung Vorderpfoten führen.",
      "Schultern senken sich, Hinterteil bleibt oben → sofort markern, BEVOR der Hund sich hinlegt.",
      "Falls der Hund ablegt: deinen Arm sanft unter seinen Bauch halten als Stütze.",
      "Stütze schrittweise entfernen. Signal \"Verbeugung\" oder \"Bitte\" einführen.",
    ],
    stepsEn: [
      "Dog stands. Slowly guide a treat from the nose toward the front paws.",
      "Shoulders lower, hindquarters stay up → mark immediately BEFORE the dog lies down.",
      "If the dog lies down: gently hold your arm under his belly as support.",
      "Gradually remove the support. Introduce the cue \"Bow\" or \"Please.\"",
    ],
    mistakesDe: [
      "Zu langsam markern — der Hund legt sich komplett ab statt in der Verbeugung zu bleiben.",
      "Leckerli zu weit nach hinten führen — das bringt den Hund ins Platz statt in die Verbeugung.",
      "Ohne Bauchstütze starten, wenn der Hund immer wieder ablegt.",
    ],
    mistakesEn: [
      "Marking too slowly — the dog lies down completely instead of holding the bow.",
      "Guiding the treat too far back — this puts the dog in a down instead of a bow.",
      "Starting without belly support when the dog keeps lying down.",
    ],
    progressionDe:
      "Verbeugung mit Bauchstütze → ohne Stütze → Dauer steigern → Wortsignal → als Show-Abschluss nutzen.",
    progressionEn:
      "Bow with belly support → without support → increase duration → verbal cue → use as a show finale.",
    proTipDe:
      "Fange das natürliche Strecken nach dem Aufstehen ein (Capturing): Viele Hunde machen morgens eine perfekte Verbeugung — markern und belohnen!",
    proTipEn:
      "Capture the natural stretch after waking up: many dogs perform a perfect bow in the morning — mark and reward!",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 10,
    methodology: "luring",
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
    stepsDe: [
      "Hund ins Platz bringen. Leckerli von der Nase zur Schulter führen, bis er auf die Seite kippt.",
      "Auf der Seite liegend markern und belohnen. Dauer schrittweise aufbauen.",
      "Kopf flach auf dem Boden → Extrabelohnung (der Hund soll völlig entspannt wirken).",
      "Signal \"Peng!\" mit Fingerpistolen-Geste einführen.",
      "Hund lernt, aus dem Stehen oder Sitzen direkt in die Seitenposition zu gehen.",
    ],
    stepsEn: [
      "Put the dog in a down. Guide a treat from the nose to the shoulder until he tips onto his side.",
      "Mark and reward while lying on the side. Gradually build duration.",
      "Head flat on the ground → extra reward (the dog should look completely relaxed).",
      "Introduce the cue \"Bang!\" with a finger-gun gesture.",
      "Dog learns to go directly into the side position from standing or sitting.",
    ],
    mistakesDe: [
      "Dauer zu schnell steigern — der Hund steht frustriert auf.",
      "Nur aus dem Platz trainieren — später auch aus dem Stehen und Sitzen üben.",
      "Vergessen, dass manche Hunde sich auf dem Rücken/der Seite unwohl fühlen — nie erzwingen.",
    ],
    mistakesEn: [
      "Increasing duration too quickly — the dog stands up frustrated.",
      "Only training from a down — later practice from standing and sitting too.",
      "Forgetting that some dogs feel uncomfortable on their back/side — never force it.",
    ],
    progressionDe:
      "Auf die Seite kippen → Kopf ablegen → Dauer halten → aus verschiedenen Positionen → dramatischer \"Peng\"-Effekt auf Distanz.",
    progressionEn:
      "Tip onto side → head down → hold duration → from different positions → dramatic \"Bang\" effect at distance.",
    proTipDe:
      "Für den Wow-Effekt: Übe, dass der Hund aus dem Stehen \"umfällt\" — das erfordert, dass Platz und Seitenlage in einer fließenden Bewegung verschmelzen.",
    proTipEn:
      "For the wow factor: practice the dog \"collapsing\" from a stand — this requires down and side position to merge into one fluid motion.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 14,
    methodology: "shaping",
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
    stepsDe: [
      "Breitbeinig hinstellen. Leckerli in der rechten Hand durch das rechte Bein nach hinten reichen, den Hund durchlocken.",
      "Hund geht zwischen den Beinen durch → markern und belohnen.",
      "Dasselbe mit der linken Seite üben.",
      "Abwechselnd rechts-links üben: Hund schlängelt sich in einer S-Kurve durch.",
      "Im Gehen üben: einen Schritt machen, Hund schlängelt durch, nächster Schritt.",
      "Lockbewegung reduzieren, Signal \"Durch\" einführen.",
    ],
    stepsEn: [
      "Stand with legs spread. Reach a treat in your right hand through the right leg backward, lure the dog through.",
      "Dog passes between the legs → mark and reward.",
      "Practice the same on the left side.",
      "Alternate right-left: the dog weaves in an S-curve.",
      "Practice while walking: take one step, dog weaves through, next step.",
      "Reduce luring motion, introduce the cue \"Weave.\"",
    ],
    mistakesDe: [
      "Beine zu eng stellen — besonders bei größeren Hunden braucht es genug Platz.",
      "Zu schnell ins Gehen wechseln, bevor der Hund das Slalom im Stehen beherrscht.",
      "Den Hund von vorne statt von hinten durchlocken — das erzeugt die falsche Bewegungsrichtung.",
    ],
    mistakesEn: [
      "Standing with legs too close together — especially larger dogs need enough room.",
      "Switching to walking too soon before the dog masters the weave while standing still.",
      "Luring the dog from front to back instead of back to front — this creates the wrong movement direction.",
    ],
    progressionDe:
      "Einmal durch ein Bein → abwechselnd beide Seiten stehend → langsames Gehen → normales Gehtempo → Lauftempo.",
    progressionEn:
      "Once through one leg → alternating both sides while standing → slow walk → normal walking pace → jogging pace.",
    proTipDe:
      "Starte mit dem Hund hinter dir und locke nach vorne — das ist die natürliche Richtung. Die meisten Fehler entstehen, wenn der Hund falsch herum startet.",
    proTipEn:
      "Start with the dog behind you and lure forward — that's the natural direction. Most mistakes happen when the dog starts from the wrong side.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 14,
    methodology: "luring",
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
    stepsDe: [
      "Target-Stick mit Ball am Ende vor die Hundenase halten (wie Hand Touch).",
      "Hund berührt den Ball mit der Nase → markern und belohnen.",
      "Ball in verschiedene Positionen halten: links, rechts, oben, unten.",
      "Distanz vergrößern — der Hund muss sich zum Ball bewegen.",
      "Hund folgt dem Ball in Bewegung: ein paar Schritte → markern.",
    ],
    stepsEn: [
      "Hold the target stick with ball tip near the dog's nose (like Hand Touch).",
      "Dog touches the ball with the nose → mark and reward.",
      "Hold the ball in different positions: left, right, up, down.",
      "Increase distance — the dog must move toward the ball.",
      "Dog follows the ball in motion: a few steps → mark.",
    ],
    mistakesDe: [
      "Stick zu schnell bewegen — der Hund soll den Ball berühren, nicht hinterherjagen.",
      "Stick als Zeigefinger nutzen statt als Touch-Target — der Hund soll immer den Ball berühren.",
      "Zu viel Distanz auf einmal aufbauen.",
    ],
    mistakesEn: [
      "Moving the stick too fast — the dog should touch the ball, not chase it.",
      "Using the stick as a pointer instead of a touch target — the dog should always touch the ball.",
      "Building too much distance at once.",
    ],
    progressionDe:
      "Ball berühren nah → verschiedene Positionen → Distanz → dem Ball folgen → komplexe Pfade (um Hindernisse, auf Podeste).",
    progressionEn:
      "Touch ball close → different positions → distance → follow the ball → complex paths (around obstacles, onto platforms).",
    proTipDe:
      "Ein Target-Stick ist das mächtigste Werkzeug für fortgeschrittene Tricks: Du kannst den Hund damit auf Distanz lenken, ohne dich selbst bewegen zu müssen.",
    proTipEn:
      "A target stick is the most powerful tool for advanced tricks: you can direct the dog at a distance without having to move yourself.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 7,
    methodology: "luring",
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
    stepsDe: [
      "Gegenstand auf den Boden legen. Jedes Interesse (Blick, Schnüffeln) → markern und belohnen.",
      "Nur noch Berühren mit der Nase belohnen.",
      "Nur noch Maul-Öffnen am Gegenstand belohnen.",
      "Nur noch Aufheben belohnen → Gegenstand kurz im Maul halten.",
      "Halten verlängern. Dann: Gegenstand auf Entfernung → Hund holt ihn und bringt ihn zurück.",
      "Bei Rückkehr \"Aus\" über der Hand → Gegenstand abgeben → Jackpot.",
    ],
    stepsEn: [
      "Place an object on the ground. Any interest (looking, sniffing) → mark and reward.",
      "Only reward touching the object with the nose.",
      "Only reward opening the mouth on the object.",
      "Only reward picking up → holding the object briefly in the mouth.",
      "Extend the hold. Then: object at a distance → dog fetches it and brings it back.",
      "On return, cue \"Drop\" over your hand → dog releases the object → jackpot.",
    ],
    mistakesDe: [
      "Zu schnelle Steigerung — jeder Teilschritt muss zuverlässig sitzen, bevor der nächste kommt.",
      "Den Hund jagen, wenn er den Gegenstand hat — das macht ein Spiel daraus statt eines Apports.",
      "Gegenstand zu groß oder zu schwer für den Hund wählen.",
    ],
    mistakesEn: [
      "Progressing too fast — each approximation must be reliable before moving to the next.",
      "Chasing the dog when he has the object — this turns it into a keep-away game instead of a retrieve.",
      "Choosing an object that is too big or too heavy for the dog.",
    ],
    progressionDe:
      "Interesse am Gegenstand → Berühren → Maul öffnen → Aufheben → Halten → kurze Distanz bringen → längere Distanz → verschiedene Gegenstände.",
    progressionEn:
      "Interest in object → touch → mouth open → pick up → hold → short distance retrieve → longer distance → different objects.",
    proTipDe:
      "Bei apportierfreudigen Rassen wie Labradoodles: Nutze das natürliche Tragen-Wollen. Bei weniger motivierten Hunden: Starte mit einem Lieblingsgegenstand und shape geduldig.",
    proTipEn:
      "For retrieve-driven breeds like Labradoodles: leverage the natural desire to carry. For less motivated dogs: start with a favorite object and shape patiently.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 21,
    methodology: "shaping",
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
    stepsDe: [
      "Kiste direkt vor dich stellen. Hund bringt Spielzeug (Apportieren muss sitzen).",
      "\"Aus\" direkt über der Kiste sagen → Gegenstand fällt hinein → markern + Jackpot.",
      "Kiste schrittweise weiter weg von dir platzieren.",
      "Mehrere Gegenstände nacheinander einräumen lassen.",
      "Signal \"Aufräumen\" einführen — Hund sucht eigenständig Spielzeug und bringt es zur Kiste.",
    ],
    stepsEn: [
      "Place the box right in front of you. Dog brings a toy (retrieve must be solid).",
      "Say \"Drop\" directly over the box → object falls in → mark + jackpot.",
      "Gradually move the box further away from you.",
      "Have the dog put away multiple objects in sequence.",
      "Introduce the cue \"Tidy Up\" — dog independently seeks out toys and brings them to the box.",
    ],
    mistakesDe: [
      "Apportieren ist noch nicht zuverlässig — Aufräumen funktioniert nur, wenn der Hund sicher bringt und abgibt.",
      "Kiste zu klein oder zu hoch — der Gegenstand muss leicht hineinfallen können.",
      "Zu viele Gegenstände auf einmal — starte mit einem, steigere langsam.",
    ],
    mistakesEn: [
      "Retrieve is not reliable yet — Tidy Up only works when the dog reliably brings and drops.",
      "Box too small or too tall — the object must be able to fall in easily.",
      "Too many objects at once — start with one, increase gradually.",
    ],
    progressionDe:
      "Aus über der Kiste direkt vor dir → Kiste weiter weg → mehrere Gegenstände → Hund sucht eigenständig → verschiedene Räume.",
    progressionEn:
      "Drop over the box right in front of you → box farther away → multiple objects → dog searches independently → different rooms.",
    proTipDe:
      "Nutze eine flache, große Kiste am Anfang — je leichter der Treffer, desto schneller lernt der Hund das Konzept. Die Kiste kann später kleiner werden.",
    proTipEn:
      "Use a shallow, large box at the start — the easier the target, the faster the dog learns the concept. The box can get smaller later.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 14,
    methodology: "chaining",
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
    stepsDe: [
      "Target-Sticker auf Nasenhöhe an die Wand kleben. Hund berührt Sticker → markern, belohnen.",
      "Sticker schrittweise Richtung Lichtschalter verschieben.",
      "Sticker direkt auf den Lichtschalter kleben.",
      "Nur noch festere Berührungen belohnen, die den Schalter tatsächlich bewegen.",
      "Licht geht an → Jackpot + großes Lob. Signal \"Licht\" einführen.",
    ],
    stepsEn: [
      "Stick a target sticker on the wall at nose height. Dog touches sticker → mark, reward.",
      "Gradually move the sticker toward the light switch.",
      "Stick the sticker directly on the light switch.",
      "Only reward firmer touches that actually move the switch.",
      "Light turns on → jackpot + big praise. Introduce the cue \"Light.\"",
    ],
    mistakesDe: [
      "Sticker sofort auf den Schalter kleben — der Hund muss erst das Konzept \"Sticker berühren\" verstanden haben.",
      "Zu früh Druck verlangen — erst Position, dann Kraft aufbauen.",
      "Einen Schaltertyp wählen, den der Hund nicht betätigen kann (z.B. Drehschalter).",
    ],
    mistakesEn: [
      "Putting the sticker directly on the switch — the dog must first understand the concept of \"touch the sticker.\"",
      "Demanding pressure too early — first build position, then force.",
      "Choosing a switch type the dog can't operate (e.g., a rotary switch).",
    ],
    progressionDe:
      "Sticker an Wand berühren → Sticker auf Schalter → leichter Druck → Schalter umlegen → auf Signal → von verschiedenen Positionen im Raum.",
    progressionEn:
      "Touch sticker on wall → sticker on switch → light pressure → flip the switch → on cue → from different positions in the room.",
    proTipDe:
      "Wippschalter sind am einfachsten. Große Hunde können auch mit der Pfote arbeiten — trainiere in dem Fall \"Pfote auf Target\" statt Nasentouch.",
    proTipEn:
      "Rocker switches are the easiest. Large dogs can also use a paw — in that case train \"paw on target\" instead of a nose touch.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 14,
    methodology: "shaping",
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
    stepsDe: [
      "Einen Gegenstand benennen (z.B. \"Ball\"). Hund apportiert ihn → markern, belohnen.",
      "Zweiten, deutlich anderen Gegenstand danebenlegen. Nur den benannten belohnen.",
      "Bei korrekter Wahl → Jackpot. Bei falscher Wahl → neutral, ohne Belohnung neu starten.",
      "Dritten Gegenstand hinzufügen, wenn die Unterscheidung zwischen den ersten beiden zuverlässig ist.",
      "Neue Gegenstände einzeln einführen und dann in die bestehende Auswahl integrieren.",
    ],
    stepsEn: [
      "Name one object (e.g., \"Ball\"). Dog retrieves it → mark, reward.",
      "Place a second, clearly different object nearby. Only reward the named one.",
      "Correct choice → jackpot. Wrong choice → neutral, restart without reward.",
      "Add a third object once discrimination between the first two is reliable.",
      "Introduce new objects individually, then integrate them into the existing selection.",
    ],
    mistakesDe: [
      "Zu viele Gegenstände gleichzeitig einführen — immer nur einen neuen dazunehmen.",
      "Ähnlich aussehende Gegenstände am Anfang verwenden — starte mit maximaler visueller Unterscheidbarkeit.",
      "Bei falscher Wahl schimpfen — das verunsichert den Hund. Einfach neutral neu ansetzen.",
    ],
    mistakesEn: [
      "Introducing too many objects at once — always add only one new item at a time.",
      "Using similar-looking objects at the start — begin with maximum visual distinctiveness.",
      "Scolding for a wrong choice — this unsettles the dog. Simply restart neutrally.",
    ],
    progressionDe:
      "1 Gegenstand → 2 Gegenstände unterscheiden → 3+ Gegenstände → Gegenstände in verschiedenen Räumen suchen → neue Wörter eigenständig lernen.",
    progressionEn:
      "1 object → discriminate 2 objects → 3+ objects → search for objects in different rooms → learn new words independently.",
    proTipDe:
      "Manche Hunde nutzen Positionsgedächtnis statt echtes Wortverstehen. Wechsle die Positionen der Gegenstände regelmäßig, um sicherzustellen, dass der Hund wirklich auf den Namen reagiert.",
    proTipEn:
      "Some dogs rely on positional memory instead of true word recognition. Regularly change object positions to ensure the dog truly responds to the name.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 30,
    methodology: "shaping",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "retrieve",
    sortOrder: 15,
  },
]
