// ─────────────────────────────────────────────────────────────────────────
//  Flatpay Pitch Trainer · Gesprächs-Engine
//
//  Statt einer einzelnen Frage pro Phase ist jedes Gespräch ein logischer
//  Trichter mit mehreren Teilschritten je Phase:
//
//    1. Begrüßung    – Entscheider erreichen (verzweigt nach Inhaber/Mitarbeiter)
//    2. Kontaktieren – Erstwiderstand auflösen + aktuellen Anbieter erfragen
//    3. Informieren  – 3 PFLICHTFRAGEN: Inhaber? · manuelles Eintippen? · Umsatz?
//    4. Argumentieren– Zusammenfassen (Ja-Kette) + Pain + sanfter Interesse-Check
//    5. Terminieren  – erst Zustimmung holen, DANN konkreten Tag vorschlagen
//
//  Jeder Schritt = eine Kundenaussage + die ideale Flatpay-Antwort + ein
//  kurzer Technik-Hinweis (Coaching). Rolle, Anbieter und mehrere Varianten
//  werden pro Gespräch zufällig gewürfelt – logisch sortiert, nie zusammenhanglos.
// ─────────────────────────────────────────────────────────────────────────

export type Status = 'ja' | 'jaaber' | 'nein'
export type CustomerType = 'inhaber' | 'mitarbeiter'

