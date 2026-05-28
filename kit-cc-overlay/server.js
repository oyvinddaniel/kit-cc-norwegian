/**
 * Kit CC Monitor Server
 *
 * Dual-modus server:
 * - STANDALONE: Serverer dashboard direkte (Fase 2-3, eller prosjekter uten webapp)
 * - PROXY: Proxyer brukerens dev-server og injiserer overlay-script (Fase 4+)
 *
 * Port: 4444 (fallback via detect-port)
 */

import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, readFileSync, writeFileSync, unlinkSync, renameSync, mkdirSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import detectPort from 'detect-port'
import rateLimit from 'express-rate-limit'
import { setupProxy } from './src/proxy.js'
import { setupRoutes } from './src/routes.js'
import { registerProfessionalRoutes } from './src/professional.js'
import { setupWatcher } from './src/watcher.js'
import { SSEManager } from './src/sse.js'
import logger from './src/logger.js'
import { setupBacklog, closeDatabase } from './src/backlog/index.js'
import { loadOrCreateToken, authMiddleware } from './src/auth.js'
import { startUpdateChecker } from './src/update-checker.js'
import { initTelemetry } from './src/telemetry.js'
import { setCryptoDir } from './src/crypto.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── KONFIGURASJON ──────────────────────────────────────────────────────────

const DEFAULT_PORT = 4444
const KIT_CC_PREFIX = '/kit-cc'

/**
 * Finn prosjektets rotmappe.
 * Monitor-serveren forventer å ligge i kit-cc-overlay/ i prosjektroten.
 * Prosjektroten inneholder .ai/, Kit CC/, CLAUDE.md
 */
function findProjectRoot() {
  const overlayDir = __dirname
  const parent = dirname(overlayDir)

  // Sjekk at vi finner .ai/ og CLAUDE.md i parent
  if (existsSync(join(parent, '.ai')) && existsSync(join(parent, 'CLAUDE.md'))) {
    return parent
  }

  // Fallback: bruk current working directory
  const cwd = process.cwd()
  if (existsSync(join(cwd, '.ai')) && existsSync(join(cwd, 'CLAUDE.md'))) {
    return cwd
  }

  console.warn('⚠️  Kunne ikke finne prosjektrot (.ai/ + CLAUDE.md). Bruker:', parent)
  return parent
}

/**
 * Les overlay-konfigurasjon fra PROJECT-STATE.json
 */
