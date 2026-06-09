// ── Booker-Profil (eigener Name für die Skript-Texte) ───────────────────────
const NAME_KEY = 'fp-user-name-v1'

export function getUserName(): string {
  try {
    return localStorage.getItem(NAME_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

export function setUserName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name.trim())
  } catch {
    /* ignore */
  }
}

// Fallback, falls (noch) kein Name hinterlegt ist
export function nameOrFallback(): string {
  return getUserName() || '[dein Name]'
}
