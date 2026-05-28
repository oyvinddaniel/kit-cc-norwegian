/**
 * F15: AI-chat for planlegging (BYOK via proxy)
 *
 * Multi-provider støtte: Anthropic, OpenAI, Google Gemini, Groq.
 * Dynamisk systemprompt med Kit CC-kontekst.
 * Selvkvalitetssjekk: AI vurderer alternativer → kvalitetssjekker → presenterer beste løsning.
 * BYOK: Brukerens API-nøkler lagres lokalt i .ai/config.json.
 *
 * Sikkerhetsmodell:
 *   - API-nøkler sendes ALDRI til nettleseren
 *   - Alle AI-kall går gjennom proxy-serveren
 *   - Nøklene leses fra .ai/config.json på serveren
 */

import { readFileSync, existsSync, writeFileSync, chmodSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { readProjectState, readModulregister } from '../parsers.js'
import * as backlogService from './service.js'
import { encrypt, decrypt, isEncrypted, setCryptoDir } from '../crypto.js'

// Maks sikkerhetskonstanter
const MAX_MESSAGES = 40
const MAX_INPUT_LENGTH = 10000
const MAX_SYSTEM_PROMPT_CONTEXT = 3000

// ─── Provider-definisjoner ──────────────────────────────────────────────

const PROVIDERS = {
  anthropic: {
    name: 'Anthropic (Claude)',
    defaultModel: 'claude-sonnet-4-5-20250929',
    fallbackModels: [
      { id: 'claude-sonnet-4-5-20250929', displayName: 'Claude Sonnet 4.5' },
      { id: 'claude-opus-4-6-20260415', displayName: 'Claude Opus 4.6' },
      { id: 'claude-haiku-3-5-20241022', displayName: 'Claude Haiku 3.5' }
    ]
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o',
    fallbackModels: [
      { id: 'gpt-4o', displayName: 'GPT-4o' },
      { id: 'gpt-4o-mini', displayName: 'GPT-4o mini' },
      { id: 'o3-mini', displayName: 'o3-mini' }
    ]
  },
  'google-gemini': {
    name: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    fallbackModels: [
      { id: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro' }
    ]
  },
  groq: {
    name: 'Groq',
    defaultModel: 'llama-3.3-70b-versatile',
    fallbackModels: [
      { id: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B' },
      { id: 'mixtral-8x7b-32768', displayName: 'Mixtral 8x7B' }
    ]
  }
}

// ─── Modell-cache (per provider) ────────────────────────────────────────

const modelsCacheMap = new Map()
const MODELS_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 timer

// ─── Provider-spesifikk modellhenting ───────────────────────────────────

async function fetchModelsForProvider(provider, apiKey, forceRefresh = false) {
  const cacheKey = provider
  const cached = modelsCacheMap.get(cacheKey)
  if (!forceRefresh && cached && (Date.now() - cached.fetchedAt < MODELS_CACHE_TTL)) {
    return cached.models
  }

  try {
    const fetcher = MODEL_FETCHERS[provider]
    if (!fetcher) return PROVIDERS[provider]?.fallbackModels || []
    const models = await fetcher(apiKey)
    modelsCacheMap.set(cacheKey, { models, fetchedAt: Date.now() })
    return models
  } catch (err) {
    console.warn(`⚠️  Kunne ikke hente modeller for ${provider}: ${err.message}`)
    return PROVIDERS[provider]?.fallbackModels || []
  }
}

const MODEL_FETCHERS = {
  async anthropic(apiKey) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('https://api.anthropic.com/v1/models?limit=100', {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`API ${response.status}`)

      let data
      try { data = await response.json() } catch { throw new Error('Ugyldig JSON fra Anthropic API') }
      const models = (data.data || [])
        .filter(m => m.id && m.display_name)
        .filter(m => !m.id.includes('claude-2') && !m.id.includes('claude-1') && !m.id.includes('claude-instant'))
        .map(m => ({ id: m.id, displayName: m.display_name, createdAt: m.created_at || '' }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      return models.length > 0 ? models : PROVIDERS.anthropic.fallbackModels
    } catch (err) { clearTimeout(timeoutId); throw err }
  },

  async openai(apiKey) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`API ${response.status}`)

      let data
      try { data = await response.json() } catch { throw new Error('Ugyldig JSON fra OpenAI API') }
      const models = (data.data || [])
        .filter(m => m.id && (m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('o4')))
        .map(m => ({ id: m.id, displayName: m.id }))
        .sort((a, b) => a.id.localeCompare(b.id))
      return models.length > 0 ? models : PROVIDERS.openai.fallbackModels
    } catch (err) { clearTimeout(timeoutId); throw err }
  },

  async 'google-gemini'(apiKey) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: { 'x-goog-api-key': apiKey },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`API ${response.status}`)

      let data
      try { data = await response.json() } catch { throw new Error('Ugyldig JSON fra Gemini API') }
      const models = (data.models || [])
        .filter(m => m.name && m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => ({
          id: m.name.replace('models/', ''),
          displayName: m.displayName || m.name.replace('models/', '')
        }))
      return models.length > 0 ? models : PROVIDERS['google-gemini'].fallbackModels
    } catch (err) { clearTimeout(timeoutId); throw err }
  },

  async groq(apiKey) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`API ${response.status}`)

      let data
      try { data = await response.json() } catch { throw new Error('Ugyldig JSON fra Groq API') }
      const models = (data.data || [])
        .filter(m => m.id && m.active !== false)
        .map(m => ({ id: m.id, displayName: m.id }))
        .sort((a, b) => a.id.localeCompare(b.id))
      return models.length > 0 ? models : PROVIDERS.groq.fallbackModels
    } catch (err) { clearTimeout(timeoutId); throw err }
  }
}

