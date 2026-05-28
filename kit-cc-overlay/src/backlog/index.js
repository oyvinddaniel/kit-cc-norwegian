/**
 * Backlog-system — Hovedmodul
 *
 * Initialiserer database og registrerer alle backlog-relaterte ruter.
 * Importeres fra server.js.
 */

import { initDatabase, closeDatabase } from './database.js'
import { setupChatRoutes } from './ai-chat.js'
import { setupSyncRoutes } from './sync.js'

/**
 * Initialiser hele backlog-systemet
 * @param {import('express').Application} app
 * @param {Object} options
 * @param {string} options.projectRoot
 * @param {string} options.prefix
 * @param {import('../sse.js').SSEManager} options.sseManager
 */
export async function setupBacklog(app, { projectRoot, prefix, sseManager }) {
  try {
    // Initialiser SQLite-database (async pga. WASM-lasting)
    await initDatabase(projectRoot)

    // Registrer API-ruter
    setupChatRoutes(app, { projectRoot, prefix })
    setupSyncRoutes(app, { projectRoot, prefix })

    console.log('📋 Byggeliste-system aktivert')
    return true
  } catch (err) {
    // Backlog er valgfritt — serveren kjører uten det
    console.warn(`⚠️  Byggeliste-system ikke tilgjengelig: ${err.message}`)
    return false
  }
}

export { closeDatabase }
