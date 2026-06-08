// ─────────────────────────────────────────────────────────────────────────
//  Flatpay Pitch Trainer · Gesprächs-Daten
//  Inhalt 1:1 aus dem Pitch-Skript (Variante A). Jede Phase hat einen Pool,
//  aus dem der Generator zufällig zieht.
// ─────────────────────────────────────────────────────────────────────────

export type Status = 'ja' | 'jaaber' | 'nein'

export interface Line {
  id: string
  /** Was der/die Gesprächspartner:in sagt */
  customer: string
  /** Ampel-Einordnung der Reaktion */
  status: Status
  /** Die ideale Flatpay-Antwort (das, was du sagst) */
  response: string
  /** Kurz-Label / Kategorie der Situation */
  tag: string
}

export type CustomerType = 'inhaber' | 'mitarbeiter'

export const STATUS_LABEL: Record<Status, string> = {
  ja: 'Grünes Licht',
  jaaber: 'Ja, aber …',
  nein: 'Abblocken',
}

export const PHASES = [
  'Begrüßung',
  'Kontaktieren',
  'Informieren',
  'Argumentieren',
  'Terminieren',
] as const

export type PhaseName = (typeof PHASES)[number]

// ── Phase 1 · Begrüßung ────────────────────────────────────────────────────
// Der Einstieg: "Schönen Guten Tag, spreche ich gerade mit dem Inhaber?"
export const OPENING = 'Schönen Guten Tag, spreche ich gerade mit dem Inhaber?'

const greetingInhaber: Line[] = [
  {
    id: 'g-ja',
    tag: 'Inhaber am Apparat',
    customer: 'Ja, am Apparat. Mit wem spreche ich?',
    status: 'ja',
    response:
      'Ja, ich bin Paul von Flatpay. Mein Kollege wäre am Montag um 15 Uhr bei euch in [ORT IN DER NÄHE] und wollte kurz vorbeikommen, um euch einen kostenlosen und unverbindlichen Preisvergleich anzubieten. Seid ihr Montag im Geschäft?',
  },
  {
    id: 'g-fuerwas',
    tag: 'Für was denn genau?',
    customer: 'Ja, der bin ich. Für was denn genau?',
    status: 'ja',
    response:
      'Für die Kartenzahlung, damit wir vor Ort die Konditionen vergleichen können, um schwarz auf weiß die Vorteile mit Flatpay (mit uns) sehen zu können.',
  },
  {
    id: 'g-worum',
    tag: "Worum geht's?",
    customer: "Spricht man da mit dem Inhaber? Worum geht's denn?",
    status: 'nein',
    response:
      "Klar! 😊 Es geht ums Kartengerät – ich würd's aber gern direkt mit dem Inhaber besprechen. Ist er grad kurz da?",
  },
]

const greetingMitarbeiter: Line[] = [
  {
    id: 'g-nichtda',
    tag: 'Inhaber gerade nicht da',
    customer: 'Nein, der ist gerade nicht da.',
    status: 'nein',
    response:
      'Kein Problem! 😄 Wann erwisch ich ihn am besten – eher morgens oder nachmittags?',
  },
  {
    id: 'g-ausrichten',
    tag: 'Ich richte es ihm aus',
    customer: 'Ich bin nur Angestellte:r. Ich kann es ihm aber ausrichten.',
    status: 'nein',
    response:
      "Super, danke! Damit's kurz bleibt: Wann erwische ich ihn am besten – vormittags oder nachmittags?",
  },
  {
    id: 'g-stillepost',
    tag: 'Mitarbeiter als stille Post',
    customer:
      'Sagen Sie es ruhig mir, wir sind hier gut aufgestellt – ich gebe das weiter.',
    status: 'jaaber',
    response:
      "Super, freut mich! 😄 Genau deshalb würd ich's aber kurz direkt mit dem Inhaber klären – nicht weil ich euch nicht vertraue, sondern weil sowas immer beim Entscheider landen muss. Ist er/sie heute noch da?",
  },
  {
    id: 'g-nein',
    tag: 'Standard-Nein',
    customer: 'Nein.',
    status: 'nein',
    response:
      'Kein Problem! Ist er denn heute noch im Haus, oder erreiche ich ihn morgen besser?',
  },
]

