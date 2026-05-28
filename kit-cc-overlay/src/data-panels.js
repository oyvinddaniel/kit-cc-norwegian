/**
 * Data-paneler for Kit CC Monitor (F32)
 *
 * 14 datapaneler som henter og strukturerer data fra Kit CC-kilder.
 * Brukes av GET /kit-cc/api/data/:panel
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  readProjectState,
  readProgressLog,
  readModulregister,
  buildPhaseOverview
} from './parsers.js'
import { INTEGRATION_CATALOG } from './integration-catalog.js'
import { getTasksWithStatus, PHASES, INTENSITY_LABELS } from './tasks/phase-tasks.js'

const PHASE_NAMES = ['', 'Idé og visjon', 'Planlegg', 'Arkitektur og sikkerhet', 'MVP', 'Bygg funksjonene', 'Test og kvalitetssjekk', 'Publiser og vedlikehold']

// ─── Panel-registry ──────────────────────────────────────────────────

const PANELS = {
  activity: { name: 'Aktivitetsfeed', icon: 'activity', desc: 'Alt som skjer i prosjektet akkurat nå', generate: panelActivity },
  decisions: { name: 'Beslutningslogg', icon: 'decisions', desc: 'Forstå hvorfor AI tok bestemte valg', generate: panelDecisions },
  errors: { name: 'Feil og reparasjoner', icon: 'errors', desc: 'Feil som har oppstått og hva som ble gjort', generate: panelErrors },
  session: { name: 'Sesjonsstatistikk', icon: 'session', desc: 'Nøkkeltall for denne arbeidsøkten', generate: panelSession },
  quality: { name: 'Kvalitets-dashboard', icon: 'quality', desc: 'Kvalitetskontrollen per fase', generate: panelQuality },
  modules: { name: 'Modul-roadmap', icon: 'modules', desc: 'Alle funksjoner i appen — fra idé til ferdig', generate: panelModules },
  risks: { name: 'Risiko og blokkere', icon: 'risks', desc: 'Ting som kan skape problemer', generate: panelRisks },
  progresslog: { name: 'Fremdriftslogg', icon: 'activity', desc: 'Kronologisk logg over alt som er gjort', generate: panelProgressLog },
  deliverables: { name: 'Leveranse-sjekkliste', icon: 'deliverables', desc: 'Alle filer og dokumenter som er opprettet', generate: panelDeliverables },
  metrics: { name: 'Prosjekt-metrics', icon: 'metrics', desc: 'Statistikk og trender over tid', generate: panelMetrics },
  dependencies: { name: 'Avhengighetsgraf', icon: 'dependencies', desc: 'Hvilke funksjoner som avhenger av andre', generate: panelDependencies },
  scope: { name: 'Scope-endringer', icon: 'scope', desc: 'Oppgaver som er omprioritert', generate: panelScope },
  autonomy: { name: 'Autonomi-oversikt', icon: 'autonomy', desc: 'Hva AI gjør selv og hva som krever deg', generate: panelAutonomy }
}

// Paneler som har egne faner men fortsatt trenger API-endepunkt
const HIDDEN_PANELS = {
  integrations: { generate: panelIntegrations },
  checkpoints: { generate: panelCheckpoints }
}

export function getPanelList() {
  return Object.entries(PANELS).map(([id, p]) => ({ id, name: p.name, icon: p.icon, desc: p.desc }))
}

export function generatePanel(panelId, projectRoot) {
  const panel = PANELS[panelId] || HIDDEN_PANELS[panelId]
  if (!panel) return { error: `Ukjent panel: ${panelId}` }
  return panel.generate(projectRoot)
}

// ─── 1. Aktivitetsfeed ───────────────────────────────────────────────

function panelActivity(projectRoot) {
  const log = readProgressLog(projectRoot, 100)
  return {
    hint: 'Alt som skjer i prosjektet ditt akkurat nå — filendringer, lagringer, oppgaver som starter og fullføres.',
    entries: log.entries.slice().reverse(),
    totalEvents: log.totalLines
  }
}

// ─── 2. Beslutningslogg ──────────────────────────────────────────────

function panelDecisions(projectRoot) {
  const log = readProgressLog(projectRoot, 500)
  const decisions = log.entries.filter(e => e.type === 'DECISION').slice().reverse()

  return {
    hint: 'Alle viktige valg AI har tatt underveis — og hvorfor.',
    decisions: decisions.map(d => ({
      time: d.time,
      what: d.fields?.what || d.description,
      reason: d.fields?.reason || '',
      raw: d.raw
    })),
    total: decisions.length
  }
}

// ─── 3. Feil- og reparasjonslogg ─────────────────────────────────────

function panelErrors(projectRoot) {
  const log = readProgressLog(projectRoot, 500)
  const errors = log.entries.filter(e => e.type === 'ERROR').slice().reverse()

  return {
    hint: 'Feil som har oppstått og hvordan de ble fikset.',
    errors: errors.map(e => ({
      time: e.time,
      description: e.fields?.desc || e.description,
      fix: e.fields?.fix || '',
      raw: e.raw
    })),
    total: errors.length
  }
}

// ─── 4. Sesjonsstatistikk ────────────────────────────────────────────

function panelSession(projectRoot) {
  const log = readProgressLog(projectRoot, 500)
  const state = readProjectState(projectRoot)
  if (state.error) return { hint: 'Nøkkeltall for denne arbeidsøkten.', stats: {}, error: state.error }
  const entries = log.entries

  const fileEvents = entries.filter(e => e.type === 'FILE')
  const commitEvents = entries.filter(e => e.type === 'COMMIT')
  const startEvents = entries.filter(e => e.type === 'START')
  const doneEvents = entries.filter(e => e.type === 'DONE')
  const errorEvents = entries.filter(e => e.type === 'ERROR')
  const contextEvents = entries.filter(e => e.type === 'CONTEXT_BUDGET')

  // Unique files
  const uniqueFiles = new Set(fileEvents.map(e => e.fields?.path).filter(Boolean))

  return {
    hint: 'Nøkkeltall for denne arbeidsøkten.',
    sessionId: state?.session?.sessionId || null,
    startedAt: state?.session?.startedAt || null,
    stats: {
      filesChanged: uniqueFiles.size,
      totalFileEvents: fileEvents.length,
      commits: commitEvents.length,
      tasksStarted: startEvents.length,
      tasksCompleted: doneEvents.length,
      errors: errorEvents.length,
      contextPauses: contextEvents.length,
      totalLogEntries: log.totalLines
    },
    recentFiles: [...uniqueFiles].slice(-20)
  }
}

// ─── 5. Kvalitets-dashboard ──────────────────────────────────────────

function panelQuality(projectRoot) {
  const state = readProjectState(projectRoot)
  if (state.error) return { hint: 'Kvalitetskontrollen for hver fase.', phases: [], error: state.error }

  const phases = buildPhaseOverview(state)

  return {
    hint: 'Kvalitetskontrollen for hver fase. Grønt betyr godkjent, rødt betyr at noe mangler.',
    currentPhase: state.currentPhase || 0,
    phases: phases.map(p => ({
      num: p.num,
      name: p.name,
      status: p.status,
      gatesPassed: p.status === 'completed',
      completedSteps: (state.completedSteps || []).filter(s => {
        const prefix = ['', 'OPP-', 'KRAV-', 'ARK-', 'MVP-', 'ITR-', 'KVA-', 'PUB-'][p.num] || ''
        return typeof s === 'string' && s.startsWith(prefix)
      }).length,
      skippedSteps: (state.skippedSteps || []).filter(s => {
        const id = typeof s === 'string' ? s : s?.id
        const prefix = ['', 'OPP-', 'KRAV-', 'ARK-', 'MVP-', 'ITR-', 'KVA-', 'PUB-'][p.num] || ''
        return id && id.startsWith(prefix)
      }).length
    })),
    gateOverrides: state.gateOverrides || []
  }
}

// ─── 6. Modul-roadmap ────────────────────────────────────────────────

function panelModules(projectRoot) {
  const modReg = readModulregister(projectRoot)

  return {
    hint: 'Alle funksjonene i appen din — fra idé til ferdig.',
    modules: (modReg.modules || []).map(m => {
      const done = m.features?.filter(f => f.done).length || 0
      const total = m.features?.length || 0
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      const status = pct === 100 ? 'Ferdig' : pct > 0 ? 'Pågår' : 'Venter'
      return {
        name: m.name,
        status,
        progress: pct,
        done,
        total,
        features: m.features || []
      }
    }),
    found: modReg.found
  }
}

// ─── 7. Risiko og blokkere ───────────────────────────────────────────

function panelRisks(projectRoot) {
  const state = readProjectState(projectRoot)
  if (state.error) return { hint: 'Ting som kan skape problemer.', items: [], error: state.error }

  const items = []

  // Gate-overrides = risiko
  for (const g of (state.gateOverrides || [])) {
    items.push({
      type: 'gate-override',
      severity: 'high',
      label: `Gate-unntak: Fase ${g.phase || '?'}`,
      detail: g.reason || 'Ingen begrunnelse',
      date: g.timestamp || null
    })
  }

  // Pending decisions
  for (const d of (state.pendingDecisions || [])) {
    items.push({
      type: 'pending-decision',
      severity: 'medium',
      label: typeof d === 'string' ? d : (d.description || d.what || JSON.stringify(d)),
      detail: typeof d === 'object' ? (d.reason || '') : ''
    })
  }

  // Skipped steps
  for (const s of (state.skippedSteps || [])) {
    const id = typeof s === 'string' ? s : s?.id
    const reason = typeof s === 'object' ? s?.reason : null
    items.push({
      type: 'skipped-step',
      severity: 'low',
      label: `Hoppet over: ${id}`,
      detail: reason || ''
    })
  }

  return {
    hint: 'Ting som kan skape problemer — oppgaver du har hoppet over, beslutninger som venter, og hindringer.',
    items,
    counts: {
      high: items.filter(i => i.severity === 'high').length,
      medium: items.filter(i => i.severity === 'medium').length,
      low: items.filter(i => i.severity === 'low').length
    }
  }
}

// ─── 8. Checkpoint-tidslinje ─────────────────────────────────────────

function panelCheckpoints(projectRoot) {
  const state = readProjectState(projectRoot)
  if (state.error) return { hint: 'Lagringspunkter i prosjektet.', checkpoints: [], error: state.error }

  return {
    hint: 'Lagringspunkter i prosjektet — som "save game" i et spill.',
    checkpoints: (state.checkpoints || []).map(c => ({
      id: c.id || null,
      type: c.type || 'unknown',
      phase: c.phase || null,
      description: c.description || '',
      timestamp: c.timestamp || null,
      gitCommitSha: c.gitCommitSha || null,
      gitBranch: c.gitBranch || null
    })),
    total: (state.checkpoints || []).length
  }
}

// ─── Fremdriftslogg (flyttet fra egen fane til Innsikt-panel) ────────

function panelProgressLog(projectRoot) {
  const log = readProgressLog(projectRoot)
  if (!log.entries?.length) {
    return { hint: 'Kronologisk logg over alt som er gjort i prosjektet.', entries: [], total: 0 }
  }
  return {
    hint: 'Kronologisk logg over alt som er gjort i prosjektet.',
    entries: log.entries.slice(-50).reverse(),
    total: log.totalLines || log.entries.length
  }
}

// ─── 9. Integrasjonsstatus ───────────────────────────────────────────

function panelIntegrations(projectRoot) {
  const state = readProjectState(projectRoot)
  if (state.error) return { hint: 'Tjenester appen er koblet til.', categories: [], error: state.error }

  const confirmed = state.integrations?.confirmed || []
  const detected = state.integrations?.detected || []
  const setup = state.integrations?.setup || []

  // Bygg status-map fra PROJECT-STATE (prioritet: active > setup > detected)
  const statusPriority = { active: 0, setup: 1, detected: 2, available: 3 }
  const statusMap = {}
  const setStatus = (key, status) => {
    if (!statusMap[key] || statusPriority[status] < statusPriority[statusMap[key]]) {
      statusMap[key] = status
    }
  }
  confirmed.forEach(i => {
    const name = typeof i === 'string' ? i : (i.name || i.category || '')
    if (!name) return
    const id = typeof i === 'object' && i.id ? i.id : name.toLowerCase().replace(/\s+/g, '-')
    setStatus(id, 'active')
    setStatus(name.toLowerCase(), 'active')
  })
  detected.forEach(i => {
    const name = typeof i === 'string' ? i : (i.name || i.category || '')
    if (!name) return
    const id = typeof i === 'object' && i.id ? i.id : name.toLowerCase().replace(/\s+/g, '-')
    setStatus(id, 'detected')
    setStatus(name.toLowerCase(), 'detected')
  })
  setup.forEach(i => {
    const name = typeof i === 'string' ? i : (i.name || i.category || '')
    if (!name) return
    const id = typeof i === 'object' && i.id ? i.id : name.toLowerCase().replace(/\s+/g, '-')
    setStatus(id, 'setup')
    setStatus(name.toLowerCase(), 'setup')
  })

  // imageStrategy → provider-status for AI-bilde-providers
  const imgType = state.imageStrategy?.type
  const imgTypes = Array.isArray(imgType) ? imgType : (imgType && imgType !== 'none' ? [imgType] : [])
  const replicateModel = state.imageStrategy?.replicateModel || ''
  let imageStrategyProviderId = null

  if (imgTypes.includes('replicate') && replicateModel) {
    const MODEL_TO_PROVIDER = {
      'black-forest-labs/flux-pro': 'flux-pro',
      'black-forest-labs/flux-schnell': 'flux-pro',
      'google/imagen-3': 'imagen-3'
    }
    imageStrategyProviderId = MODEL_TO_PROVIDER[replicateModel] || 'replicate'
    // Set active only if not already a stronger status
    if (!statusMap[imageStrategyProviderId] || statusMap[imageStrategyProviderId] === 'available') {
      statusMap[imageStrategyProviderId] = 'active'
    }
  }

  // Merg katalog med status
  const statusOrder = { active: 0, setup: 1, detected: 2, available: 3 }
  const categories = INTEGRATION_CATALOG.map(cat => ({
    ...cat,
    providers: cat.providers.map(p => ({
      ...p,
      status: statusMap[p.id] || statusMap[p.name.toLowerCase()] || 'available',
      isRecommended: p.id === cat.recommended
    })).sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3))
  }))

  // Samle aktive/oppdagede providers for "Aktive tilkoblinger"-seksjon
  const activeProviders = categories.flatMap(cat =>
    cat.providers.filter(p => p.status === 'active' || p.status === 'detected')
      .map(p => ({ ...p, categoryName: cat.name }))
  )

  return {
    hint: 'Tjenester og verktøy som appen din kan kobles til. Legg til integrasjoner for å utvide funksjonaliteten.',
    categories,
    activeProviders,
    confirmed: confirmed.map(i => typeof i === 'string' ? { name: i, status: 'active' } : { ...i, name: i.name || i.category || '' }),
    detected: detected.map(i => typeof i === 'string' ? { name: i, status: 'detected' } : { ...i, name: i.name || i.category || '' }),
    total: confirmed.length + detected.length,
    imageStrategy: {
      types: imgTypes,
      replicateModel: replicateModel || null,
      activeProviderId: imageStrategyProviderId
    }
  }
}

// ─── 10. Leveranse-sjekkliste ────────────────────────────────────────

function panelDeliverables(projectRoot) {
  const log = readProgressLog(projectRoot, 500)
  const fileEvents = log.entries.filter(e => e.type === 'FILE').slice().reverse()

  return {
    hint: 'Alle filer og dokumenter som er laget i prosjektet — sortert etter tidspunkt.',
    files: fileEvents.map(e => ({
      path: e.fields?.path || e.description,
      operation: e.fields?.op || 'unknown',
      description: e.fields?.desc || '',
      time: e.time
    })),
    total: fileEvents.length
  }
}

// ─── 11. Prosjekt-metrics ────────────────────────────────────────────

function panelMetrics(projectRoot) {
  const log = readProgressLog(projectRoot, 1000)
  const state = readProjectState(projectRoot)
  if (state.error) return { hint: 'Statistikk og trender for prosjektet ditt.', eventCounts: {}, error: state.error }
  const entries = log.entries

  // Tasks per event type
  const eventCounts = {}
  for (const e of entries) {
    eventCounts[e.type] = (eventCounts[e.type] || 0) + 1
  }

  // Completed tasks per phase
  const tasksPerPhase = {}
  const prefixes = { OPP: 1, KRAV: 2, ARK: 3, MVP: 4, ITR: 5, KVA: 6, PUB: 7 }
  for (const step of (state?.completedSteps || [])) {
    if (typeof step === 'string') {
      const prefix = step.split('-')[0]
      const phase = prefixes[prefix] || 0
      if (phase) tasksPerPhase[phase] = (tasksPerPhase[phase] || 0) + 1
    }
  }

  // Error rate
  const errorCount = entries.filter(e => e.type === 'ERROR').length
  const totalEvents = entries.length
  const errorRate = totalEvents > 0 ? Math.round((errorCount / totalEvents) * 100) : 0

  // Gjennomsnittlig tid per oppgave (fra START→DONE-par)
  const startTimes = new Map()
  const durations = []
  for (const e of entries) {
    const taskId = e.fields?.task
    if (!taskId || !e.time) continue
    if (e.type === 'START') {
      startTimes.set(taskId, e.time)
    } else if (e.type === 'DONE' && startTimes.has(taskId)) {
      const start = startTimes.get(taskId)
      const [sh, sm] = start.split(':').map(Number)
      const [dh, dm] = e.time.split(':').map(Number)
      let mins = (dh * 60 + dm) - (sh * 60 + sm)
      if (mins < 0) mins += 1440 // midnight wraparound
      if (mins > 0 && mins < 480) durations.push(mins) // maks 8 timer
    }
  }
  const avgMinutesPerTask = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null

  return {
    hint: 'Statistikk og trender for prosjektet ditt.',
    eventCounts,
    tasksPerPhase: Object.entries(tasksPerPhase).map(([phase, count]) => ({
      phase: parseInt(phase),
      name: PHASE_NAMES[parseInt(phase)] || `Fase ${phase}`,
      completed: count
    })),
    errorRate: `${errorRate}%`,
    avgMinutesPerTask,
    totalEvents,
    completedSteps: (state?.completedSteps || []).length,
    skippedSteps: (state?.skippedSteps || []).length
  }
}

// ─── 12. Avhengighetsgraf ────────────────────────────────────────────

function panelDependencies(projectRoot) {
  const modReg = readModulregister(projectRoot)

  // Build dependency info from modules
  const modules = (modReg.modules || []).map(m => {
    const done = m.features?.filter(f => f.done).length || 0
    const total = m.features?.length || 0
    return {
      name: m.name,
      done,
      total,
      status: done === total && total > 0 ? 'done' : done > 0 ? 'building' : 'pending',
      features: (m.features || []).map(f => f.name)
    }
  })

  return {
    hint: 'Viser hvilke funksjoner som avhenger av andre — og om noe er blokkert.',
    modules,
    total: modules.length
  }
}

// ─── 13. Scope-endringer ─────────────────────────────────────────────

function panelScope(projectRoot) {
  const state = readProjectState(projectRoot)
  if (state.error) return { hint: 'Oppgaver du har endret prioritet på.', changes: [], error: state.error }

  return {
    hint: 'Oppgaver du har valgt å nedprioritere — fra "må gjøres" til "bør gjøres".',
    changes: (state.reclassifications || []).map(r => ({
      taskId: r.taskId || r.id || 'ukjent',
      from: r.from || r.original || 'MÅ',
      to: r.to || r.new || 'BØR',
      reason: r.reason || '',
      date: r.timestamp || null
    })),
    total: (state.reclassifications || []).length
  }
}

// ─── 14. Autonomi-oversikt ───────────────────────────────────────────

function panelAutonomy(projectRoot) {
  const state = readProjectState(projectRoot)
  const currentPhase = state?.currentPhase || 1

  // Get tasks for current phase grouped by zone
  const tasks = getTasksWithStatus(currentPhase, state)
  const green = tasks.filter(t => t.zone === 'GREEN')
  const yellow = tasks.filter(t => t.zone === 'YELLOW')
  const red = tasks.filter(t => t.zone === 'RED')

  return {
    hint: 'Viser hva AI gjør helt selv (grønt), hva du bør sjekke (gult), og hva som krever din deltakelse (rødt).',
    phase: currentPhase,
    phaseName: PHASE_NAMES[currentPhase] || '',
    zones: {
      green: { label: 'AI autonom', desc: 'AI gjør dette helt selv', count: green.length, tasks: green.map(t => ({ id: t.id, name: t.name, status: t.status })) },
      yellow: { label: 'AI + gjennomgang', desc: 'AI foreslår, du bør sjekke', count: yellow.length, tasks: yellow.map(t => ({ id: t.id, name: t.name, status: t.status })) },
      red: { label: 'Menneske-ledet', desc: 'Krever din aktive deltakelse', count: red.length, tasks: red.map(t => ({ id: t.id, name: t.name, status: t.status })) }
    },
    totalTasks: tasks.length
  }
}
