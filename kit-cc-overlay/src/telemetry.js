/**
 * Opt-in feilrapportering for Kit CC Monitor
 *
 * 100% opt-in — ingen data sendes uten eksplisitt brukersamtykke.
 * Samtykke lagres i .telemetry-consent fil.
 * Feil samles i batch og sendes periodisk til telemetri-endepunkt.
 * Alle data saniteres: ingen filstier, API-nøkler eller brukerdata.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const CONSENT_FILENAME = '.telemetry-consent'
const CONSENT_VERSION = '1.0'  // Bump ved endring i hva som samles inn
const FLUSH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutter
const MAX_QUEUE_SIZE = 50
const TELEMETRY_ENDPOINT = 'https://telemetry.kit-cc.dev/v1/errors' // Konfiguerbar

/**
 * Initialiser telemetri-systemet
 * @param {string} overlayDir - Sti til kit-cc-overlay/
 * @returns {{ isEnabled: () => boolean, consent: () => void, decline: () => void, reportError: (err: Error, context?: object) => void, flush: () => Promise<void>, getStatus: () => object, stop: () => void }}
 */
export function initTelemetry(overlayDir) {
  // Samtykke er per-bruker (hjemmemappe), ikke per-prosjekt.
  // Dette sikrer at brukerens valg gjelder på tvers av alle prosjekter.
  const userConfigDir = join(homedir(), '.kit-cc')
  try { mkdirSync(userConfigDir, { recursive: true }) } catch {}
  const consentPath = join(userConfigDir, CONSENT_FILENAME)
  let enabled = false
  const queue = []
  let flushTimer = null

  // Respekter DO_NOT_TRACK miljøvariabel (standard i bransjen)
  if (process.env.DO_NOT_TRACK === '1') {
    return { isEnabled: () => false, consent: () => {}, decline: () => {}, reportError: () => {}, flush: async () => {}, getStatus: () => ({ enabled: false, queueSize: 0, doNotTrack: true }), stop: () => {} }
  }

  // Les samtykke-status
  try {
    if (existsSync(consentPath)) {
      const data = JSON.parse(readFileSync(consentPath, 'utf-8'))
      // Sjekk at samtykke gjelder gjeldende versjon
      enabled = data.consented === true && data.consentVersion === CONSENT_VERSION
    }
  } catch {}

  // Start periodisk flush hvis aktivert
  if (enabled) {
    flushTimer = setInterval(() => flush(), FLUSH_INTERVAL_MS)
  }

  function isEnabled() {
    return enabled
  }

  function consent() {
    enabled = true
    const data = { consented: true, consentVersion: CONSENT_VERSION, consentedAt: new Date().toISOString() }
    try { writeFileSync(consentPath, JSON.stringify(data, null, 2), 'utf-8') } catch {}
    if (!flushTimer) {
      flushTimer = setInterval(() => flush(), FLUSH_INTERVAL_MS)
    }
  }

  function decline() {
    enabled = false
    queue.length = 0
    const data = { consented: false, declinedAt: new Date().toISOString() }
    try { writeFileSync(consentPath, JSON.stringify(data, null, 2), 'utf-8') } catch {}
    if (flushTimer) {
      clearInterval(flushTimer)
      flushTimer = null
    }
  }

  /**
   * Legg til en feil i køen (kun hvis opt-in)
   */
  function reportError(err, context = {}) {
    if (!enabled) return

    const sanitized = sanitizeError(err, context)
    if (queue.length >= MAX_QUEUE_SIZE) {
      queue.shift() // Fjern eldste
    }
    queue.push(sanitized)
  }

  /**
   * Send batch til telemetri-endepunkt
   */
  async function flush() {
    if (!enabled || queue.length === 0) return

    const batch = queue.splice(0, queue.length)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      // Verifiser at endepunktet er HTTPS og riktig domene (forhindrer MITM)
      const url = new URL(TELEMETRY_ENDPOINT)
      if (url.protocol !== 'https:' || !url.hostname.endsWith('.kit-cc.dev')) {
        throw new Error('Ugyldig telemetri-endepunkt')
      }
      await fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: batch }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
    } catch {
      // Legg feilene tilbake i køen ved nettverksfeil
      queue.unshift(...batch.slice(0, MAX_QUEUE_SIZE - queue.length))
    }
  }

  function getStatus() {
    return {
      enabled,
      queueSize: queue.length,
      consentPath
    }
  }

  function stop() {
    if (flushTimer) {
      clearInterval(flushTimer)
      flushTimer = null
    }
  }

  return { isEnabled, consent, decline, reportError, flush, getStatus, stop }
}

/**
 * Sanitér feildata — fjern sensitive opplysninger
 */
function sanitizeError(err, context) {
  const sanitized = {
    type: err.name || 'Error',
    message: sanitizeString(err.message || 'Unknown error'),
    stack: sanitizeStack(err.stack),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    monitorVersion: context.monitorVersion || 'unknown',
    timestamp: new Date().toISOString()
  }

  if (context.route) sanitized.route = context.route
  if (context.method) sanitized.method = context.method

  return sanitized
}

/**
 * Fjern filstier og sensitive data fra en streng
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/\/[^\s:]+/g, '<path>')                          // Unix-stier
    .replace(/[A-Z]:\\[^\s:]+/g, '<path>')                     // Windows-stier
    .replace(/sk-[a-zA-Z0-9_-]+/g, '<key>')                   // Anthropic API-nøkler (sk-ant-*)
    .replace(/gsk_[a-zA-Z0-9_-]+/g, '<key>')                  // Groq API-nøkler
    .replace(/AI[a-zA-Z0-9_-]{30,}/g, '<key>')                // Google API-nøkler
    .replace(/xai-[a-zA-Z0-9_-]+/g, '<key>')                  // xAI API-nøkler
    .replace(/AKIA[A-Z0-9]{16}/g, '<key>')                    // AWS Access Key ID
    .replace(/Bearer\s+[a-zA-Z0-9._-]+/g, 'Bearer <token>')  // Bearer tokens
    .replace(/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '<jwt>') // JWT tokens
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '<email>')      // E-postadresser
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<ip>')                 // IPv4-adresser
    .replace(/mongodb(\+srv)?:\/\/[^\s]+/g, '<connection-string>')                // MongoDB-strenger
    .replace(/postgres(ql)?:\/\/[^\s]+/g, '<connection-string>')                  // PostgreSQL-strenger
    .slice(0, 500)
}

/**
 * Sanitér stack trace — behold struktur men fjern stier
 */
function sanitizeStack(stack) {
  if (!stack || typeof stack !== 'string') return ''
  return stack
    .split('\n')
    .slice(0, 10)
    .map(line => line.replace(/\(\/[^)]+\)/g, '(<path>)').replace(/at \/[^\s]+/g, 'at <path>'))
    .join('\n')
    .slice(0, 1000)
}
