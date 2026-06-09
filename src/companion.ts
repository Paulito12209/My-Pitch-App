// ─────────────────────────────────────────────────────────────────────────
//  Begleitmodus · Live-Gesprächsbaum
//
//  Abgestimmt aufs Trainer-Feedback:
//    • Locker & positiv, NICHT zu früh „von Flatpay" – der Name + Termin
//      kommen erst in Phase 5.
//    • Natürlicher Einstieg: Begrüßung → „mit Karte zahlen?" → „welcher
//      Anbieter?" → Pain annehmend platzieren → Termin.
//    • Wenige Ja/Nein-Fragen, die ein Nein einladen – lieber annehmende
//      Aussagen, die führen.
//    • Kein Telefon-Termin (machen wir nicht) → charmant auf Vor Ort lenken.
//    • „Per Mail"-Einwand → ebenfalls charmant auf den persönlichen Termin.
//
//  Knotentypen:  say  = Satz, den DU sagst (editierbar)
//                branch = Reaktionen des Gegenübers (antippbar, nach
//                         Wahrscheinlichkeit sortiert)
// ─────────────────────────────────────────────────────────────────────────

export interface ProviderCtx {
  name: string
  pain: string
}

export const COMPANION_PROVIDERS: ProviderCtx[] = [
  { name: 'SumUp', pain: 'die Geräte extra und für jede Zahlung eine prozentuale Gebühr' },
  { name: 'Sparkasse', pain: 'gestaffelte Sätze je Kartentyp und obendrauf noch Gerätemiete' },
  { name: 'Payone', pain: 'noch Gerätemiete plus gestaffelte Gebühren auf jede Karte' },
  { name: 'Nexi', pain: 'noch Gerätemiete plus separate Gebühren auf Kredit- und Auslandskarten' },
  { name: 'TeleCash', pain: 'unterschiedliche Sätze je Karte plus extra Kosten pro Transaktion' },
  { name: 'Vert', pain: 'unterschiedliche Sätze auf EC-, Kredit- und Auslandskarten plus Gerätemiete' },
]

// Wenn jemand den Anbieter nicht kennt → meist Hausbank
const HAUSBANK: ProviderCtx = {
  name: 'der Hausbank',
  pain: 'noch Gerätemiete und auf jede Karte eine andere Gebühr',
}

export interface SayNode {
  kind: 'say'
  phase: number
  title: string
  text: string
  next: string | null
}
export interface BranchOption {
  label: string
  to: string
  provider?: ProviderCtx
}
export interface BranchNode {
  kind: 'branch'
  phase: number
  title: string
  options: BranchOption[]
}
export type CompanionNode = SayNode | BranchNode

export const COMPANION_START = 'start'

const providerOptions: BranchOption[] = COMPANION_PROVIDERS.map((p) => ({
  label: p.name,
  to: 'say_pain_assume',
  provider: p,
}))

