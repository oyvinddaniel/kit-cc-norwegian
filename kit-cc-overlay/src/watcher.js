/**
 * Filovervåking med chokidar
 *
 * Overvåker Kit CC-filene og pusher endringer via SSE.
 * Filer som overvåkes:
 *   - .ai/PROJECT-STATE.json → STATE_CHANGED
 *   - .ai/PROGRESS-LOG.md → PROGRESS_UPDATED
 *   - .ai/MONITOR-PROBES.json → PROBE_REQUEST (for pending probes)
 *   - .env → ENV_CHANGED (F39: single writer pattern)
 *   - docs/ MODULREGISTER → MODULES_CHANGED
 *
 * Sikkerhet: Debounce (100ms) forhindrer race conditions ved samtidig skriving
 */

import chokidar from 'chokidar'
import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parseProgressLog, parseModulregisterContent } from './parsers.js'

// Debounce-timers for å forhindre race conditions
const DEBOUNCE_MS = 150
const debounceTimers = new Map()

// Flag to prevent feedback-loop when we write back to MONITOR-PROBES.json
let isWritingProbes = false

/**
 * Sett opp filovervåking
 * @param {string} projectRoot - Prosjektets rotmappe
 * @param {import('./sse.js').SSEManager} sseManager - SSE-manager for broadcasting
 */
export function setupWatcher(projectRoot, sseManager) {
  const aiDir = join(projectRoot, '.ai')
  const docsDir = join(projectRoot, 'docs')

  // Filer å overvåke
  const envFile = join(projectRoot, '.env')
  const watchPaths = [
    join(aiDir, 'PROJECT-STATE.json'),
    join(aiDir, 'PROGRESS-LOG.md'),
    join(aiDir, 'MONITOR-ERRORS.json'),
    join(aiDir, 'MONITOR-PROBES.json')
  ]

  // Finn MODULREGISTER-filer dynamisk (kan ligge i forskjellige faser)
  // Vi overvåker hele docs/ mappen men ignorerer filer som ikke er MODULREGISTER
  watchPaths.push(docsDir)

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    persistent: true,
    followSymlinks: false, // Sikkerhet: unngå å lese filer utenfor prosjektet via symlinks
    ignored: (filePath) => {
      // Tillat alltid mapper (for at chokidar skal kunne traverse docs/)
      // Filtrer ut filer i docs/ som ikke er MODULREGISTER
      if (filePath.startsWith(docsDir) && !filePath.includes('MODULREGISTER')) {
        // Sjekk om det er en fil (ikke mappe) via enkel heuristikk
        const lastPart = filePath.split('/').pop() || filePath.split('\\').pop()
        if (lastPart.includes('.')) return true // Filtrer ut filer med filendelse
      }
      return false
    },
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  })

  // Initialiser lastProgressLineCount fra eksisterende fil (unngår å sende all historikk ved oppstart)
  let lastProgressLineCount = 0
  try {
    const logPath = join(aiDir, 'PROGRESS-LOG.md')
    if (existsSync(logPath)) {
      const content = readFileSync(logPath, 'utf-8')
      lastProgressLineCount = content.split('\n').filter(l => {
        const t = l.trim()
        return t.startsWith('ts=') || t.startsWith('-')
      }).length
    }
  } catch {}

  watcher.on('change', (filePath) => {
    const rel = relative(projectRoot, filePath)

    // Debounce: vent DEBOUNCE_MS før lesing for å sikre at skriving er fullført
    // Forhindrer race conditions ved samtidige writes
    if (debounceTimers.has(filePath)) {
      clearTimeout(debounceTimers.get(filePath))
    }

    debounceTimers.set(filePath, setTimeout(() => {
      debounceTimers.delete(filePath)
      try {
        if (rel === join('.ai', 'PROJECT-STATE.json')) {
          handleStateChange(filePath, sseManager)
        } else if (rel === join('.ai', 'PROGRESS-LOG.md')) {
          lastProgressLineCount = handleProgressChange(filePath, sseManager, lastProgressLineCount)
        } else if (rel === join('.ai', 'MONITOR-ERRORS.json')) {
          handleErrorsFileChange(filePath, sseManager)
        } else if (rel === join('.ai', 'MONITOR-PROBES.json')) {
          if (isWritingProbes) return // Skip re-trigger from our own write
          handleProbesFileChange(filePath, sseManager)
        } else if (rel.includes('MODULREGISTER')) {
          handleModulesChange(filePath, sseManager)
        }
      } catch (err) {
        console.error(`⚠️  Feil ved filhåndtering (${rel}):`, err.message)
      }
    }, DEBOUNCE_MS))
  })

  watcher.on('error', (err) => {
    console.error('⚠️  Chokidar-feil:', err.message)
  })

  // F39: Separat watcher for .env — overvåker prosjektrot for å fange opp add + change
  // (Chokidar v4 ignorerer ikke-eksisterende filer, så vi bruker directory-watch med filter)
  const envWatcher = chokidar.watch(projectRoot, {
    ignoreInitial: true,
    persistent: true,
    depth: 0, // Kun filer i prosjektroten
    followSymlinks: false,
    ignored: (filePath) => {
      // Kun .env-filen
      if (filePath === projectRoot) return false
      return filePath !== envFile
    },
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
  })

  const envHandler = (filePath) => {
    if (filePath !== envFile) return
    if (debounceTimers.has('__env__')) clearTimeout(debounceTimers.get('__env__'))
    debounceTimers.set('__env__', setTimeout(() => {
      debounceTimers.delete('__env__')
      handleEnvChange(sseManager)
    }, DEBOUNCE_MS))
  }
  envWatcher.on('add', envHandler)
  envWatcher.on('change', envHandler)
  envWatcher.on('error', (err) => {
    console.error('⚠️  .env watcher-feil:', err.message)
  })

  console.log('👁️  Filovervåking aktiv')

  // Returner cleanup-funksjon for graceful shutdown
  return () => {
    // Rydd opp debounce-timers
    for (const timer of debounceTimers.values()) clearTimeout(timer)
    debounceTimers.clear()
    watcher.close()
    envWatcher.close()
  }
}

