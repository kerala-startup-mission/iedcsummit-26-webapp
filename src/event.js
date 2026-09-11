/**
 * Event configuration and data access.
 *
 * Agenda and speaker data come from the `@kerala-startup-mission/agenda` package's
 * loaders only — its bundled Svelte widgets are never mounted, so it injects no CSS.
 * The bundle is ~400KB, so it is imported dynamically to keep it out of the entry chunk.
 */

// `?? {}` so the pure helpers below stay importable from plain Node (see event.test.js).
const env = import.meta.env ?? {}

// Written by public/config.js, which the Docker image regenerates from container
// environment variables at startup. Lets one image serve any event without a rebuild;
// empty or absent (dev servers, static hosts) falls through to the build-time values.
const runtime = (typeof window !== 'undefined' && window.__EVENT_CONFIG__) || {}

/**
 * Runtime value if present, otherwise the value Vite inlined at build time.
 *
 * Only a missing key falls through. An explicitly empty value is honoured, so
 * `-e VITE_EVENT_BANNER=` clears the banner instead of silently restoring the baked-in
 * one — the entrypoint writes only variables the container actually has, so an empty
 * string here is always deliberate.
 */
export function setting(key, source = runtime, fallback = env) {
  const value = source?.[key]
  return value === undefined || value === null ? fallback?.[key] : value
}

export const config = {
  url: setting('VITE_EVENT_BASE_URL'),
  event: setting('VITE_EVENT_SLUG'),
  name: setting('VITE_EVENT_NAME'),
  banner: withBase(setting('VITE_EVENT_BANNER'), env.BASE_URL),
  date: setting('VITE_EVENT_DATE'),
  venue: setting('VITE_EVENT_VENUE'),
  /** Speaker categories to show, in display order. Empty means show every category. */
  speakerCategories: splitList(setting('VITE_EVENT_SPEAKER_CATEGORIES')),
}

/**
 * Resolve a `public/` asset path against the app's base path.
 *
 * On a GitHub Pages project site the app is served from `/<repo>/`, so a configured
 * `/summit-hero.png` would 404 at the domain root. Absolute URLs are left alone.
 */
export function withBase(path, base = '/') {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path)) return path
  return `${String(base || '/').replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

/** Comma-separated env value -> trimmed list, with blanks dropped. */
function splitList(value) {
  return String(value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

const pkg = () => import('@kerala-startup-mission/agenda')

let agendaPromise
let speakersPromise

/** `{ raw, agenda, categories, venues, dates, venuesByDate }` — cached for the session. */
export function getAgenda() {
  agendaPromise ??= pkg()
    .then((m) => m.loadAgendaData(config))
    .catch((error) => {
      agendaPromise = undefined // let a retry actually re-fetch
      throw error
    })
  return agendaPromise
}

/** `{ raw, speakers }` where `speakers` is `[[category, [speaker, ...]], ...]`. */
export function getSpeakers() {
  speakersPromise ??= pkg()
    .then((m) => m.loadSpeakersData(config))
    .catch((error) => {
      speakersPromise = undefined
      throw error
    })
  return speakersPromise
}

/** Single speaker detail — adds `bio` and `agendas[]`. Not cached; pages are transient. */
export function getSpeaker(hid) {
  return pkg().then((m) => m.loadSpeaker({ ...config, hid }))
}

/**
 * The list entry for a speaker, used when the detail endpoint is unreachable.
 *
 * The list carries everything the detail response does except `bio` and `agendas`, so an
 * offline visitor still gets a usable profile instead of an error page.
 */
export async function findSpeaker(hid) {
  const { speakers } = await getSpeakers()
  return speakers.flatMap(([, people]) => people).find((person) => person.id === hid) ?? null
}

/**
 * Fetch the agenda and speaker lists in the background on first load.
 *
 * The service worker can only serve what was actually requested at some point, so without
 * this a visitor who opens the home screen and then loses signal finds both pages broken.
 * Warming them also makes the first navigation instant, since the promises are cached.
 *
 * Deferred to idle: it pulls the ~194KB agenda chunk that is code-split away from the
 * entry bundle on purpose, and that should not compete with first paint.
 */
export function warmCache() {
  if (typeof window === 'undefined' || navigator.onLine === false) return
  const warm = () => {
    // Failures are ignored: the loaders clear their cached promise on error, so the
    // views retry on their own. This is opportunistic only.
    getAgenda().catch(() => {})
    getSpeakers().catch(() => {})
  }
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 5000 })
  else setTimeout(warm, 2000)
}

/**
 * An agenda item's `speakers` is `{ category: [speaker, ...] }` when it has any and
 * the empty array `[]` when it does not. Flatten both to a plain list.
 */
export function sessionSpeakers(item) {
  const speakers = item?.speakers
  if (!speakers || Array.isArray(speakers)) return []
  return Object.values(speakers).flat()
}

/**
 * `"2025-12-22 10:00:00"` -> `"10:00 AM"`.
 *
 * Formatted by hand rather than via `Intl`: ICU disagrees across engines on both the
 * meridiem case (`en-IN` gives "am") and the separator (newer ICU uses U+202F for
 * `en-US`), which made the same timestamp render differently in Node and in Chrome.
 * The API sends no timezone offset, so these are read as local event time.
 */
export function formatTime(sqlTime) {
  if (!sqlTime) return ''
  const date = new Date(String(sqlTime).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return ''
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`
}

/** `"10:00 AM – 11:20 AM"`, collapsing to just the start when there is no end. */
export function timeRange(start, end) {
  const from = formatTime(start)
  const to = formatTime(end)
  return from && to ? `${from} – ${to}` : from || to
}

/**
 * Venue and category strings from the API carry trailing whitespace and tabs
 * (e.g. `"LEEE (Hardware Lab 4)\t\t\t"`), which otherwise renders the same venue twice.
 */
export function clean(value) {
  return String(value ?? '').trim()
}

/**
 * Pick and order the speaker groups named in `wanted`, which come from config.
 *
 * Filtered here rather than through the loader's `categories` option: the API matches
 * `?category=` exactly and case-sensitively, returns `[]` for anything it doesn't
 * recognise, and ships category names with trailing whitespace — so one typo or stray
 * space in an env file would silently empty the page. Matching locally is forgiving and
 * lets the caller report names that matched nothing.
 *
 * @param groups `[[category, [speaker, ...]], ...]` from `loadSpeakersData`
 * @param wanted category names in the order they should appear; empty means all
 */
export function selectCategories(groups, wanted) {
  if (!wanted?.length) return groups
  const available = new Map(groups.map((group) => [clean(group[0]).toLowerCase(), group]))
  return wanted.map((name) => available.get(clean(name).toLowerCase())).filter(Boolean)
}

/** First letters of the first two words, for the avatar fallback when a photo fails. */
export function initials(name) {
  return clean(name)
    .split(/\s+/)
    .filter((word) => /[a-z]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
