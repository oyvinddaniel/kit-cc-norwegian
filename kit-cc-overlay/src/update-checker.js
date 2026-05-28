/**
 * Automatisk versjonssjekk for Kit CC Monitor
 *
 * Sjekker versjon mot npm registry ved oppstart og hvert 24. time.
 * Cacher resultatet i .update-cache.json.
 * Sender SSE-event til klienter ved ny versjon.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 timer
const NPM_REGISTRY_URL = 'https://registry.npmjs.org/kit-cc-overlay/latest'
const CACHE_FILENAME = '.update-cache.json'

/**
 * Sjekk om en ny versjon er tilgjengelig
 * @param {string} currentVersion - Nåværende versjon (fra package.json)
 * @param {string} overlayDir - Sti til kit-cc-overlay/
 * @returns {Promise<{hasUpdate: boolean, latestVersion?: string, currentVersion: string}>}
 */
export async function checkForUpdates(currentVersion, overlayDir) {
  const cachePath = join(overlayDir, CACHE_FILENAME)

  // Sjekk cache
  try {
    if (existsSync(cachePath)) {
      const cache = JSON.parse(readFileSync(cachePath, 'utf-8'))
      const age = Date.now() - (cache.lastCheck || 0)
      if (age < CHECK_INTERVAL_MS && cache.latestVersion) {
        return {
          hasUpdate: isNewer(cache.latestVersion, currentVersion),
          latestVersion: cache.latestVersion,
          currentVersion,
          cached: true
        }
      }
    }
  } catch {}

  // Hent fra npm registry
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(NPM_REGISTRY_URL, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return { hasUpdate: false, currentVersion, error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    const latestVersion = data.version

    if (!latestVersion) {
      return { hasUpdate: false, currentVersion, error: 'Ingen versjon funnet' }
    }

    // Oppdater cache
    const cacheData = { lastCheck: Date.now(), latestVersion, currentVersion }
    try { writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf-8') } catch {}

    return {
      hasUpdate: isNewer(latestVersion, currentVersion),
      latestVersion,
      currentVersion
    }
  } catch (err) {
    return { hasUpdate: false, currentVersion, error: err.message }
  }
}

/**
 * Start periodisk versjonssjekk
 * @param {import('./sse.js').SSEManager} sseManager
 * @param {string} currentVersion
 * @param {string} overlayDir
 * @returns {{ stop: () => void }}
 */
export function startUpdateChecker(sseManager, currentVersion, overlayDir) {
  let intervalId = null

  const doCheck = async () => {
    const result = await checkForUpdates(currentVersion, overlayDir)
    if (result.hasUpdate) {
      console.log(`📦 Ny versjon tilgjengelig: v${result.latestVersion} (du har v${currentVersion})`)
      sseManager.broadcast('UPDATE_AVAILABLE', {
        current: currentVersion,
        latest: result.latestVersion
      })
    }
  }

  // Sjekk ved oppstart (forsinket 10 sek for å la serveren starte)
  setTimeout(doCheck, 10000)

  // Periodisk sjekk
  intervalId = setInterval(doCheck, CHECK_INTERVAL_MS)

  return {
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }
}

/**
 * Enkel semver-sammenligning: er "latest" nyere enn "current"?
 * Håndterer standard x.y.z format.
 */
function isNewer(latest, current) {
  if (!latest || !current) return false
  const parse = (v) => String(v).replace(/^v/, '').split('.').map(Number)
  const l = parse(latest)
  const c = parse(current)
  for (let i = 0; i < 3; i++) {
    if ((l[i] || 0) > (c[i] || 0)) return true
    if ((l[i] || 0) < (c[i] || 0)) return false
  }
  return false
}
