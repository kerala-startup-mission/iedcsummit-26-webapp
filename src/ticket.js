/**
 * The visitor's own entry pass.
 *
 * The ticket code arrives as a `?code=` query parameter on the link in the confirmation
 * message. It is kept in localStorage so the pass still opens when the app is reopened from
 * the home screen at the gate, with no link and possibly no signal.
 *
 * This is per-visitor state, which is why it lives here rather than in event.js.
 */

/** Fixed by the ticketing system. */
const BADGE_URL = 'https://tickets.startupmission.in/api/checkin/tickets/{code}/badge'

const STORAGE_KEY = 'iedc:ticket-code'

/**
 * Accept only what a ticket code can contain (samples look like `GD-b6QRMakDVo`).
 *
 * The code is interpolated into a URL from an untrusted query string, so this — together
 * with `encodeURIComponent` in `badgeUrl` — is the trust boundary. Anything else is treated
 * as no code at all rather than being passed along.
 */
export function normalizeCode(value) {
  const code = String(value ?? '').trim()
  return /^[A-Za-z0-9._-]{1,64}$/.test(code) ? code : ''
}

/** The `code` parameter from a query string, normalized. */
export function readCodeFromUrl(search = '') {
  return normalizeCode(new URLSearchParams(search).get('code'))
}

/** Badge image URL for a code. Returns `''` for a code that fails validation. */
export function badgeUrl(code) {
  const safe = normalizeCode(code)
  return safe ? BADGE_URL.replace('{code}', encodeURIComponent(safe)) : ''
}

// Reading localStorage throws outright in some privacy modes, not just writing to it.
export function getTicketCode() {
  try {
    return normalizeCode(localStorage.getItem(STORAGE_KEY))
  } catch {
    return ''
  }
}

export function saveTicketCode(code) {
  const safe = normalizeCode(code)
  if (!safe) return ''
  try {
    localStorage.setItem(STORAGE_KEY, safe)
  } catch {
    // Storage unavailable: the pass still works for this session via the URL.
  }
  return safe
}

/**
 * Capture a `?code=` from the current URL, whichever route the link points at, and remember
 * it. A new code replaces the stored one. Returns the code now in effect.
 */
export function captureTicketCode(search = window.location.search) {
  const fromUrl = readCodeFromUrl(search)
  return fromUrl ? saveTicketCode(fromUrl) : getTicketCode()
}
