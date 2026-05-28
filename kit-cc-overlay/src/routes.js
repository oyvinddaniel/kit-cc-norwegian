/**
 * API-ruter for Kit CC Monitor
 *
 * Alle ruter ligger under /kit-cc/api/
 *
 * --- Prosjekttilstand ---
 * GET    /kit-cc/api/health                        → Helsesjekk (registrert utenfor auth i server.js)
 * GET    /kit-cc/api/state                         → PROJECT-STATE.json (inkl. git-status)
 * GET    /kit-cc/api/progress                      → PROGRESS-LOG.md (siste N linjer, parset)
 * GET    /kit-cc/api/events                        → SSE-endepunkt (real-time push)
 *
 * --- Modulregister ---
 * GET    /kit-cc/api/modules                       → MODULREGISTER (parset til JSON)
 * POST   /kit-cc/api/modules/add-feature           → Legg til funksjon i MODULREGISTER
 *
 * --- Faser og oppgaver ---
 * GET    /kit-cc/api/phases                        → Sammenstilt fase-oversikt
 * GET    /kit-cc/api/phases/:num                   → Fase-detaljer (klikkbar oppsummering)
 * GET    /kit-cc/api/phases/:num/tasks             → Oppgaver for én fase (MÅ/BØR/KAN/IKKE + status)
 * POST   /kit-cc/api/tasks/activate                → Aktiver oppgave til Byggeliste
 *
 * --- Innstillinger ---
 * GET    /kit-cc/api/settings                      → Alle innstillinger (editable + readonly)
 * PUT    /kit-cc/api/settings                      → Endre en innstilling (field + value)
 *
 * --- Datapaneler ---
 * GET    /kit-cc/api/data/panels                   → Liste over alle datapaneler
 * GET    /kit-cc/api/data/:panel                   → Hent data for et spesifikt panel
 *
 * --- Console-feil ---
 * POST   /kit-cc/api/errors                        → Mottar console-feil fra overlay (med deduplisering)
 * GET    /kit-cc/api/errors                        → Henter lagrede feil (?status=new|fixing|unfixable)
 * DELETE /kit-cc/api/errors                        → Rydder alle console-feil
 * DELETE /kit-cc/api/errors/:id                    → Fjern enkelt feil etter id
 * PATCH  /kit-cc/api/errors/:id                    → Oppdater feil-status/fixAttempts
 *
 * --- Checkpoints ---
 * POST   /kit-cc/api/checkpoints/create            → Opprett nytt lagringspunkt (git + state)
 * POST   /kit-cc/api/checkpoints/save-safety       → Opprett sikkerhets-lagringspunkt (før restore)
 * POST   /kit-cc/api/checkpoints/restore           → Gjenopprett til valgt checkpoint
 *
 * --- Probes (nettlesertesting) ---
 * POST   /kit-cc/api/probes                        → Opprett probe (AI → nettleser, ?wait=true for synkron)
 * GET    /kit-cc/api/probes/:id                    → Hent probe-status/resultat
 * POST   /kit-cc/api/probes/:id/result             → Nettleser poster probe-resultat tilbake
 *
 * --- Onboarding ---
 * GET    /kit-cc/api/onboarding                    → Oppstartsforslag og status for nytt prosjekt
 *
 * --- Credentials og .env ---
 * POST   /kit-cc/api/credentials/:providerId       → Lagre credentials til .env
 * GET    /kit-cc/api/credentials/:providerId/status → Sjekk om nøkler er konfigurert
 * POST   /kit-cc/api/credentials/:providerId/validate → Valider credentials (format + liveness)
 * POST   /kit-cc/api/env                           → Skriv én ENV-variabel til .env
 * GET    /kit-cc/api/env/:key                      → Hent maskert verdi for ENV-variabel
 *
 * --- Integrasjoner ---
 * POST   /kit-cc/api/integrations/add              → Legg til integrasjon i prosjektet
 *
 * --- AI-hjelp ---
 * POST   /kit-cc/api/describe                      → AI-generert forklaring av modul/funksjon/oppgave
 *
 * --- Telemetri (opt-in) ---
 * POST   /kit-cc/api/telemetry/consent             → Gi eller trekk tilbake samtykke
 * GET    /kit-cc/api/telemetry/status              → Hent telemetristatus og transparensinfo
 * GET    /kit-cc/api/telemetry/data                → GDPR: innsyn i innsamlede data
 * DELETE /kit-cc/api/telemetry/data                → GDPR: slett køede data og deaktiver telemetri
 *
 * --- Byggeliste (backlog, kun når backlogActive=true) ---
 * GET    /kit-cc/api/backlog                       → Status for Byggeliste-systemet
 * GET    /kit-cc/api/backlog/tree                  → Byggeliste-tre
 * GET    /kit-cc/api/backlog/stats                 → Byggeliste-statistikk
 * GET    /kit-cc/api/backlog/items/:id             → Hent enkelt backlog-item
 * POST   /kit-cc/api/backlog/items                 → Opprett backlog-item
 * POST   /kit-cc/api/backlog/approve               → Godkjenn backlog-item
 *
 * --- AI-chat (kun når backlogActive=true) ---
 * GET    /kit-cc/api/chat/status                   → Chat-systemstatus
 * GET    /kit-cc/api/chat/conversations            → Liste alle samtaler
 * GET    /kit-cc/api/chat/conversations/:id        → Hent én samtale
 * POST   /kit-cc/api/chat/conversations            → Start ny samtale
 * POST   /kit-cc/api/chat/conversations/:id/messages → Send melding i samtale
 * DELETE /kit-cc/api/chat/conversations/:id        → Slett samtale
 * PATCH  /kit-cc/api/chat/conversations/:id/title  → Endre samtale-tittel
 * POST   /kit-cc/api/chat/config                   → Oppdater chat-konfigurasjon
 */

import { existsSync, writeFileSync, mkdirSync, copyFileSync, readFileSync, renameSync, appendFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import {
  readProjectState,
  readProgressLog,
  readModulregister,
  buildPhaseOverview,
  readPhaseSummary
} from './parsers.js'
import { getApiKey } from './backlog/ai-chat.js'
import { getTasksWithStatus, getTasksByClassification, getTasksForPhase, PHASES, INTENSITY_LEVELS, INTENSITY_LABELS } from './tasks/phase-tasks.js'
import { getPanelList, generatePanel } from './data-panels.js'
import { isGitRepo, getGitStatus, gitCommitAll, gitResetHard, ensureGitignore } from './git-utils.js'
import {
  readProbesFile, writeProbesFile, createProbe, updateProbeResult,
  cleanupOldProbes, ALLOWED_PROBE_TYPES, startProbeTimeout,
  clearProbeTimeout, waitForProbeResult, resolveWaitingProbe
} from './probes.js'
import { getOnboardingSuggestions } from './onboarding.js'
import { INTEGRATION_CATALOG } from './integration-catalog.js'

// ─── .env read/write helpers (F38/F39) ─────────────────────────────────

function readEnvFile(projectRoot) {
  const envPath = join(projectRoot, '.env')
  const entries = {}
  try {
    if (!existsSync(envPath)) return entries
    const content = readFileSync(envPath, 'utf-8')
    const lines = content.split('\n')
    let i = 0
    while (i < lines.length) {
      const trimmed = lines[i].trim()
      if (!trimmed || trimmed.startsWith('#')) { i++; continue }
      // Handle export KEY=value syntax
      const line = trimmed.replace(/^export\s+/, '')
      const eqIdx = line.indexOf('=')
      if (eqIdx === -1) { i++; continue }
      const key = line.slice(0, eqIdx).trim()
      let val = line.slice(eqIdx + 1).trim()
      // Multi-line: double-quoted values with escaped newlines or actual newlines
      if (val.startsWith('"') && !val.endsWith('"')) {
        // Collect continuation lines until closing quote
        const parts = [val.slice(1)]
        i++
        while (i < lines.length) {
          const cont = lines[i]
          if (cont.includes('"')) {
            parts.push(cont.slice(0, cont.indexOf('"')))
            break
          }
          parts.push(cont)
          i++
        }
        val = parts.join('\n')
      } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      // Handle escaped newlines in double-quoted values
      val = val.replace(/\\n/g, '\n')
      entries[key] = val
      i++
    }
  } catch (err) {
    console.warn('⚠️  Kunne ikke lese .env:', err.message)
  }
  return entries
}

function writeEnvKey(projectRoot, key, value) {
  // Sanitize: prevent newline injection in values
  const safeValue = String(value).replace(/[\r\n]/g, '')
  const envPath = join(projectRoot, '.env')
  let lines = []
  try {
    if (existsSync(envPath)) {
      lines = readFileSync(envPath, 'utf-8').split('\n')
    }
  } catch {}
  // Handle export KEY=value syntax
  let found = false
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const lineKey = trimmed.replace(/^export\s+/, '').split('=')[0].trim()
    if (lineKey === key) {
      lines[i] = `${key}=${safeValue}`
      found = true
      break
    }
  }
  if (!found) {
    // Add blank line before if file doesn't end with one
    if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
      lines.push('')
    }
    lines.push(`${key}=${safeValue}`)
  }
  // Atomic write: write to .tmp then rename
  const tmpPath = envPath + '.tmp'
  writeFileSync(tmpPath, lines.join('\n'), 'utf-8')
  renameSync(tmpPath, envPath)

  // Ensure .env is in .gitignore
  ensureGitignoreEntry(projectRoot, '.env')

  // Update .env.example with empty value
  const examplePath = join(projectRoot, '.env.example')
  try {
    let exLines = []
    if (existsSync(examplePath)) {
      exLines = readFileSync(examplePath, 'utf-8').split('\n')
    }
    const hasKey = exLines.some(l => l.trim().startsWith(key + '='))
    if (!hasKey) {
      if (exLines.length > 0 && exLines[exLines.length - 1].trim() !== '') exLines.push('')
      exLines.push(`${key}=`)
      writeFileSync(examplePath, exLines.join('\n'), 'utf-8')
    }
  } catch {}
}

