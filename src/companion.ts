// ─────────────────────────────────────────────────────────────────────────
//  Begleitmodus · Live-Gesprächsbaum
//
//  Anders als die Simulation ist das hier ein navigierbarer Skript-Guide für
//  den ECHTEN Anruf. Zwei Knotentypen:
//    • say    – der Satz, den DU sagst (editierbar). Unten: ✏️ + „Weiter".
//    • branch – wie das Gegenüber reagiert: antippbare Karten (nach
//               Wahrscheinlichkeit sortiert). Tippen führt direkt weiter.
//
//  Anbieter werden über {provider}/{pain} in die Texte eingesetzt, sobald man
//  im Anbieter-Branch eine Option wählt.
// ─────────────────────────────────────────────────────────────────────────

export interface ProviderCtx {
  name: string
  pain: string
}

export const COMPANION_PROVIDERS: ProviderCtx[] = [
  { name: 'SumUp', pain: 'man die Geräte extra zahlt und beim Support meist nur an einen Chatbot kommt' },
  { name: 'der Sparkasse', pain: 'man gestaffelte Sätze je Kartentyp zahlt und der Support nur von 9 bis 17 Uhr läuft' },
  { name: 'Payone', pain: 'meist noch Gerätemiete plus gestaffelte Gebühren auf jede Karte dranhängen' },
  { name: 'Nexi', pain: 'oft noch Gerätemiete plus separate Gebühren auf Kredit- und Auslandskarten anfallen' },
  { name: 'TeleCash', pain: 'unterschiedliche Sätze je Karte plus Kosten pro Transaktion anfallen' },
  { name: 'Vert', pain: 'man unterschiedlich auf EC-, Kredit- und Auslandskarten zahlt und das Geld nur wöchentlich kommt' },
]

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
  // sichtbares Label ohne Artikel ("der Sparkasse" → "Sparkasse")
  label: p.name.replace(/^der /, ''),
  to: 'say_info_intro',
  provider: p,
}))

