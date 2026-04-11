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
    stepsDe: [
      "Setze dich mit einer anderen Person 2-3 Meter auseinander auf den Boden, Hund zwischen euch.",
      "Rufe den Hund fröhlich beim Namen + Rückrufsignal (z.B. \"Hier!\"), zeige ein Leckerli.",
      "Sobald er ankommt: Leckerli geben, ausgiebig loben und kurz spielen.",
      "Die andere Person ruft jetzt — hin und her wie ein Pingpong-Spiel.",
      "Distanz schrittweise auf 5-10 Meter erhöhen, immer im sicheren Bereich bleiben.",
    ],
    stepsEn: [
      "Sit on the floor 2-3 meters apart with another person, dog between you.",
      "Call the dog happily by name + recall cue (e.g. \"Come!\"), show a treat.",
      "On arrival: give the treat, praise generously, and play briefly.",
      "The other person calls now — back and forth like a ping-pong game.",
      "Gradually increase distance to 5-10 meters, always in a safe area.",
    ],
    mistakesDe: [
      "Den Hund rufen und dann etwas Unangenehmes tun (Baden, Krallen schneiden) — das vergiftet das Signal.",
      "Das Signal wiederholen, wenn der Hund nicht kommt — lieber hingehen und neu aufbauen.",
      "Zu schnell die Distanz steigern, bevor der Nahrückruf zuverlässig sitzt.",
    ],
    mistakesEn: [
      "Calling the dog and then doing something unpleasant (bath, nail clipping) — this poisons the cue.",
      "Repeating the cue when the dog doesn't come — better to walk over and rebuild.",
      "Increasing distance too fast before the close recall is reliable.",
    ],
    progressionDe:
      "Drinnen beginnen → eingezäunter Garten → ruhiger Park an der Schleppleine. Erst die Distanz steigern, dann leichte Ablenkung hinzufügen, nie beides gleichzeitig.",
    progressionEn:
      "Start indoors → fenced garden → quiet park on a long line. First increase distance, then add mild distraction, never both at the same time.",
    proTipDe:
      "Mache jeden Rückruf zur Party: Jackpot-Belohnungen (mehrere Leckerli hintereinander + Spiel) sorgen dafür, dass der Hund beim nächsten Rückruf noch schneller kommt.",
    proTipEn:
      "Make every recall a party: jackpot rewards (multiple treats in a row + play) ensure the dog comes even faster on the next recall.",
    durationMin: 5,
    frequencyPerDay: 5,
    estimatedDays: 14,
    methodology: "luring",
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
    stepsDe: [
      "Pfeife und Hochwertig-Leckerli bereitlegen. Hund direkt neben dir.",
      "Pfeifen (immer dasselbe Muster, z.B. 3× kurz) → sofort Leckerli in die Schnauze, ohne dass der Hund etwas tun muss.",
      "10× pro Sitzung wiederholen, 3-5 Sitzungen über mehrere Tage verteilen.",
      "Teste: Pfiff, wenn der Hund wegschaut — dreht er sich sofort um? Dann ist die Konditionierung da.",
      "Jetzt erst als echten Rückruf nutzen: Pfiff → Hund kommt → Jackpot.",
    ],
    stepsEn: [
      "Prepare whistle and high-value treats. Dog right next to you.",
      "Whistle (always the same pattern, e.g. 3× short) → immediately treat to the mouth, dog doesn't need to do anything.",
      "Repeat 10× per session, spread 3-5 sessions over several days.",
      "Test: whistle when the dog looks away — does he spin around immediately? Then conditioning is established.",
      "Only now use as a real recall: whistle → dog comes → jackpot.",
    ],
    mistakesDe: [
      "Zu früh als Rückrufsignal verwenden, bevor die klassische Konditionierung steht.",
      "Unterschiedliche Pfeifmuster verwenden — das Signal muss immer gleich klingen.",
      "Den Pfiff inflationär einsetzen und nicht jedes Mal belohnen.",
    ],
    mistakesEn: [
      "Using it as a recall cue too early, before classical conditioning is solid.",
      "Using different whistle patterns — the signal must always sound the same.",
      "Overusing the whistle and not rewarding every time.",
    ],
    progressionDe:
      "Phase 1: Konditionierung neben dem Hund (3-5 Tage). Phase 2: Pfiff auf 1-2 Meter Distanz. Phase 3: Pfiff im Garten. Phase 4: Pfiff im Park an der Schleppleine.",
    progressionEn:
      "Phase 1: conditioning next to the dog (3-5 days). Phase 2: whistle at 1-2 meter distance. Phase 3: whistle in the garden. Phase 4: whistle in the park on a long line.",
    proTipDe:
      "Verwende eine Pfeife mit konstanter Frequenz (z.B. ACME 211.5). Der Vorteil gegenüber der Stimme: immer gleicher Ton, keine Emotionen, hörbar über weite Distanzen.",
    proTipEn:
      "Use a whistle with a consistent frequency (e.g. ACME 211.5). The advantage over voice: always the same tone, no emotions, audible over long distances.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 10,
    methodology: "classical",
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
    stepsDe: [
      "Hund an 10-Meter-Schleppleine. Helfer legt einen langweiligen Gegenstand (z.B. Handschuh) 3 Meter entfernt auf den Boden.",
      "Warte, bis der Hund den Gegenstand bemerkt, aber noch nicht stark fixiert — dann Rückruf.",
      "Bei Erfolg: Jackpot (5-6 Leckerli hintereinander + Spiel). Bei Misserfolg: ruhig über die Leine führen, kein Tadel.",
      "Ablenkung schrittweise steigern: langweiliger Gegenstand → Spielzeug → Futter am Boden → andere Hunde in der Ferne.",
      "Immer die 80%-Regel beachten: Wenn der Hund weniger als 8 von 10 Rückrufen schafft, ist die Ablenkung zu stark.",
    ],
    stepsEn: [
      "Dog on a 10-meter long line. Helper places a boring object (e.g. glove) 3 meters away on the ground.",
      "Wait until the dog notices the object but is not yet fixated — then recall.",
      "On success: jackpot (5-6 treats in a row + play). On failure: calmly guide via the line, no scolding.",
      "Gradually increase distraction: boring object → toy → food on the ground → other dogs in the distance.",
      "Always follow the 80% rule: if the dog succeeds less than 8 out of 10 times, the distraction is too strong.",
    ],
    mistakesDe: [
      "Den Hund rufen, wenn er bereits voll im Jagdmodus oder in einer Fixierung ist — das trainiert Ignorieren.",
      "Bestrafen, wenn der Hund nicht kommt — der Rückruf muss immer positiv bleiben.",
      "Zu große Ablenkungssprünge machen statt langsam zu steigern.",
    ],
    mistakesEn: [
      "Calling the dog when he's already in full chase mode or fixated — this trains ignoring.",
      "Punishing the dog for not coming — the recall must always stay positive.",
      "Making distraction jumps that are too large instead of increasing gradually.",
    ],
    progressionDe:
      "Ablenkungsskala 1-10 aufstellen. Bei jedem neuen Level erst auf kurze Distanz üben. Erst wenn Level zuverlässig sitzt, zum nächsten steigern. Rückschritte sind normal — einfach ein Level zurückgehen.",
    progressionEn:
      "Set up a distraction scale 1-10. At each new level, practice at short distance first. Only increase to the next level when the current one is reliable. Setbacks are normal — just go back one level.",
    proTipDe:
      "Nutze das Premack-Prinzip: Rückruf → Belohnung → Freigabe zur Ablenkung. Der Hund lernt, dass Kommen der schnellste Weg zurück zum Spaß ist.",
    proTipEn:
      "Use the Premack principle: recall → reward → release to the distraction. The dog learns that coming is the fastest way back to the fun.",
    durationMin: 10,
    frequencyPerDay: 3,
    estimatedDays: 30,
    methodology: "shaping",
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
    stepsDe: [
      "Wähle ein einzigartiges Signal, das du im Alltag nie benutzt (z.B. \"Jackpot!\", spezieller Doppelpfiff, oder ein ungewöhnliches Wort).",
      "Woche 1-2: Signal → sofort die allerbeste Belohnung (Leberwurst, rohes Fleisch, Käse-Jackpot), Hund direkt neben dir. 3× täglich.",
      "Woche 3: Signal auf 2-3 Meter Distanz testen. Hund muss sofort lossprinten. Immer mit Super-Jackpot belohnen.",
      "Woche 4: In verschiedenen Umgebungen testen (Garten, ruhiger Park). Immer an der Schleppleine als Sicherheit.",
      "Ab jetzt: Nur im echten Notfall einsetzen. Maximal 1× pro Monat zum Auffrischen ohne Notfall üben.",
    ],
    stepsEn: [
      "Choose a unique cue you never use in everyday life (e.g. \"Jackpot!\", a special double whistle, or an unusual word).",
      "Week 1-2: cue → immediately the very best reward (liver paste, raw meat, cheese jackpot), dog right next to you. 3× daily.",
      "Week 3: test the cue at 2-3 meter distance. Dog must sprint immediately. Always reward with a super jackpot.",
      "Week 4: test in different environments (garden, quiet park). Always on a long line for safety.",
      "From now on: only use in real emergencies. Practice at most 1× per month for maintenance without an emergency.",
    ],
    mistakesDe: [
      "Das Notfallsignal für alltägliche Rückrufe verwenden — es verliert sofort seine Kraft.",
      "Mit minderwertigen Leckerli belohnen — der Notfallrückruf braucht immer die absolute Topbelohnung.",
      "Nicht regelmäßig auffrischen — ohne gelegentliches Training verblasst die Konditionierung.",
    ],
    mistakesEn: [
      "Using the emergency cue for everyday recalls — it immediately loses its power.",
      "Rewarding with low-value treats — the emergency recall always needs the absolute top reward.",
      "Not refreshing regularly — without occasional practice, the conditioning fades.",
    ],
    progressionDe:
      "2 Wochen reine Konditionierung → Nahdistanz-Test → Garten → ruhiger Park → erst dann für echte Situationen verfügbar. Dieses Signal nie im Alltag \"verbrauchen\".",
    progressionEn:
      "2 weeks pure conditioning → close-distance test → garden → quiet park → only then available for real situations. Never \"use up\" this cue in daily life.",
    proTipDe:
      "Bewahre eine spezielle Belohnung nur für den Notfallrückruf auf (z.B. eine Tube Leberwurst im Kühlschrank). So ist die Belohnung immer einzigartig und der Hund verbindet das Signal mit etwas Außergewöhnlichem.",
    proTipEn:
      "Keep a special reward only for the emergency recall (e.g. a tube of liver paste in the fridge). This way the reward is always unique and the dog associates the cue with something extraordinary.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 28,
    methodology: "classical",
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
    stepsDe: [
      "Beginne mit einem bekannten, ruhigen Spielkameraden. Warte auf eine natürliche Spielpause.",
      "Rufe den Hund in der Pause — er kommt leichter, wenn das Spiel gerade pausiert.",
      "Jackpot-Belohnung (hochwertiges Leckerli + Lob), dann sofort: \"Lauf!\" — zurück zum Spielen schicken.",
      "Wiederhole 2-3× pro Spielsitzung. Nie beim letzten Rückruf anleinen und gehen.",
      "Schrittweise den Rückruf während aktivem Spiel versuchen, nicht nur in Pausen.",
      "Ziel: Der Hund löst sich aus dem Spiel, kommt, holt seine Belohnung und darf zurück.",
    ],
    stepsEn: [
      "Start with a familiar, calm play partner. Wait for a natural play pause.",
      "Call the dog during the pause — he comes more easily when play has naturally paused.",
      "Jackpot reward (high-value treat + praise), then immediately: \"Go play!\" — release back to play.",
      "Repeat 2-3× per play session. Never leash up and leave on the last recall.",
      "Gradually attempt the recall during active play, not just during pauses.",
      "Goal: the dog disengages from play, comes, collects his reward, and gets to go back.",
    ],
    mistakesDe: [
      "Beim letzten Rückruf anleinen und nach Hause gehen — der Hund lernt: Kommen = Spaß vorbei.",
      "Nur in der Hundezone den Rückruf üben und dort dann immer zum Gehen rufen.",
      "Frustriert werden, wenn der Hund im vollen Spiel nicht reagiert — das ist extrem schwer und braucht viel Aufbau.",
    ],
    mistakesEn: [
      "Leashing up and going home on the last recall — the dog learns: coming = fun is over.",
      "Only practicing recall at the dog park and always calling to leave.",
      "Getting frustrated when the dog doesn't respond during full play — this is extremely hard and needs a lot of buildup.",
    ],
    progressionDe:
      "Rückruf in Spielpause → Rückruf bei langsamem Spiel → Rückruf bei aktivem Spiel → Rückruf bei wildem Toben. Immer: Zurück-ins-Spiel als Belohnung nutzen.",
    progressionEn:
      "Recall during play pause → recall during slow play → recall during active play → recall during wild romping. Always: use going-back-to-play as a reward.",
    proTipDe:
      "Schicke den Hund nach dem Rückruf zurück ins Spiel — das ist die stärkste Belohnung. Der Hund lernt: Zu mir kommen ist der schnellste Weg zurück zum Spaß (Premack-Prinzip).",
    proTipEn:
      "Send the dog back to play after the recall — that's the strongest reward. The dog learns: coming to me is the fastest way back to fun (Premack principle).",
    durationMin: 15,
    frequencyPerDay: 1,
    estimatedDays: 42,
    methodology: "shaping",
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
    stepsDe: [
      "Voraussetzung: Notfallrückruf muss bombenfest konditioniert sein. Schleppleine ist Pflicht.",
      "Übe zuerst mit kontrollierten Reizen: Videos von Wildtieren auf dem Tablet, Wildgeruch auf einem Tuch.",
      "Im Feld: Beobachte die Körpersprache deines Hundes. Rufe BEVOR er in die Fixierung geht (hohe Rute, steifer Körper, Nase am Boden).",
      "Bei erfolgreichem Rückruf: absoluter Super-Jackpot (rohes Fleisch, ganze Tube Leberwurst, Lieblingsspiel).",
      "Wenn der Hund nicht reagiert: Leine ruhig sichern, Hund aus der Situation führen. NICHT bestrafen.",
    ],
    stepsEn: [
      "Prerequisite: emergency recall must be rock-solid conditioned. Long line is mandatory.",
      "First practice with controlled stimuli: videos of wildlife on a tablet, wildlife scent on a cloth.",
      "In the field: observe your dog's body language. Call BEFORE he enters fixation (high tail, stiff body, nose to ground).",
      "On successful recall: absolute super jackpot (raw meat, full tube of liver paste, favorite game).",
      "If the dog doesn't respond: calmly secure the line, guide the dog out of the situation. Do NOT punish.",
    ],
    mistakesDe: [
      "Den Hund rufen, wenn er bereits in voller Jagd ist — in diesem Zustand ist er neurologisch nicht ansprechbar.",
      "Die Schleppleine weglassen, weil es \"bisher immer geklappt hat\" — Jagdtrieb ist nie 100% abrufbar.",
      "Den Hund bestrafen, wenn er nicht vom Wild abgelassen hat — das zerstört den Rückruf für die Zukunft.",
    ],
    mistakesEn: [
      "Calling the dog when he's already in full chase — in this state he's neurologically unreachable.",
      "Leaving the long line off because \"it's always worked so far\" — prey drive is never 100% reliable.",
      "Punishing the dog for not recalling off wildlife — this destroys the recall for the future.",
    ],
    progressionDe:
      "Kontrollierte Reize drinnen → Wildgeruch draußen → Wild in großer Entfernung → Wild in mittlerer Entfernung. Dieses Training endet nie — regelmäßig auffrischen und immer Management (Leine) einsetzen.",
    progressionEn:
      "Controlled stimuli indoors → wildlife scent outdoors → wildlife at great distance → wildlife at medium distance. This training never ends — refresh regularly and always use management (leash).",
    proTipDe:
      "Lerne die Körpersprache deines Hundes: Der Moment, in dem die Ohren nach vorne gehen und der Körper steif wird, ist dein Zeitfenster. Danach ist das Fenster zu. Timing ist alles.",
    proTipEn:
      "Learn your dog's body language: the moment the ears go forward and the body stiffens is your window. After that, the window is closed. Timing is everything.",
    durationMin: 15,
    frequencyPerDay: 2,
    estimatedDays: 180,
    methodology: "classical",
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
    stepsDe: [
      "Voraussetzung: Platz direkt vor dir muss zuverlässig sitzen. Großes, deutliches Handzeichen einführen.",
      "Einen halben Schritt zurücktreten, Handzeichen + verbales Signal. Legt der Hund sich hin → sofort zum Hund gehen und belohnen.",
      "Wichtig: Zum Hund gehen, NICHT den Hund zu dir rufen. Sonst lernt er, zu dir zu kommen statt sich hinzulegen.",
      "Distanz in 30-cm-Schritten steigern. Erst wenn 8/10 Versuche klappen, den nächsten Schritt zurück.",
      "Bei Misserfolg: halbe Distanz zurückgehen. Immer erfolgreich enden.",
    ],
    stepsEn: [
      "Prerequisite: down right in front of you must be reliable. Introduce a large, clear hand signal.",
      "Step half a step back, hand signal + verbal cue. If the dog lies down → immediately walk to the dog and reward.",
      "Important: walk to the dog, do NOT call the dog to you. Otherwise he learns to come to you instead of lying down.",
      "Increase distance in 30 cm increments. Only take the next step back when 8/10 attempts succeed.",
      "On failure: go back to half the distance. Always end on a success.",
    ],
    mistakesDe: [
      "Den Hund nach dem Platz zu sich rufen — das verknüpft Platz auf Distanz mit Herankommen.",
      "Zu schnell die Distanz steigern — der Hund wird unsicher und kommt stattdessen angelaufen.",
      "Das Handzeichen zu klein machen — auf Distanz braucht der Hund ein deutlich sichtbares Signal.",
    ],
    mistakesEn: [
      "Calling the dog to you after the down — this links distance down with coming closer.",
      "Increasing distance too fast — the dog becomes unsure and runs toward you instead.",
      "Making the hand signal too small — at distance the dog needs a clearly visible signal.",
    ],
    progressionDe:
      "0,5 Meter → 1 Meter → 2 Meter → 5 Meter → 10 Meter. Erst drinnen, dann im Garten, dann im ruhigen Park. Jede neue Umgebung bedeutet: Distanz zurücksetzen.",
    progressionEn:
      "0.5 meters → 1 meter → 2 meters → 5 meters → 10 meters. First indoors, then in the garden, then in a quiet park. Each new environment means: reset the distance.",
    proTipDe:
      "Nutze eine Markermatte oder Decke als Ziel. Der Hund lernt: \"Platz\" heißt auf der Matte ablegen, egal wo ich stehe. Das gibt ihm eine klare Orientierung auf Distanz.",
    proTipEn:
      "Use a marker mat or blanket as a target. The dog learns: \"down\" means lie down on the mat, no matter where I stand. This gives him a clear reference point at distance.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 28,
    methodology: "shaping",
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
    stepsDe: [
      "Beginne mit einer Richtung (z.B. \"links\"): Stelle einen Kegel oder Markierung links vom Hund auf, 1 Meter entfernt.",
      "Zeige mit ausgestrecktem Arm nach links + verbales Signal \"links\". Sobald der Hund sich in die richtige Richtung bewegt → Click/Marker + Belohnung am Ziel.",
      "Shaping: Erst jeden Blick nach links belohnen, dann Schritte, dann das Erreichen des Ziels.",
      "Wenn eine Richtung auf 5 Meter zuverlässig sitzt, die zweite Richtung separat aufbauen.",
      "Erst wenn beide Richtungen einzeln sitzen, im Wechsel abfragen. Langsam \"weiter\" und \"zurück\" hinzufügen.",
      "Immer nur eine neue Richtung gleichzeitig trainieren, um Verwirrung zu vermeiden.",
    ],
    stepsEn: [
      "Start with one direction (e.g. \"left\"): place a cone or marker to the left of the dog, 1 meter away.",
      "Point with an outstretched arm to the left + verbal cue \"left\". As soon as the dog moves in the right direction → click/marker + reward at the target.",
      "Shaping: first reward every glance to the left, then steps, then reaching the target.",
      "When one direction is reliable at 5 meters, build the second direction separately.",
      "Only when both directions work individually, alternate between them. Slowly add \"forward\" and \"back\".",
      "Always train only one new direction at a time to avoid confusion.",
    ],
    mistakesDe: [
      "Zwei Richtungen gleichzeitig einführen — das verwirrt den Hund und verlangsamt den Lernprozess.",
      "Zu schnell das Handzeichen reduzieren — der Hund braucht lange die visuelle Hilfe, bevor rein verbal funktioniert.",
      "Ohne klare Zielmarkierungen arbeiten — Kegel oder Targets geben dem Hund Orientierung.",
    ],
    mistakesEn: [
      "Introducing two directions at the same time — this confuses the dog and slows learning.",
      "Reducing the hand signal too quickly — the dog needs the visual aid for a long time before verbal-only works.",
      "Working without clear target markers — cones or targets give the dog orientation.",
    ],
    progressionDe:
      "Eine Richtung auf Nahdistanz → eine Richtung auf 5-10 Meter → zweite Richtung separat → Richtungswechsel → alle vier Richtungen. Pro Richtung 2-4 Wochen einplanen.",
    progressionEn:
      "One direction at close range → one direction at 5-10 meters → second direction separately → direction changes → all four directions. Plan 2-4 weeks per direction.",
    proTipDe:
      "Nutze Kegel in verschiedenen Farben als Zielmarkierungen. Hunde sehen Blau und Gelb am besten. Platziere Leckerli am Ziel, sodass sich die richtige Richtung selbst belohnt.",
    proTipEn:
      "Use cones in different colors as target markers. Dogs see blue and yellow best. Place treats at the target so the correct direction is self-rewarding.",
    durationMin: 10,
    frequencyPerDay: 2,
    estimatedDays: 60,
    methodology: "shaping",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "distance_down",
    sortOrder: 8,
  },
]