function ensureGitignoreEntry(projectRoot, entry) {
  const giPath = join(projectRoot, '.gitignore')
  try {
    let content = ''
    if (existsSync(giPath)) {
      content = readFileSync(giPath, 'utf-8')
    }
    if (!content.split('\n').some(l => l.trim() === entry)) {
      const nl = content.endsWith('\n') ? '' : '\n'
      appendFileSync(giPath, `${nl}${entry}\n`, 'utf-8')
    }
  } catch (err) {
    console.error('⚠️  Kunne ikke oppdatere .gitignore:', err.message)
  }
}

// Hjelpefunksjoner for nestede stier (F30)
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  let target = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!target[keys[i]] || typeof target[keys[i]] !== 'object') target[keys[i]] = {}
    target = target[keys[i]]
  }
  target[keys[keys.length - 1]] = value
}

// ─── Filbasert feillagring (.ai/MONITOR-ERRORS.json) ────────────────────────

const DEDUP_WINDOW_MS = 60_000 // 60 sekunder dedupliseringsvindu

function getErrorsFilePath(projectRoot) {
  return join(projectRoot, '.ai', 'MONITOR-ERRORS.json')
}

function readErrorsFile(projectRoot) {
  const filePath = getErrorsFilePath(projectRoot)
  try {
    if (!existsSync(filePath)) return { version: 1, maxErrors: 100, errors: [] }
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    if (!Array.isArray(data.errors)) data.errors = []
    return data
  } catch {
    return { version: 1, maxErrors: 100, errors: [] }
  }
}

function writeErrorsFile(projectRoot, data) {
  const filePath = getErrorsFilePath(projectRoot)
  const dir = join(projectRoot, '.ai')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const tmpPath = filePath + '.tmp'
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmpPath, filePath)
}

function generateErrorId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let rand = ''
  for (let i = 0; i < 5; i++) rand += chars[Math.floor(Math.random() * chars.length)]
  return `err-${Date.now()}-${rand}`
}

function getDeduplicationKey(type, data) {
  const msg = typeof data === 'string' ? data : (data?.message || data?.reason || JSON.stringify(data))
  return `${type}:${msg.slice(0, 200)}`
}

/**
 * Sett opp alle API-ruter
 * @param {import('express').Application} app
 * @param {Object} options
 * @param {string} options.projectRoot
 * @param {import('./sse.js').SSEManager} options.sseManager
 * @param {string} options.prefix
 * @param {boolean} [options.backlogActive] — om backlog-systemet er tilgjengelig
 */
