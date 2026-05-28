/**
 * Git-verktøy for Kit CC Monitor
 *
 * Wrapper rundt child_process for git-operasjoner.
 * Alle funksjoner fanger feil og returnerer null/false istedenfor å kaste.
 *
 * SELV-REPARERENDE .gitignore:
 * ensureGitignore() kjører automatisk før git-operasjoner og sørger for
 * at Kit CC-filer aldri committes eller tilbakestilles av git.
 *
 * SIKKERHETSFIKS inkludert:
 * - K2: execFileSync brukes i stedet for execSync (ingen shell-injeksjon)
 * - H2: Timeout på alle git-operasjoner (30s)
 * - H4: cleanupGitLock() fjerner gamle lock-filer
 * - H5: \x00 som separator i getGitLog (pipe i meldinger bryter ikke parsing)
 * - M6: Duplikat-sjekk i ensureGitignore
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, appendFileSync, existsSync, unlinkSync, statSync } from 'node:fs'
import { join } from 'node:path'

const GIT_TIMEOUT = 30_000 // 30 sekunder

/**
 * Kit CC-filer som ALDRI skal være i git.
 * Denne listen er den eneste kilden til sannhet.
 */
const KIT_CC_IGNORES = [
  '.ai/',
  'Kit CC/',
  'kit-cc-overlay/',
  'CLAUDE.md',
]

/**
 * Kjør en git-kommando i prosjektmappen (uten shell — sikker mot injeksjon)
 * @param {string[]} args - Git-argumenter
 * @param {string} cwd - Prosjektmappe
 * @returns {string|null} stdout eller null ved feil
 */
function gitExec(args, cwd) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: GIT_TIMEOUT
    }).trim()
  } catch {
    return null
  }
}

/**
 * Fjern gammel git index.lock-fil som kan blokkere operasjoner etter krasj.
 * Fjernes kun hvis filen er eldre enn 60 sekunder.
 * @param {string} projectRoot
 */
function cleanupGitLock(projectRoot) {
  const lockPath = join(projectRoot, '.git', 'index.lock')
  try {
    if (existsSync(lockPath)) {
      const stat = statSync(lockPath)
      const ageMs = Date.now() - stat.mtimeMs
      if (ageMs > 60_000) {
        unlinkSync(lockPath)
      }
    }
  } catch {
    // Ignorer — filen kan være fjernet av en annen prosess
  }
}

/**
 * Sørg for at .gitignore inneholder alle Kit CC-oppføringer.
 * Selv-reparerende: manglende oppføringer legges til, duplikater unngås.
 *
 * @param {string} projectRoot
 */
export function ensureGitignore(projectRoot) {
  const gitignorePath = join(projectRoot, '.gitignore')

  let content = ''
  try {
    content = readFileSync(gitignorePath, 'utf-8')
  } catch {
    // Ingen .gitignore — vi oppretter en
  }

  const lines = content.split('\n').map(l => l.trim())
  const missing = KIT_CC_IGNORES.filter(entry => !lines.includes(entry))

  if (missing.length > 0) {
    const section = (content && !content.endsWith('\n') ? '\n' : '') +
      '\n# Kit CC — prosess-filer (automatisk vedlikeholdt)\n' +
      missing.join('\n') + '\n'
    appendFileSync(gitignorePath, section, 'utf-8')
  }

  // Untrack filer som allerede er i git men nå skal ignoreres
  for (const entry of KIT_CC_IGNORES) {
    const tracked = gitExec(['ls-files', entry], projectRoot)
    if (tracked) {
      gitExec(['rm', '-r', '--cached', entry.replace(/\/$/, '')], projectRoot)
    }
  }
}

/**
 * Sjekk om prosjektmappen er et git-repo
 * @param {string} projectRoot
 * @returns {boolean}
 */
export function isGitRepo(projectRoot) {
  return gitExec(['rev-parse', '--is-inside-work-tree'], projectRoot) === 'true'
}

/**
 * Hent git-status for prosjektet
 * @param {string} projectRoot
 * @returns {{ clean: boolean, branch: string, commitSha: string } | null}
 */
export function getGitStatus(projectRoot) {
  const branch = gitExec(['rev-parse', '--abbrev-ref', 'HEAD'], projectRoot)
  const commitSha = gitExec(['rev-parse', '--short', 'HEAD'], projectRoot)
  const status = gitExec(['status', '--porcelain'], projectRoot)

  if (branch === null) return null

  return {
    clean: status === '' || status === null,
    branch,
    commitSha: commitSha || ''
  }
}

/**
 * Stage alle endringer og commit
 * @param {string} projectRoot
 * @param {string} message - Commit-melding
 * @returns {string|null} Kort commit SHA eller null ved feil
 */
export function gitCommitAll(projectRoot, message) {
  cleanupGitLock(projectRoot)
  ensureGitignore(projectRoot)

  const addResult = gitExec(['add', '-A'], projectRoot)
  if (addResult === null) return null

  const status = gitExec(['status', '--porcelain'], projectRoot)
  if (!status) {
    return gitExec(['rev-parse', '--short', 'HEAD'], projectRoot)
  }

  // execFileSync med array-args — ingen shell-injeksjon mulig (K2)
  const result = gitExec(['commit', '-m', message], projectRoot)
  if (result === null) return null

  return gitExec(['rev-parse', '--short', 'HEAD'], projectRoot)
}

/**
 * Hard reset til en spesifikk commit
 * @param {string} projectRoot
 * @param {string} commitSha - Commit SHA å resette til
 * @returns {boolean} true ved suksess
 */
export function gitResetHard(projectRoot, commitSha) {
  if (!/^[0-9a-f]{4,40}$/i.test(commitSha)) return false
  cleanupGitLock(projectRoot)

  const result = gitExec(['reset', '--hard', commitSha], projectRoot)
  return result !== null
}

/**
 * Hent git-logg
 * @param {string} projectRoot
 * @param {number} [limit=20] - Maks antall commits
 * @returns {Array<{ sha: string, message: string, date: string }>}
 */
export function getGitLog(projectRoot, limit = 20) {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100)
  // Bruker \x00 som separator for å unngå at | i commit-meldinger bryter parsing (H5)
  const log = gitExec(['log', '--oneline', `--format=%h%x00%s%x00%ci`, `-${safeLimit}`], projectRoot)
  if (!log) return []

  return log.split('\n').filter(Boolean).map(line => {
    const parts = line.split('\x00')
    return {
      sha: parts[0] || '',
      message: parts[1] || '',
      date: parts[2] || ''
    }
  })
}
