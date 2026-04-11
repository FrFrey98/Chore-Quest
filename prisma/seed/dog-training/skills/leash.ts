// prisma/seed/dog-training/skills/leash.ts
import type { SkillSeed } from "../types"

export const LEASH_SKILLS: SkillSeed[] = [
  {
    id: "harness_acceptance",
    categoryId: "leash",
    nameDe: "Geschirr akzeptieren",
    nameEn: "Harness Acceptance",
    descriptionDe:
      "Geschirr auf den Boden legen, jedes Interesse markern. Geschirr hochhalten, Nase durchstecken — Leckerli durch die Öffnung. Schrittweise Schließen mit Leckerli verknüpfen. Nie über den Kopf zwingen, wenn der Hund Angst zeigt.",
    descriptionEn:
      "Place the harness on the floor, mark any interest. Hold it up, thread a treat through the opening so the dog pokes his nose through. Gradually pair closing with treats. Never force over the head if the dog shows fear.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "",
    sortOrder: 1,
    stepsDe: [
      "Lege das Geschirr auf den Boden und lass den Hund in seinem Tempo schnuppern — markere und belohne jedes Interesse.",
      "Halte das Geschirr hoch und stecke ein Leckerli durch die Kopföffnung, sodass der Hund seine Nase freiwillig durchsteckt.",
      "Wiederhole das Durchstecken 5-10 Mal, bis der Hund die Öffnung aktiv sucht.",
      "Schließe das Geschirr für eine Sekunde, markere und belohne sofort, dann wieder öffnen.",
      "Verlängere die Tragezeit schrittweise: 5 Sekunden, 30 Sekunden, 2 Minuten — immer mit Leckerli verknüpfen.",
    ],
    stepsEn: [
      "Place the harness on the floor and let the dog sniff at his own pace — mark and reward any interest.",
      "Hold the harness up and thread a treat through the head opening so the dog voluntarily pokes his nose through.",
      "Repeat the nose-through motion 5-10 times until the dog actively seeks the opening.",
      "Close the harness for one second, mark and reward immediately, then remove it.",
      "Gradually extend wearing time: 5 seconds, 30 seconds, 2 minutes — always paired with treats.",
    ],
    mistakesDe: [
      "Das Geschirr über den Kopf zwingen — erzeugt Angst und der Hund wird sich künftig wehren.",
      "Zu schnell vorgehen und den Hund beim Schließen überfordern, bevor er das Durchstecken liebt.",
      "Geschirr nur vor dem Spaziergang anziehen — der Hund verknüpft es mit Aufregung statt Ruhe.",
    ],
    mistakesEn: [
      "Forcing the harness over the head — creates fear and the dog will resist in the future.",
      "Moving too fast and overwhelming the dog while closing before he loves the nose-through game.",
      "Only putting the harness on before walks — the dog associates it with excitement instead of calm.",
    ],
    progressionDe:
      "Starte mit dem Geschirr auf dem Boden. Dann Nase-durchstecken ohne Schließen. Dann Schließen für 1 Sekunde, 5 Sekunden, 30 Sekunden. Dann mit Geschirr im Haus herumlaufen. Erst wenn alles entspannt ist, die Leine einklinken.",
    progressionEn:
      "Start with the harness on the floor. Then nose-through without closing. Then close for 1 second, 5 seconds, 30 seconds. Then walk around the house wearing it. Only clip the leash on once everything is relaxed.",
    proTipDe:
      "Nutze das Geschirr-Anziehen als eigenständiges Kooperationssignal: Der Hund steckt seinen Kopf freiwillig durch und gibt damit sein Einverständnis. Dieses Cooperative-Care-Prinzip stärkt Vertrauen und macht den Hund zum aktiven Teilnehmer.",
    proTipEn:
      "Turn harnessing into a cooperative care signal: the dog voluntarily puts his head through, giving consent. This cooperative care principle builds trust and makes the dog an active participant.",
    durationMin: 3,
    frequencyPerDay: 4,
    estimatedDays: 5,
    methodology: "classical",
  },
  {
    id: "loose_leash",
    categoryId: "leash",
    nameDe: "Lockere Leine",
    nameEn: "Loose Leash Walking",
    descriptionDe:
      "Jeder Schritt mit durchhängender Leine wird markiert und belohnt. Bei straffer Leine stehenbleiben (Baum-Technik) oder Richtung wechseln. Der Hund lernt: Ziehen führt nirgendwohin, Mitgehen zahlt sich aus.",
    descriptionEn:
      "Every step with a slack leash is marked and rewarded. When the leash tightens, stop walking (tree technique) or change direction. The dog learns: pulling leads nowhere, walking with you pays off.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "name,watch_me",
    sortOrder: 2,
    stepsDe: [
      "Starte drinnen oder im Garten mit angeklinkter Leine — markere und belohne jeden Schritt, bei dem die Leine locker ist.",
      "Sobald die Leine straff wird: Werde zum Baum — stehe still, sage nichts, warte.",
      "Der Hund dreht sich um oder kommt zurück — in dem Moment markern und belohnen.",
      "Gehe weiter und wiederhole: lockere Leine = Fortbewegung, straffe Leine = Stillstand.",
      "Steigere die Strecke: erst 5 Schritte, dann 10, dann 20 ohne Zug.",
      "Übe in ablenkungsreicherer Umgebung, aber senke die Kriterien dort zunächst wieder ab.",
    ],
    stepsEn: [
      "Start indoors or in the garden with the leash clipped — mark and reward every step with a slack leash.",
      "The moment the leash tightens: become a tree — stand still, say nothing, wait.",
      "The dog turns back or comes to you — mark and reward that instant.",
      "Continue walking and repeat: loose leash = forward movement, tight leash = standstill.",
      "Increase the distance: first 5 steps, then 10, then 20 without pulling.",
      "Practice in more distracting environments, but lower the criteria there initially.",
    ],
    mistakesDe: [
      "Bei straffer Leine trotzdem weiterlaufen — der Hund lernt, dass Ziehen funktioniert und wird noch stärker ziehen.",
      "Inkonsistenz: mal Ziehen erlauben, mal nicht — der Hund kann keine klare Regel lernen.",
      "Zu lange Sessions ohne Erfolg — lieber 3 Minuten mit vielen Belohnungen als 20 Minuten Frustration.",
    ],
    mistakesEn: [
      "Continuing to walk when the leash is tight — the dog learns that pulling works and will pull harder.",
      "Being inconsistent: sometimes allowing pulling, sometimes not — the dog cannot learn a clear rule.",
      "Sessions that are too long without success — better 3 minutes with many rewards than 20 minutes of frustration.",
    ],
    progressionDe:
      "Beginne in reizarmer Umgebung (Flur, Garten). Steigere auf ruhige Wohnstraße, dann belebtere Straße. Reduziere die Belohnungsrate schrittweise von jedem Schritt auf alle 5, 10, 20 Schritte. Die Baum-Technik bleibt dauerhaft bestehen — auch erfahrene Hunde testen gelegentlich.",
    progressionEn:
      "Start in a low-distraction area (hallway, garden). Progress to a quiet residential street, then a busier street. Gradually reduce the reinforcement rate from every step to every 5, 10, 20 steps. The tree technique remains permanent — even experienced dogs test occasionally.",
    proTipDe:
      "Definiere eine Belohnungszone: ein imaginärer Kreis von 50 cm um deine linke Hüfte. Alles in dieser Zone wird markiert und belohnt. Der Hund lernt, dass sich dieser Bereich lohnt, und orientiert sich magnetisch dorthin. Das ist effektiver als jede Korrektur.",
    proTipEn:
      "Define a reward zone: an imaginary 50 cm circle around your left hip. Everything inside this zone gets marked and rewarded. The dog learns this area pays off and gravitates toward it magnetically. This is more effective than any correction.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 21,
    methodology: "shaping",
  },
  {
    id: "curb_stop",
    categoryId: "leash",
    nameDe: "Warten am Bordstein",
    nameEn: "Curb Stop",
    descriptionDe:
      "Am Bordstein automatisch Sitz, bevor es weitergeht. Signal wird mit der Zeit vom Bordstein selbst übernommen. Sicherheit im Stadtverkehr.",
    descriptionEn:
      "At every curb, automatic sit before continuing. Over time the cue transfers to the curb itself. A city safety skill.",
    difficulty: "beginner",
    phase: "puppy",
    prerequisiteIds: "sit,stay",
    sortOrder: 3,
    stepsDe: [
      "Gehe mit dem Hund an der Leine zum Bordstein und bleibe stehen.",
      "Gib das Sitz-Signal und warte, bis der Hund sitzt — markere und belohne.",
      "Warte 2-3 Sekunden, dann gib ein Auflösesignal und gehe weiter.",
      "Wiederhole an jedem Bordstein auf dem Spaziergang — Konsistenz ist entscheidend.",
      "Reduziere das Sitz-Signal schrittweise: Der Bordstein selbst wird zum Auslöser.",
    ],
    stepsEn: [
      "Walk the dog on leash to a curb and stop.",
      "Give the sit cue and wait until the dog sits — mark and reward.",
      "Wait 2-3 seconds, then give a release cue and continue walking.",
      "Repeat at every curb during the walk — consistency is key.",
      "Gradually fade the sit cue: the curb itself becomes the trigger.",
    ],
    mistakesDe: [
      "Nicht an jedem Bordstein üben — der Hund lernt dann, dass es optional ist.",
      "Zu schnell weitergehen, bevor der Hund sitzt — der Hund lernt, dass Sitzen nicht nötig ist.",
    ],
    mistakesEn: [
      "Not practicing at every curb — the dog learns it is optional.",
      "Moving on too quickly before the dog sits — the dog learns that sitting is unnecessary.",
    ],
    progressionDe:
      "Starte an ruhigen Bordsteinen in der Wohnstraße. Steigere auf belebtere Kreuzungen. Fading des verbalen Signals: erst normales Sitz-Signal, dann nur noch Stehenbleiben, schließlich sitzt der Hund automatisch. Ziel: Der Hund setzt sich selbstständig an jedem Bordstein.",
    progressionEn:
      "Start at quiet curbs on residential streets. Progress to busier intersections. Fade the verbal cue: first a normal sit cue, then just stopping, finally the dog sits automatically. Goal: the dog sits independently at every curb.",
    proTipDe:
      "Nutze diese Übung als eingebautes Impulskontroll-Training auf jedem Spaziergang. Der Bordstein wird zum kontextuellen Hinweisreiz (contextual cue), der automatisch ruhiges Verhalten auslöst — ganz ohne dein Zutun.",
    proTipEn:
      "Use this exercise as built-in impulse control training on every walk. The curb becomes a contextual cue that automatically triggers calm behavior — without any input from you.",
    durationMin: 2,
    frequencyPerDay: 3,
    estimatedDays: 14,
    methodology: "capturing",
  },
  {
    id: "heel_position",
    categoryId: "leash",
    nameDe: "Fuß-Position",
    nameEn: "Heel Position",
    descriptionDe:
      "Hund steht an deiner linken Hüfte, Schulter auf Höhe deines Knies. Leckerli-Lure an der Hüfte halten. Jede Sekunde korrekter Position markern und belohnen. Fundament für Bei Fuß gehen.",
    descriptionEn:
      "Dog stands at your left hip, shoulder at knee level. Hold a treat lure at your hip. Mark and reward every second of correct position. Foundation for formal heeling.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "loose_leash",
    sortOrder: 4,
    stepsDe: [
      "Halte ein Leckerli in der linken Hand an deiner Hüfte und locke den Hund in die Fußposition.",
      "Sobald der Hund korrekt an deiner linken Seite steht (Schulter auf Kniehöhe), markere und belohne.",
      "Halte die Position 1-2 Sekunden, markere erneut und belohne.",
      "Steigere die Dauer schrittweise: 3 Sekunden, 5 Sekunden, 10 Sekunden.",
      "Führe das Signalwort \"Fuß\" ein, kurz bevor du den Hund in Position lockst.",
      "Reduziere das Luring schrittweise zu einem kleinen Handzeichen an der Hüfte.",
    ],
    stepsEn: [
      "Hold a treat in your left hand at your hip and lure the dog into heel position.",
      "As soon as the dog stands correctly at your left side (shoulder at knee height), mark and reward.",
      "Hold the position for 1-2 seconds, mark again and reward.",
      "Gradually increase duration: 3 seconds, 5 seconds, 10 seconds.",
      "Introduce the cue word 'Heel' just before luring the dog into position.",
      "Gradually fade the lure into a small hand signal at your hip.",
    ],
    mistakesDe: [
      "Zu lange Sessions — die Fußposition ist anstrengend für den Hund, lieber viele kurze Durchgänge.",
      "Belohnung von oben reichen statt an der Hüfte — der Hund springt hoch statt in Position zu bleiben.",
      "Zu schnell vom Lure zum Signal wechseln, bevor die Position zuverlässig ist.",
    ],
    mistakesEn: [
      "Sessions that are too long — heel position is demanding for the dog, prefer many short repetitions.",
      "Delivering the reward from above instead of at the hip — the dog jumps up instead of staying in position.",
      "Switching from lure to cue too quickly before the position is reliable.",
    ],
    progressionDe:
      "Starte mit statischer Position im Stehen. Dann Position nach einem Schritt halten. Dann nach 2-3 Schritten. Die Fußposition ist erst ein Standbild, dann ein kurzer Film. Duration vor Distance, Distance vor Distraction.",
    progressionEn:
      "Start with a static standing position. Then hold position after one step. Then after 2-3 steps. Heel position is first a snapshot, then a short movie. Duration before distance, distance before distraction.",
    proTipDe:
      "Übe die Fußposition unabhängig vom Spaziergang als kurzes Spiel im Wohnzimmer. So verknüpft der Hund die Position mit Spaß statt mit dem Stress des Draußenseins. 10 Sekunden perfekte Position sind wertvoller als 2 Minuten schlampige.",
    proTipEn:
      "Practice heel position independently from walks as a short game in the living room. This way the dog associates the position with fun rather than the stress of being outside. 10 seconds of perfect position are more valuable than 2 minutes of sloppy heeling.",
    durationMin: 3,
    frequencyPerDay: 4,
    estimatedDays: 14,
    methodology: "luring",
  },
  {
    id: "heel_walking",
    categoryId: "leash",
    nameDe: "Bei Fuß gehen",
    nameEn: "Heel Walking",
    descriptionDe:
      "Aus der Fußposition Schritte aufbauen. Hoher Belohnungssatz (alle 2-3 Schritte am Anfang). Signalwort \"Fuß\" einführen. Für Labradoodles hohe Ablenkbarkeit — lieber kürzere Sessions mit hoher Belohnungsrate.",
    descriptionEn:
      "Build steps out of the heel position. High reinforcement rate (every 2-3 steps initially). Add the cue \"Heel.\" For easily distracted breeds, prefer shorter sessions with a higher reinforcement rate.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "heel_position",
    sortOrder: 5,
    stepsDe: [
      "Bringe den Hund in die Fußposition, sage \"Fuß\" und mache einen Schritt — markere und belohne.",
      "Steigere auf 2 Schritte, dann 3, dann 5 — immer mit Marker und Belohnung am Ende.",
      "Variiere die Schrittanzahl, damit der Hund nicht vorhersagen kann, wann die Belohnung kommt.",
      "Baue leichte Richtungswechsel ein (90°-Kurven), um die Aufmerksamkeit zu halten.",
      "Übe kurze Sequenzen (30 Sekunden), dann gib ein Auflösesignal zum Schnüffeln.",
    ],
    stepsEn: [
      "Put the dog in heel position, say 'Heel' and take one step — mark and reward.",
      "Increase to 2 steps, then 3, then 5 — always with a marker and reward at the end.",
      "Vary the number of steps so the dog cannot predict when the reward comes.",
      "Add gentle direction changes (90° turns) to maintain focus.",
      "Practice short sequences (30 seconds), then give a release cue for sniffing.",
    ],
    mistakesDe: [
      "Zu viele Schritte zu schnell fordern — der Hund driftet ab und das Kriterium verwässert.",
      "Kein Auflösesignal verwenden — der Hund weiß nicht, wann Bei Fuß vorbei ist, und wird unzuverlässig.",
      "Immer die gleiche Strecke üben — der Hund lernt die Route statt das Verhalten.",
    ],
    mistakesEn: [
      "Demanding too many steps too quickly — the dog drifts and the criteria erode.",
      "Not using a release cue — the dog does not know when heeling is over and becomes unreliable.",
      "Always practicing the same route — the dog learns the route instead of the behavior.",
    ],
    progressionDe:
      "Starte mit 1-3 Schritten im ruhigen Raum. Steigere auf 5-10 Schritte. Dann im Garten, dann auf der Straße. Bei-Fuß-Gehen ist ein Präzisionsverhalten — nutze es gezielt für kurze Strecken (z. B. an einer Straße), nicht als Dauerzustand auf dem ganzen Spaziergang.",
    progressionEn:
      "Start with 1-3 steps in a quiet room. Progress to 5-10 steps. Then in the garden, then on the street. Heel walking is a precision behavior — use it deliberately for short stretches (e.g., along a road), not as a permanent state for the entire walk.",
    proTipDe:
      "Trenne Leinengehen und Bei-Fuß-Gehen bewusst: Lockere Leine ist der Normalzustand, Bei Fuß ist ein Präzisionsmodus auf Signal. So bleibt Bei Fuß wertvoll und der Hund weiß genau, wann hohe Konzentration gefragt ist.",
    proTipEn:
      "Consciously separate loose leash walking and heel walking: loose leash is the default, heeling is a precision mode on cue. This keeps heeling valuable and the dog knows exactly when high focus is required.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 28,
    methodology: "chaining",
  },
  {
    id: "u_turn_leash",
    categoryId: "leash",
    nameDe: "Richtungswechsel",
    nameEn: "U-Turn on Leash",
    descriptionDe:
      "\"Komm\" oder eigenes Signal, gleichzeitig 180° drehen, Hund mit Leckerli-Lure mitziehen. Belohnen nach der Drehung. Sehr nützlich bei Trigger-Begegnungen auf dem Spaziergang.",
    descriptionEn:
      "Say \"Come\" or your own cue while making a 180° turn, luring the dog with a treat. Reward after the turn. Very useful for avoiding trigger encounters on walks.",
    difficulty: "intermediate",
    phase: "adolescent",
    prerequisiteIds: "loose_leash",
    sortOrder: 6,
    stepsDe: [
      "Sage dein Signal (z. B. \"Wende\") und drehe dich gleichzeitig 180° von deinem Hund weg.",
      "Halte ein Leckerli an deiner Hüfte, um den Hund durch die Drehung mitzuführen.",
      "Sobald der Hund die Drehung mitmacht und neben dir ist, markere und belohne.",
      "Übe in beide Richtungen — die Drehung weg vom Hund (Außendrehung) ist am nützlichsten.",
      "Steigere das Tempo schrittweise: erst langsam, dann in normalem Gehtempo.",
    ],
    stepsEn: [
      "Say your cue (e.g., 'Turn') and simultaneously make a 180° turn away from your dog.",
      "Hold a treat at your hip to guide the dog through the turn.",
      "As soon as the dog completes the turn and is beside you, mark and reward.",
      "Practice in both directions — the turn away from the dog (outside turn) is most useful.",
      "Gradually increase pace: first slowly, then at normal walking speed.",
    ],
    mistakesDe: [
      "An der Leine rucken statt den Hund mit Leckerli zu locken — erzeugt Widerstand und Stress.",
      "Das Signal zu spät geben, wenn der Trigger schon zu nah ist — der Hund ist dann bereits über der Reizschwelle.",
    ],
    mistakesEn: [
      "Jerking the leash instead of luring with a treat — creates resistance and stress.",
      "Giving the cue too late when the trigger is already too close — the dog is already over threshold.",
    ],
    progressionDe:
      "Starte ohne Auslöser in ruhiger Umgebung, bis die Drehung flüssig sitzt. Dann in leicht ablenkender Umgebung. Schließlich als Notfall-Werkzeug bei echten Trigger-Begegnungen einsetzen. Ziel: Der Hund dreht sich bei dem Signal sofort fröhlich um.",
    progressionEn:
      "Start without triggers in a calm environment until the turn is smooth. Then in mildly distracting settings. Finally deploy as an emergency tool during real trigger encounters. Goal: the dog turns around happily and immediately on cue.",
    proTipDe:
      "Der U-Turn ist das wichtigste Management-Werkzeug für reaktive Hunde. Übe ihn so oft in neutraler Umgebung, dass er ein Automatismus wird. Im Ernstfall hast du keine Zeit zum Nachdenken — die Drehung muss für beide Seiten Muskelgedächtnis sein.",
    proTipEn:
      "The U-turn is the single most important management tool for reactive dogs. Practice it so often in neutral settings that it becomes automatic. In a real situation you have no time to think — the turn must be muscle memory for both of you.",
    durationMin: 5,
    frequencyPerDay: 3,
    estimatedDays: 10,
    methodology: "luring",
  },
  {
    id: "leash_greeting",
    categoryId: "leash",
    nameDe: "Begegnung an der Leine",
    nameEn: "Leash Greeting",
    descriptionDe:
      "Anderen Hund an der Leine passieren — nicht grüßen, sondern vorbeigehen. Schau-Signal nutzen, um Aufmerksamkeit zu halten. Belohnen für ruhiges Vorbeigehen. Vermeidet Leinenaggression durch Frustration.",
    descriptionEn:
      "Passing another leashed dog — not greeting, just walking by. Use the watch-me cue to hold attention. Reward calm passing. Prevents leash reactivity driven by frustration.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "loose_leash,watch_me",
    sortOrder: 7,
    stepsDe: [
      "Beginne mit großem Abstand (20-30 Meter) zu einem ruhigen Hund — markere und belohne jedes ruhige Hinschauen.",
      "Nutze das Schau-Signal, um die Aufmerksamkeit auf dich zu lenken, wenn der andere Hund sichtbar wird.",
      "Gehe in einem Bogen am anderen Hund vorbei und belohne kontinuierlich für lockere Leine und Aufmerksamkeit.",
      "Reduziere den Abstand schrittweise über viele Sessions — nur wenn der Hund unter der Reizschwelle bleibt.",
      "Übe mit verschiedenen Hunden unterschiedlicher Größe und Energie, um Generalisierung zu fördern.",
    ],
    stepsEn: [
      "Start at a large distance (20-30 meters) from a calm dog — mark and reward any calm looking.",
      "Use the watch-me cue to redirect attention to you when the other dog becomes visible.",
      "Walk past the other dog in an arc and continuously reward for loose leash and attention.",
      "Gradually reduce the distance over many sessions — only if the dog stays under threshold.",
      "Practice with different dogs of varying size and energy to promote generalization.",
    ],
    mistakesDe: [
      "Frontal auf den anderen Hund zugehen — das erzeugt Konfrontation. Immer in einem Bogen passieren.",
      "Den Hund an der kurzen Leine festhalten und die Leine spannen — überträgt deine Anspannung und erhöht die Frustration.",
      "Begegnungen an der Leine als Begrüßungs-Gelegenheit nutzen — Leinenbegegnungen sind zum Vorbeigehen da.",
    ],
    mistakesEn: [
      "Walking directly toward the other dog — this creates confrontation. Always pass in an arc.",
      "Holding the dog on a tight, short leash — transfers your tension and increases frustration.",
      "Using leash encounters as greeting opportunities — on-leash encounters are for passing, not socializing.",
    ],
    progressionDe:
      "Starte auf 30 Metern Abstand mit einem bekannten, ruhigen Hund. Reduziere auf 20, 15, 10, 5 Meter. Dann mit unbekannten Hunden. Dann in engeren Situationen (Gehweg). Das Ziel ist nicht Kontakt, sondern entspanntes Vorbeigehen — das schützt vor Leinenaggression.",
    progressionEn:
      "Start at 30 meters distance with a familiar, calm dog. Reduce to 20, 15, 10, 5 meters. Then with unfamiliar dogs. Then in tighter spaces (sidewalk). The goal is not contact but relaxed passing — this prevents leash reactivity.",
    proTipDe:
      "Leinenbegegnungen sind die häufigste Ursache für Leinenreaktivität. Verhindere das Problem, bevor es entsteht: Jede entspannte Begegnung ohne Kontakt ist ein Trainingsgewinn. Der Hund lernt, dass andere Hunde keine große Sache sind — und das ist genau, was du willst.",
    proTipEn:
      "On-leash encounters are the most common cause of leash reactivity. Prevent the problem before it starts: every calm encounter without contact is a training win. The dog learns that other dogs are no big deal — and that is exactly what you want.",
    durationMin: 10,
    frequencyPerDay: 2,
    estimatedDays: 42,
    methodology: "protocol",
  },
  {
    id: "crowd_walking",
    categoryId: "leash",
    nameDe: "Gehen in der Menschenmenge",
    nameEn: "Walking in Crowds",
    descriptionDe:
      "Belebte Straßen, Märkte, Fußgängerzonen. Hund lernt, auch in stark ablenkender Umgebung an der lockeren Leine zu bleiben. Kurze Sessions am Anfang, hohe Belohnungsrate, Positiv-Ende.",
    descriptionEn:
      "Busy streets, markets, pedestrian zones. The dog learns to maintain a loose leash in highly distracting environments. Short sessions at first, high reinforcement rate, positive ending.",
    difficulty: "advanced",
    phase: "adult",
    prerequisiteIds: "heel_walking,watch_me",
    sortOrder: 8,
    stepsDe: [
      "Starte am Rand einer belebten Zone, nicht mitten drin — beobachte aus der Distanz und belohne ruhiges Verhalten.",
      "Gehe langsam 10-20 Meter in die belebtere Zone hinein, markere und belohne ständig für lockere Leine.",
      "Bei Überforderung (Hund zieht, hechelt, wird hektisch): sofort rausgehen und in ruhigerer Zone belohnen.",
      "Steigere die Dauer schrittweise: erst 1 Minute, dann 3, dann 5 Minuten in der Menschenmenge.",
      "Übe an verschiedenen Orten (Markt, Fußgängerzone, Bahnhof), um Generalisierung zu fördern.",
    ],
    stepsEn: [
      "Start at the edge of a busy area, not in the middle — observe from a distance and reward calm behavior.",
      "Slowly walk 10-20 meters into the busier zone, continuously marking and rewarding for loose leash.",
      "If overwhelmed (dog pulls, pants, becomes hectic): immediately leave and reward in a quieter zone.",
      "Gradually increase duration: first 1 minute, then 3, then 5 minutes in the crowd.",
      "Practice in different locations (market, pedestrian zone, train station) to promote generalization.",
    ],
    mistakesDe: [
      "Direkt ins Gedränge gehen ohne Aufbau — Reizüberflutung führt zu Panik oder Übersprungsverhalten.",
      "Zu niedrige Belohnungsrate in der Menschenmenge — der Hund sucht sich eigene Verstärker (Essensreste, Menschen anspringen).",
      "Kein positives Ende einplanen — immer aufhören, solange der Hund noch gut drauf ist.",
    ],
    mistakesEn: [
      "Going straight into a crowd without buildup — sensory overload leads to panic or displacement behavior.",
      "Reinforcement rate too low in the crowd — the dog finds his own reinforcers (food scraps, jumping on people).",
      "Not planning a positive ending — always stop while the dog is still doing well.",
    ],
    progressionDe:
      "Starte am Rand einer mäßig belebten Straße für 1 Minute. Steigere auf belebtere Orte und längere Zeiten. Variiere die Tageszeiten (morgens ruhiger, nachmittags voller). Das Ziel ist ein entspannter Hund, der Menschenmengen als normal empfindet — nicht als bedrohlich oder aufregend.",
    progressionEn:
      "Start at the edge of a moderately busy street for 1 minute. Progress to busier locations and longer durations. Vary the time of day (mornings are calmer, afternoons busier). The goal is a relaxed dog who perceives crowds as normal — neither threatening nor exciting.",
    proTipDe:
      "Nutze den 80/20-Ansatz: 80 % des Spaziergangs ist entspanntes Leinengehen, nur 20 % ist gezielte Menschenmenge-Exposition. Beende jede Session mit einer Schnüffel-Pause an einem ruhigen Ort — Schnüffeln senkt den Cortisolspiegel und hilft dem Hund, das Erlebte zu verarbeiten.",
    proTipEn:
      "Use the 80/20 approach: 80% of the walk is relaxed leash walking, only 20% is deliberate crowd exposure. End each session with a sniffing break in a quiet spot — sniffing lowers cortisol levels and helps the dog process the experience.",
    durationMin: 10,
    frequencyPerDay: 1,
    estimatedDays: 35,
    methodology: "shaping",
  },
]
