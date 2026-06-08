// ─────────────────────────────────────────────────────────────────────────
//  FlatpayMark · das Flatpay-Logo als SVG-Komponente
//  Nachgebaut aus dem Marken-Logo: zentraler vertikaler Balken, flankiert
//  von zwei Quadraten. Ersetzt überall den "Maskottchen"-Platz (statt Eule
//  oder Gemini-Stern) und feiert abgeschlossene Phasen.
// ─────────────────────────────────────────────────────────────────────────

interface FlatpayMarkProps {
  /** Kantenlänge in px */
  size?: number
  /** true = schwarze gerundete Kachel mit weißem Glyph (Logo-Lockup).
   *  false = nur der weiße Glyph (transparent), z. B. als Maskottchen auf dunklem Grund. */
  framed?: boolean
  /** Farbe des Glyphs (Standard weiß) */
  color?: string
  className?: string
}

export function FlatpayMark({
  size = 96,
  framed = true,
  color = '#ffffff',
  className,
}: FlatpayMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flatpay"
      className={className}
    >
      {framed && <rect width="256" height="256" rx="56" fill="#000000" />}
      {/* zentraler Balken */}
      <rect x="110" y="62" width="36" height="132" rx="6" fill={color} />
      {/* linkes Quadrat */}
      <rect x="54" y="110" width="36" height="36" rx="6" fill={color} />
      {/* rechtes Quadrat */}
      <rect x="166" y="110" width="36" height="36" rx="6" fill={color} />
    </svg>
  )
}

// Animiertes Maskottchen für Gratulation / Onboarding: der Glyph mit
// dezentem Glow und „atmenden" Seitenquadraten.
export function FlatpayMascot({ size = 132 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flatpay"
      className="fp-mascot"
    >
      <rect x="110" y="62" width="36" height="132" rx="6" fill="#fff" className="fp-bar" />
      <rect x="54" y="110" width="36" height="36" rx="6" fill="#fff" className="fp-sq fp-sq-l" />
      <rect x="166" y="110" width="36" height="36" rx="6" fill="#fff" className="fp-sq fp-sq-r" />
    </svg>
  )
}
