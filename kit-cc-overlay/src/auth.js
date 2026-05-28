/**
 * Autentisering for Kit CC Monitor
 *
 * Tre auth-metoder (sjekkes i rekkefølge):
 *   1. httpOnly cookie "kit_cc_auth" (settes automatisk ved HTML-levering)
 *   2. Authorization: Bearer <token> header (for programmatisk tilgang)
 *   3. ?token=<token> query parameter (fallback for SSE/EventSource)
 *
 * Token genereres automatisk ved første oppstart og lagres i .auth-token.
 * Token eksponeres ALDRI i HTML-kildekode (ingen window.__KIT_CC_TOKEN).
 */

import { randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Generer en tilfeldig 32-byte hex-token
 */
export function generateToken() {
  return randomBytes(32).toString('hex')
}

/**
 * Les eksisterende token eller opprett ny.
 * Token lagres i overlayDir/.auth-token
 * @param {string} overlayDir - Sti til kit-cc-overlay/
 * @returns {string} Auth token
 */
export function loadOrCreateToken(overlayDir) {
  const tokenPath = join(overlayDir, '.auth-token')

  if (existsSync(tokenPath)) {
    try {
      const token = readFileSync(tokenPath, 'utf-8').trim()
      if (token.length === 64) return token
    } catch {}
  }

  const token = generateToken()
  writeFileSync(tokenPath, token, 'utf-8')

  // Sett filrettigheter (kun eier kan lese/skrive) — skip på Windows
  if (process.platform !== 'win32') {
    try { chmodSync(tokenPath, 0o600) } catch {}
  }

  return token
}

/**
 * Express middleware for Bearer token-autentisering.
 * Godtar token via (sjekkes i rekkefølge):
 *   1. Cookie: kit_cc_auth=<token> (httpOnly, satt av serveHtmlWithCookie)
 *   2. Authorization: Bearer <token> (header)
 *   3. ?token=<token> (query parameter, fallback)
 *
 * Bruker timing-safe sammenligning for å forhindre timing-angrep.
 *
 * @param {string} expectedToken - Forventet auth token
 * @returns {import('express').RequestHandler}
 */
export function authMiddleware(expectedToken) {
  const expectedBuf = Buffer.from(expectedToken, 'utf-8')

  return (req, res, next) => {
    let provided = null

    // 1. Sjekk cookie (primær — settes automatisk ved HTML-levering)
    const cookies = parseCookies(req.headers.cookie || '')
    if (cookies.kit_cc_auth) {
      provided = cookies.kit_cc_auth
    }

    // 2. Sjekk Authorization header (for programmatisk tilgang)
    if (!provided) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        provided = authHeader.slice(7)
      }
    }

    // 3. Sjekk query parameter (fallback)
    if (!provided && req.query.token) {
      provided = String(req.query.token)
      // Strip token from query to prevent it from appearing in logs/browser history
      delete req.query.token
      // Also clean the URL so express doesn't expose it downstream
      const url = new URL(req.originalUrl, `http://${req.headers.host}`)
      url.searchParams.delete('token')
      req.originalUrl = url.pathname + url.search
    }

    if (!provided) {
      return res.status(401).json({ error: 'Mangler autentisering. Bruk Authorization: Bearer <token>' })
    }

    // Timing-safe sammenligning
    const providedBuf = Buffer.from(provided, 'utf-8')
    if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
      return res.status(401).json({ error: 'Ugyldig token' })
    }

    next()
  }
}

/**
 * Parse cookies fra Cookie-header (enkel parser, ingen avhengigheter)
 * @param {string} cookieHeader
 * @returns {Record<string, string>}
 */
function parseCookies(cookieHeader) {
  const cookies = {}
  if (!cookieHeader) return cookies
  for (const pair of cookieHeader.split(';')) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    const key = pair.slice(0, idx).trim()
    const val = pair.slice(idx + 1).trim()
    cookies[key] = decodeURIComponent(val)
  }
  return cookies
}
