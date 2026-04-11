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
    stepsDe: [
      "Nimm ein Leckerli in die geschlossene Faust und halte sie dem Hund hin.",
      "Ignoriere Schnüffeln, Lecken und Knabbern — halte die Faust still und geschlossen.",
      "Sobald der Hund aufhört oder den Kopf wegdreht, markere sofort.",
      "Belohne aus der ANDEREN Hand — niemals das Leckerli aus der Faust geben.",
      "Wiederhole, bis der Hund von sich aus Abstand zur Faust hält.",
      "Steigere auf offene Handfläche: Hand schließen, falls er rangeht; offen lassen und markeren, wenn er wartet.",
    ],
    stepsEn: [
      "Take a treat in your closed fist and hold it out to the dog.",
      "Ignore sniffing, licking, and nibbling — keep the fist still and closed.",
      "The instant the dog stops or turns his head away, mark immediately.",
      "Reward from the OTHER hand — never give the treat from the fist.",
      "Repeat until the dog voluntarily keeps distance from the fist.",
      "Progress to an open palm: close the hand if he goes for it; keep it open and mark when he waits.",
    ],
    mistakesDe: [
      "Das Leckerli aus der geschlossenen Faust geben — der Hund lernt dann, dass Hartnäckigkeit sich lohnt.",
      "Die Hand wegziehen statt geschlossen halten — der Hund lernt nicht, sich selbst zu regulieren.",
      "Zu spät markeren — der Hund muss den exakten Moment des Wegschauens verknüpfen.",
    ],
    mistakesEn: [
      "Giving the treat from the closed fist — the dog learns that persistence pays off.",
      "Pulling the hand away instead of keeping it closed — the dog does not learn to self-regulate.",
      "Marking too late — the dog must associate the exact moment of disengaging.",
    ],
    progressionDe:
      "Geschlossene Faust → offene Hand → Leckerli auf dem Boden mit Abdeckung → Leckerli offen auf dem Boden → Leckerli auf dem Boden beim Vorbeigehen. Immer nur eine Schwierigkeit pro Schritt erhöhen.",
    progressionEn:
      "Closed fist → open palm → treat on the floor covered by hand → treat uncovered on the floor → treat on the floor while walking past. Increase only one difficulty at a time.",
    proTipDe:
      "Sobald der Hund das Prinzip verstanden hat, baue Blickkontakt als Kriterium ein: Er muss nicht nur wegschauen, sondern aktiv dich ansehen. Das macht \"Leave It\" im Alltag deutlich zuverlässiger.",
    proTipEn:
      "Once the dog understands the concept, add eye contact as a criterion: he must not just look away but actively look at you. This makes \"Leave It\" much more reliable in real life.",
    durationMin: 3,
    frequencyPerDay: 4,
    estimatedDays: 7,
    methodology: "shaping",
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
    stepsDe: [
      "Bringe den Hund ins Sitz, bevor du den Napf anfasst.",
      "Senke den Napf langsam Richtung Boden — beobachte den Hund genau.",
      "Bewegt er sich aus dem Sitz, bringe den Napf sofort wieder nach oben (ohne Kommentar).",
      "Bleibt er sitzen, senke den Napf weiter bis zum Boden und stelle ihn ab.",
      "Gib ein klares Freigabe-Signal (\"Okay!\" oder \"Friss!\") bevor er fressen darf.",
    ],
    stepsEn: [
      "Cue the dog into a sit before touching the bowl.",
      "Slowly lower the bowl toward the floor — watch the dog closely.",
      "If he moves out of the sit, bring the bowl straight back up (no verbal correction).",
      "If he stays sitting, continue lowering the bowl to the floor and set it down.",
      "Give a clear release cue (\"Okay!\" or \"Eat!\") before he is allowed to eat.",
    ],
    mistakesDe: [
      "Den Hund verbal korrigieren (\"Nein!\") — der Napf-Reset ist Rückmeldung genug, verbale Korrekturen erzeugen Stress.",
      "Die Wartezeit zu schnell erhöhen — anfangs genügt eine halbe Sekunde Stillsitzen.",
      "Kein eindeutiges Freigabe-Signal nutzen — der Hund weiß dann nicht, wann er darf.",
    ],
    mistakesEn: [
      "Verbally correcting the dog (\"No!\") — the bowl reset is sufficient feedback, verbal corrections add stress.",
      "Increasing wait time too quickly — half a second of stillness is enough at first.",
      "Not using a clear release cue — the dog does not know when he is allowed to eat.",
    ],
    progressionDe:
      "Napf 10 cm senken → halber Weg → ganz unten → abgestellt → abgestellt + 1 Sekunde Pause → abgestellt + 3 Sekunden → abgestellt + Schritt zurück + Freigabe.",
    progressionEn:
      "Lower bowl 10 cm → halfway → all the way down → set down → set down + 1 second pause → set down + 3 seconds → set down + step back + release.",
    proTipDe:
      "Nutze dieses Ritual zweimal täglich bei jeder Mahlzeit als automatische Trainingseinheit. Nach 2 Wochen sitzt die Routine so tief, dass du nie wieder separat üben musst.",
    proTipEn:
      "Use this ritual twice daily at every meal as an automatic training session. After 2 weeks the routine is so ingrained that you never need to practice it separately.",
    durationMin: 2,
    frequencyPerDay: 2,
    estimatedDays: 10,
    methodology: "shaping",
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
    stepsDe: [
      "Bringe den Hund vor der geschlossenen Tür ins Sitz.",
      "Greife langsam zur Türklinke — bewegt sich der Hund, nimm die Hand weg und warte auf erneutes Sitz.",
      "Bleibt er sitzen, drücke die Klinke und öffne die Tür einen Spalt.",
      "Bewegt er sich jetzt, schließe die Tür sofort wieder (ohne Kommentar).",
      "Bleibt er sitzen bei offener Tür, gib das Freigabe-Signal zum Durchgehen.",
      "Baue schrittweise auf: Tür weiter öffnen, Pause verlängern, Ablenkung draußen steigern.",
    ],
    stepsEn: [
      "Cue the dog into a sit in front of the closed door.",
      "Slowly reach for the handle — if the dog moves, remove your hand and wait for him to sit again.",
      "If he stays sitting, press the handle and open the door a crack.",
      "If he moves now, close the door immediately (no verbal correction).",
      "If he stays sitting with the door open, give the release cue to go through.",
      "Build up gradually: open door wider, extend the pause, increase distractions outside.",
    ],
    mistakesDe: [
      "Den Hund durch die Tür zerren oder schieben — das Prinzip ist freiwillige Selbstkontrolle.",
      "Zu viele Schritte auf einmal überspringen — von Klinke berühren direkt zu Tür weit offen.",
      "Das Freigabe-Signal vergessen — der Hund weiß nicht, wann er darf und bricht irgendwann selbst auf.",
    ],
    mistakesEn: [
      "Dragging or pushing the dog through the door — the principle is voluntary self-control.",
      "Skipping too many steps at once — going from touching the handle straight to a wide-open door.",
      "Forgetting the release cue — the dog does not know when he may go and eventually breaks on his own.",
    ],
    progressionDe:
      "Klinke berühren → Klinke drücken → Tür 5 cm öffnen → Tür halb offen → Tür ganz offen → Tür offen + 3 Sekunden → Tür offen mit Ablenkung draußen (Person, anderer Hund).",
    progressionEn:
      "Touch handle → press handle → open door 5 cm → door half open → door fully open → door open + 3 seconds → door open with distraction outside (person, other dog).",
    proTipDe:
      "Übe an verschiedenen Türen — Haustür, Gartentür, Autotür. Hunde generalisieren schlecht. Was an der Haustür sitzt, klappt an der Gartentür nicht automatisch.",
    proTipEn:
      "Practice at different doors — front door, garden gate, car door. Dogs generalize poorly. What works at the front door does not automatically transfer to the garden gate.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 14,
    methodology: "shaping",
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
    stepsDe: [
      "Wenn der Hund hochspringt, drehe dich wortlos um und verschränke die Arme.",
      "Warte, bis alle vier Pfoten wieder auf dem Boden sind.",
      "Markere sofort und begrüße den Hund ruhig (streicheln, leise loben).",
      "Springt er erneut hoch, drehe dich wieder weg — sofort und jedes Mal.",
      "Bitte alle Haushaltsmitglieder und Besucher, es genauso zu machen.",
    ],
    stepsEn: [
      "When the dog jumps up, silently turn away and fold your arms.",
      "Wait until all four paws are back on the floor.",
      "Mark immediately and greet the dog calmly (pet, quiet praise).",
      "If he jumps again, turn away again — immediately and every time.",
      "Ask all household members and visitors to do the same.",
    ],
    mistakesDe: [
      "Den Hund beim Hochspringen anfassen oder wegschieben — jede Berührung ist Aufmerksamkeit und verstärkt das Verhalten.",
      "Inkonsequent sein — wenn eine Person Hochspringen erlaubt, lernt der Hund: Hartnäckigkeit lohnt sich.",
      "Zu aufgeregt begrüßen, sobald er am Boden ist — das löst sofort den nächsten Sprung aus.",
    ],
    mistakesEn: [
      "Touching or pushing the dog when he jumps — any contact is attention and reinforces the behavior.",
      "Being inconsistent — if one person allows jumping, the dog learns that persistence pays off.",
      "Greeting too excitedly once he is on the floor — that triggers the next jump immediately.",
    ],
    progressionDe:
      "Ruhige Begrüßung zu Hause → Begrüßung nach kurzer Abwesenheit → Begrüßung nach langer Abwesenheit → Besuch kommt zur Tür → Begegnung mit Fremden draußen.",
    progressionEn:
      "Calm greeting at home → greeting after short absence → greeting after long absence → visitor at the door → meeting strangers outside.",
    proTipDe:
      "Belohne das Vier-Pfoten-Verhalten auch wenn der Hund es gar nicht versucht hat hochzuspringen — so verstärkst du proaktiv das richtige Verhalten, statt nur das falsche zu löschen.",
    proTipEn:
      "Reward four-on-the-floor even when the dog did not attempt to jump — this proactively reinforces the right behavior instead of only extinguishing the wrong one.",
    durationMin: 2,
    frequencyPerDay: 6,
    estimatedDays: 21,
    methodology: "capturing",
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
    stepsDe: [
      "Lege die Decke auf den Boden und warte — markere und belohne jedes Anschauen oder Hinschnüffeln.",
      "Belohne nur noch Schritte Richtung Decke, dann nur noch Pfoten auf der Decke.",
      "Shape ins Sitz auf der Decke, dann ins Platz auf der Decke.",
      "Beginne Dauer aufzubauen: Belohne erst nach 2 Sekunden Liegen, dann 5, dann 10.",
      "Wirf Leckerli von der Decke weg, damit der Hund aufsteht — markere und belohne, wenn er von selbst zurückkehrt.",
      "Nimm die Decke in neue Räume und Orte mit, damit der Hund generalisiert.",
    ],
    stepsEn: [
      "Lay the mat on the floor and wait — mark and reward any glance at or sniff toward it.",
      "Reward only steps toward the mat, then only paws on the mat.",
      "Shape into a sit on the mat, then a down on the mat.",
      "Begin building duration: reward after 2 seconds of lying down, then 5, then 10.",
      "Toss treats off the mat so the dog gets up — mark and reward when he returns on his own.",
      "Take the mat to new rooms and locations so the dog generalizes.",
    ],
    mistakesDe: [
      "Den Hund auf die Decke locken oder schieben — er muss die Entscheidung selbst treffen, sonst haftet das Verhalten nicht.",
      "Dauer zu schnell steigern — der Hund soll Erfolg haben, lieber 10x 3 Sekunden als 1x 30.",
      "Nur zu Hause üben — die Decke soll ein portabler Ruheplatz werden (Restaurant, Büro, Freunde).",
    ],
    mistakesEn: [
      "Luring or pushing the dog onto the mat — he must make the choice himself, otherwise the behavior does not stick.",
      "Increasing duration too fast — the dog should succeed, better 10x 3 seconds than 1x 30.",
      "Practicing only at home — the mat should become a portable calm spot (restaurant, office, friends).",
    ],
    progressionDe:
      "Blick auf Decke → Schritt zur Decke → Pfoten drauf → Sitz drauf → Platz drauf → 10 Sek. Platz → 30 Sek. → 1 Min. → 5 Min. → Decke an neuem Ort → Decke mit Ablenkung.",
    progressionEn:
      "Glance at mat → step toward mat → paws on → sit on → down on → 10 sec down → 30 sec → 1 min → 5 min → mat in new location → mat with distractions.",
    proTipDe:
      "Bringe die Decke regelmäßig an Orte, die der Hund mit Aufregung verbindet (Tierarzt, Café). Die Decke wird zum konditionierten Entspannungssignal — ein tragbarer \"Ausschalt-Knopf\".",
    proTipEn:
      "Regularly bring the mat to places the dog associates with excitement (vet, café). The mat becomes a conditioned relaxation cue — a portable \"off switch.\"",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 21,
    methodology: "shaping",
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
    stepsDe: [
      "Beginne ein Zerrspiel mit einem Spielzeug, das der Hund gerne festhält.",
      "Halte ein hochwertiges Leckerli vor seine Nase und sage \"Aus\" — das Spiel friert ein (nicht ziehen).",
      "Sobald er loslässt, markere und gib das Leckerli.",
      "Gib das Spielzeug sofort zurück und starte das Spiel neu.",
      "Wiederhole 3-5 Mal pro Spielsession, dann beende die Session positiv.",
    ],
    stepsEn: [
      "Start a tug game with a toy the dog likes to hold.",
      "Hold a high-value treat in front of his nose and say \"Out\" — the game freezes (stop pulling).",
      "The instant he releases, mark and give the treat.",
      "Return the toy immediately and restart the game.",
      "Repeat 3-5 times per play session, then end the session positively.",
    ],
    mistakesDe: [
      "Das Spielzeug nach dem \"Aus\" wegnehmen — der Hund lernt: Loslassen beendet den Spaß, und lässt beim nächsten Mal schwerer los.",
      "Am Spielzeug zerren während man \"Aus\" sagt — das macht es zum Wettkampf statt zur kooperativen Übung.",
      "Minderwertige Leckerli nutzen — der Tausch muss sich für den Hund lohnen, sonst ignoriert er das Angebot.",
    ],
    mistakesEn: [
      "Taking the toy away after \"Out\" — the dog learns: releasing ends the fun, and he holds on harder next time.",
      "Pulling on the toy while saying \"Out\" — this makes it a competition instead of a cooperative exercise.",
      "Using low-value treats — the trade must be worthwhile for the dog, otherwise he ignores the offer.",
    ],
    progressionDe:
      "Tausch mit Leckerli → Tausch ohne sichtbares Leckerli (aus der Tasche) → nur Markerwort + Spiel geht weiter → \"Aus\" auf Distanz → \"Aus\" mit hochwertigem Spielzeug → \"Aus\" mit gefundenem Gegenstand draußen.",
    progressionEn:
      "Trade with treat → trade without visible treat (from pocket) → marker word only + game continues → \"Out\" at distance → \"Out\" with high-value toy → \"Out\" with found object outdoors.",
    proTipDe:
      "Achte auf ein 80/20-Verhältnis: In 80% der Fälle bekommt der Hund das Spielzeug zurück. So bleibt Loslassen positiv besetzt. Die 20% ohne Rückgabe sorgen dafür, dass er auch echte Abbrüche akzeptiert.",
    proTipEn:
      "Aim for an 80/20 ratio: 80% of the time the dog gets the toy back. This keeps releasing positively charged. The 20% without return ensures he also accepts real stops.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 14,
    methodology: "luring",
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
    stepsDe: [
      "Bringe den Hund neben dem Auto ins Sitz, die Hand an der Türklinke.",
      "Öffne die Tür langsam — bewegt sich der Hund, schließe die Tür sofort wieder.",
      "Bleibt er sitzen, öffne die Tür vollständig.",
      "Gib ein klares Freigabe-Signal (\"Hopp!\" oder \"Einsteigen!\") zum Einspringen.",
      "Übe dasselbe Muster beim Aussteigen: Tür öffnen → Hund wartet → Freigabe → Aussteigen.",
    ],
    stepsEn: [
      "Cue the dog into a sit next to the car, your hand on the door handle.",
      "Open the door slowly — if the dog moves, close the door immediately.",
      "If he stays sitting, open the door fully.",
      "Give a clear release cue (\"Hop!\" or \"Load up!\") to jump in.",
      "Practice the same pattern when exiting: open door → dog waits → release → exit.",
    ],
    mistakesDe: [
      "Das Warten nur beim Einsteigen üben — Aussteigen ist sicherheitskritischer (Straßenverkehr).",
      "Den Hund an der Leine ins Auto zerren — er soll freiwillig und kontrolliert einsteigen.",
      "Bei Eile das Ritual überspringen — Inkonsistenz zerstört wochen­langes Training in Sekunden.",
    ],
    mistakesEn: [
      "Practicing only when getting in — exiting is more safety-critical (traffic).",
      "Pulling the dog into the car on the leash — he should enter voluntarily and in a controlled manner.",
      "Skipping the ritual when in a hurry — inconsistency destroys weeks of training in seconds.",
    ],
    progressionDe:
      "Tür 5 cm öffnen → halb offen → ganz offen → ganz offen + 2 Sek. → Aussteige-Ritual einführen → an verschiedenen Parkplätzen üben → mit Ablenkung (andere Hunde, Verkehr).",
    progressionEn:
      "Open door 5 cm → half open → fully open → fully open + 2 sec → introduce exit ritual → practice in different parking lots → with distractions (other dogs, traffic).",
    proTipDe:
      "Übe zuerst am geparkten Auto ohne Zeitdruck. Wenn es im Alltag klappt, wird das Auto-Ritual zum sichersten Moment eures Tages — besonders wichtig für Hunde, die an der Straße leben.",
    proTipEn:
      "Practice first at a parked car with no time pressure. Once it works in daily life, the car ritual becomes the safest moment of your day — especially important for dogs living near roads.",
    durationMin: 3,
    frequencyPerDay: 2,
    estimatedDays: 14,
    methodology: "shaping",
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
    stepsDe: [
      "Zeige dem Hund ein Leckerli auf der offenen Handfläche.",
      "Geht er mit der Nase ran, schließe die Hand ruhig — kein Kommentar.",
      "Sobald er den Kopf zurücknimmt, öffne die Hand wieder.",
      "Wiederhole, bis er bei offener Hand bewusst Abstand hält.",
      "Füge Blickkontakt als neues Kriterium hinzu: Hand öffnet sich erst, wenn er dich ansieht.",
      "Belohne immer aus der anderen Hand, nicht von der offenen Handfläche.",
    ],
    stepsEn: [
      "Show the dog a treat on your open palm.",
      "If he moves toward it with his nose, calmly close your hand — no comment.",
      "As soon as he pulls his head back, open your hand again.",
      "Repeat until he deliberately keeps distance with the hand open.",
      "Add eye contact as a new criterion: the hand only opens when he looks at you.",
      "Always reward from the other hand, not from the open palm.",
    ],
    mistakesDe: [
      "Von der offenen Hand füttern — der Hund lernt dann, dass er doch an das Leckerli in der Hand kommt.",
      "Die Hand ruckartig zuschlagen — das erschreckt den Hund; die Bewegung soll ruhig und neutral sein.",
      "Das Blickkontakt-Kriterium zu früh einführen, bevor der Hund das Grundprinzip verstanden hat.",
    ],
    mistakesEn: [
      "Feeding from the open hand — the dog learns he can get the treat from that hand after all.",
      "Snapping the hand shut — this startles the dog; the motion should be calm and neutral.",
      "Introducing the eye-contact criterion too early, before the dog understands the basic principle.",
    ],
    progressionDe:
      "Geschlossene Faust → offene Hand → offene Hand am Knie → Leckerli auf dem Boden abgedeckt → Leckerli offen auf dem Boden → Leckerli auf dem Boden + Blickkontakt → mehrere Leckerli auf dem Boden.",
    progressionEn:
      "Closed fist → open palm → open hand at knee height → treat on floor covered → treat uncovered on floor → treat on floor + eye contact → multiple treats on floor.",
    proTipDe:
      "Dieses Spiel trainiert den Hund, Entscheidungen zu treffen statt nur Befehle auszuführen. Das ist die Grundlage für echte Impulskontrolle — er reguliert sich selbst, nicht weil du es sagst, sondern weil er versteht, dass es sich lohnt.",
    proTipEn:
      "This game trains the dog to make choices rather than just follow commands. That is the foundation of true impulse control — he regulates himself not because you say so, but because he understands it pays off.",
    durationMin: 3,
    frequencyPerDay: 3,
    estimatedDays: 10,
    methodology: "shaping",
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
    stepsDe: [
      "Platziere die Decke in Sichtweite der Haustür. Übe zuerst \"Geh auf die Decke\" ohne Klingel.",
      "Lasse eine zweite Person draußen klingeln, während du den Hund sofort zur Decke führst und dort belohnst.",
      "Wiederhole, bis der Hund nach dem Klingeln von selbst Richtung Decke orientiert.",
      "Steigere die Schwierigkeit: Klingel + Tür öffnen, Hund bleibt auf der Decke.",
      "Baue echte Besucher ein — anfangs nur kurz, dann mit Begrüßung.",
      "Belohne den Hund auf der Decke laufend mit hochwertigen Leckerli, während der Besuch hereinkommt.",
    ],
    stepsEn: [
      "Place the mat within sight of the front door. First practice \"Go to your mat\" without the doorbell.",
      "Have a second person ring outside while you immediately guide the dog to the mat and reward there.",
      "Repeat until the dog orients toward the mat on his own after the doorbell.",
      "Increase difficulty: doorbell + open the door, dog stays on the mat.",
      "Add real visitors — briefly at first, then with a greeting.",
      "Keep rewarding the dog on the mat with high-value treats while the visitor enters.",
    ],
    mistakesDe: [
      "Den Hund anschreien wenn er bellt — das steigert die Aufregung statt sie zu senken.",
      "Zu schnell echte Besucher einbauen, bevor die Klingel-Decke-Verknüpfung sitzt.",
      "Aufhören zu belohnen, sobald es einmal klappt — dieses Verhalten braucht wochenlange Festigung.",
    ],
    mistakesEn: [
      "Yelling at the dog when he barks — this increases arousal instead of reducing it.",
      "Adding real visitors too soon, before the doorbell-mat association is solid.",
      "Stopping rewards once it works — this behavior needs weeks of reinforcement.",
    ],
    progressionDe:
      "Klingel-Geräusch vom Handy → echte Klingel (selbst klingeln) → zweite Person klingelt → Tür öffnen ohne Besuch → Tür öffnen + bekannte Person → Tür öffnen + fremde Person → echter unangekündigter Besuch.",
    progressionEn:
      "Doorbell sound from phone → real doorbell (ring yourself) → second person rings → open door without visitor → open door + familiar person → open door + stranger → real unannounced visitor.",
    proTipDe:
      "Nutze ein Management-Setup parallel zum Training: Baby-Gate vor dem Flur oder Leine am Geschirr. So verhinderst du, dass der Hund unerwünschtes Verhalten übt, während du das neue Verhalten aufbaust.",
    proTipEn:
      "Use a management setup in parallel with training: baby gate in the hallway or leash on harness. This prevents the dog from rehearsing unwanted behavior while you build the new one.",
    durationMin: 10,
    frequencyPerDay: 2,
    estimatedDays: 42,
    methodology: "protocol",
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
    stepsDe: [
      "Zeige dem Hund ein Leckerli, lege es 1 Meter entfernt auf den Boden. Hund wartet im Sitz — nach 2 Sekunden Freigabe.",
      "Steigere die Wartezeit schrittweise: 5 Sekunden, 10, 20, 30.",
      "Wechsle die Belohnung: Spielzeug auf den Boden legen, Ball zeigen und warten.",
      "Erhöhe die Distanz: Leckerli 3 Meter entfernt, dann 5 Meter.",
      "Kombiniere: Hochwertiger Ball 5 Meter entfernt, 15 Sekunden Wartezeit, dann Freigabe.",
    ],
    stepsEn: [
      "Show the dog a treat, place it 1 meter away on the floor. Dog waits in a sit — release after 2 seconds.",
      "Gradually increase wait time: 5 seconds, 10, 20, 30.",
      "Vary the reward: place a toy on the floor, show a ball and wait.",
      "Increase distance: treat 3 meters away, then 5 meters.",
      "Combine: high-value ball 5 meters away, 15-second wait, then release.",
    ],
    mistakesDe: [
      "Immer die maximale Schwierigkeit verlangen — variiere zwischen leichten und schweren Durchgängen (80% Erfolgsquote anpeilen).",
      "Keine Freigabe geben und den Hund ewig warten lassen — das zerstört die Motivation und baut Frust auf.",
      "Nur eine Art Belohnung nutzen — der Hund muss lernen, mit verschiedenen Anreizen umzugehen.",
    ],
    mistakesEn: [
      "Always demanding maximum difficulty — vary between easy and hard trials (aim for 80% success rate).",
      "Not giving a release and making the dog wait forever — this destroys motivation and builds frustration.",
      "Using only one type of reward — the dog must learn to handle different incentives.",
    ],
    progressionDe:
      "Niedrigwertiges Leckerli nah + kurz → hochwertiges Leckerli nah + kurz → niedrigwertig fern + kurz → hochwertig fern + kurz → niedrigwertig nah + lang → hochwertig fern + lang → Ball/Spielzeug fern + lang.",
    progressionEn:
      "Low-value treat close + short → high-value treat close + short → low-value far + short → high-value far + short → low-value close + long → high-value far + long → ball/toy far + long.",
    proTipDe:
      "Frustrationstoleranz ist wie ein Muskel — sie ermüdet. Trainiere in kurzen Sessions und höre auf, wenn der Hund noch erfolgreich ist. Drei perfekte Durchgänge sind besser als zehn, bei denen er am Ende aufgibt.",
    proTipEn:
      "Frustration tolerance is like a muscle — it fatigues. Train in short sessions and stop while the dog is still succeeding. Three perfect reps are better than ten where he gives up at the end.",
    durationMin: 5,
    frequencyPerDay: 2,
    estimatedDays: 30,
    methodology: "shaping",
  },
]
