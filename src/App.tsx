import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  generateConversation,
  PHASES,
  STATUS_LABEL,
  type GeneratedConversation,
  type Line,
  type Status,
} from './data'
import { FlatpayMark, FlatpayMascot } from './FlatpayMark'

type Screen = 'onboarding' | 'start' | 'play' | 'celebrate' | 'done'

const ONBOARDING_KEY = 'fp-onboarded-v1'

const PRAISE = [
  'Phase gemeistert.',
  'Sauber – weiter so.',
  'Stark. Nächste Phase.',
  "Genau so klingt's überzeugend.",
  'Souverän. Dranbleiben.',
]

export function App() {
  const [screen, setScreen] = useState<Screen>(() =>
    localStorage.getItem(ONBOARDING_KEY) ? 'start' : 'onboarding',
  )
  const [convo, setConvo] = useState<GeneratedConversation | null>(null)
  const [phase, setPhase] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [praise, setPraise] = useState(PRAISE[0])

  const startConversation = useCallback(() => {
    setConvo(generateConversation())
    setPhase(0)
    setRevealed(false)
    setScreen('play')
  }, [])

  const finishOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setScreen('start')
  }, [])

  return (
    <div className="app">
      <Backdrop />
      <main className="frame">
        {screen === 'onboarding' && <Onboarding onDone={finishOnboarding} />}
        {screen === 'start' && (
          <StartScreen
            onStart={startConversation}
            onReplayIntro={() => setScreen('onboarding')}
          />
        )}
        {screen === 'play' && convo && (
          <PlayScreen
            convo={convo}
            phase={phase}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onNext={() => {
              if (phase >= PHASES.length - 1) {
                setScreen('done')
              } else {
                setPraise(PRAISE[phase % PRAISE.length])
                setScreen('celebrate')
              }
            }}
            onQuit={() => setScreen('start')}
          />
        )}
        {screen === 'celebrate' && (
          <Celebrate
            text={praise}
            phaseDone={phase}
            onContinue={() => {
              setPhase((p) => p + 1)
              setRevealed(false)
              setScreen('play')
            }}
          />
        )}
        {screen === 'done' && convo && (
          <DoneScreen convo={convo} onRestart={startConversation} />
        )}
      </main>
    </div>
  )
}

// ── Hintergrund: dezenter Schwarz-Weiß-Verlauf (Apple/Gemini-Ruhe) ──────────
function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="glow glow-c" />
      <div className="grain" />
    </div>
  )
}

// ── Mini-Onboarding (Schwarz/Weiß, Flatpay) ─────────────────────────────────
function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const slides = [
    {
      art: <FlatpayMark size={108} framed />,
      title: 'Pitch Trainer',
      body: 'Übe deinen Flatpay-Pitch wie ein echtes Gespräch — Phase für Phase, jedes Mal neu gewürfelt.',
    },
    {
      art: <FlatpayMascot size={120} />,
      title: "So funktioniert's",
      body: 'Der Trainer generiert einen zufälligen Verlauf: mal triffst du den Inhaber, mal eine:n Mitarbeiter:in. Auch der aktuelle Anbieter ist jedes Mal anders.',
    },
    {
      art: <FlatpayMascot size={120} />,
      title: 'Dein Job',
      body: 'Lies, was dein Gegenüber sagt. Überleg deine Antwort — dann deck die ideale Flatpay-Antwort auf und sag sie laut. In 5 Phasen zum Termin.',
    },
  ]
  const last = i === slides.length - 1
  const s = slides[i]

  return (
    <section className="screen onboarding">
      <button className="skip" onClick={onDone}>
        Überspringen
      </button>
      <div className="onb-art">{s.art}</div>
      <h1 className="onb-title">{s.title}</h1>
      <p className="onb-body">{s.body}</p>

      <div className="onb-bottom">
        <div className="dots">
          {slides.map((_, k) => (
            <span key={k} className={`dot ${k === i ? 'dot-on' : ''}`} />
          ))}
        </div>
        <div className="dock">
          <button
            className="btn btn-primary"
            onClick={() => (last ? onDone() : setI((v) => v + 1))}
          >
            {last ? "Los geht's" : 'Weiter'}
          </button>
        </div>
      </div>
    </section>
  )
}

// ── Startbildschirm ─────────────────────────────────────────────────────────
function StartScreen({
  onStart,
  onReplayIntro,
}: {
  onStart: () => void
  onReplayIntro: () => void
}) {
  return (
    <section className="screen start">
      <div className="brand-row">
        <FlatpayMark size={40} framed />
        <span className="brand-word">flatpay</span>
      </div>

      <div className="start-center">
        <FlatpayMascot size={132} />
        <h1 className="start-title">Bereit für dein Gespräch?</h1>
        <p className="start-sub">
          Ein zufälliger Kunde, ein zufälliger Anbieter, 5 Phasen. Mal sehen, wie
          souverän du zum Termin führst.
        </p>
      </div>

      <div className="dock start-bottom">
        <button className="btn btn-primary" onClick={onStart}>
          Gespräch starten
        </button>
        <button className="btn btn-ghost" onClick={onReplayIntro}>
          So funktioniert's
        </button>
      </div>
    </section>
  )
}

