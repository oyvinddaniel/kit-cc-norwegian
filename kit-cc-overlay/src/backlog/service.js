/**
 * F14: BacklogService — Service layer
 *
 * CRUD-operasjoner, trebygging, statistikk, og samtalelagring.
 * Adapter-mønster: BacklogService er et interface — SQLiteBacklogService implementerer det.
 * (Kan byttes ut med Supabase-implementasjon senere.)
 *
 * Alle metoder returnerer ServiceResult<T>:
 *   { success: true, data: T } | { success: false, error: string }
 */

import { getDatabase, generateId } from './database.js'

// ─── ServiceResult helper ────────────────────────────────────────────────

function ok(data) {
  return { success: true, data }
}

function fail(error) {
  return { success: false, error }
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKLOG ITEMS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Opprett et nytt backlog-element
 */
export function createItem({ parentId = null, type, name, technicalName = null, description = null, priority = 'SHOULD', phase = null, sortOrder = 0 }) {
  // Input-validering
  const validTypes = ['module', 'feature', 'micro_feature', 'task']
  if (!type || !validTypes.includes(type)) {
    return fail(`Ugyldig type: "${type}". Må være en av: ${validTypes.join(', ')}`)
  }
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return fail('Navn er påkrevd og kan ikke være tomt')
  }
  if (name.length > 500) {
    return fail('Navn kan ikke være lengre enn 500 tegn')
  }
  const validPriorities = ['MUST', 'SHOULD', 'COULD']
  if (priority && !validPriorities.includes(priority)) {
    return fail(`Ugyldig prioritet: "${priority}". Må være en av: ${validPriorities.join(', ')}`)
  }

  // Hierarki-validering: sjekk at parent-child-forholdet er gyldig
  // module = toppnivå (ingen forelder), feature → module, micro_feature → feature, task → micro_feature
  const VALID_PARENT_TYPE = { feature: 'module', micro_feature: 'feature', task: 'micro_feature' }
  if (parentId) {
    if (type === 'module') {
      return fail('En "module" er et toppnivå-element og kan ikke ha en forelder')
    }
    try {
      const db = getDatabase()
      const parent = db.prepare('SELECT type FROM backlog_items WHERE id = ?').get(parentId)
      if (!parent) return fail(`Forelder-element med ID "${parentId}" finnes ikke`)
      const expectedParent = VALID_PARENT_TYPE[type]
      if (expectedParent && parent.type !== expectedParent) {
        return fail(`En "${type}" kan ikke være barn av en "${parent.type}" (forventet "${expectedParent}")`)
      }
    } catch (err) {
      return fail(`Kunne ikke validere forelder: ${err.message}`)
    }
  }

  try {
    const db = getDatabase()
    const id = generateId()

    db.prepare(`
      INSERT INTO backlog_items (id, parent_id, type, name, technical_name, description, priority, phase, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, parentId, type, name.trim(), technicalName, description, priority, phase, sortOrder)
    db.forceSave()

    return ok({ id, type, name: name.trim(), technicalName })
  } catch (err) {
    return fail(`Kunne ikke opprette element: ${err.message}`)
  }
}

/**
 * Hent et enkelt element med ID
 */
export function getItem(id) {
  try {
    const db = getDatabase()
    const item = db.prepare('SELECT * FROM backlog_items WHERE id = ?').get(id)
    return item ? ok(item) : fail('Element ikke funnet')
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Oppdater et element
 */
const FIELD_MAP = {
  name: 'name',
  technicalName: 'technical_name',
  technical_name: 'technical_name',
  description: 'description',
  status: 'status',
  priority: 'priority',
  sortOrder: 'sort_order',
  sort_order: 'sort_order',
  phase: 'phase',
  approvedBy: 'approved_by',
  approved_by: 'approved_by',
  approvedAt: 'approved_at',
  approved_at: 'approved_at'
}

export function updateItem(id, updates) {
  try {
    // Valider verdier som har begrensninger
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return fail('Navn kan ikke være tomt')
      }
      if (updates.name.length > 500) {
        return fail('Navn kan ikke være lengre enn 500 tegn')
      }
      updates.name = updates.name.trim()
    }
    if (updates.status !== undefined) {
      const validStatuses = ['pending', 'in_progress', 'done', 'blocked', 'skipped']
      if (!validStatuses.includes(updates.status)) {
        return fail(`Ugyldig status: "${updates.status}". Må være en av: ${validStatuses.join(', ')}`)
      }
    }
    if (updates.priority !== undefined) {
      const validPriorities = ['MUST', 'SHOULD', 'COULD']
      if (!validPriorities.includes(updates.priority)) {
        return fail(`Ugyldig prioritet: "${updates.priority}". Må være en av: ${validPriorities.join(', ')}`)
      }
    }

    const db = getDatabase()
    const fields = []
    const values = []

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = FIELD_MAP[key]
      if (dbKey) {
        fields.push(`${dbKey} = ?`)
        values.push(value)
      }
    }

    if (fields.length === 0) return fail('Ingen gyldige felter å oppdatere')

    fields.push("updated_at = datetime('now')")
    values.push(id)

    const result = db.prepare(`UPDATE backlog_items SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    if (result.changes === 0) return fail('Element ikke funnet')
    if (updates.status) db.forceSave()
    return ok({ id, updated: Object.keys(updates) })
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Slett et element og alle barn (manuell rekursiv sletting — CASCADE virker ikke i sql.js)
 */
export function deleteItem(id) {
  try {
    const db = getDatabase()

    // Sjekk at elementet eksisterer
    const item = db.prepare('SELECT id FROM backlog_items WHERE id = ?').get(id)
    if (!item) return fail('Element ikke funnet')

    // Rekursiv sletting i transaksjon
    const deleteTx = db.transaction(() => {
      const deleteRecursive = (parentId) => {
        const children = db.prepare('SELECT id FROM backlog_items WHERE parent_id = ?').all(parentId)
        for (const child of children) {
          deleteRecursive(child.id)
        }
        db.prepare('DELETE FROM backlog_items WHERE id = ?').run(parentId)
      }
      deleteRecursive(id)
    })

    deleteTx()
    db.forceSave()
    return ok({ deleted: id })
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Hent alle barn av et element
 */
export function getChildren(parentId) {
  try {
    const db = getDatabase()
    const items = db.prepare(
      'SELECT * FROM backlog_items WHERE parent_id = ? ORDER BY sort_order, created_at'
    ).all(parentId)
    return ok(items)
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Hent hele treet som hierarkisk struktur
 */
export function getTree() {
  try {
    const db = getDatabase()
    const allItems = db.prepare(
      'SELECT * FROM backlog_items ORDER BY sort_order, created_at'
    ).all()

    // Bygg tre fra flat liste
    const tree = buildTree(allItems)
    return ok(tree)
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Hent alle elementer av en bestemt type
 */
export function getItemsByType(type) {
  try {
    const db = getDatabase()
    const items = db.prepare(
      'SELECT * FROM backlog_items WHERE type = ? ORDER BY sort_order, created_at'
    ).all(type)
    return ok(items)
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Bygg hierarkisk tre fra flat liste
 */
function buildTree(items) {
  const map = new Map()
  const roots = []

  // Først: indekser alle elementer
  for (const item of items) {
    map.set(item.id, { ...item, children: [] })
  }

  // Deretter: koble barn til foreldre
  for (const item of items) {
    const node = map.get(item.id)
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id).children.push(node)
    } else if (!item.parent_id) {
      // Kun elementer uten parent_id er ekte rot-noder
      roots.push(node)
    }
    // Elementer med parent_id som peker til ikke-eksisterende forelder filtreres ut (foreldreløse)
  }

  return roots
}

// ═══════════════════════════════════════════════════════════════════════════
// STATISTIKK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hent fremdriftsstatistikk
 */
export function getStats() {
  try {
    const db = getDatabase()

    const total = db.prepare('SELECT COUNT(*) as count FROM backlog_items').get()
    const byStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM backlog_items GROUP BY status'
    ).all()
    const byType = db.prepare(
      'SELECT type, COUNT(*) as count FROM backlog_items GROUP BY type'
    ).all()
    const byPriority = db.prepare(
      'SELECT priority, COUNT(*) as count FROM backlog_items GROUP BY priority'
    ).all()

    const statusMap = Object.fromEntries(byStatus.map(r => [r.status, r.count]))
    const done = statusMap.done || 0

    return ok({
      total: total.count,
      byStatus: statusMap,
      byType: Object.fromEntries(byType.map(r => [r.type, r.count])),
      byPriority: Object.fromEntries(byPriority.map(r => [r.priority, r.count])),
      progress: total.count > 0 ? Math.round((done / total.count) * 100) : 0
    })
  } catch (err) {
    return fail(err.message)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AI-SAMTALER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Opprett en ny samtale
 */
export function createConversation({ title = 'Ny samtale', parentConversationId = null } = {}) {
  try {
    const db = getDatabase()
    const id = generateId()

    db.prepare(`
      INSERT INTO backlog_ai_conversations (id, title, parent_conversation_id)
      VALUES (?, ?, ?)
    `).run(id, title, parentConversationId)

    return ok({ id, title })
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Hent en samtale med alle meldinger
 */
export function getConversation(id) {
  try {
    const db = getDatabase()
    const conv = db.prepare('SELECT * FROM backlog_ai_conversations WHERE id = ?').get(id)
    if (!conv) return fail('Samtale ikke funnet')

    // Sikker JSON.parse med fallback
    let messages = []
    try {
      messages = JSON.parse(conv.messages || '[]')
      if (!Array.isArray(messages)) messages = []
    } catch {
      console.warn(`⚠️  Korrupt meldingsdata i samtale ${id}, bruker tom liste`)
      messages = []
    }

    return ok({
      ...conv,
      messages
    })
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Legg til en melding i en samtale
 */
export function addMessage(conversationId, { role, content }) {
  try {
    const db = getDatabase()

    // Atomisk operasjon via transaksjon (forhindrer rasebetingelse)
    const addMessageTx = db.transaction(() => {
      const conv = db.prepare('SELECT messages, message_count FROM backlog_ai_conversations WHERE id = ?').get(conversationId)
      if (!conv) throw new Error('Samtale ikke funnet')

      let messages = []
      try {
        messages = JSON.parse(conv.messages || '[]')
        if (!Array.isArray(messages)) messages = []
      } catch {
        messages = []
      }

      // Sjekk meldingsgrense (bruk messages.length som kilde til sannheten)
      if (messages.length >= 40) {
        throw new Error('Meldingsgrensen på 40 er nådd. Start en ny samtale for å fortsette.')
      }

      messages.push({
        role,
        content,
        timestamp: new Date().toISOString()
      })

      const newCount = messages.length

      db.prepare(`
        UPDATE backlog_ai_conversations
        SET messages = ?, message_count = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(messages), newCount, conversationId)

      return { messageCount: newCount, maxMessages: 40 }
    })

    const result = addMessageTx()
    return ok(result)
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Rull tilbake siste melding i en samtale (brukes ved feilet AI-kall)
 */
export function rollbackLastMessage(conversationId) {
  try {
    const db = getDatabase()

    const rollbackTx = db.transaction(() => {
      const conv = db.prepare('SELECT messages, message_count FROM backlog_ai_conversations WHERE id = ?').get(conversationId)
      if (!conv || conv.message_count <= 0) return false

      let messages = []
      try {
        messages = JSON.parse(conv.messages || '[]')
        if (!Array.isArray(messages)) return false
      } catch {
        return false
      }

      if (messages.length === 0) return false

      // Fjern siste melding
      messages.pop()

      db.prepare(`
        UPDATE backlog_ai_conversations
        SET messages = ?, message_count = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(messages), messages.length, conversationId)

      return true
    })

    const rolledBack = rollbackTx()
    return rolledBack ? ok({ rolledBack: true }) : fail('Ingenting å rulle tilbake')
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Oppdater samtaletittel
 */
export function updateConversationTitle(id, title) {
  try {
    const db = getDatabase()
    const result = db.prepare("UPDATE backlog_ai_conversations SET title = ?, updated_at = datetime('now') WHERE id = ?").run(title, id)
    if (result.changes === 0) return fail('Samtale ikke funnet')
    return ok({ id, title })
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Lagre samtaleoppsummering (auto-generert)
 */
export function saveConversationSummary(id, summary) {
  try {
    const db = getDatabase()
    const result = db.prepare("UPDATE backlog_ai_conversations SET summary = ?, updated_at = datetime('now') WHERE id = ?").run(summary, id)
    if (result.changes === 0) return fail('Samtale ikke funnet')
    return ok({ id })
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Hent de N siste samtalene (for kontekstarv)
 */
export function getRecentConversations(limit = 3) {
  try {
    const db = getDatabase()
    const conversations = db.prepare(`
      SELECT id, title, summary, message_count, created_at, updated_at
      FROM backlog_ai_conversations
      WHERE is_active = 1
      ORDER BY updated_at DESC
      LIMIT ?
    `).all(limit)

    return ok(conversations)
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Hent eldre samtaler (utover de N siste)
 */
export function getOlderConversations(offset = 3, limit = 20) {
  try {
    const db = getDatabase()
    const conversations = db.prepare(`
      SELECT id, title, summary, message_count, created_at, updated_at
      FROM backlog_ai_conversations
      WHERE is_active = 1
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset)

    return ok(conversations)
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Slett (soft-delete) en samtale
 */
export function deleteConversation(id) {
  try {
    const db = getDatabase()
    const result = db.prepare(`
      UPDATE backlog_ai_conversations SET is_active = 0 WHERE id = ?
    `).run(id)
    if (result.changes === 0) return fail('Samtale ikke funnet')
    return ok({ deleted: true })
  } catch (err) {
    return fail(err.message)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULREGISTER SYNC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Importer moduler fra MODULREGISTER til backlog
 */
export function importFromModulregister(modules) {
  try {
    const db = getDatabase()
    const insert = db.prepare(`
      INSERT OR IGNORE INTO backlog_items (id, parent_id, type, name, technical_name, status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const findByName = db.prepare(
      'SELECT id FROM backlog_items WHERE type = ? AND name = ? AND parent_id IS ?'
    )

    let imported = 0
    let skipped = 0
    const transaction = db.transaction((modules) => {
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i]

        // Sjekk om modulen allerede finnes (unngå duplikater)
        const existing = findByName.get('module', mod.name, null)
        const moduleId = existing ? existing.id : generateId()

        if (!existing) {
          insert.run(moduleId, null, 'module', mod.name, mod.name, 'pending', i)
          imported++
        } else {
          skipped++
        }

        // Importer features/oppgaver under modulen
        if (mod.features) {
          for (let j = 0; j < mod.features.length; j++) {
            const feat = mod.features[j]
            const existingFeat = findByName.get('feature', feat.name, moduleId)
            if (!existingFeat) {
              insert.run(generateId(), moduleId, 'feature', feat.name, feat.name, feat.done ? 'done' : 'pending', j)
              imported++
            } else {
              skipped++
            }
          }
        }
      }
    })

    transaction(modules)
    return ok({ imported, skipped })
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Eksporter backlog-moduler til MODULREGISTER-format (markdown)
 */
export function exportToModulregister() {
  try {
    const treeResult = getTree()
    if (!treeResult.success) return treeResult

    let markdown = '# MODULREGISTER\n\n'
    markdown += `> Auto-generert fra Kit CC Byggeliste — ${new Date().toISOString().split('T')[0]}\n\n`

    for (const module of treeResult.data) {
      if (module.type !== 'module') continue

      markdown += `## ${module.name}\n\n`
      if (module.description) markdown += `${module.description}\n\n`

      // Oppgaver som sjekkliste
      for (const child of module.children || []) {
        const check = child.status === 'done' ? 'x' : ' '
        markdown += `- [${check}] ${child.name}\n`

        // Under-oppgaver
        for (const subchild of child.children || []) {
          const subcheck = subchild.status === 'done' ? 'x' : ' '
          markdown += `  - [${subcheck}] ${subchild.name}\n`
        }
      }
      markdown += '\n'
    }

    return ok(markdown)
  } catch (err) {
    return fail(err.message)
  }
}

/**
 * Konsistensrapport: sammenlign backlog med MODULREGISTER
 */
export function getConsistencyReport(modulregisterModules) {
  try {
    const treeResult = getTree()
    if (!treeResult.success) return treeResult

    const backlogModules = treeResult.data.filter(n => n.type === 'module')
    const backlogNames = new Set(backlogModules.map(m => m.name.toLowerCase()))
    const mrNames = new Set(modulregisterModules.map(m => m.name.toLowerCase()))

    const onlyInBacklog = backlogModules.filter(m => !mrNames.has(m.name.toLowerCase())).map(m => m.name)
    const onlyInModulregister = modulregisterModules.filter(m => !backlogNames.has(m.name.toLowerCase())).map(m => m.name)
    const inBoth = backlogModules.filter(m => mrNames.has(m.name.toLowerCase())).map(m => m.name)

    return ok({
      consistent: onlyInBacklog.length === 0 && onlyInModulregister.length === 0,
      inBoth,
      onlyInBacklog,
      onlyInModulregister,
      suggestion: onlyInModulregister.length > 0
        ? `${onlyInModulregister.length} modul(er) finnes i MODULREGISTER men ikke i backlog. Importer dem?`
        : null
    })
  } catch (err) {
    return fail(err.message)
  }
}
