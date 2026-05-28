/**
 * F13: SQLite Database — Backlog datamodell
 *
 * Prøver better-sqlite3 (native, WAL-modus) først for bedre ytelse og pålitelighet.
 * Faller tilbake til sql.js (WASM) hvis native binding feiler (f.eks. manglende build-tools).
 *
 * better-sqlite3 har allerede det API-et som SqlJsWrapper emulerer
 * (prepare().run/get/all, exec, pragma, transaction), så service.js trenger ingen endringer.
 *
 * Databasefil: .ai/backlog.db (i prosjektets .ai/-mappe)
 *
 * Tabeller:
 *   - backlog_items: Hierarkisk tre (Modul → Feature → Micro → Task)
 *   - backlog_ai_conversations: AI-chathistorikk med kontekstarv
 */

import initSqlJs from 'sql.js'
import { join } from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

/** @type {any} */
let db = null

/** @type {'better-sqlite3'|'sql.js'|null} */
let dbEngine = null

// ─── Wrapper-klasse for sql.js (better-sqlite3-kompatibelt API) ──────────────

class SqlJsWrapper {
  constructor(sqlDb, dbPath) {
    this._db = sqlDb
    this._dbPath = dbPath
    this._saveTimer = null
    this._dirty = false
  }

  /**
   * Prepare-kompatibelt API: db.prepare(sql).run/get/all(params)
   * Matcher better-sqlite3 sin API slik at service.js ikke trenger endringer.
   */
  prepare(sql) {
    const wrapper = this
    const rawDb = this._db

    return {
      /**
       * Kjør INSERT/UPDATE/DELETE — returnerer { changes }
       * Params sendes som individuelle argumenter (som better-sqlite3)
       */
      run(...params) {
        rawDb.run(sql, params)
        wrapper._markDirty()
        return { changes: rawDb.getRowsModified() }
      },

      /**
       * Hent én rad — returnerer objekt eller undefined
       */
      get(...params) {
        const stmt = rawDb.prepare(sql)
        if (params.length) stmt.bind(params)

        if (stmt.step()) {
          const row = stmt.getAsObject()
          stmt.free()
          return row
        }
        stmt.free()
        return undefined
      },

      /**
       * Hent alle rader — returnerer array av objekter
       */
      all(...params) {
        const stmt = rawDb.prepare(sql)
        if (params.length) stmt.bind(params)

        const rows = []
        while (stmt.step()) {
          rows.push(stmt.getAsObject())
        }
        stmt.free()
        return rows
      }
    }
  }

  /**
   * Kjør rå SQL (CREATE TABLE, etc.)
   */
  exec(sql) {
    this._db.exec(sql)
    this._markDirty()
  }

  /**
   * PRAGMA-støtte
   */
  pragma(str) {
    try {
      this._db.run(`PRAGMA ${str}`)
    } catch {
      // Noen PRAGMAer (som WAL) er ikke støttet i sql.js — ignorer stille
    }
  }

  /**
   * Transaksjoner — matcher better-sqlite3:
   * const doStuff = db.transaction((a, b) => { ... })
   * doStuff(1, 2)
   */
  transaction(fn) {
    const wrapper = this
    return (...args) => {
      wrapper._db.run('BEGIN')
      try {
        const result = fn(...args)
        wrapper._db.run('COMMIT')
        wrapper._markDirty()
        return result
      } catch (err) {
        wrapper._db.run('ROLLBACK')
        throw err
      }
    }
  }

