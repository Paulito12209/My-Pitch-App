// ─────────────────────────────────────────────────────────────────────────
//  Flatpay Pitch Trainer · Gesprächs-Engine (Simulation)
//
//  Logischer Trichter über 5 Phasen, mit Teilschritten – abgestimmt auf das
//  Trainer-Feedback:
//    • Locker & positiv, NICHT zu früh „von Flatpay" reden – der Name +
//      Terminvorschlag kommen erst im Abschluss.
//    • Natürlicher Einstieg: Begrüßung → „Kann man mit Karte zahlen?" →
//      „Bei welchem Anbieter?" → Pain platzieren → Termin.
//    • Wenige offene Ja/Nein-Fragen; lieber annehmende Aussagen, die den
//      Kunden führen, statt ihm Ausstiege anzubieten.
//
//    1. Begrüßung    – Entscheider erreichen, locker rein, zur Kartenfrage
//    2. Kontaktieren – „mit Karte zahlen?" + Anbieter erfragen
//    3. Informieren  – Pain annehmend platzieren + Erfassung + Umsatz
//    4. Argumentieren– Zusammenfassen (Ja-Kette) + Nutzen, ohne Druck
//    5. Terminieren  – JETZT Flatpay nennen + Termin; Einwände charmant auf
//                      den Vor-Ort-Termin lenken
// ─────────────────────────────────────────────────────────────────────────

export type Status = 'ja' | 'jaaber' | 'nein'
export type CustomerType = 'inhaber' | 'mitarbeiter'

export interface Turn {
  speaker: string
  customer: string
  status: Status
  response: string
  hint: string
}

export const PHASES = [
  'Begrüßung',
  'Kontaktieren',
  'Informieren',
  'Argumentieren',
  'Terminieren',
] as const

export type PhaseName = (typeof PHASES)[number]

export interface PhaseScript {
  name: PhaseName
  steps: Turn[]
}

export interface Conversation {
  customerType: CustomerType
  provider: string
  phases: PhaseScript[]
}

export const STATUS_LABEL: Record<Status, string> = {
  ja: 'Grünes Licht',
  jaaber: 'Ja, aber …',
  nein: 'Abblocken',
}

