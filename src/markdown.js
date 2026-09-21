import MarkdownIt from 'markdown-it'

/**
 * Renderer for session descriptions, which organisers write as Markdown.
 *
 * `html: false` is the security boundary: the text comes from the events API, is injected
 * with `v-html`, and this makes markdown-it escape any raw HTML in it rather than pass it
 * through. That also means no separate sanitiser is needed — markdown-it emits only its own
 * tags, and its link validator already rejects `javascript:`, `vbscript:` and non-image
 * `data:` URLs.
 *
 * `breaks: true` because descriptions are typed as prose with single newlines for layout
 * (10 of the 23 live 2026 descriptions rely on them) rather than blank-line paragraphs.
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: false,
})

// Links must leave the app rather than navigating the SPA shell away from itself.
const defaultLinkOpen =
  md.renderer.rules.link_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')
  return defaultLinkOpen(tokens, idx, options, env, self)
}

/** Markdown -> HTML. Empty string for empty input, so callers can `v-if` on the result. */
export function renderMarkdown(text) {
  const source = typeof text === 'string' ? text : ''
  return source.trim() ? md.render(source) : ''
}
