/**
 * Browser Debug Probes — Toveis-kommunikasjon mellom AI og nettleser
 *
 * AI sender en probe-forespørsel → Monitor videresender til nettleser via SSE →
 * Nettleser utfører og poster resultatet tilbake → AI leser svaret.
 *
 * Fil-kontrakt: .ai/MONITOR-PROBES.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs'
import { join } from 'node:path'

// Gyldige probe-typer
export const ALLOWED_PROBE_TYPES = [
  'dom.query',
  'dom.queryAll',
  'console.log',
  'network.log',
  'network.failed',
  'storage.get',
  'js.eval'
]

// Timeout-timere per probe-id
const pendingTimeouts = new Map()

// Promise-resolvers for wait-modus
const waitingResolvers = new Map()

// Max entries before forced eviction
const MAX_MAP_SIZE = 100
// Max age for entries in cleanup sweep (5 minutes)
const MAX_ENTRY_AGE_MS = 5 * 60 * 1000
// Periodic cleanup interval (5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

// Track creation times for eviction
const entryTimestamps = new Map()

/**
 * Evict oldest entries from a Map when it exceeds MAX_MAP_SIZE.
 * Uses entryTimestamps to determine age.
 */
function enforceMapLimit(map, mapName) {
  if (map.size <= MAX_MAP_SIZE) return
  // Find and remove oldest entries until within limit
  const sorted = [...entryTimestamps.entries()]
    .filter(([key]) => map.has(key))
    .sort((a, b) => a[1] - b[1])
  const toRemove = map.size - MAX_MAP_SIZE
  for (let i = 0; i < toRemove && i < sorted.length; i++) {
    const [key] = sorted[i]
    if (mapName === 'pendingTimeouts') {
      const timer = map.get(key)
      if (timer) clearTimeout(timer)
    } else if (mapName === 'waitingResolvers') {
      const resolver = map.get(key)
      if (resolver) resolver({ timeout: true, evicted: true })
    }
    map.delete(key)
    entryTimestamps.delete(key)
  }
}

/**
 * Periodic cleanup — removes entries older than MAX_ENTRY_AGE_MS
 */
function periodicCleanup() {
  const cutoff = Date.now() - MAX_ENTRY_AGE_MS
  for (const [key, ts] of entryTimestamps) {
    if (ts < cutoff) {
      if (pendingTimeouts.has(key)) {
        clearTimeout(pendingTimeouts.get(key))
        pendingTimeouts.delete(key)
      }
      if (waitingResolvers.has(key)) {
        const resolver = waitingResolvers.get(key)
        resolver({ timeout: true, expired: true })
        waitingResolvers.delete(key)
      }
      entryTimestamps.delete(key)
    }
  }
}

// Start periodic cleanup (unref so it doesn't prevent process exit)
const _cleanupInterval = setInterval(periodicCleanup, CLEANUP_INTERVAL_MS)
_cleanupInterval.unref()

function getProbesFilePath(projectRoot) {
  return join(projectRoot, '.ai', 'MONITOR-PROBES.json')
}

export function readProbesFile(projectRoot) {
  const filePath = getProbesFilePath(projectRoot)
  try {
    if (!existsSync(filePath)) return { version: 1, maxProbes: 50, probes: [] }
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    if (!Array.isArray(data.probes)) data.probes = []
    return data
  } catch {
    return { version: 1, maxProbes: 50, probes: [] }
  }
}

export function writeProbesFile(projectRoot, data) {
  const filePath = getProbesFilePath(projectRoot)
  const dir = join(projectRoot, '.ai')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const tmpPath = filePath + '.tmp'
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmpPath, filePath)
}

export function generateProbeId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let rand = ''
  for (let i = 0; i < 5; i++) rand += chars[Math.floor(Math.random() * chars.length)]
  return `probe-${Date.now()}-${rand}`
}

export function createProbe(projectRoot, type, params, timeout = 5000) {
  const data = readProbesFile(projectRoot)
  const entry = {
    id: generateProbeId(),
    type,
    params: params || {},
    status: 'pending',
    createdAt: Date.now(),
    respondedAt: null,
    timeout,
    result: null
  }

  // Ring-buffer: fjern eldste hvis full
  if (data.probes.length >= (data.maxProbes || 50)) {
    data.probes.shift()
  }
  data.probes.push(entry)
  writeProbesFile(projectRoot, data)
  return entry
}

export function updateProbeResult(projectRoot, probeId, result) {
  const data = readProbesFile(projectRoot)
  const probe = data.probes.find(p => p.id === probeId)
  if (!probe) return null

  probe.result = result
  probe.respondedAt = Date.now()
  probe.status = result?.success === false ? 'error' : 'completed'
  writeProbesFile(projectRoot, data)
  return probe
}

export function cleanupOldProbes(projectRoot) {
  const data = readProbesFile(projectRoot)
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
  const before = data.probes.length
  data.probes = data.probes.filter(p => p.createdAt > thirtyMinutesAgo)
  if (data.probes.length < before) {
    writeProbesFile(projectRoot, data)
  }
  return before - data.probes.length
}

// --- Timeout-håndtering ---

export function startProbeTimeout(probeId, timeoutMs, callback) {
  clearProbeTimeout(probeId)
  const timer = setTimeout(() => {
    pendingTimeouts.delete(probeId)
    entryTimestamps.delete(probeId)
    callback()
  }, timeoutMs)
  pendingTimeouts.set(probeId, timer)
  entryTimestamps.set(probeId, Date.now())
  enforceMapLimit(pendingTimeouts, 'pendingTimeouts')
}

export function clearProbeTimeout(probeId) {
  const timer = pendingTimeouts.get(probeId)
  if (timer) {
    clearTimeout(timer)
    pendingTimeouts.delete(probeId)
    entryTimestamps.delete(probeId)
  }
}

// --- Wait-modus ---

export function waitForProbeResult(probeId, timeoutMs) {
  return new Promise((resolve) => {
    waitingResolvers.set(probeId, resolve)
    entryTimestamps.set(probeId, Date.now())
    enforceMapLimit(waitingResolvers, 'waitingResolvers')

    // Timeout-fallback for wait
    setTimeout(() => {
      if (waitingResolvers.has(probeId)) {
        waitingResolvers.delete(probeId)
        entryTimestamps.delete(probeId)
        resolve({ timeout: true })
      }
    }, timeoutMs + 1000) // Litt ekstra buffer utover probe-timeout
  })
}

export function resolveWaitingProbe(probeId, result) {
  const resolver = waitingResolvers.get(probeId)
  if (resolver) {
    waitingResolvers.delete(probeId)
    entryTimestamps.delete(probeId)
    resolver(result)
  }
}
