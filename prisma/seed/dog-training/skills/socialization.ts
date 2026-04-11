// prisma/seed/dog-training/skills/socialization.ts
import type { SkillSeed } from "../types"

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
    stepsDe: [
      "Berühre den Hund kurz an einer unkritischen Stelle (Schulter), markere und belohne.",
      "Erweitere auf empfindlichere Stellen (Pfote, Ohr) — jeweils nur 1 Sekunde Berührung.",
      "Steigere die Berührungsdauer schrittweise um 1-2 Sekunden pro Session.",
      "Führe verschiedene Berührungsarten ein: Streicheln, leichtes Drücken, Anheben.",
      "Achte auf Consent-Signale: Biete deine Hand an — kommt der Hund näher, darf berührt werden.",
    ],
    stepsEn: [
      "Touch the dog briefly on a non-sensitive area (shoulder), mark and reward.",
      "Expand to more sensitive areas (paw, ear) — just 1 second of contact each.",
      "Gradually increase touch duration by 1-2 seconds per session.",
      "Introduce different touch types: stroking, gentle pressure, lifting.",
      "Watch for consent signals: offer your hand — if the dog moves closer, touching is welcome.",
    ],
    mistakesDe: [
      "Den Hund festhalten, wenn er sich entziehen will — zerstört das Vertrauen und erzeugt Meideverhalten.",
      "Zu schnell zu empfindlichen Stellen (Maul, Pfoten) vordringen, bevor neutrale Körperstellen sicher sind.",
      "Ohne Marker arbeiten — der Hund kann die Berührung nicht als positiv verknüpfen.",
    ],
    mistakesEn: [
      "Restraining the dog when he tries to move away — destroys trust and creates avoidance behavior.",
      "Moving to sensitive areas (mouth, paws) too quickly before neutral body parts are solid.",
      "Working without a marker — the dog cannot form a positive association with the touch.",
    ],
    progressionDe:
      "Beginne mit kurzen Berührungen an Schulter und Rücken. Steigere zu Ohren, Pfoten und Maul. Dann verschiedene Personen einbeziehen. Schließlich in neuer Umgebung und mit fremden Händen üben.",
    progressionEn:
      "Start with brief touches on the shoulder and back. Progress to ears, paws, and mouth. Then include different people. Finally practice in new environments and with unfamiliar hands.",
    proTipDe:
      "Etabliere ein Chin-Rest (Kinn ablegen) als Start-Signal. Der Hund legt sein Kinn in deine Hand und signalisiert damit: Ich bin bereit. Hebt er den Kopf, ist das ein klares Stopp-Signal. So gibst du dem Hund die Kontrolle über die Situation.",
    proTipEn:
      "Establish a chin-rest as a start signal. The dog places his chin in your hand, signaling: I'm ready. If he lifts his head, that's a clear stop signal. This gives the dog control over the situation.",
    durationMin: 3,
    frequencyPerDay: 4,
    estimatedDays: 14,
    methodology: "classical",
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
    stepsDe: [
      "Berühre die Pfote des Hundes kurz, markere und belohne — noch nicht anheben.",
      "Hebe die Pfote für 1 Sekunde an, markere, belohne. Dauer langsam steigern.",
      "Berühre einzelne Zehen und Krallen sanft, markere jede Akzeptanz.",
      "Zeige den Nagelknipser, markere und belohne — ohne die Krallen zu berühren.",
      "Setze den Knipser an eine Kralle an, ohne zu schneiden. Markere und belohne.",
      "Schneide eine einzelne Kralle, markere, belohne. Pro Session maximal 1-2 Krallen.",
    ],
    stepsEn: [
      "Touch the dog's paw briefly, mark and reward — no lifting yet.",
      "Lift the paw for 1 second, mark, reward. Slowly increase duration.",
      "Gently touch individual toes and nails, mark each acceptance.",
      "Show the nail clipper, mark and reward — without touching the nails.",
      "Place the clipper on one nail without cutting. Mark and reward.",
      "Clip a single nail, mark, reward. Maximum 1-2 nails per session.",
    ],
    mistakesDe: [
      "Alle Krallen in einer Session schneiden wollen — überfordert den Hund und erzeugt Widerstand.",
      "Die Pfote festhalten, wenn der Hund sie wegzieht — stattdessen loslassen und Kriterium senken.",
      "Den Nagelknipser ohne vorherige Desensibilisierung einsetzen.",
    ],
    mistakesEn: [
      "Trying to clip all nails in one session — overwhelms the dog and creates resistance.",
      "Holding the paw when the dog pulls away — instead, let go and lower the criterion.",
      "Using the nail clipper without prior desensitization.",
    ],
    progressionDe:
      "Phase 1: Pfote berühren. Phase 2: Pfote anheben und halten. Phase 3: Zehen einzeln spreizen. Phase 4: Nagelknipser zeigen und Geräusch machen. Phase 5: Knipser an Kralle ansetzen. Phase 6: Einzelne Kralle kürzen. Jede Phase erst sicher, dann weiter.",
    progressionEn:
      "Phase 1: Touch the paw. Phase 2: Lift and hold the paw. Phase 3: Spread individual toes. Phase 4: Show the clipper and make the sound. Phase 5: Place the clipper on a nail. Phase 6: Clip a single nail. Each phase must be solid before moving on.",
    proTipDe:
      "Nutze eine Lickimat mit Paste als Zusatzbeschäftigung während der Pfotenpflege. Das hält den Hund beschäftigt und verknüpft die Situation mit positiven Emotionen. Arbeite immer unter der Reizschwelle — lieber zu langsam als zu schnell.",
    proTipEn:
      "Use a lickimat with paste as an additional occupation during paw care. This keeps the dog busy and creates positive associations. Always work below threshold — better too slow than too fast.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 21,
    methodology: "classical",
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
    stepsDe: [
      "Füttere Leckerli am offenen Auto — der Hund muss nicht einsteigen.",
      "Belohne das freiwillige Einsteigen ins Auto. Motor bleibt aus.",
      "Starte den Motor bei geöffneter Tür, markere Ruhe, belohne.",
      "Kurze Fahrt (30 Sekunden), ruhig aussteigen, belohnen.",
      "Fahrten schrittweise verlängern (2 Min, 5 Min, 10 Min).",
      "Fahrt zu einem schönen Ziel (Spaziergang), damit Autofahren positiv endet.",
    ],
    stepsEn: [
      "Feed treats near the open car — the dog doesn't need to get in.",
      "Reward voluntary entry into the car. Engine stays off.",
      "Start the engine with the door open, mark calmness, reward.",
      "Short drive (30 seconds), calm exit, reward.",
      "Gradually extend drives (2 min, 5 min, 10 min).",
      "Drive to a pleasant destination (walk) so car rides end positively.",
    ],
    mistakesDe: [
      "Die erste Autofahrt gleich zum Tierarzt machen — der Hund verknüpft das Auto sofort negativ.",
      "Den Hund ins Auto zwingen oder heben, anstatt ihn freiwillig einsteigen zu lassen.",
      "Bei Anzeichen von Übelkeit (Hecheln, Speicheln) die Fahrt fortsetzen statt abzubrechen.",
    ],
    mistakesEn: [
      "Making the first car ride a vet trip — the dog immediately forms a negative association.",
      "Forcing or lifting the dog into the car instead of allowing voluntary entry.",
      "Continuing the drive when signs of nausea (panting, drooling) appear instead of stopping.",
    ],
    progressionDe:
      "Am Auto stehen → Einsteigen bei offenem Kofferraum → Türen zu bei stehendem Motor → Motor an → Auffahrt hoch und runter → Kurzstrecke zum Park → Mittlere Strecke → Längere Fahrten. Immer nur einen Parameter steigern.",
    progressionEn:
      "Stand near the car → Get in with trunk open → Doors closed, engine off → Engine on → Drive up and down the driveway → Short trip to the park → Medium drive → Longer drives. Only increase one parameter at a time.",
    proTipDe:
      "Ingwer-Leckerli (hundgeeignet) können bei Reiseübelkeit helfen. Fahre auf nüchternen Magen und sorge für frische Luft. Eine Anti-Rutsch-Matte im Kofferraum gibt dem Hund sicheren Halt und reduziert Stress.",
    proTipEn:
      "Ginger treats (dog-safe) can help with motion sickness. Drive on an empty stomach and ensure fresh air. A non-slip mat in the trunk gives the dog secure footing and reduces stress.",
    durationMin: 5,
    frequencyPerDay: 1,
    estimatedDays: 14,
    methodology: "classical",
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
    stepsDe: [
      "Hund auf der Matte, stehe auf und setze dich sofort wieder hin. Markere Ruhe.",
      "Stehe auf, gehe einen Schritt Richtung Tür, komme zurück. Markere und belohne.",
      "Gehe zur Tür, berühre die Klinke, komme zurück. Kein Aufsehen beim Gehen oder Kommen.",
      "Gehe durch die Tür, schließe sie für 3 Sekunden, komme ruhig zurück.",
      "Steigere auf 10 Sek, 30 Sek, 1 Min, 3 Min — nicht linear, sondern mit Variation.",
    ],
    stepsEn: [
      "Dog on the mat, stand up and sit right back down. Mark calmness.",
      "Stand up, take one step toward the door, return. Mark and reward.",
      "Walk to the door, touch the handle, return. No fuss on leaving or arriving.",
      "Walk through the door, close it for 3 seconds, return calmly.",
      "Increase to 10 sec, 30 sec, 1 min, 3 min — not linearly, but with variation.",
    ],
    mistakesDe: [
      "Beim Zurückkommen überschwänglich begrüßen — das macht das Alleinsein zum aufregenden Ereignis.",
      "Zu schnell steigern und den Hund in Panik bringen — dann muss man viele Schritte zurückgehen.",
      "Nur linear steigern (5s, 10s, 15s) statt zu variieren (5s, 10s, 3s, 15s, 8s) — der Hund muss lernen, dass kurze und lange Pausen normal sind.",
    ],
    mistakesEn: [
      "Greeting enthusiastically upon return — this makes being alone a highly arousing event.",
      "Progressing too quickly and triggering panic — then you have to go back many steps.",
      "Only increasing linearly (5s, 10s, 15s) instead of varying (5s, 10s, 3s, 15s, 8s) — the dog must learn that both short and long absences are normal.",
    ],
    progressionDe:
      "Aufstehen → Zur Tür gehen → Tür öffnen → Tür schließen (5s) → 30s → 2 Min → 5 Min → 10 Min. Variiere die Zeiten immer wieder nach unten. Nutze eine Kamera, um den Hund zu beobachten.",
    progressionEn:
      "Stand up → Walk to the door → Open the door → Close the door (5s) → 30s → 2 min → 5 min → 10 min. Always vary times back down. Use a camera to observe the dog.",
    proTipDe:
      "Nutze eine Kamera (Handy-App reicht) um den Hund zu beobachten. Trennungsangst zeigt sich oft erst nach 5-10 Minuten — Hecheln, Winseln, an der Tür kratzen. Wenn du Stresssignale siehst, gehe sofort zum letzten erfolgreichen Schritt zurück.",
    proTipEn:
      "Use a camera (phone app is enough) to observe the dog. Separation anxiety often shows up after 5-10 minutes — panting, whining, scratching at the door. If you see stress signals, immediately return to the last successful step.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 28,
    methodology: "protocol",
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
    stepsDe: [
      "Maulkorb auf den Boden legen — jedes Beschnüffeln markern und belohnen.",
      "Leckerli durch das Gitter reichen, sodass der Hund seine Nase reinsteckt.",
      "Nase im Korb → 1 Sekunde halten, markern, belohnen. Dauer langsam steigern.",
      "Verschluss kurz schließen (2 Sekunden), sofort öffnen, markern, belohnen.",
      "Verschlusszeit schrittweise auf 30 Sekunden, dann Minuten steigern.",
      "Mit Maulkorb spazieren gehen — kurze, positive Runden.",
    ],
    stepsEn: [
      "Place the muzzle on the floor — mark and reward any sniffing.",
      "Feed treats through the basket so the dog pushes his nose in.",
      "Nose in the basket → hold for 1 second, mark, reward. Slowly increase duration.",
      "Briefly close the clasp (2 seconds), open immediately, mark, reward.",
      "Gradually increase clasp duration to 30 seconds, then minutes.",
      "Walk with the muzzle on — short, positive outings.",
    ],
    mistakesDe: [
      "Den Maulkorb einfach aufsetzen und hoffen, der Hund gewöhnt sich dran — erzeugt Widerstand und Panik.",
      "Nur beim Tierarzt den Maulkorb aufsetzen — dann wird er zum negativen Signal.",
      "Einen zu engen oder schlecht sitzenden Maulkorb verwenden — der Hund muss hecheln und trinken können.",
    ],
    mistakesEn: [
      "Simply putting the muzzle on and hoping the dog gets used to it — creates resistance and panic.",
      "Only using the muzzle at the vet — it becomes a negative signal.",
      "Using a muzzle that's too tight or poorly fitted — the dog must be able to pant and drink.",
    ],
    progressionDe:
      "Beschnüffeln → Nase reinstecken → 2s Nase drin → 10s Nase drin → Verschluss zu (2s) → Verschluss zu (30s) → Verschluss zu beim Gehen (1 Min) → Normaler Spaziergang mit Maulkorb.",
    progressionEn:
      "Sniffing → Nose in → 2s nose in → 10s nose in → Clasp closed (2s) → Clasp closed (30s) → Clasp closed while walking (1 min) → Normal walk with muzzle.",
    proTipDe:
      "Verwende einen Biothane-Maulkorb mit genug Platz zum Hecheln. Schmiere Leberwurst innen an den Korb — das macht das Training zum Selbstläufer. Trainiere den Maulkorb auch zu Hause in positiven Momenten, nicht nur wenn es ernst wird.",
    proTipEn:
      "Use a biothane basket muzzle with enough room to pant. Spread liver paste inside the basket — this makes training self-reinforcing. Practice the muzzle at home during positive moments, not just when things get serious.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 21,
    methodology: "classical",
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
    stepsDe: [
      "Am Parkplatz der Tierarztpraxis spazieren gehen, Leckerli füttern, wieder gehen.",
      "Ins Wartezimmer gehen, kurz hinsetzen, Leckerli, rausgehen. Keine Behandlung.",
      "Auf die Waage steigen, markern, belohnen. Auf den Behandlungstisch — nur draufstehen.",
      "Chin-Rest auf dem Tisch üben: Kinn ablegen = Ich bin bereit.",
      "Simulierte Untersuchung: Ohren anschauen, Maul öffnen, alles mit Markern und Leckerli.",
    ],
    stepsEn: [
      "Walk around the vet clinic parking lot, feed treats, leave.",
      "Enter the waiting room, sit briefly, treats, leave. No treatment.",
      "Step on the scale, mark, reward. Onto the exam table — just standing.",
      "Practice chin-rest on the table: chin down = I'm ready.",
      "Simulated exam: look at ears, open mouth, everything with markers and treats.",
    ],
    mistakesDe: [
      "Den Hund nur zum echten Termin in die Praxis bringen — dann wird jeder Besuch mit unangenehmen Erfahrungen verknüpft.",
      "Am Tag des Tierarztbesuchs gestresst sein — der Hund spürt deine Anspannung und wird selbst nervöser.",
      "Chin-Rest nicht vorher zu Hause üben, sondern erst in der stressigen Praxis-Umgebung einführen.",
    ],
    mistakesEn: [
      "Only bringing the dog to the clinic for real appointments — every visit becomes associated with unpleasant experiences.",
      "Being stressed on vet day — the dog senses your tension and becomes more nervous.",
      "Not practicing chin-rest at home first, instead introducing it in the stressful clinic environment.",
    ],
    progressionDe:
      "Parkplatz → Wartezimmer → Waage → Behandlungstisch → Simulierte Untersuchung mit dem Tierarzt → Echte Untersuchung mit Kooperationssignalen. Frage deinen Tierarzt nach Happy Visits (Besuche ohne Behandlung).",
    progressionEn:
      "Parking lot → Waiting room → Scale → Exam table → Simulated exam with the vet → Real exam with cooperation signals. Ask your vet about happy visits (visits without treatment).",
    proTipDe:
      "Sprich deinen Tierarzt auf Fear-Free-Methoden an. Viele Praxen bieten Happy Visits an. Bringe die Lieblings-Leckerli mit und lass den Tierarzt sie füttern. Ein Chin-Rest gibt dem Hund ein Kontrollgefühl — er kann jederzeit den Kopf heben und damit die Untersuchung pausieren.",
    proTipEn:
      "Ask your vet about Fear-Free methods. Many clinics offer happy visits. Bring favorite treats and let the vet feed them. A chin-rest gives the dog a sense of control — he can lift his head at any time to pause the exam.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 30,
    methodology: "protocol",
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
    stepsDe: [
      "Kindern vorher Regeln erklären: seitlich stehen, Hand unten anbieten, nicht über den Kopf greifen.",
      "Hund und Kind in großem Abstand (5m) — Hund für ruhiges Verhalten belohnen.",
      "Abstand schrittweise verringern, solange der Hund entspannt bleibt.",
      "Kind darf die Hand unten anbieten. Hund entscheidet, ob er schnüffeln möchte.",
      "Kurze Begegnung (max. 10 Sekunden), dann Abstand, Leckerli, Pause.",
    ],
    stepsEn: [
      "Explain rules to the child beforehand: stand sideways, offer hand low, don't reach over the head.",
      "Dog and child at a large distance (5m) — reward the dog for calm behavior.",
      "Gradually decrease distance as long as the dog remains relaxed.",
      "The child may offer a hand low. The dog decides whether to sniff.",
      "Brief encounter (max 10 seconds), then distance, treat, pause.",
    ],
    mistakesDe: [
      "Den Hund zur Interaktion mit dem Kind zwingen — der Hund muss immer eine Fluchtmöglichkeit haben.",
      "Kinder unkontrolliert auf den Hund zulaufen lassen — hektische Bewegungen stressen viele Hunde.",
      "Warnsignale des Hundes ignorieren (Gähnen, Lefzen lecken, Kopf abwenden) und die Begegnung fortsetzen.",
    ],
    mistakesEn: [
      "Forcing the dog to interact with the child — the dog must always have an escape route.",
      "Letting children run uncontrolled toward the dog — hectic movements stress many dogs.",
      "Ignoring the dog's warning signals (yawning, lip licking, turning head away) and continuing the encounter.",
    ],
    progressionDe:
      "Großer Abstand (5m) mit bekanntem Kind → Mittlerer Abstand (2m) → Hand anbieten → Kurzes Streicheln an Brust → Verschiedene Kinder → Gruppen von Kindern (immer beaufsichtigt). Bei jedem neuen Kind wieder bei mehr Abstand beginnen.",
    progressionEn:
      "Large distance (5m) with a familiar child → Medium distance (2m) → Offering hand → Brief petting on chest → Different children → Groups of children (always supervised). Start at greater distance again with each new child.",
    proTipDe:
      "Kinder sind die häufigste Ursache für Beißvorfälle — nicht weil Hunde Kinder hassen, sondern weil Erwachsene die Stresssignale übersehen. Lerne die Calming Signals nach Turid Rugaas und bringe sie auch dem Kind bei. Ein gähnendes Kind ist ein tolles Beruhigungssignal für den Hund!",
    proTipEn:
      "Children are the most common cause of bite incidents — not because dogs dislike children, but because adults miss the stress signals. Learn Turid Rugaas' calming signals and teach them to the child too. A yawning child is a great calming signal for the dog!",
    durationMin: 5,
    frequencyPerDay: 1,
    estimatedDays: 30,
    methodology: "bat",
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
    stepsDe: [
      "Anderen Hund auf große Distanz (20m) sehen, deinen Hund für Blickkontakt zu dir belohnen.",
      "Bogen um den anderen Hund laufen (10m Abstand), entspanntes Verhalten markern.",
      "Parallel mit dem anderen Hund gehen (5m Abstand), beide an lockerer Leine.",
      "Abstand verringern — bei entspannter Körpersprache beider Hunde kurz schnüffeln lassen (3 Sek).",
      "Nach dem Schnüffeln freundlich weiterrufen, belohnen. Nicht an der Leine ziehen.",
    ],
    stepsEn: [
      "See another dog at a large distance (20m), reward your dog for eye contact with you.",
      "Walk in an arc around the other dog (10m distance), mark relaxed behavior.",
      "Walk parallel with the other dog (5m apart), both on slack leashes.",
      "Decrease distance — with relaxed body language from both dogs, allow brief sniffing (3 sec).",
      "After sniffing, cheerfully call away, reward. Don't pull on the leash.",
    ],
    mistakesDe: [
      "Frontal und direkt auf den anderen Hund zugehen — das ist in Hundesprache unhöflich und provokant.",
      "Die Leine straff halten bei der Begegnung — Leinenzug erhöht die Spannung und kann Aggression fördern.",
      "Jeden Hund grüßen lassen wollen — manche Hunde möchten das nicht, und das ist okay.",
    ],
    mistakesEn: [
      "Walking directly and frontally toward the other dog — this is rude and provocative in dog language.",
      "Keeping the leash tight during the greeting — leash tension increases stress and can promote aggression.",
      "Wanting the dog to greet every other dog — some dogs don't want this, and that's okay.",
    ],
    progressionDe:
      "Großer Abstand (20m) → Bogen (10m) → Parallel gehen (5m) → Parallel gehen (3m) → Kurzes Schnüffeln (3 Sek) → Etwas längerer Kontakt mit bekannten Hunden. Unbekannte Hunde immer wieder bei mehr Distanz beginnen.",
    progressionEn:
      "Large distance (20m) → Arc (10m) → Parallel walking (5m) → Parallel walking (3m) → Brief sniffing (3 sec) → Slightly longer contact with familiar dogs. Always start at greater distance with unfamiliar dogs.",
    proTipDe:
      "Die 3-Sekunden-Regel verhindert Übererregung: Nach 3 Sekunden Kontakt rufst du deinen Hund fröhlich ab. Will er zurück zum anderen Hund, darf er nochmal 3 Sekunden. So bleibt die Erregung niedrig und du behältst die Kontrolle, ohne an der Leine zu zerren.",
    proTipEn:
      "The 3-second rule prevents over-arousal: after 3 seconds of contact, cheerfully call your dog away. If he wants to go back, he may have another 3 seconds. This keeps arousal low and you maintain control without pulling on the leash.",
    durationMin: 10,
    frequencyPerDay: 2,
    estimatedDays: 30,
    methodology: "bat",
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
    stepsDe: [
      "10 Minuten allein mit Kamera-Überwachung — achte auf Stresssignale in den ersten 5 Minuten.",
      "Steigere auf 20 Min, dann 30 Min. Variiere die Zeiten (25 Min, 15 Min, 35 Min).",
      "Bei Erfolg auf 45 Min → 1 Stunde steigern. Kauartikel und gefüllten Kong bereitstellen.",
      "1 Stunde stabil? Dann auf 2 Stunden erweitern. Immer mit entspannter Abschiedsroutine.",
      "Schrittweise auf 3-4 Stunden steigern. Maximal 4-5 Stunden am Stück als Ziel.",
    ],
    stepsEn: [
      "10 minutes alone with camera monitoring — watch for stress signals in the first 5 minutes.",
      "Increase to 20 min, then 30 min. Vary the times (25 min, 15 min, 35 min).",
      "On success, increase to 45 min → 1 hour. Provide chew items and a stuffed Kong.",
      "1 hour stable? Extend to 2 hours. Always use a calm departure routine.",
      "Gradually increase to 3-4 hours. Maximum 4-5 hours at a stretch as the goal.",
    ],
    mistakesDe: [
      "Ohne Kamera trainieren — du weißt dann nicht, ob der Hund 30 Minuten ruhig war oder 30 Minuten gelitten hat.",
      "Nach einem Rückfall (Bellen, Kratzen) beim gleichen Zeitfenster weitermachen statt mindestens 2 Schritte zurückzugehen.",
      "Den Hund vor dem Alleine-Bleiben nicht ausreichend mental und körperlich auslasten.",
    ],
    mistakesEn: [
      "Training without a camera — you don't know whether the dog was calm for 30 minutes or suffered for 30 minutes.",
      "After a setback (barking, scratching) continuing at the same duration instead of going back at least 2 steps.",
      "Not providing sufficient mental and physical exercise before alone time.",
    ],
    progressionDe:
      "10 Min → 20 Min → 30 Min → 45 Min → 1h → 1,5h → 2h → 3h → 4h. Immer mit Rückschritten mischen (z.B. nach 1h-Erfolg mal wieder 20 Min einbauen). Bei Rückfällen zum letzten stabilen Schritt zurück.",
    progressionEn:
      "10 min → 20 min → 30 min → 45 min → 1h → 1.5h → 2h → 3h → 4h. Always mix in shorter durations (e.g., after 1h success, do 20 min again). On setbacks, return to the last stable step.",
    proTipDe:
      "Das Absences-Protokoll von Julie Naismith ist der Goldstandard für Alleine-Bleiben-Training. Kernprinzip: Nie über die Reizschwelle gehen. Eine einzige Panikattacke kann wochenlangen Fortschritt zunichtemachen. Lieber 100 erfolgreiche kurze Absences als 5 zu lange.",
    proTipEn:
      "Julie Naismith's absences protocol is the gold standard for alone-time training. Core principle: never go over threshold. A single panic episode can undo weeks of progress. Better 100 successful short absences than 5 that are too long.",
    durationMin: 15,
    frequencyPerDay: 2,
    estimatedDays: 60,
    methodology: "protocol",
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
    stepsDe: [
      "Chin-Rest zu Hause auf einer erhöhten Fläche (Tisch, Hocker) üben.",
      "Im Chin-Rest kurz die Schulter berühren, markern, belohnen. Hund hebt den Kopf = Pause.",
      "Berührungen auf Rücken, Flanken, Bauch ausweiten — immer mit Chin-Rest als Start.",
      "Zweite Person führt die Berührungen durch, während du den Chin-Rest hältst und belohnst.",
      "In der Tierarztpraxis üben: Chin-Rest auf dem Behandlungstisch, simulierte Untersuchung.",
      "Echte Untersuchung mit Chin-Rest als Kooperationssignal durchführen.",
    ],
    stepsEn: [
      "Practice chin-rest at home on a raised surface (table, stool).",
      "During chin-rest, briefly touch the shoulder, mark, reward. Dog lifts head = pause.",
      "Extend touches to back, flanks, belly — always with chin-rest as the start signal.",
      "A second person performs the touches while you hold the chin-rest and reward.",
      "Practice at the vet clinic: chin-rest on the exam table, simulated examination.",
      "Perform a real exam with chin-rest as the cooperation signal.",
    ],
    mistakesDe: [
      "Den Hund im Stand festhalten, wenn er weg möchte — das Kooperationssignal wird wertlos, wenn es ignoriert wird.",
      "Zu viele Körperstellen in einer Session abdecken wollen — der Hund ermüdet emotional.",
      "Ohne Chin-Rest arbeiten — der Hund hat dann kein klares Signal, um die Untersuchung zu stoppen.",
    ],
    mistakesEn: [
      "Restraining the dog in the stand when he wants to leave — the cooperation signal becomes worthless if ignored.",
      "Trying to cover too many body areas in one session — the dog becomes emotionally fatigued.",
      "Working without a chin-rest — the dog has no clear signal to stop the examination.",
    ],
    progressionDe:
      "Chin-Rest auf dem Boden → Chin-Rest erhöht → Berührung Schulter → Berührung ganzer Körper → Fremde Person berührt → Tierarztpraxis-Umgebung → Simulierte Untersuchung → Echte Untersuchung mit Kooperation.",
    progressionEn:
      "Chin-rest on the floor → Chin-rest elevated → Touch shoulder → Touch whole body → Stranger touches → Vet clinic environment → Simulated exam → Real exam with cooperation.",
    proTipDe:
      "Cooperative Care nach Deb Jones: Der Hund ist kein passives Objekt, sondern aktiver Teilnehmer. Das Chin-Rest ist wie ein Einverständnis — der Hund sagt 'Ja, du darfst weitermachen'. Dieses Konzept verändert die gesamte Mensch-Hund-Beziehung beim Tierarzt.",
    proTipEn:
      "Cooperative Care by Deb Jones: the dog is not a passive object but an active participant. The chin-rest is like consent — the dog says 'Yes, you may continue.' This concept transforms the entire human-dog relationship at the vet.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 30,
    methodology: "protocol",
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
    stepsDe: [
      "Settle on Mat zu Hause in verschiedenen Räumen festigen — mindestens 10 Min Ruhe.",
      "Mit Decke in den eigenen Garten oder vor die Haustür. Kurz (3 Min), belohnen, reingehen.",
      "Ruhiges Café zu einer ruhigen Uhrzeit — Platz am Rand wählen, Decke hinlegen.",
      "Kauartikel und Leckerli-Spender bereitstellen. Für jede Minute Ruhe markern und belohnen.",
      "Session-Dauer langsam von 5 auf 15, dann 30 Minuten steigern.",
      "Zu belebteren Zeiten und Orten wechseln, wenn das ruhige Café stabil klappt.",
    ],
    stepsEn: [
      "Solidify settle on mat at home in different rooms — at least 10 min of calm.",
      "Take the mat to the garden or front door. Brief (3 min), reward, go inside.",
      "Quiet cafe at a quiet time — choose a corner spot, lay down the mat.",
      "Provide chew items and treat dispensers. Mark and reward each minute of calm.",
      "Gradually increase session duration from 5 to 15, then 30 minutes.",
      "Move to busier times and locations once the quiet cafe is stable.",
    ],
    mistakesDe: [
      "Gleich ins volle Café am Samstagnachmittag gehen — viel zu viele Reize für den Anfang.",
      "Den Hund ohne Beschäftigung (Kauartikel, Kong) ablegen und erwarten, dass er einfach liegt.",
      "Zu lange Sessions — lieber 5 Min erfolgreich als 30 Min mit Stress. Positiv aufhören!",
    ],
    mistakesEn: [
      "Going straight to a busy cafe on Saturday afternoon — far too many stimuli for the beginning.",
      "Placing the dog without enrichment (chew items, Kong) and expecting him to just lie there.",
      "Sessions too long — better 5 min successfully than 30 min with stress. End on a positive note!",
    ],
    progressionDe:
      "Wohnzimmer → Garten → Ruhige Bank im Park → Außenbereich ruhiges Café → Innenbereich ruhiges Café → Belebteres Café → Restaurant → Verschiedene Locations. Jeder neue Ort beginnt wieder mit kurzen Sessions.",
    progressionEn:
      "Living room → Garden → Quiet bench in the park → Outdoor area of a quiet cafe → Indoor quiet cafe → Busier cafe → Restaurant → Various locations. Each new place starts again with short sessions.",
    proTipDe:
      "Bringe eine vertraute Decke mit, die nach Zuhause riecht — sie wird zum mobilen Ruheplatz-Signal. Übe das Settle-Signal immer erst zu Hause, bis es bombenfest sitzt. Im Café ist keine Trainings-Session, sondern eine Anwendung von bereits Gelerntem.",
    proTipEn:
      "Bring a familiar blanket that smells like home — it becomes a portable settle signal. Always practice the settle cue at home first until it's rock solid. The cafe is not a training session but an application of something already learned.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 42,
    methodology: "capturing",
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
    stepsDe: [
      "An der Haltestelle stehen, Busse/Bahnen vorbeifahren lassen. Für Ruhe markern und belohnen.",
      "Bus/Bahn kommt — Türen öffnen sich — nicht einsteigen. Ruhe belohnen.",
      "Einsteigen, kurz drinnen stehen, sofort wieder aussteigen. Markern, belohnen.",
      "Eine Station fahren, ruhig aussteigen. Hochwertige Leckerli die ganze Fahrt über.",
      "Schrittweise auf 2, dann 3 Stationen steigern. Außerhalb der Rush-Hour üben.",
      "Settle on Mat im Verkehrsmittel: Decke hinlegen, Kauartikel geben, entspannen.",
    ],
    stepsEn: [
      "Stand at the stop, let buses/trains pass. Mark and reward calmness.",
      "Bus/train arrives — doors open — don't board. Reward calmness.",
      "Board, stand inside briefly, exit immediately. Mark, reward.",
      "Ride one station, exit calmly. High-value treats throughout the ride.",
      "Gradually increase to 2, then 3 stations. Practice outside rush hour.",
      "Settle on mat in the vehicle: lay down the blanket, give a chew item, relax.",
    ],
    mistakesDe: [
      "In der Rush-Hour einsteigen — zu viele Menschen, zu wenig Platz, zu viel Stress für den Anfang.",
      "Kein Sicherheitsgeschirr verwenden — eine Vollbremsung kann den Hund verletzen.",
      "Erwarten, dass der Hund beim ersten Mal ruhig bleibt — die Geräusche und Vibrationen sind völlig neu.",
    ],
    mistakesEn: [
      "Boarding during rush hour — too many people, too little space, too much stress for the beginning.",
      "Not using a safety harness — sudden braking can injure the dog.",
      "Expecting the dog to stay calm the first time — the sounds and vibrations are completely new.",
    ],
    progressionDe:
      "Haltestelle beobachten → Türen öffnen/schließen → Einsteigen ohne Fahrt → 1 Station → 3 Stationen → Längere Strecken → Verschiedene Verkehrsmittel (Bus, S-Bahn, U-Bahn). Jedes neue Verkehrsmittel beginnt wieder bei Schritt 1.",
    progressionEn:
      "Watch at the stop → Doors open/close → Board without riding → 1 station → 3 stations → Longer routes → Different transport types (bus, commuter rail, subway). Each new type starts again at step 1.",
    proTipDe:
      "Wähle für den Anfang eine Endstation, wo der Zug leer ist. Setze dich ans Ende des Waggons. Eine rutschfeste Decke gibt dem Hund Halt auf dem glatten Boden. Maulkorbtraining vorher abschließen — in vielen Verkehrsmitteln ist ein Maulkorb Pflicht.",
    proTipEn:
      "For the start, choose a terminal station where the train is empty. Sit at the end of the carriage. A non-slip blanket gives the dog grip on the smooth floor. Complete muzzle training beforehand — a muzzle is required on many public transport systems.",
    durationMin: 15,
    frequencyPerDay: 1,
    estimatedDays: 30,
    methodology: "classical",
  },
]
