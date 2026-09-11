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

## Docker

```bash
docker build -t iedcsummit-webapp:2026 .
docker run --rm -p 8080:80 iedcsummit-webapp:2026
```

Multi-stage: Node 22 builds with pnpm, nginx 1.29 serves the static output (~92 MB image).
The nginx config handles the history-mode fallback, so deep links like `/speakers/46x6Y`
work on reload, and serves hashed assets immutable for a year while keeping `index.html`
uncached.

**Configuration is baked in at build time.** Vite inlines `VITE_*` into the bundle, so setting
these on `docker run` does nothing — pass them as build args instead. The defaults match
`.env.example`, so a plain `docker build .` produces the 2026 app. To point an image somewhere
else:

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