// ── Phase 2 · Kontaktieren (Erstreaktion) ───────────────────────────────────
const interest: Line[] = [
  {
    id: 'i-zufrieden',
    tag: 'Bin zufrieden',
    customer: 'Danke, aber wir sind eigentlich ganz zufrieden so wie es ist.',
    status: 'jaaber',
    response:
      'Super, das freut mich! 😄 Seid ihr dann noch bei der Hausbank – oder bei SumUp oder so? Ich frag nur, weil viele gar nicht genau wissen was sie zahlen. Wär’s okay, das mal kurz zu vergleichen? 15 Minuten, mehr nicht.',
  },
  {
    id: 'i-brauchen',
    tag: 'Das brauchen wir nicht',
    customer: 'Nein, so etwas brauchen wir nicht.',
    status: 'jaaber',
    response: 'Ah okay! 😄 Aber ihr habt Kartenzahlung, oder?',
  },
  {
    id: 'i-keininteresse',
    tag: 'Kein Interesse',
    customer: 'Kein Interesse, danke.',
    status: 'jaaber',
    response:
      'Kein Problem! 😄 Darf ich kurz fragen – habt ihr noch Gerätemiete oder zahlt ihr extra auf Kredit- und Auslandskarten? Weil genau da zahlen die meisten zu viel. Dienstag oder Donnerstag – was passt euch besser?',
  },
  {
    id: 'i-keinezeit',
    tag: 'Keine Zeit / ungünstig',
    customer: 'Gerade ungünstig, ich hab keine Zeit.',
    status: 'jaaber',
    response:
      'Klar, macht Sinn! 😄 Ich ruf ja extra vorher an, damit ich nicht einfach so reinkomme. Wann ist bei euch am wenigsten los – eher morgens oder nachmittags?',
  },
  {
    id: 'i-anrufe',
    tag: 'Ständig solche Anrufe',
    customer: 'Wir bekommen ständig solche Anrufe.',
    status: 'jaaber',
    response:
      "Ja, das kenn ich! 😄 Gebt mir 30 Sekunden. Wenn's wirklich nicht passt, nehm ich euch direkt von der Liste. Deal?",
  },
  {
    id: 'i-mail',
    tag: 'Infos per Mail',
    customer: 'Schicken Sie mir doch einfach Infos per Mail.',
    status: 'jaaber',
    response:
      "Klar, kein Problem! 😄 Aber mal ehrlich – eine Mail zeigt euch nicht was ihr wirklich spart. Das rechnen wir live durch, dauert keine 15 Minuten. Dienstag oder Donnerstag?",
  },
]

// ── Phase 3 · Informieren (Anbieter / Pain Points) ──────────────────────────
const providers: Line[] = [
  {
    id: 'p-payone',
    tag: 'Anbieter: Payone',
    customer: 'Wir sind aktuell bei Payone.',
    status: 'jaaber',
    response:
      "Ah, Payone – okay! 😄 Da habt ihr meistens noch Gerätemiete plus gestaffelte Gebühren auf die Karten. Und Support gibt's nur tagsüber. Wär's interessant, das mal kurz zu vergleichen? Dauert nur 15 Minuten.",
  },
  {
    id: 'p-sparkasse',
    tag: 'Anbieter: Sparkasse',
    customer: 'Wir machen das über die Sparkasse.',
    status: 'jaaber',
    response:
      'Ah, Sparkasse – verstehe! 😊 Da zahlt ihr meistens gestaffelte Sätze je Kartentyp, und Support gibt’s nur 9 bis 17 Uhr. Wenn ihr trotzdem gut fahrt, zeigt’s der Vergleich. Und wenn nicht, sag ich’s euch ehrlich. 15 Minuten, unverbindlich.',
  },
  {
    id: 'p-sumup',
    tag: 'Anbieter: SumUp',
    customer: 'Wir nutzen SumUp.',
    status: 'jaaber',
    response:
      "Ah, SumUp – okay! 😄 Da zahlt ihr ja eure Geräte extra, oder? Und beim Support kommt ihr meistens nur an einen Chatbot. Bei uns ist beides anders. Lohnt sich, das mal kurz gegenzurechnen – Dienstag oder Donnerstag?",
  },
  {
    id: 'p-telecash',
    tag: 'Anbieter: TeleCash',
    customer: 'Das läuft bei uns über TeleCash.',
    status: 'jaaber',
    response:
      "Ah, TeleCash – alles klar! 😄 Zahlt ihr da noch unterschiedliche Sätze je Karte und extra pro Transaktion? Das ist da meistens so. Genau das machen wir transparent – in 15 Minuten seht ihr's schwarz auf weiß. Dienstag oder Donnerstag?",
  },
  {
    id: 'p-vert',
    tag: 'Anbieter: Vert',
    customer: 'Wir sind bei Vert.',
    status: 'jaaber',
    response:
      'Ah, Vert – alles klar! 😄 Zahlt ihr da auch unterschiedlich auf EC, Kredit und Auslandskarten? Und kommt euer Geld nur wöchentlich? Genau da setzen wir an. Lohnt sich, das mal gegenzurechnen – Dienstag oder Donnerstag?',
  },
  {
    id: 'p-nexi-neu',
    tag: 'Erst kürzlich zu Nexi gewechselt',
    customer: 'Wir sind erst vor Kurzem zu Nexi gewechselt.',
    status: 'jaaber',
    response:
      'Ah, Nexi – okay! 😄 Darf ich kurz fragen: Zahlt ihr da noch separate Gebühren auf Kredit- und Auslandskarten? Weil das ist bei Nexi meistens der Fall. Genau das vergleichen wir in 15 Minuten – könnte sich lohnen. Dienstag oder Donnerstag?',
  },
  {
    id: 'p-nexi-wohl',
    tag: 'Fühlt sich gut aufgehoben (Nexi)',
    customer: 'Bei Nexi fühlen wir uns eigentlich gut aufgehoben.',
    status: 'jaaber',
    response:
      'Das freut mich! 😊 Seid ihr dann bei Nexi? Ich frag nur, weil Nexi-Kunden meistens noch Gerätemiete zahlen – und das summiert sich übers Jahr. Wär’s nicht interessant, das mal kurz gegenzurechnen?',
  },
]

