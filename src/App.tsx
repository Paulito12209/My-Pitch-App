import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  generateConversation,
  PHASES,
  STATUS_LABEL,
  type Conversation,
  type PhaseScript,
  type Status,
  type Turn,
} from './data'
import { FlatpayMark, FlatpayMascot } from './FlatpayMark'
import { Companion } from './Companion'

type Screen = 'auth' | 'onboarding' | 'start' | 'play' | 'celebrate' | 'done' | 'companion'

const ONBOARDING_KEY = 'fp-onboarded-v1'
const ACCESS_CODE = '0526'

const PRAISE = [
  'Phase gemeistert.',
  'Sauber – weiter so.',
  'Stark. Nächste Phase.',
  "Genau so klingt's überzeugend.",
  'Souverän. Dranbleiben.',
]

export function App() {
  // Start immer im Zugangs-Gate (Fake-Auth, Code 0526)
  const [screen, setScreen] = useState<Screen>('auth')
  const [convo, setConvo] = useState<Conversation | null>(null)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [praise, setPraise] = useState(PRAISE[0])

  const startConversation = useCallback(() => {
    setConvo(generateConversation())
    setPhaseIdx(0)
    setStepIdx(0)
    setRevealed(false)
    setScreen('play')
  }, [])

  const finishOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setScreen('start')
  }, [])

  const handleNext = useCallback(() => {
    if (!convo) return
    const phase = convo.phases[phaseIdx]
    if (stepIdx < phase.steps.length - 1) {
      // nächster Teilschritt – fließend weiter im selben Gespräch
      setStepIdx((s) => s + 1)
      setRevealed(false)
    } else if (phaseIdx >= convo.phases.length - 1) {
      setScreen('done')
    } else {
      setPraise(PRAISE[phaseIdx % PRAISE.length])
      setScreen('celebrate')
    }
  }, [convo, phaseIdx, stepIdx])

  return (
    <div className="app">
      <Backdrop />
      <main className="frame">
        {screen === 'auth' && (
          <AuthGate
            onSuccess={() =>
              setScreen(localStorage.getItem(ONBOARDING_KEY) ? 'start' : 'onboarding')
            }
          />
        )}
        {screen === 'onboarding' && <Onboarding onDone={finishOnboarding} />}
        {screen === 'start' && (
          <StartScreen
            onSimulation={startConversation}
            onCompanion={() => setScreen('companion')}
            onReplayIntro={() => setScreen('onboarding')}
          />
        )}
        {screen === 'companion' && <Companion onQuit={() => setScreen('start')} />}
        {screen === 'play' && convo && (
          <PlayScreen
            convo={convo}
            phaseIdx={phaseIdx}
            stepIdx={stepIdx}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onNext={handleNext}
            onQuit={() => setScreen('start')}
          />
        )}
        {screen === 'celebrate' && convo && (
          <Celebrate
            text={praise}
            phaseName={convo.phases[phaseIdx].name}
            phaseNumber={phaseIdx + 1}
            onContinue={() => {
              setPhaseIdx((p) => p + 1)
              setStepIdx(0)
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

// ── Zugangs-Gate (Fake-Auth, Code 0526) ────────────────────────────────────
function AuthGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCode(v)
    setError(false)
    if (v.length === 4) {
      if (v === ACCESS_CODE) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => setCode(''), 650)
      }
    }
  }

  return (
    <section className="screen auth" onClick={() => inputRef.current?.focus()}>
      <div className="auth-center">
        <FlatpayMark size={72} framed />
        <h1 className="auth-title">Zugangscode</h1>
        <p className="auth-sub">Gib den 4-stelligen Code ein, um zu starten.</p>

        <div className={`pin ${error ? 'pin-error' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`pin-cell ${code.length > i ? 'pin-filled' : ''} ${
                code.length === i ? 'pin-cursor' : ''
              }`}
            >
              {code[i] ? '•' : ''}
            </span>
          ))}
        </div>

        <p className={`auth-error ${error ? 'is-visible' : ''}`}>
          Falscher Code – versuch’s nochmal.
        </p>

        <input
          ref={inputRef}
          className="pin-input"
          value={code}
          onChange={onChange}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={4}
          aria-label="Zugangscode"
        />
      </div>
    </section>
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
      title: 'Zwei Modi',
      body: 'Simulation: ein komplettes Gespräch frei durchspielen und üben. Begleitmodus: Live-Hilfe beim echten Anruf — du tippst dich Karte für Karte durch und passt deine Sätze jederzeit an.',
    },
    {
      art: <FlatpayMascot size={120} />,
      title: 'Immer 5 Phasen',
      body: 'Beide Modi führen über dieselben 5 Phasen — Begrüßung, Kontaktieren, Informieren, Argumentieren, Terminieren — Schritt für Schritt sauber zum Termin.',
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

// ── Startbildschirm mit Modus-Auswahl ───────────────────────────────────────
function StartScreen({
  onSimulation,
  onCompanion,
  onReplayIntro,
}: {
  onSimulation: () => void
  onCompanion: () => void
  onReplayIntro: () => void
}) {
  return (
    <section className="screen start">
      <div className="brand-row">
        <FlatpayMark size={36} framed />
        <span className="brand-word">flatpay</span>
        <button className="brand-link" onClick={onReplayIntro}>
          So funktioniert's
        </button>
      </div>

      <div className="start-center">
        <FlatpayMascot size={104} />
        <h1 className="start-title">Wähle deinen Modus</h1>
      </div>

      <div className="mode-list">
        <button className="mode-card" onClick={onSimulation}>
          <span className="mode-head">
            <ModeIcon kind="sim" />
            <span className="mode-name">Simulation</span>
          </span>
          <span className="mode-desc">
            Komplettes Gespräch frei durchspielen und üben – zufälliger Kunde,
            zufälliger Anbieter, 5 Phasen.
          </span>
        </button>

        <button className="mode-card" onClick={onCompanion}>
          <span className="mode-head">
            <ModeIcon kind="live" />
            <span className="mode-name">Begleitmodus</span>
          </span>
          <span className="mode-desc">
            Live-Unterstützung beim echten Anruf – tippe dich Karte für Karte
            durch und passe deine Sätze jederzeit an.
          </span>
        </button>
      </div>
    </section>
  )
}

function ModeIcon({ kind }: { kind: 'sim' | 'live' }) {
  return (
    <span className="mode-icon" aria-hidden>
      {kind === 'sim' ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path
            d="M8 5v14l11-7L8 5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path
            d="M5 4h4l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 6.2 2 2 0 0 1 5 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

// ── Fortschrittsleiste (5 Phasen, fraktionale Füllung über Teilschritte) ────
function Progress({
  phases,
  phaseIdx,
  stepIdx,
  revealed,
}: {
  phases: PhaseScript[]
  phaseIdx: number
  stepIdx: number
  revealed: boolean
}) {
  return (
    <div className="progress">
      {phases.map((p, i) => {
        let fraction = 0
        if (i < phaseIdx) fraction = 1
        else if (i === phaseIdx) {
          const done = stepIdx + (revealed ? 1 : 0)
          fraction = Math.min(done / p.steps.length, 1)
        }
        return (
          <span key={i} className={`seg ${i === phaseIdx ? 'seg-active' : ''}`}>
            <span className="seg-fill" style={{ width: `${fraction * 100}%` }} />
          </span>
        )
      })}
    </div>
  )
}

// ── Kunden-Avatar (nacktes Personen-Icon, kein Kreis/Hintergrund) ───────────
function CustomerAvatar() {
  return (
    <span className="avatar" aria-hidden>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
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
  phaseIdx,
  stepIdx,
  revealed,
  onReveal,
  onNext,
  onQuit,
}: {
  convo: Conversation
  phaseIdx: number
  stepIdx: number
  revealed: boolean
  onReveal: () => void
  onNext: () => void
  onQuit: () => void
}) {
  const phase = convo.phases[phaseIdx]
  const turn: Turn = phase.steps[stepIdx]
  const totalSteps = phase.steps.length

  const isLastStep = stepIdx === totalSteps - 1
  const isLastPhase = phaseIdx === convo.phases.length - 1
  const nextLabel = revealed
    ? isLastStep && isLastPhase
      ? 'Gespräch abschließen'
      : isLastStep
        ? 'Phase abschließen'
        : 'Weiter'
    : 'Antwort aufdecken'

  return (
    <section className="screen play">
      <header className="topbar">
        <span className="topbar-step">
          Phase {phaseIdx + 1}/{PHASES.length}
        </span>
        <Progress
          phases={convo.phases}
          phaseIdx={phaseIdx}
          stepIdx={stepIdx}
          revealed={revealed}
        />
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
      </header>

      <div className="phase-label">
        <span className="phase-name">{phase.name}</span>
        {totalSteps > 1 && (
          <span className="phase-sub">
            Schritt {stepIdx + 1} von {totalSteps}
          </span>
        )}
      </div>

      <div className="convo">
        <div className="bubble">
          <CustomerAvatar />
          <div className="bubble-body">
            <span className="bubble-role">{turn.speaker}</span>
            <p className="bubble-text">{turn.customer}</p>
          </div>
        </div>
      </div>

      <button
        className={`answer ${revealed ? 'answer-open' : 'answer-locked'}`}
        onClick={revealed ? undefined : onReveal}
        disabled={revealed}
      >
        {revealed ? (
          <>
            <div className="answer-head">
              <span className="answer-tag">Deine Antwort</span>
              <StatusPill status={turn.status} />
            </div>
            <p className="answer-text">{turn.response}</p>
            <div className="answer-note">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                <path
                  d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.1h6c0-.8.4-1.5 1-2.1A6 6 0 0 0 12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{turn.hint}</span>
            </div>
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
          {nextLabel}
        </button>
      </div>
    </section>
  )
}

// ── Gratulation zwischen den Phasen (Flatpay-Mark statt Eule) ───────────────
function Celebrate({
  text,
  phaseName,
  phaseNumber,
  onContinue,
}: {
  text: string
  phaseName: string
  phaseNumber: number
  onContinue: () => void
}) {
  // Auto-Weiter nach kurzer Feier-Pause, aber Tippen springt sofort weiter.
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
        {phaseName} abgeschlossen · {phaseNumber}/{PHASES.length}
      </p>
    </section>
  )
}

// ── Abschluss-Übersicht (Duolingo „Lektion fertig", minimal) ────────────────
function DoneScreen({
  convo,
  onRestart,
}: {
  convo: Conversation
  onRestart: () => void
}) {
  const role = convo.customerType === 'inhaber' ? 'Inhaber' : 'über Mitarbeiter:in'
  const steps = useMemo(
    () => convo.phases.reduce((sum, p) => sum + p.steps.length, 0),
    [convo],
  )

  const stats = [
    { label: 'Phasen', value: `${PHASES.length}/${PHASES.length}` },
    { label: 'Schritte', value: `${steps}` },
    { label: 'Anbieter', value: convo.provider },
  ]

  return (
    <section className="screen done">
      <div className="done-center">
        <FlatpayMascot size={140} />
        <h1 className="done-title">Gespräch gemeistert</h1>
        <p className="done-sub">
          Du hast den kompletten Trichter bis zum Termin durchgespielt ({role}).
        </p>

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