export const COMPANION_TREE: Record<string, CompanionNode> = {
  // ── Phase 1 · Begrüßung ──────────────────────────────────────────────────
  start: {
    kind: 'say',
    phase: 1,
    title: 'Begrüßung',
    text: 'Schönen guten Tag! Spreche ich gerade mit dem Inhaber?',
    next: 'b_owner',
  },
  b_owner: {
    kind: 'branch',
    phase: 1,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, am Apparat.', to: 'say_card_q' },
      { label: "Worum geht's denn?", to: 'say_worum' },
      { label: 'Wer sind Sie denn / welche Firma?', to: 'say_who' },
      { label: 'Ich bin nur Mitarbeiter:in.', to: 'say_employee' },
      { label: 'Der Chef ist gerade nicht da.', to: 'say_notthere' },
    ],
  },
  say_who: {
    kind: 'say',
    phase: 1,
    title: 'Kurz vorstellen (wenn gefragt)',
    text: 'Mein Name ist Paul von Flatpay – wir helfen Läden, bei der Kartenzahlung Gebühren zu sparen. 😊 Aber sagen Sie kurz: kann man bei Ihnen mit Karte zahlen?',
    next: 'b_card',
  },
  say_card_q: {
    kind: 'say',
    phase: 1,
    title: 'Locker zur Kartenfrage',
    text: 'Perfekt! 😊 Ganz kurz – kann man bei Ihnen eigentlich mit Karte zahlen?',
    next: 'b_card',
  },
  say_worum: {
    kind: 'say',
    phase: 1,
    title: 'Charmant ausweichen',
    text: 'Ach, ganz unkompliziert – es geht nur kurz um Ihre Kartenzahlung im Laden. 😊 Sagen Sie, kann man bei Ihnen mit Karte zahlen?',
    next: 'b_card',
  },
  say_employee: {
    kind: 'say',
    phase: 1,
    title: 'Zum Inhaber lotsen',
    text: 'Alles gut! 😊 Stellen Sie mich am besten kurz durch – ist der Chef gerade da? Dauert wirklich nur einen Moment.',
    next: 'b_employee',
  },
  b_employee: {
    kind: 'branch',
    phase: 1,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Moment, ich hol ihn kurz.', to: 'say_card_q' },
      { label: 'Nein, er ist nicht da.', to: 'say_notthere' },
    ],
  },
  say_notthere: {
    kind: 'say',
    phase: 1,
    title: 'Rückruf sichern',
    text: 'Kein Problem! 😊 Wann erreiche ich ihn am besten – eher vormittags oder nachmittags?',
    next: 'end_callback',
  },
  end_callback: {
    kind: 'say',
    phase: 1,
    title: 'Freundlich beenden',
    text: 'Super, dann meld ich mich genau dann nochmal. Klasse, bis dahin – schönen Tag! 👍',
    next: null,
  },

  // ── Phase 2 · Kontaktieren ───────────────────────────────────────────────
  b_card: {
    kind: 'branch',
    phase: 2,
    title: 'Kann man mit Karte zahlen?',
    options: [
      { label: 'Ja, klar.', to: 'say_provider_q' },
      { label: 'Nur EC, keine Kreditkarte.', to: 'say_provider_q' },
      { label: 'Moment – wer sind Sie überhaupt?', to: 'say_who' },
      { label: 'Nein, nur Bargeld.', to: 'say_nocard' },
    ],
  },
  say_nocard: {
    kind: 'say',
    phase: 2,
    title: 'Kein Kartengerät',
    text: 'Ah, alles klar! 😊 Viele steigen gerade um, weil immer mehr Kunden mit Karte zahlen wollen – und ganz ohne Gerätemiete und Grundgebühr lohnt sich das schnell. Wär das grundsätzlich mal interessant für euch?',
    next: 'b_nocard',
  },
  b_nocard: {
    kind: 'branch',
    phase: 2,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, könnte interessant sein.', to: 'say_termin_intro' },
      { label: 'Nein, brauchen wir nicht.', to: 'say_nocard_end' },
    ],
  },
  say_nocard_end: {
    kind: 'say',
    phase: 2,
    title: 'Locker beenden',
    text: 'Alles gut, danke für Ihre Zeit! 😊 Falls sich’s mal ändert, meld ich mich gern wieder. Schönen Tag noch!',
    next: null,
  },
  say_provider_q: {
    kind: 'say',
    phase: 2,
    title: 'Anbieter erfragen',
    text: 'Super! 😊 Und bei welchem Anbieter seid ihr aktuell?',
    next: 'b_provider',
  },
  b_provider: {
    kind: 'branch',
    phase: 2,
    title: 'Welchen Anbieter nennt das Gegenüber?',
    options: [
      ...providerOptions,
      { label: 'Weiß ich gar nicht genau.', to: 'say_provider_hausbank_q' },
      { label: 'Das möchte ich nicht sagen.', to: 'say_provider_private' },
      { label: 'Wieso fragen Sie das?', to: 'say_why_provider' },
      { label: 'Wer sind Sie noch mal?', to: 'say_who_provider' },
    ],
  },
  say_why_provider: {
    kind: 'say',
    phase: 2,
    title: 'Transparent bleiben',
    text: 'Ganz transparent: Ich vergleich für euch nur kurz die Konditionen – viele zahlen nämlich mehr als nötig. 😊 Bei welchem Anbieter seid ihr denn gerade?',
    next: 'b_provider',
  },
  say_who_provider: {
    kind: 'say',
    phase: 2,
    title: 'Kurz vorstellen (wenn gefragt)',
    text: 'Mein Name ist Paul von Flatpay – wir vergleichen kurz eure Kartenkonditionen, damit ihr nicht zu viel zahlt. 😊 Bei welchem Anbieter seid ihr denn gerade?',
    next: 'b_provider',
  },

  // Anbieter unbekannt → NICHT annehmen, sondern Hausbank erfragen
  say_provider_hausbank_q: {
    kind: 'say',
    phase: 2,
    title: 'Hausbank erfragen',
    text: 'Kein Problem! 😊 Oft läuft das einfach über die Hausbank – kann das sein, dass ihr da über die Sparkasse oder Volksbank abrechnet?',
    next: 'b_provider_hausbank',
  },
  b_provider_hausbank: {
    kind: 'branch',
    phase: 2,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, genau – über die Hausbank.', to: 'say_pain_assume', provider: HAUSBANK },
      { label: 'Nein, glaub ich nicht.', to: 'say_pain_generic' },
      { label: 'Weiß ich wirklich nicht.', to: 'say_pain_generic' },
    ],
  },
  // Anbieter will nicht genannt werden → diskret bleiben, generisch platzieren
  say_provider_private: {
    kind: 'say',
    phase: 3,
    title: 'Diskret bleiben',
    text: 'Alles gut, das müsst ihr mir gar nicht verraten! 😊 Mir geht’s nur drum, dass ihr unterm Strich nicht zu viel zahlt – Gerätemiete plus eine Gebühr auf jede Karte summiert sich nämlich schnell. Da kommt bestimmt einiges zusammen, oder?',
    next: 'b_pain',
  },
  // Generische Pain-Platzierung ohne konkreten Anbieter
  say_pain_generic: {
    kind: 'say',
    phase: 3,
    title: 'Pain platzieren',
    text: 'Kein Thema! 😊 Bei den meisten Geräten zahlt man Gerätemiete, Grundgebühr und pro Kartenzahlung noch extra – da kommt unterm Strich bestimmt einiges zusammen, oder?',
    next: 'b_pain',
  },

  // ── Phase 3 · Informieren (Pain annehmend platzieren) ────────────────────
  say_pain_assume: {
    kind: 'say',
    phase: 3,
    title: 'Pain platzieren',
    text: 'Ah, {provider} – kenn ich gut! 😊 Dann zahlt ihr da bestimmt {pain}, oder?',
    next: 'b_pain',
  },
  b_pain: {
    kind: 'branch',
    phase: 3,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, kann gut sein.', to: 'say_manual' },
      { label: 'Keine Ahnung ehrlich gesagt.', to: 'say_manual' },
      { label: 'Nein, eigentlich nicht.', to: 'say_manual' },
    ],
  },
  say_manual: {
    kind: 'say',
    phase: 3,
    title: 'Erfassung abklopfen',
    text: 'Dachte ich mir. 😊 Und die Beträge tippt ihr von Hand ins Gerät ein, richtig?',
    next: 'b_manual',
  },
  b_manual: {
    kind: 'branch',
    phase: 3,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, von Hand.', to: 'say_revenue' },
      { label: 'Nein, über die Kasse.', to: 'say_revenue' },
    ],
  },
  say_revenue: {
    kind: 'say',
    phase: 3,
    title: 'Umsatz (grob)',
    text: 'Perfekt. Und wie viel macht ihr so im Monat über Karte – ganz grob?',
    next: 'b_revenue',
  },
  b_revenue: {
    kind: 'branch',
    phase: 3,
    title: 'Welchen Umsatz nennt das Gegenüber?',
    options: [
      { label: 'Ca. 8.000 € im Monat', to: 'say_arg_summary' },
      { label: 'Ca. 15.000 € im Monat', to: 'say_arg_summary' },
      { label: 'Ca. 30.000 € im Monat', to: 'say_arg_summary' },
      { label: 'Sag ich lieber nicht.', to: 'say_arg_summary' },
    ],
  },

  // ── Phase 4 · Argumentieren ──────────────────────────────────────────────
  say_arg_summary: {
    kind: 'say',
    phase: 4,
    title: 'Zusammenfassen (Ja-Kette)',
    text: 'Klasse, danke! 😊 Dann fass ich kurz zusammen: Ihr tippt von Hand ein und zahlt bei {provider} {pain}. Bei dem Umsatz zahlt man da ordentlich drauf – und genau da gäb’s eine Möglichkeit ganz ohne Gerätemiete und mit einem glatten, fairen Satz.',
    next: 'say_arg_value',
  },
  say_arg_value: {
    kind: 'say',
    phase: 4,
    title: 'Nutzen + Überleitung',
    text: 'Am besten rechnet euch das mein Kollege einfach mal in Ruhe direkt vor Ort durch – komplett kostenlos und unverbindlich. 😊',
    next: 'say_termin_intro',
  },

  // ── Phase 5 · Terminieren (jetzt Flatpay + Termin) ───────────────────────
  say_termin_intro: {
    kind: 'say',
    phase: 5,
    title: 'Flatpay + Terminvorschlag',
    text: 'Ich bin übrigens Paul von Flatpay. 😊 Mein Kollege wäre am Montag um 15 Uhr bei euch in [Ort in der Nähe] und wollte kurz vorbeikommen, um euch einen kostenlosen, unverbindlichen Preisvergleich zu zeigen. Seid ihr Montag im Geschäft?',
    next: 'b_termin',
  },
  b_termin: {
    kind: 'branch',
    phase: 5,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, Montag passt.', to: 'say_close' },
      { label: 'Schicken Sie mir lieber was per Mail.', to: 'say_obj_mail' },
      { label: 'Können wir das nicht telefonisch machen?', to: 'say_obj_phone' },
      { label: 'Muss ich mir überlegen.', to: 'say_obj_think' },
    ],
  },
  say_obj_mail: {
    kind: 'say',
    phase: 5,
    title: 'Mail → Vor Ort lenken',
    text: 'Klar, könnt ich machen – aber ehrlich, 😊 so eine Mail geht im Alltag schnell unter. Mein Kollege ist eh bei euch in der Gegend und zeigt’s euch in 10 Minuten persönlich – dann seht ihr sofort schwarz auf weiß, was sich lohnt. Passt Montag 15 Uhr?',
    next: 'b_termin2',
  },
  say_obj_phone: {
    kind: 'say',
    phase: 5,
    title: 'Telefon → Vor Ort lenken',
    text: 'Versteh ich! 😊 Aber gerade vor Ort holt mein Kollege bei den Konditionen einfach mehr für euch raus – persönlich verhandelt sich’s viel besser als am Telefon. Und kosten tut’s euch ja nichts. Montag 15 Uhr seid ihr doch im Laden, oder?',
    next: 'b_termin2',
  },
  say_obj_think: {
    kind: 'say',
    phase: 5,
    title: 'Bedenkzeit auffangen',
    text: 'Total fair! 😊 Genau deswegen ja unverbindlich – der Vergleich kostet euch nichts außer 10 Minuten, und entscheiden tut ihr danach in Ruhe selbst. Sollen wir Montag 15 Uhr sagen?',
    next: 'b_termin2',
  },
  b_termin2: {
    kind: 'branch',
    phase: 5,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Okay, Montag passt.', to: 'say_close' },
      { label: 'Nein, lieber nicht.', to: 'say_softno' },
    ],
  },
  say_softno: {
    kind: 'say',
    phase: 5,
    title: 'Sauber rausgehen',
    text: 'Alles gut, ich dräng Sie zu nichts! 😊 Ich meld mich in ein paar Wochen nochmal ganz locker – vielleicht passt’s dann besser. Klasse, schönen Tag noch!',
    next: null,
  },
  say_close: {
    kind: 'say',
    phase: 5,
    title: 'Termin steht 🎉',
    text: 'Perfekt, dann ist der Termin für Montag 15 Uhr fix! 😊 Mein Kollege bringt den Vergleich direkt mit. Wie ist Ihr Name für den Termin? Klasse – bis Montag! 👊',
    next: null,
  },
}

export function fillTemplate(text: string, ctx: ProviderCtx | null): string {
  return text
    .replace(/\{provider\}/g, ctx ? ctx.name : 'eurem aktuellen Anbieter')
    .replace(/\{pain\}/g, ctx ? ctx.pain : 'wahrscheinlich mehr als nötig')
}
