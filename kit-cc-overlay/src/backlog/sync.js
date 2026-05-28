/**
 * F17: Godkjenningsflyt + automatisk toveis MODULREGISTER-sync
 *
 * Tre sync-mekanismer:
 *   1. MODULREGISTER → Backlog (automatisk via chokidar, allerede i watcher.js)
 *   2. Backlog → MODULREGISTER (ved godkjenning)
 *   3. Konsistenssjekk (on-demand via API)
 */

import { writeFileSync, readFileSync, existsSync, copyFileSync, renameSync, appendFileSync, statSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { readModulregister } from '../parsers.js'
import * as backlogService from './service.js'

/**
 * M-010: Backup before sync
 *
 * Creates a copy of the database file before any sync operation.
 * This allows recovery if sync corrupts the database.
 *
 * Backup file: [dbPath].prev
 */
function backupBeforeSync(dbPath) {
  const backupPath = dbPath + '.prev'
  try {
    if (existsSync(dbPath)) {
      copyFileSync(dbPath, backupPath)
      // Note: In a real SQLite scenario with WAL, also backup the -wal and -shm files
      // For sql.js (in-memory with file persistence), just backing up the main DB is sufficient
    }
  } catch (err) {
    console.error(`⚠️  Backup failed for ${dbPath}: ${err.message}`)
    // Don't block sync on backup failure — it's better to sync without backup than fail entirely
  }
}

/**
 * Sett opp sync API-ruter
 */
export function setupSyncRoutes(app, { projectRoot, prefix }) {
  const apiPrefix = `${prefix}/api/backlog`

  // ─── Hent hele backlog-treet ─────────────────────────────────────────

  app.get(`${apiPrefix}/tree`, (req, res) => {
    const result = backlogService.getTree()
    res.json(result)
  })

  // ─── Hent statistikk ───────────────────────────────────────────────

  app.get(`${apiPrefix}/stats`, (req, res) => {
    const result = backlogService.getStats()
    res.json(result)
  })

  // ─── CRUD for backlog-elementer ─────────────────────────────────────

  app.post(`${apiPrefix}/items`, (req, res) => {
    const result = backlogService.createItem(req.body)
    res.status(result.success ? 201 : 400).json(result)
  })

  app.get(`${apiPrefix}/items/:id`, (req, res) => {
    const result = backlogService.getItem(req.params.id)
    res.status(result.success ? 200 : 404).json(result)
  })

  app.patch(`${apiPrefix}/items/:id`, (req, res) => {
    const result = backlogService.updateItem(req.params.id, req.body)
    res.status(result.success ? 200 : 400).json(result)
  })

  app.delete(`${apiPrefix}/items/:id`, (req, res) => {
    const result = backlogService.deleteItem(req.params.id)
    res.status(result.success ? 200 : 404).json(result)
  })

  app.get(`${apiPrefix}/items/:id/children`, (req, res) => {
    const result = backlogService.getChildren(req.params.id)
    res.json(result)
  })

  // ─── Godkjenningsflyt ───────────────────────────────────────────────

  /**
   * Godkjenn oppgaver fra AI-planlegging
   *
   * POST /kit-cc/api/backlog/approve
   * Body: { tasks: [...], conversationId: '...' }
   *
   * Flyt:
   *   1. Valider oppgavene
   *   2. Lagre i SQLite (backlog_items)
   *   3. Eksporter til MODULREGISTER (automatisk)
   *   4. Returner bekreftelse
   */
  app.post(`${apiPrefix}/approve`, (req, res) => {
    const { tasks, conversationId } = req.body || {}

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Ingen oppgaver å godkjenne' })
    }

    try {
      const results = []
      const skipped = []
      const now = new Date().toISOString()

      for (const task of tasks) {
        // Valider hver oppgave før lagring
        if (!task.name || typeof task.name !== 'string' || task.name.trim().length === 0) {
          skipped.push({ name: task.name || '(tom)', reason: 'Ugyldig eller tomt navn' })
          continue
        }
        const validTypes = ['module', 'feature', 'micro_feature', 'task']
        const taskType = validTypes.includes(task.type) ? task.type : 'task'
        const validPriorities = ['MUST', 'SHOULD', 'COULD']
        const taskPriority = validPriorities.includes(task.priority) ? task.priority : 'SHOULD'

        // Duplikatsjekk: sjekk om oppgave med samme navn og type allerede finnes
        const existingItems = backlogService.getItemsByType(taskType)
        if (existingItems.success) {
          const duplicate = existingItems.data.find(item =>
            item.name.toLowerCase() === task.name.trim().toLowerCase()
          )
          if (duplicate) {
            skipped.push({ name: task.name.trim(), reason: 'Duplikat — finnes allerede i byggelisten' })
            continue
          }
        }

        const result = backlogService.createItem({
          parentId: task.parentId || null,
          type: taskType,
          name: task.name.trim(),
          technicalName: task.technicalName || task.technical_name,
          description: task.description,
          priority: taskPriority,
          phase: task.phase,
          sortOrder: task.sortOrder || 0
        })

        if (result.success) {
          // Marker som godkjent og sett status til in_progress
          backlogService.updateItem(result.data.id, {
            approvedBy: 'user',
            approvedAt: now,
            status: 'in_progress'
          })
          results.push(result.data)
        } else {
          skipped.push({ name: task.name.trim(), reason: result.error })
        }
      }

      // Automatisk MODULREGISTER-oppdatering (mekanisme 2)
      const syncResult = syncToModulregister(projectRoot)

      // Synk godkjente oppgaver til PROJECT-STATE.json pendingTasks[] (mekanisme 4)
      const stateSync = syncToPendingTasks(projectRoot, results)

      // Logg til PROGRESS-LOG
      if (results.length > 0) {
        const names = results.map(r => r.name).join(', ')
        appendToProgressLog(projectRoot, `ts=${new Date().toTimeString().slice(0, 5)} event=BACKLOG_APPROVED items=${results.length} names="${names}"`)
      }

      res.status(201).json({
        success: true,
        approved: results.length,
        skipped: skipped.length,
        skippedItems: skipped,
        total: tasks.length,
        modulregisterUpdated: syncResult.success,
        pendingTasksUpdated: stateSync.success,
        items: results
      })
    } catch (err) {
      res.status(500).json({ error: `Godkjenning feilet: ${err.message}` })
    }
  })

  // ─── MODULREGISTER Sync ─────────────────────────────────────────────

  /**
   * Importer fra MODULREGISTER → Backlog
   */
  app.post(`${apiPrefix}/sync/import`, (req, res) => {
    const mr = readModulregister(projectRoot)
    if (!mr.found) {
      return res.json({ success: false, error: 'MODULREGISTER ikke funnet' })
    }

    const result = backlogService.importFromModulregister(mr.modules)
    res.json(result)
  })

  /**
   * Eksporter fra Backlog → MODULREGISTER
   */
  app.post(`${apiPrefix}/sync/export`, (req, res) => {
    const result = syncToModulregister(projectRoot)
    res.json(result)
  })

  /**
   * Konsistensrapport (mekanisme 3)
   */
  app.get(`${apiPrefix}/sync/consistency`, (req, res) => {
    const mr = readModulregister(projectRoot)
    if (!mr.found) {
      return res.json({
        success: true,
        data: { consistent: true, message: 'Ingen MODULREGISTER funnet — ingenting å sammenligne' }
      })
    }

    const result = backlogService.getConsistencyReport(mr.modules)
    res.json(result)
  })

  console.log(`🔄 Backlog sync-ruter registrert under ${apiPrefix}/`)
}