function readConfig(projectRoot) {
  const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
  const defaults = {
    mode: 'proxy',  // Standard: Monitor-modus (proxy med overlay på appen)
    devServerPort: null,
    port: DEFAULT_PORT
  }

  try {
    if (existsSync(statePath)) {
      const state = JSON.parse(readFileSync(statePath, 'utf-8'))
      const overlay = state.overlay || {}
      return {
        mode: overlay.mode || defaults.mode,
        devServerPort: overlay.devServerPort || defaults.devServerPort,
        port: overlay.port || defaults.port
      }
    }
  } catch (err) {
    console.warn('⚠️  Kunne ikke lese PROJECT-STATE.json:', err.message)
  }

  return defaults
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  const projectRoot = findProjectRoot()
  const config = readConfig(projectRoot)

  // ─── Krypto-initialisering (må skje FØR noe som bruker encrypt/decrypt) ──
  setCryptoDir(__dirname)

  // ─── Auth token ─────────────────────────────────────────────────────
  const authToken = loadOrCreateToken(__dirname)

  // ─── Telemetri (opt-in) ───────────────────────────────────────────
  const telemetry = initTelemetry(__dirname)

  // ─── Les package.json for versjon ──────────────────────────────────
  let pkgVersion = '0.1.0'
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))
    pkgVersion = pkg.version || '0.1.0'
  } catch {}

  const modeDisplay = {
    proxy: 'Koblet til app',
    standalone: 'Frittstående'
  }[config.mode.toLowerCase()] || config.mode.toUpperCase()

  logger.server('🔧 Kit CC Monitor Server')
  logger.server('━'.repeat(40))
  logger.server(`📁 Prosjekt: ${projectRoot}`)
  logger.server(`📋 Modus:    ${modeDisplay}`)
  logger.server(`🔒 Auth:     Bearer token (httpOnly cookie + header)`)

  // ─── Express-app ────────────────────────────────────────────────────

  const app = express()
  const server = createServer(app)

  // JSON body parser med størrelsesbegrensning (forhindrer store payloads)
  app.use(express.json({ limit: '1mb' }))

  // Security headers — nonce-basert CSP (KUN for Kit CC sine egne ruter)
  // Proxied innhold (Next.js dev-server etc.) trenger eval() for react-refresh/HMR,
  // så CSP settes IKKE på proxied responses.
  app.use((req, res, next) => {
    // Sett alltid basis-sikkerhetshoder
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')

    // CSP kun for Kit CC-ruter og standalone-dashboard
    if (req.path.startsWith(KIT_CC_PREFIX) || req.path === '/' || req.path === '/overlay.js' || req.path === '/splash.js') {
      const nonce = randomBytes(16).toString('base64')
      res.locals.cspNonce = nonce
      res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:;`)
    }

    next()
  })

  // CORS-headere — kun for Kit CC API-ruter, ikke proxied responses
  let corsAllowedOrigin = `http://localhost:${DEFAULT_PORT}`
  app.use(KIT_CC_PREFIX, (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', corsAllowedOrigin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  // Favicon (forhindrer 404 i nettleser-konsollen)
  app.get('/favicon.ico', (req, res) => {
    // Enkel SVG-favicon med Kit CC-farger
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#101014"/><text x="16" y="22" font-size="18" text-anchor="middle" fill="#8A00FF" font-family="sans-serif" font-weight="bold">K</text></svg>`
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(svg)
  })

  // Host-header validering (DNS rebinding-beskyttelse)
  app.use((req, res, next) => {
    const host = req.headers.host || ''
    if (!host.match(/^(localhost|127\.0\.0\.1)(:\d+)?$/)) {
      return res.status(403).json({ error: 'Forbidden: invalid host header' })
    }
    next()
  })

  // Rate-limiting for API-ruter (100 requests per minutt)
  app.use(`${KIT_CC_PREFIX}/api/`, rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'For mange forespørsler. Prøv igjen om litt.' }
  }))

  // Health-endepunkt UTENFOR auth (brukes av CLAUDE.md boot-sekvens uten token)
  app.get(`${KIT_CC_PREFIX}/api/health`, (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() })
  })

  // Unified health-check — aggregerer alle feilkilder i én kall (UTENFOR auth for AI-tilgang)
  let healthCache = null
  let healthCacheTime = 0
  const HEALTH_CACHE_TTL = 2000

  app.get(`${KIT_CC_PREFIX}/api/health-check`, (req, res) => {
    try {
      const now = Date.now()
      if (healthCache && (now - healthCacheTime) < HEALTH_CACHE_TTL) {
        return res.json(healthCache)
      }
      const errorsPath = join(projectRoot, '.ai', 'MONITOR-ERRORS.json')
      let errors = []
      if (existsSync(errorsPath)) {
        try {
          const data = JSON.parse(readFileSync(errorsPath, 'utf-8'))
          errors = Array.isArray(data.errors) ? data.errors : []
        } catch { /* ignore parse errors */ }
      }

      const newErrors = errors.filter(e => e.status === 'new')
      const consoleErrors = newErrors.filter(e => e.type === 'error')
      const consoleWarns = newErrors.filter(e => e.type === 'warn')
      const networkErrors = newErrors.filter(e => e.type === 'network')
      const promiseErrors = newErrors.filter(e => e.type === 'promise')
      const uncaught = newErrors.filter(e => e.type === 'uncaught')

      const isHealthy = consoleErrors.length === 0 && uncaught.length === 0 && promiseErrors.length === 0

      const result = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        console: {
          errors: consoleErrors.length,
          warnings: consoleWarns.length,
          recent: consoleErrors.slice(-3).map(e => ({ message: e.message, source: e.source, line: e.line }))
        },
        network: {
          failed: networkErrors.length,
          recent: networkErrors.slice(-3).map(e => ({ message: e.message, url: e.url }))
        },
        uncaught: {
          count: uncaught.length,
          recent: uncaught.slice(-3).map(e => ({ message: e.message, source: e.source, line: e.line }))
        },
        promise: {
          count: promiseErrors.length,
          recent: promiseErrors.slice(-3).map(e => ({ message: e.message }))
        },
        summary: [
          consoleErrors.length > 0 ? `${consoleErrors.length} errors` : null,
          consoleWarns.length > 0 ? `${consoleWarns.length} warnings` : null,
          networkErrors.length > 0 ? `${networkErrors.length} network failures` : null,
          promiseErrors.length > 0 ? `${promiseErrors.length} unhandled promises` : null,
          uncaught.length > 0 ? `${uncaught.length} uncaught exceptions` : null
        ].filter(Boolean).join(', ') || 'No issues'
      }

      healthCache = result
      healthCacheTime = now
      res.json(result)
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message })
    }
  })

  // Auth middleware for API-ruter (etter rate-limiting og health, før forretningslogikk)
  app.use(`${KIT_CC_PREFIX}/api/`, authMiddleware(authToken))

  // Enkel request-logging (utelater SSE og health for å unngå støy)
  // Bruker req.path (uten query params) for å unngå token-lekkasje i logger
  app.use((req, res, next) => {
    if (req.path.includes('/api/') && !req.path.includes('/events') && !req.path.includes('/health')) {
      // Use req.path only (no query string) to prevent token leakage
      const safePath = req.path.replace(/token=[^&]+/g, 'token=[REDACTED]')
      console.log(`${req.method} ${safePath}`)
    }
    next()
  })

  // ─── SSE Manager ────────────────────────────────────────────────────

  const sseManager = new SSEManager()

  // ─── Filovervåking ──────────────────────────────────────────────────

  const cleanupWatcher = setupWatcher(projectRoot, sseManager)

  // ─── Backlog-system (Lag 3: F13-F17) ────────────────────────────────

  const backlogActive = await setupBacklog(app, {
    projectRoot,
    prefix: KIT_CC_PREFIX,
    sseManager
  })

  // ─── Konsistenssjekk: backlog vs pendingTasks[] ─────────────────────
  if (backlogActive) {
    try {
      const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
      if (existsSync(statePath)) {
        const state = JSON.parse(readFileSync(statePath, 'utf-8'))
        const pending = Array.isArray(state.pendingTasks) ? state.pendingTasks : []
        const backlogIds = new Set(pending.filter(t => t.source === 'monitor-backlog').map(t => t.id))
        // Import service to check approved items (named exports)
        const backlogServiceMod = await import('./src/backlog/service.js')
        if (typeof backlogServiceMod.getTree === 'function') {
          const tree = backlogServiceMod.getTree()
          if (tree.success && Array.isArray(tree.data)) {
            // Flatten tree to get all items
            const flatItems = []
            const flatten = (items) => {
              for (const item of items) {
                flatItems.push(item)
                if (Array.isArray(item.children)) flatten(item.children)
              }
            }
            flatten(tree.data)
            // getTree() returnerer rådata fra better-sqlite3 (snake_case kolonnenavn).
            // Tidligere leste vi item.approvedBy (camelCase) som alltid var undefined.
            const approvedNotInState = flatItems.filter(item => {
              const approvedBy = item.approved_by ?? item.approvedBy
              return item.status === 'in_progress' && approvedBy && !backlogIds.has(`BL-${String(item.id).padStart(3, '0')}`)
            })
            if (approvedNotInState.length > 0) {
              console.log(`⚠️  Konsistenssjekk: ${approvedNotInState.length} godkjente backlog-items mangler i pendingTasks[]`)
            }
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️  Konsistenssjekk feilet ved oppstart: ${err.message}`)
    }
  }

  // ─── API-ruter (begge moduser) — MÅ komme ETTER setupBacklog ──────

  setupRoutes(app, { projectRoot, sseManager, prefix: KIT_CC_PREFIX, backlogActive, telemetry })

  // ─── Profesjonell pakke: N3 Monitor-utvidelse (MÅ for STANDARD+) ────
  registerProfessionalRoutes(app, projectRoot)

  // ─── Statiske filer (overlay assets) med cache-headers ──────────────

  app.use(`${KIT_CC_PREFIX}/assets`, express.static(join(__dirname, 'public'), {
    maxAge: 0,
    etag: true
  }))

  // ─── Modus-spesifikt oppsett ────────────────────────────────────────

  /**
   * Server HTML med nonce injisert i <style> og <script> tags
   */
  function serveHtmlWithNonce(filePath, res) {
    try {
      let html = readFileSync(filePath, 'utf-8')
      const nonce = res.locals.cspNonce
      html = html.replace(/<style(?=[\s>])/g, `<style nonce="${nonce}"`)
      html = html.replace(/<script(?=[\s>])/g, `<script nonce="${nonce}"`)
      // Sett httpOnly cookie med auth token (synlig for fetch/SSE, men IKKE for JavaScript)
      res.setHeader('Set-Cookie', `kit_cc_auth=${authToken}; HttpOnly; SameSite=Strict; Path=/`)
      res.setHeader('Cache-Control', 'no-store')
      res.type('html').send(html)
    } catch (err) {
      res.status(500).json({ error: 'Kunne ikke laste side' })
    }
  }

  if (config.mode === 'proxy' && config.devServerPort) {
    // PROXY-MODUS: Proxy brukerens dev-server med script-injeksjon
    console.log(`🔀 Proxy:    localhost:${config.devServerPort} → monitor`)
    setupProxy(app, server, {
      devServerPort: config.devServerPort,
      prefix: KIT_CC_PREFIX
    })
  } else {
    // STANDALONE-MODUS: Server dashboard direkte
    if (config.mode === 'proxy' && !config.devServerPort) {
      console.warn('⚠️  Proxy-modus valgt men devServerPort mangler i PROJECT-STATE.json.')
      console.warn('   Sett overlay.devServerPort i .ai/PROJECT-STATE.json (f.eks. 3000).')
      console.warn('   Kjører i standalone-modus som fallback.')
    }
    console.log('📊 Dashboard: Standalone-modus (ingen proxy)')

    // Serve dashboard HTML med nonce-injeksjon
    app.get('/', (req, res) => {
      serveHtmlWithNonce(join(__dirname, 'public', 'index.html'), res)
    })

    // Serve overlay.js og splash.js direkte (for standalone-modus)
    app.get('/overlay.js', (req, res) => {
      res.sendFile(join(__dirname, 'public', 'overlay.js'))
    })
    app.get('/splash.js', (req, res) => {
      res.sendFile(join(__dirname, 'public', 'splash.js'))
    })
  }

  // ─── 404-handler (etter alle ruter) ────────────────────────────────

  app.use((req, res) => {
    res.status(404).json({ error: 'Ikke funnet' })
  })

  // ─── Port-deteksjon og oppstart ─────────────────────────────────────
  //
  // Prioritet (protocol-MONITOR-OPPSETT.md Steg B 3):
  //   1. process.env.PORT (eksplisitt CLI-override)
  //   2. config.port (fra PROJECT-STATE.json → overlay.port)
  //   3. DEFAULT_PORT
  const envPort = Number.parseInt(process.env.PORT || '', 10)
  const desiredPort = Number.isFinite(envPort) && envPort > 0
    ? envPort
    : (config.port || DEFAULT_PORT)
  const availablePort = await detectPort(desiredPort)

  if (availablePort !== desiredPort) {
    console.log(`⚠️  Port ${desiredPort} er opptatt — bruker ${availablePort} i stedet`)
  }

  // PID-fil for prosess-identifikasjon (brukes av CLAUDE.md boot-sekvens)
  const pidPath = join(__dirname, 'monitor.pid')

  server.listen(availablePort, '127.0.0.1', () => {
    corsAllowedOrigin = `http://localhost:${availablePort}`
    logger.server(`✅ Kjører på http://127.0.0.1:${availablePort}`)
    logger.server(`   API:       http://localhost:${availablePort}${KIT_CC_PREFIX}/api/state`)
    logger.server(`   SSE:       http://localhost:${availablePort}${KIT_CC_PREFIX}/api/events`)
    if (config.mode === 'standalone') {
      console.log(`   Dashboard: http://localhost:${availablePort}/`)
    }
    console.log('━'.repeat(40) + '\n')

    // Skriv PID-fil
    writeFileSync(pidPath, String(process.pid), 'utf-8')

    // F36: Monitor er single writer for overlay.port — skrives ALLTID etter listen
    try {
      const aiDir = join(projectRoot, '.ai')
      const statePath = join(aiDir, 'PROJECT-STATE.json')
      let state = {}
      if (existsSync(statePath)) {
        state = JSON.parse(readFileSync(statePath, 'utf-8'))
      } else {
        // Opprett .ai/ og minimal PROJECT-STATE.json hvis de ikke finnes
        if (!existsSync(aiDir)) mkdirSync(aiDir, { recursive: true })
      }
      if (!state.overlay) state.overlay = {}
      state.overlay.port = availablePort
      writeFileSync(statePath + '.tmp', JSON.stringify(state, null, 2), 'utf-8')
      renameSync(statePath + '.tmp', statePath)
    } catch (err) {
      console.warn(`⚠️  Kunne ikke oppdatere port i PROJECT-STATE.json: ${err.message}`)
    }

    // Start versjonssjekk (periodisk, 24t intervall)
    startUpdateChecker(sseManager, pkgVersion, __dirname)
  })

  // ─── Graceful shutdown ──────────────────────────────────────────────

  const shutdown = () => {
    console.log('\n🛑 Stopper Kit CC Monitor Server...')
    if (cleanupWatcher) cleanupWatcher()
    sseManager.closeAll()
    closeDatabase()
    telemetry.stop()
    // Fjern PID-fil
    try { unlinkSync(pidPath) } catch {}
    server.close(() => {
      console.log('👋 Server stoppet.')
      process.exit(0)
    })
    // Force-stopp etter 5 sekunder (unref slik at den ikke holder prosessen i live)
    setTimeout(() => process.exit(1), 5000).unref()
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  // Forhindre stille krasj ved uventede feil
  // Ved uncaughtException: logg og avslutt umiddelbart (shutdown kan feile i korrupt tilstand)
  process.on('uncaughtException', (err) => {
    console.error('❌ Uventet feil (uncaughtException):', err)
    telemetry.reportError(err, { monitorVersion: pkgVersion, route: 'uncaughtException' })
    try { closeDatabase() } catch {}
    try { unlinkSync(pidPath) } catch {}
    process.exit(1)
  })
  process.on('unhandledRejection', (reason) => {
    console.error('❌ Uventet promise-avvisning (unhandledRejection):', reason)
    if (reason instanceof Error) {
      telemetry.reportError(reason, { monitorVersion: pkgVersion, route: 'unhandledRejection' })
    }
  })
}

main().catch(err => {
  console.error('❌ Feil ved oppstart:', err)
  process.exit(1)
})
