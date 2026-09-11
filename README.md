# IEDC Summit 2026 — Web App

Mobile-first companion app for **IEDC Summit 2026** — 28 September 2026, Sahrdaya College of
Engineering & Technology, Kodakara, Thrissur.

Vite + Vue 3 + Tailwind v4. Agenda and speaker data come from the
[`@kerala-startup-mission/agenda`](https://www.npmjs.com/package/@kerala-startup-mission/agenda)
package — its data loaders only, with a custom UI; the package's own embeddable widgets are
never mounted.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Configuration

Every event-specific value is an env var, so the app re-points at a future edition without a
code change:

| Variable | Purpose |
| --- | --- |
| `VITE_EVENT_BASE_URL` | Events API origin |
| `VITE_EVENT_SLUG` | Event slug used for every API call |
| `VITE_EVENT_BANNER` | Home hero banner image (served from `public/`) |
| `VITE_EVENT_NAME` | Banner alt text; hero title when no banner is set |
| `VITE_EVENT_DATE` | Hero date line when no banner is set |
| `VITE_EVENT_VENUE` | Hero venue band when no banner is set |
| `VITE_EVENT_SPEAKER_CATEGORIES` | Speaker categories to show, in display order; empty shows all |

The 2026 banner (`public/summit-hero.png`, 1600×400) already carries the event name, date,
venue and KSUM logo, so it stands in for the whole hero. Clear `VITE_EVENT_BANNER` to fall
back to the text card built from the three values below it.

### Speaker categories

An event can publish speakers under several categories (2025 had five: Speakers, Partners,
Webinar, Club Event Speakers, Govt Official). By default every category is shown. To pick a
subset, list them comma-separated — the order you write is the order the filter chips appear
in:

```
VITE_EVENT_SPEAKER_CATEGORIES=Partners, Speakers
```

Matching ignores case and surrounding spaces. A name that no category matches is skipped and
reported in the browser console along with the categories the event actually publishes, so a
typo shows up instead of silently shortening the list. With one category left after filtering,
the chip row hides itself.

To develop against a populated agenda (the 2026 agenda is not published yet), set
`VITE_EVENT_SLUG=iedc-summit-2025` and restart — last year's event has 128 sessions across 20
venues and 168 speakers in 5 categories.

## Scripts

```bash
pnpm dev      # dev server
pnpm test     # node --test, covers the API shape helpers in src/event.js
pnpm build    # production build to dist/
pnpm preview  # serve the production build
```

## Pages

| Route | Source |
| --- | --- |
| `/` | Env values |
| `/agenda` | `loadAgendaData` — date, venue and session data |
| `/speakers` | `loadSpeakersData` — searchable, filtered by category |
| `/speakers/:hid` | `loadSpeaker` — profile plus the sessions that speaker is in |
| `/venue-map`, `/travel-plan` | Placeholders |

## Offline support

A Workbox service worker (via `vite-plugin-pwa`, `generateSW` mode) is generated at build
time, so the app keeps working without a connection once it has been opened.

**Precached** — every built asset: the app shell, all five route chunks (so any page works
offline, not just the ones visited), the agenda package chunk, CSS, favicon and banner.
`index.html` is registered as the navigation fallback, so deep links like `/speakers/46x6Y`
resolve offline too.

**Runtime caches** — configured in [vite.config.js](vite.config.js):

| What | Strategy | Notes |
| --- | --- | --- |
| `/api/event/…` | NetworkFirst, 5s timeout | Fresh when online, last response offline. 7 days, 200 entries. Matched by path so a runtime-configured API origin still hits it |
| Speaker photos | CacheFirst | 30 days, 400 entries; `[0, 200]` since `<img>` responses are opaque |
| Google Fonts CSS | StaleWhileRevalidate | |
| Google Fonts files | CacheFirst | 1 year |
| `config.js` | NetworkFirst, 3s timeout | Deliberately **not** precached — it is rewritten on every container start, and precaching would pin the app to the configuration baked into the image |

**Cache warming.** A service worker can only serve what was requested at some point, so
opening just the home screen and then losing signal would leave Agenda and Speakers broken.
`warmCache()` in [src/event.js](src/event.js), called from [src/main.js](src/main.js), fetches
both lists on idle after first paint. It also makes the first navigation instant. Skipped when
`navigator.onLine` is false, and deferred to `requestIdleCallback` so the ~194KB agenda chunk
does not compete with first paint.

**Speaker detail fallback.** There are ~170 speaker detail endpoints and only the visited ones
get cached. When one is unreachable, [SpeakerView](src/views/SpeakerView.vue) falls back to
that speaker's entry in the cached list, which carries everything except `bio` and `agendas` —
both already hidden when empty. The error state still appears if the speaker is in neither
place.

The Workbox runtime is inlined into a single `sw.js` rather than split into a separately
hashed `workbox-*.js`, so there is one file to serve and nothing to keep in sync. nginx sends
`no-store` for `sw.js`, `registerSW.js` and `config.js`; a stale service worker would pin
visitors to an old precache manifest.

`registerType` is `autoUpdate`, so a new deploy takes over on the next visit. The service
worker is disabled in `pnpm dev` — use `pnpm build && pnpm preview` to exercise it.

> Not verified live in this environment: service worker registration fails inside the
> sandboxed browser used during development (it rejects even a 134-byte worker script), so
> offline behaviour was confirmed by inspecting the generated `sw.js` rather than by going
> offline. To check it yourself: `pnpm build && pnpm preview`, open the app, then in DevTools
> → Application → Service Workers tick **Offline** and reload.

No web app manifest is generated (`manifest: false`) — this is offline caching, not an
installable PWA. Say the word if you want the install prompt and icons.

## Docker

```bash
docker build -t iedcsummit-webapp:2026 .
docker run --rm -p 8080:80 iedcsummit-webapp:2026
```

Multi-stage: Node 22 builds with pnpm, nginx 1.29 serves the static output (~92 MB image).
The nginx config handles the history-mode fallback, so deep links like `/speakers/46x6Y`
work on reload, and serves hashed assets immutable for a year while keeping `index.html`
uncached.

### Configuring the image

Set `VITE_*` as ordinary **runtime** environment variables — no rebuild, no build args:

```bash
docker run --rm -p 8080:80 \
  -e VITE_EVENT_SLUG=iedc-summit-2025 \
  -e VITE_EVENT_NAME="IEDC Summit 2025" \
  -e "VITE_EVENT_SPEAKER_CATEGORIES=Partners, Speakers" \
  iedcsummit-webapp:2026
```

Vite normally inlines `VITE_*` at build time, which is why `docker run -e` has no effect on a
plain Vite image. [`docker/40-write-config.sh`](docker/40-write-config.sh) works around that:
nginx runs it from `/docker-entrypoint.d/` on every container start, and it regenerates
`config.js` from the container's environment. The app reads that first and falls back to the
build-time value for anything the container does not define, so partial configuration is safe.
An explicitly empty value is honoured rather than ignored — `-e VITE_EVENT_BANNER=` clears the
banner and restores the text hero.

**On Dokploy:** put these in the application's normal **Environment** tab. The separate *Build
Time Arguments* field (Dockerfile build type only) still works and sets the baked-in defaults,
but it is no longer required — runtime variables take precedence over it.

### Build-time defaults

The `ARG`s in the Dockerfile set the values used when the container defines nothing. They
default to `.env.example`, so a plain `docker build .` produces the 2026 app. To change what an
image falls back to:

```bash
docker build -t iedcsummit-webapp:2025 \
  --build-arg VITE_EVENT_SLUG=iedc-summit-2025 \
  --build-arg VITE_EVENT_NAME="IEDC Summit 2025" \
  --build-arg VITE_EVENT_BANNER= \
  --build-arg "VITE_EVENT_SPEAKER_CATEGORIES=Partners, Speakers" .
```

A local `.env` is excluded via `.dockerignore` so it can never silently override a build arg.

## GitHub Pages

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes on every
push to `main`, and can be run manually from the Actions tab. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow installs with pnpm, runs `pnpm test`, builds, and uploads `dist/`. Two details
specific to Pages are handled for you:

- **Base path.** A project site is served from `/<repo>/`, not the domain root, so the build
  passes `--base`. A `<owner>.github.io` repository gets `/` instead. The router reads
  `import.meta.env.BASE_URL`, and `withBase()` in [src/event.js](src/event.js) applies the same
  prefix to the banner so it does not 404 under a subpath.
- **Deep links.** Pages cannot rewrite unmatched paths, so the workflow copies `index.html` to
  `404.html`. Pages serves that for `/speakers/46x6Y`, the app boots and the router resolves the
  URL. The response carries a 404 status — that is inherent to the technique and does not
  affect what the visitor sees.

### Configuring the deploy

Set any `VITE_*` value as a **repository secret** (Settings → Secrets and variables → Actions)
and it overrides the matching line in `.env.example` at build time. Anything you don't set
keeps its committed default, so you can override just the slug and leave the rest alone.

> These values are inlined into the JavaScript bundle and the published site is public, so a
> secret configured here is **not** hidden from visitors — it only keeps the value out of the
> repository. That's fine for everything the app needs (a public API base URL, an event slug,
> display text); don't put a credential in one.

The merge is done by [`.github/scripts/write-env.mjs`](.github/scripts/write-env.mjs), which
reads `toJSON(secrets)` on stdin. Passing the secrets through a workflow `env:` block instead
would break partial configuration: an unset secret expands to `""`, and an empty `VITE_*` in
the environment overrides `.env` rather than falling through to it.

## Deploying elsewhere

The router uses HTML5 history mode, so any host must serve `index.html` for unmatched paths.
Netlify: `/* /index.html 200` in `public/_redirects`. Vercel: a rewrite of `/(.*)` to
`/index.html`. Nginx: see [docker/nginx.conf](docker/nginx.conf).