/**
 * Synkroniser backlog til MODULREGISTER-filen
 */
function syncToModulregister(projectRoot) {
  try {
    // Backup database before sync
    const aiDir = join(projectRoot, '.ai')
    const dbPath = join(aiDir, 'backlog.db')
    backupBeforeSync(dbPath)

    const mr = readModulregister(projectRoot)
    if (!mr.found || !mr.path) {
      return { success: false, error: 'MODULREGISTER-fil ikke funnet' }
    }

    const exportResult = backlogService.exportToModulregister()
    if (!exportResult.success) return exportResult

    // Backup MODULREGISTER before overwriting
    try {
      copyFileSync(mr.path, mr.path + '.prev')
    } catch { /* ignore if source doesn't exist */ }

    const tmpPath = mr.path + '.tmp'
    writeFileSync(tmpPath, exportResult.data, 'utf-8')
    renameSync(tmpPath, mr.path)
    return { success: true, path: mr.path }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Synk godkjente backlog-items til PROJECT-STATE.json pendingTasks[]
 * Monitor eier pendingTasks[] — AI eier completedTasks[]
 * Bruker optimistic concurrency (mtime-sjekk) for å unngå race conditions.
 */
function syncToPendingTasks(projectRoot, approvedItems) {
  const maxRetries = 3
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const statePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')
      if (!existsSync(statePath)) return { success: false, error: 'PROJECT-STATE.json not found' }

      const mtime = statSync(statePath).mtimeMs
      const state = JSON.parse(readFileSync(statePath, 'utf-8'))
      if (!Array.isArray(state.pendingTasks)) state.pendingTasks = []

      const existingIds = new Set(state.pendingTasks.map(t => t.id))
      let added = 0

      for (const item of approvedItems) {
        if (item.id == null) continue // Guard: skip items without id
        const taskId = `BL-${String(item.id).padStart(3, '0')}`
        if (existingIds.has(taskId)) continue

        state.pendingTasks.push({
          id: taskId,
          title: item.name,
          source: 'monitor-backlog',
          priority: item.priority || 'BØR',
          phase: item.phase || null,
          createdAt: new Date().toISOString()
        })
        added++
      }

      if (added > 0) {
        // Optimistic concurrency: sjekk at filen ikke er endret siden vi leste den
        const currentMtime = statSync(statePath).mtimeMs
        if (currentMtime !== mtime) {
          if (attempt < maxRetries - 1) continue // retry
          return { success: false, error: 'Concurrent modification detected after retries' }
        }
        // Atomic write: prev → tmp → rename
        try { copyFileSync(statePath, statePath + '.prev') } catch { /* ignore */ }
        const tmpPath = statePath + '.tmp'
        writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
        renameSync(tmpPath, statePath)
      }

      return { success: true, added }
    } catch (err) {
      if (attempt < maxRetries - 1) continue
      return { success: false, error: err.message }
    }
  }
  return { success: false, error: 'Max retries exceeded' }
}

/**
 * Append en linje til PROGRESS-LOG.md
 */
function appendToProgressLog(projectRoot, line) {
  try {
    const aiDir = join(projectRoot, '.ai')
    if (!existsSync(aiDir)) mkdirSync(aiDir, { recursive: true })
    const logPath = join(aiDir, 'PROGRESS-LOG.md')
    appendFileSync(logPath, line + '\n', 'utf-8')
  } catch (err) {
    console.warn(`⚠️  Kunne ikke skrive til PROGRESS-LOG: ${err.message}`)
  }
}