export interface Turn {
  /** Wer gerade spricht (Label über dem Text) */
  speaker: string
  /** Was der/die Gesprächspartner:in sagt */
  customer: string
  /** Ampel-Einordnung der Stimmung */
  status: Status
  /** Die ideale Flatpay-Antwort */
  response: string
  /** Kurzer Technik-/Coaching-Hinweis */
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

export const OPENING = 'Schönen Guten Tag, spreche ich gerade mit dem Inhaber?'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Anbieter inkl. Pain Point (für die Argumentation) ───────────────────────
const PROVIDERS: { name: string; pain: string }[] = [
  {
    name: 'Payone',
    pain: 'da hängt meistens noch Gerätemiete plus gestaffelte Gebühren auf jede Karte dran – und der Support ist nur tagsüber erreichbar',
  },
  {
    name: 'der Sparkasse',
    pain: 'da zahlt man meistens gestaffelte Sätze je Kartentyp – und den Support gibt’s nur von 9 bis 17 Uhr',
  },
  {
    name: 'SumUp',
    pain: 'da kauft man die Geräte extra und landet beim Support meistens nur bei einem Chatbot',
  },
  {
    name: 'TeleCash',
    pain: 'da habt ihr meistens unterschiedliche Sätze je Karte und zusätzlich noch Kosten pro Transaktion',
  },
  {
    name: 'Vert',
    pain: 'da zahlt man unterschiedlich auf EC-, Kredit- und Auslandskarten – und das Geld kommt oft nur wöchentlich',
  },
  {
    name: 'Nexi',
    pain: 'da hängt meistens noch Gerätemiete plus separate Gebühren auf Kredit- und Auslandskarten dran',
  },
]

// ── Phase 1 · Begrüßung ─────────────────────────────────────────────────────
function buildBegruessung(type: CustomerType): Turn[] {
  if (type === 'inhaber') {
    return [
      pick<Turn>([
        {
          speaker: 'Inhaber',
          customer: 'Ja, am Apparat. Mit wem spreche ich?',
          status: 'ja',
          response:
            'Schön, dass ich Sie direkt erreiche! Mein Name ist Paul von Flatpay. Ich halt’s ganz kurz – und wenn’s gerade nicht passt, sagen Sie einfach Bescheid. In Ordnung?',
          hint: 'Freundlich, kurz, um Erlaubnis fragen – kein Pitch-Monolog.',
        },
        {
          speaker: 'Inhaber',
          customer: 'Ja, der bin ich. Worum geht’s denn?',
          status: 'nein',
          response:
            'Ganz kurz: Es geht um Ihre Kartenzahlung. Ich würde Ihnen gern zwei, drei kurze Fragen stellen – wenn sich daraus nichts ergibt, sind wir in einer Minute durch. Okay?',
          hint: 'Neugier wecken, Mini-Commitment statt Verkaufsdruck.',
        },
      ]),
    ]
  }
  // Mitarbeiter:in → Gatekeeper sauber nehmen, zum Entscheider durchstellen
  return [
    pick<Turn>([
      {
        speaker: 'Mitarbeiter:in',
        customer: 'Der Chef ist gerade nicht am Telefon. Worum geht’s denn?',
        status: 'jaaber',
        response:
          'Kein Thema! Es geht ganz kurz um die Kartenzahlung. Ist der Inhaber vielleicht in der Nähe – oder sagen Sie mir, wann ich ihn am besten erreiche?',
        hint: 'Gatekeeper freundlich nehmen, gezielt zum Entscheider lotsen.',
      },
      {
        speaker: 'Mitarbeiter:in',
        customer: 'Ich bin nur Angestellte:r, das entscheidet der Chef.',
        status: 'jaaber',
        response:
          'Alles gut, dann sind Sie genau richtig, um mich kurz weiterzuleiten. 😊 Ist der Chef gerade da? Es dauert wirklich nur einen Moment.',
        hint: 'Nicht beim Mitarbeiter pitchen – höflich zum Inhaber führen.',
      },
    ]),
    {
      speaker: 'Inhaber',
      customer: 'Ja, hallo? Was kann ich für Sie tun?',
      status: 'ja',
      response:
        'Schön, dass es klappt! Paul von Flatpay – ich mach’s ganz kurz und Sie sagen mir einfach, ob’s gerade passt. In Ordnung?',
      hint: 'Neu starten, Erlaubnis einholen, Tempo rausnehmen.',
    },
  ]
}

// ── Phase 2 · Kontaktieren ──────────────────────────────────────────────────
function buildKontaktieren(provider: string): Turn[] {
  const brushOff = pick<Turn>([
    {
      speaker: 'Inhaber',
      customer: 'Ehrlich gesagt haben wir gerade kein Interesse.',
      status: 'jaaber',
      response:
        'Total verständlich – das sagen die meisten zuerst. 😊 Genau deshalb nur eine kurze Frage vorab, dann wissen Sie selbst, ob sich’s überhaupt lohnt. Passt das?',
      hint: 'Einwand annehmen, nicht dagegenreden. Erlaubnis für eine Frage.',
    },
    {
      speaker: 'Inhaber',
      customer: 'Wir sind eigentlich ganz zufrieden.',
      status: 'jaaber',
      response:
        'Schön zu hören! Die meisten Zufriedenen wissen aber gar nicht genau, was sie unterm Strich zahlen. Darf ich kurz fragen, mit wem Sie aktuell arbeiten?',
      hint: 'Zufriedenheit bestätigen, dann sanft Neugier öffnen.',
    },
    {
      speaker: 'Inhaber',
      customer: 'Wir bekommen ständig solche Anrufe.',
      status: 'jaaber',
      response:
        'Glaub ich Ihnen sofort! 😅 Ich mach’s anders: eine ehrliche Frage, und wenn’s nicht passt, sind Sie mich direkt wieder los. Deal?',
      hint: 'Pattern Interrupt – anders sein als der Rest, kurz halten.',
    },
    {
      speaker: 'Inhaber',
      customer: 'Ich hab gerade ehrlich gesagt wenig Zeit.',
      status: 'jaaber',
      response:
        'Verstehe – ich brauche auch nur einen Moment. Eine kurze Frage, dann entscheiden Sie, ob es sich lohnt weiterzureden. Okay?',
      hint: 'Zeit-Einwand entkräften, Kontrolle beim Kunden lassen.',
    },
  ])

  const qualify: Turn = {
    speaker: 'Inhaber',
    customer: `Na gut, eine Frage. Wir machen das aktuell über ${provider}.`,
    status: 'ja',
    response: `Ah, ${provider} – kenn ich gut. Damit ich Ihnen nichts Falsches erzähle: Dürfte ich Ihnen kurz zwei, drei Sachen dazu stellen? Dann sehen wir schwarz auf weiß, ob ein Vergleich sich für Sie überhaupt lohnt.`,
    hint: 'Anbieter neutral aufnehmen, sauberer Übergang zu den Pflichtfragen.',
  }

  return [brushOff, qualify]
}

// ── Phase 3 · Informieren (3 PFLICHTFRAGEN) ─────────────────────────────────
function buildInformieren(): Turn[] {
  return [
    {
      speaker: 'Inhaber',
      customer: 'Klar, fragen Sie.',
      status: 'ja',
      response:
        'Super. Nur damit ich’s richtig zuordne – Sie sind der Inhaber und entscheiden das hier selbst, oder?',
      hint: 'Pflichtfrage 1: Entscheider bestätigen – startet die Ja-Kette.',
    },
    {
      speaker: 'Inhaber',
      customer: pick(['Ja, das entscheide ich.', 'Genau, das läuft alles über mich.']),
      status: 'ja',
      response:
        'Perfekt. Und tippen Sie die Beträge eigentlich von Hand ins Kartengerät ein, oder kommen die automatisch aus der Kasse?',
      hint: 'Pflichtfrage 2: Erfassungsart – deckt oft Sparpotenzial auf.',
    },
    {
      speaker: 'Inhaber',
      customer: pick([
        'Von Hand, direkt ins Gerät.',
        'Wir tippen das manuell ein, ja.',
      ]),
      status: 'ja',
      response:
        'Alles klar. Und wenn ich fragen darf – wie viel Umsatz macht ihr ungefähr im Monat über Karte? Nur grob, damit ich’s einschätzen kann.',
      hint: 'Pflichtfrage 3: Umsatz – die Basis für den Vergleich.',
    },
  ]
}

// ── Phase 4 · Argumentieren ─────────────────────────────────────────────────
function buildArgumentieren(provider: string, pain: string): Turn[] {
  const revenue = pick(['So um die 12.000 im Monat', 'Grob 20.000', 'Vielleicht 8.000'])
  const objection = pick([
    'aber wechseln will ich eigentlich nicht',
    'aber so richtig Zeit für sowas hab ich nicht',
    'aber meine Frau macht die Buchhaltung, die müsste da mit rein',
  ])

  const summarize: Turn = {
    speaker: 'Inhaber',
    customer: `${revenue}. ${objection.charAt(0).toUpperCase() + objection.slice(1)}.`,
    status: 'jaaber',
    response: `Verstehe ich gut. Ich fass nur mal kurz zusammen: Sie sind der Inhaber, tippen die Beträge von Hand ins Gerät ein und machen einen ordentlichen Umsatz über Karte. Und genau bei ${provider} ist es so, dass ${pain}. Das heißt, bei Ihrem Volumen zahlt man da schnell mehr als nötig.`,
    hint: 'Zusammenfassen (Ja-Kette) + Pain ruhig benennen – kein Druck, kein Termin.',
  }

  const value: Turn = {
    speaker: 'Inhaber',
    customer: pick([
      'Hm, gut möglich, dass da was geht.',
      'Das stimmt schon, drüber nachgedacht hab ich nie.',
      'Klingt nicht verkehrt.',
    ]),
    status: 'jaaber',
    response:
      'Genau das meine ich. Bei uns gibt’s keine Gerätemiete, keine monatliche Grundgebühr und einen fairen, glatten Satz – plus echten Support, der wirklich rangeht. Am Ende vergleichen wir das einfach mit Ihrer letzten Abrechnung. Wäre so ein kostenloser Vergleich grundsätzlich interessant für Sie?',
    hint: 'Nutzen konkret machen, dann SANFTER Interesse-Check – noch kein Tag.',
  }

  return [summarize, value]
}

// ── Phase 5 · Terminieren ───────────────────────────────────────────────────
function buildTerminieren(): Turn[] {
  return [
    {
      speaker: 'Inhaber',
      customer: pick([
        'Ja, schaden kann’s ja nicht.',
        'Grundsätzlich schon, klar.',
        'Interessant wär’s schon.',
      ]),
      status: 'ja',
      response:
        'Schön! Am einfachsten zeigt Ihnen das mein Kollege kurz direkt vor Ort – er ist nächste Woche ohnehin bei Ihnen in der Gegend. Das dauert keine 15 Minuten und kostet Sie nichts. Wäre das für Sie in Ordnung?',
      hint: 'Termin über den Kollegen einleiten, Aufwand bewusst kleinhalten.',
    },
    {
      speaker: 'Inhaber',
      customer: pick(['Ja, das können wir so machen.', 'Okay, einverstanden.']),
      status: 'ja',
      response:
        'Perfekt. Dann sage ich ihm, er kommt am Montag gegen 15 Uhr bei Ihnen vorbei – passt Ihnen das, oder wäre Dienstag besser? Ich brauche nur ganz kurz Ihren Namen für den Termin.',
      hint: 'Jetzt erst der konkrete Tag – mit sanfter Alternativfrage statt Druck.',
    },
  ]
}

// ── Generator: würfelt einen kompletten, logisch sortierten Verlauf ─────────
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
