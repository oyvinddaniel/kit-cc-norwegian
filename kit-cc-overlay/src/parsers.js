/**
 * Parsere for Kit CC-filer
 *
 * Konverterer markdown og JSON til strukturerte data
 * som monitor-klienten kan bruke.
 */

import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'
import { readdirSync } from 'node:fs'

/**
 * Beregn relativ tid på norsk
 *
 * Bruker EKTE tidspunkt (detectedAt) for nøyaktig relativ tid.
 * AI-ens HH:MM-tidspunkt er ofte feil fordi AI-en ikke vet riktig systemtid.
 * Derfor bruker vi detectedAt (satt av Monitor når entry oppdages) som autoritet.
 *
 * @param {string|null} detectedAt - ISO-timestamp fra da entry ble oppdaget (autoritativ tid)
 * @returns {object} { relativeText, timeStr, dateStr, fullDisplay }
 */
export function formatRelativeTime(detectedAt) {
  if (!detectedAt) return { relativeText: '', timeStr: '', dateStr: '', fullDisplay: '' }

  const entryTime = new Date(detectedAt)
  if (isNaN(entryTime.getTime())) {
    return { relativeText: '', timeStr: '', dateStr: '', fullDisplay: '' }
  }

  const now = new Date()

  // Beregn differanse i minutter
  const diffMs = now - entryTime
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  // Relativ tid på norsk
  let relativeText = ''
  if (diffMins < 1) {
    relativeText = 'nå'
  } else if (diffMins < 60) {
    relativeText = `${diffMins} min siden`
  } else if (diffHours < 24) {
    if (diffHours === 1) relativeText = '1 time siden'
    else relativeText = `${diffHours} timer siden`
  } else if (diffDays === 1) {
    relativeText = 'i går'
  } else {
    relativeText = `${diffDays} dager siden`
  }

  // Formater dato på norsk: "15. feb"
  const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']
  const dateStr = `${entryTime.getDate()}. ${months[entryTime.getMonth()]}`

  // Format tid fra ekte klokke: "HH:MM"
  const timeFormatted = `${String(entryTime.getHours()).padStart(2, '0')}:${String(entryTime.getMinutes()).padStart(2, '0')}`

  // Fullstendig display: "2 min siden · 10:05 · 15. feb"
  const fullDisplay = `${relativeText} · ${timeFormatted} · ${dateStr}`

  return { relativeText, timeStr: timeFormatted, dateStr, fullDisplay }
}

/**
 * Parse logfmt key=value pairs fra en streng.
 * Håndterer verdier med og uten anførselstegn.
 *
 * @param {string} str - Logfmt-streng, f.eks. 'ts=14:30 event=START task=MVP-01 desc="Starter arbeid"'
 * @returns {Object} Parsed key-value pairs
 */
function parseLogfmt(str) {
  const result = {}
  const re = /(\w+)=(?:"([^"]*)"|([\S]*))/g
  let m
  while ((m = re.exec(str)) !== null) {
    result[m[1]] = m[2] !== undefined ? m[2] : m[3]
  }
  return result
}

/**
 * Ikon-mapping for logfmt event-typer
 */
const EVENT_ICONS = {
  START: '⏳',
  FILE: '📄',
  COMMIT: '💾',
  DONE: '✅',
  DECISION: '🔧',
  ERROR: '❌',
  CONTEXT_BUDGET: '⚠️',
  RECOVERY: '🔧',
  MODE_CHANGE: '🔄'
}

/**
 * Bygg en menneskevennlig beskrivelse fra logfmt-felter
 */
function buildLogfmtDescription(fields) {
  const event = fields.event
  switch (event) {
    case 'START':
      return fields.desc || fields.task || 'Startet oppgave'
    case 'FILE':
      return `${fields.op || 'endret'} ${fields.path || ''}${fields.desc ? ' — ' + fields.desc : ''}`.trim()
    case 'COMMIT':
      return fields.msg || 'Git commit'
    case 'DONE':
      return `${fields.task || 'Oppgave'} → ${fields.output || 'ferdig'}`
    case 'DECISION':
      return fields.what || fields.desc || 'Beslutning tatt'
    case 'ERROR':
      return `${fields.desc || 'Feil'}${fields.fix ? ' → ' + fields.fix : ''}`
    case 'CONTEXT_BUDGET':
      return `Budsjett nådd (${fields.files || '?'} filer, ${fields.messages || '?'} meldinger)`
    case 'RECOVERY':
      return fields.action || 'Gjenoppretting'
    case 'MODE_CHANGE':
      return `${fields.from || '?'} → ${fields.to || '?'}`
    default:
      return fields.desc || fields.msg || Object.entries(fields).filter(([k]) => k !== 'ts' && k !== 'event').map(([k, v]) => `${k}=${v}`).join(' ')
  }
}