// ── Fortschrittsleiste (5 Segmente, Duolingo-Struktur, minimal) ─────────────
function Progress({ phase, revealed }: { phase: number; revealed: boolean }) {
  return (
    <div className="progress">
      {PHASES.map((_, i) => {
        const full = i < phase || (i === phase && revealed)
        const active = i === phase
        return (
          <span
            key={i}
            className={`seg ${full ? 'seg-full' : ''} ${active ? 'seg-active' : ''}`}
          >
            <span className="seg-fill" />
          </span>
        )
      })}
    </div>
  )
}

// ── Kunden-Avatar (gerundetes Quadrat, kein Kreis, dünne Linien-Ikone) ──────
function CustomerAvatar() {
  return (
    <span className="avatar" aria-hidden>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path
          d="M12 12.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5.5 19c.7-3 3.3-4.5 6.5-4.5s5.8 1.5 6.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

function StatusPill({ status }: { status: Status }) {
  return <span className={`pill pill-${status}`}>{STATUS_LABEL[status]}</span>
}

// ── Spiel-Bildschirm: Kunde oben, Antwort unten (Aufdecken) ─────────────────
function PlayScreen({
  convo,
  phase,
  revealed,
  onReveal,
  onNext,
  onQuit,
}: {
  convo: GeneratedConversation
  phase: number
  revealed: boolean
  onReveal: () => void
  onNext: () => void
  onQuit: () => void
}) {
  const line: Line = convo.steps[phase]
  const role = convo.customerType === 'inhaber' ? 'Inhaber' : 'Mitarbeiter:in'

  return (
    <section className="screen play">
      <header className="topbar">
        <button className="iconbtn" aria-label="Beenden" onClick={onQuit}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <Progress phase={phase} revealed={revealed} />
      </header>

      <div className="phase-label">
        <span className="phase-step">
          Phase {phase + 1}/{PHASES.length}
        </span>
        <span className="phase-name">{PHASES[phase]}</span>
      </div>

      <div className="convo">
        <div className="speaker">
          <CustomerAvatar />
          <span className="speaker-role">{role}</span>
        </div>
        <div className="bubble">{line.customer}</div>
      </div>

      <button
        className={`answer ${revealed ? 'answer-open' : 'answer-locked'}`}
        onClick={revealed ? undefined : onReveal}
        disabled={revealed}
      >
        {revealed ? (
          <>
            <div className="answer-head">
              <span className="answer-tag">{line.tag}</span>
              <StatusPill status={line.status} />
            </div>
            <p className="answer-text">{line.response}</p>
          </>
        ) : (
          <span className="answer-hint">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M12 5C6.5 5 2.7 9.1 2 12c.7 2.9 4.5 7 10 7s9.3-4.1 10-7c-.7-2.9-4.5-7-10-7Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Tippe, um die ideale Antwort zu sehen
          </span>
        )}
      </button>

      <div className="dock">
        <button className="btn btn-primary" onClick={revealed ? onNext : onReveal}>
          {revealed
            ? phase >= PHASES.length - 1
              ? 'Gespräch abschließen'
              : 'Weiter'
            : 'Antwort aufdecken'}
        </button>
      </div>
    </section>
  )
}

// ── Gratulation zwischen den Phasen (Flatpay-Mark statt Eule) ───────────────
function Celebrate({
  text,
  phaseDone,
  onContinue,
}: {
  text: string
  phaseDone: number
  onContinue: () => void
}) {
  // Auto-Weiter nach kurzer Feier-Pause, aber Button bleibt steuerbar.
  useEffect(() => {
    const t = setTimeout(onContinue, 2200)
    return () => clearTimeout(t)
  }, [onContinue])

  return (
    <section className="screen celebrate" onClick={onContinue}>
      <div className="celebrate-mark">
        <FlatpayMascot size={148} />
      </div>
      <h2 className="celebrate-title">{text}</h2>
      <p className="celebrate-sub">
        {PHASES[phaseDone]} abgeschlossen · {phaseDone + 1}/{PHASES.length}
      </p>
    </section>
  )
}

function providerShort(tag: string) {
  // "Anbieter: SumUp" -> "SumUp"; sonst Tag unverändert.
  const m = tag.match(/Anbieter:\s*(.+)/)
  if (m) return m[1]
  if (/Nexi/i.test(tag)) return 'Nexi'
  return tag
}

// ── Abschluss-Übersicht (Duolingo „Lektion fertig", minimal) ────────────────
function DoneScreen({
  convo,
  onRestart,
}: {
  convo: GeneratedConversation
  onRestart: () => void
}) {
  const role = convo.customerType === 'inhaber' ? 'Inhaber' : 'Mitarbeiter:in'
  const provider = useMemo(() => providerShort(convo.steps[2].tag), [convo])

  const stats = [
    { label: 'Phasen', value: `${PHASES.length}/${PHASES.length}` },
    { label: 'Gegenüber', value: role },
    { label: 'Anbieter', value: provider },
  ]

  return (
    <section className="screen done">
      <div className="done-center">
        <FlatpayMascot size={140} />
        <h1 className="done-title">Gespräch gemeistert</h1>
        <p className="done-sub">Du hast alle 5 Phasen sauber durchgespielt.</p>

        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dock">
        <button className="btn btn-primary" onClick={onRestart}>
          Neues Gespräch
        </button>
      </div>
    </section>
  )
}
