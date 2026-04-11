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
    stepsDe: [
      "Warte in ruhiger Umgebung, bis der Hund dich zufällig anschaut.",
      "Sage seinen Namen genau in dem Moment, in dem er Blickkontakt herstellt.",
      "Markere sofort (Clicker oder Markerwort) und gib ein Leckerli.",
      "Wiederhole 10-20 Mal pro Session, verteilt über den Tag.",
      "Steigere die Ablenkung schrittweise (andere Räume, draußen im Garten).",
    ],
    stepsEn: [
      "Wait in a quiet environment until the dog looks at you by chance.",
      "Say his name exactly when he makes eye contact.",
      "Mark immediately (clicker or marker word) and deliver a treat.",
      "Repeat 10-20 times per session, spread throughout the day.",
      "Gradually increase distractions (different rooms, garden).",
    ],
    mistakesDe: [
      "Name in negativem Ton verwenden — der Hund verknüpft seinen Namen dann mit Strafe und reagiert schlechter.",
      "Name endlos wiederholen ohne Belohnung — das Signal verliert seine Bedeutung (Reizüberflutung).",
      "Zu früh in ablenkungsreicher Umgebung üben, bevor die Grundverknüpfung sitzt.",
    ],
    mistakesEn: [
      "Using the name in a negative tone — the dog associates it with punishment and responds less reliably.",
      "Repeating the name without reward — the cue loses its meaning (learned irrelevance).",
      "Practicing in distracting environments too soon before the basic association is solid.",
    ],
    progressionDe:
      "Beginne in einem ruhigen Raum ohne Ablenkung. Steigere auf leichte Ablenkung (andere Person im Raum), dann mittlere (Garten) und schließlich starke (Straße, andere Hunde). Immer nur eine der 3 D's (Duration, Distance, Distraction) gleichzeitig erhöhen.",
    progressionEn:
      "Start in a quiet room with no distractions. Progress to mild distractions (another person), then moderate (garden), then strong (street, other dogs). Only increase one of the 3 D's (Duration, Distance, Distraction) at a time.",
    proTipDe:
      "Nutze klassische Konditionierung nach Pawlow: Der Name wird zum konditionierten Stimulus, der zuverlässig ein Leckerli ankündigt. Nach 50-80 Wiederholungen entsteht eine reflexartige Orientierungsreaktion — der Hund dreht sich automatisch zu dir.",
    proTipEn:
      "Use Pavlovian classical conditioning: the name becomes a conditioned stimulus that reliably predicts a treat. After 50-80 repetitions a reflexive orienting response forms — the dog automatically turns toward you.",
    durationMin: 3,
    frequencyPerDay: 5,
    estimatedDays: 5,
    methodology: "classical",
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
    stepsDe: [
      "Halte ein Leckerli direkt vor die Nase des Hundes.",
      "Führe das Leckerli langsam in einem Bogen über seinen Kopf nach hinten.",
      "Sobald sein Hinterteil den Boden berührt, markere und belohne sofort.",
      "Wiederhole 10-15 Mal ohne Signalwort, bis das Verhalten zuverlässig kommt.",
      "Führe das Signalwort \"Sitz\" ein: Sage es kurz bevor er sich setzt.",
      "Reduziere die Handbewegung schrittweise zu einem kleinen Handzeichen.",
    ],
    stepsEn: [
      "Hold a treat directly in front of the dog's nose.",
      "Slowly guide the treat in an arc up and over his head.",
      "The moment his hindquarters touch the floor, mark and reward immediately.",
      "Repeat 10-15 times without a verbal cue until the behavior is reliable.",
      "Introduce the cue \"Sit\": say it just before he sits.",
      "Gradually fade the hand movement into a small hand signal.",
    ],
    mistakesDe: [
      "Leckerli zu hoch halten — der Hund springt hoch statt sich zu setzen.",
      "Signalwort zu früh einführen, bevor das Verhalten zuverlässig ist — das Wort wird bedeutungslos.",
      "Auf das Hinterteil drücken — erzeugt Gegendruck und zerstört das Vertrauen.",
    ],
    mistakesEn: [
      "Holding the treat too high — the dog jumps up instead of sitting.",
      "Introducing the verbal cue too early before the behavior is reliable — the word becomes meaningless.",
      "Pushing down on the hindquarters — creates opposition reflex and damages trust.",
    ],
    progressionDe:
      "Phase 1: Luring mit vollem Leckerli in der Hand. Phase 2: Leere Hand als Handzeichen (Leckerli kommt aus der anderen Hand). Phase 3: Signalwort allein. Phase 4: Sitz in verschiedenen Positionen (du stehst, sitzt, liegst).",
    progressionEn:
      "Phase 1: Luring with treat in hand. Phase 2: Empty hand as hand signal (treat comes from other hand). Phase 3: Verbal cue only. Phase 4: Sit in varied body positions (you standing, sitting, lying down).",
    proTipDe:
      "Der Übergang vom Lure zum Handzeichen (Fading) sollte nach maximal 20-30 Wiederholungen passieren. Hunde werden sonst \"Lure-abhängig\" — sie arbeiten nur noch, wenn sie das Leckerli sehen. Errorless Learning: Setze die Kriterien so, dass der Hund fast immer Erfolg hat.",
    proTipEn:
      "The transition from lure to hand signal (fading) should happen within 20-30 reps. Dogs otherwise become \"lure-dependent\" — they only perform when they see the treat. Errorless learning: set criteria so the dog almost always succeeds.",
    durationMin: 3,
    frequencyPerDay: 4,
    estimatedDays: 5,
    methodology: "luring",
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
    stepsDe: [
      "Bringe den Hund ins Sitz.",
      "Führe ein Leckerli von der Nase gerade nach unten zum Boden zwischen die Vorderpfoten.",
      "Ziehe das Leckerli leicht vom Hund weg am Boden entlang — die Ellenbogen klappen nach vorne.",
      "Sobald der Bauch den Boden berührt, markere und belohne sofort.",
      "Nach 10-15 erfolgreichen Wiederholungen das Signalwort \"Platz\" einführen.",
    ],
    stepsEn: [
      "Cue the dog into a sit.",
      "Guide a treat straight down from the nose to the floor between the front paws.",
      "Draw the treat slightly away from the dog along the floor — the elbows fold forward.",
      "The moment the belly touches the floor, mark and reward immediately.",
      "Introduce the cue \"Down\" after 10-15 successful repetitions.",
    ],
    mistakesDe: [
      "Leckerli zu schnell oder zu weit wegziehen — der Hund steht auf statt sich hinzulegen.",
      "Hund physisch nach unten drücken — das erzeugt Gegendruck (Opposition Reflex) und Stress.",
      "Nur aus dem Sitz üben — der Hund lernt eine Kette (Sitz→Platz) statt ein eigenständiges Signal.",
    ],
    mistakesEn: [
      "Moving the treat too fast or too far — the dog stands up instead of lying down.",
      "Physically pushing the dog down — triggers opposition reflex and stress.",
      "Only practicing from a sit — the dog learns a chain (Sit→Down) instead of an independent cue.",
    ],
    progressionDe:
      "Beginne aus dem Sitz mit Lure. Dann Lure faden zum Handzeichen. Dann aus dem Stehen ins Platz üben. Schließlich Dauer aufbauen (3s → 5s → 10s im Platz bleiben vor Belohnung).",
    progressionEn:
      "Start from a sit with a lure. Then fade the lure to a hand signal. Then practice down from standing. Finally build duration (3s → 5s → 10s in the down before reward).",
    proTipDe:
      "Falls der Hund nicht ablegt: Nutze Shaping statt Luring. Belohne zuerst jedes Senken des Kopfes, dann Ellenbogen-Beugen, dann halbes Ablegen. In 5-10 Minuten erreichst du durch sukzessive Approximation das volle Platz.",
    proTipEn:
      "If the dog won't lie down with a lure: use shaping instead. Reward any head lowering, then elbow bending, then a partial down. Through successive approximation you reach a full down in 5-10 minutes.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 7,
    methodology: "luring",
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
    stepsDe: [
      "Bringe den Hund ins Sitz.",
      "Halte ein Leckerli vor die Nase und ziehe es langsam waagrecht nach vorne weg.",
      "Der Hund steht auf, um dem Leckerli zu folgen — markere genau im Moment des Stehens.",
      "Belohne sofort, ohne dass der Hund sich wieder setzen muss.",
      "Baue schrittweise eine Sekunde Standzeit auf, bevor du markierst.",
      "Führe das Signalwort \"Steh\" ein, wenn das Verhalten zuverlässig ist.",
    ],
    stepsEn: [
      "Cue the dog into a sit.",
      "Hold a treat in front of the nose and draw it slowly forward at a horizontal level.",
      "The dog stands to follow the treat — mark the exact moment of standing.",
      "Reward immediately without requiring the dog to sit again.",
      "Gradually build one second of standing before marking.",
      "Introduce the cue \"Stand\" once the behavior is reliable.",
    ],
    mistakesDe: [
      "Leckerli zu hoch halten — der Hund bleibt sitzen und streckt nur den Kopf.",
      "Sofort Dauer verlangen — der Hund wird unsicher und setzt sich wieder hin.",
      "Belohnung erst nach dem erneuten Sitz geben — der Hund glaubt, das Sitzen wird belohnt.",
    ],
    mistakesEn: [
      "Holding the treat too high — the dog stays seated and just stretches his neck.",
      "Demanding duration too early — the dog becomes uncertain and sits back down.",
      "Rewarding only after the dog sits again — the dog thinks sitting is what's being reinforced.",
    ],
    progressionDe:
      "Phase 1: Aufstehen aus Sitz mit Lure (0s Dauer). Phase 2: 1-2 Sekunden Stehen. Phase 3: Handzeichen ohne Leckerli. Phase 4: Steh aus dem Platz. Phase 5: Steh auf Distanz (1-2 Meter).",
    progressionEn:
      "Phase 1: Stand from sit with lure (0s duration). Phase 2: 1-2 seconds standing. Phase 3: Hand signal without treat. Phase 4: Stand from down. Phase 5: Stand at distance (1-2 meters).",
    proTipDe:
      "Steh ist das am wenigsten geübte Grundsignal, aber essenziell beim Tierarzt und in der Pflege. Trainiere es in Kombination mit sanftem Körperkontakt (Berühren der Flanken), damit der Hund ruhig stehen bleibt.",
    proTipEn:
      "Stand is the least practiced basic cue but essential at the vet and for grooming. Train it combined with gentle body contact (touching the flanks) so the dog remains calm while standing.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 7,
    methodology: "luring",
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
    stepsDe: [
      "Halte ein Leckerli neben dein Auge und warte auf Blickkontakt.",
      "Sobald der Hund in deine Augen schaut, markere und belohne.",
      "Wiederhole 10 Mal, dann halte das Leckerli seitlich auf Armeslänge.",
      "Belohne nur, wenn der Hund das Leckerli ignoriert und dich anschaut.",
      "Führe das Signalwort \"Schau\" ein und baue Dauer auf (2s → 5s → 10s).",
    ],
    stepsEn: [
      "Hold a treat next to your eye and wait for eye contact.",
      "The moment the dog looks into your eyes, mark and reward.",
      "Repeat 10 times, then hold the treat to the side at arm's length.",
      "Only reward when the dog ignores the treat and looks at you.",
      "Introduce the cue \"Watch me\" and build duration (2s → 5s → 10s).",
    ],
    mistakesDe: [
      "Zu schnell markern — der Hund schaut noch auf das Leckerli, nicht in die Augen.",
      "Blickkontakt erzwingen durch Festhalten des Kopfes — das ist bedrohlich für den Hund.",
      "Dauer zu schnell steigern — der Hund bricht ab und lernt, dass Abbrechen sich lohnt.",
    ],
    mistakesEn: [
      "Marking too quickly — the dog is still looking at the treat, not your eyes.",
      "Forcing eye contact by holding the dog's head — this is threatening to the dog.",
      "Increasing duration too fast — the dog breaks off and learns that breaking is rewarding.",
    ],
    progressionDe:
      "Erst Blickkontakt für 1 Sekunde in ruhiger Umgebung. Dann Dauer auf 5-10 Sekunden steigern. Dann Ablenkung hinzufügen (Person geht vorbei). Schließlich als Managementtool in Alltagssituationen nutzen (andere Hunde, Jogger).",
    progressionEn:
      "First 1-second eye contact in a quiet environment. Then build duration to 5-10 seconds. Then add distractions (person walking by). Finally use as a management tool in real-life situations (other dogs, joggers).",
    proTipDe:
      "Blickkontakt ist die Grundlage des \"Engagement-Modells\" nach Denise Fenzi. Ein Hund, der freiwillig Blickkontakt anbietet, ist bereit zu arbeiten. Fange an, zufälligen Blickkontakt im Alltag zu belohnen (Capturing) — das erzeugt einen Hund, der dich ständig \"eincheckt\".",
    proTipEn:
      "Eye contact is the foundation of the engagement model by Denise Fenzi. A dog who voluntarily offers eye contact is ready to work. Start rewarding spontaneous eye contact throughout the day (capturing) — this creates a dog who constantly checks in with you.",
    durationMin: 3,
    frequencyPerDay: 5,
    estimatedDays: 7,
    methodology: "capturing",
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
    stepsDe: [
      "Bringe den Hund ins Sitz oder Platz.",
      "Zeige die flache Hand (Stoppgeste) und sage \"Bleib\".",
      "Warte eine Sekunde, markere und belohne am Platz (nicht zu dir rufen!).",
      "Steigere die Dauer: 1s → 3s → 5s → 10s → 20s → 30s.",
      "Erst wenn 30 Sekunden stabil sind, beginne Distanz aufzubauen (einen Schritt zurück).",
      "Ablenkung als letztes hinzufügen, mit reduzierter Dauer und Distanz.",
    ],
    stepsEn: [
      "Cue the dog into a sit or down.",
      "Show a flat hand (stop gesture) and say \"Stay\".",
      "Wait one second, mark and reward in place (don't call the dog to you!).",
      "Build duration: 1s → 3s → 5s → 10s → 20s → 30s.",
      "Only when 30 seconds is stable, start adding distance (one step back).",
      "Add distractions last, with reduced duration and distance.",
    ],
    mistakesDe: [
      "Zwei der 3 D's (Duration, Distance, Distraction) gleichzeitig steigern — der Hund wird überfordert und bricht ab.",
      "Hund aus dem Bleib abrufen — er lernt, dass Bleib immer mit Kommen endet, und wird unruhig.",
      "Bei Fehler schimpfen statt einfach leichter machen — der Hund verknüpft Bleib mit Frust.",
    ],
    mistakesEn: [
      "Increasing two of the 3 D's (Duration, Distance, Distraction) at once — the dog gets overwhelmed and breaks.",
      "Calling the dog out of the stay — he learns stay always ends with coming, causing restlessness.",
      "Scolding on failure instead of simply making it easier — the dog associates stay with frustration.",
    ],
    progressionDe:
      "Nutze das 3-D-Modell (Duration, Distance, Distraction) als Rahmen. Steigere immer nur eine Variable. Wenn du eine neue Variable einführst, setze die anderen zurück. Beispiel: 30s Dauer auf 0 Distanz → 5s Dauer auf 1m Distanz.",
    progressionEn:
      "Use the 3 D's model (Duration, Distance, Distraction) as your framework. Only increase one variable at a time. When introducing a new variable, reset the others. Example: 30s duration at 0 distance → 5s duration at 1m distance.",
    proTipDe:
      "Belohne immer am Platz, gehe zum Hund zurück. So lernt er: Bleiben lohnt sich. Nutze ein Auflösesignal wie \"Frei\" oder \"OK\", damit der Hund weiß, wann Bleib vorbei ist — ohne Auflösesignal rät er nur.",
    proTipEn:
      "Always reward in place, return to the dog. This teaches: staying pays off. Use a release cue like \"Free\" or \"OK\" so the dog knows when stay is over — without a release cue he is only guessing.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 14,
    methodology: "shaping",
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
    stepsDe: [
      "Stehe 1-2 Meter vom Hund entfernt in reizarmer Umgebung.",
      "Rufe fröhlich seinen Namen gefolgt von \"Hier!\" und gehe rückwärts.",
      "Sobald er bei dir ankommt, gib einen Jackpot (5-6 Leckerlis nacheinander, Lob, Spiel).",
      "Wiederhole 5-8 Mal pro Session — immer mit Jackpot, nie mit Enttäuschung.",
      "Steigere die Entfernung schrittweise auf 3-5 Meter.",
    ],
    stepsEn: [
      "Stand 1-2 meters from the dog in a low-distraction environment.",
      "Call his name enthusiastically followed by \"Come!\" and move backwards.",
      "The moment he arrives, deliver a jackpot (5-6 treats in a row, praise, play).",
      "Repeat 5-8 times per session — always with a jackpot, never with disappointment.",
      "Gradually increase distance to 3-5 meters.",
    ],
    mistakesDe: [
      "Rufen, wenn der Hund abgelenkt ist und wahrscheinlich nicht kommt — er lernt, \"Hier\" zu ignorieren (Learned Irrelevance).",
      "Hund rufen, um etwas Unangenehmes zu tun (Leine an, Spielende) — vergiftet das Signal.",
      "Nur ein Leckerli geben statt Jackpot — der Rückruf muss die beste Belohnung des Tages sein.",
    ],
    mistakesEn: [
      "Calling when the dog is distracted and likely won't come — he learns to ignore \"Come\" (learned irrelevance).",
      "Calling the dog to do something unpleasant (leash up, end of play) — poisons the cue.",
      "Giving only one treat instead of a jackpot — the recall must be the best reward of the day.",
    ],
    progressionDe:
      "Beginne drinnen auf 1-2 Meter. Steigere auf 5 Meter drinnen. Dann Garten auf 2 Meter. Dann Garten auf 10 Meter. Erst danach kontrollierte Außenumgebung (Schleppleine). Den Rückruf nie ohne Sicherungsleine in unbekannter Umgebung testen.",
    progressionEn:
      "Start indoors at 1-2 meters. Increase to 5 meters indoors. Then garden at 2 meters. Then garden at 10 meters. Only then controlled outdoor environments (long line). Never test the recall off-leash in unfamiliar environments.",
    proTipDe:
      "Der Rückruf ist das wichtigste und gleichzeitig fragilste Signal. Nutze das Premack-Prinzip: \"Komm zu mir, dann darfst du wieder zum Hundekumpel.\" So wird das Kommen nicht zum Spielverderber, sondern zum Türöffner für alles Tolle.",
    proTipEn:
      "The recall is the most important and also the most fragile cue. Use the Premack Principle: \"Come to me, then you can go back to your dog friend.\" This way coming to you is not a buzzkill but a gateway to everything fun.",
    durationMin: 3,
    frequencyPerDay: 5,
    estimatedDays: 14,
    methodology: "classical",
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
    stepsDe: [
      "Gib dem Hund ein niedrig-wertiges Spielzeug zum Kauen.",
      "Halte ein hochwertiges Leckerli (Käse, Leberwurst) an seine Nase.",
      "Sobald er das Spielzeug loslässt, sage \"Aus\", markere und gib das Leckerli.",
      "Gib das Spielzeug sofort zurück — so lernt er: Loslassen = Belohnung + Gegenstand zurück.",
      "Steigere schrittweise den Wert des Gegenstands (von Spielzeug zu Kauknochen).",
    ],
    stepsEn: [
      "Give the dog a low-value toy to chew on.",
      "Hold a high-value treat (cheese, liver paste) near his nose.",
      "The moment he releases the toy, say \"Drop it\", mark, and deliver the treat.",
      "Return the toy immediately — this teaches: releasing = reward + item back.",
      "Gradually increase the value of the object (from toy to chew bone).",
    ],
    mistakesDe: [
      "Gegenstand wegnehmen und nicht zurückgeben — der Hund lernt, Dinge zu verteidigen, weil Loslassen Verlust bedeutet.",
      "Zerren oder aus dem Maul ziehen — provoziert Ressourcenverteidigung und eskaliert das Verhalten.",
      "Mit zu hochwertigen Gegenständen starten — der Hund ist zu erregt, um den Tausch zu akzeptieren.",
    ],
    mistakesEn: [
      "Taking the item away and not returning it — the dog learns to guard things because releasing means loss.",
      "Pulling or prying from the mouth — provokes resource guarding and escalates the behavior.",
      "Starting with objects that are too high-value — the dog is too aroused to accept the trade.",
    ],
    progressionDe:
      "Phase 1: Tausch gegen hochwertiges Leckerli mit Rückgabe. Phase 2: Leckerli reduzieren, aber Spielzeug immer zurückgeben. Phase 3: Signalwort allein ohne sichtbare Belohnung. Phase 4: Üben mit hochwertigeren Gegenständen.",
    progressionEn:
      "Phase 1: Trade for high-value treat with item return. Phase 2: Reduce treat visibility but always return the toy. Phase 3: Verbal cue alone without visible reward. Phase 4: Practice with higher-value items.",
    proTipDe:
      "Aus ist kein Gehorsamssignal, sondern ein Tauschgeschäft. Nutze das Premack-Prinzip: Loslassen führt zu etwas Besserem. Trainiere Aus auch mit Futter in der Hand — das ist die Basis für zuverlässiges Abgeben gefährlicher Gegenstände im Notfall.",
    proTipEn:
      "Drop it is not an obedience command but a trade deal. Use the Premack Principle: releasing leads to something better. Also practice drop it with food in hand — this is the foundation for reliably surrendering dangerous objects in emergencies.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 14,
    methodology: "luring",
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
    stepsDe: [
      "Wähle ein neutrales Wort (z.B. \"Schade\" oder \"Nope\") und übe es zuerst ohne Hund.",
      "Trainiere ein bekanntes Verhalten (z.B. Sitz). Bei korrekter Ausführung: Marker + Leckerli.",
      "Bei falscher Ausführung: Sage dein No-Reward-Wort in neutralem Ton, kurze Pause (1-2s).",
      "Biete sofort eine neue Chance an — wiederhole das Signal.",
      "Belohne den nächsten Erfolg besonders großzügig (Kontrasteffekt).",
    ],
    stepsEn: [
      "Choose a neutral word (e.g., \"Oops\" or \"Nope\") and practice it without the dog first.",
      "Train a known behavior (e.g., sit). On correct execution: marker + treat.",
      "On incorrect execution: say your no-reward word in a neutral tone, brief pause (1-2s).",
      "Immediately offer a new chance — repeat the cue.",
      "Reward the next success extra generously (contrast effect).",
    ],
    mistakesDe: [
      "Emotionale Aufladung — \"Nein!\" in scharfem Ton wird zur Strafe und erzeugt Angst statt Information.",
      "Kein sofortiger neuer Versuch — der Hund versteht nicht, was stattdessen richtig ist.",
      "Zu häufig einsetzen — wenn der Hund ständig falsch liegt, ist das Kriterium zu schwer, nicht der Hund zu dumm.",
    ],
    mistakesEn: [
      "Emotional charge — \"No!\" in a sharp tone becomes punishment and creates fear instead of information.",
      "No immediate retry — the dog doesn't understand what is correct instead.",
      "Using it too often — if the dog is constantly wrong, the criterion is too hard, not the dog too dumb.",
    ],
    progressionDe:
      "Phase 1: Nur mit einem gut bekannten Verhalten üben. Phase 2: Bei neuen Verhaltensweisen nutzen, aber sparsam (max. 20% der Trials). Phase 3: In Alltagssituationen als ruhige Korrekturinformation nutzen.",
    progressionEn:
      "Phase 1: Only use with a well-known behavior. Phase 2: Use with new behaviors, but sparingly (max 20% of trials). Phase 3: Use in everyday situations as calm corrective information.",
    proTipDe:
      "Ein guter No-Reward Marker basiert auf dem Konzept der \"informativen Rückmeldung\" aus der Lerntheorie. Er funktioniert nur, wenn die Erfolgsrate bei mindestens 80% liegt (errorless learning). Ist sie niedriger, mache die Aufgabe leichter statt mehr NRM zu geben.",
    proTipEn:
      "A good no-reward marker is based on \"informative feedback\" from learning theory. It only works when the success rate is at least 80% (errorless learning). If it's lower, make the task easier instead of giving more NRMs.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 10,
    methodology: "shaping",
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
    stepsDe: [
      "Bringe den Hund ins Sitz-Bleib oder Platz-Bleib.",
      "Mache einen halben Schritt zurück und kehre sofort zurück. Markere und belohne am Platz.",
      "Steigere auf einen ganzen Schritt, dann zwei Schritte, immer mit Rückkehr und Belohnung am Platz.",
      "Bei Abbruch: Kein Kommentar, bringe den Hund zurück, reduziere die Distanz um 50%.",
      "Baue auf 5 Meter auf, dann beginne, dich seitlich zu bewegen.",
      "Übe schließlich, dich umzudrehen und wegzugehen (Rücken zum Hund).",
    ],
    stepsEn: [
      "Cue the dog into a sit-stay or down-stay.",
      "Take half a step back and immediately return. Mark and reward in place.",
      "Increase to one full step, then two steps, always returning to reward in place.",
      "On break: no comment, return the dog, reduce distance by 50%.",
      "Build to 5 meters, then start moving laterally.",
      "Finally practice turning around and walking away (back to the dog).",
    ],
    mistakesDe: [
      "Zu große Distanzsprünge — der Hund bricht ständig ab und lernt, dass Aufstehen eine Option ist.",
      "Immer nur geradeaus zurückgehen — der Hund lernt nur eine Richtung. Seitlich und um Ecken üben.",
      "Hund aus der Ferne abrufen statt zurückzukehren — verbindet Bleib immer mit Rückruf.",
    ],
    mistakesEn: [
      "Making distance jumps too large — the dog breaks repeatedly and learns that getting up is an option.",
      "Always moving straight back — the dog learns only one direction. Practice sideways and around corners.",
      "Calling the dog from a distance instead of returning — always links stay with recall.",
    ],
    progressionDe:
      "Nutze das 300-Peck-Verfahren: Steigere in kleinen Schritten, bei Fehler gehe 2 Stufen zurück. Erst Distanz allein aufbauen (keine Ablenkung). Dann Distanz + Dauer. Zuletzt Distanz + Ablenkung (mit reduzierter Distanz).",
    progressionEn:
      "Use the 300-Peck method: increase in small steps, on failure go back 2 levels. Build distance alone first (no distractions). Then distance + duration. Finally distance + distraction (with reduced distance).",
    proTipDe:
      "Das 300-Peck-Verfahren (nach Jean Donaldson) ist ideal für Bleib: 1 Schritt → Erfolg → 2 Schritte → Erfolg → 3 Schritte. Bei Fehler: zurück auf 1 Schritt. Dieses systematische Protokoll verhindert Frustration auf beiden Seiten.",
    proTipEn:
      "The 300-Peck method (by Jean Donaldson) is ideal for stay: 1 step → success → 2 steps → success → 3 steps. On failure: back to 1 step. This systematic protocol prevents frustration on both sides.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 21,
    methodology: "protocol",
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
    stepsDe: [
      "Bringe den Hund ins Platz-Bleib und gehe 3 Meter weg.",
      "Drehe dich um, warte 2 Sekunden, dann rufe fröhlich \"Hier!\".",
      "Sobald der Hund bei dir ankommt, gib einen Jackpot.",
      "Wechsle ab: Manchmal zurückkehren und im Platz belohnen, manchmal abrufen.",
      "Der Hund lernt: Bleib bedeutet Bleib, bis ein anderes Signal kommt.",
      "Steigere Distanz und füge leichte Ablenkungen hinzu.",
    ],
    stepsEn: [
      "Cue the dog into a down-stay and walk 3 meters away.",
      "Turn around, wait 2 seconds, then call \"Come!\" enthusiastically.",
      "When the dog arrives, deliver a jackpot.",
      "Alternate: sometimes return and reward in the down, sometimes recall.",
      "The dog learns: stay means stay until a different cue is given.",
      "Increase distance and add mild distractions.",
    ],
    mistakesDe: [
      "Immer abrufen — der Hund antizipiert den Rückruf und löst das Bleib vorzeitig.",
      "Kein klares Auflösesignal — der Hund weiß nicht, ob er noch bleiben soll oder kommen darf.",
      "Zu große Distanz zu früh — der Hund ist unsicher und bricht den Platz ab, bevor du rufst.",
    ],
    mistakesEn: [
      "Always recalling — the dog anticipates the recall and breaks the stay prematurely.",
      "No clear release cue — the dog doesn't know whether to stay or come.",
      "Too much distance too soon — the dog is uncertain and breaks the down before you call.",
    ],
    progressionDe:
      "Phase 1: 3 Meter, 70% zurückkehren / 30% abrufen. Phase 2: 5 Meter, 50/50. Phase 3: 10 Meter mit Ablenkung. Phase 4: Verschiedene Untergründe und Orte. Der Schlüssel ist die Unvorhersagbarkeit des Ablaufs.",
    progressionEn:
      "Phase 1: 3 meters, 70% return / 30% recall. Phase 2: 5 meters, 50/50. Phase 3: 10 meters with distraction. Phase 4: Various surfaces and locations. The key is unpredictability of the sequence.",
    proTipDe:
      "Diese Übung trainiert Stimuluskontrolle: Der Hund unterscheidet zwischen \"Bleib\" (warten) und \"Hier\" (kommen). Laut Bob Bailey ist echte Stimuluskontrolle erst erreicht, wenn das Verhalten nur auf das korrekte Signal gezeigt wird — und nicht auf andere.",
    proTipEn:
      "This exercise trains stimulus control: the dog discriminates between \"Stay\" (wait) and \"Come\" (move). According to Bob Bailey, true stimulus control is only achieved when the behavior is offered only on the correct cue — and not on others.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 21,
    methodology: "chaining",
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
    stepsDe: [
      "Wähle 2-3 Signale, die der Hund einzeln sicher beherrscht (z.B. Sitz, Platz, Steh).",
      "Gib das erste Signal, markere und belohne. Dann das zweite, markere und belohne.",
      "Verkette: Sitz → Platz, nur nach Platz belohnen. Dann Sitz → Platz → Steh, nur nach Steh.",
      "Baue rückwärts auf (Backchaining): Letztes Verhalten zuerst lernen, dann vorletztes davorsetzen.",
      "Steigere schrittweise auf 4-5 Verhaltensweisen in einer Kette.",
      "Variiere die Reihenfolge, um echte Signalkontrolle statt Routine zu trainieren.",
    ],
    stepsEn: [
      "Choose 2-3 cues the dog performs reliably on their own (e.g., sit, down, stand).",
      "Give the first cue, mark and reward. Then the second, mark and reward.",
      "Chain: Sit → Down, only reward after down. Then Sit → Down → Stand, only reward after stand.",
      "Build backwards (backchaining): teach the last behavior first, then prepend the previous one.",
      "Gradually increase to 4-5 behaviors in a chain.",
      "Vary the order to train true stimulus control rather than routine.",
    ],
    mistakesDe: [
      "Zu viele neue Verhaltensweisen auf einmal verketten — der Hund wird frustriert, weil die Belohnung ausbleibt.",
      "Immer die gleiche Reihenfolge — der Hund lernt eine Routine statt auf einzelne Signale zu reagieren.",
      "Einzelverhalten nicht sauber genug, bevor sie verkettet werden — die Kette wird schlampig.",
    ],
    mistakesEn: [
      "Chaining too many new behaviors at once — the dog gets frustrated because reward is withheld too long.",
      "Always using the same order — the dog learns a routine instead of responding to individual cues.",
      "Individual behaviors not clean enough before chaining — the chain becomes sloppy.",
    ],
    progressionDe:
      "Phase 1: 2er-Kette mit Belohnung am Ende. Phase 2: 3er-Kette. Phase 3: 4-5er-Kette. Phase 4: Variable Reihenfolge. Phase 5: Ketten in verschiedenen Umgebungen. Nutze Backchaining — das hält die Motivation hoch, weil das Ende der Kette am stärksten belohnt ist.",
    progressionEn:
      "Phase 1: 2-behavior chain with reward at the end. Phase 2: 3-behavior chain. Phase 3: 4-5-behavior chain. Phase 4: Variable order. Phase 5: Chains in different environments. Use backchaining — it keeps motivation high because the end of the chain is most strongly reinforced.",
    proTipDe:
      "Backchaining (Rückwärtsverkettung) ist die effektivste Methode nach B.F. Skinner. Der Hund lernt zuerst das letzte Glied (stärkste Belohnungshistorie), dann das vorletzte usw. Jedes vorherige Verhalten wird zum sekundären Verstärker für das nächste.",
    proTipEn:
      "Backchaining is the most effective method according to B.F. Skinner. The dog learns the last link first (strongest reinforcement history), then the second-to-last, etc. Each preceding behavior becomes a secondary reinforcer for the next.",
    durationMin: 10,
    frequencyPerDay: 2,
    estimatedDays: 21,
    methodology: "chaining",
  },
]
