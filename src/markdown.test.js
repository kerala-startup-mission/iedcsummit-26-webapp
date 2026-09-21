import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from './markdown.js'

test('renders the Markdown organisers actually use', () => {
  // Taken from real iedc-summit-2025 descriptions.
  assert.match(renderMarkdown('**Topic :** BioDesign'), /<strong>Topic :<\/strong>/)
  assert.match(renderMarkdown('## Highlights'), /<h2>Highlights<\/h2>/)
  assert.match(renderMarkdown('* Practical sessions\n* Industry trainers'), /<ul>[\s\S]*<li>/)
  assert.match(renderMarkdown('1. First\n2. Second'), /<ol>[\s\S]*<li>/)
  assert.match(renderMarkdown('_emphasis_'), /<em>emphasis<\/em>/)
})

test('single newlines become line breaks', () => {
  // Most 2026 descriptions are prose with newlines and no blank lines between them.
  const html = renderMarkdown('Room: AI LAB · 1st floor\nBuild your first AI agent.')
  assert.match(html, /<br>/)
  assert.match(html, /Room: AI LAB · 1st floor/)
})

test('empty input renders nothing, so callers can v-if on it', () => {
  assert.equal(renderMarkdown(''), '')
  assert.equal(renderMarkdown('   \n  '), '')
  assert.equal(renderMarkdown(null), '')
  assert.equal(renderMarkdown(undefined), '')
  assert.equal(renderMarkdown(42), '')
})

test('raw HTML in the description is escaped, not executed', () => {
  // The text comes from the API and is injected with v-html, so this is the trust boundary.
  const html = renderMarkdown('<script>alert(1)</script>')
  assert.ok(!html.includes('<script>'), 'script tag must not survive')
  assert.match(html, /&lt;script&gt;/)

  const img = renderMarkdown('<img src=x onerror=alert(1)>')
  assert.ok(!/<img/i.test(img), 'raw img tag must not survive')
})

test('dangerous link schemes are rejected', () => {
  const js = renderMarkdown('[tap me](javascript:alert(1))')
  assert.ok(!/href="javascript:/i.test(js), 'javascript: href must not survive')

  const vb = renderMarkdown('[tap me](vbscript:msgbox(1))')
  assert.ok(!/href="vbscript:/i.test(vb))
})

test('ordinary links open outside the app', () => {
  const html = renderMarkdown('[Register](https://iedcsummit.in/)')
  assert.match(html, /href="https:\/\/iedcsummit\.in\/"/)
  assert.match(html, /target="_blank"/)
  assert.match(html, /rel="noopener noreferrer"/)

  // linkify picks up bare URLs too, and they get the same treatment.
  const bare = renderMarkdown('See https://iedcsummit.in/ for details')
  assert.match(bare, /<a[^>]+target="_blank"/)
})