/**
 * Parse én linje fra PROGRESS-LOG.md
 *
 * Støtter to formater:
 * - Logfmt (v3.3+): ts=HH:MM event=START task=[id] desc="[beskrivelse]"
 * - Legacy: - HH:MM ⏳ TYPE: beskrivelse
 *
 * @param {string} line - Én linje fra PROGRESS-LOG
 * @param {string|null} detectedAt - ISO-timestamp for når entry ble oppdaget (ekte systemtid)
 */
export function parseProgressLog(line, detectedAt = null) {
  const formattedTime = detectedAt ? formatRelativeTime(detectedAt) : null

  // Logfmt-format: ts=HH:MM event=TYPE ...
  if (line.match(/^\s*ts=/)) {
    const fields = parseLogfmt(line)
    const event = (fields.event || 'UNKNOWN').toUpperCase()
    return {
      time: fields.ts || null,
      detectedAt,
      formattedTime,
      icon: EVENT_ICONS[event] || '',
      type: event,
      description: buildLogfmtDescription(fields),
      fields,
      raw: line
    }
  }

  // Legacy-format: - HH:MM ⏳ TYPE: beskrivelse
  const match = line.match(/^-\s*(\d{1,2}:\d{2})?\s*(⏳|📄|💾|✅|🔧|❌|⚠️)?\s*(\w+):\s*(.*)/)
  if (match) {
    return {
      time: match[1] || null,
      detectedAt,
      formattedTime,
      icon: match[2] || null,
      type: match[3],
      description: match[4],
      raw: line
    }
  }

  return { raw: line, type: 'UNKNOWN', description: line.replace(/^[-\s]*/, ''), formattedTime, detectedAt }
}

/**
 * Les og parse PROJECT-STATE.json
 */
export function readProjectState(projectRoot) {
  const filePath = join(projectRoot, '.ai', 'PROJECT-STATE.json')

  try {
    if (!existsSync(filePath)) {
      return { error: 'PROJECT-STATE.json finnes ikke', exists: false }
    }

    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    return { error: err.message, exists: true }
  }
}

/**
 * Les og parse PROGRESS-LOG.md (siste N linjer)
 *
 * Ved initial load brukes filens modification time som tidspunkt.
 * Dette er ikke 100% nøyaktig for eldre entries, men gir en rimelig indikasjon.
 * Nye entries oppdaget av watcheren får ekte systemtid (Date.now()).
 */
export function readProgressLog(projectRoot, limit = 50) {
  const filePath = join(projectRoot, '.ai', 'PROGRESS-LOG.md')

  try {
    if (!existsSync(filePath)) {
      return { entries: [], totalLines: 0 }
    }

    const content = readFileSync(filePath, 'utf-8')
    // Match both logfmt (ts=...) and legacy (- HH:MM ...) lines
    const lines = content.split('\n').filter(l => {
      const trimmed = l.trim()
      return trimmed.startsWith('ts=') || trimmed.startsWith('-')
    })
    const sliced = lines.slice(-limit)

    // Bruk filens modification time som tidspunkt for eksisterende entries
    const fileStat = statSync(filePath)
    const fileModTime = new Date(fileStat.mtime).toISOString()

    return {
      entries: sliced.map(line => parseProgressLog(line, fileModTime)),
      totalLines: lines.length
    }
  } catch (err) {
    return { entries: [], totalLines: 0, error: err.message }
  }
}

/**
 * Les og parse MODULREGISTER
 * Søker i docs/-mappen for filer som inneholder "MODULREGISTER"
 */