/**
 * Valider API-nøkkel format (grunnleggende sjekk)
 */
function isValidApiKeyFormat(key) {
  if (!key || typeof key !== 'string') return false
  return key.length >= 20 && key.length <= 200
}

// ─── Multi-provider konfigurasjon ───────────────────────────────────────

/**
 * Les full config fra .ai/config.json, med automatisk migrering fra gammel format
 */
function readConfig(projectRoot) {
  const configPath = join(projectRoot, '.ai', 'config.json')
  try {
    if (!existsSync(configPath)) return { activeProvider: null, providers: {} }
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'))

    // Bakoverkompatibilitet: Migrer gammel flat format til ny struktur
    if (raw.apiKey && !raw.providers) {
      // Backup gammel config før migrering
      try { writeFileSync(configPath + '.pre-migration', readFileSync(configPath, 'utf-8'), 'utf-8') } catch (err) { console.warn(`⚠️  Kunne ikke lage migrerings-backup: ${err.message}`) }
      const migrated = {
        activeProvider: 'anthropic',
        providers: {
          anthropic: {
            apiKey: raw.apiKey,
            model: raw.model || 'claude-sonnet-4-5-20250929'
          }
        },
        _warning: raw._warning || 'DENNE FILEN INNEHOLDER HEMMELIGE API-NØKLER. ALDRI COMMIT TIL GIT.'
      }
      // Skriv migrert versjon tilbake
      writeConfig(projectRoot, migrated)
      return migrated
    }

    // Dekrypter API-nøkler og auto-migrer klartekst til kryptert format
    const config = {
      activeProvider: raw.activeProvider || null,
      providers: raw.providers || {},
      _warning: raw._warning
    }

    let needsMigration = false
    for (const [providerId, provConf] of Object.entries(config.providers)) {
      if (provConf.apiKey) {
        if (isEncrypted(provConf.apiKey)) {
          // Allerede kryptert — dekrypter for bruk i minne
          try {
            provConf._decryptedApiKey = decrypt(provConf.apiKey)
          } catch (err) {
            // Dekryptering feilet (f.eks. maskinmigrering, endret hostname/homedir).
            // Fjern den ødelagte krypterte nøkkelen — bruker må legge inn nøkkelen på nytt.
            console.warn(`⚠️  Kunne ikke dekryptere API-nøkkel for ${providerId} (${err.message}). Nøkkelen må legges inn på nytt.`)
            provConf._decryptedApiKey = null
            delete provConf.apiKey
            needsMigration = true  // Skriv tilbake uten den ødelagte nøkkelen
          }
        } else if (typeof provConf.apiKey === 'string') {
          // Klartekst — migrer til kryptert format
          provConf._decryptedApiKey = provConf.apiKey
          provConf.apiKey = encrypt(provConf.apiKey)
          needsMigration = true
        }
      }
    }

    // Skriv tilbake med krypterte nøkler hvis migrering var nødvendig
    if (needsMigration) {
      writeConfig(projectRoot, config)
    }

    return config
  } catch (err) {
    console.error(`⚠️  Kunne ikke lese config.json: ${err.message}`)
    return { activeProvider: null, providers: {} }
  }
}

