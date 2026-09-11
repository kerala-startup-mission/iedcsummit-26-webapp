/**
 * Build .env from the committed .env.example, overlaying any VITE_* repository secrets.
 *
 * Reads the secrets as JSON on stdin (`toJSON(secrets)` in the workflow), which contains
 * only secrets that are actually set. That matters: an unset secret expands to "" in a
 * workflow `env:` block, and an empty VITE_* in the environment overrides .env rather than
 * falling through to it — so enumerating them that way would blank every value the
 * repository has not defined.
 *
 * Values are written JSON-quoted so spaces, `&`, `#` and newlines survive dotenv parsing.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const secrets = JSON.parse(readFileSync(0, 'utf8') || '{}')
const overrides = Object.fromEntries(
  Object.entries(secrets).filter(([key]) => key.startsWith('VITE_')),
)

const applied = new Set()
const lines = readFileSync('.env.example', 'utf8').split('\n')

const merged = lines.map((line) => {
  const key = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/)?.[1]
  if (!key || !(key in overrides)) return line
  applied.add(key)
  return `${key}=${JSON.stringify(String(overrides[key]))}`
})

for (const [key, value] of Object.entries(overrides)) {
  if (!applied.has(key)) merged.push(`${key}=${JSON.stringify(String(value))}`)
}

writeFileSync('.env', merged.join('\n'))

const names = Object.keys(overrides).sort()
console.log(
  names.length
    ? `Applied ${names.length} secret override(s): ${names.join(', ')}`
    : 'No VITE_* secrets set; using .env.example defaults.',
)