export function readModulregister(projectRoot) {
  const docsDir = join(projectRoot, 'docs')

  try {
    if (!existsSync(docsDir)) {
      return { modules: [], found: false }
    }

    // Søk rekursivt i docs/ etter MODULREGISTER-filer
    const modulregisterPath = findModulregister(docsDir)

    if (!modulregisterPath) {
      return { modules: [], found: false }
    }

    const content = readFileSync(modulregisterPath, 'utf-8')
    return {
      modules: parseModulregisterContent(content),
      found: true,
      path: modulregisterPath
    }
  } catch (err) {
    return { modules: [], found: false, error: err.message }
  }
}

/**
 * Finn MODULREGISTER-filen i docs/
 */
function findModulregister(dir, depth = 0) {
  // Begrens rekursjonsdybde for å unngå uendelig rekursjon
  const MAX_DEPTH = 5
  if (depth > MAX_DEPTH) return null

  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isFile() && entry.name.toUpperCase().includes('MODULREGISTER')) {
        return fullPath
      }
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const found = findModulregister(fullPath, depth + 1)
        if (found) return found
      }
    }
  } catch {
    // Ignorer tilgangsfeil
  }
  return null
}

/**
 * Parse MODULREGISTER markdown-innhold til strukturert data.
 * Supports both heading-based format and table-based format (Kit CC template).
 */
export function parseModulregisterContent(content) {
  // Strip BOM if present
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1)

  // Auto-detect format: table format requires ID + Modul + Status columns
  const lines = content.split('\n')
  const hasTable = lines.some(l => {
    const stripped = l.replace(/^[\s>]*/, '')
    return /^\|/.test(stripped) && /\bModul\b/i.test(stripped) && (/\bID\b/.test(stripped) || /\bStatus\b/i.test(stripped))
  })

  if (hasTable) return parseModulregisterTable(lines)
  return parseModulregisterHeadings(lines)
}

/**
 * Strip markdown formatting (bold, italic, code, links)
 */
function stripMarkdown(str) {
  return str
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

function parseModulregisterTable(lines) {
  const modules = []
  let headerCols = null

  for (const rawLine of lines) {
    // Strip blockquote prefix and leading whitespace
    const line = rawLine.replace(/^[\s>]*/, '')

    // Skip non-table lines and separator rows
    if (!line.startsWith('|')) continue
    if (/^\|[\s-:]+\|/.test(line)) continue

    const cells = line.split('|').slice(1, -1).map(c => stripMarkdown(c))
    if (!cells.length) continue

    // Detect header row: require at least 3 known column names
    if (!headerCols) {
      const matchCount = cells.filter(c => /^(ID|Modul|Module|Status|Beskrivelse|Description|MVP|Underfunksjoner)$/i.test(c)).length
      if (matchCount >= 3) {
        headerCols = cells.map(c => c.toLowerCase())
        continue
      }
      continue // skip until we find a proper header
    }

    const row = {}
    headerCols.forEach((col, i) => { row[col] = cells[i] || '' })

    const name = row['modul'] || row['module'] || ''
    const id = row['id'] || ''
    const status = row['status'] || 'unknown'
    const desc = row['beskrivelse'] || row['description'] || ''
    const mvp = /^ja$/i.test(row['mvp'] || '')
    const subCount = parseInt(row['underfunksjoner'] || '0', 10) || 0

    if (!name) continue

    modules.push({
      name: id ? `${id} ${name}` : name,
      status: status.toLowerCase(),
      type: mvp ? 'MVP' : undefined,
      description: desc,
      features: subCount > 0
        ? Array.from({ length: subCount }, (_, i) => ({
            name: `Underfunksjon ${i + 1}`,
            done: /^done$/i.test(status)
          }))
        : []
    })
  }

  return modules
}

function parseModulregisterHeadings(lines) {
  const modules = []
  let currentModule = null

  for (const line of lines) {
    const moduleMatch = line.match(/^#{2,3}\s+(.+)/)
    if (moduleMatch) {
      if (currentModule) modules.push(currentModule)
      currentModule = {
        name: stripMarkdown(moduleMatch[1]),
        status: 'unknown',
        features: []
      }
      continue
    }

    if (!currentModule) continue

    const statusMatch = line.match(/^status:\s*(.+)/i)
    if (statusMatch) {
      currentModule.status = statusMatch[1].trim()
      continue
    }

    const typeMatch = line.match(/^type:\s*(.+)/i)
    if (typeMatch) {
      currentModule.type = typeMatch[1].trim()
      continue
    }

    const taskMatch = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)/)
    if (taskMatch) {
      currentModule.features.push({
        name: taskMatch[2].trim(),
        done: taskMatch[1] !== ' '
      })
    }
  }

  if (currentModule) modules.push(currentModule)

  // Filter out false heading matches without real content
  return modules.filter(m => m.features.length > 0 || m.status !== 'unknown' || m.type)
}

