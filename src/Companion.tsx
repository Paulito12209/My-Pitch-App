import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COMPANION_START,
  COMPANION_TREE,
  fillTemplate,
  type BranchOption,
  type ProviderCtx,
} from './companion'

const PHASES = ['Begrüßung', 'Kontaktieren', 'Informieren', 'Argumentieren', 'Terminieren']
const EDITS_KEY = 'fp-companion-edits-v1'

function loadEdits(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(EDITS_KEY) || '{}')
  } catch {
    return {}
  }
}

// ── Begleitmodus: navigierbarer Live-Skript-Guide ───────────────────────────
export function Companion({ onQuit }: { onQuit: () => void }) {
  const [nodeId, setNodeId] = useState(COMPANION_START)
  const [, setHistory] = useState<string[]>([])
  const [provider, setProvider] = useState<ProviderCtx | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>(loadEdits)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [dockHidden, setDockHidden] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)

  const node = COMPANION_TREE[nodeId]
  const scrollRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout>>()

  // Beim Knotenwechsel: nach oben scrollen, Edit beenden, Dock zeigen
  useEffect(() => {
    setEditing(false)
    setDockHidden(false)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [nodeId])

  const sayText = (id: string, raw: string) =>
    edits[id] ?? fillTemplate(raw, provider)

  const go = useCallback(
    (to: string, opt?: BranchOption) => {
      if (opt?.provider) setProvider(opt.provider)
      setHistory((h) => [...h, nodeId])
      setNodeId(to)
    },
    [nodeId],
  )

  const back = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) {
        onQuit()
        return h
      }
      const prev = h[h.length - 1]
      setNodeId(prev)
      return h.slice(0, -1)
    })
  }, [onQuit])

  // Dock beim Scrollen ausblenden, im Stillstand wieder einblenden
  const onScroll = useCallback(() => {
    setDockHidden(true)
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setDockHidden(false), 550)
  }, [])

  const startEdit = () => {
    if (node.kind !== 'say') return
    setDraft(sayText(nodeId, node.text))
    setEditing(true)
  }
  const saveEdit = () => {
    const nextEdits = { ...edits, [nodeId]: draft }
    setEdits(nextEdits)
    localStorage.setItem(EDITS_KEY, JSON.stringify(nextEdits))
    setEditing(false)
  }

  const phase = node.phase

  return (
    <section className="screen companion">
      <header className="topbar">
        <span className="topbar-step">Phase {phase}/5</span>
        <div className="progress">
          {PHASES.map((_, i) => {
            const frac = i + 1 < phase ? 1 : i + 1 === phase ? 0.5 : 0
            return (
              <span key={i} className={`seg ${i + 1 === phase ? 'seg-active' : ''}`}>
                <span className="seg-fill" style={{ width: `${frac * 100}%` }} />
              </span>
            )
          })}
        </div>
      </header>

      <div className="phase-label phase-label-center">
        <span className="phase-name">{PHASES[phase - 1]}</span>
        {node.title !== PHASES[phase - 1] && (
          <span className="phase-sub">{node.title}</span>
        )}
      </div>

      <div className="companion-body" ref={scrollRef} onScroll={onScroll}>
        {node.kind === 'say' ? (
          <div className="say-block">
            <span className="say-label">Das sagst du</span>
            {editing ? (
              <textarea
                className="say-edit"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                rows={6}
              />
            ) : (
              <div className="say-card">
                <p className="say-text">{sayText(nodeId, node.text)}</p>
                <button
                  className="say-edit-btn"
                  aria-label="Text bearbeiten"
                  onClick={startEdit}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M4 20h4L18.5 9.5a2 2 0 0 0-2.83-2.83L5 17v3Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path d="M13.5 7.5 16.5 10.5" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="opt-list">
            {node.options.map((opt, i) => (
              <button
                key={i}
                className="opt-card"
                onClick={() => go(opt.to, opt)}
              >
                <span className="opt-text">
                  {edits[`${nodeId}:${i}`] ?? opt.label}
                </span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="opt-arrow">
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
            <p className="opt-hint">Tippe an, was dein Gegenüber sagt</p>
          </div>
        )}
      </div>

      <div className={`companion-dock ${dockHidden ? 'is-hidden' : ''}`}>
        <button className="dock-icon" aria-label="Zurück" onClick={back}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {editing ? (
          <button className="btn btn-primary" onClick={saveEdit}>
            Speichern
          </button>
        ) : node.kind === 'say' ? (
          node.next ? (
            <button className="btn btn-primary" onClick={() => go(node.next!)}>
              Weiter
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onQuit}>
              Zur Auswahl
            </button>
          )
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => go(node.options[0].to, node.options[0])}
          >
            Wahrscheinlichste
          </button>
        )}

        <button
          className="dock-icon"
          aria-label="Gespräch beenden"
          onClick={() => setConfirmQuit(true)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {confirmQuit && (
        <div className="dialog-overlay" onClick={() => setConfirmQuit(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <p className="dialog-title">Gespräch wirklich beenden?</p>
            <p className="dialog-text">
              Du kehrst zur Modus-Auswahl zurück.
            </p>
            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmQuit(false)}>
                Abbrechen
              </button>
              <button className="btn btn-primary" onClick={onQuit}>
                Beenden
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