/**
 * PROJECT-STATE.json endret
 */
function handleStateChange(filePath, sseManager) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const state = JSON.parse(content)

    sseManager.broadcast('STATE_CHANGED', {
      currentPhase: state.currentPhase,
      projectName: state.projectName,
      classification: state.classification,
      session: state.session
    })
  } catch (err) {
    console.error('⚠️  Kunne ikke parse PROJECT-STATE.json:', err.message)
  }
}

/**
 * PROGRESS-LOG.md endret — send kun nye linjer
 * Nye entries stemples med ekte systemtid (Date.now()) slik at
 * Monitor viser korrekt "X minutter siden" uavhengig av AI-ens HH:MM.
 */
function handleProgressChange(filePath, sseManager, lastLineCount) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    // Match both logfmt (ts=...) and legacy (- HH:MM ...) lines
    const lines = content.split('\n').filter(l => {
      const trimmed = l.trim()
      return trimmed.startsWith('ts=') || trimmed.startsWith('-')
    })
    const newLines = lines.slice(lastLineCount)

    if (newLines.length > 0) {
      // Stempel med ekte systemtid — ikke stol på AI-ens HH:MM
      const realTimestamp = new Date().toISOString()
      const parsed = newLines.map(line => parseProgressLog(line, realTimestamp))
      sseManager.broadcast('PROGRESS_UPDATED', {
        newEntries: parsed,
        totalLines: lines.length
      })
    }

    return lines.length
  } catch (err) {
    console.error('⚠️  Kunne ikke lese PROGRESS-LOG.md:', err.message)
    return lastLineCount
  }
}

/**
 * MODULREGISTER endret
 */
function handleModulesChange(filePath, sseManager) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    // Bruk felles parser fra parsers.js (fjernet duplikat)
    const modules = parseModulregisterContent(content)

    sseManager.broadcast('MODULES_CHANGED', { modules })
  } catch (err) {
    console.error('⚠️  Kunne ikke parse MODULREGISTER:', err.message)
  }
}

/**
 * MONITOR-ERRORS.json endret (av Kit CC AI-agent eller direkte)
 * Broadcaster full errors-array slik at Monitor UI kan synkronisere.
 */
function handleErrorsFileChange(filePath, sseManager) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    const errors = Array.isArray(data.errors) ? data.errors : []

    sseManager.broadcast('ERRORS_FILE_CHANGED', { errors, total: errors.length })
  } catch (err) {
    console.error('⚠️  Kunne ikke parse MONITOR-ERRORS.json:', err.message)
  }
}

/**
 * .env endret (F39: single writer pattern)
 * Broadcaster ENV_CHANGED slik at UI kan oppdatere credential-status.
 */
function handleEnvChange(sseManager) {
  sseManager.broadcast('ENV_CHANGED', { timestamp: new Date().toISOString() })
}

/**
 * MONITOR-PROBES.json endret (av AI-agent direkte)
 * Finner probes med status "pending", broadcaster PROBE_REQUEST for hver,
 * og oppdaterer status til "sent".
 */
function handleProbesFileChange(filePath, sseManager) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    if (!Array.isArray(data.probes)) return

    let changed = false
    for (const probe of data.probes) {
      if (probe.status === 'pending') {
        sseManager.broadcast('PROBE_REQUEST', {
          id: probe.id,
          type: probe.type,
          params: probe.params,
          timeout: probe.timeout
        })
        probe.status = 'sent'
        changed = true
      }
    }

    if (changed) {
      // Atomisk skriving — set flag to prevent feedback-loop
      isWritingProbes = true
      try {
        const tmpPath = filePath + '.tmp'
        writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
        renameSync(tmpPath, filePath)
      } finally {
        // Reset flag after a short delay to allow chokidar event to fire and be ignored
        setTimeout(() => { isWritingProbes = false }, 500)
      }
    }
  } catch (err) {
    console.error('⚠️  Kunne ikke parse MONITOR-PROBES.json:', err.message)
  }
}
