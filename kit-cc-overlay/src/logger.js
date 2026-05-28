/**
 * M-009: Debug Module for Structured Logging
 *
 * Namespaces:
 *   kit-cc:server    — Server startup, port binding
 *   kit-cc:sse       — Server-sent events (live updates)
 *   kit-cc:api       — API requests/responses
 *   kit-cc:backlog   — Backlog database operations
 *   kit-cc:watcher   — File system watcher (chokidar)
 *   kit-cc:parser    — Project structure parsing
 *   kit-cc:sync      — MODULREGISTER sync
 *   kit-cc:error     — Error logging (always enabled)
 *
 * Usage:
 *   import logger from './src/logger.js'
 *   logger.server('Server started on port 4444')
 *   logger.api('GET /kit-cc/api/state')
 *   logger.error('Failed to connect to database')
 *
 * Enable specific namespaces:
 *   DEBUG=kit-cc:server,kit-cc:api node server.js
 * Enable all Kit CC:
 *   DEBUG=kit-cc:* node server.js
 * Enable everything:
 *   DEBUG=* node server.js
 */

import debugFactory from 'debug'

// Namespaces for Kit CC Monitor
const logger = {
  server: debugFactory('kit-cc:server'),
  sse: debugFactory('kit-cc:sse'),
  api: debugFactory('kit-cc:api'),
  backlog: debugFactory('kit-cc:backlog'),
  watcher: debugFactory('kit-cc:watcher'),
  parser: debugFactory('kit-cc:parser'),
  sync: debugFactory('kit-cc:sync'),
  error: debugFactory('kit-cc:error')
};

// Always enable error namespace — bevarer brukerens DEBUG-innstillinger
const existingDebug = process.env.DEBUG || ''
if (existingDebug) {
  debugFactory.enable(`${existingDebug},kit-cc:error`)
} else {
  debugFactory.enable('kit-cc:error')
}

export default logger;
