/**
 * Onboarding-modul for Kit CC Monitor (F37)
 *
 * Genererer forslagsbokser for Start-fanen basert på PROJECT-STATE.json.
 * Ingen egne datafelter — leser/skriver same felter som Settings (F41 constraint).
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isGitRepo } from './git-utils.js'

/**
 * Generer liste med onboarding-forslag basert på prosjekttilstand
 * @param {Object} state - PROJECT-STATE.json innhold
 * @param {string} projectRoot - prosjektets rotmappe
 * @returns {Array} forslagsbokser
 */
export function getOnboardingSuggestions(state, projectRoot) {
  const suggestions = []

  // 1. Kommunikasjonsnivå
  const userLevel = state?.classification?.userLevel
  suggestions.push({
    id: 'user-level',
    title: 'Kommunikasjonsnivå',
    description: 'Bestem hvordan AI-en snakker med deg — teknisk, hverdagsspråk eller enkelt.',
    status: userLevel ? 'completed' : 'pending',
    category: 'settings',
    settingsKey: 'classification.userLevel',
    currentValue: userLevel || null,
    currentLabel: userLevel === 'utvikler' ? 'Utvikler' : userLevel === 'erfaren-vibecoder' ? 'Erfaren vibecoder' : userLevel === 'ny-vibecoder' ? 'Ny vibecoder' : null
  })

  // 2. Samarbeidsmodus
  const builderMode = state?.builderMode
  suggestions.push({
    id: 'builder-mode',
    title: 'Samarbeidsmodus',
    description: 'Velg hvor mye kontroll du vil ha over byggeprosessen.',
    status: builderMode ? 'completed' : 'pending',
    category: 'settings',
    settingsKey: 'builderMode',
    currentValue: builderMode || null,
    currentLabel: builderMode === 'ai-bestemmer' ? 'AI bestemmer' : builderMode === 'samarbeid' ? 'Samarbeid' : builderMode === 'detaljstyrt' ? 'Detaljstyrt' : null
  })

  // 3. Bildestrategi
  const imgType = state?.imageStrategy?.type
  const hasImageStrategy = Array.isArray(imgType) ? imgType.length > 0 : (imgType && imgType !== 'none')
  suggestions.push({
    id: 'image-strategy',
    title: 'Bildestrategi',
    description: 'Velg hvordan appen din skal håndtere bilder — AI-genererte, egne eller ingen.',
    status: hasImageStrategy ? 'completed' : 'pending',
    category: 'settings',
    settingsKey: 'imageStrategy.type',
    currentValue: imgType || null,
    currentLabel: hasImageStrategy ? (Array.isArray(imgType) ? imgType.join(', ') : imgType) : null
  })

  // 4. Git-oppsett
  const gitAvailable = isGitRepo(projectRoot)
  suggestions.push({
    id: 'git-setup',
    title: 'Git-oppsett',
    description: gitAvailable
      ? 'Git er satt opp. Du kan lagre og gjenopprette prosjektet ditt.'
      : 'Sett opp Git for versjonskontroll, lagringspunkter og gjenoppretting.',
    status: gitAvailable ? 'completed' : 'pending',
    category: 'setup',
    settingsKey: null
  })

  // 5. AI API-nøkkel (sjekk om chat fungerer)
  let apiKeyStatus = 'pending'
  try {
    const configPath = join(projectRoot, '.ai', 'config.json')
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))
      // ai-chat.js lagrer API-nøkler under config.aiChat.providers[*].apiKey
      const providers = config?.aiChat?.providers || {}
      const hasKey = Object.values(providers).some(p => p?.apiKey)
      if (hasKey || config.apiKey || config.provider) apiKeyStatus = 'completed'
    }
  } catch {}
  suggestions.push({
    id: 'api-key',
    title: 'AI API-nøkkel',
    description: apiKeyStatus === 'completed'
      ? 'API-nøkkel er konfigurert. AI-chat fungerer.'
      : 'Koble til en AI-tjeneste for chat og forklaringer i Monitor.',
    status: apiKeyStatus,
    category: 'setup',
    settingsKey: null
  })

  // 6. Database (kun hvis integrations.detected har database)
  const detected = state?.integrations?.detected || []
  const confirmedIntegrations = state?.integrations?.confirmed || []
  const hasDatabase = detected.includes('database') || confirmedIntegrations.some(i => {
    const id = typeof i === 'string' ? i : (i?.id || i?.name || '')
    return ['supabase', 'neon', 'turso', 'mongodb', 'postgres'].some(db => id.toLowerCase().includes(db))
  })
  if (hasDatabase || state?.currentPhase >= 3) {
    const dbSetup = state?.integrations?.setup?.some(s => s.category === 'database')
    suggestions.push({
      id: 'database',
      title: 'Database',
      description: dbSetup
        ? 'Database-integrasjon er lagt til i byggelisten.'
        : 'Velg og sett opp database for appen din.',
      status: dbSetup ? 'completed' : 'pending',
      category: 'integrations',
      settingsKey: null
    })
  }

  // 7. Hosting (låst til fase 7)
  const currentPhase = state?.currentPhase || 1
  const setup = state?.integrations?.setup || []
  const hostingSetup = setup.some(s => s.category === 'hosting')
  suggestions.push({
    id: 'hosting',
    title: 'Hosting',
    description: hostingSetup
      ? 'Hosting er satt opp.'
      : 'Publiser appen din på internett.',
    status: hostingSetup ? 'completed' : (currentPhase >= 7 ? 'pending' : 'locked'),
    category: 'integrations',
    settingsKey: null,
    lockedReason: 'Tilgjengelig i fase 7 (Publiser og vedlikehold)'
  })

  // 8. CI/CD (låst til fase 6)
  const cicdSetup = setup.some(s => s.category === 'ci-cd' || s.category === 'cicd')
  suggestions.push({
    id: 'ci-cd',
    title: 'CI/CD',
    description: cicdSetup
      ? 'CI/CD er satt opp.'
      : 'Automatisk testing og deploy ved kodeendringer.',
    status: cicdSetup ? 'completed' : (currentPhase >= 6 ? 'pending' : 'locked'),
    category: 'integrations',
    settingsKey: null,
    lockedReason: 'Tilgjengelig i fase 6 (Test og kvalitetssjekk)'
  })

  return suggestions
}