  /**
   * Tving umiddelbar lagring (for kritiske operasjoner som transactions)
   */
  forceSave() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer)
      this._saveTimer = null
    }
    this._saveToDisk()
  }

  /**
   * Lukk databasen og lagre til disk
   */
  close() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer)
      this._saveTimer = null
    }
    this._saveToDisk()
    this._db.close()
  }

  /**
   * Marker at data er endret og planlegg lagring
   */
  _markDirty() {
    this._dirty = true
    if (this._saveTimer) return
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null
      this._saveToDisk()
    }, 200)
  }

  /**
   * Lagre databasen til disk (atomisk: tmp → rename)
   */
  _saveToDisk() {
    if (!this._dirty) return
    try {
      const data = this._db.export()
      const tmpPath = this._dbPath + '.tmp'
      writeFileSync(tmpPath, Buffer.from(data))
      renameSync(tmpPath, this._dbPath)
      this._dirty = false
    } catch (err) {
      console.error(`❌ Kunne ikke lagre database til disk: ${err.message}`)
    }
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Initialiser databasen.
 * Prøver better-sqlite3 (native) først, faller tilbake til sql.js (WASM).
 * @param {string} projectRoot - Prosjektets rotmappe
 * @returns {Promise<any>}
 */
export async function initDatabase(projectRoot) {
  if (db) return db

  const aiDir = join(projectRoot, '.ai')
  if (!existsSync(aiDir)) {
    mkdirSync(aiDir, { recursive: true })
  }

  const dbPath = join(aiDir, 'backlog.db')

  // ─── Forsøk 1: better-sqlite3 (native) ─────────────────────────────
  try {
    const BetterSqlite3 = (await import('better-sqlite3')).default
    db = new BetterSqlite3(dbPath)
    // better-sqlite3 skriver synkront til disk — forceSave() (som sql.js-wrapperen
    // bruker for utsatt lagring) er derfor en no-op her. Gir samme API til service.js.
    db.forceSave = () => {}
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')

    // Integritetssjekk ved oppstart (fanger korrupte databaser tidlig)
    const integrityResult = db.pragma('integrity_check')
    if (integrityResult?.[0]?.integrity_check !== 'ok') {
      console.warn('⚠️  SQLite integrity_check feilet — databasen kan være korrupt')
    }

    dbEngine = 'better-sqlite3'

    // Opprett tabeller
    createTables(db)

    console.log(`💾 SQLite: better-sqlite3 (native, WAL) — ${dbPath}`)
    return db
  } catch (err) {
    console.log(`ℹ️  better-sqlite3 ikke tilgjengelig (${err.message}), bruker sql.js fallback`)
  }

  // ─── Forsøk 2: sql.js (WASM fallback) ──────────────────────────────
  let SQL
  try {
    SQL = await initSqlJs()
  } catch (err) {
    throw new Error(`Kunne ikke laste sql.js WASM: ${err.message}. Sjekk at node_modules er installert.`)
  }

  // Last eksisterende database eller opprett ny
  let sqlDb
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    sqlDb = new SQL.Database(fileBuffer)
  } else {
    sqlDb = new SQL.Database()
  }

  db = new SqlJsWrapper(sqlDb, dbPath)
  dbEngine = 'sql.js'

  // Konfigurasjon (noen PRAGMAer ignoreres stille i sql.js)
  db.pragma('foreign_keys = ON')

  // Opprett tabeller
  createTables(db)

  // Lagre initiell state til disk (for nye databaser)
  db._saveToDisk()

  console.log(`💾 SQLite: sql.js (WASM fallback) — ${dbPath}`)
  return db
}

/**
 * Hent aktiv database-instans
 */
export function getDatabase() {
  if (!db) throw new Error('Database ikke initialisert. Kall initDatabase() først.')
  return db
}

/**
 * Hent hvilken database-motor som brukes
 * @returns {'better-sqlite3'|'sql.js'|null}
 */
export function getDatabaseEngine() {
  return dbEngine
}

/**
 * Lukk databasen trygt
 */
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    dbEngine = null
  }
}

/**
 * Generer UUID
 */
export function generateId() {
  return randomUUID()
}

// ─── Schema ──────────────────────────────────────────────────────────────

function createTables(db) {
  db.exec(`
    -- ═══════════════════════════════════════════════════════════════
    -- BACKLOG ITEMS — Hierarkisk tre
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS backlog_items (
      id TEXT PRIMARY KEY,
      parent_id TEXT REFERENCES backlog_items(id) ON DELETE CASCADE,

      -- Type i hierarkiet
      type TEXT NOT NULL CHECK(type IN ('module', 'feature', 'micro_feature', 'task')),

      -- Dual-view navn (forståelig + teknisk)
      name TEXT NOT NULL,
      technical_name TEXT,

      -- Innhold
      description TEXT,

      -- Status og prioritet
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending', 'in_progress', 'done', 'blocked', 'skipped')),
      priority TEXT DEFAULT 'SHOULD'
        CHECK(priority IN ('MUST', 'SHOULD', 'COULD')),

      -- Rekkefølge (for sortering innen samme parent)
      sort_order INTEGER DEFAULT 0,

      -- Kit CC-spesifikke felter
      phase INTEGER,
      intensity_applies_from TEXT,

      -- Metadata
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_by TEXT DEFAULT 'ai',
      approved_by TEXT,
      approved_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_backlog_parent ON backlog_items(parent_id);
    CREATE INDEX IF NOT EXISTS idx_backlog_type ON backlog_items(type);
    CREATE INDEX IF NOT EXISTS idx_backlog_status ON backlog_items(status);

    -- ═══════════════════════════════════════════════════════════════
    -- AI-SAMTALER — Chathistorikk
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS backlog_ai_conversations (
      id TEXT PRIMARY KEY,

      -- Tittel (redigerbar av bruker)
      title TEXT NOT NULL DEFAULT 'Ny samtale',

      -- Kontekstarv: hvilken samtale denne bygger på
      parent_conversation_id TEXT REFERENCES backlog_ai_conversations(id),

      -- Auto-generert oppsummering av samtalen
      summary TEXT,

      -- Meldinger som JSON-array
      messages TEXT NOT NULL DEFAULT '[]',

      -- Meldingsteller (for 40-meldingsgrense)
      message_count INTEGER NOT NULL DEFAULT 0,

      -- Metadata
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),

      -- Aktiv/arkivert
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_active
      ON backlog_ai_conversations(is_active, updated_at DESC);
  `)
}