export const COMPANION_TREE: Record<string, CompanionNode> = {
  // ── Phase 1 · Begrüßung ──────────────────────────────────────────────────
  start: {
    kind: 'say',
    phase: 1,
    title: 'Begrüßung',
    text: 'Schönen guten Tag! Mein Name ist Paul von Flatpay. Spreche ich gerade mit dem Inhaber?',
    next: 'b_owner',
  },
  b_owner: {
    kind: 'branch',
    phase: 1,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, am Apparat.', to: 'say_owner_yes' },
      { label: "Worum geht's denn?", to: 'say_worum' },
      { label: 'Ich bin nur Mitarbeiter:in.', to: 'say_employee' },
      { label: 'Der Chef ist gerade nicht da.', to: 'say_notthere' },
    ],
  },
  say_worum: {
    kind: 'say',
    phase: 1,
    title: 'Kurz erklären',
    text: 'Ganz kurz: Es geht um Ihre Kartenzahlung. Ich stelle Ihnen nur zwei, drei kurze Fragen – wenn nichts dabei ist, sind wir gleich durch. Okay?',
    next: 'b_permission',
  },
  say_employee: {
    kind: 'say',
    phase: 1,
    title: 'Zum Inhaber lotsen',
    text: 'Alles gut – dann leiten Sie mich am besten kurz weiter. Ist der Inhaber gerade da? Es dauert wirklich nur einen Moment.',
    next: 'b_employee',
  },
  b_employee: {
    kind: 'branch',
    phase: 1,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Moment, ich hole ihn kurz.', to: 'say_owner_yes' },
      { label: 'Nein, er ist nicht da.', to: 'say_notthere' },
    ],
  },
  say_notthere: {
    kind: 'say',
    phase: 1,
    title: 'Rückruf sichern',
    text: 'Kein Problem! Wann erreiche ich ihn am besten – eher vormittags oder nachmittags?',
    next: 'end_callback',
  },
  end_callback: {
    kind: 'say',
    phase: 1,
    title: 'Freundlich beenden',
    text: 'Super, dann melde ich mich genau dann nochmal. Vielen Dank und bis dahin!',
    next: null,
  },

  // ── Phase 2 · Kontaktieren ───────────────────────────────────────────────
  say_owner_yes: {
    kind: 'say',
    phase: 2,
    title: 'Einstieg',
    text: 'Schön, dass ich Sie direkt erreiche! Ich halt’s ganz kurz: Es geht um Ihre Kartenzahlung – darf ich Ihnen dazu zwei, drei kurze Fragen stellen?',
    next: 'b_permission',
  },
  b_permission: {
    kind: 'branch',
    phase: 2,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, fragen Sie.', to: 'say_provider_q' },
      { label: 'Eigentlich kein Interesse.', to: 'say_obj_nointerest' },
      { label: 'Wir sind zufrieden.', to: 'say_obj_happy' },
      { label: 'Ich hab gerade keine Zeit.', to: 'say_obj_notime' },
    ],
  },
  say_obj_nointerest: {
    kind: 'say',
    phase: 2,
    title: 'Einwand annehmen',
    text: 'Total verständlich – das sagen die meisten zuerst. 😊 Genau deshalb nur eine kurze Frage, dann wissen Sie selbst, ob sich’s lohnt: Mit wem arbeiten Sie aktuell?',
    next: 'b_provider',
  },
  say_obj_happy: {
    kind: 'say',
    phase: 2,
    title: 'Zufriedenheit nutzen',
    text: 'Schön zu hören! Die meisten Zufriedenen wissen aber gar nicht genau, was sie unterm Strich zahlen. Mit wem arbeiten Sie denn aktuell?',
    next: 'b_provider',
  },
  say_obj_notime: {
    kind: 'say',
    phase: 2,
    title: 'Zeit-Einwand',
    text: 'Verstehe – ich brauche auch nur einen Moment. Eine kurze Frage: Mit wem läuft Ihre Kartenzahlung aktuell?',
    next: 'b_provider',
  },
  say_provider_q: {
    kind: 'say',
    phase: 2,
    title: 'Anbieter erfragen',
    text: 'Super. Mit wem arbeiten Sie denn aktuell bei der Kartenzahlung?',
    next: 'b_provider',
  },
  b_provider: {
    kind: 'branch',
    phase: 2,
    title: 'Welchen Anbieter nennt das Gegenüber?',
    options: providerOptions,
  },

  // ── Phase 3 · Informieren (Pflichtfragen) ────────────────────────────────
  say_info_intro: {
    kind: 'say',
    phase: 3,
    title: 'Anbieter aufgreifen',
    text: 'Ah, {provider} – kenn ich gut. Damit ich Ihnen nichts Falsches erzähle, stelle ich Ihnen kurz zwei, drei Sachen dazu. Passt das?',
    next: 'say_pf1',
  },
  say_pf1: {
    kind: 'say',
    phase: 3,
    title: 'Pflichtfrage 1 · Entscheider',
    text: 'Nur damit ich’s richtig zuordne: Sie sind der Inhaber und entscheiden das hier selbst, oder?',
    next: 'b_pf1',
  },
  b_pf1: {
    kind: 'branch',
    phase: 3,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, das entscheide ich.', to: 'say_pf2' },
      { label: 'Nur zusammen mit meinem Partner.', to: 'say_pf1_partner' },
    ],
  },
  say_pf1_partner: {
    kind: 'say',
    phase: 3,
    title: 'Partner einbinden',
    text: 'Alles gut – am besten ist Ihr Partner beim Termin einfach dabei, dann haben Sie beide die Zahlen direkt vor sich.',
    next: 'say_pf2',
  },
  say_pf2: {
    kind: 'say',
    phase: 3,
    title: 'Pflichtfrage 2 · Erfassung',
    text: 'Perfekt. Und tippen Sie die Beträge eigentlich von Hand ins Kartengerät ein, oder kommen die automatisch aus der Kasse?',
    next: 'b_pf2',
  },
  b_pf2: {
    kind: 'branch',
    phase: 3,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Von Hand, direkt ins Gerät.', to: 'say_pf3' },
      { label: 'Automatisch über die Kasse.', to: 'say_pf3' },
    ],
  },
  say_pf3: {
    kind: 'say',
    phase: 3,
    title: 'Pflichtfrage 3 · Umsatz',
    text: 'Alles klar. Und wie viel Umsatz machen Sie ungefähr im Monat über Karte? Nur grob, damit ich’s einschätzen kann.',
    next: 'b_pf3',
  },
  b_pf3: {
    kind: 'branch',
    phase: 3,
    title: 'Welchen Umsatz nennt das Gegenüber?',
    options: [
      { label: 'Ca. 8.000 € im Monat', to: 'say_arg_summary' },
      { label: 'Ca. 15.000 € im Monat', to: 'say_arg_summary' },
      { label: 'Ca. 30.000 € im Monat', to: 'say_arg_summary' },
    ],
  },

  // ── Phase 4 · Argumentieren ──────────────────────────────────────────────
  say_arg_summary: {
    kind: 'say',
    phase: 4,
    title: 'Zusammenfassen (Ja-Kette)',
    text: 'Ich fass nur kurz zusammen: Sie sind der Inhaber, tippen die Beträge von Hand ein und machen ordentlich Umsatz über Karte. Und genau bei {provider} ist es so, dass {pain} – da zahlt man bei dem Volumen schnell mehr als nötig.',
    next: 'say_arg_value',
  },
  say_arg_value: {
    kind: 'say',
    phase: 4,
    title: 'Nutzen + Interesse-Check',
    text: 'Bei uns gibt’s keine Gerätemiete, keine monatliche Grundgebühr und einen fairen, glatten Satz – plus Support, der wirklich rangeht. Wäre so ein kostenloser Vergleich grundsätzlich interessant für Sie?',
    next: 'b_interest',
  },
  b_interest: {
    kind: 'branch',
    phase: 4,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, klingt interessant.', to: 'say_termin_intro' },
      { label: 'Wechseln will ich eigentlich nicht.', to: 'say_obj_nochange' },
      { label: 'Muss ich mit Partner besprechen.', to: 'say_obj_partner' },
    ],
  },
  say_obj_nochange: {
    kind: 'say',
    phase: 4,
    title: 'Wechsel-Einwand',
    text: 'Müssen Sie auch gar nicht – es geht erstmal nur um den Vergleich. Wenn’s nicht besser ist, sage ich Ihnen das selbst. Kostet Sie nur 15 Minuten.',
    next: 'say_termin_intro',
  },
  say_obj_partner: {
    kind: 'say',
    phase: 4,
    title: 'Partner-Einwand',
    text: 'Super – am besten ist Ihr Partner beim Termin einfach dabei, dann entscheiden Sie zu zweit mit den Zahlen vor sich.',
    next: 'say_termin_intro',
  },

  // ── Phase 5 · Terminieren ────────────────────────────────────────────────
  say_termin_intro: {
    kind: 'say',
    phase: 5,
    title: 'Termin einleiten',
    text: 'Am einfachsten zeigt Ihnen das mein Kollege kurz direkt vor Ort – er ist nächste Woche ohnehin bei Ihnen in der Gegend. Dauert keine 15 Minuten und kostet Sie nichts. Wäre das für Sie in Ordnung?',
    next: 'b_termin',
  },
  b_termin: {
    kind: 'branch',
    phase: 5,
    title: 'Wie reagiert das Gegenüber?',
    options: [
      { label: 'Ja, machen wir.', to: 'say_termin_day' },
      { label: 'Lieber telefonisch.', to: 'say_termin_phone' },
    ],
  },
  say_termin_phone: {
    kind: 'say',
    phase: 5,
    title: 'Alternative Telefon',
    text: 'Kein Problem, dann macht er’s ganz kurz telefonisch – genauso unverbindlich.',
    next: 'say_termin_day',
  },
  say_termin_day: {
    kind: 'say',
    phase: 5,
    title: 'Konkreter Tag',
    text: 'Perfekt. Dann kommt er am Montag gegen 15 Uhr – passt Ihnen das, oder wäre Dienstag besser? Ich brauche nur ganz kurz Ihren Namen für den Termin.',
    next: 'end_success',
  },
  end_success: {
    kind: 'say',
    phase: 5,
    title: 'Termin steht 🎉',
    text: 'Klasse, der Termin steht! Vielen Dank für Ihre Zeit – mein Kollege meldet sich kurz vorher nochmal. Bis dann! 👊',
    next: null,
  },
}

export function fillTemplate(text: string, ctx: ProviderCtx | null): string {
  return text
    .replace(/\{provider\}/g, ctx ? ctx.name : 'Ihrem aktuellen Anbieter')
    .replace(/\{pain\}/g, ctx ? ctx.pain : 'da oft mehr Kosten anfallen als nötig')
}