// ── Phase 4 · Argumentieren (Einwände) ──────────────────────────────────────
const objections: Line[] = [
  {
    id: 'e-partner',
    tag: 'Erstmal mit Partner besprechen',
    customer: 'Das muss ich erst mit meinem Partner besprechen.',
    status: 'jaaber',
    response:
      'Super Idee! 😄 Am besten kommt er/sie beim Termin einfach dazu – dann habt ihr beide die Zahlen direkt vor euch. Wann passt’s euch beiden?',
  },
  {
    id: 'e-sparkasse-treu',
    tag: 'Mann bei Sparkasse / kein Wechsel',
    customer: 'Mein Mann ist bei der Sparkasse, wir wechseln nicht.',
    status: 'jaaber',
    response:
      "Das respektiere ich total! 😊 Aber mal so gefragt – wenn ihr mit der Sparkasse gut gefahren seid, wird der Vergleich das auch zeigen. Kostet euch nichts außer 15 Minuten. Und wenn's nicht besser ist, sag ich's euch selbst.",
  },
  {
    id: 'e-kundschaft',
    tag: 'Keine Zeit wegen Kundschaft',
    customer: 'Ich hab gerade Kundschaft, das geht jetzt nicht.',
    status: 'jaaber',
    response:
      "Klar, der Laden geht vor! 😄 Ich halt's deshalb kurz: Mein Kollege kommt vorbei, wenn's bei euch ruhiger ist – 15 Minuten, fertig. Wann ist bei euch am wenigsten los?",
  },
  {
    id: 'e-keinekarte-jaaber',
    tag: 'Keine Kartenzahlung (offen)',
    customer: 'Wir haben gar keine Kartenzahlung.',
    status: 'jaaber',
    response:
      'Verstehe. Darf ich kurz nachhaken – lag’s vielleicht bisher einfach an den hohen Kosten der anderen Anbieter? Denn genau da setzen wir an: ein Gerät ohne Vorabkosten und ohne monatliche Gebühr. Falls Kartenzahlung für Sie irgendwann interessant wird, lohnt sich der Blick.',
  },
  {
    id: 'e-keinekarte-nein',
    tag: 'Keine Kartenzahlung (Bargeld)',
    customer: 'Nein, wir nehmen wirklich nur Bargeld.',
    status: 'nein',
    response:
      'Oh wirklich? 😮 Also wirklich nur Bargeld? Ich frag kurz, weil das manchmal nicht alle wissen – steht da vorne nicht doch ein Gerät?',
  },
]

// ── Phase 5 · Terminieren (Abschluss) ───────────────────────────────────────
const closing: Line[] = [
  {
    id: 'c-okay',
    tag: 'Termin steht',
    customer: 'Na gut, dann kommen Sie Montag vorbei.',
    status: 'ja',
    response:
      'Perfekt, dann trägt mein Kollege das für Montag 15 Uhr ein. 😊 Er bringt den Vergleich direkt mit – ihr seht schwarz auf weiß, was sich mit Flatpay für euch rechnet. Bis Montag!',
  },
  {
    id: 'c-kosten',
    tag: 'Was kostet mich das?',
    customer: 'Und was kostet mich der Termin?',
    status: 'ja',
    response:
      'Gar nichts – der Vergleich ist kostenlos und völlig unverbindlich. 😊 Mein Kollege kommt Montag um 15 Uhr, rechnet alles mit euch durch, und ihr entscheidet ganz in Ruhe. Passt das so?',
  },
  {
    id: 'c-wermachts',
    tag: 'Wer kommt vorbei?',
    customer: 'Und wer kommt dann zu uns?',
    status: 'ja',
    response:
      'Mein Kollege aus eurer Region – er ist Montag eh in [ORT IN DER NÄHE]. 😊 Er bringt den Preisvergleich mit, das dauert keine 15 Minuten. Soll ich euch für 15 Uhr eintragen?',
  },
]

export const POOLS: Record<number, (t: CustomerType) => Line[]> = {
  0: (t) => (t === 'inhaber' ? greetingInhaber : greetingMitarbeiter),
  1: () => interest,
  2: () => providers,
  3: () => objections,
  4: () => closing,
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface GeneratedConversation {
  customerType: CustomerType
  steps: Line[]
}

/** Würfelt einen kompletten Gesprächsverlauf über alle 5 Phasen. */
export function generateConversation(): GeneratedConversation {
  const customerType: CustomerType = Math.random() < 0.5 ? 'inhaber' : 'mitarbeiter'
  const steps = PHASES.map((_, i) => pickRandom(POOLS[i](customerType)))
  return { customerType, steps }
}
