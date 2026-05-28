// Kit CC Monitor — profesjonell pakke endpoints (N3)
//
// Auth: Bruker Bearer-tokenet satt opp av authMiddleware i server.js (samme som alle andre
// /kit-cc/api-ruter). Tidligere krevde disse endepunktene en dobbel sjekk via
// x-kit-cc-token-header + KIT_CC_MONITOR_TOKEN env, men overlay-UI kaller dem med Bearer —
// den dobbelte sjekken resulterte i 401. For CI/CD eller cross-origin-testing kan man
// fortsatt sette KIT_CC_MONITOR_TOKEN som et tilleggskrav via requireOptionalSecret().

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Valgfri ekstra sikring: hvis KIT_CC_MONITOR_TOKEN er satt i env, krever vi en matchende
 * x-kit-cc-token-header. Hvis env-variabelen ikke er satt, slipper requesten gjennom
 * (Bearer-tokenet fra authMiddleware er allerede validert).
 */
function requireOptionalSecret(req, res, next) {
  const expected = process.env.KIT_CC_MONITOR_TOKEN
  if (!expected) return next()
  const token = req.headers['x-kit-cc-token']
  if (token !== expected) {
    return res.status(401).json({ error: 'Unauthorized (KIT_CC_MONITOR_TOKEN mismatch)' })
  }
  next()
}

export function registerProfessionalRoutes(app, projectRoot) {
  // GET /kit-cc/api/professional-status
  app.get('/kit-cc/api/professional-status', requireOptionalSecret, (req, res) => {
    try {
      const stateFile = join(projectRoot, '.ai/PROJECT-STATE.json')
      if (!existsSync(stateFile)) return res.json({ enabled: false, message: 'PROJECT-STATE.json ikke funnet' })
      const state = JSON.parse(readFileSync(stateFile, 'utf-8'))
      const pkg = state.professionalPackage || { enabled: false }
      res.json({
        enabled: pkg.enabled || false,
        activatedAt: pkg.activatedAt || null,
        intensityAtActivation: pkg.intensityAtActivation || null,
        componentCount: pkg.components?.length || 0,
        components: pkg.components || [],
        refinementCounter: pkg.refinementCounter || 0,
        lastDriftCheck: pkg.lastDriftCheck || null
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /kit-cc/api/costs
  app.get('/kit-cc/api/costs', requireOptionalSecret, (req, res) => {
    try {
      const logFile = join(projectRoot, '.ai/AI-COST-LOG.json')
      if (!existsSync(logFile)) return res.json({ message: 'Ingen kostnadslogg funnet ennå', costs: [] })
      res.json(JSON.parse(readFileSync(logFile, 'utf-8')))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /kit-cc/api/pii-scan
  app.get('/kit-cc/api/pii-scan', requireOptionalSecret, (req, res) => {
    try {
      const scanFile = join(projectRoot, '.ai/PII-SCAN-RESULT.json')
      if (!existsSync(scanFile)) return res.json({ message: 'Ingen PII-skanning kjørt ennå', findings: [] })
      res.json(JSON.parse(readFileSync(scanFile, 'utf-8')))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
}
