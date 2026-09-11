import test from 'node:test'
import assert from 'node:assert/strict'
import { badgeUrl, normalizeCode, readCodeFromUrl } from './ticket.js'

test('normalizeCode accepts real ticket codes and rejects everything else', () => {
  assert.equal(normalizeCode('GD-b6QRMakDVo'), 'GD-b6QRMakDVo')
  assert.equal(normalizeCode('  GD-b6QRMakDVo  '), 'GD-b6QRMakDVo')
  assert.equal(normalizeCode('a.b_c-1'), 'a.b_c-1')

  assert.equal(normalizeCode(''), '')
  assert.equal(normalizeCode(null), '')
  assert.equal(normalizeCode(undefined), '')

  // The code goes into a URL, so anything path- or markup-shaped is refused outright.
  assert.equal(normalizeCode('../../etc/passwd'), '')
  assert.equal(normalizeCode('<script>alert(1)</script>'), '')
  assert.equal(normalizeCode('abc/badge?x=1'), '')
  assert.equal(normalizeCode('has space'), '')
  assert.equal(normalizeCode('a'.repeat(65)), '')
  assert.equal(normalizeCode('a'.repeat(64)), 'a'.repeat(64))
})

test('readCodeFromUrl pulls the code out of a query string', () => {
  assert.equal(readCodeFromUrl('?code=GD-b6QRMakDVo'), 'GD-b6QRMakDVo')
  assert.equal(readCodeFromUrl('?foo=1&code=ABC123&bar=2'), 'ABC123')
  assert.equal(readCodeFromUrl('?code='), '')
  assert.equal(readCodeFromUrl('?other=1'), '')
  assert.equal(readCodeFromUrl(''), '')
  assert.equal(readCodeFromUrl('?code=not%20valid'), '')
})

test('badgeUrl builds the ticketing URL, or nothing for a bad code', () => {
  assert.equal(
    badgeUrl('GD-b6QRMakDVo'),
    'https://tickets.startupmission.in/api/checkin/tickets/GD-b6QRMakDVo/badge',
  )
  assert.equal(badgeUrl('../../etc/passwd'), '')
  assert.equal(badgeUrl(''), '')

  // A valid code needs no escaping, but the encode stays as defence in depth.
  assert.ok(!badgeUrl('a.b_c-1').includes('..'))
})