/**
 * Bygg fase-oversikt fra PROJECT-STATE
 */
export function buildPhaseOverview(state) {
  const phases = [
    { num: 1, name: 'Idé og visjon' },
    { num: 2, name: 'Planlegg' },
    { num: 3, name: 'Arkitektur og sikkerhet' },
    { num: 4, name: 'MVP' },
    { num: 5, name: 'Bygg funksjonene' },
    { num: 6, name: 'Test og kvalitetssjekk' },
    { num: 7, name: 'Publiser og vedlikehold' }
  ]

  const currentPhase = state.currentPhase || 0

  return phases.map(phase => ({
    ...phase,
    status: phase.num < currentPhase ? 'completed'
      : phase.num === currentPhase ? 'active'
      : 'pending'
  }))
}

/**
 * Les og parse FASE-{N}-KOMPLETT.md
 *
 * Disse filene inneholder detaljerte oppsummeringer av hva som ble
 * gjort i en fullført fase. Strukturert med markdown-seksjoner.
 *
 * @param {string} projectRoot - Prosjektets rotmappe
 * @param {number} phaseNum - Fasenummer (0-7)
 * @returns {object} { found, sections[], rawContent }
 */
export function readPhaseCompletionDoc(projectRoot, phaseNum) {
  // Sjekk flere mulige plasseringer
  const candidates = [
    join(projectRoot, '.ai', `FASE-${phaseNum}-KOMPLETT.md`),
    join(projectRoot, 'docs', `FASE-${phaseNum}-KOMPLETT.md`)
  ]

  let filePath = null
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      filePath = candidate
      break
    }
  }

  if (!filePath) {
    return { found: false, sections: [], rawContent: '' }
  }

  try {
    const content = readFileSync(filePath, 'utf-8')
    const sections = parseMarkdownSections(content)
    return { found: true, sections, rawContent: content, path: filePath }
  } catch (err) {
    return { found: false, sections: [], rawContent: '', error: err.message }
  }
}

/**
 * Parse markdown-innhold til seksjoner basert på overskrifter
 *
 * @param {string} content - Markdown-innhold
 * @returns {Array<{title, level, items[]}>}
 */
function parseMarkdownSections(content) {
  const sections = []
  let currentSection = null

  for (const line of content.split('\n')) {
    // Match ## eller ### overskrifter
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headingMatch) {
      if (currentSection) sections.push(currentSection)
      currentSection = {
        title: headingMatch[2].trim(),
        level: headingMatch[1].length,
        items: []
      }
      continue
    }

    if (!currentSection) continue

    // Match listeoppføringer (- eller *)
    const listMatch = line.match(/^[-*]\s+(.+)/)
    if (listMatch) {
      // Sjekk for checkbox-format
      const checkMatch = listMatch[1].match(/^\[([ xX✓])\]\s*(.+)/)
      if (checkMatch) {
        currentSection.items.push({
          text: checkMatch[2].trim(),
          done: checkMatch[1] !== ' ',
          type: 'task'
        })
      } else {
        currentSection.items.push({
          text: listMatch[1].trim(),
          type: 'bullet'
        })
      }
      continue
    }

    // Vanlig tekst-linje (ikke tom)
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('```') && !trimmed.startsWith('|')) {
      currentSection.items.push({
        text: trimmed,
        type: 'text'
      })
    }
  }

  if (currentSection) sections.push(currentSection)
  return sections
}