export function setupRoutes(app, { projectRoot, sseManager, prefix, backlogActive = false, telemetry = null }) {
  const apiPrefix = `${prefix}/api`

  // ─── Helsesjekk registreres i server.js UTENFOR auth ───────────────

  // ─── PROJECT-STATE.json ─────────────────────────────────────────────

  app.get(`${apiPrefix}/state`, (req, res) => {
    const state = readProjectState(projectRoot)

    if (state.error) {
      return res.status(state.exists ? 500 : 404).json({
        error: state.error,
        message: state.exists
          ? 'Kunne ikke parse PROJECT-STATE.json'
          : 'PROJECT-STATE.json finnes ikke. Har du startet Kit CC i dette prosjektet?'
      })
    }

    // Filtrer ut tunge stateSnapshot fra checkpoints (kan bli flere MB)
    if (Array.isArray(state.checkpoints)) {
      state.checkpoints = state.checkpoints.map(cp => {
        const { stateSnapshot, ...rest } = cp
        return { ...rest, hasSnapshot: !!stateSnapshot }
      })
    }

    // Git-status (dynamisk, lagres ikke i filen)
    const gitAvailable = isGitRepo(projectRoot)
    if (gitAvailable) {
      const gitStatus = getGitStatus(projectRoot)
      state.git = {
        available: true,
        branch: gitStatus?.branch || null,
        commitSha: gitStatus?.commitSha || null,
        clean: gitStatus?.clean ?? null
      }
    } else {
      state.git = { available: false }
    }

    res.json(state)
  })

  // ─── PROGRESS-LOG.md (siste N linjer) ───────────────────────────────

  app.get(`${apiPrefix}/progress`, (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200)
    const progress = readProgressLog(projectRoot, limit)
    res.json(progress)
  })

  // ─── MODULREGISTER ──────────────────────────────────────────────────

  app.get(`${apiPrefix}/modules`, (req, res) => {
    const modules = readModulregister(projectRoot)
    res.json(modules)
  })

  // ─── Legg til funksjon i MODULREGISTER ───────────────────────────────

  app.post(`${apiPrefix}/modules/add-feature`, (req, res) => {
    const { moduleName, featureName, description } = req.body || {}

    if (!featureName || !featureName.trim()) {
      return res.status(400).json({ error: 'featureName er påkrevd' })
    }

    const modData = readModulregister(projectRoot)
    if (!modData.found || !modData.path) {
      return res.status(404).json({ error: 'MODULREGISTER ikke funnet i docs/' })
    }

    try {
      let content = readFileSync(modData.path, 'utf-8')
      const cleanName = featureName.trim()
      const descSuffix = description?.trim() ? ` — ${description.trim()}` : ''
      const newLine = `- [ ] ${cleanName}${descSuffix}`

      if (moduleName && moduleName.trim()) {
        // Legg til under spesifikk modul
        const moduleHeader = new RegExp(`^(#{2,3})\\s+${moduleName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm')
        const match = content.match(moduleHeader)

        if (match) {
          // Finn slutten av denne modulens features (neste ## eller slutt av fil)
          const headerIdx = content.indexOf(match[0])
          const afterHeader = content.substring(headerIdx + match[0].length)
          const nextModule = afterHeader.search(/\n#{2,3}\s+/)
          const insertPos = nextModule >= 0
            ? headerIdx + match[0].length + nextModule
            : content.length

          // Sett inn før neste modul (med newline)
          const before = content.substring(0, insertPos)
          const after = content.substring(insertPos)
          content = before.replace(/\n*$/, '\n') + newLine + '\n' + after
        } else {
          // Modulen finnes ikke — opprett den
          content = content.replace(/\n*$/, '\n') + `\n## ${moduleName.trim()}\n\n${newLine}\n`
        }
      } else {
        // Ingen modul spesifisert — legg til under siste modul
        const lastModuleIdx = content.lastIndexOf('\n## ')
        if (lastModuleIdx >= 0) {
          const afterLastModule = content.substring(lastModuleIdx)
          const nextModule = afterLastModule.substring(1).search(/\n#{2,3}\s+/)
          const insertPos = nextModule >= 0
            ? lastModuleIdx + 1 + nextModule
            : content.length
          const before = content.substring(0, insertPos)
          const after = content.substring(insertPos)
          content = before.replace(/\n*$/, '\n') + newLine + '\n' + after
        } else {
          // Ingen moduler i filen — legg til på slutten
          content = content.replace(/\n*$/, '\n') + newLine + '\n'
        }
      }

      writeFileSync(modData.path, content, 'utf-8')

      sseManager.broadcast('MODULE_FEATURE_ADDED', { moduleName: moduleName || null, featureName: cleanName })
      res.json({ success: true, featureName: cleanName, moduleName: moduleName || null })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ─── Fase-oversikt ──────────────────────────────────────────────────

  app.get(`${apiPrefix}/phases`, (req, res) => {
    const state = readProjectState(projectRoot)

    if (state.error) {
      return res.status(404).json({
        error: 'Kan ikke bygge fase-oversikt uten PROJECT-STATE.json'
      })
    }

    res.json({
      phases: buildPhaseOverview(state),
      currentPhase: state.currentPhase,
      projectName: state.projectName || 'Ukjent prosjekt'
    })
  })

  // ─── Fase-detaljer (klikkbar oppsummering) ─────────────────────────

  app.get(`${apiPrefix}/phases/:num`, (req, res) => {
    const phaseNum = parseInt(req.params.num)
    if (isNaN(phaseNum) || phaseNum < 1 || phaseNum > 7) {
      return res.status(400).json({ error: 'Fasenummer må være mellom 1 og 7' })
    }

    const summary = readPhaseSummary(projectRoot, phaseNum)
    if (summary.error) {
      return res.status(404).json(summary)
    }

    res.json(summary)
  })

  // ─── Fase-oppgaver (F27: oppgavekatalog per fase) ─────────────────

  app.get(`${apiPrefix}/phases/:num/tasks`, (req, res) => {
    const phaseNum = parseInt(req.params.num)
    if (isNaN(phaseNum) || phaseNum < 1 || phaseNum > 7) {
      return res.status(400).json({ error: 'Fasenummer må være mellom 1 og 7' })
    }

    const state = readProjectState(projectRoot)
    const intensityLevel = state?.classification?.intensityLevel?.toUpperCase() || 'STANDARD'

    // Oppgaver med status fra PROJECT-STATE
    const tasks = getTasksWithStatus(phaseNum, state)

    // Grupper etter MÅ/BØR/KAN/IKKE
    const grouped = { MÅ: [], BØR: [], KAN: [], IKKE: [] }
    for (const task of tasks) {
      if (grouped[task.classification]) {
        grouped[task.classification].push(task)
      }
    }

    const phase = PHASES[phaseNum]
    res.json({
      phase: { num: phaseNum, name: phase?.name },
      intensityLevel,
      intensityLabel: INTENSITY_LABELS[intensityLevel] || intensityLevel,
      taskCount: tasks.length,
      grouped,
      tasks
    })
  })

  // ─── Oppgaveaktivering (F31: legg oppgave i Byggeliste) ───────────

  app.post(`${apiPrefix}/tasks/activate`, async (req, res) => {
    const { taskId, taskName, taskDesc, phaseNum } = req.body || {}

    if (!taskId || !taskName) {
      return res.status(400).json({ error: 'taskId og taskName er påkrevd' })
    }

    if (!backlogActive) {
      return res.status(503).json({
        error: 'Byggeliste er ikke tilgjengelig. Kan ikke aktivere oppgaver.'
      })
    }

    try {
      // Dynamisk import av backlog-service
      const { createItem } = await import('./backlog/service.js')

      // Legg oppgaven i Byggelisten som en ny backlog-item
      const item = createItem({
        name: `[${taskId}] ${taskName}`,
        description: taskDesc || null,
        type: 'task',
        priority: 'SHOULD',
        phase: phaseNum || null
      })

      // Broadcast via SSE
      sseManager.broadcast('TASK_ACTIVATED', {
        taskId,
        taskName,
        backlogItemId: item?.data?.id
      })

      res.json({
        success: true,
        taskId,
        backlogItemId: item?.data?.id,
        message: `Oppgave ${taskId} lagt til i Byggelisten`
      })
    } catch (err) {
      res.status(500).json({
        error: `Kunne ikke aktivere oppgave: ${err.message}`
      })
    }
  })

  // ─── Onboarding API (F37: Start-fane) ──────────────────────────────

  app.get(`${apiPrefix}/onboarding`, (req, res) => {
    const state = readProjectState(projectRoot)
    if (state.error) {
      return res.status(404).json({ error: 'PROJECT-STATE.json ikke funnet' })
    }
    try {
      const suggestions = getOnboardingSuggestions(state, projectRoot)
      const pending = suggestions.filter(s => s.status === 'pending').length
      const completed = suggestions.filter(s => s.status === 'completed').length
      res.json({ suggestions, pending, completed, total: suggestions.length })
    } catch (err) {
      console.error('⚠️  Feil i getOnboardingSuggestions:', err.message)
      res.status(500).json({ error: 'Kunne ikke generere oppstartsforslag', detail: err.message })
    }
  })

  // ─── Credential API (F38) ──────────────────────────────────────────

  // POST /credentials/:providerId — Lagre credentials til .env
  app.post(`${apiPrefix}/credentials/:providerId`, (req, res) => {
    const { providerId } = req.params
    const { credentials: creds } = req.body || {}
    if (!creds || typeof creds !== 'object') {
      return res.status(400).json({ error: 'credentials object er påkrevd' })
    }

    // Find provider in catalog to get credential definitions
    let providerDef = null
    for (const cat of INTEGRATION_CATALOG) {
      const p = cat.providers.find(p => p.id === providerId)
      if (p) { providerDef = p; break }
    }
    if (!providerDef?.credentials) {
      return res.status(404).json({ error: 'Provider har ingen definerte credentials' })
    }

    try {
      ensureGitignoreEntry(projectRoot, '.env')
      for (const def of providerDef.credentials) {
        if (creds[def.env] !== undefined && creds[def.env] !== '') {
          writeEnvKey(projectRoot, def.env, creds[def.env])
        }
      }
      // F43: Markér integrasjon som aktiv etter verifisert tilkobling (schema: active | deferred | skipped)
      try {
        const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
        if (existsSync(statePath)) {
          const state = JSON.parse(readFileSync(statePath, 'utf-8'))
          const setup = state?.integrations?.setup || []
          const entry = setup.find(s => s.id === providerId)
          if (entry) {
            entry.status = 'active'
            entry.statusChangedAt = new Date().toISOString()
            const prevPath = statePath + '.prev'
            const tmpPath = statePath + '.tmp'
            copyFileSync(statePath, prevPath)
            writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
            renameSync(tmpPath, statePath)
          }
        }
      } catch (err) {
        console.warn('⚠️  Kunne ikke oppdatere integrasjonsstatus:', err.message)
      }
      sseManager.broadcast('CREDENTIALS_SAVED', { providerId })
      sseManager.broadcast('ENV_CHANGED', { timestamp: new Date().toISOString() })
      res.json({ success: true, providerId })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /credentials/:providerId/status — Sjekk om nøkler finnes
  app.get(`${apiPrefix}/credentials/:providerId/status`, (req, res) => {
    const { providerId } = req.params
    let providerDef = null
    for (const cat of INTEGRATION_CATALOG) {
      const p = cat.providers.find(p => p.id === providerId)
      if (p) { providerDef = p; break }
    }
    if (!providerDef?.credentials) {
      return res.json({ providerId, configured: false, keys: {} })
    }

    const env = readEnvFile(projectRoot)
    const keys = {}
    let allPresent = true
    for (const def of providerDef.credentials) {
      const exists = env[def.env] !== undefined && env[def.env] !== ''
      keys[def.env] = { exists, masked: exists ? '••••' + env[def.env].slice(-4) : null }
      if (!exists) allPresent = false
    }
    res.json({ providerId, configured: allPresent, keys })
  })

  // POST /credentials/:providerId/validate — To-lags validering (F42)
  const CREDENTIAL_VALIDATORS = {
    REPLICATE_API_TOKEN: {
      format: /^r8_[a-zA-Z0-9]{36,}$/,
      formatHint: 'Replicate-nøkler starter med r8_ etterfulgt av minst 36 tegn',
      testEndpoint: { url: 'https://api.replicate.com/v1/models', method: 'GET', header: 'Authorization', prefix: 'Bearer ' }
    },
    STRIPE_SECRET_KEY: {
      format: /^sk_(test|live)_[a-zA-Z0-9]{20,}$/,
      formatHint: 'Stripe secret keys starter med sk_test_ eller sk_live_'
    },
    STRIPE_PUBLISHABLE_KEY: {
      format: /^pk_(test|live)_[a-zA-Z0-9]{20,}$/,
      formatHint: 'Stripe publishable keys starter med pk_test_ eller pk_live_'
    },
    UNSPLASH_ACCESS_KEY: {
      format: /^[a-zA-Z0-9_-]{40,}$/,
      formatHint: 'Unsplash Access Key er en lang alfanumerisk streng',
      testEndpoint: { url: 'https://api.unsplash.com/photos?per_page=1', method: 'GET', header: 'Authorization', prefix: 'Client-ID ' }
    },
    RESEND_API_KEY: {
      format: /^re_[a-zA-Z0-9]{20,}$/,
      formatHint: 'Resend API-nøkler starter med re_'
    },
    SENTRY_DSN: {
      format: /^https:\/\/[a-f0-9]+@[a-z0-9.]+\.ingest\.[a-z.]+sentry\.io\/\d+$/,
      formatHint: 'Sentry DSN er en URL som starter med https:// og inneholder @...sentry.io/'
    }
  }

  app.post(`${apiPrefix}/credentials/:providerId/validate`, async (req, res) => {
    const { providerId } = req.params
    const { credentials: creds } = req.body || {}
    if (!creds || typeof creds !== 'object') {
      return res.status(400).json({ error: 'credentials object er påkrevd' })
    }

    const results = {}
    for (const [envKey, value] of Object.entries(creds)) {
      // Reject empty/non-string values
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        results[envKey] = { valid: false, layer: 'format', message: 'Verdien kan ikke være tom' }
        continue
      }
      const validator = CREDENTIAL_VALIDATORS[envKey]
      if (!validator) {
        results[envKey] = { valid: true, layer: 'none', message: 'Ingen validering definert' }
        continue
      }

      // Layer 1: Format check
      if (validator.format && !validator.format.test(value)) {
        results[envKey] = { valid: false, layer: 'format', message: validator.formatHint || 'Ugyldig format' }
        continue
      }

      // Layer 2: Liveness check (optional)
      if (validator.testEndpoint) {
        try {
          const { url, method, header, prefix } = validator.testEndpoint
          const headers = {}
          // Sanitize: prevent CRLF header injection
          const safeVal = String(value).replace(/[\r\n]/g, '')
          if (header) headers[header] = (prefix || '') + safeVal
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 10000)
          const testRes = await fetch(url, { method: method || 'GET', headers, signal: controller.signal })
          clearTimeout(timeout)
          if (testRes.status === 401 || testRes.status === 403) {
            results[envKey] = { valid: false, layer: 'liveness', message: 'Nøkkelen ble avvist av tjenesten (401/403)' }
            continue
          }
          results[envKey] = { valid: true, layer: 'liveness', message: 'Nøkkelen er gyldig og fungerer' }
        } catch (err) {
          results[envKey] = { valid: true, layer: 'format', message: 'Format OK, men kunne ikke verifisere tilkobling' }
        }
      } else {
        results[envKey] = { valid: true, layer: 'format', message: 'Format er gyldig' }
      }
    }

    res.json({ providerId, results })
  })

  // ─── .env API (F39: single writer pattern) ───────────────────────

  app.post(`${apiPrefix}/env`, (req, res) => {
    const { key, value } = req.body || {}
    if (!key || typeof key !== 'string' || !/^[A-Z_][A-Z0-9_]*$/.test(key)) {
      return res.status(400).json({ error: 'key må være et gyldig ENV-variabelnavn (UPPER_SNAKE_CASE)' })
    }
    if (value === undefined) {
      return res.status(400).json({ error: 'value er påkrevd' })
    }
    try {
      ensureGitignoreEntry(projectRoot, '.env')
      writeEnvKey(projectRoot, key, String(value))
      sseManager.broadcast('ENV_CHANGED', { keys: [key] })
      res.json({ success: true, key })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get(`${apiPrefix}/env/:key`, (req, res) => {
    const { key } = req.params
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
      return res.status(400).json({ error: 'Ugyldig nøkkelnavn' })
    }
    const env = readEnvFile(projectRoot)
    if (env[key] !== undefined) {
      // Return masked value — never expose full secret over HTTP
      const val = env[key]
      const masked = val.length > 4 ? '••••' + val.slice(-4) : '••••'
      res.json({ key, exists: true, masked })
    } else {
      res.json({ key, exists: false, masked: null })
    }
  })

  // ─── Integrasjon-tillegg (Integrasjonskatalog) ─────────────────────

  app.post(`${apiPrefix}/integrations/add`, async (req, res) => {
    const { providerId, providerName, categoryName, isCustom } = req.body || {}
    if (!providerName || typeof providerName !== 'string' || providerName.trim().length === 0) {
      return res.status(400).json({ error: 'providerName er påkrevd' })
    }
    // Valider providerId format (kun alfanumeriske tegn, bindestreker og underscorer)
    if (providerId && (typeof providerId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(providerId))) {
      return res.status(400).json({ error: 'providerId inneholder ugyldige tegn' })
    }

    const taskName = isCustom
      ? `Integrer ${providerName}`
      : `Sett opp ${providerName} (${categoryName})`
    const taskDesc = isCustom
      ? `Brukeren ønsker å integrere "${providerName}". Undersøk hva dette er, og sett opp integrasjonen.`
      : `Sett opp ${providerName} i prosjektet. Kategori: ${categoryName}. Provider-ID: ${providerId}.`

    try {
      // Opprett oppgave i Byggelisten (hvis tilgjengelig)
      let backlogItemId = null
      if (backlogActive) {
        const { createItem } = await import('./backlog/service.js')
        const item = createItem({
          name: `[INT] ${taskName}`,
          description: taskDesc,
          type: 'task',
          priority: 'SHOULD'
        })
        backlogItemId = item?.data?.id || null
      }

      // Oppdater integrations.setup i PROJECT-STATE
      const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
      if (existsSync(statePath)) {
        const stateContent = readFileSync(statePath, 'utf-8')
        const state = JSON.parse(stateContent)
        if (!state.integrations) state.integrations = {}
        if (!Array.isArray(state.integrations.setup)) state.integrations.setup = []
        state.integrations.setup.push({
          name: providerName,
          id: providerId || providerName.toLowerCase().replace(/\s+/g, '-'),
          category: categoryName || 'egendefinert',
          // Schema: active | deferred | skipped. 'active' settes når oppsett er lagt inn i setup-listen.
          status: 'active',
          statusChangedAt: new Date().toISOString(),
          addedAt: new Date().toISOString()
        })

        // Synk AI-bilde-providers til imageStrategy (schema: type = string-enum, ikke array)
        const AI_IMAGE_PROVIDERS = {
          'flux-pro': 'black-forest-labs/flux-pro',
          'imagen-3': 'google/imagen-3',
          'replicate': 'replicate',
          'nano-banana-pro': 'google/nano-banana-pro',
          'ideogram-v3': 'ideogram-ai/ideogram-v3-turbo',
          'recraft-v3': 'recraft-ai/recraft-v3'
        }
        if (providerId && AI_IMAGE_PROVIDERS[providerId]) {
          if (!state.imageStrategy) state.imageStrategy = {}
          // Schema krever én av: 'replicate' | 'own-images' | 'none'.
          // AI-providers = replicate. Hvis 'own-images' er satt fra før, beholder vi 'replicate'
          // siden brukeren nå eksplisitt velger en AI-provider.
          state.imageStrategy.type = 'replicate'
          state.imageStrategy.replicateModel = AI_IMAGE_PROVIDERS[providerId]
        }

        // Atomisk skriving
        const prevPath = statePath + '.prev'
        const tmpPath = statePath + '.tmp'
        copyFileSync(statePath, prevPath)
        writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
        renameSync(tmpPath, statePath)
      }

      sseManager.broadcast('INTEGRATION_ADDED', { providerName, categoryName, backlogItemId })
      res.json({ success: true, backlogItemId })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ─── Checkpoint: Lagre sikkerhets-lagringspunkt (Steg 1) ─────────────

  app.post(`${apiPrefix}/checkpoints/save-safety`, async (req, res) => {
    const { targetDescription } = req.body || {}

    try {
      const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
      if (!existsSync(statePath)) {
        return res.status(404).json({ error: 'PROJECT-STATE.json ikke funnet' })
      }

      const stateContent = readFileSync(statePath, 'utf-8')
      const state = JSON.parse(stateContent)

      // Git: commit alle endringer før lagring
      let gitCommit = null
      let gitBranch = null
      if (isGitRepo(projectRoot)) {
        const status = getGitStatus(projectRoot)
        gitBranch = status?.branch || null
        gitCommit = gitCommitAll(projectRoot, `Kit CC checkpoint: Sikkerhets-lagringspunkt (før gjenoppretting til: ${targetDescription || 'ukjent'})`)
      }

      // Opprett sikkerhets-lagringspunkt med full kopi av nåværende tilstand
      // Schema (PROJECT-STATE-SCHEMA.json): type ∈ {phase-complete, milestone, manual, safety-backup}
      // phaseId (ikke phase), gitCommit (ikke gitCommitSha).
      if (!Array.isArray(state.checkpoints)) state.checkpoints = []
      const safetyCheckpoint = {
        id: `safety-${Date.now()}`,
        type: 'safety-backup',
        phaseId: state.currentPhase || 0,
        description: `Sikkerhets-lagringspunkt (før gjenoppretting til: ${targetDescription || 'ukjent'})`,
        timestamp: new Date().toISOString(),
        stateSnapshot: (() => { const s = JSON.parse(stateContent); delete s.checkpoints; return s })(),
        gitCommit: gitCommit || null,
        gitBranch: gitBranch || null
      }
      state.checkpoints.push(safetyCheckpoint)

      // Atomisk skriving
      const prevPath = statePath + '.prev'
      const tmpPath = statePath + '.tmp'
      copyFileSync(statePath, prevPath)
      writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
      renameSync(tmpPath, statePath)

      // Verifiser at det faktisk er skrevet til disk
      const verifyContent = readFileSync(statePath, 'utf-8')
      const verifyState = JSON.parse(verifyContent)
      const safetySaved = verifyState.checkpoints?.some(c => c.id === safetyCheckpoint.id)
      if (!safetySaved) {
        return res.status(500).json({ error: 'Sikkerhets-lagringspunkt ble ikke verifisert på disk.' })
      }

      sseManager.broadcast('SAFETY_CHECKPOINT_SAVED', { safetyId: safetyCheckpoint.id })
      res.json({ success: true, safetyCheckpointId: safetyCheckpoint.id })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ─── Checkpoint: Gjenopprett til valgt versjon (Steg 2) ─────────────

  app.post(`${apiPrefix}/checkpoints/restore`, async (req, res) => {
    const { checkpointId, description, phase, timestamp, safetyAlreadySaved } = req.body || {}

    try {
      const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
      if (!existsSync(statePath)) {
        return res.status(404).json({ error: 'PROJECT-STATE.json ikke funnet' })
      }

      const stateContent = readFileSync(statePath, 'utf-8')
      const state = JSON.parse(stateContent)

      // Gjenopprett til ønsket checkpoint
      const prevPath = statePath + '.prev'
      const tmpPath = statePath + '.tmp'

      const targetCp = (state.checkpoints || []).find(c => c.id === checkpointId)

      // Git: sikre ulagrede endringer og reset til checkpoint
      // Schema-feltet er 'gitCommit', men vi leser også legacy 'gitCommitSha' for bakoverkompatibilitet.
      let gitRestored = false
      const targetCommit = targetCp?.gitCommit || targetCp?.gitCommitSha || null
      if (targetCommit && isGitRepo(projectRoot)) {
        // Commit ulagrede endringer først (safety net)
        gitCommitAll(projectRoot, 'Kit CC safety save before restore')
        // Reset koden til checkpoint-tidspunktet
        gitRestored = gitResetHard(projectRoot, targetCommit)
        // KRITISK: Reparer .gitignore etter reset (K1/H7)
        if (gitRestored) ensureGitignore(projectRoot)
      }

      if (targetCp?.stateSnapshot) {
        const restoredState = { ...targetCp.stateSnapshot }
        restoredState.checkpoints = state.checkpoints // behold alle checkpoints inkl. safety
        restoredState.session = state.session // behold aktiv sesjon

        copyFileSync(statePath, prevPath)
        writeFileSync(tmpPath, JSON.stringify(restoredState, null, 2), 'utf-8')
        renameSync(tmpPath, statePath)
      } else {
        // Ingen snapshot — merk gjenoppretting for AI-agenten
        state.lastRestore = {
          checkpointId, description, phase, timestamp,
          restoredAt: new Date().toISOString()
        }

        copyFileSync(statePath, prevPath)
        writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
        renameSync(tmpPath, statePath)
      }

      // Logg til PROGRESS-LOG (append — trygt ved samtidige skrivinger)
      const logPath = join(projectRoot, '.ai', 'PROGRESS-LOG.md')
      const now = new Date()
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const action = gitRestored ? 'git reset + state restore' : 'checkpoint restore'
      const logLine = `ts=${ts} event=RECOVERY action="${action}" reason="bruker gjenopprettet til: ${description || checkpointId}"\n`
      try { appendFileSync(logPath, logLine, 'utf-8') } catch {}

      sseManager.broadcast('CHECKPOINT_RESTORED', { checkpointId, description, gitRestored })
      res.json({ success: true, gitRestored })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ─── Checkpoint: Opprett nytt lagringspunkt (for AI-agenter og manuell bruk) ─

  app.post(`${apiPrefix}/checkpoints/create`, async (req, res) => {
    const { description, phase, type } = req.body || {}

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'description er påkrevd' })
    }

    try {
      const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
      if (!existsSync(statePath)) {
        return res.status(404).json({ error: 'PROJECT-STATE.json ikke funnet' })
      }

      const stateContent = readFileSync(statePath, 'utf-8')
      const state = JSON.parse(stateContent)

      // Git: commit alle endringer
      let gitCommit = null
      let gitBranch = null
      if (isGitRepo(projectRoot)) {
        const status = getGitStatus(projectRoot)
        gitBranch = status?.branch || null
        gitCommit = gitCommitAll(projectRoot, `Kit CC checkpoint: ${description}`)
      }

      // Opprett checkpoint
      // Schema: type ∈ {phase-complete, milestone, manual, safety-backup}, phaseId (ikke phase), gitCommit (ikke gitCommitSha).
      if (!Array.isArray(state.checkpoints)) state.checkpoints = []
      const checkpoint = {
        id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: type || 'manual',
        phaseId: phase || state.currentPhase || 0,
        description,
        timestamp: new Date().toISOString(),
        stateSnapshot: (() => { const s = JSON.parse(stateContent); delete s.checkpoints; return s })(),
        gitCommit: gitCommit || null,
        gitBranch: gitBranch || null
      }
      state.checkpoints.push(checkpoint)

      // Atomisk skriving
      const prevPath = statePath + '.prev'
      const tmpPath = statePath + '.tmp'
      copyFileSync(statePath, prevPath)
      writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
      renameSync(tmpPath, statePath)

      sseManager.broadcast('CHECKPOINT_CREATED', { checkpointId: checkpoint.id, description })
      res.json({
        success: true,
        checkpointId: checkpoint.id,
        gitCommit: gitCommit || null
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // ─── SSE-endepunkt ──────────────────────────────────────────────────

  app.get(`${apiPrefix}/events`, (req, res) => {
    sseManager.connect(req, res)
  })

  // ─── Console-feil (fra overlay) ─────────────────────────────────────

  app.post(`${apiPrefix}/errors`, (req, res) => {
    const { type, data, timestamp } = req.body || {}

    if (!type || !data) {
      return res.status(400).json({ error: 'Mangler type eller data' })
    }

    const errorsData = readErrorsFile(projectRoot)
    const now = timestamp || Date.now()
    const dedupKey = getDeduplicationKey(type, data)

    // Deduplisering: sjekk om samme feil allerede finnes innen 60s
    const existing = errorsData.errors.find(e =>
      getDeduplicationKey(e.type, e.data) === dedupKey &&
      (now - e.lastSeen) < DEDUP_WINDOW_MS
    )

    if (existing) {
      existing.count = (existing.count || 1) + 1
      existing.lastSeen = now
      writeErrorsFile(projectRoot, errorsData)
      sseManager.broadcast('ERROR_CAPTURED', existing)
      return res.status(200).json({ received: true, id: existing.id, deduplicated: true })
    }

    // Ny feil
    const message = typeof data === 'string' ? data : (data?.message || data?.reason || JSON.stringify(data))
    const entry = {
      id: generateErrorId(),
      type,
      message,
      data,
      source: (data?.source || data?.filename) || null,
      line: data?.line || data?.lineno || null,
      col: data?.col || data?.colno || null,
      url: req.headers.referer || 'unknown',
      timestamp: now,
      count: 1,
      firstSeen: now,
      lastSeen: now,
      status: 'new',
      fixAttempts: 0
    }

    // Ring-buffer: fjern eldste hvis full
    if (errorsData.errors.length >= (errorsData.maxErrors || 100)) {
      errorsData.errors.shift()
    }
    errorsData.errors.push(entry)
    writeErrorsFile(projectRoot, errorsData)

    // Push til alle tilkoblede klienter (lav latens)
    sseManager.broadcast('ERROR_CAPTURED', entry)

    res.status(201).json({ received: true, id: entry.id })
  })

  app.get(`${apiPrefix}/errors`, (req, res) => {
    const errorsData = readErrorsFile(projectRoot)
    const limit = Math.min(parseInt(req.query.limit) || 50, errorsData.maxErrors || 100)
    const type = req.query.type // Filter: error, warn, uncaught, promise, network
    const status = req.query.status // Filter: new, fixing, unfixable

    let filtered = errorsData.errors
    if (type) {
      filtered = filtered.filter(e => e.type === type)
    }
    if (status) {
      filtered = filtered.filter(e => e.status === status)
    }

    res.json({
      errors: filtered.slice(-limit),
      total: filtered.length,
      bufferSize: errorsData.maxErrors || 100
    })
  })

  // Rydd opp alle feil
  app.delete(`${apiPrefix}/errors`, (req, res) => {
    const errorsData = readErrorsFile(projectRoot)
    const cleared = errorsData.errors.length
    errorsData.errors = []
    writeErrorsFile(projectRoot, errorsData)

    sseManager.broadcast('ERRORS_CLEARED', { cleared })

    res.json({ cleared, message: `${cleared} feil fjernet` })
  })

  // Fjern enkelt feil etter id
  app.delete(`${apiPrefix}/errors/:id`, (req, res) => {
    const errorsData = readErrorsFile(projectRoot)
    const idx = errorsData.errors.findIndex(e => e.id === req.params.id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Feil ikke funnet' })
    }
    errorsData.errors.splice(idx, 1)
    writeErrorsFile(projectRoot, errorsData)

    sseManager.broadcast('ERROR_REMOVED', { id: req.params.id })

    res.json({ removed: true, id: req.params.id })
  })

  // Oppdater feil-status eller fixAttempts
  app.patch(`${apiPrefix}/errors/:id`, (req, res) => {
    const { status: newStatus, fixAttempts } = req.body || {}
    const errorsData = readErrorsFile(projectRoot)
    const entry = errorsData.errors.find(e => e.id === req.params.id)
    if (!entry) {
      return res.status(404).json({ error: 'Feil ikke funnet' })
    }

    if (newStatus && ['new', 'fixing', 'unfixable'].includes(newStatus)) {
      entry.status = newStatus
    }
    if (typeof fixAttempts === 'number') {
      entry.fixAttempts = fixAttempts
    }
    writeErrorsFile(projectRoot, errorsData)

    sseManager.broadcast('ERROR_UPDATED', { id: entry.id, status: entry.status, fixAttempts: entry.fixAttempts })

    res.json({ updated: true, id: entry.id, status: entry.status, fixAttempts: entry.fixAttempts })
  })

  // ─── Backlog API (status-endepunkt) ──────────────────────────────────

  app.get(`${apiPrefix}/backlog`, (req, res) => {
    if (backlogActive) {
      res.json({
        available: true,
        message: 'Byggeliste-systemet er aktivt (Lag 3: F13-F17)',
        endpoints: {
          tree: `${apiPrefix}/backlog/tree`,
          stats: `${apiPrefix}/backlog/stats`,
          chat: `${apiPrefix}/chat/conversations`,
          sync: `${apiPrefix}/backlog/sync/consistency`
        }
      })
    } else {
      res.json({
        available: false,
        message: 'Byggeliste er ikke tilgjengelig. Kjør: npm install i kit-cc-overlay/'
      })
    }
  })

  // ─── Fallback-ruter når backlog er utilgjengelig ──────────────────────

  if (!backlogActive) {
    const unavailable = (req, res) => {
      res.status(503).json({
        success: false,
        available: false,
        error: 'Byggeliste er ikke tilgjengelig. Kjør: npm install i kit-cc-overlay/'
      })
    }
    app.get(`${apiPrefix}/backlog/tree`, unavailable)
    app.get(`${apiPrefix}/backlog/stats`, unavailable)
    app.get(`${apiPrefix}/backlog/items/:id`, unavailable)
    app.post(`${apiPrefix}/backlog/items`, unavailable)
    app.post(`${apiPrefix}/backlog/approve`, unavailable)
    app.get(`${apiPrefix}/chat/status`, unavailable)
    app.get(`${apiPrefix}/chat/conversations`, unavailable)
    app.get(`${apiPrefix}/chat/conversations/:id`, unavailable)
    app.post(`${apiPrefix}/chat/conversations`, unavailable)
    app.post(`${apiPrefix}/chat/conversations/:id/messages`, unavailable)
    app.delete(`${apiPrefix}/chat/conversations/:id`, unavailable)
    app.patch(`${apiPrefix}/chat/conversations/:id/title`, unavailable)
    app.post(`${apiPrefix}/chat/config`, unavailable)
  }

  // ─── Innstillinger API (F30) ──────────────────────────────────────

  // Intensity level labels
  const INTENSITY_NAMES = {
    minimal: 'Enkelt hobbyprosjekt',
    forenklet: 'Lite, oversiktlig prosjekt',
    standard: 'Vanlig app-prosjekt',
    grundig: 'Viktig prosjekt med sensitive data',
    enterprise: 'Stort, kritisk system'
  }

  app.get(`${apiPrefix}/settings`, (req, res) => {
    const state = readProjectState(projectRoot)
    if (state.error) {
      return res.status(404).json({ error: 'PROJECT-STATE.json ikke funnet' })
    }

    // Fase-navn synkronisert med CLAUDE.md steg 6 (autoritativ kilde)
    const PHASE_NAMES = ['', 'Idé og visjon', 'Planlegg', 'Arkitektur', 'MVP', 'Bygg funksjonene', 'Kvalitetssjekk', 'Publiser']

    res.json({
      editable: {
        projectName: { value: state.projectName || '', label: 'Prosjektnavn', type: 'text', hint: 'Navnet på prosjektet ditt. Vises i Monitor og i AI-chatten.' },
        builderMode: {
          value: state.builderMode || '', label: 'Byggemodus', type: 'select', hint: 'Hvor mye kontroll vil du ha over byggeprosessen?',
          options: [
            { value: 'ai-bestemmer', label: 'AI bestemmer', desc: 'AI tar alle tekniske valg selv og bygger raskt. Du ser resultatet.' },
            { value: 'samarbeid', label: 'Samarbeid', desc: 'AI foreslår løsninger og du godkjenner viktige valg. God balanse mellom fart og kontroll.' },
            { value: 'detaljstyrt', label: 'Detaljstyrt', desc: 'Du styrer hvert eneste valg. AI forklarer alternativer i detalj, du bestemmer.' }
          ]
        },
        userLevel: {
          value: state.classification?.userLevel || '', label: 'Kommunikasjonsnivå', type: 'select', hint: 'Hvordan skal AI-en snakke med deg?',
          path: 'classification.userLevel',
          options: [
            { value: 'utvikler', label: 'Utvikler', desc: 'Teknisk språk. Eks: "Setter opp Express-server med CORS-middleware."' },
            { value: 'erfaren-vibecoder', label: 'Erfaren vibecoder', desc: 'Hverdagsspråk med tekniske ord. Eks: "Lager en server (Express) med sikkerhet (CORS)."' },
            { value: 'ny-vibecoder', label: 'Ny vibecoder', desc: 'Enkelt språk med analogier. Eks: "Lager en mottaksdisk (server) som tar imot bestillinger."' }
          ]
        },
        imageStrategy: {
          // Schema: string-enum ('replicate' | 'own-images' | 'none'). Vi returnerer én verdi, ikke array.
          // Håndterer legacy-data der type kan være array (fra tidligere kode).
          value: (() => {
            const t = state.imageStrategy?.type
            if (Array.isArray(t)) return t[0] || 'none'
            return t || 'none'
          })(),
          label: 'Bilder', type: 'select', hint: 'Hvordan vil du legge til bilder i appen?',
          path: 'imageStrategy.type',
          options: [
            { value: 'none', label: 'Ingen bilder', desc: 'Appen din trenger ikke bilder.' },
            { value: 'own-images', label: 'Egne bilder', desc: 'Du legger inn egne bilder manuelt.' },
            { value: 'replicate', label: 'AI-genererte bilder', desc: 'AI lager bilder automatisk. Ca. $0.03-0.05 per bilde.' }
          ],
          activeModel: (() => {
            const model = state.imageStrategy?.replicateModel
            if (!model) return null
            const MODEL_NAMES = {
              'black-forest-labs/flux-pro': 'Flux Pro',
              'black-forest-labs/flux-schnell': 'Flux Schnell',
              'google/imagen-3': 'Imagen 3 (Google)',
              'google/nano-banana-pro': 'Nano Banana Pro',
              'ideogram-ai/ideogram-v3-turbo': 'Ideogram v3',
              'recraft-ai/recraft-v3': 'Recraft v3',
              'replicate': 'Replicate'
            }
            return MODEL_NAMES[model] || model
          })(),
          replicateModel: state.imageStrategy?.replicateModel || null,
          modelOptions: [
            { value: 'black-forest-labs/flux-pro', label: 'Flux Pro', desc: 'Beste kvalitet. ~$0.05/bilde.' },
            { value: 'black-forest-labs/flux-schnell', label: 'Flux Schnell', desc: 'Raskest. ~$0.003/bilde.' },
            { value: 'google/imagen-3', label: 'Imagen 3', desc: 'Googles modell. ~$0.13/bilde.' },
            { value: 'google/nano-banana-pro', label: 'Nano Banana Pro', desc: 'Rask og rimelig. ~$0.01/bilde.' },
            { value: 'ideogram-ai/ideogram-v3-turbo', label: 'Ideogram v3', desc: 'Best på tekst i bilder. ~$0.04/bilde.' },
            { value: 'recraft-ai/recraft-v3', label: 'Recraft v3', desc: 'Best på illustrasjoner. ~$0.04/bilde.' }
          ]
        },
        overlayMode: {
          value: state.overlay?.mode || 'proxy', label: 'Monitor-modus', type: 'select',
          hint: 'Bestemmer hvordan Kit CC Monitor vises i nettleseren.',
          path: 'overlay.mode',
          options: [
            { value: 'proxy', label: 'Monitor (anbefalt)', desc: 'Appen din vises i nettleseren med Kit CC-panelet flytende oppå. Du ser appen og Monitor samtidig. Krever at dev-serveren kjører.' },
            { value: 'standalone', label: 'Standalone', desc: 'Monitor kjører som en egen side uten appen din. Nyttig i tidlige faser (1-3) før du har noe å vise, eller hvis du foretrekker å ha Monitor i en egen fane.' }
          ]
        },
        devServerPort: {
          value: state.overlay?.devServerPort || '', label: 'Dev-server port', type: 'number', hint: 'Porten dev-serveren kjører på (f.eks. 3000). Kreves for proxy-modus.',
          path: 'overlay.devServerPort'
        }
      },
      readonly: {
        intensityLevel: { value: state.classification?.intensityLevel || 'ukjent', label: 'Prosjekttype', display: INTENSITY_NAMES[state.classification?.intensityLevel] || state.classification?.intensityLevel || 'Ikke klassifisert', hint: 'Bestemmer hvor grundig prosessen er.' },
        score: { value: state.classification?.score || 0, label: 'Kompleksitets-score', display: `${state.classification?.score || 0} av 28`, hint: 'Beregnes automatisk ut fra 7 faktorer. Høyere score = mer grundig prosess.' },
        userType: { value: state.classification?.userType || 'ukjent', label: 'Brukertype', display: state.classification?.userType || 'Ikke satt', hint: 'Hvem bruker appen — intern, ekstern eller offentlig.' },
        integrations: { value: state.integrations?.confirmed || [], label: 'Integrasjoner', display: (state.integrations?.confirmed || []).join(', ') || 'Ingen', hint: 'Tjenester appen din er koblet til.' },
        sensitiveData: { value: state.dataTypes?.sensitive || [], label: 'Sensitive data', display: (state.dataTypes?.sensitive || []).join(', ') || 'Ingen', hint: 'Typer sensitiv informasjon appen håndterer.' }
      },
      gateOverrides: state.gateOverrides || []
    })
  })

  app.put(`${apiPrefix}/settings`, (req, res) => {
    const { field, value } = req.body || {}
    if (!field || value === undefined) {
      return res.status(400).json({ error: 'field og value er påkrevd' })
    }

    // Godkjente felt som kan endres
    const allowed = {
      'projectName': 'projectName',
      'builderMode': 'builderMode',
      'classification.userLevel': 'classification.userLevel',
      'imageStrategy.type': 'imageStrategy.type',
      'imageStrategy.replicateModel': 'imageStrategy.replicateModel',
      'overlay.mode': 'overlay.mode',
      'overlay.devServerPort': 'overlay.devServerPort'
    }

    if (!allowed[field]) {
      return res.status(400).json({ error: `Feltet "${field}" kan ikke endres via API` })
    }

    // Verdi-validering per felt
    const FIELD_VALIDATORS = {
      'projectName': v => typeof v === 'string' && v.trim().length > 0 && v.length <= 200,
      'builderMode': v => ['ai-bestemmer', 'samarbeid', 'detaljstyrt'].includes(v),
      'classification.userLevel': v => ['utvikler', 'erfaren-vibecoder', 'ny-vibecoder'].includes(v),
      // Schema krever string-enum. Godtar legacy array-input ved å validere hvert element.
      'imageStrategy.type': v => {
        if (Array.isArray(v)) return v.every(t => ['own-images', 'replicate', 'none'].includes(t))
        return typeof v === 'string' && ['own-images', 'replicate', 'none'].includes(v)
      },
      'imageStrategy.replicateModel': v => typeof v === 'string' && [
        'black-forest-labs/flux-pro', 'black-forest-labs/flux-schnell', 'google/imagen-3',
        'google/nano-banana-pro', 'ideogram-ai/ideogram-v3-turbo', 'recraft-ai/recraft-v3'
      ].includes(v),
      'overlay.mode': v => ['standalone', 'proxy'].includes(v),
      'overlay.devServerPort': v => { const n = parseInt(v); return Number.isInteger(n) && n >= 1 && n <= 65535 }
    }
    const validator = FIELD_VALIDATORS[field]
    if (validator && !validator(value)) {
      return res.status(400).json({ error: `Ugyldig verdi for "${field}"` })
    }

    const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
    if (!existsSync(statePath)) {
      return res.status(404).json({ error: 'PROJECT-STATE.json finnes ikke' })
    }

    try {
      const stateContent = readFileSync(statePath, 'utf-8')
      const state = JSON.parse(stateContent)
      const oldValue = getNestedValue(state, field)

      // Sett verdien med støtte for nestede stier
      setNestedValue(state, field, value)

      // Atomisk skriving: backup → tmp → rename
      const prevPath = statePath + '.prev'
      const tmpPath = statePath + '.tmp'
      copyFileSync(statePath, prevPath)
      writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
      renameSync(tmpPath, statePath)

      // Logg til PROGRESS-LOG (append — trygt ved samtidige skrivinger)
      const logPath = join(projectRoot, '.ai', 'PROGRESS-LOG.md')
      const now = new Date()
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      // Sanitize field/value for logfmt (fjern linjeskift og doble anførselstegn)
      const safeField = String(field).replace(/[\n\r"]/g, '')
      const safeOld = String(oldValue).replace(/[\n\r"]/g, '').slice(0, 100)
      const safeNew = String(value).replace(/[\n\r"]/g, '').slice(0, 100)
      const logLine = `ts=${ts} event=DECISION what="${safeField} endret fra ${safeOld} til ${safeNew}" reason="endret via Monitor"\n`
      try { appendFileSync(logPath, logLine, 'utf-8') } catch {}

      // SSE broadcast
      sseManager.broadcast('SETTINGS_CHANGED', { field, value, oldValue })

      res.json({ success: true, field, value, oldValue })
    } catch (err) {
      res.status(500).json({ error: `Kunne ikke oppdatere innstilling: ${err.message}` })
    }
  })

  // ─── Datapanel API (F32) ──────────────────────────────────────────

  app.get(`${apiPrefix}/data/panels`, (req, res) => {
    res.json({ panels: getPanelList() })
  })

  app.get(`${apiPrefix}/data/:panel`, (req, res) => {
    const panelId = req.params.panel
    try {
      const result = generatePanel(panelId, projectRoot)

      if (result.error) {
        // Sjekk om det er "ukjent panel" (404) vs generell feil (500)
        const is404 = result.error.includes('Ukjent panel') || result.error.includes('ikke funnet')
        return res.status(is404 ? 404 : 500).json({ error: result.error })
      }

      res.json({ panelId, ...result })
    } catch (err) {
      res.status(500).json({ error: `Intern feil ved generering av panel: ${err.message}` })
    }
  })

  // ─── Beskriv-endepunkt (AI-genererte forklaringer) ──────────────────

  const descriptionCache = new Map()  // key → { value, expiresAt }
  const MAX_CACHE_SIZE = 500
  const CACHE_TTL_MS = 60 * 60 * 1000  // 1 time TTL
  let describeCallCount = 0
  let describeResetTimer = null
  const MAX_DESCRIBE_PER_MINUTE = 10

  app.post(`${apiPrefix}/describe`, async (req, res) => {
    const { name, type, context } = req.body || {}

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name er påkrevd' })
    }

    // Valider type
    const validTypes = ['module', 'feature', 'micro_feature', 'task', 'item']
    const safeType = validTypes.includes(type) ? type : 'item'

    // Sjekk cache (med TTL)
    const cacheKey = `${safeType}:${name}`
    const cached = descriptionCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return res.json({ description: cached.value, cached: true })
    }
    if (cached) descriptionCache.delete(cacheKey)  // Expired

    // Rate-limiting: maks 10 kall per minutt
    describeCallCount++
    if (!describeResetTimer) {
      describeResetTimer = setTimeout(() => { describeCallCount = 0; describeResetTimer = null }, 60000)
    }
    if (describeCallCount > MAX_DESCRIBE_PER_MINUTE) {
      return res.status(429).json({ error: 'For mange forespørsler — vent litt før du prøver igjen' })
    }

    // Sjekk API-nøkkel
    const apiKey = getApiKey(projectRoot)
    if (!apiKey) {
      return res.status(401).json({
        error: 'API-nøkkel ikke konfigurert',
        hint: 'Legg inn API-nøkkel i monitoren for å bruke AI-forklaringer'
      })
    }

    // Bygg prompt
    const typeNames = {
      module: 'modul (en del av programvaren)',
      feature: 'funksjon/feature',
      micro_feature: 'del-funksjon',
      task: 'oppgave i utviklingsprosessen'
    }
    const typeName = typeNames[safeType] || 'element'
    let prompt = `Forklar kort hva denne ${typeName} gjør: "${name}"`
    // Begrens context-lengde (forhindrer prompt injection og store payloads)
    if (context && typeof context === 'string') {
      prompt += `\nDen tilhører: ${context.slice(0, 200)}`
    }

    // Server-side timeout: 15 sekunder (forhindrer hengende requests)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          system: 'Du forklarer programvareutviklingsoppgaver på norsk for en ikke-teknisk person. Svar i maks 2 korte setninger. Forklar hva det gjør og hvorfor det er viktig. Ikke bruk teknisk sjargong.',
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`API-feil (${response.status}): ${err.slice(0, 200)}`)
      }

      const data = await response.json()
      const description = data.content?.[0]?.text || 'Kunne ikke generere forklaring'

      // Cache eviction: fjern expired + eldste hvis cache er full
      if (descriptionCache.size >= MAX_CACHE_SIZE) {
        const now = Date.now()
        for (const [k, v] of descriptionCache) {
          if (now >= v.expiresAt) descriptionCache.delete(k)
        }
        if (descriptionCache.size >= MAX_CACHE_SIZE) {
          const firstKey = descriptionCache.keys().next().value
          descriptionCache.delete(firstKey)
        }
      }
      descriptionCache.set(cacheKey, { value: description, expiresAt: Date.now() + CACHE_TTL_MS })
      res.json({ description, cached: false })
    } catch (err) {
      clearTimeout(timeoutId)
      const msg = err.name === 'AbortError'
        ? 'AI-kallet tok for lang tid (15s timeout)'
        : err.message
      res.status(502).json({ error: `AI-feil: ${msg}` })
    }
  })

  // ─── Telemetri API (opt-in feilrapportering) ──────────────────────────

  // Transparenstekst — vises til bruker FØR samtykke (GDPR krav)
  const TELEMETRY_TRANSPARENCY = {
    what: 'Anonyme feilrapporter: feiltype, sanitert stack trace (uten filstier), Node.js-versjon, OS, Monitor-versjon.',
    whatNot: 'Vi samler ALDRI inn: filstier, kildekode, API-nøkler, e-post, IP-adresser, prosjektnavn eller persondata.',
    why: 'For å oppdage og fikse feil som påvirker mange brukere.',
    how: 'Feil samles lokalt og sendes kryptert (HTTPS) til telemetry.kit-cc.dev hvert 5. minutt.',
    rights: 'Du kan når som helst slå av, be om innsyn (GET /telemetry/data) eller sletting (DELETE /telemetry/data).',
    consentVersion: '1.0'
  }

  app.post(`${apiPrefix}/telemetry/consent`, (req, res) => {
    if (!telemetry) return res.status(503).json({ error: 'Telemetri ikke tilgjengelig' })

    const { enabled } = req.body || {}
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled (boolean) er påkrevd' })
    }

    if (enabled) {
      telemetry.consent()
    } else {
      telemetry.decline()
    }

    res.json({ success: true, enabled })
  })

  app.get(`${apiPrefix}/telemetry/status`, (req, res) => {
    if (!telemetry) return res.json({ available: false })

    const status = telemetry.getStatus()
    res.json({
      available: true,
      enabled: status.enabled,
      queueSize: status.queueSize,
      transparency: TELEMETRY_TRANSPARENCY
    })
  })

  // GDPR: Innsyn i innsamlede data (data subject access request)
  app.get(`${apiPrefix}/telemetry/data`, (req, res) => {
    if (!telemetry) return res.status(503).json({ error: 'Telemetri ikke tilgjengelig' })
    const status = telemetry.getStatus()
    res.json({
      enabled: status.enabled,
      queuedErrors: status.queueSize,
      transparency: TELEMETRY_TRANSPARENCY,
      note: 'Køede feilrapporter slettes ved sending eller ved å slå av telemetri. Sendte data kan ikke hentes tilbake lokalt.'
    })
  })

  // GDPR: Sletting av innsamlede data (right to erasure)
  app.delete(`${apiPrefix}/telemetry/data`, (req, res) => {
    if (!telemetry) return res.status(503).json({ error: 'Telemetri ikke tilgjengelig' })
    telemetry.decline()  // Slår av + tømmer kø
    res.json({ success: true, message: 'Alle køede feilrapporter slettet og telemetri deaktivert.' })
  })

  // ─── Browser Debug Probes ───────────────────────────────────────────────

  let probeCallCount = 0
  let probeResetTimer = null
  const MAX_PROBES_PER_MINUTE = 10

  // Periodisk cleanup av gamle probes (hvert 5. minutt)
  const probeCleanupInterval = setInterval(() => {
    try { cleanupOldProbes(projectRoot) } catch {}
  }, 5 * 60 * 1000)

  // Unref slik at intervallet ikke holder Node-prosessen i live
  if (probeCleanupInterval.unref) probeCleanupInterval.unref()

  // POST /kit-cc/api/probes — Opprett probe (AI → nettleser)
  app.post(`${apiPrefix}/probes`, async (req, res) => {
    const { type, params, timeout } = req.body || {}

    if (!type || !ALLOWED_PROBE_TYPES.includes(type)) {
      return res.status(400).json({
        error: `Ugyldig probe-type. Tillatte typer: ${ALLOWED_PROBE_TYPES.join(', ')}`
      })
    }

    // Rate-limiting
    probeCallCount++
    if (!probeResetTimer) {
      probeResetTimer = setTimeout(() => { probeCallCount = 0; probeResetTimer = null }, 60000)
    }
    if (probeCallCount > MAX_PROBES_PER_MINUTE) {
      return res.status(429).json({ error: 'For mange probe-forespørsler — vent litt' })
    }

    // Sjekk at minst én nettleser er tilkoblet
    if (sseManager.clients.size === 0) {
      return res.status(503).json({
        error: 'Ingen nettleser tilkoblet. Åpne appen i nettleseren først.'
      })
    }

    const probeTimeout = Math.min(Math.max(parseInt(timeout) || 5000, 1000), 30000)
    const probe = createProbe(projectRoot, type, params, probeTimeout)

    // Send probe-forespørsel til nettleser via SSE
    sseManager.broadcast('PROBE_REQUEST', {
      id: probe.id,
      type: probe.type,
      params: probe.params,
      timeout: probe.timeout
    })

    // Start timeout-timer
    startProbeTimeout(probe.id, probeTimeout, () => {
      // Timeout: oppdater probe-status i filen
      try {
        const data = readProbesFile(projectRoot)
        const p = data.probes.find(x => x.id === probe.id)
        if (p && p.status !== 'completed' && p.status !== 'error') {
          p.status = 'timeout'
          p.respondedAt = Date.now()
          p.result = { success: false, error: 'Timeout — nettleseren svarte ikke innen fristen' }
          writeProbesFile(projectRoot, data)
        }
      } catch {}
      // Resolv ventende wait-connection med timeout
      resolveWaitingProbe(probe.id, { id: probe.id, status: 'timeout', result: { success: false, error: 'Timeout' } })
    })

    // Wait-modus: hold connection åpen til resultat
    const waitMode = req.query.wait === 'true'
    if (waitMode) {
      const result = await waitForProbeResult(probe.id, probeTimeout)
      if (result?.timeout) {
        return res.json({ id: probe.id, status: 'timeout', result: { success: false, error: 'Timeout' } })
      }
      return res.json(result)
    }

    res.json({ id: probe.id, status: 'sent' })
  })

  // GET /kit-cc/api/probes/:id — Hent probe-status/resultat
  app.get(`${apiPrefix}/probes/:id`, (req, res) => {
    const data = readProbesFile(projectRoot)
    const probe = data.probes.find(p => p.id === req.params.id)
    if (!probe) {
      return res.status(404).json({ error: 'Probe ikke funnet' })
    }
    res.json(probe)
  })

  // POST /kit-cc/api/probes/:id/result — Nettleser poster resultat tilbake
  app.post(`${apiPrefix}/probes/:id/result`, (req, res) => {
    const { success, data, error } = req.body || {}
    const probeId = req.params.id

    const result = { success: success !== false, data: data || null }
    if (error) result.error = String(error).slice(0, 2000)

    const updated = updateProbeResult(projectRoot, probeId, result)
    if (!updated) {
      return res.status(404).json({ error: 'Probe ikke funnet' })
    }

    // Avbryt timeout
    clearProbeTimeout(probeId)

    // Resolv ventende wait-connections
    resolveWaitingProbe(probeId, updated)

    // Broadcast resultat via SSE
    sseManager.broadcast('PROBE_RESULT', { id: probeId, status: updated.status, result })

    res.json({ received: true, id: probeId })
  })

  // ─── Global Express error handler (fanger uventede feil) ──────────────

  app.use((err, req, res, _next) => {
    // JSON parse errors fra express.json()
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Ugyldig JSON i request body' })
    }
    // Logg internt, men eksponer ALDRI feilmeldinger (kan inneholde stier/sensitiv data)
    console.error(`❌ Uventet Express-feil: ${err.message}`)
    res.status(500).json({ error: 'Intern serverfeil' })
  })

  console.log(`📡 API-ruter registrert under ${apiPrefix}/`)
}
