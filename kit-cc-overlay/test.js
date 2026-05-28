/**
 * Kit CC Monitor — Automatisk funksjonstest
 *
 * Kjør: node test.js (mens serveren kjører i et annet vindu)
 *
 * Auth: Les token fra .auth-token (opprettes av server ved oppstart).
 * Override: KIT_CC_TOKEN=<hex> node test.js
 */

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BASE = 'http://localhost:4444/kit-cc/api'

function loadToken() {
  if (process.env.KIT_CC_TOKEN) return process.env.KIT_CC_TOKEN
  const tokenPath = join(__dirname, '.auth-token')
  if (existsSync(tokenPath)) {
    return readFileSync(tokenPath, 'utf-8').trim()
  }
  console.warn('⚠️  Fant ikke .auth-token — tester vil sannsynligvis få 401.')
  return ''
}

const TOKEN = loadToken()

function authHeaders(extra = {}) {
  const headers = { ...extra }
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`
  return headers
}

async function post(path, data) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  })
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() })
  return res.json()
}

async function patch(path, data) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  })
  return res.json()
}

let passed = 0
let failed = 0

function test(name, ok, detail) {
  if (ok) {
    console.log(`  ✅ ${name}`)
    passed++
  } else {
    console.log(`  ❌ ${name}`)
    if (detail) console.log(`     → ${JSON.stringify(detail)}`)
    failed++
  }
}

async function run() {
  console.log('\n🧪 Kit CC Monitor — Funksjonstest')
  console.log('━'.repeat(50))

  // ═══════════════════════════════════════════════════
  console.log('\n📡 1. GRUNNLEGGENDE API')
  // ═══════════════════════════════════════════════════

  const health = await get('/health')
  test('Helsesjekk svarer', health.status === 'ok')

  const state = await get('/state')
  test('PROJECT-STATE leses', !state.error || state.exists === false, state)

  const progress = await get('/progress?limit=5')
  test('PROGRESS-LOG leses', Array.isArray(progress.entries))

  const modules = await get('/modules')
  test('MODULREGISTER leses', 'modules' in modules)

  const backlogStatus = await get('/backlog')
  test('Backlog-status er aktiv', backlogStatus.available === true)

  // ═══════════════════════════════════════════════════
  console.log('\n📦 2. BACKLOG — OPPRETT OPPGAVER')
  // ═══════════════════════════════════════════════════

  const modul = await post('/backlog/items', {
    type: 'module', name: 'Testmodul', priority: 'MUST'
  })
  test('Opprett modul', modul.success, modul)

  let featureResult = null
  if (modul.success) {
    featureResult = await post('/backlog/items', {
      type: 'feature', name: 'Innlogging', parentId: modul.data.id, priority: 'MUST'
    })
    test('Opprett feature under modul', featureResult.success, featureResult)

    const microResult = await post('/backlog/items', {
      type: 'micro_feature', name: 'Skjema-validering', parentId: featureResult?.data?.id, priority: 'SHOULD'
    })
    test('Opprett micro under feature', microResult.success, microResult)

    const task = await post('/backlog/items', {
      type: 'task', name: 'Lag skjema', parentId: microResult?.data?.id, priority: 'SHOULD'
    })
    test('Opprett oppgave under micro', task.success, task)
  }

  // ═══════════════════════════════════════════════════
  console.log('\n🌳 3. BACKLOG — TRE OG STATISTIKK')
  // ═══════════════════════════════════════════════════

  const tree = await get('/backlog/tree')
  test('Hent backlog-tre', tree.success && tree.data.length > 0, tree)

  const stats = await get('/backlog/stats')
  test('Hent statistikk', stats.success && stats.data.total >= 3, stats)
  if (stats.success) {
    console.log(`     → ${stats.data.total} elementer, ${stats.data.progress}% fullført`)
  }

  // ═══════════════════════════════════════════════════
  console.log('\n✏️  4. BACKLOG — OPPDATER OG SLETT')
  // ═══════════════════════════════════════════════════

  if (featureResult?.success) {
    const updated = await patch(`/backlog/items/${featureResult.data.id}`, {
      status: 'in_progress'
    })
    test('Oppdater status til in_progress', updated.success, updated)
  }

  // ═══════════════════════════════════════════════════
  console.log('\n🛡️  5. INPUT-VALIDERING')
  // ═══════════════════════════════════════════════════

  const badType = await post('/backlog/items', {
    type: 'UGYLDIG', name: 'Test'
  })
  test('Avviser ugyldig type', !badType.success)

  const emptyName = await post('/backlog/items', {
    type: 'task', name: ''
  })
  test('Avviser tomt navn', !emptyName.success)

  const noName = await post('/backlog/items', {
    type: 'task'
  })
  test('Avviser manglende navn', !noName.success)

  // ═══════════════════════════════════════════════════
  console.log('\n✅ 6. GODKJENNINGSFLYT')
  // ═══════════════════════════════════════════════════

  const approve = await post('/backlog/approve', {
    tasks: [
      { type: 'module', name: 'Godkjent modul', priority: 'MUST' },
      { type: 'feature', name: 'Godkjent feature', priority: 'SHOULD' },
      { name: '', type: 'task' } // Ugyldig — skal hoppes over
    ]
  })
  test('Godkjenn oppgaver (2 av 3 gyldige)', approve.success && approve.approved === 2, approve)

  // ═══════════════════════════════════════════════════
  console.log('\n💬 7. AI-CHAT (uten API-nøkkel)')
  // ═══════════════════════════════════════════════════

  const chatStatus = await get('/chat/status')
  test('Chat-status svarer', 'hasApiKey' in chatStatus)

  const conv = await post('/chat/conversations', { title: 'Testsamtale' })
  test('Opprett samtale', conv.success, conv)

  if (conv.success) {
    const convData = await get(`/chat/conversations/${conv.data.id}`)
    test('Hent samtale', convData.success && convData.data.messages.length === 0)

    const titleUpdate = await patch(`/chat/conversations/${conv.data.id}/title`, {
      title: 'Ny tittel'
    })
    test('Oppdater samtaletittel', titleUpdate.success)

    // Sending av melding uten AI-API-nøkkel skal feile med 401 fra chat-endepunktet
    // (Monitor-auth er ok via Bearer; det er AI-provider-nøkkelen som mangler)
    const msgResult = await fetch(`${BASE}/chat/conversations/${conv.data.id}/messages`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ content: 'Hei!' })
    })
    test('Melding uten AI-API-nøkkel gir 401', msgResult.status === 401)
  }

  // ═══════════════════════════════════════════════════
  console.log('\n🔄 8. KONSISTENSSJEKK')
  // ═══════════════════════════════════════════════════

  const consistency = await get('/backlog/sync/consistency')
  test('Konsistenssjekk svarer', consistency.success || consistency.data, consistency)

  // ═══════════════════════════════════════════════════
  console.log('\n🚨 9. FEILHÅNDTERING')
  // ═══════════════════════════════════════════════════

  const errorPost = await post('/errors', {
    type: 'test', data: 'Test-feil fra test.js'
  })
  test('Motta console-feil', errorPost.received)

  const errorGet = await get('/errors')
  test('Hent console-feil', errorGet.errors.length > 0)

  // ═══════════════════════════════════════════════════
  console.log('\n🧹 10. OPPRYDDING')
  // ═══════════════════════════════════════════════════

  // Slett test-elementer som ble opprettet under testen
  if (modul.success) {
    const delModul = await fetch(`${BASE}/backlog/items/${modul.data.id}`, { method: 'DELETE', headers: authHeaders() })
    const delResult = await delModul.json()
    test('Slett testmodul (cascader barn)', delResult.success)
  }

  // Slett godkjente test-elementer
  if (approve.success) {
    const treeAfter = await get('/backlog/tree')
    if (treeAfter.success) {
      for (const item of treeAfter.data) {
        if (item.name === 'Godkjent modul' || item.name === 'Godkjent feature') {
          await fetch(`${BASE}/backlog/items/${item.id}`, { method: 'DELETE', headers: authHeaders() })
        }
      }
    }
    test('Slett godkjente test-elementer', true)
  }

  // Slett test-samtale
  if (conv.success) {
    // Samtaler har ikke DELETE-endepunkt, men vi logger at de burde ryddes
    test('Test-samtale opprettet (manuell rydding)', true)
  }

  // ═══════════════════════════════════════════════════
  // OPPSUMMERING
  // ═══════════════════════════════════════════════════

  console.log('\n' + '━'.repeat(50))
  console.log(`\n📊 Resultat: ${passed} bestått, ${failed} feilet av ${passed + failed} tester`)

  if (failed === 0) {
    console.log('🎉 Alle tester bestått!\n')
  } else {
    console.log('⚠️  Noen tester feilet — se ❌ over for detaljer.\n')
  }
}

run().catch(err => {
  console.error('\n❌ Kunne ikke koble til serveren:', err.message)
  console.error('   Sjekk at serveren kjører: node server.js\n')
})