/**
 * Skriv config til .ai/config.json med sikkerhetstiltak
 */
function writeConfig(projectRoot, config) {
  const aiDir = join(projectRoot, '.ai')
  const configPath = join(aiDir, 'config.json')
  const tmpPath = configPath + '.tmp'

  config._warning = 'DENNE FILEN INNEHOLDER HEMMELIGE API-NØKLER. ALDRI COMMIT TIL GIT.'

  // Fjern _decryptedApiKey fra providers før lagring (intern bruk, skal ikke lagres)
  const toSave = JSON.parse(JSON.stringify(config))
  for (const provConf of Object.values(toSave.providers || {})) {
    delete provConf._decryptedApiKey
  }

  // Atomisk skriving: tmp → rename
  writeFileSync(tmpPath, JSON.stringify(toSave, null, 2), 'utf-8')
  if (process.platform !== 'win32') {
    try { chmodSync(tmpPath, 0o600) } catch {}
  }
  renameSync(tmpPath, configPath)

  ensureGitignore(aiDir, 'config.json')
}

/**
 * Les API-nøkkel for aktiv provider
 */
export function getApiKey(projectRoot) {
  const config = readConfig(projectRoot)
  const provider = config.activeProvider || 'anthropic'
  const provConf = config.providers[provider]
  // Bruk dekryptert nøkkel (satt av readConfig)
  return provConf?._decryptedApiKey || null
}

/**
 * Les API-nøkkel for en spesifikk provider
 */
function getProviderApiKey(projectRoot, provider) {
  const config = readConfig(projectRoot)
  const provConf = config.providers[provider]
  return provConf?._decryptedApiKey || null
}

/**
 * Hent modellnavn for aktiv provider
 */
function getModel(projectRoot) {
  const config = readConfig(projectRoot)
  const provider = config.activeProvider || 'anthropic'
  return config.providers[provider]?.model || PROVIDERS[provider]?.defaultModel || 'claude-sonnet-4-5-20250929'
}

/**
 * Hent aktiv provider
 */
function getActiveProvider(projectRoot) {
  const config = readConfig(projectRoot)
  return config.activeProvider || 'anthropic'
}

// Forventede prefix per provider (for tidlig feilmelding)
const API_KEY_PREFIXES = {
  anthropic: 'sk-ant-',
  openai: 'sk-',
  'google-gemini': 'AI',
  groq: 'gsk_'
}

/**
 * Lagre provider-konfigurasjon (API-nøkkel og/eller modell)
 */
function saveProviderConfig(projectRoot, provider, { apiKey, model }) {
  if (apiKey) {
    const expectedPrefix = API_KEY_PREFIXES[provider]
    if (expectedPrefix && !apiKey.startsWith(expectedPrefix)) {
      throw new Error(`API-nøkkel for ${provider} bør starte med "${expectedPrefix}". Sjekk at du har limt inn riktig nøkkel.`)
    }
  }
  const config = readConfig(projectRoot)
  if (!config.providers[provider]) config.providers[provider] = {}
  if (apiKey) {
    config.providers[provider].apiKey = encrypt(apiKey)
    config.providers[provider]._decryptedApiKey = apiKey
  }
  if (model) config.providers[provider].model = model
  // Sett som aktiv provider hvis det er den første, eller eksplisitt
  if (!config.activeProvider || Object.keys(config.providers).length === 1) {
    config.activeProvider = provider
  }
  writeConfig(projectRoot, config)
}

/**
 * Slett en providers konfigurasjon
 */
function deleteProviderConfig(projectRoot, provider) {
  const config = readConfig(projectRoot)
  delete config.providers[provider]
  // Hvis aktiv provider ble slettet, bytt til en annen
  if (config.activeProvider === provider) {
    const remaining = Object.keys(config.providers)
    config.activeProvider = remaining.length > 0 ? remaining[0] : null
  }
  modelsCacheMap.delete(provider)
  writeConfig(projectRoot, config)
}

/**
 * Sett aktiv provider
 */
function setActiveProvider(projectRoot, provider) {
  const config = readConfig(projectRoot)
  config.activeProvider = provider
  writeConfig(projectRoot, config)
}

/**
 * Sjekk om minst én provider har API-nøkkel
 */