export const OPENING = 'Schönen guten Tag, spreche ich gerade mit dem Inhaber?'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Anbieter inkl. Pain Point (passt in „… zahlt bei {name} {pain}") ────────
const PROVIDERS: { name: string; pain: string }[] = [
  { name: 'Payone', pain: 'noch Gerätemiete plus gestaffelte Gebühren auf jede Karte' },
  { name: 'Sparkasse', pain: 'gestaffelte Sätze je Kartentyp und obendrauf noch Gerätemiete' },
  { name: 'SumUp', pain: 'die Geräte extra und für jede Zahlung eine prozentuale Gebühr' },
  { name: 'TeleCash', pain: 'unterschiedliche Sätze je Karte plus extra Kosten pro Transaktion' },
  { name: 'Vert', pain: 'unterschiedliche Sätze auf EC-, Kredit- und Auslandskarten plus Gerätemiete' },
  { name: 'Nexi', pain: 'noch Gerätemiete plus separate Gebühren auf Kredit- und Auslandskarten' },
]

// ── Phase 1 · Begrüßung (locker rein, noch kein Flatpay) ────────────────────
function buildBegruessung(type: CustomerType): Turn[] {
  if (type === 'inhaber') {
    return [
      pick<Turn>([
        {
          speaker: 'Inhaber',
          customer: 'Ja, am Apparat.',
          status: 'ja',
          response:
            'Schönen guten Tag! 😊 Schön, dass ich Sie direkt erreiche. Ganz kurz – kann man bei Ihnen eigentlich mit Karte zahlen?',
          hint: 'Locker & positiv rein – noch NICHT von Flatpay reden. Direkt zur Kartenfrage.',
        },
        {
          speaker: 'Inhaber',
          customer: 'Ja, der bin ich. Worum geht’s denn?',
          status: 'nein',
          response:
            'Mein Name ist Paul von Flatpay – wir helfen Läden, bei der Kartenzahlung Gebühren zu sparen. 😊 Aber sagen Sie kurz: kann man bei Ihnen denn mit Karte zahlen?',
          hint: 'Wenn direkt gefragt: kurz & ehrlich vorstellen (Name + Nutzen) – aber NICHT gleich den ganzen Termin-Pitch.',
        },
      ]),
    ]
  }
  return [
    pick<Turn>([
      {
        speaker: 'Mitarbeiter:in',
        customer: 'Der Chef ist gerade nicht am Telefon. Worum geht’s?',
        status: 'jaaber',
        response:
          'Kein Thema! 😊 Ist er vielleicht gleich kurz erreichbar – oder sagen Sie mir, wann ich ihn am besten erwische?',
        hint: 'Freundlich zum Inhaber lotsen, nichts beim Mitarbeiter verkaufen.',
      },
      {
        speaker: 'Mitarbeiter:in',
        customer: 'Ich bin nur Angestellte:r, das macht der Chef.',
        status: 'jaaber',
        response:
          'Alles gut! 😊 Dann stellen Sie mich am besten kurz durch – ist der Chef gerade da? Dauert wirklich nur einen Moment.',
        hint: 'Locker bleiben, gezielt zum Entscheider.',
      },
    ]),
    {
      speaker: 'Inhaber',
      customer: 'Ja, hallo? Was gibt’s?',
      status: 'ja',
      response:
        'Schönen guten Tag! 😊 Schön, dass es klappt. Ganz kurz – kann man bei Ihnen eigentlich mit Karte zahlen?',
      hint: 'Neu & locker starten, direkt in die Kartenfrage – noch kein Flatpay.',
    },
  ]
}

// ── Phase 2 · Kontaktieren (Karte? + Anbieter) ──────────────────────────────
function buildKontaktieren(provider: string): Turn[] {
  const cardYes = pick<Turn>([
    {
      speaker: 'Inhaber',
      customer: 'Ja, klar – EC und Kreditkarte.',
      status: 'ja',
      response: 'Super! 😊 Und bei welchem Anbieter seid ihr da aktuell?',
      hint: 'Positiv bestätigen, offene Frage nach dem Anbieter – die ist nötig.',
    },
    {
      speaker: 'Inhaber',
      customer: 'Ja, natürlich kann man hier mit Karte zahlen.',
      status: 'ja',
      response: 'Perfekt! 😊 Und mit wem arbeitet ihr da aktuell zusammen?',
      hint: 'Kurz loben, dann sauber zur Anbieterfrage.',
    },
  ])

  const named: Turn = {
    speaker: 'Inhaber',
    customer: `Aktuell sind wir bei ${provider}.`,
    status: 'ja',
    response: `Ah, ${provider} – kenn ich gut! 😊 Dann zahlt ihr da bestimmt noch Gerätemiete und auf jede Karte unterschiedliche Gebühren, oder?`,
    hint: 'Anbieter aufgreifen und mit einer Annahme den Pain platzieren – kein offenes Ja/Nein-Risiko.',
  }

  return [cardYes, named]
}

// ── Phase 3 · Informieren (annehmend, wenige Fragen) ────────────────────────
function buildInformieren(): Turn[] {
  return [
    {
      speaker: 'Inhaber',
      customer: pick([
        'Ja, kann gut sein.',
        'Ehrlich gesagt weiß ich’s gar nicht so genau.',
      ]),
      status: 'jaaber',
      response:
        'Dachte ich mir. 😊 Und die Beträge tippt ihr von Hand ins Gerät ein, richtig?',
      hint: 'Annahme bestätigen lassen, dann die Erfassung annehmend abklopfen.',
    },
    {
      speaker: 'Inhaber',
      customer: pick(['Ja, von Hand.', 'Genau, alles manuell.']),
      status: 'ja',
      response:
        'Perfekt. Und wie viel macht ihr so im Monat über Karte – ganz grob?',
      hint: 'Umsatz ist die nötige Basis für den Vergleich – ruhig und beiläufig fragen.',
    },
  ]
}

// ── Phase 4 · Argumentieren (Zusammenfassen + Nutzen, ohne Druck) ───────────
function buildArgumentieren(provider: string, pain: string): Turn[] {
  const revenue = pick(['So um die 12.000 im Monat', 'Grob 20.000', 'Vielleicht 8.000'])
  const objection = pick([
    'Aber wechseln will ich eigentlich nicht',
    'Aber so richtig Zeit für sowas hab ich nicht',
    'Klingt aber erstmal nach Aufwand',
  ])

  const summarize: Turn = {
    speaker: 'Inhaber',
    customer: `${revenue}. ${objection}.`,
    status: 'jaaber',
    response: `Verstehe ich total – und müssen Sie auch gar nicht sofort. 😊 Ich fass nur kurz zusammen: Ihr tippt von Hand ein und zahlt bei ${provider} ${pain}. Bei dem Umsatz zahlt man da gut drauf – und genau da gäb’s eine Möglichkeit ganz ohne Gerätemiete und mit einem glatten, fairen Satz.`,
    hint: 'Zusammenfassen (Ja-Kette) + Pain + Nutzen, ganz ohne Druck. Noch kein Flatpay-Name.',
  }

  const bridge: Turn = {
    speaker: 'Inhaber',
    customer: pick([
      'Hm, klingt erstmal nicht verkehrt.',
      'Na gut, erzählen Sie mal.',
      'Okay, das hört sich interessant an.',
    ]),
    status: 'jaaber',
    response:
      'Klasse! 😊 Am besten rechnet euch das mein Kollege einfach mal in Ruhe direkt vor Ort durch – komplett kostenlos und unverbindlich.',
    hint: 'Sanft zum Vor-Ort-Termin überleiten – KEINE Ja/Nein-Frage, die ein Nein einlädt.',
  }

  return [summarize, bridge]
}

// ── Phase 5 · Terminieren (jetzt Flatpay + Termin; Einwände → Vor Ort) ──────
function buildTerminieren(): Turn[] {
  const open: Turn = {
    speaker: 'Inhaber',
    customer: pick(['Und wie läuft das jetzt genau?', 'Okay, und was heißt das konkret?']),
    status: 'ja',
    response:
      'Ja, ich bin Paul von Flatpay. 😊 Mein Kollege wäre am Montag um 15 Uhr bei euch in [Ort in der Nähe] und wollte kurz vorbeikommen, um euch einen kostenlosen und unverbindlichen Preisvergleich anzubieten. Seid ihr Montag im Geschäft?',
    hint: 'JETZT erst Flatpay nennen – gleich mit dem konkreten Terminvorschlag.',
  }

  const close = pick<Turn>([
    {
      speaker: 'Inhaber',
      customer: 'Schicken Sie mir lieber erst mal was per Mail.',
      status: 'jaaber',
      response:
        'Klar, könnt ich machen – aber ehrlich, 😊 so eine Mail geht im Alltag schnell unter. Mein Kollege ist eh bei euch in der Gegend und zeigt’s euch in 10 Minuten persönlich – dann seht ihr sofort schwarz auf weiß, was sich lohnt. Passt Montag 15 Uhr?',
      hint: 'Mail charmant abwehren, klar auf den persönlichen Vor-Ort-Termin lenken.',
    },
    {
      speaker: 'Inhaber',
      customer: 'Können wir das nicht einfach telefonisch machen?',
      status: 'jaaber',
      response:
        'Versteh ich! 😊 Aber gerade vor Ort holt mein Kollege bei den Konditionen einfach mehr für euch raus – persönlich verhandelt sich’s viel besser als am Telefon, und kosten tut’s euch ja nichts. Montag 15 Uhr seid ihr doch im Laden, oder?',
      hint: 'Kein Telefon-Termin – charmant auf Vor Ort lenken (bessere Verhandlung, bessere Konditionen).',
    },
    {
      speaker: 'Inhaber',
      customer: 'Ja, Montag passt.',
      status: 'ja',
      response:
        'Perfekt, dann trag ich das so ein! 😊 Mein Kollege bringt den Vergleich direkt mit. Wie ist Ihr Name für den Termin? Klasse – bis Montag! 👊',
      hint: 'Sauber bestätigen, Namen sichern, positiv abschließen.',
    },
  ])

  return [open, close]
}

// ── Generator ───────────────────────────────────────────────────────────────
export function generateConversation(): Conversation {
  const customerType: CustomerType = Math.random() < 0.5 ? 'inhaber' : 'mitarbeiter'
  const provider = pick(PROVIDERS)

  const phases: PhaseScript[] = [
    { name: 'Begrüßung', steps: buildBegruessung(customerType) },
    { name: 'Kontaktieren', steps: buildKontaktieren(provider.name) },
    { name: 'Informieren', steps: buildInformieren() },
    { name: 'Argumentieren', steps: buildArgumentieren(provider.name, provider.pain) },
    { name: 'Terminieren', steps: buildTerminieren() },
  ]

  return { customerType, provider: provider.name, phases }
}
