// prisma/seed/dog-training/skills/scent-work.ts
import type { SkillSeed } from "../types"

export const SCENT_WORK_SKILLS: SkillSeed[] = [
  {
    id: "food_dummy",
    categoryId: "scent_work",
    nameDe: "Futterdummy suchen",
    nameEn: "Food Dummy Search",
    descriptionDe:
      "Leckerli sichtbar werfen, \"Such!\" — Hund rennt hin, frisst. Schwieriger: Leckerli verstecken, während der Hund wegschaut. Nasenarbeit ermüdet Hunde schneller als körperliche Auslastung.",
    descriptionEn:
      "Throw a treat visibly, cue \"Find it!\" — the dog runs over and eats. Harder: hide the treat while the dog looks away. Scent work tires dogs faster than physical exercise.",
    stepsDe: [
      "Leckerli vor den Augen des Hundes auf den Boden werfen und \"Such!\" sagen",
      "Hund zum Leckerli laufen lassen — sofort loben, wenn er es findet",
      "Leckerli werfen, während der Hund kurz wegschaut (Partner hält Hund fest)",
      "Leckerli hinter einem Gegenstand verstecken, Hund losschicken",
      "Versteck zunehmend schwieriger wählen — unter Decken, hinter Möbeln",
    ],
    stepsEn: [
      "Toss a treat on the ground in front of the dog and say \"Find it!\"",
      "Let the dog run to the treat — praise immediately when found",
      "Toss the treat while the dog briefly looks away (partner holds the dog)",
      "Hide the treat behind an object, then release the dog",
      "Gradually choose harder hiding spots — under blankets, behind furniture",
    ],
    mistakesDe: [
      "Zu lange Suchsessions — Nasenarbeit ermüdet enorm, nach 5 Minuten Pause machen",
      "Dem Hund zum Versteck helfen statt ihn selbst suchen zu lassen",
      "Leckerli an unerreichbaren Stellen verstecken, was zu Frustration führt",
    ],
    mistakesEn: [
      "Sessions too long — scent work is extremely tiring, take a break after 5 minutes",
      "Helping the dog to the hiding spot instead of letting them search independently",
      "Hiding treats in unreachable places, causing frustration",
    ],
    progressionDe:
      "Sichtbar werfen → werfen während Hund wegschaut → außer Sicht verstecken → mehrere Verstecke → verschiedene Räume/Umgebungen",
    progressionEn:
      "Visible toss → toss while dog looks away → hide out of sight → multiple hides → different rooms/environments",
    proTipDe:
      "Immer mit einem Erfolg aufhören — das letzte Versteck sollte leicht sein, damit der Hund motiviert bleibt.",
    proTipEn:
      "Always end on a success — the last hide should be easy so the dog stays motivated.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 7,
    methodology: "luring",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 1,
  },
  {
    id: "treat_hunt",
    categoryId: "scent_work",
    nameDe: "Leckerli-Suchspiel",
    nameEn: "Treat Hunt",
    descriptionDe:
      "Mehrere Leckerlis in einem abgegrenzten Bereich verstecken (Garten, Wohnzimmer). Hund darf suchen. \"Such!\"-Signal. Schwieriger durch Verstecken an höheren Stellen oder in Verstecken.",
    descriptionEn:
      "Hide several treats in a defined area (garden, living room). Dog gets to search. Cue \"Find it!\". Harder with hides up high or in containers.",
    stepsDe: [
      "3–5 Leckerlis offen im Raum verteilen, während der Hund zuschaut",
      "\"Such!\" sagen und den Hund frei laufen lassen",
      "Leckerlis verteilen, während der Hund in einem anderen Raum wartet",
      "Verstecke schwieriger gestalten: unter Teppichecken, auf niedrigen Regalen",
      "Suchbereich vergrößern — vom Zimmer auf die ganze Wohnung oder den Garten",
    ],
    stepsEn: [
      "Scatter 3–5 treats openly around the room while the dog watches",
      "Say \"Find it!\" and let the dog roam freely",
      "Scatter treats while the dog waits in another room",
      "Make hides harder: under rug corners, on low shelves",
      "Expand the search area — from one room to the whole apartment or garden",
    ],
    mistakesDe: [
      "Zu viele Leckerlis auf einmal — der Hund verliert die Motivation, wenn alles zu leicht ist",
      "Vergessene Leckerlis liegen lassen, die der Hund später selbstständig findet (ungewollte Selbstbelohnung)",
      "Den Hund bei Unsicherheit zum Versteck führen statt ihm Zeit zu geben",
    ],
    mistakesEn: [
      "Too many treats at once — the dog loses motivation when everything is too easy",
      "Leaving forgotten treats that the dog finds later on its own (unintended self-reward)",
      "Guiding the dog to the hide when unsure instead of giving them time",
    ],
    progressionDe:
      "Offene Leckerlis → leicht versteckt → in Behältern → erhöhte Verstecke → größere Suchfläche mit weniger Leckerlis",
    progressionEn:
      "Open treats → lightly hidden → in containers → elevated hides → larger search area with fewer treats",
    proTipDe:
      "Merke dir genau, wo du wie viele Leckerlis versteckt hast — so erkennst du, ob der Hund alle gefunden hat.",
    proTipEn:
      "Remember exactly where and how many treats you hid — that way you know if the dog found them all.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 10,
    methodology: "shaping",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "food_dummy",
    sortOrder: 2,
  },
  {
    id: "snuffle_mat",
    categoryId: "scent_work",
    nameDe: "Schnüffelteppich",
    nameEn: "Snuffle Mat",
    descriptionDe:
      "Trockenfutter in einen Schnüffelteppich einstreuen, Hund frei schnüffeln lassen. Kein Training, reine Entspannung und mentale Auslastung. Ideal für Regentage oder Ruhephasen.",
    descriptionEn:
      "Sprinkle dry food into a snuffle mat, let the dog freely forage. Not training — pure enrichment and mental decompression. Ideal for rainy days or quiet times.",
    stepsDe: [
      "Schnüffelteppich auf den Boden legen und wenige Leckerlis oben drauf verteilen",
      "Hund zum Teppich lassen — er lernt, dass dort Futter ist",
      "Leckerlis tiefer in die Fleece-Streifen drücken, sodass der Hund intensiver schnüffeln muss",
      "Tägliche Futterration teilweise über den Schnüffelteppich verfüttern",
    ],
    stepsEn: [
      "Place the snuffle mat on the floor and scatter a few treats on top",
      "Let the dog approach the mat — they learn food is there",
      "Push treats deeper into the fleece strips so the dog has to sniff harder",
      "Feed part of the daily food ration through the snuffle mat",
    ],
    mistakesDe: [
      "Den Hund unbeaufsichtigt lassen — manche Hunde zerkauen den Teppich",
      "Zu große Futterstücke verwenden, die nicht zwischen die Streifen passen",
    ],
    mistakesEn: [
      "Leaving the dog unsupervised — some dogs chew up the mat",
      "Using pieces of food that are too large to fit between the strips",
    ],
    progressionDe:
      "Futter obenauf → zwischen die Streifen → tief eingedrückt → weniger Futter über größere Fläche verteilt",
    progressionEn:
      "Food on top → between the strips → pushed deep → less food spread over a larger area",
    proTipDe:
      "Den Schnüffelteppich nach aufregenden Erlebnissen nutzen — Nasenarbeit senkt den Cortisolspiegel und beruhigt den Hund.",
    proTipEn:
      "Use the snuffle mat after exciting experiences — nose work lowers cortisol levels and calms the dog.",
    durationMin: 10,
    frequencyPerDay: 2,
    estimatedDays: 3,
    methodology: "capturing",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 3,
  },
  {
    id: "puzzle_toy",
    categoryId: "scent_work",
    nameDe: "Intelligenzspielzeug",
    nameEn: "Puzzle Toy",
    descriptionDe:
      "Spielzeuge mit Futterbelohnung, die der Hund durch Schieben, Drehen oder Öffnen löst. Mit leichten Puzzles beginnen, Schwierigkeit steigern. Nicht frustrierend gestalten — immer lösbar halten.",
    descriptionEn:
      "Toys with food rewards the dog solves by pushing, turning, or opening. Start with easy puzzles, raise difficulty. Keep it non-frustrating — always solvable.",
    stepsDe: [
      "Puzzle offen hinlegen, Futter sichtbar — Hund darf sofort fressen",
      "Deckel/Schieber nur halb schließen, damit der Hund das Prinzip entdeckt",
      "Puzzle komplett schließen und den Hund selbst lösen lassen",
      "Schwerere Puzzle-Stufen einführen (mehrere Schritte zum Öffnen)",
      "Verschiedene Puzzle-Typen rotieren, damit der Hund flexibel bleibt",
    ],
    stepsEn: [
      "Place the puzzle open with visible food — let the dog eat immediately",
      "Half-close the lid/slider so the dog discovers the mechanism",
      "Close the puzzle completely and let the dog solve it on their own",
      "Introduce harder puzzle levels (multiple steps to open)",
      "Rotate different puzzle types to keep the dog flexible",
    ],
    mistakesDe: [
      "Zu schnell zu schwierige Stufen wählen — der Hund gibt frustriert auf",
      "Dem Hund helfen, bevor er selbst probiert hat — mindestens 30 Sekunden warten",
      "Immer dasselbe Puzzle verwenden — der Hund lernt den Trick und wird nicht mehr gefordert",
    ],
    mistakesEn: [
      "Jumping to hard levels too quickly — the dog gives up in frustration",
      "Helping the dog before they tried themselves — wait at least 30 seconds",
      "Always using the same puzzle — the dog learns the trick and is no longer challenged",
    ],
    progressionDe:
      "Offenes Puzzle → halb geschlossen → geschlossen → mehrstufig → Rotation verschiedener Puzzle-Typen",
    progressionEn:
      "Open puzzle → half-closed → closed → multi-step → rotation of different puzzle types",
    proTipDe:
      "Neue Puzzles immer eine Stufe leichter anbieten als nötig — der Hund soll Selbstvertrauen aufbauen, nicht verzweifeln.",
    proTipEn:
      "Always introduce new puzzles one level easier than needed — the dog should build confidence, not despair.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 14,
    methodology: "shaping",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 4,
  },
  {
    id: "indicate_object",
    categoryId: "scent_work",
    nameDe: "Gegenstand anzeigen",
    nameEn: "Indicate Object",
    descriptionDe:
      "Hund findet einen Gegenstand → soll ein Signalverhalten zeigen (Sitz, Platz, Bellen). Beim Finden ins gewünschte Verhalten lotsen, markern, am Fundort belohnen. Belohnung immer am Objekt, nicht beim Hundeführer.",
    descriptionEn:
      "Dog finds an object → should show a signal behavior (sit, down, bark). On the find, lure into the desired behavior, mark, reward at the find spot. Reward always at the object, not at the handler.",
    stepsDe: [
      "Gegenstand offen hinlegen, Hund hinführen, bei Berührung mit der Nase markern und belohnen",
      "Hund bei Berührung ins Sitz/Platz lotsen, markern, Belohnung direkt am Objekt geben",
      "Gegenstand leicht verstecken, Hund suchen lassen — bei Fund Signalverhalten abwarten",
      "Signalverhalten ohne Hilfe am Objekt abwarten, erst dann markern und belohnen",
      "Versteck schwieriger wählen, Hund muss selbstständig suchen und anzeigen",
    ],
    stepsEn: [
      "Place the object openly, guide the dog to it, mark and reward when they nose-touch it",
      "Lure the dog into sit/down on contact, mark, reward directly at the object",
      "Lightly hide the object, let the dog search — wait for the signal behavior on find",
      "Wait for the signal behavior at the object without help, only then mark and reward",
      "Choose harder hides, the dog must independently search and indicate",
    ],
    mistakesDe: [
      "Belohnung beim Hundeführer statt am Fundort geben — der Hund verliert die Objektbindung",
      "Zu früh auf ein bestimmtes Anzeigeverhalten bestehen, bevor der Hund das Suchen sicher kann",
      "Signalverhalten nicht konsequent abwarten — der Hund lernt, dass Finden allein reicht",
    ],
    mistakesEn: [
      "Rewarding at the handler instead of the find spot — the dog loses the object connection",
      "Insisting on a specific indication behavior too early, before the dog can search reliably",
      "Not consistently waiting for the signal behavior — the dog learns that finding alone is enough",
    ],
    progressionDe:
      "Nasenberührung → Sitz/Platz am Objekt mit Hilfe → ohne Hilfe → leichtes Versteck → schwieriges Versteck in neuer Umgebung",
    progressionEn:
      "Nose touch → sit/down at object with help → without help → easy hide → hard hide in new environment",
    proTipDe:
      "Das Anzeigeverhalten separat ohne Suche trainieren, bis es bombensicher sitzt — erst dann beides kombinieren.",
    proTipEn:
      "Train the indication behavior separately without searching until it is rock-solid — only then combine both.",
    durationMin: 10,
    frequencyPerDay: 2,
    estimatedDays: 21,
    methodology: "luring",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "sit,down",
    sortOrder: 5,
  },
  {
    id: "lost_object",
    categoryId: "scent_work",
    nameDe: "Verloren-Suche",
    nameEn: "Lost Object Search",
    descriptionDe:
      "Bekanntes Apportel vor Hundeaugen verstecken, \"Such verloren!\" — Hund bringt. Schwieriger: Verstecken außer Sicht, größere Distanz, komplexere Umgebung. Jagdliche Arbeitsform.",
    descriptionEn:
      "Hide a known retrieve dummy in front of the dog, cue \"Find lost!\" — dog brings. Harder: hide out of sight, greater distance, more complex environment. A hunting work style.",
    stepsDe: [
      "Apportel vor dem Hund auf den Boden legen, \"Such verloren!\" — Hund apportiert",
      "Apportel ein paar Meter entfernt hinlegen, während der Hund zuschaut",
      "Apportel verstecken, während der Hund kurz wegschaut — dann losschicken",
      "Apportel außer Sicht verstecken (z.B. im hohen Gras), größere Distanz",
      "In neuer Umgebung suchen lassen, mit Wind und verschiedenen Untergründen",
    ],
    stepsEn: [
      "Place the dummy on the ground in front of the dog, cue \"Find lost!\" — dog retrieves",
      "Place the dummy a few meters away while the dog watches",
      "Hide the dummy while the dog briefly looks away — then send them",
      "Hide the dummy out of sight (e.g. in tall grass), greater distance",
      "Search in new environments, with wind and different surfaces",
    ],
    mistakesDe: [
      "Zu schnell die Distanz steigern — der Hund muss das Prinzip erst sicher verstanden haben",
      "Den Hund zum Apportel führen statt seine Nase arbeiten zu lassen",
      "Immer am selben Ort üben — der Hund lernt den Platz statt den Geruch",
    ],
    mistakesEn: [
      "Increasing distance too fast — the dog must first understand the principle reliably",
      "Guiding the dog to the dummy instead of letting their nose work",
      "Always practicing in the same spot — the dog learns the location instead of the scent",
    ],
    progressionDe:
      "Sichtbar vor dem Hund → kurze Distanz sichtbar → versteckt mit Blickkontakt → außer Sicht → neue Umgebung mit Windeinfluss",
    progressionEn:
      "Visible in front of dog → short distance visible → hidden with eye contact → out of sight → new environment with wind influence",
    proTipDe:
      "Bei Wind immer so starten, dass der Hund den Geruch in der Nase hat (in den Wind schicken) — Erfolgserlebnis garantiert.",
    proTipEn:
      "In wind, always start so the dog has the scent in their nose (send into the wind) — guaranteed success.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 28,
    methodology: "chaining",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "retrieve",
    sortOrder: 6,
  },
  {
    id: "problem_solving",
    categoryId: "scent_work",
    nameDe: "Problemlösung",
    nameEn: "Problem Solving Games",
    descriptionDe:
      "Mehrstufige Puzzles: Decke von einer Schachtel schütteln, Deckel drücken, Seil ziehen. Fördert kreatives Problemlösen und Frustrationstoleranz. Immer lösbar halten, nicht zu früh helfen.",
    descriptionEn:
      "Multi-step puzzles: shake a blanket off a box, press a lid, pull a rope. Builds creative problem-solving and frustration tolerance. Always keep it solvable, don't help too early.",
    stepsDe: [
      "Leckerli unter einen umgedrehten Becher legen — der Hund muss ihn umstoßen",
      "Leckerli in eine offene Schachtel legen, die der Hund mit der Pfote oder Nase öffnen muss",
      "Schachtel mit einer Decke zudecken — Hund muss erst die Decke entfernen, dann die Schachtel öffnen",
      "Seil an einer Schublade befestigen — Hund zieht am Seil, Schublade öffnet sich, Leckerli drin",
      "Mehrere Schritte kombinieren: Decke entfernen → Deckel heben → Futter finden",
    ],
    stepsEn: [
      "Place a treat under an upside-down cup — the dog must knock it over",
      "Place a treat in an open box the dog must open with paw or nose",
      "Cover the box with a blanket — the dog must first remove the blanket, then open the box",
      "Attach a rope to a drawer — the dog pulls the rope, the drawer opens, treat inside",
      "Combine multiple steps: remove blanket → lift lid → find food",
    ],
    mistakesDe: [
      "Zu früh helfen — der Hund braucht Zeit zum Nachdenken, mindestens 1–2 Minuten",
      "Unlösbare Aufgaben stellen — das zerstört die Motivation nachhaltig",
      "Frustration nicht erkennen (Hecheln, Abwenden, Bellen) und trotzdem weitermachen",
    ],
    mistakesEn: [
      "Helping too early — the dog needs time to think, at least 1–2 minutes",
      "Setting unsolvable tasks — this destroys motivation permanently",
      "Not recognizing frustration (panting, turning away, barking) and continuing anyway",
    ],
    progressionDe:
      "Einstufig (Becher umwerfen) → zweistufig (Decke + Schachtel) → dreistufig → eigene Lösungsstrategien entwickeln lassen",
    progressionEn:
      "Single-step (knock over cup) → two-step (blanket + box) → three-step → let the dog develop their own solving strategies",
    proTipDe:
      "Wenn der Hund frustriert aufgibt, die Aufgabe sofort vereinfachen — nie mit einem Misserfolg enden lassen.",
    proTipEn:
      "If the dog gives up in frustration, simplify the task immediately — never end on a failure.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 21,
    methodology: "shaping",
    difficulty: "intermediate",
    phase: "adult",
    prerequisiteIds: "puzzle_toy",
    sortOrder: 7,
  },
  {
    id: "person_search",
    categoryId: "scent_work",
    nameDe: "Personensuche",
    nameEn: "Person Search",
    descriptionDe:
      "Eine bekannte Person versteckt sich, du gehst mit dem Hund suchen. \"Such Franz!\" — bei Ankunft Party machen. Schrittweise anspruchsvoller: unbekannte Verstecke, größere Distanz.",
    descriptionEn:
      "A familiar person hides, you go searching with the dog. \"Find Franz!\" — party on arrival. Gradually more challenging: unfamiliar hiding spots, greater distance.",
    stepsDe: [
      "Hilfsperson versteckt sich sichtbar hinter einem Möbelstück im selben Raum",
      "\"Such [Name]!\" sagen, Hund losschicken — Hilfsperson macht sich bei Ankunft bemerkbar und feiert den Hund",
      "Hilfsperson versteckt sich in einem anderen Raum, Hund muss aktiv suchen",
      "Versteck ohne Sichtkontakt: Hilfsperson geht weg, während der Hund wartet",
      "Draußen üben: Hilfsperson versteckt sich hinter Bäumen oder Büschen, größere Fläche",
      "Hund soll nach dem Finden ein Anzeigeverhalten zeigen (Bellen, Rücklaufen zum Hundeführer)",
    ],
    stepsEn: [
      "Helper hides visibly behind a piece of furniture in the same room",
      "Say \"Find [name]!\" and send the dog — helper makes themselves known and celebrates the dog on arrival",
      "Helper hides in another room, the dog must actively search",
      "Hide without line of sight: helper leaves while the dog waits",
      "Practice outside: helper hides behind trees or bushes, larger area",
      "Dog should show an indication behavior after finding (bark, run back to handler)",
    ],
    mistakesDe: [
      "Die Hilfsperson feiert den Hund nicht genug — der Fund muss das beste Erlebnis überhaupt sein",
      "Zu schnell zu große Distanzen wählen, bevor der Hund das Prinzip verstanden hat",
      "Ohne Hilfsperson üben wollen — am Anfang braucht der Hund immer einen Erfolg am Fundort",
    ],
    mistakesEn: [
      "The helper doesn't celebrate the dog enough — the find must be the best experience ever",
      "Choosing too large distances too quickly before the dog understands the concept",
      "Wanting to practice without a helper — at the start the dog always needs success at the find spot",
    ],
    progressionDe:
      "Sichtbares Versteck im Raum → anderer Raum → ohne Sichtkontakt → draußen → Anzeigeverhalten einbauen",
    progressionEn:
      "Visible hide in the room → different room → without line of sight → outside → add indication behavior",
    proTipDe:
      "Die Hilfsperson sollte hochwertige Leckerlis und ein Lieblingsspielzeug dabei haben — der Fund muss sich mehr lohnen als alles andere.",
    proTipEn:
      "The helper should carry high-value treats and a favorite toy — the find must be more rewarding than anything else.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 30,
    methodology: "chaining",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "close_recall,indicate_object",
    sortOrder: 8,
  },
  {
    id: "scent_discrimination",
    categoryId: "scent_work",
    nameDe: "Geruchsunterscheidung",
    nameEn: "Scent Discrimination",
    descriptionDe:
      "Hund lernt, einen bestimmten Geruch unter anderen zu erkennen. Beginne mit 1 Zielgeruch gegen neutral, steigere auf 1 gegen mehrere. Basis für Mantrailing und Nosework-Sport.",
    descriptionEn:
      "Dog learns to identify one target scent among others. Start with 1 target vs neutral, scale to 1 vs several. Foundation for mantrailing and nosework sport.",
    stepsDe: [
      "Zielgeruch (z.B. Birkenöl auf Wattebausch) in eine Dose legen, daneben eine leere Dose — Hund schnüffelt an Zieldose → Marker + Belohnung",
      "Zieldose unter 2 leeren Dosen platzieren — Hund soll die richtige anzeigen",
      "Anzahl der leeren Dosen auf 4–6 erhöhen, Zieldose immer an anderer Position",
      "Zweiten Ablenkungsgeruch einführen (z.B. Gewürz), nur Zielgeruch wird belohnt",
      "Mehrere Ablenkungsgerüche verwenden, Zielgeruch bleibt derselbe",
    ],
    stepsEn: [
      "Place target scent (e.g. birch oil on a cotton ball) in a tin, next to an empty tin — dog sniffs the target tin → mark + reward",
      "Place target tin among 2 empty tins — dog should indicate the correct one",
      "Increase empty tins to 4–6, target tin always in a different position",
      "Introduce a second distraction scent (e.g. a spice), only the target scent is rewarded",
      "Use multiple distraction scents, the target scent stays the same",
    ],
    mistakesDe: [
      "Zieldose immer an der gleichen Position — der Hund lernt die Position statt den Geruch",
      "Dosen mit den Händen berühren und so den eigenen Geruch übertragen",
      "Zu viele Ablenkungsgerüche auf einmal einführen statt einzeln zu steigern",
    ],
    mistakesEn: [
      "Always placing the target tin in the same position — the dog learns position instead of scent",
      "Touching tins with hands and thus transferring your own scent",
      "Introducing too many distraction scents at once instead of increasing one at a time",
    ],
    progressionDe:
      "1 Zielgeruch vs. 1 leere Dose → vs. 3 leere → vs. 6 leere → 1 Ablenkungsgeruch → mehrere Ablenkungsgerüche",
    progressionEn:
      "1 target scent vs. 1 empty tin → vs. 3 empty → vs. 6 empty → 1 distraction scent → multiple distraction scents",
    proTipDe:
      "Dosen immer mit Handschuhen oder Pinzette anfassen — menschlicher Geruch ist ein starker Störreiz und verfälscht das Training.",
    proTipEn:
      "Always handle tins with gloves or tweezers — human scent is a strong distractor and corrupts the training.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 42,
    methodology: "shaping",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "indicate_object",
    sortOrder: 9,
  },
  {
    id: "beginner_tracking",
    categoryId: "scent_work",
    nameDe: "Fährtenarbeit (Anfang)",
    nameEn: "Beginner Tracking",
    descriptionDe:
      "Kurze gerade Fährte (5 Meter) in der Wiese treten, alle 2 Schritte ein Leckerli in den Fußtritt legen, am Ende Jackpot. Hund lernt: Nase unten = Leckerli. Schrittweise längere Fährten, später Winkel.",
    descriptionEn:
      "Short straight track (5 meters) in grass, place a treat in every second footstep, jackpot at the end. The dog learns: nose down = treats. Gradually longer tracks, later corners.",
    stepsDe: [
      "5 Meter gerade Fährte in feuchtem Gras treten, in jeden 2. Fußtritt ein Leckerli legen, am Ende großen Jackpot",
      "Hund an Schleppleine (10 m) an den Anfang der Fährte führen, Nase zum Boden zeigen, \"Such Fährte!\"",
      "Fährte auf 10 Meter verlängern, Leckerlis nur noch in jeden 3. Fußtritt",
      "Fährte auf 20 Meter verlängern und einen leichten Bogen einbauen",
      "Ersten 90-Grad-Winkel einbauen, an der Ecke Leckerlis häufen",
      "Fährte 30 Minuten alt werden lassen, bevor der Hund sucht",
    ],
    stepsEn: [
      "Trample a 5-meter straight track in damp grass, place a treat in every 2nd footstep, big jackpot at the end",
      "Guide the dog on a 10m long line to the start of the track, point the nose to the ground, cue \"Track!\"",
      "Extend the track to 10 meters, treats only in every 3rd footstep",
      "Extend to 20 meters and add a gentle curve",
      "Add the first 90-degree corner, pile treats at the turning point",
      "Let the track age 30 minutes before the dog searches",
    ],
    mistakesDe: [
      "Zu schnelles Tempo zulassen — der Hund soll langsam und tief schnüffeln, nicht rennen",
      "Auf trockenem oder steinigem Boden beginnen — feuchtes Gras speichert Geruch am besten",
      "Die Schleppleine unter Spannung halten — der Hund muss selbstständig der Fährte folgen",
    ],
    mistakesEn: [
      "Allowing too fast a pace — the dog should sniff slowly and deeply, not run",
      "Starting on dry or rocky ground — damp grass retains scent best",
      "Keeping the long line taut — the dog must follow the track independently",
    ],
    progressionDe:
      "5 m gerade, frisch → 10 m, weniger Leckerlis → 20 m mit Bogen → Winkel → ältere Fährte (30 Min.) → noch ältere Fährte (1 Std.)",
    progressionEn:
      "5 m straight, fresh → 10 m, fewer treats → 20 m with curve → corners → older track (30 min) → even older track (1 hr)",
    proTipDe:
      "Morgens bei Tau auf der Wiese trainieren — die Feuchtigkeit bindet den Geruch in den Fußtritten und macht den Einstieg viel leichter.",
    proTipEn:
      "Train in the morning on dewy grass — the moisture binds the scent in the footsteps and makes getting started much easier.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 42,
    methodology: "luring",
    difficulty: "advanced",
    phase: "advanced",
    prerequisiteIds: "indicate_object,food_dummy",
    sortOrder: 10,
  },
]
