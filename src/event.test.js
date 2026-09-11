import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clean,
  formatTime,
  initials,
  selectCategories,
  sessionSpeakers,
  setting,
  timeRange,
  withBase,
} from './event.js'

test('sessionSpeakers handles both API shapes', () => {
  // 89 of 128 sessions in the iedc-summit-2025 payload use the empty-array form.
  assert.deepEqual(sessionSpeakers({ speakers: [] }), [])
  assert.deepEqual(sessionSpeakers({}), [])
  assert.deepEqual(sessionSpeakers(null), [])

  const grouped = { speakers: { speaker: [{ id: 'a' }, { id: 'b' }], government: [{ id: 'c' }] } }
  assert.deepEqual(
    sessionSpeakers(grouped).map((s) => s.id),
    ['a', 'b', 'c'],
  )
})

test('timeRange formats SQL timestamps', () => {
  assert.equal(timeRange('2025-12-22 10:00:00', '2025-12-22 11:20:00'), '10:00 AM – 11:20 AM')
  assert.equal(timeRange('2025-12-22 09:00:00', null), '9:00 AM')
  assert.equal(formatTime(null), '')
  assert.equal(formatTime('not a date'), '')
})

test('clean strips the tabs and trailing spaces the API ships', () => {
  assert.equal(clean('LEEE (Hardware Lab 4)\t\t\t'), 'LEEE (Hardware Lab 4)')
  assert.equal(clean('Master Class '), clean('Master Class'))
  assert.equal(clean(null), '')
})

test('initials takes up to two alphabetic words', () => {
  assert.equal(initials('Anoop Ambika'), 'AA')
  assert.equal(initials('Seeram Sambasiva Rao, IAS'), 'SS')
  assert.equal(initials(''), '')
})

test('selectCategories filters and orders speaker groups', () => {
  const groups = [
    ['Govt Official', [{ id: 'g' }]],
    ['Speakers', [{ id: 's' }]],
    ['Partners', [{ id: 'p' }]],
  ]
  const names = (result) => result.map(([category]) => category)

  // No configuration shows everything, untouched.
  assert.equal(selectCategories(groups, []), groups)
  assert.equal(selectCategories(groups, undefined), groups)

  // Configured order wins over API order.
  assert.deepEqual(names(selectCategories(groups, ['Partners', 'Speakers'])), [
    'Partners',
    'Speakers',
  ])

  // Case and stray whitespace in the env value are forgiven, as is an unknown name.
  assert.deepEqual(names(selectCategories(groups, ['  speakers '])), ['Speakers'])
  assert.deepEqual(names(selectCategories(groups, ['Speakers', 'Typo'])), ['Speakers'])
  assert.deepEqual(selectCategories(groups, ['Typo']), [])

  // A category the API ships with a trailing space is still selectable.
  assert.deepEqual(names(selectCategories([['Master Class ', []]], ['Master Class'])), [
    'Master Class ',
  ])
})

test('withBase resolves public assets against the deploy base path', () => {
  // Root deploys and dev servers.
  assert.equal(withBase('/summit-hero.png', '/'), '/summit-hero.png')
  assert.equal(withBase('summit-hero.png', '/'), '/summit-hero.png')

  // GitHub Pages project site served from /<repo>/.
  assert.equal(withBase('/summit-hero.png', '/my-repo/'), '/my-repo/summit-hero.png')
  assert.equal(withBase('summit-hero.png', '/my-repo'), '/my-repo/summit-hero.png')

  // A banner hosted elsewhere is passed through untouched.
  assert.equal(withBase('https://cdn.example.com/a.png', '/my-repo/'), 'https://cdn.example.com/a.png')

  // Unset banner stays unset, so the text hero fallback still triggers.
  assert.equal(withBase('', '/my-repo/'), '')
  assert.equal(withBase(undefined, '/my-repo/'), undefined)
})

test('setting prefers runtime config, falling back to build-time values', () => {
  const built = { VITE_EVENT_SLUG: 'iedc-summit-2026', VITE_EVENT_NAME: 'IEDC Summit 2026' }

  // Container environment wins over what Vite inlined.
  assert.equal(setting('VITE_EVENT_SLUG', { VITE_EVENT_SLUG: 'runtime' }, built), 'runtime')

  // A key the container does not define falls through to the build-time value, which is
  // what keeps partial configuration safe.
  assert.equal(setting('VITE_EVENT_SLUG', {}, built), 'iedc-summit-2026')
  assert.equal(setting('VITE_EVENT_SLUG', { VITE_EVENT_SLUG: null }, built), 'iedc-summit-2026')

  // But an explicitly empty value is honoured: `-e VITE_EVENT_BANNER=` clears the banner.
  assert.equal(setting('VITE_EVENT_BANNER', { VITE_EVENT_BANNER: '' }, built), '')

  // Nothing anywhere is undefined, not a crash.
  assert.equal(setting('VITE_MISSING', {}, built), undefined)
})