export function hasApiKey(projectRoot) {
  const config = readConfig(projectRoot)
  return Object.values(config.providers).some(p => !!p._decryptedApiKey)
}

/**
 * Sørg for at en fil er ekskludert i .gitignore
 */
function ensureGitignore(dir, filename) {
  const gitignorePath = join(dir, '.gitignore')
  try {
    let content = ''
    if (existsSync(gitignorePath)) {
      content = readFileSync(gitignorePath, 'utf-8')
    }
    const lines = content.split('\n').map(l => l.trim())
    if (!lines.includes(filename)) {
      const addition = content.endsWith('\n') || content === '' ? '' : '\n'
      writeFileSync(gitignorePath, content + addition + filename + '\n', 'utf-8')
    }
  } catch (err) {
    console.warn(`⚠️  Kunne ikke oppdatere .gitignore i ${dir}: ${err.message}`)
  }
}

// ─── Dynamisk systemprompt ──────────────────────────────────────────────

/**
 * Bygg dynamisk systemprompt med Kit CC-kontekst
 */
export function buildSystemPrompt(projectRoot) {
  const state = readProjectState(projectRoot)
  const backlogStats = backlogService.getStats()

  // Les MODULREGISTER (komprimert)
  let modulContext = ''
  try {
    const mr = readModulregister(projectRoot)
    if (mr.found && mr.modules.length > 0) {
      const summary = mr.modules.map(m => {
        const done = m.features.filter(f => f.done).length
        return `- ${m.name}: ${done}/${m.features.length}`
      }).join('\n')
      modulContext = `\n\nMODULREGISTER (nåværende status):\n${summary}`
    }
  } catch (err) { console.warn(`⚠️  Kunne ikke lese modulregister: ${err.message}`) }

  // Backlog-kontekst
  let backlogContext = ''
  if (backlogStats.success) {
    const s = backlogStats.data
    backlogContext = `\n\nBYGGELISTE-STATUS: ${s.total} elementer totalt, ${s.progress}% fullført`
  }

  // Kutt kontekst til maks størrelse
  const contextStr = (modulContext + backlogContext).slice(0, MAX_SYSTEM_PROMPT_CONTEXT)

  return `Du er Kit CCs AI-planlegger — en ekspert på å bryte ned programvareprosjekter i håndterbare oppgaver.
Du er inne i "Byggelisten" — verktøyet der brukeren planlegger hva appen skal inneholde.

PROSJEKTKONTEKST:
- Prosjekt: ${String(state.projectName || 'Ukjent').slice(0, 100)}
- Fase: ${Number(state.currentPhase) || 0} av 7
- Intensitet: ${String(state.classification?.intensityLevel || 'STANDARD').slice(0, 20)}
- Stack: ${Array.isArray(state.techStack) ? state.techStack.map(s => String(s).slice(0, 30)).join(', ') : 'Ikke bestemt'}
${contextStr}

DINE REGLER:
1. Planlegg oppgaver som et hierarkisk tre: Modul → Feature → Micro-feature → Oppgave
2. Gi hvert element to navn: et forståelig (name) og et teknisk (technical_name)
3. Tilpass detaljnivå til prosjektets intensitetsnivå
4. Kvalitetssjekk dine egne forslag — vurder 2-3 alternativer internt før du presenterer
5. Vær transparent: fortell brukeren når du har kvalitetssjekket deg selv
6. Prioriter MÅ-oppgaver først, deretter BØR, så KAN
7. Ikke del oppgaver inn i tekniske sub-oppgaver som ikke-tekniske brukere ikke forstår
8. Hold svarene konsise og handlingsrettede
9. Foreslå rekkefølge basert på avhengigheter
10. Ved usikkerhet: spør brukeren i stedet for å gjette
11. Diskuter ÉN funksjon/oppgave om gangen — bryt den ned, beskriv den, og legg den i byggelisten før du går videre til neste
12. Hvis brukeren limer inn en hel liste med funksjoner: Behandle dem én etter én. Bekreft hver enkelt før du går videre.

SVARMØNSTER FOR OPPGAVEPLANLEGGING:
Når du foreslår oppgaver, bruk dette formatet:
{
  "tasks": [
    {
      "name": "Forståelig navn for brukeren",
      "technical_name": "technical-kebab-case-name",
      "type": "module|feature|micro_feature|task",
      "priority": "MUST|SHOULD|COULD",
      "description": "Kort beskrivelse av hva dette gjør"
    }
  ],
  "quality_note": "Jeg har vurdert X alternativer og kvalitetssjekket via nettsøk. Dette er den optimale tilnærmingen fordi..."
}`
}