/**
 * Bygg komplett fase-oppsummering fra alle tilgjengelige kilder
 *
 * Kombinerer data fra:
 * - PROJECT-STATE.json (phaseProgress, completedTasks)
 * - FASE-{N}-KOMPLETT.md (detaljert oppsummering)
 * - PROGRESS-LOG.md (kronologiske hendelser)
 *
 * @param {string} projectRoot - Prosjektets rotmappe
 * @param {number} phaseNum - Fasenummer (1-7)
 * @returns {object} Strukturert fase-oppsummering
 */
export function readPhaseSummary(projectRoot, phaseNum) {
  const PHASE_NAMES = [
    '',
    'Idé og visjon',
    'Planlegg',
    'Arkitektur og sikkerhet',
    'MVP',
    'Bygg funksjonene',
    'Test og kvalitetssjekk',
    'Publiser og vedlikehold'
  ]

  if (phaseNum < 1 || phaseNum > 7) {
    return { error: `Ugyldig fasenummer: ${phaseNum}` }
  }

  // 1. Les PROJECT-STATE for fasestatus
  const state = readProjectState(projectRoot)
  if (state.error) {
    return { error: 'Kunne ikke lese PROJECT-STATE.json', details: state.error }
  }

  const currentPhase = state.currentPhase || 0
  const phaseKey = `phase${phaseNum}`
  const phaseData = state.phaseProgress?.[phaseKey] || {}
  const status = phaseNum < currentPhase ? 'completed'
    : phaseNum === currentPhase ? 'active'
    : 'pending'

  // 2. Hent completedSteps for denne fasen
  const completedSteps = phaseData.completedSteps || []
  const skippedSteps = phaseData.skippedSteps || []

  // 3. Les FASE-{N}-KOMPLETT.md
  const completionDoc = readPhaseCompletionDoc(projectRoot, phaseNum)

  // 4. Filtrer PROGRESS-LOG-oppføringer for denne fasen
  //    (basert på tidsstempler fra phaseProgress)
  const phaseLogEntries = getPhaseLogEntries(projectRoot, phaseData)

  // 5. Bygg oppsummering
  return {
    num: phaseNum,
    name: PHASE_NAMES[phaseNum],
    status,
    startedAt: phaseData.startedAt || null,
    completedAt: phaseData.completedAt || null,
    gatesPassed: phaseData.gatesPassed || false,
    completedSteps,
    skippedSteps,
    completionDoc: completionDoc.found ? completionDoc.sections : [],
    hasCompletionDoc: completionDoc.found,
    logEntries: phaseLogEntries,
    summary: buildPhaseSummaryText(status, completedSteps, completionDoc)
  }
}

/**
 * Hent PROGRESS-LOG-oppføringer som tilhører en gitt fase
 * Bruker start/slutt-tidsstempler fra phaseProgress
 */
function getPhaseLogEntries(projectRoot, phaseData) {
  if (!phaseData.startedAt) return []

  const progressLog = readProgressLog(projectRoot, 200)
  if (!progressLog.entries?.length) return []

  const startTime = new Date(phaseData.startedAt).getTime()
  const endTime = phaseData.completedAt
    ? new Date(phaseData.completedAt).getTime()
    : Date.now()

  // Filtrer entries basert på detectedAt-tidsstempel
  return progressLog.entries.filter(entry => {
    if (!entry.detectedAt) return false
    const entryTime = new Date(entry.detectedAt).getTime()
    return entryTime >= startTime && entryTime <= endTime
  }).slice(-50) // Begrens til siste 50 per fase
}

/**
 * Bygg en kort oppsummeringstekst for fasen
 */
function buildPhaseSummaryText(status, completedSteps, completionDoc) {
  if (status === 'pending') {
    return 'Denne fasen er ikke startet ennå.'
  }

  if (status === 'active') {
    const stepCount = completedSteps.length
    return stepCount > 0
      ? `Pågår — ${stepCount} oppgave${stepCount !== 1 ? 'r' : ''} fullført så langt.`
      : 'Pågår — ingen oppgaver fullført ennå.'
  }

  // Completed
  const stepCount = completedSteps.length
  if (completionDoc.found && completionDoc.sections.length > 0) {
    return `Fullført med ${stepCount} oppgave${stepCount !== 1 ? 'r' : ''}. Detaljert oppsummering tilgjengelig.`
  }
  return `Fullført med ${stepCount} oppgave${stepCount !== 1 ? 'r' : ''}.`
}