// ─── Chat-ruter ─────────────────────────────────────────────────────────

/**
 * Sett opp AI-chat API-ruter
 * @param {import('express').Application} app
 * @param {Object} options
 */
export function setupChatRoutes(app, { projectRoot, prefix }) {
  const apiPrefix = `${prefix}/api/chat`

  // ─── Status (alle konfigurerte providers + aktiv provider) ──────────

  app.get(`${apiPrefix}/status`, (req, res) => {
    const config = readConfig(projectRoot)
    const providers = {}
    let anyConfigured = false
    for (const [id, def] of Object.entries(PROVIDERS)) {
      const provConf = config.providers[id]
      const isConfigured = !!provConf?._decryptedApiKey
      if (isConfigured) anyConfigured = true
      providers[id] = {
        name: def.name,
        configured: isConfigured,
        model: provConf?.model || def.defaultModel
      }
    }
    // activeProvider er null hvis ingen providers er konfigurert,
    // eller hvis den angitte provideren ikke har nøkkel
    const rawActive = config.activeProvider || null
    const activeIsConfigured = rawActive && providers[rawActive]?.configured
    const activeProvider = activeIsConfigured ? rawActive : null
    res.json({
      hasApiKey: anyConfigured,
      activeProvider,
      providers,
      model: getModel(projectRoot),
      maxMessages: MAX_MESSAGES,
      maxInputLength: MAX_INPUT_LENGTH
    })
  })

  // ─── Hent tilgjengelige modeller (per provider) ─────────────────────

  app.get(`${apiPrefix}/models`, async (req, res) => {
    const provider = req.query.provider || getActiveProvider(projectRoot)
    const apiKey = getProviderApiKey(projectRoot, provider)
    const providerDef = PROVIDERS[provider]

    if (!providerDef) {
      return res.status(400).json({ success: false, error: 'Ukjent provider' })
    }

    if (!apiKey) {
      return res.json({ success: true, models: providerDef.fallbackModels, source: 'fallback' })
    }

    const forceRefresh = req.query.refresh === 'true'
    try {
      const models = await fetchModelsForProvider(provider, apiKey, forceRefresh)
      res.json({ success: true, models, source: 'api' })
    } catch {
      res.json({ success: true, models: providerDef.fallbackModels, source: 'fallback' })
    }
  })

  // ─── Lagre provider-konfigurasjon ───────────────────────────────────

  app.post(`${apiPrefix}/config`, (req, res) => {
    const { apiKey, model, provider, setActive } = req.body || {}

    if (!apiKey && !model && !setActive) {
      return res.status(400).json({ error: 'Ingen innstillinger å lagre' })
    }

    // Sett aktiv provider (eller deaktiver med '_none')
    let activeWarning = null
    if (setActive && typeof setActive === 'string') {
      if (setActive === '_none') {
        setActiveProvider(projectRoot, null)
      } else if (PROVIDERS[setActive]) {
        const providerKey = getProviderApiKey(projectRoot, setActive)
        if (!providerKey) {
          activeWarning = `Provider "${setActive}" har ingen API-nøkkel konfigurert`
        }
        setActiveProvider(projectRoot, setActive)
      }
    }

    // Lagre API-nøkkel og/eller modell (kun hvis sendt)
    if (apiKey || model) {
      const targetProvider = provider || getActiveProvider(projectRoot)
      if (!PROVIDERS[targetProvider]) {
        return res.status(400).json({ error: 'Ukjent provider' })
      }
      if (apiKey && !isValidApiKeyFormat(apiKey)) {
        return res.status(400).json({ error: 'Ugyldig API-nøkkel (forventet 20-200 tegn)' })
      }
      try {
        saveProviderConfig(projectRoot, targetProvider, {
          apiKey: apiKey ? apiKey.trim() : undefined,
          model: model ? model.trim() : undefined
        })
      } catch (err) {
        return res.status(400).json({ error: err.message })
      }
      if (apiKey) modelsCacheMap.delete(targetProvider)
    }

    res.json({ saved: true, ...(activeWarning ? { warning: activeWarning } : {}) })
  })

  // ─── Slett provider-konfigurasjon ───────────────────────────────────

  app.delete(`${apiPrefix}/config/:provider`, (req, res) => {
    const provider = req.params.provider
    if (!PROVIDERS[provider]) {
      return res.status(400).json({ error: 'Ukjent provider' })
    }
    deleteProviderConfig(projectRoot, provider)
    res.json({ deleted: true })
  })

  // ─── Opprett ny samtale ─────────────────────────────────────────────

  app.post(`${apiPrefix}/conversations`, (req, res) => {
    const { title, parentConversationId } = req.body || {}
    const result = backlogService.createConversation({ title, parentConversationId })
    res.status(result.success ? 201 : 400).json(result)
  })

  // ─── Hent samtale ──────────────────────────────────────────────────

  app.get(`${apiPrefix}/conversations/:id`, (req, res) => {
    const result = backlogService.getConversation(req.params.id)
    res.status(result.success ? 200 : 404).json(result)
  })

  // ─── Hent siste samtaler (for kontekstarv) ─────────────────────────

  app.get(`${apiPrefix}/conversations`, (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 3, 1), 20)
    const offset = Math.max(parseInt(req.query.offset) || 0, 0)

    const result = offset > 0
      ? backlogService.getOlderConversations(offset, limit)
      : backlogService.getRecentConversations(limit)

    res.json(result)
  })

  // ─── Oppdater samtaletittel ────────────────────────────────────────

  app.patch(`${apiPrefix}/conversations/:id/title`, (req, res) => {
    const { title } = req.body || {}
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Tittel er påkrevd' })
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Tittel kan ikke være lengre enn 200 tegn' })
    }

    const result = backlogService.updateConversationTitle(req.params.id, title.trim())
    res.status(result.success ? 200 : 404).json(result)
  })

  // ─── Slett samtale ────────────────────────────────────────────────

  app.delete(`${apiPrefix}/conversations/:id`, (req, res) => {
    const result = backlogService.deleteConversation(req.params.id)
    res.status(result.success ? 200 : 404).json(result)
  })

  // ─── Send melding (BYOK proxy) ────────────────────────────────────

  app.post(`${apiPrefix}/conversations/:id/messages`, async (req, res) => {
    const { content } = req.body || {}
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Melding er påkrevd' })
    }

    if (content.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ error: `Meldingen er for lang (maks ${MAX_INPUT_LENGTH} tegn)` })
    }

    // Sjekk meldingsgrense (reserver plass for AI-svar)
    const preCheck = backlogService.getConversation(req.params.id)
    if (preCheck.success && preCheck.data.messages.length >= MAX_MESSAGES - 1) {
      return res.status(400).json({
        error: `Samtalen har nådd maks antall meldinger (${MAX_MESSAGES}). Opprett en ny samtale.`
      })
    }

    // Sjekk API-nøkkel for aktiv provider
    const activeProvider = getActiveProvider(projectRoot)
    const apiKey = getProviderApiKey(projectRoot, activeProvider)
    if (!apiKey) {
      return res.status(401).json({
        error: 'API-nøkkel ikke konfigurert',
        message: 'Gå til API-innstillinger i monitoren og legg inn din API-nøkkel'
      })
    }

    // Lagre brukerens melding
    const saveResult = backlogService.addMessage(req.params.id, { role: 'user', content })
    if (!saveResult.success) {
      return res.status(400).json(saveResult)
    }

    // Hent samtale med historikk
    const convResult = backlogService.getConversation(req.params.id)
    if (!convResult.success) {
      return res.status(404).json(convResult)
    }

    // Bygg systemprompt
    let systemPrompt
    try {
      systemPrompt = buildSystemPrompt(projectRoot)
    } catch (err) {
      console.warn(`⚠️  buildSystemPrompt feilet: ${err.message}`)
      systemPrompt = 'Du er Kit CCs AI-planlegger. Hjelp brukeren med å planlegge oppgaver.'
    }

    // Kall AI via BYOK
    try {
      const model = getModel(projectRoot)
      const aiResponse = await callAI(activeProvider, apiKey, systemPrompt, convResult.data.messages, model)

      // Lagre AI-svaret
      const aiSaveResult = backlogService.addMessage(req.params.id, { role: 'assistant', content: aiResponse })

      res.json({
        success: true,
        response: aiResponse,
        messageCount: aiSaveResult.success ? aiSaveResult.data.messageCount : saveResult.data.messageCount + 1,
        maxMessages: MAX_MESSAGES,
        ...(aiSaveResult.success ? {} : { warning: 'AI-svaret ble returnert men kunne ikke lagres i samtalehistorikken' })
      })
    } catch (err) {
      // Rull tilbake brukerens melding ved feilet AI-kall (forhindrer desynk)
      const rollbackResult = backlogService.rollbackLastMessage(req.params.id)
      if (!rollbackResult.success) {
        console.warn(`⚠️  Rollback feilet for samtale ${req.params.id}: ${rollbackResult.error}`)
      }

      res.status(502).json({
        success: false,
        error: `AI-kall feilet: ${err.message}`,
        hint: 'Sjekk at API-nøkkelen er gyldig og at du har saldo.'
      })
    }
  })

  console.log(`🤖 AI-chat ruter registrert under ${apiPrefix}/`)
}

// ─── AI-kall (BYOK, multi-provider) ─────────────────────────────────────

/**
 * Kall AI API med brukerens nøkkel — router til riktig provider
 */
async function callAI(provider, apiKey, systemPrompt, messages, model) {
  const caller = AI_CALLERS[provider]
  if (!caller) throw new Error(`Ukjent AI-provider: ${provider}`)
  return caller(apiKey, systemPrompt, messages, model)
}

const AI_CALLERS = {
  async anthropic(apiKey, systemPrompt, messages, model) {
    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content : String(m.content)
    }))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({ model, max_tokens: 4096, system: systemPrompt, messages: formattedMessages }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) { const e = await response.text(); throw new Error(`API-feil (${response.status}): ${e}`) }
      let data; try { data = await response.json() } catch { throw new Error('Ugyldig JSON-svar fra Anthropic') }
      return data.content?.[0]?.text || 'Tomt svar fra AI'
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') throw new Error('AI-kallet tok for lang tid (60s timeout)')
      throw err
    }
  },

  async openai(apiKey, systemPrompt, messages, model) {
    // OpenAI reasoning models (o1, o3, o4) don't support system role
    const isReasoning = /^(o1|o3|o4)/.test(model)
    const formattedMessages = [
      { role: isReasoning ? 'developer' : 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: typeof m.content === 'string' ? m.content : String(m.content)
      }))
    ]

    // Reasoning models use max_completion_tokens instead of max_tokens
    const tokenParam = isReasoning ? { max_completion_tokens: 4096 } : { max_tokens: 4096 }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, ...tokenParam, messages: formattedMessages }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) { const e = await response.text(); throw new Error(`API-feil (${response.status}): ${e}`) }
      let data; try { data = await response.json() } catch { throw new Error('Ugyldig JSON-svar fra OpenAI') }
      return data.choices?.[0]?.message?.content || 'Tomt svar fra AI'
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') throw new Error('AI-kallet tok for lang tid (60s timeout)')
      throw err
    }
  },

  async 'google-gemini'(apiKey, systemPrompt, messages, model) {
    let contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : String(m.content) }]
    }))
    // Gemini krever at første melding er fra user
    if (contents.length > 0 && contents[0].role !== 'user') {
      const firstUserIdx = contents.findIndex(m => m.role === 'user')
      contents = firstUserIdx >= 0 ? contents.slice(firstUserIdx) : []
    }
    if (contents.length === 0) {
      throw new Error('Ingen brukermelding å sende til Gemini')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 4096 }
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) { const e = await response.text(); throw new Error(`API-feil (${response.status}): ${e}`) }
      let data; try { data = await response.json() } catch { throw new Error('Ugyldig JSON-svar fra Gemini') }
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tomt svar fra AI'
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') throw new Error('AI-kallet tok for lang tid (60s timeout)')
      throw err
    }
  },

  async groq(apiKey, systemPrompt, messages, model) {
    // Groq bruker OpenAI-kompatibelt API
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: typeof m.content === 'string' ? m.content : String(m.content)
      }))
    ]

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, max_tokens: 4096, messages: formattedMessages }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) { const e = await response.text(); throw new Error(`API-feil (${response.status}): ${e}`) }
      let data; try { data = await response.json() } catch { throw new Error('Ugyldig JSON-svar fra Groq') }
      return data.choices?.[0]?.message?.content || 'Tomt svar fra AI'
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') throw new Error('AI-kallet tok for lang tid (60s timeout)')
      throw err
    }
  }
}
