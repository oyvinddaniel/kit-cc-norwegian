/**
 * Kit CC Monitor
 *
 * Custom Element med Closed Shadow DOM for full CSS-isolasjon.
 * Injiseres i brukerens app via proxy, eller kjøres standalone.
 *
 * To moduser:
 *   1. Ikon (minimert) — floating knapp nede til høyre
 *   2. Fullskjerm (90%) — klikk på ikon
 *
 * Tastatursnarvei: Cmd+. / Ctrl+. for toggle
 */

;(function() {
  'use strict'

  // Ikke kjør hvis allerede initialisert
  if (customElements.get('kit-cc-overlay')) return

  const API_BASE = '/kit-cc/api'
  const FULLSCREEN_PERCENT = 90

  /**
   * Hjelpefunksjon for autentiserte fetch-kall.
   * Auth skjer via httpOnly cookie (satt av server ved HTML-levering).
   * credentials: 'same-origin' sikrer at cookie sendes med.
   */
  function authFetch(url, options = {}) {
    return fetch(url, { ...options, credentials: 'same-origin' })
  }

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

  // ─── SVG Icons (replaces all emojis) ──────────────────────
  const ICONS = {
    // Status
    'circle-check': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 110 14A7 7 0 018 1zm3.2 4.8a.6.6 0 00-.85-.85L7.2 8.1 5.65 6.55a.6.6 0 10-.85.85l2.1 2.1a.6.6 0 00.85 0l3.45-3.7z" fill="currentColor"/></svg>',
    'clock': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'forward-step': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M4 3l5.5 5L4 13V3z" fill="currentColor"/><path d="M11 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'lock': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="7" rx="1.5" fill="currentColor"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>',
    'clipboard-list': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 1.5h4a1 1 0 011 1V3H5v-.5a1 1 0 011-1z" fill="currentColor"/><path d="M5.5 6.5h5M5.5 9h5M5.5 11.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>',
    'clipboard-check': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 1.5h4a1 1 0 011 1V3H5v-.5a1 1 0 011-1z" fill="currentColor"/><path d="M5.5 8.5l2 2 3.5-3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'circle-minus': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/><path d="M5 8h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',

    // Zones
    'circle-green': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="#22c55e"/></svg>',
    'circle-yellow': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="#eab308"/></svg>',
    'circle-red': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="#ef4444"/></svg>',

    // Data panels
    'activity': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M1.5 8h3l1.5-4 3 8 1.5-4h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'decisions': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/><path d="M8 2v6l4 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></svg>',
    'errors': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M3 10.5l2-2m0 0l2.5 2.5M5 8.5L7 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="11" cy="6" r="3.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 13h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    'session': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="6.5" y="5" width="4" height="8" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="11.5" y="1" width="3" height="12" rx="1" stroke="currentColor" stroke-width="1.1"/></svg>',
    'quality': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'modules': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.1"/></svg>',
    'risks': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1.5 13.5h13L8 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 6v3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="11.5" r=".8" fill="currentColor"/></svg>',
    'checkpoints': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M3 2v12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M3 3h8a1 1 0 011 1v3a1 1 0 01-1 1H3" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
    'integrations': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="2.5" stroke="currentColor" stroke-width="1.1"/><circle cx="12" cy="8" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 8h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    'deliverables': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M2.5 4.5L8 1.5l5.5 3v7L8 14.5l-5.5-3v-7z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M2.5 4.5L8 7.5l5.5-3M8 7.5V14.5" stroke="currentColor" stroke-width="1.1"/></svg>',
    'metrics': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M2 13l4-5 3 2 5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'dependencies': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.1"/><circle cx="12" cy="4" r="2" stroke="currentColor" stroke-width="1.1"/><circle cx="8" cy="12" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M5.5 5.5L7 10.5M10.5 5.5L9 10.5" stroke="currentColor" stroke-width="1"/></svg>',
    'scope': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M5 3l6 5-6 5V3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/><path d="M2 8h2M12 8h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    'autonomy': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.1"/><path d="M4 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M6.5 4.5l1 1 2-2" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',

    // Section icons
    'security': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
    'shield': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2.5 4v4c0 3.3 2.3 5.7 5.5 6.5 3.2-.8 5.5-3.2 5.5-6.5V4L8 1.5z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
    'test-tube': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M6 2h4M7 2v7l-3 5h8l-3-5V2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'building': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3" width="11" height="11" rx="1" stroke="currentColor" stroke-width="1.1"/><path d="M5.5 6h2M8.5 6h2M5.5 9h2M8.5 9h2M6.5 12v2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>',
    'chart': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="2" y="9" width="3" height="5" rx=".5" fill="currentColor"/><rect x="6.5" y="5" width="3" height="9" rx=".5" fill="currentColor"/><rect x="11" y="2" width="3" height="12" rx=".5" fill="currentColor"/></svg>',
    'requirement': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>',
    'bolt': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M9 1.5L4 9h4l-1 5.5L12 7H8l1-5.5z" fill="currentColor"/></svg>',
    'database': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" stroke-width="1.1"/><path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4" stroke="currentColor" stroke-width="1.1"/><path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" stroke="currentColor" stroke-width="1.1"/></svg>',
    'plug': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M5 2v4M11 2v4M4 6h8a1 1 0 011 1v2a4 4 0 01-4 4h0a4 4 0 01-4-4V7a1 1 0 011-1zM8 13v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    'palette': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A6.5 6.5 0 001.5 8c0 2 1.8 2.5 3 2.5s1.5.7 1.5 1.5c0 1.5 1 2.5 2 2.5A6.5 6.5 0 008 1.5z" stroke="currentColor" stroke-width="1.1"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor"/><circle cx="8" cy="4" r="1" fill="currentColor"/><circle cx="10.5" cy="5.5" r="1" fill="currentColor"/><circle cx="11" cy="8" r="1" fill="currentColor"/></svg>',
    'rocket': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M8 1.5c-2 2-3.5 5-3.5 8h7c0-3-1.5-6-3.5-8z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><circle cx="8" cy="7" r="1.2" stroke="currentColor" stroke-width="1"/><path d="M4.5 9.5L2 12M11.5 9.5L14 12M6 13h4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>',
    'arrow-right': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'file': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M4 2h5.5L13 5.5V13a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.1"/><path d="M9 2v4h4" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>',

    // UI
    'lightbulb': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M6 12h4M6.5 14h3M8 1.5A4.5 4.5 0 003.5 6c0 1.7 1 3 2 3.8V11h5V9.8c1-.8 2-2.1 2-3.8A4.5 4.5 0 008 1.5z" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'gear': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="currentColor"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/></svg>',
    'x-mark': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'triangle-exclamation': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1.5 13.5h13L8 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 6v3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="11.5" r=".8" fill="currentColor"/></svg>',
    'chat-bubble': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M2.5 2.5h11a1 1 0 011 1v7a1 1 0 01-1 1h-6l-3 2.5v-2.5h-2a1 1 0 01-1-1v-7a1 1 0 011-1z" stroke="currentColor" stroke-width="1.1"/></svg>',
    'key': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="6.5" r="3" stroke="currentColor" stroke-width="1.1"/><path d="M8 8l5 5M11 11l2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    'wifi-slash': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M1 5c2-2 4.4-3 7-3s5 1 7 3M3.5 8c1.3-1.3 3-2 4.5-2s3.2.7 4.5 2M6 11c.6-.6 1.3-1 2-1s1.4.4 2 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/><path d="M2 2l12 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    'hammer': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M10 2L6.5 5.5 3 9l1.5 1.5 3.5-3.5L11.5 3.5 10 2z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M3.5 10l-1.5 4 4-1.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 2l3 1-2 2 1 1 2-2 1 3-4 0-1-1" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>',
    'dashboard': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="6" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="9" y="1.5" width="5.5" height="3.5" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="1.5" y="9.5" width="5.5" height="3.5" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="9" y="7" width="5.5" height="6" rx="1" stroke="currentColor" stroke-width="1.1"/></svg>',
    'check': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'sun': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.2"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.75 3.75l1.06 1.06M11.19 11.19l1.06 1.06M3.75 12.25l1.06-1.06M11.19 4.81l1.06-1.06" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>',
    'moon': '<svg width="SIZE" height="SIZE" viewBox="0 0 16 16" fill="none"><path d="M13.5 9.5a5.5 5.5 0 01-7-7 5.5 5.5 0 107 7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }

  function icon(name, size) {
    size = size || 16
    const svg = ICONS[name]
    if (!svg) return ''
    return svg.replace(/SIZE/g, size)
  }

  class KitCCOverlay extends HTMLElement {
    constructor() {
      super()
      this.shadow = this.attachShadow({ mode: 'closed' })
      // Les CSP nonce fra eksisterende <style> eller <script> på siden
      this._nonce = document.querySelector('style[nonce]')?.nonce
        || document.querySelector('script[nonce]')?.nonce
        || ''
      this.mode = 'icon' // 'icon' | 'fullscreen'
      this._prevMode = 'icon'
      this.state = null
      this.progress = { entries: [], totalLines: 0 }
      this.errors = { errors: [], total: 0 }
      this.modules = { modules: [], found: false }
      this.currentTab = 'modules'
      this._errorFilter = null
      // Expand/collapse state
      this.expandedModules = new Set()
      this.expandedPhases = new Set()
      // View state
      this.currentView = 'dashboard'  // 'dashboard' | null (null = tab view)
      // Phase detail view
      this.selectedPhase = null  // null = normal tab view, number = phase detail
      this.phaseDetail = null    // cached phase detail data
      this.phaseDetailLoading = false
      this.phaseDetailCache = new Map()  // cache per phase number
      // Phase tasks (F27)
      this.phaseTasks = null        // oppgavekatalog for valgt fase
      this.phaseTasksLoading = false
      this.phaseTasksCache = new Map()
      this.expandedTasks = new Set() // ekspanderte oppgave-IDer
      this.phaseTasksView = 'tasks' // 'summary' | 'tasks' — hva som vises i fasedetaljvisningen
      // AI description cache and loading state
      this.descriptions = new Map()
      this.loadingDescriptions = new Set()
      // Backlog state
      this.backlogTree = []
      this.backlogStats = null
      this.backlogLoaded = false
      // AI Chat state
      this.chatStatus = null
      this.chatConversations = []
      this.activeConversation = null
      this.chatLoading = false
      this.chatSending = false
      this.chatError = null
      // Settings state (multi-provider)
      this.showApiKeyGuide = false  // Viser API-nøkkel-guide i chat-området
      this.showSettings = false
      this.showHowItWorks = false    // "Slik fungerer det"-popup
      this.expandedProvider = null   // Hvilken provider som er åpnet i settings
      this.expandedIntegrations = new Set() // Åpnede detaljer i integrasjonskatalogen
      this.providerModels = {}       // { providerId: [models] }
      this.availableModels = []      // Bakoverkompatibilitet
      this.modelsLoading = false
      this.modelsLoadingProvider = null
      this.savedProvider = null  // Flash "Lagret!" etter lagring
      // Tree expand/collapse
      this.expandedTreeItems = new Set()
      // Settings state (F30)
      this.settingsData = null
      this.settingsLoaded = false
      this.settingsSaving = null // field being saved
      // Module filter (user vs system)
      this.showSystemModules = false
      // Data panels state (F32)
      this.dataPanelList = null
      this.dataPanelData = null
      this.dataPanelActive = null // currently selected panel id
      this.dataPanelLoading = false
      // Integrations tab (promoted from data panel)
      this.integrationsData = null
      this.integrationsLoading = false
      // Checkpoints tab (promoted from data panel)
      this.checkpointsData = null
      this.checkpointsLoading = false
      this.checkpointConfirm = null // checkpoint awaiting confirmation
      // Onboarding state (F37)
      this.onboardingData = null
      this.onboardingLoading = false
      this.onboardingPending = 0
      // Theme
      this.theme = localStorage.getItem('kit-cc-theme') || 'dark'
      // SSE + cleanup refs
      this._eventSource = null
      this._sseRetryCount = 0
      this._sseRetryTimer = null
      this._sseMaxRetries = 10
      this._sseConnectionFailed = false
      this._keydownHandler = null
    }

    connectedCallback() {
      this._loadDOMPurify()
      this.render()
      this.fetchData()
      this.connectSSE()
      this.setupKeyboardShortcut()
    }

    _loadDOMPurify() {
      if (window.DOMPurify) return
      const s = document.createElement('script')
      s.src = '/kit-cc/assets/vendor/purify.min.js'
      document.head.appendChild(s)
    }

    disconnectedCallback() {
      // Rydd opp SSE
      if (this._eventSource) {
        this._eventSource.close()
        this._eventSource = null
      }
      // Rydd opp SSE retry-timer
      if (this._sseRetryTimer) {
        clearTimeout(this._sseRetryTimer)
        this._sseRetryTimer = null
      }
      // Rydd opp keyboard listener
      if (this._keydownHandler) {
        document.removeEventListener('keydown', this._keydownHandler)
        this._keydownHandler = null
      }
    }

    // ─── Rendering ──────────────────────────────────────

    render() {
      try {
        // Bevar scroll-posisjon
        const contentEl = this.shadow.getElementById('panel-content')
        const scrollTop = contentEl ? contentEl.scrollTop : 0

        const newContent = `
            ${this.renderIcon()}
            ${this.mode !== 'icon' ? this.renderPanel() : ''}
        `

        // Hold <style> og container persistent — unngå blink ved full innerHTML-swap
        let container = this.shadow.querySelector('.kit-cc-container')
        if (!container) {
          // Første render: opprett struktur
          const nonceAttr = this._nonce ? ` nonce="${this._nonce}"` : ''
          this.shadow.innerHTML = `
            <style${nonceAttr}>${this.getStyles()}</style>
            <div class="kit-cc-container" data-mode="${this.mode}"></div>
          `
          container = this.shadow.querySelector('.kit-cc-container')
        }

        // Oppdater mode-attributt
        container.dataset.mode = this.mode

        // Bygg nytt innhold i en midlertidig node og swap atomisk
        const frag = document.createDocumentFragment()
        const temp = document.createElement('div')
        temp.innerHTML = newContent
        while (temp.firstChild) {
          frag.appendChild(temp.firstChild)
        }
        container.replaceChildren(frag)

        // Animér panel kun ved åpning (ikon → fullscreen), ikke ved innholds-oppdatering
        const panel = container.querySelector('.kit-cc-panel')
        if (panel && this._prevMode === 'icon' && this.mode !== 'icon') {
          panel.classList.add('panel-opening')
          panel.addEventListener('animationend', () => panel.classList.remove('panel-opening'), { once: true })
        }
        this._prevMode = this.mode

        this.attachEvents()

        // Gjenopprett scroll-posisjon
        const newContentEl = this.shadow.getElementById('panel-content')
        if (newContentEl && scrollTop > 0) {
          newContentEl.scrollTop = scrollTop
        }
      } catch (err) {
        console.error('Kit CC Monitor render-feil:', err)
        const nonceAttr = this._nonce ? ` nonce="${this._nonce}"` : ''
        this.shadow.innerHTML = `
          <style${nonceAttr}>${this.getStyles()}</style>
          <div class="kit-cc-container">
            <div class="kit-cc-fab" id="fab"><span class="fab-text">KC</span></div>
          </div>
        `
      }
    }

    renderIcon() {
      const hasErrors = this.errors.errors?.length > 0
      return `
        <div class="kit-cc-fab" id="fab">
          <span class="fab-text">KC</span>
          ${hasErrors ? '<span class="fab-badge"></span>' : ''}
        </div>
      `
    }

    renderPanel() {
      const currentPhase = this.state?.currentPhase || 0
      const completedPhases = Math.max(0, currentPhase - 1)
      const moduleCount = this.modules.modules?.length || 0
      const errorCount = this.errors.total || 0

      // Feilmelding hvis tilkobling er mislykket
      const connectionError = this._sseConnectionFailed ? `
        <div class="connection-error">
          <div class="error-content">
            ${icon('wifi-slash')} Kan ikke koble til Monitor-serveren.<br/>
            <small>Sjekk at serveren kjører på http://localhost:${this.extractPort()}</small>
            <button class="retry-btn" id="btn-retry-sse">Prøv igjen</button>
          </div>
        </div>
      ` : ''

      return `
        <div class="kit-cc-panel ${this.theme === 'light' ? 'light-theme' : ''}">
          ${connectionError}
          <div class="panel-header">
            <div class="header-left">
              <span class="logo">Kit CC Monitor</span>
              <span class="project-name">${this.state?.projectName ? '— ' + this.esc(this.state.projectName) : ''}</span>
            </div>
            <div class="panel-actions">
              <span class="status-badge ${this._sseConnectionFailed ? 'disconnected' : errorCount > 0 ? 'has-errors' : ''}">${this._sseConnectionFailed ? 'Frakoblet' : errorCount > 0 ? errorCount + ' feil' : 'Tilkoblet'}</span>
              <button class="panel-btn" id="btn-how-it-works" title="Slik fungerer det">${icon('lightbulb', 16)}</button>
              <button class="panel-btn settings-icon-btn" id="btn-open-settings" title="Innstillinger">${icon('gear', 16)}</button>
              <button class="panel-btn theme-toggle" id="btn-theme" title="${this.theme === 'dark' ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}">${this.theme === 'dark' ? icon('sun', 16) : icon('moon', 16)}</button>
              <button class="panel-btn" id="btn-close" title="Lukk">${icon('x-mark')}</button>
            </div>
          </div>

          <div class="panel-nav">
            <button class="nav-item ${this.currentView === 'dashboard' && !this.selectedPhase ? 'active' : ''}" data-view="dashboard" style="--tab-color:#B07AFF">
              <span class="tab-icon">${icon('dashboard', 14)}</span>Dashboard
            </button>
            <button class="nav-item ${this.currentView !== 'dashboard' && this.currentTab === 'start' ? 'active' : ''}" data-tab="start" style="--tab-color:#10B981">
              <span class="tab-icon">${icon('rocket', 14)}</span>Start${this.onboardingPending > 0 ? `<span class="tab-badge">${this.onboardingPending}</span>` : ''}
            </button>
            <span class="nav-separator"></span>
            <button class="nav-item ${this.currentView !== 'dashboard' && this.currentTab === 'backlog' ? 'active' : ''}" data-tab="backlog" style="--tab-color:#8A00FF">
              <span class="tab-icon">${icon('clipboard-list', 14)}</span>Legg til nye funksjoner
            </button>
            <button class="nav-item ${this.currentView !== 'dashboard' && this.currentTab === 'modules' ? 'active' : ''}" data-tab="modules" style="--tab-color:#3B82F6">
              <span class="tab-icon">${icon('modules', 14)}</span>Funksjoner
            </button>
            <button class="nav-item ${this.currentView !== 'dashboard' && this.currentTab === 'integrations' ? 'active' : ''}" data-tab="integrations" style="--tab-color:#06B6D4">
              <span class="tab-icon">${icon('plug', 14)}</span>Integrasjoner
            </button>
            <button class="nav-item ${this.currentView !== 'dashboard' && this.currentTab === 'errors' ? 'active' : ''}" data-tab="errors" style="--tab-color:#EF4444">
              <span class="tab-icon">${icon('triangle-exclamation', 14)}</span>Feil
            </button>
            <button class="nav-item ${this.currentView !== 'dashboard' && this.currentTab === 'data' ? 'active' : ''}" data-tab="data" style="--tab-color:#F59E0B">
              <span class="tab-icon">${icon('chart', 14)}</span>Innsikt
            </button>
            <button class="nav-item ${this.currentView !== 'dashboard' && this.currentTab === 'checkpoints' ? 'active' : ''}" data-tab="checkpoints" style="--tab-color:#22C55E">
              <span class="tab-icon">${icon('checkpoints', 14)}</span>Lagre & Gjenopprett
            </button>
          </div>

          <div class="panel-main">
            <div class="panel-sidebar">
              <div class="sidebar-title">Faser</div>
              ${Array.from({ length: 7 }, (_, i) => {
                const num = i + 1
                const status = num < currentPhase ? 'completed' : num === currentPhase ? 'active' : 'pending'
                const phaseIcon = status === 'completed' ? icon('circle-check', 12) : status === 'active' ? icon('arrow-right', 12) : '<span style="color:#71717A">·</span>'
                const selected = this.selectedPhase === num ? 'selected' : ''
                return `
                  <div class="phase-item ${status} ${selected} clickable" data-phase-num="${num}">
                    <div class="phase-icon-circle ${status}">${phaseIcon}</div>
                    <div class="phase-label ${status}">${num}. ${PHASE_NAMES[num]}</div>
                    <div class="phase-arrow">${this.selectedPhase === num ? '‹' : '›'}</div>
                  </div>
                `
              }).join('')}
            </div>

            <div class="panel-right">
              ${this.selectedPhase ? this.renderPhaseDetail() : `
              <div class="panel-content" id="panel-content">
                ${this.renderTabContent()}
              </div>
              `}
            </div>
          </div>
          ${this.showSettings ? this.renderSettingsPanel() : ''}
          ${this.showHowItWorks ? this.renderHowItWorks() : ''}
        </div>
      `
    }

    renderTabContent() {
      if (this.currentView === 'dashboard') return this.renderDashboardView()
      switch (this.currentTab) {
        case 'start': return this.renderStartTab()
        case 'modules': return this.renderModulesTab()
        case 'backlog': return this.renderBacklogTab()
        case 'integrations': return this.renderIntegrationsTab()
        case 'errors': return this.renderErrorsTab()
        case 'data': return this.renderDataTab()
        case 'checkpoints': return this.renderCheckpointsTab()
        default: return ''
      }
    }

    // ─── Dashboard View ──────────────────────────────────
    renderDashboardView() {
      if (!this.settingsLoaded) {
        this.fetchSettingsData()
      }

      const currentPhase = this.state?.currentPhase || 0
      const completedPhases = Math.max(0, currentPhase - 1)
      const moduleCount = this.modules.modules?.length || 0
      const errorCount = this.errors.total || 0

      // Prosjektinformasjon (read-only)
      const readonlyItems = []
      readonlyItems.push({ label: 'Faser fullført', value: `${completedPhases} av 7`, hint: 'Prosjektet går gjennom 7 faser: fra idé til ferdig produkt.' })
      readonlyItems.push({ label: 'Funksjoner', value: String(moduleCount), hint: 'Antall funksjoner/komponenter som bygges i appen.' })
      readonlyItems.push({ label: 'Feil', value: String(errorCount), hint: 'Feil som har oppstått under bygging.' })

      if (this.settingsData?.readonly) {
        for (const [key, field] of Object.entries(this.settingsData.readonly)) {
          readonlyItems.push({ label: field.label, value: field.display, hint: field.hint })
        }
      }

      const readonlyHtml = readonlyItems.map(item => `
        <div class="st-info-card">
          <div class="st-info-label">${this.esc(item.label)}</div>
          <div class="st-info-value">${this.esc(item.value)}</div>
          ${item.hint ? `<div class="st-info-hint">${this.esc(item.hint)}</div>` : ''}
        </div>
      `).join('')

      // Editable settings
      let editableHtml = ''
      if (this.settingsData?.editable) {
        for (const [key, field] of Object.entries(this.settingsData.editable)) {
          if (key === 'overlayMode') continue // Monitor-modus skjules fra dashboard
          const fieldPath = field.path || key
          const isSaving = this.settingsSaving === fieldPath
          let control = ''

          if (field.type === 'text') {
            control = `<input type="text" class="st-input" data-st-field="${this.esc(fieldPath)}" value="${this.esc(field.value)}" ${isSaving ? 'disabled' : ''} />`
          } else if (field.type === 'multiselect') {
            const selectedValues = Array.isArray(field.value) ? field.value : []
            const checks = field.options.map(o => {
              const checked = selectedValues.includes(o.value)
              return `
                <label class="st-check-label">
                  <input type="checkbox" class="st-checkbox" data-st-multi="${this.esc(fieldPath)}" value="${this.esc(o.value)}" ${checked ? 'checked' : ''} ${isSaving ? 'disabled' : ''} />
                  <div class="st-check-content">
                    <span class="st-check-text">${this.esc(o.label)}</span>
                    ${o.desc ? `<span class="st-check-desc">${this.esc(o.desc)}</span>` : ''}
                  </div>
                </label>`
            }).join('')
            control = `<div class="st-multiselect" data-st-field="${this.esc(fieldPath)}">${checks}</div>`
            if (selectedValues.length === 0) {
              control += `<div class="st-option-desc">Ingen bilder — appen bruker kun tekst og ikoner.</div>`
            }
            if (selectedValues.includes('replicate') && field.modelOptions) {
              const modelOpts = field.modelOptions.map(o =>
                `<option value="${this.esc(o.value)}" ${o.value === field.replicateModel ? 'selected' : ''}>${this.esc(o.label)} — ${this.esc(o.desc)}</option>`
              ).join('')
              control += `<div class="st-model-select-wrap"><label class="st-model-label">Bildemodell:</label><select class="st-select st-model-select" data-st-field="imageStrategy.replicateModel">${modelOpts}</select></div>`
            } else if (field.activeModel && selectedValues.includes('replicate')) {
              control += `<div class="st-model-info">Bildemodell: ${this.esc(field.activeModel)}</div>`
            }
          } else if (field.type === 'select') {
            const opts = field.options.map(o =>
              `<option value="${this.esc(o.value)}" ${o.value === field.value ? 'selected' : ''}>${this.esc(o.label)}</option>`
            ).join('')
            control = `<select class="st-select" data-st-field="${this.esc(fieldPath)}" ${isSaving ? 'disabled' : ''}>${opts}</select>`
            const selected = field.options.find(o => o.value === field.value)
            if (selected?.desc) {
              control += `<div class="st-option-desc">${this.esc(selected.desc)}</div>`
            }
          }

          // Improved subtitles
          let subtitle = field.hint
          if (key === 'builderMode' || fieldPath === 'builderMode') {
            subtitle = 'Hvordan ønsker du å bygge med AI?'
          } else if (key === 'userLevel' || fieldPath === 'classification.userLevel') {
            subtitle = 'Hvor teknisk ønsker du at AI skal prate til deg?'
          }

          editableHtml += `
            <div class="st-field">
              <div class="st-field-header">
                <label class="st-label">${this.esc(field.label)}</label>
                ${isSaving ? '<span class="st-saving">Lagrer...</span>' : ''}
              </div>
              <div class="st-hint">${this.esc(subtitle)}</div>
              ${control}
            </div>
          `
        }
      }

      // Gate-unntak
      const gateOverrides = this.settingsData?.gateOverrides || []
      let gateHtml = ''
      if (gateOverrides.length > 0) {
        const items = gateOverrides.map(g =>
          `<div class="st-gate-item"><span class="st-gate-phase">Fase ${g.phase || '?'}</span><span class="st-gate-reason">${this.esc(g.reason || 'Ingen begrunnelse')}</span></div>`
        ).join('')
        gateHtml = `
          <div class="dash-section">
            <div class="dash-section-title">${icon('triangle-exclamation')} Gate-unntak (${gateOverrides.length})</div>
            <div class="st-hint" style="margin-bottom:8px">Faser der kvalitetskrav ble overstyrt.</div>
            ${items}
          </div>
        `
      }

      return `
        <div class="dash-container" id="panel-content">
          <div class="dash-header">
            <div class="dash-title">${icon('dashboard', 20)} Dashboard</div>
          </div>

          ${editableHtml ? `
          <div class="dash-section">
            <div class="dash-section-title">${icon('gear')} Innstillinger</div>
            <div class="st-fields-grid">
              ${editableHtml}
            </div>
          </div>
          ` : ''}

          <div class="dash-section">
            <div class="dash-section-title">Prosjektinformasjon</div>
            <div class="st-info-grid">
              ${readonlyHtml}
            </div>
          </div>

          ${gateHtml}
        </div>
      `
    }

    // ─── Fase-detaljvisning ──────────────────────────────

    renderPhaseDetail() {
      if (this.phaseDetailLoading) {
        return `
          <div class="phase-detail">
            <div class="phase-detail-header">
              <button class="back-btn" id="btn-back-phases">← Tilbake</button>
            </div>
            <div class="phase-detail-loading">
              <div class="loading-spinner"></div>
              <span>Laster faseoppsummering…</span>
            </div>
          </div>
        `
      }

      if (!this.phaseDetail) {
        return `
          <div class="phase-detail">
            <div class="phase-detail-header">
              <button class="back-btn" id="btn-back-phases">← Tilbake</button>
            </div>
            <div class="empty">Kunne ikke laste faseoppsummering</div>
          </div>
        `
      }

      const d = this.phaseDetail
      const statusText = d.status === 'completed' ? 'Fullført' : d.status === 'active' ? 'Pågår' : 'Ikke startet'
      const statusClass = d.status

      // Tidsinformasjon
      let timeInfo = ''
      if (d.startedAt) {
        const started = new Date(d.startedAt)
        const startStr = started.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' })
        timeInfo += `<span class="phase-time-item">Startet: ${startStr}</span>`
      }
      if (d.completedAt) {
        const completed = new Date(d.completedAt)
        const complStr = completed.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' })
        timeInfo += `<span class="phase-time-item">Fullført: ${complStr}</span>`
      }
      if (d.gatesPassed) {
        timeInfo += '<span class="phase-gate-badge">✓ Gate godkjent</span>'
      }

      // Fullførte oppgaver
      let stepsSection = ''
      if (d.completedSteps && d.completedSteps.length > 0) {
        const stepsHtml = d.completedSteps.map(step => {
          const text = typeof step === 'string' ? step : (step.description || step.id || JSON.stringify(step))
          return `<div class="phase-step-item done"><span class="phase-step-check">✓</span><span>${this.esc(text)}</span></div>`
        }).join('')
        stepsSection = `
          <div class="phase-detail-section">
            <div class="phase-section-title">Fullførte oppgaver (${d.completedSteps.length})</div>
            <div class="phase-steps-list">${stepsHtml}</div>
          </div>
        `
      }

      // Hoppede oppgaver
      let skippedSection = ''
      if (d.skippedSteps && d.skippedSteps.length > 0) {
        const skippedHtml = d.skippedSteps.map(step => {
          const text = typeof step === 'string' ? step : (step.description || step.id || JSON.stringify(step))
          return `<div class="phase-step-item skipped"><span class="phase-step-check">–</span><span>${this.esc(text)}</span></div>`
        }).join('')
        skippedSection = `
          <div class="phase-detail-section">
            <div class="phase-section-title">Hoppet over</div>
            <div class="phase-steps-list">${skippedHtml}</div>
          </div>
        `
      }

      // Innhold fra FASE-N-KOMPLETT.md (rik oppsummering)
      let docSections = ''
      if (d.completionDoc && d.completionDoc.length > 0) {
        docSections = d.completionDoc.map(section => {
          const itemsHtml = section.items.map(item => {
            if (item.type === 'task') {
              return `<div class="phase-doc-item ${item.done ? 'done' : ''}">
                <span class="phase-doc-check">${item.done ? '✓' : '○'}</span>
                <span>${this.esc(item.text)}</span>
              </div>`
            }
            if (item.type === 'bullet') {
              return `<div class="phase-doc-item bullet"><span class="phase-doc-bullet">•</span><span>${this.esc(item.text)}</span></div>`
            }
            return `<div class="phase-doc-text">${this.esc(item.text)}</div>`
          }).join('')

          // Velg ikon basert på seksjonstitel
          const icon = this.getSectionIcon(section.title)

          return `
            <div class="phase-detail-section">
              <div class="phase-section-title">${icon} ${this.esc(section.title)}</div>
              ${itemsHtml}
            </div>
          `
        }).join('')
      }

      // Logg-oppføringer for fasen
      let logSection = ''
      if (d.logEntries && d.logEntries.length > 0) {
        const logHtml = d.logEntries.slice(-20).reverse().map(e => {
          return `<div class="phase-log-entry">
            <span class="log-icon">${this.esc(e.icon || '')}</span>
            <span class="log-text">${this.esc(e.description || e.raw || '')}</span>
          </div>`
        }).join('')
        logSection = `
          <div class="phase-detail-section">
            <div class="phase-section-title">${icon('clipboard-list')} Hendelseslogg (siste ${Math.min(d.logEntries.length, 20)})</div>
            <div class="phase-log-list">${logHtml}</div>
          </div>
        `
      }

      return `
        <div class="phase-detail">
          <div class="phase-detail-header">
            <button class="back-btn" id="btn-back-phases">← Tilbake</button>
            <div class="pt-view-tabs">
              <button class="pt-view-tab ${this.phaseTasksView === 'tasks' ? 'active' : ''}" data-pt-view="tasks">Oppgaver</button>
              <button class="pt-view-tab ${this.phaseTasksView === 'summary' ? 'active' : ''}" data-pt-view="summary">Oppsummering</button>
            </div>
          </div>

          <div class="phase-detail-content" id="panel-content">
            <div class="phase-detail-title-row">
              <div class="phase-detail-num">${d.num}</div>
              <div>
                <div class="phase-detail-name">${this.esc(d.name)}</div>
                <div class="phase-detail-meta">
                  <span class="phase-status-badge ${statusClass}">${statusText}</span>
                  ${timeInfo}
                </div>
              </div>
            </div>

            ${this.phaseTasksView === 'tasks' ? `
              ${this.renderPhaseTasksSection()}
            ` : `
              ${d.summary ? `<div class="phase-summary-text">${this.esc(d.summary)}</div>` : ''}
              ${stepsSection}
              ${skippedSection}
              ${docSections}
              ${logSection}
              ${!d.completedSteps?.length && !d.completionDoc?.length && !d.logEntries?.length
                ? '<div class="empty">Ingen data tilgjengelig for denne fasen ennå.</div>'
                : ''
              }
            `}
          </div>
        </div>
      `
    }

    getSectionIcon(title) {
      const lower = (title || '').toLowerCase()
      if (lower.includes('sikkerhet') || lower.includes('security') || lower.includes('owasp')) return icon('security')
      if (lower.includes('gdpr') || lower.includes('personvern') || lower.includes('privacy')) return icon('shield')
      if (lower.includes('test')) return icon('test-tube')
      if (lower.includes('arkitektur') || lower.includes('structure')) return icon('building')
      if (lower.includes('verifiser') || lower.includes('validering')) return `<span style="color:#22c55e">${icon('circle-check')}</span>`
      if (lower.includes('statistikk') || lower.includes('stats')) return icon('chart')
      if (lower.includes('krav') || lower.includes('requirement')) return icon('requirement')
      if (lower.includes('risiko') || lower.includes('risk')) return icon('triangle-exclamation')
      if (lower.includes('ytelse') || lower.includes('performance')) return icon('bolt')
      if (lower.includes('database') || lower.includes('data')) return icon('database')
      if (lower.includes('api') || lower.includes('endepunkt')) return icon('plug')
      if (lower.includes('ui') || lower.includes('grensesnitt') || lower.includes('design')) return icon('palette')
      if (lower.includes('deploy') || lower.includes('publiser')) return icon('rocket')
      if (lower.includes('fullført') || lower.includes('ferdig') || lower.includes('komplett')) return `<span style="color:#22c55e">${icon('circle-check')}</span>`
      if (lower.includes('neste') || lower.includes('next')) return icon('arrow-right')
      return icon('file')
    }

    async fetchPhaseDetail(phaseNum) {
      // Sjekk cache først
      if (this.phaseDetailCache.has(phaseNum)) {
        this.phaseDetail = this.phaseDetailCache.get(phaseNum)
        this.phaseDetailLoading = false
        this.render()
        return
      }

      this.phaseDetailLoading = true
      this.phaseDetail = null
      this.render()

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const res = await authFetch(`${API_BASE}/phases/${phaseNum}`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }

        this.phaseDetail = data
        this.phaseDetailCache.set(phaseNum, data)
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke laste fasedetaljer:', err)
        this.phaseDetail = null
      }

      this.phaseDetailLoading = false
      this.render()
    }

    // ─── Fase-oppgaver (F27) ────────────────────────────────

    async fetchPhaseTasks(phaseNum) {
      if (this.phaseTasksCache.has(phaseNum)) {
        this.phaseTasks = this.phaseTasksCache.get(phaseNum)
        this.phaseTasksLoading = false
        this.render()
        return
      }

      this.phaseTasksLoading = true
      this.phaseTasks = null
      this.render()

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const res = await authFetch(`${API_BASE}/phases/${phaseNum}/tasks`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        this.phaseTasks = data
        this.phaseTasksCache.set(phaseNum, data)
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke laste faseoppgaver:', err)
        this.phaseTasks = null
      }

      this.phaseTasksLoading = false
      this.render()
    }

    async activateTask(taskId, taskName, taskDesc, phaseNum) {
      try {
        const res = await authFetch(`${API_BASE}/tasks/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, taskName, taskDesc, phaseNum })
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        // Oppdater oppgavestatus i UI
        if (this.phaseTasks) {
          const task = this.phaseTasks.tasks?.find(t => t.id === taskId)
          if (task) task.status = 'activated'
          // Oppdater cache
          if (this.phaseTasksCache.has(phaseNum)) {
            this.phaseTasksCache.set(phaseNum, { ...this.phaseTasks })
          }
        }
        this.render()
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke aktivere oppgave:', err)
      }
    }

    async addIntegration(providerId, providerName, categoryName, isCustom = false) {
      try {
        const res = await authFetch(`${API_BASE}/integrations/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId, providerName, categoryName, isCustom })
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        // Vis bekreftelsesmelding
        const confirmEl = this.shadow.getElementById('int-custom-confirm')
        if (confirmEl) {
          confirmEl.textContent = `\u2713 ${providerName} er lagt til i byggelisten. AI vil sette den opp neste gang du bygger.`
          confirmEl.style.display = 'block'
          setTimeout(() => { confirmEl.style.display = 'none' }, 5000)
        }

        // Oppdater paneldata for å reflektere ny status
        if (this.currentTab === 'integrations' || this.dataPanelActive === 'integrations') {
          this.integrationsLoading = true
          this.dataPanelLoading = true
          this.render()
          try {
            const dataRes = await authFetch(`${API_BASE}/data/integrations`)
            if (dataRes.ok) {
              const panelData = await dataRes.json()
              this.integrationsData = panelData
              this.dataPanelData = panelData
            }
          } catch (err) { console.warn('[Kit CC] Failed to reload integrations data:', err) }
          this.integrationsLoading = false
          this.dataPanelLoading = false
          this.render()
        }
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke legge til integrasjon:', err)
      }
    }

    // ─── Integrasjoner-fane (promotert fra datapanel) ──────────────

    // ─── Start Tab (F37: Onboarding) ──────────────────────

    renderStartTab() {
      if (!this.onboardingData && !this.onboardingLoading) {
        this.fetchOnboardingData()
        return '<div class="empty">Laster...</div>'
      }
      if (this.onboardingLoading && !this.onboardingData) {
        return '<div class="empty">Laster...</div>'
      }

      const data = this.onboardingData || { suggestions: [] }
      const pending = data.suggestions.filter(s => s.status === 'pending')
      const completed = data.suggestions.filter(s => s.status === 'completed')
      const locked = data.suggestions.filter(s => s.status === 'locked')

      const statusIcon = (status) => {
        if (status === 'completed') return `<span class="ob-status-icon completed">${icon('circle-check', 16)}</span>`
        if (status === 'locked') return `<span class="ob-status-icon locked">${icon('lock', 16)}</span>`
        return `<span class="ob-status-icon pending">${icon('forward-step', 16)}</span>`
      }

      const renderCard = (s) => {
        const isSettings = s.category === 'settings' && s.settingsKey
        const actionBtn = s.status === 'pending' && isSettings
          ? `<button class="ob-action-btn" data-ob-settings="${this.esc(s.settingsKey)}">Endre</button>`
          : s.status === 'pending' && s.category === 'integrations'
          ? `<button class="ob-action-btn" data-ob-tab="integrations">Se integrasjoner</button>`
          : s.status === 'locked'
          ? `<span class="ob-locked-text">${this.esc(s.lockedReason || 'Låst')}</span>`
          : ''
        const valueBadge = s.currentLabel ? `<span class="ob-value-badge">${this.esc(s.currentLabel)}</span>` : ''
        return `
          <div class="ob-card ${s.status}">
            <div class="ob-card-header">
              ${statusIcon(s.status)}
              <span class="ob-card-title">${this.esc(s.title)}</span>
              ${valueBadge}
            </div>
            <div class="ob-card-desc">${this.esc(s.description)}</div>
            <div class="ob-card-actions">${actionBtn}</div>
          </div>
        `
      }

      const progressPct = data.total > 0 ? Math.round((completed.length / data.total) * 100) : 0

      return `
        <div class="tab-explainer">
          <div class="tab-explainer-title">Kom i gang</div>
          <div class="tab-explainer-text">Her ser du hva som er satt opp og hva som gjenstår. Klikk "Endre" for å justere innstillinger.</div>
        </div>
        <div class="ob-progress-bar-wrap">
          <div class="ob-progress-bar" style="width:${progressPct}%"></div>
        </div>
        <div class="ob-progress-text">${completed.length} av ${data.total} fullført</div>
        <div class="ob-grid">
          ${pending.map(renderCard).join('')}
          ${locked.map(renderCard).join('')}
          ${completed.map(renderCard).join('')}
        </div>
      `
    }

    async fetchOnboardingData() {
      this.onboardingLoading = true
      try {
        const res = await authFetch(`${API_BASE}/onboarding`)
        if (res.ok) {
          this.onboardingData = await res.json()
          this.onboardingPending = this.onboardingData.pending || 0
        }
      } catch (err) {
        console.error('Kit CC Monitor: Onboarding fetch failed:', err)
      }
      this.onboardingLoading = false
      this.render()
    }

    // ─── Integrations Tab ──────────────────────────────────

    renderIntegrationsTab() {
      const explainer = `
        <div class="tab-explainer">
          <div class="tab-explainer-title">Integrasjoner og tilkoblinger</div>
          <div class="tab-explainer-text">Kit CC oppdager automatisk hvilke tjenester og verktøy prosjektet ditt bruker — som databaser, autentisering og betalingsløsninger. Du kan også legge til nye integrasjoner manuelt, og AI setter dem opp neste gang du bygger. Klikk "Legg til" for å legge en integrasjon i byggelisten.</div>
        </div>
      `
      if (!this.integrationsData && !this.integrationsLoading) {
        this.fetchIntegrationsData()
        return explainer + '<div class="empty">Laster integrasjoner...</div>'
      }
      if (this.integrationsLoading && !this.integrationsData) {
        return explainer + '<div class="empty">Laster integrasjoner...</div>'
      }
      const data = this.integrationsData || {}
      const hint = data.hint ? `<div class="dp-hint">${this.esc(data.hint)}</div>` : ''
      return explainer + this.renderPanelIntegrations(data, hint)
    }

    async fetchIntegrationsData() {
      this.integrationsLoading = true
      try {
        const res = await authFetch(`${API_BASE}/data/integrations`)
        if (res.ok) {
          this.integrationsData = await res.json()
        } else {
          console.warn('Kit CC Monitor: Integrasjoner feilet med status', res.status)
          this.integrationsData = { categories: [], hint: 'Kunne ikke laste integrasjoner.' }
        }
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke laste integrasjoner:', err)
        this.integrationsData = { categories: [], hint: 'Kunne ikke laste integrasjoner.' }
      }
      this.integrationsLoading = false
      this.render()
    }

    // ─── Lagre & Gjenopprett ───

    renderCheckpointsTab() {
      const gitAvailable = this.state?.git?.available === true
      const explainer = `
        <div class="tab-explainer">
          <div class="tab-explainer-title">Lagre & Gjenopprett</div>
          <div class="tab-explainer-text">${gitAvailable
            ? 'Lagre prosjektet ditt når som helst, og gjenopprett tidligere versjoner med ett klikk. Kit CC lagrer også automatisk ved viktige milepæler.'
            : 'Kit CC lagrer automatisk sikkerhetskopier ved viktige milepæler. Hvis noe går galt, kan du gå tilbake til en tidligere versjon av prosjektet med ett klikk.'}</div>
        </div>
      `

      // Manuell lagring — kun med git
      const saveSection = gitAvailable ? (() => {
        const suggestions = this._generateCheckpointSuggestions()
        const isSaving = this._manualSaving === true
        return `
          <div class="cp-save-section">
            <div class="cp-save-title">Lagre nå</div>
            <div class="cp-save-input">
              <input type="text" class="cp-save-name" placeholder="Beskriv hva du nettopp har gjort..." ${isSaving ? 'disabled' : ''} />
              <button class="cp-save-btn${isSaving ? ' saving' : ''}" ${isSaving ? 'disabled' : ''}>
                ${isSaving ? '<span class="cp-save-spinner"></span>' : 'Lagre'}
              </button>
            </div>
            <div class="cp-save-hint">Tips: Beskriv hva du har gjort, f.eks. &laquo;Lagt til innloggingsside&raquo; eller &laquo;Fikset feil i handlekurv&raquo;</div>
            ${suggestions.length > 0 ? `
              <div class="cp-suggestions">
                <span class="cp-suggestions-label">Forslag:</span>
                ${suggestions.map(s => `<button class="cp-suggestion">${this.esc(s)}</button>`).join('')}
              </div>
            ` : ''}
          </div>
        `
      })() : ''

      // Uten git: vis forklarende info-boks for nybegynnere
      const gitInfoBox = !gitAvailable ? `
        <div class="cp-git-info">
          <div class="cp-git-info-icon">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2"/><path d="M8 4.5v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="11" r="0.8" fill="currentColor"/></svg>
          </div>
          <div class="cp-git-info-body">
            <div class="cp-git-info-title">Aktiver full gjenoppretting med Git</div>
            <div class="cp-git-info-text">
              Akkurat nå kan Kit CC bare lagre prosjekt<em>status</em> (hvilken fase du er i, innstillinger osv.) — men ikke selve <em>koden</em>. Det betyr at hvis noe går galt, kan du ikke rulle tilbake kodeendringer herfra.
            </div>
            <div class="cp-git-info-text" style="margin-top:6px">
              <strong>Git</strong> er et versjonskontrollsystem som lagrer en komplett historikk over alle endringer i koden din — tenk på det som "angre-knapp" for hele prosjektet. Med Git aktivert kan du gjenopprette både kode og prosjektstatus med ett klikk.
            </div>
            <div class="cp-git-info-steps">
              <div class="cp-git-info-step-title">Slik kommer du i gang:</div>
              <div class="cp-git-info-step"><span class="cp-git-step-num">1</span> Be AI-en din (Claude Code, Cursor, osv.) om å sette opp Git — skriv dette i chatten:</div>
              <div class="cp-git-info-prompt">
                <code>Sett opp Git for dette prosjektet. Kjør git init, lag en .gitignore-fil som passer prosjektet, og lag en første commit med all eksisterende kode.</code>
                <button class="cp-git-copy-btn" data-copy="Sett opp Git for dette prosjektet. Kjør git init, lag en .gitignore-fil som passer prosjektet, og lag en første commit med all eksisterende kode." title="Kopier til utklippstavle">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 11V3a1.5 1.5 0 011.5-1.5H11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </button>
              </div>
              <div class="cp-git-info-step"><span class="cp-git-step-num">2</span> Når det er gjort, last denne siden på nytt — gjenoppretting av kode aktiveres automatisk.</div>
            </div>
          </div>
        </div>
      ` : ''

      if (!this.checkpointsData && !this.checkpointsLoading) {
        this.fetchCheckpointsData()
        return explainer + saveSection + gitInfoBox + '<div class="empty">Laster lagringspunkter...</div>'
      }
      if (this.checkpointsLoading && !this.checkpointsData) {
        return explainer + saveSection + gitInfoBox + '<div class="empty">Laster lagringspunkter...</div>'
      }

      const data = this.checkpointsData || {}
      const checkpoints = data.checkpoints || []

      // To-stegs bekreftelsesdialog
      let confirmDialog = ''
      if (this.checkpointConfirm) {
        const cp = this.checkpointConfirm
        const cpName = this.esc(cp.description || cp.type || 'Checkpoint')
        const cpTime = cp.timestamp ? new Date(cp.timestamp).toLocaleString('nb-NO') : ''
        const hasGitSha = !!cp.gitCommitSha

        if (this._cpStep === 'saved') {
          const step2HasGit = hasGitSha
          const step2RestoreLabel = step2HasGit ? 'Gjenopprett kode og prosjektstatus' : 'Gjenopprett nå'
          confirmDialog = `
            <div class="cp-confirm-overlay">
              <div class="cp-confirm-dialog">
                <div class="cp-step-indicator">Steg 2 av 2</div>
                <div class="cp-confirm-title">Nåværende versjon er lagret</div>
                <div class="cp-saved-check">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#22c55e20" stroke="#22c55e" stroke-width="2"/><path d="M10 16.5l4 4 8-8" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <div class="cp-saved-text">
                    <div class="cp-saved-label">Sikkerhets-lagringspunkt opprettet</div>
                    <div class="cp-saved-detail">${step2HasGit ? 'Nåværende kode og prosjektstatus er trygt lagret.' : 'Nåværende versjon er trygt lagret.'} Du kan når som helst gå tilbake hit.</div>
                  </div>
                </div>
                <div class="cp-confirm-divider"></div>
                <div class="cp-confirm-desc">
                  Nå kan du trygt gjenopprette til:<br>
                  <strong>${cpName}</strong>
                  ${cpTime ? `<br><span class="cp-confirm-time">${cpTime}</span>` : ''}
                  ${hasGitSha ? `<br><span class="cp-git-sha">Git: ${this.esc(cp.gitCommitSha)}</span>` : ''}
                </div>
                <div class="cp-confirm-actions">
                  <button class="cp-confirm-btn cancel" data-cp-action="cancel">Avbryt</button>
                  <button class="cp-confirm-btn confirm" data-cp-action="restore">${step2RestoreLabel}</button>
                </div>
              </div>
            </div>
          `
        } else if (this._cpStep === 'saving') {
          confirmDialog = `
            <div class="cp-confirm-overlay">
              <div class="cp-confirm-dialog">
                <div class="cp-step-indicator">Steg 1 av 2</div>
                <div class="cp-confirm-title">${hasGitSha ? 'Lagrer kode og prosjektstatus...' : 'Lagrer nåværende versjon...'}</div>
                <div class="cp-saving-spinner"></div>
              </div>
            </div>
          `
        } else if (this._cpStep === 'restoring') {
          confirmDialog = `
            <div class="cp-confirm-overlay">
              <div class="cp-confirm-dialog">
                <div class="cp-step-indicator">Steg 2 av 2</div>
                <div class="cp-confirm-title">${hasGitSha ? 'Gjenoppretter kode og prosjektstatus...' : 'Gjenoppretter...'}</div>
                <div class="cp-saving-spinner"></div>
              </div>
            </div>
          `
        } else {
          const step1SaveLabel = hasGitSha ? 'Lagre nåværende versjon (kode + prosjektstatus)' : 'Lagre nåværende versjon'
          const step1SafetyText = hasGitSha
            ? 'Først lagres nåværende kode og prosjektstatus som et sikkerhets-lagringspunkt, slik at du alltid kan gå tilbake hit igjen.'
            : 'Først lagres nåværende versjon som et sikkerhets-lagringspunkt, slik at du alltid kan gå tilbake hit igjen.'
          confirmDialog = `
            <div class="cp-confirm-overlay">
              <div class="cp-confirm-dialog">
                <div class="cp-step-indicator">Steg 1 av 2</div>
                <div class="cp-confirm-title">Gjenopprett til tidligere versjon?</div>
                <div class="cp-confirm-desc">
                  Du er i ferd med å gjenopprette prosjektet til:<br>
                  <strong>${cpName}</strong>
                  ${cpTime ? `<br><span class="cp-confirm-time">${cpTime}</span>` : ''}
                  ${hasGitSha ? `<br><span class="cp-git-sha">Git: ${this.esc(cp.gitCommitSha)}</span>` : ''}
                </div>
                <div class="cp-confirm-safety">
                  ${step1SafetyText}
                </div>
                <div class="cp-confirm-actions">
                  <button class="cp-confirm-btn cancel" data-cp-action="cancel">Avbryt</button>
                  <button class="cp-confirm-btn confirm" data-cp-action="save-first">${step1SaveLabel}</button>
                </div>
              </div>
            </div>
          `
        }
      }

      return explainer + saveSection + gitInfoBox + `
        <div class="dp-panel cp-tab">
          <div class="dp-stat-row">
            <span class="dp-stat-label">Lagringspunkter</span>
            <span class="dp-stat-value">${data.total || 0}</span>
          </div>
          ${checkpoints.length === 0 ? '<div class="dp-empty">Ingen lagringspunkter opprettet ennå. Lagringspunkter opprettes automatisk av Kit CC ved viktige milepæler.</div>' : `
            <div class="cp-timeline">
              ${checkpoints.map((c, idx) => {
                const isSafety = (c.type || '').includes('safety') || (c.description || '').startsWith('Sikkerhets-lagringspunkt')
                const hasGit = !!c.gitCommitSha
                const showRestore = gitAvailable || hasGit
                return `
                <div class="cp-timeline-item ${isSafety ? 'safety' : ''}">
                  <div class="cp-timeline-dot"></div>
                  <div class="cp-timeline-content">
                    <div class="cp-timeline-header">
                      <div>
                        <div class="cp-timeline-title">${this.esc(c.description || c.type || 'Checkpoint')}</div>
                        <div class="cp-timeline-meta">Fase ${c.phase || '?'}${c.timestamp ? ' — ' + new Date(c.timestamp).toLocaleString('nb-NO') : ''}${hasGit ? ` — <span class="cp-git-sha">${this.esc(c.gitCommitSha)}</span>` : ''}</div>
                      </div>
                      ${showRestore ? `<button class="cp-restore-btn" data-cp-idx="${idx}" data-cp-id="${this.esc(c.id || String(idx))}">Gjenopprett</button>` : ''}
                    </div>
                  </div>
                </div>
              `}).join('')}
            </div>
          `}
          ${confirmDialog}
        </div>
      `
    }

    async fetchCheckpointsData() {
      this.checkpointsLoading = true
      try {
        const res = await authFetch(`${API_BASE}/data/checkpoints`)
        if (res.ok) this.checkpointsData = await res.json()
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke laste checkpoints:', err)
      }
      this.checkpointsLoading = false
      this.render()
    }

    async saveSafetyCheckpoint(targetDescription) {
      this._cpStep = 'saving'
      this.render()
      try {
        const res = await authFetch(`${API_BASE}/checkpoints/save-safety`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetDescription })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        const data = await res.json()
        this._cpSafetyId = data.safetyCheckpointId
        this._cpStep = 'saved'
        this.fetchCheckpointsData() // oppdater listen i bakgrunnen
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke lagre sikkerhetskopi:', err)
        this._cpStep = null
        this.checkpointConfirm = null
        this.showToast('Kunne ikke lagre sikkerhetskopi: ' + err.message, 'error')
      }
      this.render()
    }

    async executeRestore(checkpoint) {
      this._cpStep = 'restoring'
      this.render()
      try {
        const res = await authFetch(`${API_BASE}/checkpoints/restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkpointId: checkpoint.id,
            description: checkpoint.description,
            phase: checkpoint.phase,
            timestamp: checkpoint.timestamp,
            safetyAlreadySaved: true
          })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        this.checkpointConfirm = null
        this._cpStep = null
        this._cpSafetyId = null
        // Invalider alle cacher etter gjenoppretting
        this.phaseDetailCache.clear()
        this.phaseTasksCache.clear()
        this.settingsLoaded = false
        this.backlogLoaded = false
        this.dataPanelData = null
        this.integrationsData = null
        this.checkpointsData = null
        const result = await res.json()
        const toastMsg = result.gitRestored
          ? `Kode og prosjektstatus gjenopprettet til: ${checkpoint.description || 'valgt versjon'}`
          : 'Prosjektstatus gjenopprettet.'
        this.showToast(toastMsg)
        this.fetchCheckpointsData()
        this.fetchData()
      } catch (err) {
        console.error('Kit CC Monitor: Gjenoppretting feilet:', err)
        this._cpStep = 'saved' // gå tilbake til steg 2 — sikkerhetskopien er fortsatt lagret
        this.showToast('Gjenoppretting feilet: ' + err.message, 'error')
        this.render()
      }
    }

    _generateCheckpointSuggestions() {
      const PHASE_NAMES = ['', 'Ide og visjon', 'Planlegg', 'Arkitektur', 'MVP', 'Bygg funksjonene', 'Test og kvalitet', 'Publiser']
      const suggestions = []

      // Forslag 1: Fasebasert (alltid tilgjengelig)
      const phase = this.state?.currentPhase || 0
      if (phase > 0 && phase < PHASE_NAMES.length) {
        suggestions.push(`Fase ${phase}: ${PHASE_NAMES[phase]}`)
      }

      // Forslag 2: Siste fullforte oppgave fra progress-loggen
      const entries = this.progress?.entries || []
      const doneEntries = entries.filter(e => e.type === 'DONE')
      if (doneEntries.length > 0) {
        const last = doneEntries[doneEntries.length - 1]
        const desc = last.fields?.desc || last.fields?.output || last.description || ''
        if (desc) {
          const truncated = desc.length > 40 ? desc.substring(0, 37) + '...' : desc
          suggestions.push(`Etter: ${truncated}`)
        }
      }

      // Forslag 3: Tidspunkt (fallback)
      const now = new Date()
      suggestions.push(`Lagringspunkt ${now.toLocaleString('nb-NO')}`)

      return suggestions
    }

    async saveManualCheckpoint(name) {
      if (!name || !name.trim()) return
      this._manualSaving = true
      this.render()
      try {
        const res = await authFetch(`${API_BASE}/checkpoints/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: name.trim(), type: 'manual' })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        this._manualSaving = false
        this.showToast(`Lagringspunkt opprettet: ${name.trim()}`)
        this.checkpointsData = null
        this.fetchCheckpointsData()
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke opprette lagringspunkt:', err)
        this._manualSaving = false
        this.showToast('Kunne ikke opprette lagringspunkt: ' + err.message, 'error')
        this.render()
      }
    }

    async _saveNewFeature() {
      const nameInput = this.shadow.querySelector('.mod-add-name')
      const descInput = this.shadow.querySelector('.mod-add-desc')
      const featureName = nameInput?.value?.trim()
      if (!featureName) {
        this.showToast('Skriv inn et navn på funksjonen', 'error')
        return
      }
      const description = descInput?.value?.trim() || ''

      try {
        const res = await authFetch(`${API_BASE}/modules/add-feature`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureName, description })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        this._showAddFunction = false
        this.showToast(`Lagt til: ${featureName}`)
        this.fetchModules()
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke legge til funksjon:', err)
        this.showToast('Kunne ikke legge til: ' + err.message, 'error')
      }
    }

    renderPhaseTasksSection() {
      if (this.phaseTasksLoading) {
        return `
          <div class="phase-detail-section">
            <div class="phase-section-title">Oppgaver</div>
            <div class="phase-detail-loading">
              <div class="loading-spinner"></div>
              <span>Laster oppgaver…</span>
            </div>
          </div>
        `
      }

      if (!this.phaseTasks || !this.phaseTasks.grouped) {
        return ''
      }

      const { grouped, intensityLevel, intensityLabel } = this.phaseTasks
      const groups = ['MÅ', 'BØR', 'KAN', 'IKKE']
      const groupLabels = {
        'MÅ': 'Obligatorisk',
        'BØR': 'Anbefalt',
        'KAN': 'Valgfritt',
        'IKKE': 'Utelatt på dette nivået'
      }
      const isLight = this.theme === 'light'
      const groupColors = {
        'MÅ': '#22c55e',
        'BØR': isLight ? '#7000d0' : '#8A00FF',
        'KAN': isLight ? '#0090a0' : '#00E8FF',
        'IKKE': isLight ? '#8888a0' : '#71717A'
      }

      let html = `
        <div class="pt-intensity-bar">
          <span class="pt-intensity-label">Prosjekttype: ${this.esc(intensityLabel || intensityLevel)}</span>
        </div>
      `

      for (const group of groups) {
        const tasks = grouped[group]
        if (!tasks || tasks.length === 0) continue

        const statusTagMap = {
          completed:    { label: 'Fullført',       cls: 'pt-status-tag--completed' },
          not_done:     { label: 'Ikke utført',    cls: 'pt-status-tag--not-done' },
          skipped:      { label: 'Valgt bort',     cls: 'pt-status-tag--skipped' },
          out_of_level: { label: 'Utelatt',        cls: 'pt-status-tag--skipped' },
          activated:    { label: 'I Byggelisten',  cls: 'pt-status-tag--activated' }
        }

        const tasksHtml = tasks.map(task => {
          const expanded = this.expandedTasks.has(task.id)
          const statusIcon = this.getTaskStatusIcon(task.status)
          const statusClass = task.status || 'pending'
          // Knapp vises kun på oppgaver brukeren kan angre seg på
          const showActivate = task.status === 'not_done' || task.status === 'skipped' || task.status === 'out_of_level'
          const levelBadge = task.levelLabel
            ? `<span class="pt-level-badge">${this.esc(task.levelLabel)}</span>`
            : ''
          const zoneDot = task.zone === 'GREEN' ? icon('circle-green', 10) : task.zone === 'YELLOW' ? icon('circle-yellow', 10) : icon('circle-red', 10)
          const tagInfo = statusTagMap[task.status]
          const statusTag = tagInfo
            ? `<span class="pt-status-tag ${tagInfo.cls}">${tagInfo.label}</span>`
            : ''

          return `
            <div class="pt-task ${statusClass}" data-task-id="${task.id}">
              <div class="pt-task-header" data-task-toggle="${task.id}">
                <span class="pt-task-status">${statusIcon}</span>
                <span class="pt-task-name">${this.esc(task.name)}</span>
                ${statusTag}
                ${levelBadge}
                <span class="pt-task-zone">${zoneDot}</span>
                <span class="pt-task-chevron">${expanded ? '▾' : '▸'}</span>
              </div>
              ${expanded ? `
                <div class="pt-task-details">
                  <div class="pt-task-desc">${this.esc(task.desc)}</div>
                  ${task.deliverable ? `<div class="pt-task-deliverable">Leveranse: <code>${this.esc(task.deliverable)}</code></div>` : ''}
                  ${task.explanation ? `<div class="pt-task-reason">${this.esc(task.explanation)}</div>` : ''}
                  ${task.minLevelLabel ? `<div class="pt-task-level">Nivå: ${this.esc(task.minLevelLabel)}+</div>` : ''}
                  ${task.expert ? `<div class="pt-task-expert">Ekspert: ${this.esc(task.expert)}</div>` : ''}
                  ${task.reason ? `<div class="pt-task-reason">Begrunnelse: ${this.esc(task.reason)}</div>` : ''}
                  ${showActivate ? `
                    <button class="pt-activate-btn" data-activate-id="${task.id}" data-activate-name="${this.esc(task.name)}" data-activate-desc="${this.esc(task.desc)}" data-activate-phase="${this.selectedPhase}">
                      Legg i Byggelisten
                    </button>
                  ` : ''}
                  ${task.status === 'activated' ? `<div class="pt-activated-label">Lagt i Byggelisten</div>` : ''}
                </div>
              ` : ''}
            </div>
          `
        }).join('')

        html += `
          <div class="phase-detail-section pt-group">
            <div class="phase-section-title" style="border-color: ${groupColors[group]}40">
              <span class="pt-group-dot" style="background:${groupColors[group]}"></span>
              ${group} — ${groupLabels[group]} (${tasks.length})
            </div>
            <div class="pt-task-list">
              ${tasksHtml}
            </div>
          </div>
        `
      }

      return html
    }

    getTaskStatusIcon(status) {
      switch (status) {
        case 'completed': return `<span style="color:#22c55e">${icon('circle-check')}</span>`
        case 'not_done': return `<span style="color:#71717A">${icon('circle-minus')}</span>`
        case 'skipped': return `<span style="color:#71717A">${icon('forward-step')}</span>`
        case 'out_of_level': return `<span style="color:#71717A">${icon('lock')}</span>`
        case 'activated': return `<span style="color:#8A00FF">${icon('clipboard-list')}</span>`
        default: return `<span style="color:#71717A">${icon('clock')}</span>`
      }
    }

    // ─── Backlog + AI Chat ─────────────────────────────────

    renderBacklogTab() {
      // Lazy-load data ved første besøk — sjekk tilgjengelighet først
      if (!this.backlogLoaded) {
        this.initBacklog()
      }

      // Venstre: Samtaler
      const convSidebar = `
        <div class="bl-conv-sidebar">
          <div class="bl-tree-section-title">Samtaler</div>
          <div class="bl-conv-new" id="btn-new-conv">+ Legg til nye funksjoner</div>
          ${this.renderConversationList()}
        </div>
      `

      // Høyre: Byggeliste (modul-tre)
      const buildSidebar = `
        <div class="bl-build-sidebar">
          <div class="bl-tree-section-title">Byggeliste</div>
          ${this.renderBacklogTree()}
        </div>
      `

      const explainer = `
        <div class="tab-explainer">
          <div class="tab-explainer-title">Planlegg nye funksjoner med AI</div>
          <div class="tab-explainer-text">Fortell AI-en hva du vil bygge, og den bryter det ned i håndterbare oppgaver. Oppgavene havner i byggelisten til høyre, og AI bygger dem automatisk neste gang du fortsetter prosjektet.</div>
        </div>
      `

      return `
        ${explainer}
        <div class="bl-layout">
          ${convSidebar}
          <div class="bl-chat-area">
            ${this.renderChatArea()}
          </div>
          ${buildSidebar}
        </div>
      `
    }

    renderBacklogTree() {
      if (!this.backlogTree.length) {
        return '<div class="bl-tree-empty">Ingen oppgaver ennå</div>'
      }
      return this.backlogTree.map(item => this.renderTreeItem(item, 0)).join('')
    }

    renderTreeItem(item, level) {
      const statusClass = item.status === 'done' ? 'done' : item.status === 'in_progress' ? 'progress' : 'pending'
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = this.expandedTreeItems.has(item.id)
      const levelClass = level > 0 ? `bl-tree-child bl-tree-level-${Math.min(level, 3)}` : ''
      const typeLabel = { module: 'M', feature: 'F', micro_feature: 'mF', task: 'T' }[item.type] || ''

      let childrenHtml = ''
      if (hasChildren && isExpanded) {
        childrenHtml = item.children.map(child => this.renderTreeItem(child, level + 1)).join('')
      }

      return `
        <div class="bl-tree-item ${levelClass} ${isExpanded ? 'expanded' : ''}" data-tree-id="${item.id}">
          <span class="bl-tree-toggle">${hasChildren ? (isExpanded ? '▾' : '▸') : ' '}</span>
          <span class="bl-tree-dot ${statusClass}"></span>
          <span class="bl-tree-name">${this.esc(item.name)}</span>
          ${typeLabel ? `<span class="bl-tree-type">${typeLabel}</span>` : ''}
        </div>
        ${childrenHtml}
      `
    }

    renderConversationList() {
      // Filtrer ut tomme samtaler (0 meldinger, "Ny samtale"-tittel) — fikser ghost-entries
      const visible = this.chatConversations.filter(c => c.message_count > 0 || (this.activeConversation?.id === c.id))
      if (!visible.length) {
        return '<div class="bl-tree-empty">Ingen samtaler</div>'
      }
      return visible.map(conv => {
        const active = this.activeConversation?.id === conv.id ? 'active' : ''
        const title = conv.title || 'Uten tittel'
        return `
          <div class="bl-conv-item ${active}" data-conv-id="${conv.id}">
            <span class="bl-conv-title-text">${this.esc(title)}</span>
            <button class="bl-conv-delete" data-conv-del-id="${conv.id}" title="Slett samtale">${icon('x-mark', 12)}</button>
          </div>
        `
      }).join('')
    }

    renderChatArea() {
      // Venter på status fra server
      if (this.chatStatus === null && !this.backlogLoaded) {
        return `
          <div class="bl-chat-welcome">
            <div class="loading-spinner"></div>
            <div class="bl-chat-welcome-title" style="margin-top:16px">Laster...</div>
          </div>
        `
      }

      // Backlog-system utilgjengelig (SQLite mangler)
      if (this.chatStatus && this.chatStatus.error) {
        return `
          <div class="bl-chat-setup">
            <div class="bl-chat-setup-icon">${icon('triangle-exclamation', 40)}</div>
            <div class="bl-chat-setup-title">Byggeliste utilgjengelig</div>
            <div class="bl-chat-setup-text">${this.esc(this.chatStatus.error)}</div>
          </div>
        `
      }

      // Hvis ingen aktiv samtale — vis velkomst eller API-guide
      if (!this.activeConversation) {
        // Bruker har klikket "Legg til nye funksjoner" men mangler API-nøkkel
        if (this.showApiKeyGuide) {
          return `
            <div class="bl-chat-setup bl-chat-setup-scroll">
              <div class="bl-chat-setup-icon">${icon('key', 40)}</div>
              <div class="bl-chat-setup-title">Koble til en AI-leverandør</div>
              <div class="bl-chat-setup-text">
                For å kunne planlegge nye funksjoner med AI, må du koble til din egen AI med en API-nøkkel.
                En API-nøkkel er en unik kode som gir Kit CC tilgang til AI-tjenesten du velger.
              </div>

              <div class="bl-provider-guide">
                <div class="bl-provider-guide-card">
                  <div class="bl-provider-guide-header">
                    <span class="bl-provider-guide-name">Google Gemini</span>
                    <span class="bl-provider-guide-tag free">Gratis</span>
                  </div>
                  <div class="bl-provider-guide-desc">Rask og gratis å starte med. Ingen kredittkort nødvendig.</div>
                  <div class="bl-provider-guide-steps">
                    <span>1. Gå til <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="bl-link">aistudio.google.com/app/apikey</a></span>
                    <span>2. Logg inn med Google-kontoen din</span>
                    <span>3. Klikk "Create API Key", velg et prosjekt og kopier nøkkelen</span>
                  </div>
                </div>

                <div class="bl-provider-guide-card">
                  <div class="bl-provider-guide-header">
                    <span class="bl-provider-guide-name">Groq</span>
                    <span class="bl-provider-guide-tag free">Gratis</span>
                  </div>
                  <div class="bl-provider-guide-desc">Ekstremt rask AI (Llama, Mixtral). Gratis med sjenerøse grenser.</div>
                  <div class="bl-provider-guide-steps">
                    <span>1. Opprett konto på <a href="https://console.groq.com" target="_blank" rel="noopener" class="bl-link">console.groq.com</a></span>
                    <span>2. Gå til <a href="https://console.groq.com/keys" target="_blank" rel="noopener" class="bl-link">API Keys</a></span>
                    <span>3. Klikk "Create API Key", gi den et navn og kopier nøkkelen</span>
                  </div>
                </div>

                <div class="bl-provider-guide-card">
                  <div class="bl-provider-guide-header">
                    <span class="bl-provider-guide-name">Anthropic (Claude)</span>
                    <span class="bl-provider-guide-tag paid">Betalt</span>
                  </div>
                  <div class="bl-provider-guide-desc">Kraftig AI for planlegging og koding. Krever kredittkort og forhåndsbetaling.</div>
                  <div class="bl-provider-guide-steps">
                    <span>1. Opprett konto på <a href="https://console.anthropic.com" target="_blank" rel="noopener" class="bl-link">console.anthropic.com</a></span>
                    <span>2. Gå til <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" class="bl-link">Settings &gt; API Keys</a></span>
                    <span>3. Klikk "Create Key", gi den et navn og kopier nøkkelen</span>
                  </div>
                </div>

                <div class="bl-provider-guide-card">
                  <div class="bl-provider-guide-header">
                    <span class="bl-provider-guide-name">OpenAI</span>
                    <span class="bl-provider-guide-tag paid">Betalt</span>
                  </div>
                  <div class="bl-provider-guide-desc">GPT-4o og o3-mini. Krever kredittkort og forhåndsbetaling.</div>
                  <div class="bl-provider-guide-steps">
                    <span>1. Opprett konto på <a href="https://platform.openai.com/signup" target="_blank" rel="noopener" class="bl-link">platform.openai.com</a></span>
                    <span>2. Gå til <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" class="bl-link">API Keys</a></span>
                    <span>3. Klikk "Create new secret key", gi den et navn og kopier nøkkelen</span>
                  </div>
                </div>
              </div>

              <div class="bl-chat-setup-footer">
                Når du har en nøkkel, klikk ${icon('gear', 12)}-ikonet oppe til høyre for å lime den inn.
                <br/><span style="color:#52525b;font-size:11px">Nøkkelen lagres kun lokalt i prosjektmappen — den sendes aldri til nettleseren.</span>
              </div>
            </div>
          `
        }

        // Standard velkomstskjerm
        return `
          <div class="bl-chat-welcome">
            <div class="bl-chat-welcome-icon">${icon('chat-bubble', 40)}</div>
            <div class="bl-chat-welcome-title">Kit CC Byggeliste</div>
            <div class="bl-chat-welcome-text">Fortell AI-en hva du vil bygge. Den hjelper deg å bryte ned funksjoner i håndterbare oppgaver og legger dem i byggelisten.</div>
            <button class="bl-chat-new-btn" id="btn-start-conv">Legg til nye funksjoner</button>
          </div>
        `
      }

      const conv = this.activeConversation
      const messages = conv.messages || []
      const msgCount = messages.length
      const maxMsg = this.chatStatus?.maxMessages || 40
      const isMaxed = msgCount >= maxMsg

      // Render meldinger
      const messagesHtml = messages.map((msg, idx) => {
        const isUser = msg.role === 'user'
        const roleLabel = isUser ? 'Du' : 'Kit CC AI'

        // Sjekk om AI-melding inneholder godkjenningskort
        let approvalHtml = ''
        if (!isUser && msg.content) {
          approvalHtml = this.extractApprovalCards(msg.content, idx)
        }

        return `
          <div class="bl-chat-msg ${isUser ? 'user' : 'ai'}">
            <span class="bl-chat-role">${roleLabel}</span>
            <div class="bl-chat-content">${isUser ? this.esc(msg.content || '') : this.renderMd(msg.content || '')}</div>
            ${approvalHtml}
          </div>
        `
      }).join('')

      // Laste-indikator
      const loadingHtml = this.chatSending ? `
        <div class="bl-chat-msg ai">
          <span class="bl-chat-role">Kit CC AI</span>
          <div class="bl-chat-content bl-chat-typing">
            <span class="bl-typing-dot"></span><span class="bl-typing-dot"></span><span class="bl-typing-dot"></span>
          </div>
        </div>
      ` : ''

      // Feilmelding
      const errorHtml = this.chatError ? `
        <div class="bl-chat-error">${this.esc(this.chatError)}</div>
      ` : ''

      return `
        <div class="bl-chat-container">
          <div class="bl-chat-topbar">
            <span class="bl-chat-conv-title" title="Dobbeltklikk for å endre">${this.esc(conv.title || 'Samtale')}</span>
            <div class="bl-chat-topbar-right">
              <span class="bl-chat-counter ${isMaxed ? 'maxed' : ''}"><span class="bl-count-current">${msgCount}</span> / ${maxMsg}</span>
            </div>
          </div>
          <div class="bl-chat-messages" id="bl-chat-messages">
            ${messagesHtml}
            ${loadingHtml}
            ${errorHtml}
          </div>
          <div class="bl-chat-input-area">
            <input class="bl-chat-input" id="bl-chat-input" placeholder="${isMaxed ? 'Meldingsgrense nådd — start ny samtale' : 'Skriv en melding til Kit CC AI...'}" ${isMaxed || this.chatSending ? 'disabled' : ''} />
            <button class="bl-chat-send" id="bl-chat-send" ${isMaxed || this.chatSending ? 'disabled' : ''} title="Send">${icon('arrow-right')}</button>
          </div>
        </div>
      `
    }

    extractApprovalCards(content, msgIdx) {
      // Søk etter ALLE JSON-blokker med tasks[] i AI-svaret
      const jsonMatches = [...content.matchAll(/```json\s*([\s\S]*?)```/g)]
      if (!jsonMatches.length) return ''

      const cards = []
      for (const jsonMatch of jsonMatches) {
        try {
          const parsed = JSON.parse(jsonMatch[1])
          if (!parsed.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) continue

          const itemsHtml = parsed.tasks.map(t => {
            const typeLabel = { module: 'Modul', feature: 'Feature', micro_feature: 'Del-feature', task: 'Oppgave' }[t.type] || 'Oppgave'
            const priorityClass = { MUST: 'must', SHOULD: 'should', COULD: 'could' }[t.priority] || ''
            return `
              <div class="bl-approval-item">
                <span class="bl-approval-type">${typeLabel}</span>
                <span class="bl-approval-name">${this.esc(t.name || '')}</span>
                ${t.priority ? `<span class="bl-approval-priority ${priorityClass}">${t.priority}</span>` : ''}
              </div>
            `
          }).join('')

          cards.push(`
            <div class="bl-approval-card" data-msg-idx="${msgIdx}">
              <div class="bl-approval-title">${icon('clipboard-check')} Foreslåtte oppgaver</div>
              ${itemsHtml}
              ${parsed.quality_note ? `<div class="bl-approval-note">${this.esc(parsed.quality_note)}</div>` : ''}
              <div class="bl-approval-actions">
                <button class="bl-approval-btn accept" data-msg-idx="${msgIdx}">Godkjenn</button>
                <button class="bl-approval-btn reject" data-msg-idx="${msgIdx}">Endre</button>
              </div>
            </div>
          `)
        } catch {
          continue
        }
      }
      return cards.join('')
    }

    renderSettingsPanel() {
      // Lazy-load chatStatus if not yet fetched
      if (this.chatStatus === null && !this._chatStatusLoading) {
        this._chatStatusLoading = true
        this.fetchChatStatus().finally(() => { this._chatStatusLoading = false })
      }
      // Show loading state while chatStatus is being fetched
      if (this.chatStatus === null) {
        return `<div class="bl-settings-panel"><div class="bl-settings-loading">Laster innstillinger...</div></div>`
      }
      const providers = this.chatStatus?.providers || {}
      const activeProvider = this.chatStatus?.activeProvider || null
      const configuredCount = Object.values(providers).filter(p => p.configured).length

      const PROVIDER_LIST = [
        { id: 'anthropic', name: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
        { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
        { id: 'google-gemini', name: 'Google Gemini', placeholder: 'AI...' },
        { id: 'groq', name: 'Groq', placeholder: 'gsk_...' }
      ]

      const providerItems = PROVIDER_LIST.map(p => {
        const conf = providers[p.id] || {}
        const isConfigured = conf.configured
        const isActive = activeProvider === p.id
        const isExpanded = this.expandedProvider === p.id

        // Modell-dropdown for denne provideren
        let modelOptions = ''
        if (isExpanded) {
          const models = this.providerModels[p.id] || []
          const currentModel = conf.model || ''
          if (this.modelsLoading && this.modelsLoadingProvider === p.id) {
            modelOptions = '<option value="">Henter modeller...</option>'
          } else if (models.length > 0) {
            modelOptions = models.map(m =>
              `<option value="${this.esc(m.id)}" ${currentModel === m.id ? 'selected' : ''}>${this.esc(m.displayName || m.id)}</option>`
            ).join('')
          } else {
            modelOptions = `<option value="${this.esc(currentModel)}">${this.esc(currentModel || 'Standardmodell')}</option>`
          }
        }

        return `
          <div class="bl-provider-item ${isExpanded ? 'expanded' : ''}" data-provider-id="${p.id}">
            <div class="bl-provider-header" data-provider-toggle="${p.id}">
              <div class="bl-provider-info">
                <span class="bl-provider-name">${p.name}</span>
                <span class="bl-provider-status ${isConfigured ? 'configured' : ''}">${isConfigured ? 'Konfigurert' : 'Ikke konfigurert'}</span>
              </div>
              <div class="bl-provider-actions-top">
                ${isConfigured && !isActive ? `<button class="bl-provider-activate" data-provider-activate="${p.id}" title="Bruk denne">Aktiver</button>` : ''}
                ${isActive && isConfigured && configuredCount > 1 ? `<button class="bl-provider-deactivate" data-provider-deactivate="${p.id}" title="Deaktiver">Aktiv</button>` : ''}
                ${isActive && isConfigured && configuredCount <= 1 ? `<span class="bl-provider-active-badge">Aktiv</span>` : ''}
                <span class="bl-provider-chevron">${isExpanded ? '▾' : '▸'}</span>
              </div>
            </div>
            ${isExpanded ? `
              <div class="bl-provider-detail">
                <div class="bl-settings-field">
                  <label class="bl-settings-label">API-nøkkel</label>
                  <input class="bl-settings-input" id="bl-provider-key-${p.id}" type="password" placeholder="${p.placeholder}" />
                  <div class="bl-settings-hint">Lagres i .ai/config.json på serveren. Sendes aldri til nettleseren.</div>
                </div>
                ${isConfigured ? `
                <div class="bl-settings-field">
                  <label class="bl-settings-label">Modell</label>
                  <select class="bl-settings-input" id="bl-provider-model-${p.id}">
                    ${modelOptions}
                  </select>
                </div>
                ` : ''}
                <div class="bl-provider-detail-actions">
                  <button class="bl-settings-btn primary" data-provider-save="${p.id}">Lagre</button>
                  ${isConfigured ? `<button class="bl-settings-btn danger" data-provider-delete="${p.id}">Slett</button>` : ''}
                  ${this.savedProvider === p.id ? `<span class="bl-save-confirm">Lagret!</span>` : ''}
                </div>
              </div>
            ` : ''}
          </div>
        `
      }).join('')

      return `
        <div class="bl-settings-overlay" id="bl-settings-overlay"></div>
        <div class="bl-settings-modal bl-settings-modal-wide">
          <div class="bl-settings-header">
            <span class="bl-settings-title">${icon('gear', 16)} Innstillinger</span>
            <button class="bl-settings-close" id="btn-close-settings">${icon('x-mark')}</button>
          </div>
          <div class="bl-settings-section-title">API-tilkoblinger</div>
          <div class="bl-settings-hint" style="margin-bottom:12px">Konfigurer AI-leverandører for planlegging og chat. Du kan legge til flere og velge hvilken som er aktiv.</div>
          <div class="bl-provider-list">
            ${providerItems}
          </div>
        </div>
      `
    }

    renderHowItWorks() {
      const steps = [
        { n: '1', h: 'Beskriv idéen din', d: 'Fortell Kit CC hva du vil bygge — i vanlig språk. Ingen kommandoer å huske.' },
        { n: '2', h: 'Kit CC planlegger', d: 'Idéen brytes ned i funksjoner, krav og sikkerhet — tilpasset hvor stort prosjektet er.' },
        { n: '3', h: 'AI-teamet bygger', d: 'Et team av spesialiserte AI-agenter bygger appen steg for steg gjennom de 7 fasene.' },
        { n: '4', h: 'Du følger med her', d: 'Monitor viser fremdrift, lar deg legge til funksjoner, koble til tjenester og fange feil.' }
      ]
      const phases = ['Idé', 'Planlegg', 'Arkitektur', 'MVP', 'Bygg', 'Test', 'Publiser']
      const stepCards = steps.map(s => `
        <div class="hiw-step">
          <span class="hiw-num">${s.n}</span>
          <div class="hiw-step-body">
            <div class="hiw-step-h">${s.h}</div>
            <div class="hiw-step-d">${s.d}</div>
          </div>
        </div>`).join('')
      const phaseChips = phases.map((p, i) =>
        `<span class="hiw-phase">${i + 1}. ${p}</span>${i < phases.length - 1 ? '<span class="hiw-phase-arrow">›</span>' : ''}`
      ).join('')
      return `
        <div class="bl-settings-overlay" id="hiw-overlay"></div>
        <div class="bl-settings-modal bl-settings-modal-wide">
          <div class="bl-settings-header">
            <span class="bl-settings-title">${icon('lightbulb', 16)} Slik fungerer Kit CC</span>
            <button class="bl-settings-close" id="btn-close-howitworks">${icon('x-mark')}</button>
          </div>
          <p class="hiw-intro">Kit CC er et AI-team som bygger programvare fra idé til ferdig app. Slik går det for seg:</p>
          <div class="hiw-steps">${stepCards}</div>
          <div class="bl-settings-section-title" style="margin-top:20px">De 7 fasene</div>
          <div class="hiw-phases">${phaseChips}</div>
          <div class="hiw-modes">
            <div class="hiw-mode"><span class="hiw-mode-tag">Bygge</span> Start eller fortsett å bygge prosjektet.</div>
            <div class="hiw-mode"><span class="hiw-mode-tag">Spørre</span> Få svar uten å endre noe (read-only).</div>
          </div>
        </div>
      `
    }

    // ─── Backlog data-henting ──────────────────────────────

    async initBacklog() {
      // Steg 1: Sjekk om backlog-systemet er tilgjengelig (ett enkelt kall)
      try {
        const statusRes = await authFetch(`${API_BASE}/backlog`)
        const status = await statusRes.json()

        if (!status.available) {
          // Byggeliste er utilgjengelig — sett feilstatus og IKKE gjør flere kall
          this.chatStatus = { error: 'Byggeliste er ikke tilgjengelig. Kjør: npm install i kit-cc-overlay/', hasApiKey: false }
          this.backlogLoaded = true
          this.render()
          return
        }
      } catch {
        this.chatStatus = { error: 'Kunne ikke koble til serveren.', hasApiKey: false }
        this.backlogLoaded = true
        this.render()
        return
      }

      // Steg 2: Backlog er tilgjengelig — hent data parallelt
      await Promise.all([
        this.fetchBacklogData(),
        this.fetchChatStatus()
      ])
    }

    async fetchBacklogData() {
      try {
        const [treeRes, statsRes] = await Promise.all([
          authFetch(`${API_BASE}/backlog/tree`).then(r => r.json()).catch(() => ({ success: false })),
          authFetch(`${API_BASE}/backlog/stats`).then(r => r.json()).catch(() => ({ success: false }))
        ])
        if (treeRes.success && treeRes.data) this.backlogTree = treeRes.data
        if (statsRes.success && statsRes.data) this.backlogStats = statsRes.data
        this.backlogLoaded = true
        this.render()
      } catch {
        this.backlogLoaded = true
      }
    }

    async fetchChatStatus() {
      try {
        const res = await authFetch(`${API_BASE}/chat/status`)
        if (!res.ok) {
          this.chatStatus = { error: 'Byggeliste er ikke tilgjengelig.', hasApiKey: false }
          this.render()
          return
        }
        this.chatStatus = await res.json()
        // Hent modell-liste parallelt med samtaler
        await Promise.all([
          this.fetchConversations(),
          this.fetchModels()
        ])
        this.render()
      } catch {
        this.chatStatus = { error: 'Kunne ikke koble til serveren for å sjekke AI-chat status.', hasApiKey: false }
        this.render()
      }
    }

    async fetchModels(forceRefresh = false, provider = null) {
      const targetProvider = provider || this.chatStatus?.activeProvider || 'anthropic'
      this.modelsLoading = true
      this.modelsLoadingProvider = targetProvider
      try {
        const params = new URLSearchParams()
        params.set('provider', targetProvider)
        if (forceRefresh) params.set('refresh', 'true')
        const res = await authFetch(`${API_BASE}/chat/models?${params}`)
        const data = await res.json()
        if (data.success && Array.isArray(data.models) && data.models.length > 0) {
          this.providerModels[targetProvider] = data.models
          // Bakoverkompatibilitet
          if (targetProvider === (this.chatStatus?.activeProvider || 'anthropic')) {
            this.availableModels = data.models
          }
        }
      } catch {
        // Beholder eksisterende modeller
      } finally {
        this.modelsLoading = false
        this.modelsLoadingProvider = null
      }
    }

    async fetchConversations() {
      try {
        const res = await authFetch(`${API_BASE}/chat/conversations?limit=10`)
        const data = await res.json()
        if (data.success && data.data) {
          this.chatConversations = data.data
        } else if (Array.isArray(data)) {
          this.chatConversations = data
        }
      } catch {
        this.chatConversations = []
      }
    }

    async loadConversation(convId) {
      // Krev API-nøkkel for å åpne samtale
      if (this.chatStatus && !this.chatStatus.hasApiKey) {
        this.showApiKeyGuide = true
        this.activeConversation = null
        this.render()
        return
      }
      try {
        const res = await authFetch(`${API_BASE}/chat/conversations/${convId}`)
        const data = await res.json()
        if (data.success && data.data) {
          this.activeConversation = data.data
        } else if (data.id) {
          this.activeConversation = data
        }
        this.showApiKeyGuide = false
        this.chatError = null
        this.render()
        // Scroll til bunn
        setTimeout(() => {
          const el = this.shadow.getElementById('bl-chat-messages')
          if (el) el.scrollTop = el.scrollHeight
        }, 50)
      } catch {
        this.chatError = 'Kunne ikke laste samtalen'
        this.render()
      }
    }

    async createNewConversation(title) {
      // Vis API-nøkkel-guide hvis ingen nøkkel er konfigurert
      if (this.chatStatus && !this.chatStatus.hasApiKey) {
        this.showApiKeyGuide = true
        this.render()
        return
      }
      // Skjul guiden hvis den var synlig (bruker har nå koblet til API)
      this.showApiKeyGuide = false

      try {
        const res = await authFetch(`${API_BASE}/chat/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title || 'Ny samtale' })
        })
        const data = await res.json()
        const convId = data.data?.id || data.id
        if (convId) {
          await this.fetchConversations()
          await this.loadConversation(convId)
        }
      } catch {
        this.chatError = 'Kunne ikke opprette samtale'
        this.render()
      }
    }

    async sendChatMessage(content) {
      if (!content.trim() || !this.activeConversation || this.chatSending) return

      // Legg til brukermelding lokalt umiddelbart
      if (!this.activeConversation.messages) this.activeConversation.messages = []
      this.activeConversation.messages.push({ role: 'user', content: content.trim() })
      this.chatSending = true
      this.chatError = null
      this.render()

      // Scroll til bunn
      setTimeout(() => {
        const el = this.shadow.getElementById('bl-chat-messages')
        if (el) el.scrollTop = el.scrollHeight
      }, 50)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 35000)

        const res = await authFetch(`${API_BASE}/chat/conversations/${this.activeConversation.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() }),
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        const data = await res.json()

        if (data.success && data.response) {
          this.activeConversation.messages.push({ role: 'assistant', content: data.response })
        } else if (data.error) {
          this.chatError = data.error
          // Fjern brukermelding ved feil (backend ruller tilbake)
          this.activeConversation.messages.pop()
        }
      } catch (err) {
        const msg = err.name === 'AbortError'
          ? 'AI-svaret tok for lang tid (35s). Prøv igjen.'
          : 'Nettverksfeil — sjekk tilkobling og API-nøkkel'
        this.chatError = msg
        this.activeConversation.messages.pop()
      }

      this.chatSending = false
      this.render()

      // Scroll til bunn etter svar
      setTimeout(() => {
        const el = this.shadow.getElementById('bl-chat-messages')
        if (el) el.scrollTop = el.scrollHeight
      }, 50)
    }

    async approveTasksFromChat(msgIdx) {
      const msg = this.activeConversation?.messages?.[msgIdx]
      if (!msg) return

      // Finn alle JSON-blokker og bruk den første med tasks[]
      const jsonMatches = [...msg.content.matchAll(/```json\s*([\s\S]*?)```/g)]
      let tasks = null
      for (const m of jsonMatches) {
        try {
          const parsed = JSON.parse(m[1])
          if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
            tasks = parsed.tasks
            break
          }
        } catch { continue }
      }
      if (!tasks) return

      try {
        const res = await authFetch(`${API_BASE}/backlog/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks,
            conversationId: this.activeConversation.id
          })
        })

        const data = await res.json()
        if (data.success) {
          // Oppdater backlog-tre
          this.backlogLoaded = false
          this.fetchBacklogData()
          // Vis bekreftelse lokalt (forsvinner ved reload, men gir umiddelbar feedback)
          if (!this.activeConversation.messages) this.activeConversation.messages = []
          this.activeConversation.messages.push({
            role: 'assistant',
            content: `\u2705 ${data.approved} oppgave${data.approved !== 1 ? 'r' : ''} godkjent og lagt til i byggelisten${data.modulregisterUpdated ? ' (MODULREGISTER oppdatert)' : ''}.`
          })
          this.render()
        } else {
          this.chatError = data.error || 'Godkjenning feilet'
          this.render()
        }
      } catch {
        this.chatError = 'Kunne ikke godkjenne oppgaver'
        this.render()
      }
    }

    async saveProviderSettings(provider, apiKey, model) {
      try {
        const body = { provider }
        if (apiKey && apiKey.trim().length >= 20) body.apiKey = apiKey.trim()
        if (model) body.model = model

        const res = await authFetch(`${API_BASE}/chat/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        const data = await res.json()
        if (!data.saved) {
          this.chatError = data.error || 'Kunne ikke lagre innstillinger'
          this.render()
          return
        }

        // Oppdater lokal status og skjul API-guide hvis nøkkel ble konfigurert
        await this.fetchChatStatus()
        if (body.apiKey) {
          await this.fetchModels(true, provider)
          this.showApiKeyGuide = false
        }
        // Vis lagringskvittering i 3 sekunder
        this.savedProvider = provider
        this.render()
        setTimeout(() => {
          if (this.savedProvider === provider) {
            this.savedProvider = null
            this.render()
          }
        }, 3000)
      } catch {
        this.chatError = 'Nettverksfeil ved lagring av innstillinger'
        this.render()
      }
    }

    async deleteProvider(provider) {
      try {
        const res = await authFetch(`${API_BASE}/chat/config/${encodeURIComponent(provider)}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.deleted) {
          delete this.providerModels[provider]
          await this.fetchChatStatus()
          this.render()
        }
      } catch {
        this.chatError = 'Kunne ikke slette provider-konfigurasjon'
        this.render()
      }
    }

    async activateProvider(provider) {
      try {
        const res = await authFetch(`${API_BASE}/chat/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setActive: provider })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await this.fetchChatStatus()
        this.render()
      } catch (err) {
        console.warn('[Kit CC] activateProvider error:', err)
        this.chatError = 'Kunne ikke bytte aktiv provider'
        this.render()
      }
    }

    async deactivateProvider() {
      // Guard: don't deactivate if this is the only configured provider
      const providers = this.chatStatus?.providers || {}
      const configuredCount = Object.values(providers).filter(p => p.configured).length
      if (configuredCount <= 1) return

      try {
        const res = await authFetch(`${API_BASE}/chat/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setActive: '_none' })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await this.fetchChatStatus()
        this.render()
      } catch (err) {
        console.warn('[Kit CC] deactivateProvider error:', err)
        this.chatError = 'Kunne ikke deaktivere provider'
        this.render()
      }
    }

    async deleteConversation(convId) {
      try {
        const res = await authFetch(`${API_BASE}/chat/conversations/${convId}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          this.chatConversations = this.chatConversations.filter(c => c.id !== convId)
          if (this.activeConversation?.id === convId) this.activeConversation = null
          this.render()
        }
      } catch {
        this.chatError = 'Kunne ikke slette samtalen'
        this.render()
      }
    }

    async renameConversation(convId, newTitle) {
      if (!newTitle || !newTitle.trim()) return
      try {
        const resp = await authFetch(`${API_BASE}/chat/conversations/${convId}/title`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle.trim() })
        })
        const result = await resp.json()
        if (!resp.ok || !result.success) {
          console.warn('[Kit CC] renameConversation failed:', result.error || resp.status)
          return
        }
        const conv = this.chatConversations.find(c => c.id === convId)
        if (conv) conv.title = newTitle.trim()
        if (this.activeConversation?.id === convId) this.activeConversation.title = newTitle.trim()
        this.render()
      } catch (err) { console.warn('[Kit CC] renameConversation error:', err) }
    }

    // ─── Moduler-fane (vertikal liste med status-badges) ──

    _isUserFacingModule(name) {
      const lower = (name || '').toLowerCase()
      const userKeywords = ['ui', 'side', 'dashboard', 'visning', 'komponent', 'meny', 'skjema', 'form', 'knapp', 'button', 'dialog', 'modal', 'layout', 'navigasjon', 'header', 'footer', 'profil', 'innstilling', 'tema', 'theme', 'landing', 'page', 'view', 'widget', 'panel', 'kort', 'card', 'liste', 'tabell', 'table']
      return userKeywords.some(kw => lower.includes(kw))
    }

    renderModulesTab() {
      const explainer = `
        <div class="tab-explainer">
          <div class="tab-explainer-title">Funksjoner og moduler</div>
          <div class="tab-explainer-text">Her ser du alle funksjonene og modulene som AI har planlagt for prosjektet ditt. Hver modul har en fremdriftsindikator som viser hvor langt AI har kommet med å bygge den. Klikk på en modul for å se detaljene.</div>
        </div>
      `
      if (!this.modules.modules?.length) {
        return explainer + '<div class="empty">Ingen moduler registrert ennå</div>'
      }

      const allModules = this.modules.modules
      const userModules = allModules.filter(m => this._isUserFacingModule(m.name))
      const systemModules = allModules.filter(m => !this._isUserFacingModule(m.name))
      // If heuristic doesn't split well (all in one group), show all
      const hasGoodSplit = userModules.length > 0 && systemModules.length > 0

      // Count completed modules
      const completedCount = allModules.filter(m => {
        const d = m.features.filter(f => f.done).length
        return d === m.features.length && m.features.length > 0
      }).length

      const toggleBtns = `
        <div class="toggle-all">
          <button class="toggle-btn" id="expand-all-modules">Utvid alle</button>
          <button class="toggle-btn" id="collapse-all-modules">Skjul alle</button>
          ${hasGoodSplit ? `
            <button class="toggle-btn mod-type-toggle" id="toggle-system-modules">
              ${this.showSystemModules ? 'Skjul tekniske moduler' : `Vis tekniske moduler (${systemModules.length})`}
            </button>
          ` : ''}
          ${completedCount > 0 ? `
            <button class="toggle-btn mod-filter-toggle" id="toggle-hide-completed">
              ${this._hideCompletedModules ? `Vis ferdige (${completedCount})` : 'Skjul ferdige'}
            </button>
          ` : ''}
        </div>
      `

      let modulesToShow = hasGoodSplit && !this.showSystemModules ? userModules : allModules
      if (this._hideCompletedModules) {
        modulesToShow = modulesToShow.filter(m => {
          const d = m.features.filter(f => f.done).length
          return !(d === m.features.length && m.features.length > 0)
        })
      }

      const items = modulesToShow.map((m, origIdx) => {
        const i = allModules.indexOf(m)
        const done = m.features.filter(f => f.done).length
        const total = m.features.length
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        const isExpanded = this.expandedModules.has(i)
        const status = pct === 100 ? 'done' : pct > 0 ? 'building' : 'pending'
        const statusText = pct === 100 ? 'Ferdig' : pct > 0 ? 'Pågår' : 'Venter'
        const fillClass = status === 'done' ? 'green' : status === 'building' ? 'blue' : 'gray'

        let details = ''
        if (isExpanded) {
          if (m.features.length > 0) {
            const modKey = `mod:${m.name}`
            const hasModDesc = this.descriptions.has(modKey)
            const isModLoading = this.loadingDescriptions.has(modKey)

            details = `
              <div class="module-details">
                <div class="module-describe">
                  ${hasModDesc
                    ? `<div class="desc-text">${icon('lightbulb')} ${this.esc(this.descriptions.get(modKey))}</div>`
                    : isModLoading
                      ? `<div class="desc-text loading">${icon('lightbulb')} Genererer forklaring…</div>`
                      : `<button class="desc-module-btn" data-module-idx="${i}">${icon('lightbulb')} Hva betyr dette?</button>`
                  }
                </div>
                ${m.features.map((f, j) => {
                  const fKey = `feat:${m.name}:${f.name}`
                  const hasFDesc = this.descriptions.has(fKey)
                  const isFLoading = this.loadingDescriptions.has(fKey)
                  return `
                    <div class="feature-row ${f.done ? 'done' : ''} ${hasFDesc ? 'expanded' : ''}">
                      <span class="feature-check">${f.done ? '✓' : '○'}</span>
                      <span class="feature-name clickable" data-module-idx="${i}" data-feature-idx="${j}" title="Klikk for forklaring">${this.esc(f.name)}</span>
                      ${isFLoading ? '<span class="desc-feat-loading">…</span>' : ''}
                    </div>
                    ${hasFDesc ? `<div class="desc-text feat-desc">${icon('lightbulb')} ${this.esc(this.descriptions.get(fKey))}</div>` : ''}
                    ${isFLoading ? `<div class="desc-text feat-desc loading">${icon('lightbulb')} Genererer forklaring…</div>` : ''}
                  `
                }).join('')}
              </div>
            `
          } else {
            details = '<div class="module-details"><div class="empty-small">Ingen oppgaver definert</div></div>'
          }
        }

        return `
          <div class="module-item ${isExpanded ? 'expanded' : ''}" data-module-idx="${i}">
            <div class="module-top" title="Klikk for å ${isExpanded ? 'skjule' : 'vise'} detaljer">
              <div class="module-name">${this.esc(m.name)}</div>
              <div class="module-status ${status}">${statusText}</div>
            </div>
            <div class="module-meta">${done}/${total} oppgaver</div>
            <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
            ${details}
          </div>
        `
      }).join('')

      // Add new function form
      const addForm = this._showAddFunction ? `
        <div class="mod-add-form">
          <div class="mod-add-title">Legg til ny funksjon</div>
          <input type="text" class="mod-add-name" placeholder="Navn på funksjonen (f.eks. Innloggingsside)" />
          <textarea class="mod-add-desc" rows="2" placeholder="Valgfri beskrivelse..."></textarea>
          <div class="mod-add-actions">
            <button class="mod-add-cancel">Avbryt</button>
            <button class="mod-add-save">Legg til i Byggeliste</button>
          </div>
        </div>
      ` : `
        <button class="mod-add-btn" id="btn-add-function">+ Legg til funksjon</button>
      `

      return explainer + toggleBtns + `<div class="module-list">${items}</div>` + addForm
    }

    // ─── Feil-fane ──────────────────────────────────────

    renderErrorsTab() {
      const errors = this.errors.errors || []
      const filtered = this._errorFilter ? errors.filter(e => e.type === this._errorFilter) : errors

      // Count by type
      const counts = { error: 0, warn: 0, uncaught: 0, promise: 0 }
      errors.forEach(e => { if (counts[e.type] !== undefined) counts[e.type]++; else counts.error++ })

      const explainer = `
        <div class="errors-explainer">
          <div class="errors-explainer-title">Automatisk feilhåndtering</div>
          <div class="errors-explainer-text">Ved vanlig vibekoding må du selv åpne Console i nettleseren, kopiere feilmeldingen og lime den inn til AI. Kit CC gjør dette automatisk — feil fra appen din fanges opp her i sanntid, og AI leser dem selv neste gang du bygger. Når feilen er fikset, fjernes den fra listen.</div>
        </div>
      `

      const filterBtns = `
        <div class="error-toolbar">
          <div class="error-filters">
            <button class="filter-btn ${!this._errorFilter ? 'active' : ''}" data-error-filter="">Alle (${errors.length})</button>
            <button class="filter-btn filter-error ${this._errorFilter === 'error' ? 'active' : ''}" data-error-filter="error">Feil (${counts.error})</button>
            <button class="filter-btn filter-warn ${this._errorFilter === 'warn' ? 'active' : ''}" data-error-filter="warn">Advarsel (${counts.warn})</button>
            <button class="filter-btn filter-uncaught ${this._errorFilter === 'uncaught' ? 'active' : ''}" data-error-filter="uncaught">Ukjent (${counts.uncaught})</button>
            <button class="filter-btn filter-promise ${this._errorFilter === 'promise' ? 'active' : ''}" data-error-filter="promise">Promise (${counts.promise})</button>
          </div>
          <button class="clear-errors-btn" id="btn-clear-errors">Tøm feil</button>
        </div>
      `

      if (!filtered.length) {
        return explainer + filterBtns + '<div class="empty">Ingen feil fanget' + (this._errorFilter ? ' med dette filteret' : '') + '</div>'
      }

      const items = filtered.slice(-30).reverse().map(e => {
        const time = e.timestamp ? new Date(e.timestamp).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''
        const typeLabel = { error: 'FEIL', warn: 'ADVARSEL', uncaught: 'KRASJ', promise: 'PROMISE' }[e.type] || e.type
        const typeClass = e.type || 'error'

        // Extract source info
        let source = ''
        if (e.source) {
          const file = e.source.split('/').pop()
          source = file + (e.line ? ':' + e.line : '')
        } else if (e.data && typeof e.data === 'object' && e.data.source) {
          const file = e.data.source.split('/').pop()
          source = file + (e.data.line ? ':' + e.data.line : '')
        }

        const message = e.message || (typeof e.data === 'string' ? e.data : (e.data?.message || e.data?.reason || JSON.stringify(e.data)))

        // Status badges
        let statusBadge = ''
        if (e.status === 'fixing') {
          statusBadge = '<span class="error-status-badge fixing">AI fikser...</span>'
        } else if (e.status === 'unfixable') {
          statusBadge = '<span class="error-status-badge unfixable">Ikke auto-fiksbar</span>'
        }

        // Count badge for dedupliserte feil
        let countBadge = ''
        if (e.count > 1) {
          countBadge = `<span class="error-count-badge">${e.count}x</span>`
        }

        return `
          <div class="error-entry error-${typeClass}${e.status === 'fixing' ? ' error-fixing' : ''}${e.status === 'unfixable' ? ' error-unfixable' : ''}">
            <div class="error-header">
              <span class="error-type-badge ${typeClass}">${typeLabel}</span>
              ${statusBadge}
              ${countBadge}
              ${source ? '<span class="error-source">' + this.esc(source) + '</span>' : ''}
              <span class="error-time">${time}</span>
            </div>
            <div class="error-message">${this.esc(message)}</div>
          </div>
        `
      }).join('')

      return explainer + filterBtns + items
    }

    async fetchSettingsData() {
      try {
        const res = await authFetch(`${API_BASE}/settings`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        this.settingsData = await res.json()
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke laste innstillinger:', err)
        this.settingsData = null
      }
      this.settingsLoaded = true
      this.render()
    }

    showToast(message, type = 'success') {
      if (this._toastTimer) clearTimeout(this._toastTimer)

      // Remove existing toast
      const existing = document.getElementById('kit-cc-toast')
      if (existing) existing.remove()

      // Create toast in light DOM (shadow DOM has rendering issues with position:fixed)
      const toast = document.createElement('div')
      toast.id = 'kit-cc-toast'
      const isLight = this.theme === 'light'
      toast.style.cssText = `
        position: fixed;
        bottom: calc(5vh + 60px);
        left: 50%;
        transform: translateX(-50%);
        background: ${isLight ? '#ffffff' : '#2c2c38'};
        border: 1px solid ${isLight ? '#d8d8e4' : '#454558'};
        border-left: 3px solid ${type === 'error' ? '#EF4444' : '#22c55e'};
        color: ${isLight ? '#1e1e2e' : '#E4E4E7'};
        padding: 14px 28px;
        border-radius: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        line-height: 1.5;
        max-width: 480px;
        text-align: center;
        z-index: 2147483647;
        box-shadow: ${isLight ? '0 8px 32px rgba(0,0,0,0.15)' : '0 12px 40px rgba(0,0,0,0.4)'};
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.3s ease;
      `
      toast.textContent = message
      document.body.appendChild(toast)

      // Auto-hide: fade out after 3.5s, then remove
      this._toastTimer = setTimeout(() => {
        toast.style.opacity = '0'
        setTimeout(() => toast.remove(), 300)
      }, 3500)
    }

    getSettingConfirmText(field, value) {
      if (field === 'builderMode') {
        const labels = {
          'ai-bestemmer': 'AI bestemmer det meste selv nå. Du slipper å godkjenne hvert steg.',
          'samarbeid': 'Dere samarbeider nå. AI spør deg ved viktige valg.',
          'detaljstyrt': 'Du styrer nå. AI gjør ingenting uten din godkjenning.'
        }
        return labels[value] || `Byggemodus er nå satt til ${value}.`
      }
      if (field === 'classification.userLevel') {
        const labels = {
          'utvikler': 'AI prater teknisk nå — kode, API-er og arkitektur.',
          'erfaren-vibecoder': 'AI forklarer i et balansert nivå — teknisk men forståelig.',
          'ny-vibecoder': 'AI holder det enkelt nå — ingen sjargong, bare klare forklaringer.'
        }
        return labels[value] || `Kommunikasjonsnivå er nå satt til ${value}.`
      }
      if (field === 'imageStrategy.type') {
        if (Array.isArray(value) && value.length === 0) {
          return 'Bilder er slått av. Appen bruker kun tekst og ikoner.'
        }
        const labels = {
          'own-images': 'egne bilder',
          'replicate': 'AI-genererte bilder'
        }
        if (Array.isArray(value)) {
          const names = value.map(v => labels[v] || v)
          return `Bildestrategi oppdatert: ${names.join(' og ')}.`
        }
        return `Bildestrategi oppdatert.`
      }
      return `Innstillingen ble lagret.`
    }

    async updateSetting(field, value) {
      this.settingsSaving = field
      this.render()

      try {
        const res = await authFetch(`${API_BASE}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value })
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        // Oppdater lokal state
        this.settingsLoaded = false // force refresh
        // Oppdater prosjektstate også
        this.fetchData()

        // Show confirmation toast
        const confirmText = this.getSettingConfirmText(field, value)
        this.showToast(confirmText)
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke lagre innstilling:', err)
        this.showToast('Kunne ikke lagre innstillingen. Prøv igjen.', 'error')
      }

      this.settingsSaving = null
      this.render()
    }

    // ─── Data Panels (F32) ─────────────────────────────────

    renderDataTab() {
      const explainer = `
        <div class="tab-explainer">
          <div class="tab-explainer-title">Innsikt og analyse</div>
          <div class="tab-explainer-text">Få detaljert innsikt i prosjektet ditt — fra filstruktur og kodestatistikk til avhengigheter og ytelse. Velg et datapanel fra menyen for å utforske.</div>
        </div>
      `
      if (!this.dataPanelList) {
        this.fetchDataPanels()
        return explainer + '<div class="dp-loading">Laster datapaneler...</div>'
      }

      const panels = this.dataPanelList
      const active = this.dataPanelActive
      const data = this.dataPanelData

      return explainer + `
        <div class="dp-container">
          <div class="dp-nav">
            ${panels.map(p => `
              <button class="dp-nav-btn ${active === p.id ? 'active' : ''}" data-dp-id="${p.id}">
                <span class="dp-nav-icon">${icon(p.icon || p.id, 16)}</span>
                <div class="dp-nav-text">
                  <span class="dp-nav-label">${p.name}</span>
                  ${p.desc ? `<span class="dp-nav-desc">${p.desc}</span>` : ''}
                </div>
              </button>
            `).join('')}
          </div>

          <div class="dp-content">
            ${!active ? `
              <div class="dp-placeholder">
                <div class="dp-placeholder-icon">${icon('chart', 48)}</div>
                <div class="dp-placeholder-text">Velg et datapanel fra menyen til venstre</div>
              </div>
            ` : this.dataPanelLoading ? `
              <div class="dp-loading">Laster ${panels.find(p => p.id === active)?.name || active}...</div>
            ` : data ? this.renderDataPanelContent(active, data) : `
              <div class="dp-loading">Ingen data tilgjengelig</div>
            `}
          </div>
        </div>
      `
    }

    renderDataPanelContent(panelId, data) {
      const hint = data.hint ? `<div class="dp-hint">${this.esc(data.hint)}</div>` : ''

      switch (panelId) {
        case 'activity': return this.renderPanelActivity(data, hint)
        case 'decisions': return this.renderPanelDecisions(data, hint)
        case 'errors': return this.renderPanelErrors(data, hint)
        case 'session': return this.renderPanelSession(data, hint)
        case 'quality': return this.renderPanelQuality(data, hint)
        case 'modules': return this.renderPanelModules(data, hint)
        case 'risks': return this.renderPanelRisks(data, hint)
        case 'progresslog': return this.renderPanelProgressLog(data, hint)
        case 'deliverables': return this.renderPanelDeliverables(data, hint)
        case 'metrics': return this.renderPanelMetrics(data, hint)
        case 'dependencies': return this.renderPanelDependencies(data, hint)
        case 'scope': return this.renderPanelScope(data, hint)
        case 'autonomy': return this.renderPanelAutonomy(data, hint)
        default: return `<div class="dp-generic">${hint}<pre>${JSON.stringify(data, null, 2)}</pre></div>`
      }
    }

    // ─── Individual panel renderers ─────────────────────

    renderPanelActivity(data, hint) {
      const entries = data.entries || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-stat-row">
            <span class="dp-stat-label">Totalt hendelser</span>
            <span class="dp-stat-value">${data.totalEvents || 0}</span>
          </div>
          <div class="dp-list">
            ${entries.length === 0 ? '<div class="dp-empty">Ingen aktivitet ennå</div>' :
              entries.slice(0, 50).map(e => `
                <div class="dp-list-item">
                  <span class="dp-event-type dp-type-${(e.type || 'unknown').toLowerCase()}">${e.type || '?'}</span>
                  <span class="dp-event-desc">${this.esc(e.description || e.fields?.desc || e.raw || '')}</span>
                  <span class="dp-event-time">${this.esc(e.time || '')}</span>
                </div>
              `).join('')}
          </div>
        </div>
      `
    }

    renderPanelDecisions(data, hint) {
      const decisions = data.decisions || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-stat-row">
            <span class="dp-stat-label">Beslutninger tatt</span>
            <span class="dp-stat-value">${data.total || 0}</span>
          </div>
          <div class="dp-list">
            ${decisions.length === 0 ? '<div class="dp-empty">Ingen beslutninger logget ennå</div>' :
              decisions.map(d => `
                <div class="dp-card">
                  <div class="dp-card-header">
                    <span class="dp-card-time">${d.time || ''}</span>
                  </div>
                  <div class="dp-card-body">${this.esc(d.what || '')}</div>
                  ${d.reason ? `<div class="dp-card-footer">${this.esc(d.reason)}</div>` : ''}
                </div>
              `).join('')}
          </div>
        </div>
      `
    }

    renderPanelErrors(data, hint) {
      const errors = data.errors || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-stat-row">
            <span class="dp-stat-label">Feil totalt</span>
            <span class="dp-stat-value ${errors.length > 0 ? 'dp-stat-error' : ''}">${data.total || 0}</span>
          </div>
          <div class="dp-list">
            ${errors.length === 0 ? '<div class="dp-empty">Ingen feil registrert</div>' :
              errors.map(e => `
                <div class="dp-card dp-card-error">
                  <div class="dp-card-header">
                    <span class="dp-card-time">${e.time || ''}</span>
                  </div>
                  <div class="dp-card-body">${this.esc(e.description || '')}</div>
                  ${e.fix ? `<div class="dp-card-fix">Fiks: ${this.esc(e.fix)}</div>` : ''}
                </div>
              `).join('')}
          </div>
        </div>
      `
    }

    renderPanelSession(data, hint) {
      const s = data.stats || {}
      return `
        <div class="dp-panel">
          ${hint}
          ${data.sessionId ? `<div class="dp-session-id">Sesjon: ${this.esc(data.sessionId)}</div>` : ''}
          ${data.startedAt ? `<div class="dp-session-id">Startet: ${this.esc(new Date(data.startedAt).toLocaleString('nb-NO'))}</div>` : ''}
          <div class="dp-metrics-grid">
            <div class="dp-metric"><div class="dp-metric-val">${s.filesChanged || 0}</div><div class="dp-metric-label">Filer endret</div></div>
            <div class="dp-metric"><div class="dp-metric-val">${s.commits || 0}</div><div class="dp-metric-label">Commits</div></div>
            <div class="dp-metric"><div class="dp-metric-val">${s.tasksStarted || 0}</div><div class="dp-metric-label">Oppgaver startet</div></div>
            <div class="dp-metric"><div class="dp-metric-val">${s.tasksCompleted || 0}</div><div class="dp-metric-label">Oppgaver fullført</div></div>
            <div class="dp-metric"><div class="dp-metric-val ${s.errors > 0 ? 'dp-stat-error' : ''}">${s.errors || 0}</div><div class="dp-metric-label">Feil</div></div>
            <div class="dp-metric"><div class="dp-metric-val">${s.contextPauses || 0}</div><div class="dp-metric-label">Kontekstpauser</div></div>
          </div>
          ${(data.recentFiles || []).length > 0 ? `
            <div class="dp-section-title">Nylige filer</div>
            <div class="dp-file-list">
              ${data.recentFiles.map(f => `<div class="dp-file-item">${this.esc(f)}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `
    }

    renderPanelQuality(data, hint) {
      const phases = data.phases || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-list">
            ${phases.map(p => {
              const statusColor = p.status === 'completed' ? '#22c55e' : p.status === 'active' ? '#8A00FF' : '#71717A'
              return `
                <div class="dp-quality-row">
                  <span class="dp-quality-dot" style="background: ${statusColor}"></span>
                  <span class="dp-quality-name">Fase ${p.num}: ${this.esc(p.name)}</span>
                  <span class="dp-quality-stats">${this.esc(String(p.completedSteps))} fullført${p.skippedSteps > 0 ? `, ${this.esc(String(p.skippedSteps))} hoppet over` : ''}</span>
                </div>
              `
            }).join('')}
          </div>
          ${(data.gateOverrides || []).length > 0 ? `
            <div class="dp-section-title">Gate-unntak</div>
            ${data.gateOverrides.map(g => `
              <div class="dp-card dp-card-error">
                <div class="dp-card-body">Fase ${g.phase || '?'}: ${this.esc(g.reason || 'Ingen begrunnelse')}</div>
              </div>
            `).join('')}
          ` : ''}
        </div>
      `
    }

    renderPanelModules(data, hint) {
      const modules = data.modules || []
      return `
        <div class="dp-panel">
          ${hint}
          ${!data.found ? '<div class="dp-empty">Ingen modulregister funnet</div>' : `
            <div class="dp-list">
              ${modules.map(m => `
                <div class="dp-module-card">
                  <div class="dp-module-header">
                    <span class="dp-module-name">${this.esc(m.name)}</span>
                    <span class="dp-module-status dp-status-${this.esc(m.status.toLowerCase())}">${this.esc(m.status)}</span>
                  </div>
                  <div class="dp-progress-bar">
                    <div class="dp-progress-fill" style="width: ${m.progress}%"></div>
                  </div>
                  <div class="dp-module-stats">${m.done}/${m.total} funksjoner (${m.progress}%)</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `
    }

    renderPanelRisks(data, hint) {
      const items = data.items || []
      const counts = data.counts || {}
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-metrics-grid dp-metrics-3">
            <div class="dp-metric"><div class="dp-metric-val dp-stat-error">${counts.high || 0}</div><div class="dp-metric-label">Høy</div></div>
            <div class="dp-metric"><div class="dp-metric-val dp-stat-warn">${counts.medium || 0}</div><div class="dp-metric-label">Medium</div></div>
            <div class="dp-metric"><div class="dp-metric-val">${counts.low || 0}</div><div class="dp-metric-label">Lav</div></div>
          </div>
          ${items.length === 0 ? '<div class="dp-empty">Ingen risikoer eller blokkere identifisert</div>' : `
            <div class="dp-list">
              ${items.map(i => `
                <div class="dp-card dp-severity-${i.severity}">
                  <div class="dp-card-header">
                    <span class="dp-risk-type">${i.type === 'gate-override' ? 'Gate-unntak' : i.type === 'pending-decision' ? 'Ventende beslutning' : 'Hoppet over'}</span>
                  </div>
                  <div class="dp-card-body">${this.esc(i.label)}</div>
                  ${i.detail ? `<div class="dp-card-footer">${this.esc(i.detail)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `
    }

    renderPanelCheckpoints(data, hint) {
      const checkpoints = data.checkpoints || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-stat-row">
            <span class="dp-stat-label">Lagringspunkter</span>
            <span class="dp-stat-value">${data.total || 0}</span>
          </div>
          ${checkpoints.length === 0 ? '<div class="dp-empty">Ingen checkpoints opprettet ennå</div>' : `
            <div class="dp-timeline">
              ${checkpoints.map(c => `
                <div class="dp-timeline-item">
                  <div class="dp-timeline-dot"></div>
                  <div class="dp-timeline-content">
                    <div class="dp-timeline-title">${this.esc(c.description || c.type || 'Checkpoint')}</div>
                    <div class="dp-timeline-meta">Fase ${c.phase || '?'} ${c.timestamp ? ' — ' + new Date(c.timestamp).toLocaleString('nb-NO') : ''}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `
    }

    renderPanelProgressLog(data, hint) {
      const entries = data.entries || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-stat-row">
            <span class="dp-stat-label">Totalt logglinjer</span>
            <span class="dp-stat-value">${data.total || 0}</span>
          </div>
          ${entries.length === 0 ? '<div class="dp-empty">Ingen logg ennå</div>' : `
            <div class="log-feed">${entries.map(e => {
              const timestamp = e.formattedTime?.fullDisplay || e.time || ''
              return `
              <div class="log-entry">
                <span class="log-icon">${this.esc(e.icon || '')}</span>
                <span class="log-text">${this.esc(e.description || e.raw || '')}</span>
                <span class="log-time">${this.esc(timestamp)}</span>
              </div>
            `}).join('')}</div>
          `}
        </div>
      `
    }

    renderPanelIntegrations(data, hint) {
      const categories = data.categories || []
      const activeProviders = data.activeProviders || []
      const imgStrategy = data.imageStrategy || {}
      const esc = s => this.esc(s || '')

      const activeSection = activeProviders.length > 0
        ? `<div class="int-active-section">
            <div class="int-active-title">Aktive tilkoblinger</div>
            <div class="int-active-tags">
              ${activeProviders.map(p => `
                <span class="int-active-tag ${p.status === 'active' ? 'tag-active' : 'tag-detected'}">
                  ${p.name}${p.status === 'detected' ? ' (oppdaget)' : ''}
                </span>
              `).join('')}
            </div>
          </div>`
        : `<div class="int-active-section">
            <div class="int-active-empty">Ingen tilkoblinger oppdaget enn\u00e5. AI analyserer prosjektet automatisk.</div>
          </div>`

      return `
        <div class="dp-panel">
          ${hint}
          ${activeSection}

          <div class="int-custom-section">
            <div class="int-custom-label">Finner du ikke tjenesten du leter etter?</div>
            <div class="int-custom-sublabel">Skriv inn navnet p\u00e5 en tjeneste eller et verkt\u00f8y du vil koble til appen. Den havner i byggelisten, og AI setter den opp neste gang du fortsetter \u00e5 bygge.</div>
            <div class="int-custom">
              <input type="text" id="int-custom-input" placeholder="F.eks. Context7, Stripe, Supabase..." />
              <button id="int-custom-btn">Legg til i byggelisten</button>
            </div>
          </div>
          <div id="int-custom-confirm" class="int-confirm" style="display:none"></div>

          <div class="int-section-title">Legg til integrasjoner</div>

          ${categories.map(cat => {
            let strategyBanner = ''
            if (cat.id === 'images') {
              const types = imgStrategy.types || []
              const model = imgStrategy.replicateModel
              const MODEL_NAMES = {
                'black-forest-labs/flux-pro': 'Flux Pro',
                'black-forest-labs/flux-schnell': 'Flux Schnell',
                'google/imagen-3': 'Imagen 3 (Google)',
                'replicate': 'Replicate'
              }
              if (types.includes('replicate') && model) {
                const modelName = MODEL_NAMES[model] || model
                const hasOwn = types.includes('own-images')
                strategyBanner = `<div class="int-strategy-banner active">Bildestrategi: AI-genererte bilder via ${esc(modelName)}${hasOwn ? ' + egne bilder' : ''}. <a href="#" class="int-strategy-link" data-action="open-settings">Endre i Innstillinger</a></div>`
              } else if (types.includes('own-images')) {
                strategyBanner = `<div class="int-strategy-banner active">Bildestrategi: Egne bilder. <a href="#" class="int-strategy-link" data-action="open-settings">Endre i Innstillinger</a></div>`
              } else {
                strategyBanner = `<div class="int-strategy-banner none">Ingen bildestrategi valgt. <a href="#" class="int-strategy-link" data-action="open-settings">Velg i Innstillinger</a></div>`
              }
            }
            return `
            <div class="int-category">
              <div class="int-cat-header">
                <div class="int-cat-name">${cat.name}</div>
                <div class="int-cat-why">${cat.why || cat.description}</div>
              </div>
              ${strategyBanner}
              <div class="int-cards">
                ${cat.providers.map(p => {
                  // F43: 6-state integration status
                  const st = p.status || 'available'
                  const STATUS_BADGES = {
                    active: '<span class="int-badge active">\u2713 Aktiv</span>',
                    connected: '<span class="int-badge connected">\u2713 Tilkoblet</span>',
                    configuring: '<span class="int-badge configuring">\u2699 Konfigurerer</span>',
                    auth_required: '<span class="int-badge auth-required">\u26A0 Mangler nøkkel</span>',
                    error: '<span class="int-badge error-badge">\u2717 Feil</span>',
                    detected: '<span class="int-badge detected">Oppdaget</span>',
                    setup: '<span class="int-badge setup">Lagt til</span>',
                    available: p.isRecommended ? '<span class="int-badge recommended">Anbefalt</span>' : ''
                  }
                  const statusClass = ['active', 'connected'].includes(st) ? 'active' : ['configuring', 'setup'].includes(st) ? 'setup' : st === 'detected' ? 'detected' : st === 'auth_required' ? 'auth-required' : st === 'error' ? 'error-status' : ''
                  const isActive = st === 'active' || st === 'connected'
                  const isSetup = st === 'setup' || st === 'configuring'
                  const pros = p.pros || []
                  const cons = p.cons || []
                  return `
                  <div class="int-card ${statusClass}">
                    <div class="int-card-top">
                      <div class="int-card-title-row">
                        <span class="int-card-name">${p.isRecommended ? '<span class="int-star" title="Anbefalt">\u2605</span>' : ''}${esc(p.name)}</span>
                        ${STATUS_BADGES[st] || ''}
                      </div>
                      <div class="int-card-desc">${esc(p.desc)}</div>
                    </div>

                    <div class="int-card-details${this.expandedIntegrations.has(p.id) ? ' open' : ''}" data-int-details="${esc(p.id)}">
                      ${pros.length > 0 ? `
                        <div class="int-detail-section">
                          <div class="int-detail-label">Fordeler</div>
                          ${pros.map(pro => `<div class="int-pro">+ ${esc(pro)}</div>`).join('')}
                        </div>
                      ` : ''}
                      ${cons.length > 0 ? `
                        <div class="int-detail-section">
                          <div class="int-detail-label">Ulemper</div>
                          ${cons.map(con => `<div class="int-con">\u2013 ${esc(con)}</div>`).join('')}
                        </div>
                      ` : ''}
                      ${p.pricing ? `
                        <div class="int-detail-section">
                          <div class="int-detail-label">Pris</div>
                          <div class="int-pricing">${esc(p.pricing)}</div>
                        </div>
                      ` : ''}
                      ${p.bestFor ? `
                        <div class="int-detail-section">
                          <div class="int-detail-label">Passer for</div>
                          <div class="int-bestfor">${esc(p.bestFor)}</div>
                        </div>
                      ` : ''}
                      ${p.credentials && p.credentials.length > 0 ? `
                        <div class="int-detail-section cred-section">
                          <div class="int-detail-label">Tilkobling</div>
                          <div class="cred-form" data-cred-provider="${esc(p.id)}">
                            ${p.credentials.map(c => `
                              <div class="cred-field">
                                <label class="cred-label">${esc(c.label)}</label>
                                <input class="cred-input" type="${c.type === 'secret' ? 'password' : 'text'}" data-cred-env="${esc(c.env)}" placeholder="${esc(c.env)}" autocomplete="off" />
                                ${c.helpText ? `<div class="cred-help">${esc(c.helpText)}${c.helpUrl && (c.helpUrl.startsWith('https://') || c.helpUrl.startsWith('http://')) ? ` <a href="${esc(c.helpUrl)}" target="_blank" rel="noopener">Hent nøkkel</a>` : ''}</div>` : ''}
                              </div>
                            `).join('')}
                            <button class="cred-save-btn" data-cred-save="${esc(p.id)}">Lagre tilkobling</button>
                          </div>
                        </div>
                      ` : ''}
                    </div>

                    <div class="int-card-footer">
                      <button class="int-toggle-btn" data-int-toggle="${esc(p.id)}">${this.expandedIntegrations.has(p.id) ? 'Skjul detaljer' : 'Vis detaljer'}</button>
                      ${!isActive && !isSetup ? `
                        <button class="int-add-btn" data-int-id="${esc(p.id)}" data-int-name="${esc(p.name)}" data-int-cat="${esc(cat.name)}">Legg til</button>
                      ` : ''}
                    </div>
                  </div>`
                }).join('')}
              </div>
            </div>
          `}).join('')}
        </div>
      `
    }

    renderPanelDeliverables(data, hint) {
      const files = data.files || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-stat-row">
            <span class="dp-stat-label">Filer opprettet/endret</span>
            <span class="dp-stat-value">${data.total || 0}</span>
          </div>
          ${files.length === 0 ? '<div class="dp-empty">Ingen leveranser registrert ennå</div>' : `
            <div class="dp-list">
              ${files.slice(0, 50).map(f => `
                <div class="dp-list-item">
                  <span class="dp-file-op dp-op-${f.operation}">${f.operation === 'created' ? '+' : '~'}</span>
                  <span class="dp-file-path">${this.esc(f.path)}</span>
                  <span class="dp-event-time">${this.esc(f.time || '')}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `
    }

    renderPanelMetrics(data, hint) {
      const eventCounts = data.eventCounts || {}
      const tasksPerPhase = data.tasksPerPhase || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-metrics-grid">
            <div class="dp-metric"><div class="dp-metric-val">${data.totalEvents || 0}</div><div class="dp-metric-label">Hendelser totalt</div></div>
            <div class="dp-metric"><div class="dp-metric-val">${data.completedSteps || 0}</div><div class="dp-metric-label">Steg fullført</div></div>
            <div class="dp-metric"><div class="dp-metric-val">${data.skippedSteps || 0}</div><div class="dp-metric-label">Steg hoppet over</div></div>
            <div class="dp-metric"><div class="dp-metric-val ${parseInt(data.errorRate) > 5 ? 'dp-stat-error' : ''}">${data.errorRate || '0%'}</div><div class="dp-metric-label">Feilrate</div></div>
            ${data.avgMinutesPerTask != null ? `<div class="dp-metric"><div class="dp-metric-val">${data.avgMinutesPerTask} min</div><div class="dp-metric-label">Snitt per oppgave</div></div>` : ''}
          </div>
          ${tasksPerPhase.length > 0 ? `
            <div class="dp-section-title">Fullførte steg per fase</div>
            <div class="dp-bar-chart">
              ${tasksPerPhase.map(t => {
                const maxCount = Math.max(...tasksPerPhase.map(x => x.completed), 1)
                const pct = Math.round((t.completed / maxCount) * 100)
                return `
                  <div class="dp-bar-row">
                    <span class="dp-bar-label">F${t.phase}</span>
                    <div class="dp-bar-track"><div class="dp-bar-fill" style="width: ${pct}%"></div></div>
                    <span class="dp-bar-count">${t.completed}</span>
                  </div>
                `
              }).join('')}
            </div>
          ` : ''}
          ${Object.keys(eventCounts).length > 0 ? `
            <div class="dp-section-title">Hendelser etter type</div>
            <div class="dp-tag-list">
              ${Object.entries(eventCounts).map(([type, count]) => `<span class="dp-tag">${type}: ${count}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `
    }

    renderPanelDependencies(data, hint) {
      const modules = data.modules || []
      return `
        <div class="dp-panel">
          ${hint}
          ${modules.length === 0 ? '<div class="dp-empty">Ingen moduler registrert</div>' : `
            <div class="dp-list">
              ${modules.map(m => `
                <div class="dp-dep-card">
                  <div class="dp-dep-header">
                    <span class="dp-dep-status dp-dep-${m.status}">${m.status === 'done' ? icon('circle-check') : m.status === 'building' ? icon('hammer') : icon('clock')}</span>
                    <span class="dp-dep-name">${this.esc(m.name)}</span>
                    <span class="dp-dep-count">${m.done}/${m.total}</span>
                  </div>
                  ${m.features.length > 0 ? `
                    <div class="dp-dep-features">${this.esc(m.features.join(', '))}</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `
    }

    renderPanelScope(data, hint) {
      const changes = data.changes || []
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-stat-row">
            <span class="dp-stat-label">Scope-endringer</span>
            <span class="dp-stat-value">${data.total || 0}</span>
          </div>
          ${changes.length === 0 ? '<div class="dp-empty">Ingen oppgaver har blitt omprioritert</div>' : `
            <div class="dp-list">
              ${changes.map(c => `
                <div class="dp-card">
                  <div class="dp-card-header">
                    <span class="dp-scope-id">${this.esc(c.taskId)}</span>
                    <span class="dp-scope-change">${this.esc(c.from)} → ${this.esc(c.to)}</span>
                  </div>
                  ${c.reason ? `<div class="dp-card-footer">${this.esc(c.reason)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `
    }

    renderPanelAutonomy(data, hint) {
      const zones = data.zones || {}
      return `
        <div class="dp-panel">
          ${hint}
          <div class="dp-section-title">Fase ${data.phase}: ${this.esc(data.phaseName)}</div>
          <div class="dp-metrics-grid dp-metrics-3">
            <div class="dp-metric dp-zone-green"><div class="dp-metric-val">${zones.green?.count || 0}</div><div class="dp-metric-label">${zones.green?.label || 'Grønn'}</div></div>
            <div class="dp-metric dp-zone-yellow"><div class="dp-metric-val">${zones.yellow?.count || 0}</div><div class="dp-metric-label">${zones.yellow?.label || 'Gul'}</div></div>
            <div class="dp-metric dp-zone-red"><div class="dp-metric-val">${zones.red?.count || 0}</div><div class="dp-metric-label">${zones.red?.label || 'Rød'}</div></div>
          </div>
          ${['green', 'yellow', 'red'].map(zone => {
            const z = zones[zone]
            if (!z || z.tasks.length === 0) return ''
            const color = zone === 'green' ? '#22c55e' : zone === 'yellow' ? '#eab308' : '#ef4444'
            return `
              <div class="dp-section-title" style="color: ${color}">${this.esc(z.label)} — ${this.esc(z.desc)}</div>
              <div class="dp-list">
                ${z.tasks.map(t => `
                  <div class="dp-list-item">
                    <span class="dp-event-type" style="background: ${color}20; color: ${color}">${this.esc(t.id)}</span>
                    <span class="dp-event-desc">${this.esc(t.name)}</span>
                    <span class="dp-event-time">${this.esc(t.status)}</span>
                  </div>
                `).join('')}
              </div>
            `
          }).join('')}
        </div>
      `
    }

    async fetchDataPanels() {
      try {
        const res = await authFetch(`${API_BASE}/data/panels`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        this.dataPanelList = json.panels || []
      } catch (err) {
        console.error('Kit CC Monitor: Kunne ikke laste datapaneler:', err)
        this.dataPanelList = []
      }
      this.render()
    }

    async fetchDataPanel(panelId) {
      this.dataPanelActive = panelId
      this.dataPanelLoading = true
      this.dataPanelData = null
      this.render()

      try {
        const res = await authFetch(`${API_BASE}/data/${panelId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        this.dataPanelData = await res.json()
      } catch (err) {
        console.error(`Kit CC Monitor: Kunne ikke laste panel ${panelId}:`, err)
        this.dataPanelData = null
      }
      this.dataPanelLoading = false
      this.render()
    }

    // ─── Events ─────────────────────────────────────────

    attachEvents() {
      const fab = this.shadow.getElementById('fab')
      const close = this.shadow.getElementById('btn-close')
      const retryBtn = this.shadow.getElementById('btn-retry-sse')

      if (fab) {
        fab.addEventListener('click', () => {
          this.setMode(this.mode === 'icon' ? 'fullscreen' : 'icon')
        })
      }
      if (close) close.addEventListener('click', () => this.setMode('icon'))

      // Theme toggle
      const themeBtn = this.shadow.getElementById('btn-theme')
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          this.theme = this.theme === 'dark' ? 'light' : 'dark'
          localStorage.setItem('kit-cc-theme', this.theme)
          this.render()
        })
      }

      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this._sseRetryCount = 0 // Reset retry counter
          this._sseConnectionFailed = false
          this.connectSSE()
        })
      }

      // "Slik fungerer det"-popup (åpne/lukke)
      const hiwBtn = this.shadow.getElementById('btn-how-it-works')
      if (hiwBtn) hiwBtn.addEventListener('click', () => { this.showHowItWorks = true; this.render() })
      const hiwClose = this.shadow.getElementById('btn-close-howitworks')
      if (hiwClose) hiwClose.addEventListener('click', () => { this.showHowItWorks = false; this.render() })
      const hiwOverlay = this.shadow.getElementById('hiw-overlay')
      if (hiwOverlay) hiwOverlay.addEventListener('click', () => { this.showHowItWorks = false; this.render() })

      // Navbar items (Dashboard + section tabs)
      this.shadow.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          if (item.dataset.view === 'dashboard') {
            this.currentView = 'dashboard'
            this.selectedPhase = null
            this.phaseDetail = null
            this.phaseTasks = null
          } else if (item.dataset.tab) {
            this.currentTab = item.dataset.tab
            this.currentView = null
            this.selectedPhase = null
          }
          this.render()
        })
      })

      // Phase click handlers (klikkbare faser)
      this.shadow.querySelectorAll('.phase-item.clickable').forEach(item => {
        item.addEventListener('click', () => {
          const num = parseInt(item.dataset.phaseNum)
          if (this.selectedPhase === num) {
            // Klikk på valgt fase lukker detaljvisningen
            this.selectedPhase = null
            this.phaseDetail = null
            this.phaseTasks = null
            this.render()
          } else {
            this.selectedPhase = num
            this.currentView = null
            this.fetchPhaseDetail(num)
            this.fetchPhaseTasks(num)
          }
        })
      })

      // Back button from phase detail — return to dashboard
      const backBtn = this.shadow.getElementById('btn-back-phases')
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.selectedPhase = null
          this.phaseDetail = null
          this.phaseTasks = null
          this.currentView = 'dashboard'
          this.render()
        })
      }

      // Phase detail view tabs (Oppgaver / Oppsummering)
      this.shadow.querySelectorAll('.pt-view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.phaseTasksView = tab.dataset.ptView
          this.render()
        })
      })

      // Task expand/collapse
      this.shadow.querySelectorAll('[data-task-toggle]').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.taskToggle
          if (this.expandedTasks.has(id)) this.expandedTasks.delete(id)
          else this.expandedTasks.add(id)
          this.render()
        })
      })

      // Task activate buttons
      this.shadow.querySelectorAll('.pt-activate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          this.activateTask(
            btn.dataset.activateId,
            btn.dataset.activateName,
            btn.dataset.activateDesc,
            parseInt(btn.dataset.activatePhase)
          )
        })
      })

      // Integration catalog: detail toggle buttons (bruker Set for å bevare state over render)
      this.shadow.querySelectorAll('.int-toggle-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation()
          const id = btn.dataset.intToggle
          if (this.expandedIntegrations.has(id)) {
            this.expandedIntegrations.delete(id)
          } else {
            this.expandedIntegrations.add(id)
          }
          // Oppdater DOM direkte (unngår full re-render)
          const details = this.shadow.querySelector(`[data-int-details="${CSS.escape(id)}"]`)
          if (details) {
            details.classList.toggle('open')
            btn.textContent = this.expandedIntegrations.has(id) ? 'Skjul detaljer' : 'Vis detaljer'
            // Fetch credential status when expanding a provider with credentials
            if (this.expandedIntegrations.has(id)) {
              const credForm = details.querySelector('.cred-form')
              if (credForm) {
                try {
                  const statusRes = await authFetch(`${API_BASE}/credentials/${encodeURIComponent(id)}/status`)
                  if (statusRes.ok) {
                    const statusData = await statusRes.json()
                    for (const [envKey, info] of Object.entries(statusData.keys || {})) {
                      const input = credForm.querySelector(`.cred-input[data-cred-env="${CSS.escape(envKey)}"]`)
                      if (input && info.exists) {
                        input.placeholder = info.masked || 'Allerede konfigurert'
                        input.classList.add('cred-configured')
                      }
                    }
                  }
                } catch {}
              }
            }
          }
        })
      })

      // Integration catalog: add buttons
      this.shadow.querySelectorAll('.int-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          this.addIntegration(
            btn.dataset.intId,
            btn.dataset.intName,
            btn.dataset.intCat
          )
        })
      })

      // Integration catalog: strategy banner "open settings" link
      this.shadow.querySelectorAll('.int-strategy-link[data-action="open-settings"]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.showSettings = true
          this.render()
        })
      })

      // Onboarding: action buttons (F37)
      this.shadow.querySelectorAll('.ob-action-btn[data-ob-settings]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.showSettings = true
          this.highlightSetting = btn.dataset.obSettings || null
          this.render()
          // Scroll to the highlighted setting after render
          if (this.highlightSetting) {
            setTimeout(() => {
              const el = this.shadow.querySelector(`[data-st-field="${CSS.escape(this.highlightSetting)}"]`)
              if (el) el.closest('.st-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              this.highlightSetting = null
            }, 100)
          }
        })
      })
      this.shadow.querySelectorAll('.ob-action-btn[data-ob-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentTab = btn.dataset.obTab
          this.currentView = null
          this.selectedPhase = null
          this.render()
        })
      })

      // Credential save buttons (F38 + F42 validation)
      this.shadow.querySelectorAll('.cred-save-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const providerId = btn.dataset.credSave
          const form = btn.closest('.cred-form')
          if (!form) return
          const creds = {}
          form.querySelectorAll('.cred-input').forEach(input => {
            if (input.value.trim()) creds[input.dataset.credEnv] = input.value.trim()
          })
          if (Object.keys(creds).length === 0) return
          btn.disabled = true
          btn.textContent = 'Validerer...'
          // Clear previous validation feedback
          form.querySelectorAll('.cred-validation').forEach(el => el.remove())

          // F42: Validate first
          try {
            const valRes = await authFetch(`${API_BASE}/credentials/${providerId}/validate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credentials: creds })
            })
            if (valRes.ok) {
              const valData = await valRes.json()
              let hasError = false
              for (const [envKey, result] of Object.entries(valData.results || {})) {
                const input = form.querySelector(`.cred-input[data-cred-env="${CSS.escape(envKey)}"]`)
                if (!input) continue
                const feedback = document.createElement('div')
                feedback.className = `cred-validation ${result.valid ? 'valid' : 'invalid'}`
                feedback.textContent = result.valid ? '\u2713 ' + result.message : '\u2717 ' + result.message
                input.parentElement.appendChild(feedback)
                if (!result.valid) hasError = true
              }
              if (hasError) {
                btn.textContent = 'Valideringsfeil — rett opp og prøv igjen'
                btn.disabled = false
                return
              }
            }
          } catch (valErr) {
            console.warn('[Kit CC Monitor] Validering feilet, fortsetter med lagring:', valErr)
          }

          // Save credentials
          btn.textContent = 'Lagrer...'
          try {
            const res = await authFetch(`${API_BASE}/credentials/${encodeURIComponent(providerId)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credentials: creds })
            })
            if (res.ok) {
              btn.textContent = 'Lagret!'
              btn.classList.add('saved')
              // Refresh integration data to update status badges
              this.integrationsData = null
              this.onboardingData = null
              setTimeout(() => { btn.textContent = 'Lagre tilkobling'; btn.classList.remove('saved'); btn.disabled = false; this.render() }, 1500)
            } else {
              btn.textContent = 'Feil — prøv igjen'
              btn.disabled = false
            }
          } catch {
            btn.textContent = 'Feil — prøv igjen'
            btn.disabled = false
          }
        })
      })

      // Integration catalog: custom input
      const intCustomBtn = this.shadow.getElementById('int-custom-btn')
      const intCustomInput = this.shadow.getElementById('int-custom-input')
      if (intCustomBtn && intCustomInput) {
        const addCustom = () => {
          const name = intCustomInput.value.trim()
          if (name) {
            this.addIntegration(null, name, 'Egendefinert', true)
            intCustomInput.value = ''
          }
        }
        intCustomBtn.addEventListener('click', addCustom)
        intCustomInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') addCustom()
        })
      }

      // Tab-navigering (handled by .nav-item in panel-nav)

      // Checkpoint: gjenopprett-knapper
      this.shadow.querySelectorAll('.cp-restore-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.cpIdx, 10)
          const checkpoints = this.checkpointsData?.checkpoints || []
          if (checkpoints[idx]) {
            this.checkpointConfirm = checkpoints[idx]
            this.render()
          }
        })
      })

      // Checkpoint: bekreftelsesdialog-knapper (to-stegs flyt)
      this.shadow.querySelectorAll('[data-cp-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.cpAction
          if (action === 'save-first' && this.checkpointConfirm) {
            // Steg 1 → lagre sikkerhetskopi
            this.saveSafetyCheckpoint(this.checkpointConfirm.description || 'ukjent')
          } else if (action === 'restore' && this.checkpointConfirm) {
            // Steg 2 → utfør gjenoppretting
            this.executeRestore(this.checkpointConfirm)
          } else if (action === 'cancel') {
            this.checkpointConfirm = null
            this._cpStep = null
            this._cpSafetyId = null
            this.render()
          }
        })
      })

      // Git info: kopier-prompt-knapp
      this.shadow.querySelectorAll('.cp-git-copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const text = btn.dataset.copy
          if (!text) return
          try {
            await navigator.clipboard.writeText(text)
            btn.classList.add('copied')
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            setTimeout(() => {
              btn.classList.remove('copied')
              btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 11V3a1.5 1.5 0 011.5-1.5H11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
            }, 2000)
          } catch {
            this.showToast('Kunne ikke kopiere — prøv å markere teksten manuelt', 'error')
          }
        })
      })

      // Checkpoint: manuell lagring
      const cpSaveBtn = this.shadow.querySelector('.cp-save-btn')
      const cpSaveInput = this.shadow.querySelector('.cp-save-name')
      if (cpSaveBtn && cpSaveInput) {
        const doSave = () => {
          const name = cpSaveInput.value.trim()
          if (name) this.saveManualCheckpoint(name)
        }
        cpSaveBtn.addEventListener('click', doSave)
        cpSaveInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doSave()
        })
        const updateBtnState = () => {
          cpSaveBtn.disabled = !cpSaveInput.value.trim()
        }
        cpSaveInput.addEventListener('input', updateBtnState)
        updateBtnState()
      }

      // Checkpoint: forslags-chips
      this.shadow.querySelectorAll('.cp-suggestion').forEach(chip => {
        chip.addEventListener('click', () => {
          const input = this.shadow.querySelector('.cp-save-name')
          if (input) {
            input.value = chip.textContent
            input.focus()
            const btn = this.shadow.querySelector('.cp-save-btn')
            if (btn) btn.disabled = false
          }
        })
      })

      // Settings: select/dropdown changes
      this.shadow.querySelectorAll('.st-select').forEach(el => {
        el.addEventListener('change', () => {
          this.updateSetting(el.dataset.stField, el.value)
        })
      })

      // Settings: multiselect checkbox changes
      this.shadow.querySelectorAll('.st-checkbox').forEach(el => {
        el.addEventListener('change', () => {
          const fieldPath = el.dataset.stMulti
          const container = el.closest('.st-multiselect')
          const checked = Array.from(container.querySelectorAll('.st-checkbox:checked')).map(cb => cb.value)
          this.updateSetting(fieldPath, checked)
        })
      })

      // Settings: text input (blur to save)
      this.shadow.querySelectorAll('.st-input').forEach(el => {
        el.addEventListener('blur', () => {
          const field = el.dataset.stField
          if (!field) return // skip inputs without data-st-field
          const val = el.value.trim()
          // Bare lagre hvis verdien er endret
          const current = this.settingsData?.editable?.[field]?.value
          if (val !== current) {
            this.updateSetting(field, val)
          }
        })
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') el.blur()
        })
      })

      // Data panel navigation (F32)
      this.shadow.querySelectorAll('.dp-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.fetchDataPanel(btn.dataset.dpId)
        })
      })

      // Error filter buttons
      this.shadow.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._errorFilter = btn.dataset.errorFilter || null
          this.render()
        })
      })

      // Clear errors button
      const clearErrorsBtn = this.shadow.getElementById('btn-clear-errors')
      if (clearErrorsBtn) {
        clearErrorsBtn.addEventListener('click', async () => {
          try {
            await authFetch(`${API_BASE}/errors`, { method: 'DELETE' })
          } catch { /* server may be down, clear locally anyway */ }
          this.errors = { errors: [], total: 0 }
          this.render()
        })
      }

      // ─── Backlog + Chat event handlers ────────────────────

      // Tree item expand/collapse
      this.shadow.querySelectorAll('.bl-tree-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.treeId
          if (this.expandedTreeItems.has(id)) this.expandedTreeItems.delete(id)
          else this.expandedTreeItems.add(id)
          this.render()
        })
      })

      // Conversation list click
      this.shadow.querySelectorAll('.bl-conv-item').forEach(item => {
        item.addEventListener('click', (e) => {
          // Ignorér klikk på slett-knappen
          if (e.target.closest('.bl-conv-delete')) return
          this.loadConversation(item.dataset.convId)
        })
      })

      // Delete conversation buttons
      this.shadow.querySelectorAll('.bl-conv-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const convId = btn.dataset.convDelId
          if (convId) this.deleteConversation(convId)
        })
      })

      // Double-click on conversation title to rename
      this.shadow.querySelectorAll('.bl-conv-title-text').forEach(el => {
        el.addEventListener('dblclick', (e) => {
          e.stopPropagation()
          const convItem = el.closest('.bl-conv-item')
          if (!convItem) return
          const convId = convItem.dataset.convId
          const current = el.textContent
          const newTitle = prompt('Nytt samtalenavn:', current)
          if (newTitle && newTitle.trim() !== current) {
            this.renameConversation(convId, newTitle)
          }
        })
      })

      // New conversation button
      const newConvBtn = this.shadow.getElementById('btn-new-conv')
      if (newConvBtn) {
        newConvBtn.addEventListener('click', () => this.createNewConversation())
      }
      const startConvBtn = this.shadow.getElementById('btn-start-conv')
      if (startConvBtn) {
        startConvBtn.addEventListener('click', () => this.createNewConversation())
      }

      // Chat send button
      const sendBtn = this.shadow.getElementById('bl-chat-send')
      const chatInput = this.shadow.getElementById('bl-chat-input')
      if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', () => {
          this.sendChatMessage(chatInput.value)
          chatInput.value = ''
        })
        chatInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            this.sendChatMessage(chatInput.value)
            chatInput.value = ''
          }
        })
      }

      // Approval accept/reject
      this.shadow.querySelectorAll('.bl-approval-btn.accept').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const idx = parseInt(btn.dataset.msgIdx)
          this.approveTasksFromChat(idx)
        })
      })
      this.shadow.querySelectorAll('.bl-approval-btn.reject').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const idx = parseInt(btn.dataset.msgIdx)
          // Endre = send melding tilbake til AI for revisjon
          const chatInput = this.shadow.getElementById('bl-chat-input')
          if (chatInput) {
            chatInput.value = 'Kan du justere forslaget? Jeg vil endre: '
            chatInput.focus()
          }
        })
      })

      // Settings buttons (header button)
      const openSettingsBtn = this.shadow.getElementById('btn-open-settings')
      if (openSettingsBtn) openSettingsBtn.addEventListener('click', () => { this.showSettings = true; this.render() })

      const closeSettingsBtn = this.shadow.getElementById('btn-close-settings')
      const settingsOverlay = this.shadow.getElementById('bl-settings-overlay')
      if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => { this.showSettings = false; this.expandedProvider = null; this.render() })
      if (settingsOverlay) settingsOverlay.addEventListener('click', () => { this.showSettings = false; this.expandedProvider = null; this.render() })

      // Provider toggle (expand/collapse)
      this.shadow.querySelectorAll('[data-provider-toggle]').forEach(el => {
        el.addEventListener('click', (e) => {
          // Don't toggle if clicking activate/deactivate button
          if (e.target.closest('[data-provider-activate]') || e.target.closest('[data-provider-deactivate]')) return
          const providerId = el.dataset.providerToggle
          if (this.expandedProvider === providerId) {
            this.expandedProvider = null
          } else {
            this.expandedProvider = providerId
            // Hent modeller KUN for konfigurerte providers (unngå unødvendige feilende requests)
            const providerConf = (this.chatStatus?.providers || {})[providerId]
            if (providerConf?.configured) {
              this.fetchModels(false, providerId)
            }
          }
          this.render()
        })
      })

      // Provider save buttons
      this.shadow.querySelectorAll('[data-provider-save]').forEach(btn => {
        btn.addEventListener('click', () => {
          const providerId = btn.dataset.providerSave
          const keyInput = this.shadow.getElementById(`bl-provider-key-${providerId}`)
          const modelSelect = this.shadow.getElementById(`bl-provider-model-${providerId}`)
          const apiKey = keyInput ? keyInput.value.trim() : ''
          const model = modelSelect ? modelSelect.value : ''
          if (apiKey.length >= 20 || model) {
            this.saveProviderSettings(providerId, apiKey.length >= 20 ? apiKey : null, model || null)
          }
        })
      })

      // Provider delete buttons
      this.shadow.querySelectorAll('[data-provider-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
          const providerId = btn.dataset.providerDelete
          this.deleteProvider(providerId)
        })
      })

      // Provider activate buttons
      this.shadow.querySelectorAll('[data-provider-activate]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const providerId = btn.dataset.providerActivate
          this.activateProvider(providerId)
        })
      })

      // Provider deactivate buttons
      this.shadow.querySelectorAll('[data-provider-deactivate]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          this.deactivateProvider()
        })
      })

      // Module expand/collapse
      this.shadow.querySelectorAll('.module-item').forEach(item => {
        item.querySelector('.module-top')?.addEventListener('click', () => {
          const idx = parseInt(item.dataset.moduleIdx)
          if (this.expandedModules.has(idx)) this.expandedModules.delete(idx)
          else this.expandedModules.add(idx)
          this.render()
        })
      })

      // Expand/collapse all modules
      const expandAllBtn = this.shadow.getElementById('expand-all-modules')
      const collapseAllBtn = this.shadow.getElementById('collapse-all-modules')
      if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
          this.modules.modules?.forEach((_, i) => this.expandedModules.add(i))
          this.render()
        })
      }
      if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => {
          this.expandedModules.clear()
          this.render()
        })
      }

      // Toggle system modules
      const toggleSystemBtn = this.shadow.getElementById('toggle-system-modules')
      if (toggleSystemBtn) {
        toggleSystemBtn.addEventListener('click', () => {
          this.showSystemModules = !this.showSystemModules
          this.render()
        })
      }

      // Toggle hide completed modules
      const toggleCompletedBtn = this.shadow.getElementById('toggle-hide-completed')
      if (toggleCompletedBtn) {
        toggleCompletedBtn.addEventListener('click', () => {
          this._hideCompletedModules = !this._hideCompletedModules
          this.render()
        })
      }

      // Feature name click to describe (replaces "?" button)
      this.shadow.querySelectorAll('.feature-name.clickable').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          const mi = parseInt(el.dataset.moduleIdx)
          const fi = parseInt(el.dataset.featureIdx)
          const mod = this.modules.modules?.[mi]
          const feat = mod?.features?.[fi]
          if (!feat) return
          const fKey = `feat:${mod.name}:${feat.name}`
          // Toggle: if already showing, remove description
          if (this.descriptions.has(fKey)) {
            this.descriptions.delete(fKey)
            this.render()
          } else {
            this.fetchDescription(fKey, feat.name, 'feature', mod.name)
          }
        })
      })

      // Module describe buttons (Hva betyr dette?)
      this.shadow.querySelectorAll('.desc-module-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const idx = parseInt(btn.dataset.moduleIdx)
          const mod = this.modules.modules?.[idx]
          if (mod) this.fetchDescription(`mod:${mod.name}`, mod.name, 'module', '')
        })
      })

      // Feature describe buttons (?)
      this.shadow.querySelectorAll('.desc-feat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const mi = parseInt(btn.dataset.moduleIdx)
          const fi = parseInt(btn.dataset.featureIdx)
          const mod = this.modules.modules?.[mi]
          const feat = mod?.features?.[fi]
          if (feat) this.fetchDescription(`feat:${mod.name}:${feat.name}`, feat.name, 'feature', mod.name)
        })
      })

      // Add function button
      const addFnBtn = this.shadow.getElementById('btn-add-function')
      if (addFnBtn) {
        addFnBtn.addEventListener('click', () => {
          this._showAddFunction = true
          this.render()
        })
      }

      // Add function cancel
      const addCancel = this.shadow.querySelector('.mod-add-cancel')
      if (addCancel) {
        addCancel.addEventListener('click', () => {
          this._showAddFunction = false
          this.render()
        })
      }

      // Add function save
      const addSave = this.shadow.querySelector('.mod-add-save')
      if (addSave) {
        addSave.addEventListener('click', () => this._saveNewFeature())
      }

      // Enter key in add-name input
      const addNameInput = this.shadow.querySelector('.mod-add-name')
      if (addNameInput) {
        addNameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            this._saveNewFeature()
          }
        })
      }
    }

    setMode(mode) {
      this.mode = mode
      this.render()
    }

    async fetchDescription(key, name, type, context) {
      if (this.descriptions.has(key) || this.loadingDescriptions.has(key)) return
      this.loadingDescriptions.add(key)
      this.render()

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

        const res = await authFetch(`${API_BASE}/describe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, type, context: context || undefined }),
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        const data = await res.json()
        if (data.description) {
          this.descriptions.set(key, data.description)
        } else {
          this.descriptions.set(key, data.error || data.hint || 'Kunne ikke generere forklaring')
        }
      } catch (err) {
        const msg = err.name === 'AbortError'
          ? 'Forespørselen tok for lang tid (15s)'
          : 'Kunne ikke hente forklaring — sjekk API-nøkkel'
        this.descriptions.set(key, msg)
      }

      this.loadingDescriptions.delete(key)
      this.render()
    }

    setupKeyboardShortcut() {
      // Guard: fjern eksisterende listener for å unngå duplikater ved reconnect
      if (this._keydownHandler) {
        document.removeEventListener('keydown', this._keydownHandler)
      }
      this._keydownHandler = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === '.') {
          e.preventDefault()
          this.setMode(this.mode === 'icon' ? 'fullscreen' : 'icon')
        }
        // Escape lukker settings-modal (hvis åpen)
        if (e.key === 'Escape' && this.showSettings) {
          e.preventDefault()
          this.showSettings = false
          this.expandedProvider = null
          this.render()
        }
      }
      document.addEventListener('keydown', this._keydownHandler)
    }

    // ─── Data ───────────────────────────────────────────

    async fetchData() {
      try {
        const [stateRes, modulesRes, progressRes, errorsRes] = await Promise.all([
          authFetch(`${API_BASE}/state`).then(r => r.json()).catch(() => null),
          authFetch(`${API_BASE}/modules`).then(r => r.json()).catch(() => ({ modules: [], found: false })),
          authFetch(`${API_BASE}/progress?limit=50`).then(r => r.json()).catch(() => ({ entries: [], totalLines: 0 })),
          authFetch(`${API_BASE}/errors`).then(r => r.json()).catch(() => ({ errors: [], total: 0 }))
        ])

        if (stateRes && !stateRes.error) this.state = stateRes
        this.modules = modulesRes
        this.progress = progressRes
        this.errors = errorsRes
        this.render()
        // Fetch onboarding badge count (non-blocking)
        this.fetchOnboardingData()
      } catch (err) { console.warn('[Kit CC] fetchData error:', err) }
    }

    connectSSE() {
      // Hvis vi har forsøkt for mange ganger, stopp og vis bruker-melding
      if (this._sseRetryCount >= this._sseMaxRetries) {
        console.warn('Kit CC Monitor: Kunne ikke koble til serveren etter 10 forsøk')
        this._sseConnectionFailed = true
        this.render() // Re-render for å vise feilmelding
        return
      }

      // Lukk eksisterende tilkobling først (forhindrer minnelekkasje)
      if (this._eventSource) {
        this._eventSource.close()
        this._eventSource = null
      }

      // Lukk gammel retry-timer hvis finnes
      if (this._sseRetryTimer) {
        clearTimeout(this._sseRetryTimer)
        this._sseRetryTimer = null
      }

      // Auth skjer via httpOnly cookie (sendes automatisk med EventSource same-origin)
      const events = new EventSource(`${API_BASE}/events`, { withCredentials: true })
      this._eventSource = events

      events.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          switch (msg.type) {
            case 'CONNECTED':
              // Server-bekreftet tilkobling
              this._sseConnectionFailed = false
              break
            case 'STATE_CHANGED':
              // Fiks: tilordne nytt objekt hvis state er null
              this.state = { ...(this.state || {}), ...msg.data }
              // Invalidér fase-cache ved state-endring
              this.phaseDetailCache.clear()
              if (this.selectedPhase) {
                this.fetchPhaseDetail(this.selectedPhase)
              }
              break
            case 'PROGRESS_UPDATED':
              this.progress.entries.push(...(msg.data.newEntries || []))
              break
            case 'MODULES_CHANGED':
              this.modules.modules = msg.data.modules || []
              break
            case 'ERROR_CAPTURED':
              // Deduplisering: oppdater eksisterende hvis id matcher
              { const existingIdx = this.errors.errors.findIndex(e => e.id === msg.data.id)
                if (existingIdx >= 0) {
                  this.errors.errors[existingIdx] = msg.data
                } else {
                  this.errors.errors.push(msg.data)
                  this.errors.total++
                }
              }
              break
            case 'ERRORS_CLEARED':
              this.errors = { errors: [], total: 0 }
              break
            case 'ERRORS_FILE_CHANGED':
              // Full erstatning av errors-state fra fil (synk med AI-endringer)
              this.errors = { errors: msg.data.errors || [], total: msg.data.total || 0 }
              break
            case 'ERROR_REMOVED':
              this.errors.errors = this.errors.errors.filter(e => e.id !== msg.data.id)
              this.errors.total = this.errors.errors.length
              break
            case 'ERROR_UPDATED':
              { const upd = this.errors.errors.find(e => e.id === msg.data.id)
                if (upd) {
                  if (msg.data.status) upd.status = msg.data.status
                  if (msg.data.fixAttempts !== undefined) upd.fixAttempts = msg.data.fixAttempts
                }
              }
              break
            case 'BACKLOG_CHANGED':
              this.backlogLoaded = false
              // Kun re-hent hvis backlog er tilgjengelig (ikke feil-status)
              if (this.currentTab === 'backlog' && (!this.chatStatus || !this.chatStatus.error)) {
                this.fetchBacklogData()
              }
              break
            case 'SETTINGS_CHANGED':
              this.settingsLoaded = false
              this.onboardingData = null // Refresh onboarding since settings affect suggestions
              if (this.currentView === 'dashboard') this.fetchSettingsData()
              this.fetchData()
              break
            case 'TASK_ACTIVATED':
              this.phaseTasksCache.clear()
              if (this.selectedPhase) this.fetchPhaseTasks(this.selectedPhase)
              break
            case 'INTEGRATION_ADDED':
              this.integrationsData = null
              this.dataPanelData = null
              break
            case 'SAFETY_CHECKPOINT_SAVED':
            case 'CHECKPOINT_RESTORED':
            case 'CHECKPOINT_CREATED':
              this.checkpointsData = null
              this.fetchData()
              break
            case 'MODULE_FEATURE_ADDED':
              this.fetchModules()
              break
            case 'UPDATE_AVAILABLE':
              this._updateAvailable = msg.data
              break
            case 'PROBE_REQUEST':
              this._handleProbe(msg.data)
              break
            case 'PROBE_RESULT':
              // Informational — nettleseren trenger ikke gjøre noe
              break
          }
          this.render()
        } catch (err) { console.warn('[Kit CC] SSE message parse error:', err) }
      }

      events.onopen = () => {
        this._sseRetryCount = 0 // Reset backoff ved vellykket tilkobling
        this._sseConnectionFailed = false
      }

      events.onerror = () => {
        events.close()
        this._eventSource = null

        // Eksponentiell backoff: 1s, 2s, 4s, 8s, 16s, 30s (maks 30s)
        const baseDelay = 1000 // Start med 1 sekund
        const delay = Math.min(baseDelay * Math.pow(2, this._sseRetryCount), 30000)
        this._sseRetryCount++

        // Sett retry-timer (for senere cleanup)
        this._sseRetryTimer = setTimeout(() => this.connectSSE(), delay)
      }
    }

    // ─── Console capture ────────────────────────────────

    // Ring-buffere for probes (statisk, tilgjengelig for probe-handlers)
    static _consoleBuffer = []
    static _networkBuffer = []
    static _BUFFER_MAX = 200

    static initConsoleCapture(isStandalone = false) {
      let sendCount = 0
      let sendResetTimer = null
      const MAX_SENDS_PER_WINDOW = 10
      const WINDOW_MS = 5000
      const recentMessages = new Set()

      const send = (type, data) => {
        if (sendCount >= MAX_SENDS_PER_WINDOW) return
        const key = type + ':' + (typeof data === 'string' ? data.slice(0, 100) : JSON.stringify(data).slice(0, 100))
        if (recentMessages.has(key)) return
        recentMessages.add(key)
        setTimeout(() => recentMessages.delete(key), WINDOW_MS)

        sendCount++
        if (!sendResetTimer) {
          sendResetTimer = setTimeout(() => { sendCount = 0; sendResetTimer = null }, WINDOW_MS)
        }

        authFetch(`${API_BASE}/errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, data, timestamp: Date.now() })
        }).catch(() => {})
      }

      const origError = console.error
      const origWarn = console.warn
      const origLog = console.log
      const origInfo = console.info
      const cls = KitCCOverlay

      const bufferConsole = (level, msg) => {
        const msgLower = msg.toLowerCase()
        if (msgLower.includes('kit-cc') || msgLower.includes('/kit-cc/')) return
        cls._consoleBuffer.push({ level, message: msg.slice(0, 2000), timestamp: Date.now() })
        if (cls._consoleBuffer.length > cls._BUFFER_MAX) cls._consoleBuffer.shift()
      }

      const formatArgs = (args) => args.map(a => { try { return typeof a === 'string' ? a : JSON.stringify(a) } catch { return String(a) } }).join(' ')

      console.error = (...args) => {
        origError.apply(console, args)
        const msg = formatArgs(args)
        bufferConsole('error', msg)
        if (!msg.toLowerCase().includes('kit-cc')) send('error', msg)
      }
      console.warn = (...args) => {
        origWarn.apply(console, args)
        const msg = formatArgs(args)
        bufferConsole('warn', msg)
        if (!msg.toLowerCase().includes('kit-cc')) send('warn', msg)
      }
      console.log = (...args) => {
        origLog.apply(console, args)
        bufferConsole('log', formatArgs(args))
      }
      console.info = (...args) => {
        origInfo.apply(console, args)
        bufferConsole('info', formatArgs(args))
      }

      window.addEventListener('error', (e) => {
        if (e.filename && e.filename.includes('overlay.js')) return
        send('uncaught', { message: e.message, source: e.filename, line: e.lineno, col: e.colno })
      })
      window.addEventListener('unhandledrejection', (e) => {
        send('promise', { reason: String(e.reason).slice(0, 500) })
      })

      // Fang nettverksfeil (fetch) — observerer kun, endrer aldri oppførsel.
      // Pakket i try/catch for å aldri forstyrre appens fetch.
      const origFetch = window.fetch
      window.fetch = function(...args) {
        const startTime = Date.now()
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
        const method = (args[1]?.method || (args[0]?.method) || 'GET').toUpperCase()
        const isKitCC = url.includes('/kit-cc/')

        return origFetch.apply(this, args).then(response => {
          try {
            // Buffer alle requests (unntatt Kit CC sine egne)
            if (!isKitCC) {
              cls._networkBuffer.push({
                method, url: url.slice(0, 500), status: response.status,
                duration: Date.now() - startTime, timestamp: Date.now(),
                ok: response.ok, error: null
              })
              if (cls._networkBuffer.length > cls._BUFFER_MAX) cls._networkBuffer.shift()
            }
            if (!response.ok && !isKitCC) {
              const isExpected503 = response.status === 503 && (url.includes('/backlog/') || url.includes('/chat/'))
              if (!isExpected503) {
                send('network', `${response.status} ${response.statusText}: ${url}`)
              }
            }
          } catch { /* aldri forstyrr appen */ }
          return response
        }, err => {
          try {
            if (!isKitCC) {
              cls._networkBuffer.push({
                method, url: url.slice(0, 500), status: 0,
                duration: Date.now() - startTime, timestamp: Date.now(),
                ok: false, error: err.message
              })
              if (cls._networkBuffer.length > cls._BUFFER_MAX) cls._networkBuffer.shift()
            }
            send('network', `Fetch feilet: ${err.message}`)
          } catch {}
          throw err
        })
      }

      // XHR-wrapper for legacy-støtte
      const OrigXHR = window.XMLHttpRequest
      window.XMLHttpRequest = function() {
        const xhr = new OrigXHR()
        const origOpen = xhr.open.bind(xhr)
        let xhrMethod = 'GET', xhrUrl = '', xhrStart = 0

        xhr.open = function(method, url, ...rest) {
          xhrMethod = (method || 'GET').toUpperCase()
          xhrUrl = String(url).slice(0, 500)
          return origOpen(method, url, ...rest)
        }

        const origSend = xhr.send.bind(xhr)
        xhr.send = function(...sendArgs) {
          xhrStart = Date.now()
          xhr.addEventListener('loadend', () => {
            try {
              if (!xhrUrl.includes('/kit-cc/')) {
                cls._networkBuffer.push({
                  method: xhrMethod, url: xhrUrl, status: xhr.status,
                  duration: Date.now() - xhrStart, timestamp: Date.now(),
                  ok: xhr.status >= 200 && xhr.status < 400, error: null
                })
                if (cls._networkBuffer.length > cls._BUFFER_MAX) cls._networkBuffer.shift()
              }
            } catch {}
          }, { once: true })
          return origSend(...sendArgs)
        }

        return xhr
      }
      // Behold prototype-chain for XHR
      window.XMLHttpRequest.prototype = OrigXHR.prototype
      window.XMLHttpRequest.UNSENT = OrigXHR.UNSENT
      window.XMLHttpRequest.OPENED = OrigXHR.OPENED
      window.XMLHttpRequest.HEADERS_RECEIVED = OrigXHR.HEADERS_RECEIVED
      window.XMLHttpRequest.LOADING = OrigXHR.LOADING
      window.XMLHttpRequest.DONE = OrigXHR.DONE
    }

    // ─── Probe handlers ────────────────────────────────

    async _handleProbe(probe) {
      if (!probe?.id || !probe?.type) return
      const handlers = {
        'dom.query': this._probeDomQuery,
        'dom.queryAll': this._probeDomQueryAll,
        'console.log': this._probeConsoleLog,
        'network.log': this._probeNetworkLog,
        'network.failed': this._probeNetworkFailed,
        'storage.get': this._probeStorageGet,
        'js.eval': this._probeJsEval
      }

      const handler = handlers[probe.type]
      if (!handler) {
        await this._postProbeResult(probe.id, { success: false, error: `Ukjent probe-type: ${probe.type}` })
        return
      }

      try {
        const data = await handler.call(this, probe.params || {})
        // Truncate resultat til maks 50KB
        let json = JSON.stringify(data)
        if (json.length > 50000) {
          json = json.slice(0, 50000)
          await this._postProbeResult(probe.id, { success: true, data: { truncated: true, partial: json } })
        } else {
          await this._postProbeResult(probe.id, { success: true, data })
        }
      } catch (err) {
        await this._postProbeResult(probe.id, { success: false, error: String(err.message || err).slice(0, 2000) })
      }
    }

    async _postProbeResult(probeId, result) {
      try {
        await authFetch(`${API_BASE}/probes/${probeId}/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        })
      } catch { /* Ignorer feil ved posting av resultat */ }
    }

    _probeDomQuery(params) {
      const { selector, property } = params
      if (!selector) return { exists: false, error: 'selector er påkrevd' }
      const el = document.querySelector(selector)
      if (!el) return { exists: false }

      const rect = el.getBoundingClientRect()
      const result = {
        exists: true,
        tagName: el.tagName.toLowerCase(),
        text: (el.textContent || '').slice(0, 1000),
        visible: rect.width > 0 && rect.height > 0 && getComputedStyle(el).display !== 'none',
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      }

      if (property) {
        result.property = el[property] !== undefined ? String(el[property]).slice(0, 1000) : null
        result.attribute = el.getAttribute(property)
      }

      return result
    }

    _probeDomQueryAll(params) {
      const { selector, limit } = params
      if (!selector) return { count: 0, error: 'selector er påkrevd' }
      const elements = document.querySelectorAll(selector)
      const max = Math.min(parseInt(limit) || 20, 50)
      const items = []

      for (let i = 0; i < Math.min(elements.length, max); i++) {
        const el = elements[i]
        const rect = el.getBoundingClientRect()
        items.push({
          index: i,
          tagName: el.tagName.toLowerCase(),
          text: (el.textContent || '').slice(0, 200),
          visible: rect.width > 0 && rect.height > 0 && getComputedStyle(el).display !== 'none',
          id: el.id || null,
          className: el.className ? String(el.className).slice(0, 200) : null
        })
      }

      return { count: elements.length, items }
    }

    _probeConsoleLog(params) {
      const { level, limit, pattern } = params
      let entries = KitCCOverlay._consoleBuffer.slice()

      if (level) {
        const levels = Array.isArray(level) ? level : [level]
        entries = entries.filter(e => levels.includes(e.level))
      }

      if (pattern) {
        try {
          const re = new RegExp(pattern, 'i')
          entries = entries.filter(e => re.test(e.message))
        } catch { /* Ugyldig regex, ignorer filter */ }
      }

      const max = Math.min(parseInt(limit) || 50, 200)
      return { entries: entries.slice(-max), total: entries.length, bufferSize: KitCCOverlay._consoleBuffer.length }
    }

    _probeNetworkLog(params) {
      const { limit, urlPattern, status } = params
      let entries = KitCCOverlay._networkBuffer.slice()

      if (urlPattern) {
        try {
          const re = new RegExp(urlPattern, 'i')
          entries = entries.filter(e => re.test(e.url))
        } catch {}
      }

      if (status !== undefined) {
        const s = parseInt(status)
        if (!isNaN(s)) entries = entries.filter(e => e.status === s)
      }

      const max = Math.min(parseInt(limit) || 50, 200)
      return { entries: entries.slice(-max), total: entries.length, bufferSize: KitCCOverlay._networkBuffer.length }
    }

    _probeNetworkFailed(params) {
      const { minutes, limit } = params
      const since = Date.now() - (parseInt(minutes) || 5) * 60 * 1000
      const failed = KitCCOverlay._networkBuffer.filter(e => !e.ok && e.timestamp > since)
      const max = Math.min(parseInt(limit) || 50, 200)
      return { entries: failed.slice(-max), total: failed.length }
    }

    _probeStorageGet(params) {
      const { storage, key } = params
      const result = {}

      if (!storage || storage === 'localStorage') {
        try {
          if (key) {
            result.localStorage = { [key]: localStorage.getItem(key) }
          } else {
            const items = {}
            for (let i = 0; i < Math.min(localStorage.length, 50); i++) {
              const k = localStorage.key(i)
              items[k] = (localStorage.getItem(k) || '').slice(0, 500)
            }
            result.localStorage = items
          }
        } catch (err) { result.localStorage = { error: err.message } }
      }

      if (!storage || storage === 'sessionStorage') {
        try {
          if (key) {
            result.sessionStorage = { [key]: sessionStorage.getItem(key) }
          } else {
            const items = {}
            for (let i = 0; i < Math.min(sessionStorage.length, 50); i++) {
              const k = sessionStorage.key(i)
              items[k] = (sessionStorage.getItem(k) || '').slice(0, 500)
            }
            result.sessionStorage = items
          }
        } catch (err) { result.sessionStorage = { error: err.message } }
      }

      if (!storage || storage === 'cookies') {
        try {
          result.cookies = document.cookie.slice(0, 2000)
        } catch (err) { result.cookies = { error: err.message } }
      }

      return result
    }

    _probeJsEval(params) {
      const { expression } = params
      if (!expression) return { error: 'expression er påkrevd' }
      if (expression.length > 2000) return { error: 'Expression for lang (maks 2000 tegn)' }

      try {
        const fn = new Function(`return (${expression})`)
        let result = fn()
        // Håndter Promises
        if (result && typeof result.then === 'function') {
          return result.then(val => {
            const json = JSON.stringify(val)
            return { value: json && json.length > 50000 ? json.slice(0, 50000) + '...[truncated]' : val, type: typeof val }
          })
        }
        const json = JSON.stringify(result)
        if (json && json.length > 50000) {
          return { value: json.slice(0, 50000) + '...[truncated]', type: typeof result }
        }
        return { value: result, type: typeof result }
      } catch (err) {
        return { error: err.message }
      }
    }

    // ─── Helpers ────────────────────────────────────────

    extractPort() {
      const url = new URL(API_BASE, window.location.href)
      return url.port || (url.protocol === 'https:' ? 443 : 80)
    }

    esc(str) {
      const el = document.createElement('span')
      el.textContent = str
      return el.innerHTML
    }

    /** Sikker mini-markdown: escaper først, deretter formaterer */
    renderMd(str) {
      if (!str) return ''
      let s = this.esc(str)
      // Kodeblokker (```...```) → <pre><code>
      s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bl-md-pre"><code>$2</code></pre>')
      // Inline kode (`...`) → <code>
      s = s.replace(/`([^`]+)`/g, '<code class="bl-md-code">$1</code>')
      // Bold (**...**) → <strong>
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic (*...*) — unngå konflikter med bold
      s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      // Overskrifter (### ... ) på starten av en linje
      s = s.replace(/^### (.+)$/gm, '<div class="bl-md-h3">$1</div>')
      s = s.replace(/^## (.+)$/gm, '<div class="bl-md-h2">$1</div>')
      // Lister (- item) → <div class="bl-md-li">
      s = s.replace(/^- (.+)$/gm, '<div class="bl-md-li">• $1</div>')
      // Nummererte lister (1. item)
      s = s.replace(/^\d+\. (.+)$/gm, '<div class="bl-md-li">$1</div>')
      // Sanitize med DOMPurify hvis tilgjengelig
      if (window.DOMPurify) {
        s = window.DOMPurify.sanitize(s, { ALLOWED_TAGS: ['pre', 'code', 'strong', 'em', 'div'], ALLOWED_ATTR: ['class'] })
      }
      return s
    }

    // ─── Styles ─────────────────────────────────────────

    getStyles() {
      return `
        :host { all: initial; }

        .kit-cc-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-size: 14px;
          color: #E4E4E7;
          line-height: 1.5;
          position: fixed;
          z-index: 2147483647;
        }

        /* ─── FAB (Floating Action Button) ─── */
        .kit-cc-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #8A00FF;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(138, 0, 255, 0.4);
          transition: all 0.2s;
          user-select: none;
          z-index: 2147483647;
          pointer-events: auto;
        }
        .kit-cc-fab:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(138, 0, 255, 0.5); }
        .fab-text { font-weight: 700; font-size: 14px; letter-spacing: -0.5px; }
        .fab-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #22222e;
        }

        /* ─── Panel (Dashboard layout) ─── */
        .kit-cc-panel {
          position: fixed;
          bottom: 5vh;
          right: 5vw;
          width: ${FULLSCREEN_PERCENT}vw;
          height: ${FULLSCREEN_PERCENT}vh;
          background: #22222e;
          border: 1px solid #353542;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 2147483647;
          pointer-events: auto;
        }

        .kit-cc-panel.panel-opening {
          animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Header ─── */
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #353542;
          background: #262632;
          flex-shrink: 0;
        }
        .header-left { display: flex; align-items: center; gap: 8px; }
        .logo { font-size: 18px; font-weight: 700; color: #B07AFF; }
        .project-name { font-size: 15px; font-weight: 500; color: #d4d4d8; }
        .panel-actions { display: flex; align-items: center; gap: 8px; }
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .status-badge.has-errors {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        .panel-btn {
          width: 32px; height: 32px;
          border: none; background: transparent;
          color: #a1a1aa; cursor: pointer;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .panel-btn:hover { background: #353542; color: #E4E4E7; }

        /* ─── Navbar (Dashboard + section links) ─── */
        .panel-nav {
          display: flex;
          align-items: center;
          padding: 0 8px;
          background: #262632;
          border-bottom: 1px solid #353542;
          flex-shrink: 0;
          overflow-x: auto;
          gap: 0;
        }
        .panel-nav::-webkit-scrollbar { height: 0; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #a1a1aa;
          cursor: pointer;
          border: none;
          background: none;
          font-family: inherit;
          border-bottom: 2px solid transparent;
          transition: color 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nav-item:hover { color: #E4E4E7; }
        .nav-item:hover .tab-icon { opacity: 0.8; }
        .nav-item.active { color: var(--tab-color, #B07AFF); border-bottom-color: var(--tab-color, #B07AFF); }
        .nav-item.active .tab-icon { opacity: 1; }
        .nav-separator {
          width: 1px;
          height: 20px;
          background: #353542;
          flex-shrink: 0;
          margin: 0 4px;
        }

        /* ─── Main (sidebar + content) ─── */
        .panel-main {
          display: grid;
          grid-template-columns: 240px 1fr;
          flex: 1;
          overflow: hidden;
        }

        /* ─── Sidebar ─── */
        .panel-sidebar {
          background: #262632;
          border-right: 1px solid #353542;
          padding: 20px 0;
          overflow-y: auto;
        }
        .sidebar-title {
          padding: 0 20px 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717A;
          font-weight: 600;
        }
        .phase-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          transition: background 0.15s;
        }
        .phase-item.active { background: rgba(138, 0, 255, 0.15); border-right: 2px solid #8A00FF; }
        .phase-icon-circle {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; flex-shrink: 0;
        }
        .phase-icon-circle.completed { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .phase-icon-circle.active { background: rgba(138, 0, 255, 0.15); color: #B07AFF; }
        .phase-icon-circle.pending { background: rgba(107, 114, 128, 0.15); color: #71717A; }
        .phase-label { font-size: 13px; flex: 1; }
        .phase-label.completed { color: #a1a1aa; }
        .phase-label.active { color: #E4E4E7; font-weight: 500; }
        .phase-label.pending { color: #9898a8; }
        .phase-item.clickable { cursor: pointer; }
        .phase-item.clickable:hover { background: rgba(138, 0, 255, 0.08); }
        .phase-item.selected { background: rgba(138, 0, 255, 0.2); border-right: 2px solid #A040FF; }
        .phase-arrow {
          font-size: 11px; color: #71717A; flex-shrink: 0;
          opacity: 0; transition: opacity 0.15s;
        }
        .phase-item.clickable:hover .phase-arrow,
        .phase-item.selected .phase-arrow { opacity: 1; }

        /* ─── Sidebar items (Dashboard, etc.) ─── */
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #a1a1aa;
          transition: background 0.15s, color 0.15s;
        }
        .sidebar-item:hover { background: rgba(138, 0, 255, 0.08); color: #E4E4E7; }
        .sidebar-item.selected {
          background: rgba(138, 0, 255, 0.15);
          color: #B07AFF;
          border-right: 2px solid #8A00FF;
        }
        .sidebar-item-icon { display: flex; align-items: center; color: inherit; }
        .sidebar-divider {
          height: 1px;
          background: #353542;
          margin: 8px 0;
        }

        /* ─── Phase detail view ─── */
        .phase-detail {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .phase-detail-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #353542;
          margin-bottom: 20px;
        }
        .back-btn {
          background: none;
          border: 1px solid #353542;
          color: #a1a1aa;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .back-btn:hover { background: #353542; color: #E4E4E7; }
        .phase-detail-content {
          flex: 1;
          overflow-y: auto;
        }
        .phase-detail-content::-webkit-scrollbar { width: 4px; }
        .phase-detail-content::-webkit-scrollbar-track { background: transparent; }
        .phase-detail-content::-webkit-scrollbar-thumb { background: #353542; border-radius: 2px; }
        .phase-detail-title-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }
        .phase-detail-num {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(138, 0, 255, 0.15);
          color: #B07AFF;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 700;
          flex-shrink: 0;
        }
        .phase-detail-name {
          font-size: 20px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 8px;
        }
        .phase-detail-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .phase-status-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .phase-status-badge.completed { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .phase-status-badge.active { background: rgba(138, 0, 255, 0.15); color: #B07AFF; }
        .phase-status-badge.pending { background: rgba(107, 114, 128, 0.15); color: #71717A; }
        .phase-time-item {
          font-size: 12px;
          color: #71717A;
        }
        .phase-gate-badge {
          font-size: 12px;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
          padding: 2px 8px;
          border-radius: 8px;
        }
        .phase-summary-text {
          font-size: 14px;
          color: #a1a1aa;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .phase-detail-section {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 12px;
        }
        .phase-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #353542;
        }
        .phase-steps-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .phase-step-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.5;
        }
        .phase-step-check {
          width: 18px;
          flex-shrink: 0;
          text-align: center;
          font-weight: 600;
        }
        .phase-step-item.done .phase-step-check { color: #22c55e; }
        .phase-step-item.skipped .phase-step-check { color: #f59e0b; }
        .phase-step-item.done { color: #d4d4d8; }
        .phase-doc-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: #a1a1aa;
          padding: 3px 0;
          line-height: 1.5;
        }
        .phase-doc-check {
          width: 18px;
          flex-shrink: 0;
          text-align: center;
        }
        .phase-doc-item.done .phase-doc-check { color: #22c55e; }
        .phase-doc-item.done { color: #d4d4d8; }
        .phase-doc-bullet {
          width: 18px;
          flex-shrink: 0;
          text-align: center;
          color: #B07AFF;
        }
        .phase-doc-text {
          font-size: 13px;
          color: #a1a1aa;
          padding: 2px 0;
          line-height: 1.6;
        }
        .phase-log-list {
          font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace;
          font-size: 12px;
        }
        .phase-log-entry {
          padding: 4px 0;
          display: flex;
          gap: 8px;
          align-items: flex-start;
          line-height: 1.5;
        }
        .phase-log-entry .log-icon { min-width: 16px; flex-shrink: 0; }
        .phase-log-entry .log-text { color: #a1a1aa; }
        .phase-detail-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #71717A;
          font-size: 14px;
        }
        .loading-spinner {
          width: 20px; height: 20px;
          border: 2px solid #353542;
          border-top-color: #B07AFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── Phase tasks (F27) ─── */
        .pt-view-tabs {
          display: flex;
          gap: 4px;
          margin-left: auto;
        }
        .pt-view-tab {
          background: none;
          border: 1px solid #353542;
          color: #71717A;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .pt-view-tab.active {
          background: rgba(138, 0, 255, 0.15);
          color: #B07AFF;
          border-color: #B07AFF;
        }
        .pt-view-tab:hover:not(.active) {
          background: #353542;
          color: #E4E4E7;
        }
        .pt-intensity-bar {
          background: rgba(138, 0, 255, 0.08);
          border: 1px solid rgba(138, 0, 255, 0.2);
          border-radius: 8px;
          padding: 8px 14px;
          margin-bottom: 16px;
        }
        .pt-intensity-label {
          font-size: 12px;
          color: #B07AFF;
          font-weight: 500;
        }
        .pt-group { }
        .pt-group-dot {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
        }
        .pt-task-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pt-task {
          border-radius: 6px;
          transition: background 0.15s;
        }
        .pt-task.out_of_level { opacity: 0.5; }
        .pt-task.completed .pt-task-name { text-decoration: line-through; color: #71717A; }
        .pt-task.not_done .pt-task-name { color: #71717A; }
        .pt-status-tag {
          font-size: 10px; padding: 1px 7px; border-radius: 4px;
          font-weight: 500; flex-shrink: 0; letter-spacing: 0.02em;
        }
        .pt-status-tag--completed { color: #22c55e; background: rgba(34,197,94,0.12); }
        .pt-status-tag--not-done  { color: #a1a1aa; background: rgba(161,161,170,0.10); }
        .pt-status-tag--skipped   { color: #71717A; background: rgba(113,113,122,0.12); }
        .pt-status-tag--activated { color: #a855f7; background: rgba(168,85,247,0.12); }
        .pt-task-deliverable { font-size: 12px; color: #a1a1aa; margin-bottom: 6px; }
        .pt-task-deliverable code {
          font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px;
          color: #22c55e; background: rgba(34,197,94,0.08);
          padding: 1px 5px; border-radius: 3px;
        }
        .pt-task-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          cursor: pointer;
          border-radius: 6px;
        }
        .pt-task-header:hover { background: rgba(138, 0, 255, 0.06); }
        .pt-task-status { font-size: 14px; flex-shrink: 0; width: 20px; text-align: center; }
        .pt-task-name { font-size: 13px; color: #E4E4E7; flex: 1; }
        .pt-task-zone { font-size: 10px; flex-shrink: 0; }
        .pt-task-chevron { font-size: 10px; color: #71717A; flex-shrink: 0; width: 12px; }
        .pt-level-badge {
          font-size: 10px;
          color: #71717A;
          background: rgba(107, 114, 128, 0.15);
          padding: 1px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .pt-task-details {
          padding: 4px 10px 12px 38px;
        }
        .pt-task-desc {
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .pt-task-expert {
          font-size: 12px;
          color: #00E8FF;
          margin-bottom: 4px;
        }
        .pt-task-reason {
          font-size: 12px;
          color: #71717A;
          font-style: italic;
          margin-bottom: 8px;
        }
        .pt-activate-btn {
          background: linear-gradient(135deg, #8A00FF, #6B00CC);
          border: none;
          color: #fff;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          transition: opacity 0.15s;
        }
        .pt-activate-btn:hover { opacity: 0.85; }
        .pt-task-level {
          font-size: 11px;
          color: #00E8FF;
          margin-bottom: 6px;
        }
        .pt-activated-label {
          font-size: 12px;
          color: #22c55e;
          font-weight: 500;
          margin-top: 8px;
        }

        /* ─── Settings (F30) ─── */
        .st-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .st-section {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 10px;
          padding: 20px;
        }
        .st-section-title {
          font-size: 15px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #353542;
        }
        .st-fields-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .st-field {
          min-width: 300px;
          flex: 1 1 300px;
          background: #22222e;
          border: 1px solid #353542;
          border-radius: 8px;
          padding: 14px 16px;
        }
        .st-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .st-label {
          font-size: 13px;
          font-weight: 500;
          color: #E4E4E7;
        }
        .st-saving {
          font-size: 11px;
          color: #B07AFF;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .st-hint {
          font-size: 11px;
          color: #71717A;
          margin-top: 4px;
          margin-bottom: 5px;
          line-height: 1.4;
        }
        .st-input {
          width: 100%;
          background: #22222e;
          border: 1px solid #353542;
          color: #E4E4E7;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .st-input:focus { border-color: #B07AFF; }
        .st-select {
          width: 100%;
          background: #22222e;
          border: 1px solid #353542;
          color: #E4E4E7;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717A' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .st-select:focus { border-color: #B07AFF; }
        .st-option-desc {
          font-size: 11px;
          color: #a1a1aa;
          margin-top: 4px;
          padding-left: 2px;
        }
        .st-multiselect {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .st-check-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background: #22222e;
          border: 1px solid #353542;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .st-check-label:hover {
          border-color: #555;
          background: #282836;
        }
        .st-check-label:has(.st-checkbox:checked) {
          border-color: #8A00FF;
          background: rgba(138, 0, 255, 0.08);
        }
        .st-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          min-width: 18px;
          border: 2px solid #555;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          position: relative;
          margin-top: 1px;
          transition: border-color 0.15s, background 0.15s;
        }
        .st-checkbox:checked {
          background: #8A00FF;
          border-color: #8A00FF;
        }
        .st-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1px;
          width: 6px;
          height: 10px;
          border: solid #fff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .st-check-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .st-check-text {
          font-size: 13px;
          color: #E4E4E7;
          font-weight: 500;
          line-height: 1.4;
        }
        .st-check-desc {
          font-size: 11px;
          color: #a1a1aa;
          font-weight: 400;
          line-height: 1.3;
        }
        .st-info-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .st-info-card {
          background: #22222e;
          border: 1px solid #353542;
          border-radius: 8px;
          padding: 12px 14px;
          min-width: 300px;
          flex: 1 1 300px;
        }
        .st-info-label {
          font-size: 11px;
          color: #71717A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .st-info-value {
          font-size: 14px;
          color: #E4E4E7;
          font-weight: 500;
        }
        .st-info-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin-top: 4px;
          line-height: 1.4;
        }
        .st-gate-item {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #353542;
        }
        .st-gate-item:last-child { border-bottom: none; }
        .st-gate-phase {
          font-size: 12px;
          color: #EF4444;
          font-weight: 500;
          flex-shrink: 0;
        }
        .st-gate-reason {
          font-size: 12px;
          color: #a1a1aa;
        }

        /* ─── Data Panels (F32) ─── */
        .dp-container {
          display: flex;
          gap: 16px;
          height: 100%;
          min-height: 400px;
        }
        .dp-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 220px;
          max-width: 260px;
          overflow-y: auto;
          padding-right: 8px;
          border-right: 1px solid #353542;
        }
        .dp-nav-btn {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #a1a1aa;
          font-size: 12px;
          font-family: inherit;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .dp-nav-btn:hover { background: #2c2c38; color: #E4E4E7; }
        .dp-nav-btn.active { background: #8A00FF20; color: #B07AFF; font-weight: 500; }
        .dp-nav-icon { flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; }
        .dp-nav-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .dp-nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dp-nav-desc { font-size: 10px; color: #8888a0; line-height: 1.3; white-space: normal; }
        .dp-nav-btn.active .dp-nav-desc { color: #8A00FF80; }
        .dp-nav-btn:hover .dp-nav-desc { color: #71717A; }
        .dp-content {
          flex: 1;
          overflow-y: auto;
          padding-left: 8px;
        }
        .dp-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #71717A;
        }
        .dp-placeholder-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .dp-placeholder-text { font-size: 14px; }
        .dp-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #71717A;
          font-size: 13px;
        }
        .dp-panel { display: flex; flex-direction: column; gap: 16px; }
        .dp-hint {
          font-size: 12px;
          color: #a1a1b0;
          line-height: 1.5;
          padding: 10px 12px;
          background: #2c2c38;
          border-radius: 8px;
          border-left: 3px solid #B07AFF;
        }
        .dp-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        .dp-stat-label { font-size: 13px; color: #a1a1aa; }
        .dp-stat-value { font-size: 18px; font-weight: 600; color: #E4E4E7; }
        .dp-stat-error { color: #EF4444; }
        .dp-stat-warn { color: #eab308; }
        .dp-list { display: flex; flex-direction: column; gap: 6px; }
        .dp-list-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: #2c2c38;
          border-radius: 6px;
          font-size: 12px;
        }
        .dp-event-type {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          background: #353542;
          color: #a1a1aa;
          flex-shrink: 0;
          text-transform: uppercase;
        }
        .dp-type-start { background: #8A00FF20; color: #B07AFF; }
        .dp-type-done { background: #22c55e20; color: #22c55e; }
        .dp-type-file { background: #00E8FF20; color: #00E8FF; }
        .dp-type-commit { background: #eab30820; color: #eab308; }
        .dp-type-error { background: #EF444420; color: #EF4444; }
        .dp-type-decision { background: #a78bfa20; color: #a78bfa; }
        .dp-event-desc { flex: 1; color: #E4E4E7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dp-event-time { color: #71717A; font-size: 11px; flex-shrink: 0; }
        .dp-empty {
          text-align: center;
          color: #71717A;
          font-size: 13px;
          padding: 32px 16px;
        }
        .dp-card {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 8px;
          padding: 12px;
        }
        .dp-card-error { border-left: 3px solid #EF4444; }
        .dp-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .dp-card-time { font-size: 11px; color: #71717A; }
        .dp-card-body { font-size: 13px; color: #E4E4E7; line-height: 1.4; }
        .dp-card-footer { font-size: 11px; color: #a1a1aa; margin-top: 6px; font-style: italic; }
        .dp-card-fix { font-size: 12px; color: #22c55e; margin-top: 6px; }
        .dp-session-id { font-size: 11px; color: #71717A; }
        .dp-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .dp-metrics-3 { grid-template-columns: repeat(3, 1fr); }
        .dp-metric {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .dp-metric-val { font-size: 24px; font-weight: 700; color: #E4E4E7; }
        .dp-metric-label { font-size: 11px; color: #71717A; margin-top: 4px; }
        .dp-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #E4E4E7;
          margin-top: 8px;
        }
        .dp-file-list { display: flex; flex-direction: column; gap: 4px; }
        .dp-file-item {
          font-size: 11px;
          color: #a1a1aa;
          padding: 4px 8px;
          background: #22222e;
          border-radius: 4px;
          font-family: monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dp-quality-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #353542;
        }
        .dp-quality-row:last-child { border-bottom: none; }
        .dp-quality-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dp-quality-name { flex: 1; font-size: 13px; color: #E4E4E7; }
        .dp-quality-stats { font-size: 11px; color: #71717A; }
        .dp-module-card {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 8px;
          padding: 12px;
        }
        .dp-module-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .dp-module-name { flex: 1; font-size: 13px; font-weight: 500; color: #E4E4E7; }
        .dp-module-status {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .dp-status-ferdig { background: #22c55e20; color: #22c55e; }
        .dp-status-pågår { background: #8A00FF20; color: #B07AFF; }
        .dp-status-venter { background: #71717A20; color: #71717A; }
        .dp-progress-bar {
          height: 4px;
          background: #353542;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .dp-progress-fill {
          height: 100%;
          background: #8A00FF;
          border-radius: 2px;
          transition: width 0.3s;
        }
        .dp-module-stats { font-size: 11px; color: #71717A; }
        .dp-severity-high { border-left: 3px solid #EF4444; }
        .dp-severity-medium { border-left: 3px solid #eab308; }
        .dp-severity-low { border-left: 3px solid #71717A; }
        .dp-risk-type {
          font-size: 10px;
          font-weight: 600;
          color: #a1a1aa;
          text-transform: uppercase;
        }
        .dp-timeline { display: flex; flex-direction: column; gap: 0; position: relative; }
        .dp-timeline-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          position: relative;
        }
        .dp-timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 28px;
          bottom: 0;
          width: 1px;
          background: #353542;
        }
        .dp-timeline-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #8A00FF;
          flex-shrink: 0;
          margin-top: 3px;
        }
        .dp-timeline-content { flex: 1; }
        .dp-timeline-title { font-size: 13px; color: #E4E4E7; }
        .dp-timeline-meta { font-size: 11px; color: #71717A; margin-top: 2px; }

        /* Checkpoint tab */
        .cp-tab { position: relative; }
        .cp-timeline { display: flex; flex-direction: column; gap: 0; position: relative; }
        .cp-timeline-item { display: flex; gap: 12px; padding: 12px 0; position: relative; }
        .cp-timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 5px; top: 28px; bottom: 0; width: 1px; background: #353542; }
        .cp-timeline-dot { width: 11px; height: 11px; border-radius: 50%; background: #8A00FF; flex-shrink: 0; margin-top: 5px; }
        .cp-timeline-item.safety .cp-timeline-dot { background: #22c55e; }
        .cp-timeline-content { flex: 1; }
        .cp-timeline-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .cp-timeline-title { font-size: 13px; color: #E4E4E7; }
        .cp-timeline-meta { font-size: 11px; color: #71717A; margin-top: 2px; }
        .cp-restore-btn { font-size: 11px; padding: 4px 12px; border-radius: 6px; border: 1px solid #8A00FF40; background: #8A00FF15; color: #c084fc; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
        .cp-restore-btn:hover { background: #8A00FF30; color: #d8b4fe; border-color: #8A00FF60; }
        .cp-confirm-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10; border-radius: 12px; }
        .cp-confirm-dialog { background: #1e1e2e; border: 1px solid #454558; border-radius: 12px; padding: 24px; max-width: 420px; width: 90%; }
        .cp-confirm-title { font-size: 15px; font-weight: 600; color: #E4E4E7; margin-bottom: 12px; }
        .cp-confirm-desc { font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 12px; }
        .cp-confirm-desc strong { color: #E4E4E7; }
        .cp-confirm-time { color: #71717A; font-size: 12px; }
        .cp-confirm-safety { font-size: 12px; color: #22c55e; background: #22c55e10; border: 1px solid #22c55e30; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px; line-height: 1.5; }
        .cp-confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .cp-confirm-btn { padding: 8px 18px; border-radius: 8px; font-size: 13px; cursor: pointer; border: 1px solid #ffffff15; }
        .cp-confirm-btn.cancel { background: #ffffff08; color: #a1a1aa; }
        .cp-confirm-btn.cancel:hover { background: #ffffff15; color: #E4E4E7; }
        .cp-confirm-btn.confirm { background: #8A00FF30; border-color: #8A00FF50; color: #d8b4fe; }
        .cp-confirm-btn.confirm:hover { background: #8A00FF50; color: #fff; }
        .cp-step-indicator { font-size: 11px; color: #71717A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .cp-saved-check { display: flex; gap: 14px; align-items: flex-start; padding: 14px; border-radius: 10px; background: #22c55e08; border: 1px solid #22c55e25; margin-bottom: 16px; }
        .cp-saved-label { font-size: 14px; font-weight: 600; color: #22c55e; margin-bottom: 2px; }
        .cp-saved-detail { font-size: 12px; color: #a1a1aa; line-height: 1.5; }
        .cp-confirm-divider { height: 1px; background: #ffffff10; margin: 16px 0; }
        .cp-saving-spinner { width: 28px; height: 28px; border: 3px solid #ffffff15; border-top-color: #8A00FF; border-radius: 50%; animation: cp-spin 0.7s linear infinite; margin: 20px auto; }
        @keyframes cp-spin { to { transform: rotate(360deg); } }

        /* Checkpoint: git SHA badge */
        .cp-git-sha { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; color: #8A00FF; background: #8A00FF15; padding: 1px 6px; border-radius: 4px; }

        /* Checkpoint: manuell lagring */
        .cp-save-section { margin-bottom: 16px; padding: 16px; border-radius: 12px; background: #ffffff06; border: 1px solid #ffffff10; }
        .cp-save-title { font-size: 14px; font-weight: 600; color: #E4E4E7; margin-bottom: 10px; }
        .cp-save-input { display: flex; gap: 8px; align-items: center; }
        .cp-save-input .cp-save-name { flex: 1; width: 100%; background: #22222e; border: 1px solid #353542; color: #E4E4E7; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .cp-save-input .cp-save-name:focus { border-color: #B07AFF; }
        .cp-save-btn { padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #8A00FF50; background: #8A00FF30; color: #d8b4fe; white-space: nowrap; transition: all 0.15s; min-width: 70px; text-align: center; }
        .cp-save-btn:hover:not(:disabled) { background: #8A00FF50; color: #fff; border-color: #8A00FF70; }
        .cp-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .cp-save-btn.saving { pointer-events: none; }
        .cp-save-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #ffffff30; border-top-color: #d8b4fe; border-radius: 50%; animation: cp-spin 0.7s linear infinite; vertical-align: middle; }
        .cp-save-hint { font-size: 12px; color: #71717A; margin-top: 8px; line-height: 1.5; }
        .cp-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; align-items: center; }
        .cp-suggestions-label { font-size: 12px; color: #71717A; margin-right: 2px; }
        .cp-suggestion { font-size: 12px; padding: 4px 12px; border-radius: 16px; border: 1px solid #8A00FF30; background: #8A00FF10; color: #c084fc; cursor: pointer; transition: all 0.15s; }
        .cp-suggestion:hover { background: #8A00FF25; color: #d8b4fe; border-color: #8A00FF50; }

        /* Checkpoint: git info-boks (uten git) */
        .cp-git-info { display: flex; gap: 14px; padding: 16px; border-radius: 12px; background: #1e3a5f18; border: 1px solid #3b82f630; margin-bottom: 16px; }
        .cp-git-info-icon { color: #60a5fa; flex-shrink: 0; margin-top: 2px; }
        .cp-git-info-body { flex: 1; }
        .cp-git-info-title { font-size: 14px; font-weight: 600; color: #93c5fd; margin-bottom: 8px; }
        .cp-git-info-text { font-size: 13px; color: #a1a1aa; line-height: 1.6; }
        .cp-git-info-text em { color: #c084fc; font-style: normal; font-weight: 500; }
        .cp-git-info-steps { margin-top: 14px; padding-top: 12px; border-top: 1px solid #ffffff08; }
        .cp-git-info-step-title { font-size: 13px; font-weight: 600; color: #E4E4E7; margin-bottom: 10px; }
        .cp-git-info-step { font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 8px; display: flex; gap: 8px; align-items: flex-start; }
        .cp-git-step-num { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: #8A00FF20; color: #c084fc; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .cp-git-info-prompt { position: relative; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 12px 44px 12px 14px; margin: 8px 0; }
        .cp-git-info-prompt code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #c9d1d9; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
        .cp-git-copy-btn { position: absolute; top: 8px; right: 8px; background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 6px; cursor: pointer; color: #8b949e; transition: all 0.15s; }
        .cp-git-copy-btn:hover { background: #30363d; color: #c9d1d9; }
        .cp-git-copy-btn.copied { color: #22c55e; border-color: #22c55e40; }

        .dp-tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .dp-tag {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 12px;
          background: #353542;
          color: #a1a1aa;
        }
        .dp-tag-active { background: #22c55e20; color: #22c55e; }
        .dp-tag-detected { background: #eab30820; color: #eab308; }

        /* Integration catalog — custom input */
        .int-custom-section { margin-bottom: 24px; padding: 14px; border-radius: 10px; border: 1px solid #ffffff12; background: #ffffff06; }
        .int-custom-label { font-size: 14px; font-weight: 600; color: #ddd; margin-bottom: 4px; }
        .int-custom-sublabel { font-size: 12px; color: #888; margin-bottom: 10px; line-height: 1.5; }
        .int-custom { display: flex; gap: 8px; }
        .int-custom input { flex: 1; background: #ffffff10; border: 1px solid #ffffff20; border-radius: 6px; padding: 8px 12px; color: #eee; font-size: 13px; outline: none; }
        .int-custom input:focus { border-color: #8A00FF60; }
        .int-custom button { padding: 8px 16px; border-radius: 6px; border: 1px solid #8A00FF40; background: #8A00FF20; color: #ccc; cursor: pointer; font-size: 13px; white-space: nowrap; }
        .int-custom button:hover { background: #8A00FF40; color: #fff; }
        .int-confirm { color: #00e8ff; font-size: 12px; margin-bottom: 16px; padding: 0 4px; line-height: 1.5; }

        /* Active integrations section */
        .int-active-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #353542; }
        .int-active-title { font-size: 13px; font-weight: 600; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .int-active-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .int-active-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 5px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 500;
        }
        .int-active-tag.tag-active { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
        .int-active-tag.tag-detected { background: rgba(234,179,8,0.15); color: #facc15; border: 1px solid rgba(234,179,8,0.3); }
        .int-active-empty { font-size: 13px; color: #71717A; font-style: italic; }

        /* Integration catalog — strategy banner */
        .int-strategy-banner {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .int-strategy-banner.active {
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          color: #86efac;
        }
        .int-strategy-banner.none {
          background: rgba(161,161,170,0.08);
          border: 1px solid rgba(161,161,170,0.15);
          color: #a1a1aa;
        }
        .int-strategy-link {
          color: #c084fc;
          text-decoration: underline;
          cursor: pointer;
        }
        .int-strategy-link:hover { color: #d8b4fe; }

        /* Settings model info */
        .st-model-info {
          font-size: 12px;
          color: #86efac;
          margin-top: 6px;
          padding: 4px 8px;
          background: rgba(34,197,94,0.08);
          border-radius: 4px;
          border: 1px solid rgba(34,197,94,0.15);
        }

        /* Tab badge (F37) */
        .tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 8px;
          background: #10B981;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          margin-left: 4px;
        }

        /* Onboarding Start tab (F37) */
        .ob-progress-bar-wrap {
          width: 100%;
          height: 6px;
          background: #27272A;
          border-radius: 3px;
          margin-bottom: 6px;
          overflow: hidden;
        }
        .ob-progress-bar {
          height: 100%;
          background: #10B981;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .ob-progress-text {
          font-size: 12px;
          color: #A1A1AA;
          margin-bottom: 16px;
        }
        .ob-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }
        .ob-card {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 10px;
          padding: 14px;
          transition: border-color 0.15s;
        }
        .ob-card.completed { border-color: rgba(16,185,129,0.25); opacity: 0.7; }
        .ob-card.locked { opacity: 0.5; }
        .ob-card.pending:hover { border-color: #10B981; }
        .ob-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .ob-card-title { font-size: 14px; font-weight: 600; color: #E4E4E7; }
        .ob-status-icon { display: flex; }
        .ob-status-icon.completed { color: #10B981; }
        .ob-status-icon.pending { color: #F59E0B; }
        .ob-status-icon.locked { color: #71717A; }
        .ob-card-desc { font-size: 12px; color: #A1A1AA; margin-bottom: 8px; line-height: 1.4; }
        .ob-card-actions { display: flex; gap: 8px; }
        .ob-action-btn {
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid #10B981;
          background: transparent;
          color: #10B981;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ob-action-btn:hover { background: rgba(16,185,129,0.1); }
        .ob-value-badge {
          font-size: 11px;
          background: rgba(16,185,129,0.12);
          color: #10B981;
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: auto;
        }
        .ob-locked-text { font-size: 11px; color: #71717A; font-style: italic; }

        /* Settings model selector (F35) */
        .st-model-select-wrap {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .st-model-label {
          font-size: 12px;
          color: #A1A1AA;
          white-space: nowrap;
        }
        .st-model-select {
          flex: 1;
          font-size: 12px;
        }

        /* Integration catalog — categories */
        .int-section-title { font-size: 16px; font-weight: 700; color: #E4E4E7; margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 1px solid #ffffff10; }
        .int-category { margin-bottom: 28px; }
        .int-cat-header { margin-bottom: 12px; }
        .int-cat-name { font-size: 15px; font-weight: 700; color: #e4e4e7; margin-bottom: 4px; }
        .int-cat-why { font-size: 12px; color: #888; line-height: 1.5; }

        /* Integration catalog — responsive card grid */
        .int-cards { display: flex; flex-wrap: wrap; gap: 10px; }
        .int-card {
          flex: 1 1 260px;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #ffffff10;
          border-radius: 8px;
          background: #ffffff04;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .int-card:hover { border-color: #ffffff20; }
        .int-card.active { border-color: #00ff8840; background: #00ff8806; }
        .int-card.setup { border-color: #00e8ff40; background: #00e8ff06; }
        .int-card.detected { border-color: #ffaa0040; background: #ffaa0006; }
        .int-card-top { padding: 12px 14px 8px; flex: 1; }
        .int-card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
        .int-card-name { font-size: 13px; font-weight: 600; color: #eee; }
        .int-card-desc { font-size: 12px; color: #999; line-height: 1.5; }
        .int-star { color: #ffaa00; margin-right: 4px; }
        .int-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; white-space: nowrap; font-weight: 600; }
        .int-badge.active { color: #00ff88; background: #00ff8820; }
        .int-badge.connected { color: #00ff88; background: #00ff8820; }
        .int-badge.configuring { color: #60a5fa; background: #60a5fa20; }
        .int-badge.auth-required { color: #fbbf24; background: #fbbf2420; }
        .int-badge.error-badge { color: #f87171; background: #f8717120; }
        .int-badge.setup { color: #00e8ff; background: #00e8ff20; }
        .int-badge.detected { color: #ffaa00; background: #ffaa0020; }
        .int-badge.recommended { color: #c084fc; background: #8A00FF20; }

        /* F43: Card state styles */
        .int-card.auth-required { border-left: 2px solid #fbbf24; }
        .int-card.error-status { border-left: 2px solid #f87171; }

        /* Integration catalog — expandable details */
        .int-card-details { display: none; padding: 0 14px; }
        .int-card-details.open { display: block; padding: 4px 14px 8px; border-top: 1px solid #ffffff08; }
        .int-detail-section { margin-bottom: 8px; }
        .int-detail-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 3px; }
        .int-pro { font-size: 12px; color: #86efac; line-height: 1.5; padding-left: 2px; }
        .int-con { font-size: 12px; color: #fca5a5; line-height: 1.5; padding-left: 2px; }
        .int-pricing { font-size: 12px; color: #ccc; line-height: 1.5; }
        .int-bestfor { font-size: 12px; color: #93c5fd; line-height: 1.5; font-style: italic; }

        /* Integration catalog — card footer */
        .int-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-top: 1px solid #ffffff08; gap: 8px; }
        .int-toggle-btn { font-size: 11px; padding: 4px 10px; border-radius: 4px; border: 1px solid #8A00FF30; background: #8A00FF15; color: #c084fc; cursor: pointer; }
        .int-toggle-btn:hover { background: #8A00FF30; color: #d8b4fe; border-color: #8A00FF50; }
        .int-add-btn { font-size: 11px; padding: 4px 12px; border-radius: 6px; border: 1px solid #ffffff20; background: #ffffff08; color: #ccc; cursor: pointer; white-space: nowrap; }
        .int-add-btn:hover { background: #ffffff15; color: #fff; }

        /* Credential form (F38) */
        .cred-section { border-top: 1px solid #ffffff10; padding-top: 10px; margin-top: 8px; }
        .cred-form { display: flex; flex-direction: column; gap: 10px; }
        .cred-field { display: flex; flex-direction: column; gap: 3px; }
        .cred-label { font-size: 12px; font-weight: 600; color: #D4D4D8; }
        .cred-input {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #3F3F46;
          background: #09090B;
          color: #E4E4E7;
          font-size: 13px;
          font-family: monospace;
          outline: none;
        }
        .cred-input:focus { border-color: #10B981; }
        .cred-help { font-size: 11px; color: #71717A; line-height: 1.3; }
        .cred-help a { color: #10B981; text-decoration: none; }
        .cred-help a:hover { text-decoration: underline; }
        .cred-save-btn {
          align-self: flex-start;
          padding: 6px 16px;
          border-radius: 6px;
          border: 1px solid #10B981;
          background: rgba(16,185,129,0.1);
          color: #10B981;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cred-save-btn:hover { background: rgba(16,185,129,0.2); }
        .cred-save-btn.saved { background: #10B981; color: #fff; }
        .cred-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cred-validation { font-size: 11px; margin-top: 2px; }
        .cred-validation.valid { color: #10B981; }
        .cred-validation.invalid { color: #EF4444; }
        .cred-input.cred-configured { border-color: #10B98140; }
        .cred-input.cred-configured::placeholder { color: #10B981; opacity: 0.8; }

        .dp-file-op {
          font-size: 11px;
          font-weight: 700;
          width: 18px;
          text-align: center;
          flex-shrink: 0;
        }
        .dp-op-created { color: #22c55e; }
        .dp-op-modified { color: #eab308; }
        .dp-file-path {
          flex: 1;
          font-family: monospace;
          font-size: 11px;
          color: #E4E4E7;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dp-bar-chart { display: flex; flex-direction: column; gap: 8px; }
        .dp-bar-row { display: flex; align-items: center; gap: 8px; }
        .dp-bar-label { font-size: 11px; color: #71717A; width: 24px; text-align: right; }
        .dp-bar-track { flex: 1; height: 8px; background: #353542; border-radius: 4px; overflow: hidden; }
        .dp-bar-fill { height: 100%; background: #8A00FF; border-radius: 4px; }
        .dp-bar-count { font-size: 11px; color: #a1a1aa; width: 28px; }
        .dp-dep-card {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .dp-dep-header { display: flex; align-items: center; gap: 8px; }
        .dp-dep-status { flex-shrink: 0; }
        .dp-dep-name { flex: 1; font-size: 13px; color: #E4E4E7; }
        .dp-dep-count { font-size: 11px; color: #71717A; }
        .dp-dep-features { font-size: 11px; color: #a1a1aa; margin-top: 6px; }
        .dp-scope-id { font-size: 12px; font-weight: 600; color: #00E8FF; }
        .dp-scope-change { font-size: 12px; color: #a1a1aa; }
        .dp-zone-green { border-color: #22c55e40; }
        .dp-zone-yellow { border-color: #eab30840; }
        .dp-zone-red { border-color: #ef444440; }
        .dp-zone-green .dp-metric-val { color: #22c55e; }
        .dp-zone-yellow .dp-metric-val { color: #eab308; }
        .dp-zone-red .dp-metric-val { color: #ef4444; }

        /* ─── Right content area ─── */
        .panel-right {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 24px;
        }

        /* ─── Dashboard View ─── */
        .dash-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }
        .dash-container::-webkit-scrollbar { width: 4px; }
        .dash-container::-webkit-scrollbar-track { background: transparent; }
        .dash-container::-webkit-scrollbar-thumb { background: #353542; border-radius: 2px; }
        .dash-header {
          flex-shrink: 0;
        }
        .dash-title {
          font-size: 18px;
          font-weight: 600;
          color: #E4E4E7;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dash-section {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 10px;
          padding: 20px;
        }
        .dash-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid #353542;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dash-session-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dash-session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .dash-session-label { color: #71717A; }
        .dash-session-val { color: #a1a1aa; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }

        /* ─── Tab icons (used in .nav-item) ─── */
        .tab-icon {
          display: flex;
          align-items: center;
          color: var(--tab-color);
          opacity: 0.5;
          transition: opacity 0.15s;
        }

        /* ─── Content ─── */
        .panel-content {
          flex: 1;
          overflow-y: auto;
        }
        .panel-content::-webkit-scrollbar { width: 4px; }
        .panel-content::-webkit-scrollbar-track { background: transparent; }
        .panel-content::-webkit-scrollbar-thumb { background: #353542; border-radius: 2px; }

        .empty { text-align: center; color: #71717A; padding: 40px; font-size: 14px; }
        .empty-small { text-align: center; color: #71717A; padding: 12px; font-size: 12px; }

        /* ─── Toggle buttons ─── */
        .toggle-all {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          justify-content: flex-end;
        }
        .toggle-btn {
          background: none;
          border: 1px solid #353542;
          color: #a1a1aa;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .toggle-btn:hover { background: #353542; color: #E4E4E7; }
        .toggle-btn.mod-type-toggle { border-color: #8A00FF40; color: #B07AFF; }
        .toggle-btn.mod-type-toggle:hover { background: rgba(138, 0, 255, 0.1); }

        /* ─── Module list (vertikal) ─── */
        .module-list { display: flex; flex-direction: column; gap: 8px; }

        .module-item {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 8px;
          padding: 14px 18px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .module-item:hover { background: #222228; }
        .module-item.expanded { border-color: #B07AFF; background: #222228; }

        .module-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .module-name { font-size: 14px; font-weight: 500; }
        .module-meta { font-size: 12px; color: #71717A; }
        .module-status {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .module-status.done { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .module-status.building { background: rgba(0, 232, 255, 0.13); color: #00E8FF; }
        .module-status.pending { background: rgba(107, 114, 128, 0.15); color: #71717A; }

        .progress-bar { height: 3px; background: #353542; border-radius: 2px; margin-top: 8px; }
        .progress-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
        .progress-fill.green { background: #22c55e; }
        .progress-fill.blue { background: linear-gradient(90deg, #8A00FF, #00E8FF); }
        .progress-fill.gray { background: #71717A; }

        /* ─── Module details (expanded) ─── */
        .module-details {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #353542;
        }

        .feature-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          font-size: 13px;
        }
        .feature-check { width: 16px; text-align: center; flex-shrink: 0; }
        .feature-row.done .feature-check { color: #22c55e; }
        .feature-row:not(.done) .feature-check { color: #71717A; }
        .feature-name { color: #a1a1aa; }
        .feature-row.done .feature-name { color: #E4E4E7; text-decoration: line-through; text-decoration-color: #52525b; }
        .feature-name.clickable { cursor: pointer; border-bottom: 1px dashed #52525b; }
        .feature-name.clickable:hover { color: #d8b4fe; border-bottom-color: #8A00FF60; }
        .feature-row.expanded .feature-name.clickable { color: #c084fc; border-bottom-color: #8A00FF; }
        .feat-detail-text { font-size: 12px; color: #a1a1aa; line-height: 1.6; padding: 6px 0 6px 24px; margin-bottom: 4px; border-left: 2px solid #8A00FF30; }
        .mod-filter-toggle { background: #22c55e15 !important; border-color: #22c55e30 !important; color: #86efac !important; }
        .mod-filter-toggle:hover { background: #22c55e25 !important; color: #bbf7d0 !important; }

        /* ─── Add function ─── */
        .mod-add-btn { width: 100%; padding: 10px; margin-top: 8px; background: #1a1a2e; border: 1px dashed #4a4a6a; border-radius: 8px; color: #a1a1aa; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .mod-add-btn:hover { background: #222240; border-color: #8A00FF60; color: #d8b4fe; }
        .mod-add-form { margin-top: 8px; padding: 12px; background: #1a1a2e; border: 1px solid #8A00FF40; border-radius: 8px; display: flex; flex-direction: column; gap: 8px; }
        .mod-add-title { font-size: 13px; font-weight: 600; color: #e4e4e7; margin-bottom: 2px; }
        .mod-add-name, .mod-add-desc { width: 100%; box-sizing: border-box; padding: 8px 10px; background: #13131f; border: 1px solid #353542; border-radius: 6px; color: #e4e4e7; font-size: 13px; font-family: inherit; resize: vertical; }
        .mod-add-name:focus, .mod-add-desc:focus { border-color: #8A00FF; outline: none; }
        .mod-add-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
        .mod-add-cancel { padding: 6px 14px; background: transparent; border: 1px solid #353542; border-radius: 6px; color: #a1a1aa; font-size: 12px; cursor: pointer; }
        .mod-add-cancel:hover { border-color: #71717a; color: #d4d4d8; }
        .mod-add-save { padding: 6px 14px; background: #8A00FF20; border: 1px solid #8A00FF50; border-radius: 6px; color: #c084fc; font-size: 12px; font-weight: 600; cursor: pointer; }
        .mod-add-save:hover { background: #8A00FF35; color: #e9d5ff; }

        /* ─── Describe (Hva betyr dette?) ─── */
        .module-describe {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px dashed #353542;
        }
        .desc-module-btn {
          background: none;
          border: 1px dashed #8A00FF;
          color: #B07AFF;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }
        .desc-module-btn:hover { background: rgba(138, 0, 255, 0.1); }

        .desc-feat-btn {
          width: 22px; height: 22px;
          border-radius: 50%;
          border: 1px solid #52525b;
          background: none;
          color: #71717A;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          margin-left: auto;
        }
        .desc-feat-btn:hover { border-color: #B07AFF; color: #B07AFF; background: rgba(138, 0, 255, 0.1); }
        .desc-feat-btn.active { border-color: #B07AFF; color: #B07AFF; }

        .desc-text {
          font-size: 13px;
          color: #c084fc;
          padding: 8px 12px;
          background: rgba(138, 0, 255, 0.08);
          border-radius: 8px;
          line-height: 1.5;
        }
        .desc-text.loading { color: #71717A; font-style: italic; }
        .desc-text.feat-desc { margin: 4px 0 8px 20px; font-size: 12px; }

        /* ─── Log ─── */
        .log-feed { font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace; font-size: 12px; }
        .log-entry {
          padding: 8px 12px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          line-height: 1.5;
          border-radius: 4px;
          justify-content: space-between;
        }
        .log-entry:hover { background: #2c2c38; }
        .log-icon { min-width: 18px; flex-shrink: 0; }
        .log-text { color: #a1a1aa; flex: 1; }
        .log-time { color: #52525b; font-size: 11px; white-space: nowrap; flex-shrink: 0; margin-left: 12px; text-align: right; }

        /* ─── Errors ─── */
        .error-entry {
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 8px;
          margin-bottom: 8px;
          font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace;
          font-size: 12px;
        }
        .error-type { color: #ef4444; font-weight: 600; margin-bottom: 4px; }
        .error-message { color: #a1a1aa; word-break: break-word; }

        /* ─── Error explainer ─── */
        .errors-explainer, .tab-explainer { padding: 14px 16px; border-radius: 10px; background: #ffffff05; border: 1px solid #ffffff10; margin-bottom: 14px; }
        .errors-explainer-title, .tab-explainer-title { font-size: 13px; font-weight: 600; color: #E4E4E7; margin-bottom: 6px; }
        .errors-explainer-text, .tab-explainer-text { font-size: 12px; color: #a1a1aa; line-height: 1.6; }

        /* ─── Error toolbar ─── */
        .error-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .error-filters {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #353542;
          background: none;
          color: #a1a1aa;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
        }
        .filter-btn:hover { background: #353542; color: #E4E4E7; }
        .filter-btn.active { background: #353542; color: #E4E4E7; border-color: #B07AFF; }
        .filter-btn.filter-error.active { border-color: #ef4444; color: #ef4444; }
        .filter-btn.filter-warn.active { border-color: #f59e0b; color: #f59e0b; }
        .filter-btn.filter-uncaught.active { border-color: #ec4899; color: #ec4899; }
        .filter-btn.filter-promise.active { border-color: #8b5cf6; color: #8b5cf6; }

        .clear-errors-btn {
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          background: none;
          color: #ef4444;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
        }
        .clear-errors-btn:hover { background: rgba(239, 68, 68, 0.1); }

        /* ─── Enhanced error entries ─── */
        .error-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .error-type-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .error-type-badge.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .error-type-badge.warn { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .error-type-badge.uncaught { background: rgba(236, 72, 153, 0.2); color: #ec4899; }
        .error-type-badge.promise { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }

        .error-status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .error-status-badge.fixing {
          background: rgba(234, 179, 8, 0.2);
          color: #eab308;
          animation: pulse-badge 2s ease-in-out infinite;
        }
        .error-status-badge.unfixable {
          background: rgba(113, 113, 122, 0.2);
          color: #71717a;
        }
        .error-count-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }
        .error-entry.error-fixing {
          border-left: 3px solid #eab308;
          opacity: 0.8;
        }
        .error-entry.error-unfixable {
          opacity: 0.5;
        }
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .error-source {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 11px;
          color: #71717A;
        }
        .error-time {
          margin-left: auto;
          font-size: 11px;
          color: #52525b;
          white-space: nowrap;
        }
        .error-entry.error-warn {
          background: rgba(245, 158, 11, 0.06);
          border-color: rgba(245, 158, 11, 0.12);
        }
        .error-entry.error-uncaught {
          background: rgba(236, 72, 153, 0.06);
          border-color: rgba(236, 72, 153, 0.12);
        }
        .error-entry.error-promise {
          background: rgba(139, 92, 246, 0.06);
          border-color: rgba(139, 92, 246, 0.12);
        }

        /* ─── Connection error banner ─── */
        .connection-error {
          background: rgba(239, 68, 68, 0.1);
          border-bottom: 2px solid #ef4444;
          padding: 12px 16px;
          font-size: 13px;
          color: #ef4444;
        }
        .error-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        .retry-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
        }
        .retry-btn:hover { background: #dc2626; }
        .status-badge.disconnected {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        /* ─── Backlog Layout (3-column) ─── */
        .bl-layout {
          display: grid;
          grid-template-columns: 200px 1fr 260px;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        /* ─── Conversation Sidebar (left) ─── */
        .bl-conv-sidebar {
          border-right: 1px solid #353542;
          padding: 12px;
          overflow-y: auto;
          background: #262632;
        }
        .bl-conv-sidebar::-webkit-scrollbar { width: 4px; }
        .bl-conv-sidebar::-webkit-scrollbar-track { background: transparent; }
        .bl-conv-sidebar::-webkit-scrollbar-thumb { background: #353542; border-radius: 2px; }

        /* ─── Build Sidebar (right) ─── */
        .bl-build-sidebar {
          border-left: 1px solid #353542;
          padding: 12px;
          overflow-y: auto;
          background: #262632;
        }
        .bl-build-sidebar::-webkit-scrollbar { width: 4px; }
        .bl-build-sidebar::-webkit-scrollbar-track { background: transparent; }
        .bl-build-sidebar::-webkit-scrollbar-thumb { background: #353542; border-radius: 2px; }

        .bl-tree-section-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717A;
          font-weight: 600;
          padding: 8px 4px 6px;
        }
        .bl-tree-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #a1a1aa;
          transition: background 0.15s;
        }
        .bl-tree-item:hover { background: #353542; color: #E4E4E7; }
        .bl-tree-toggle { width: 12px; font-size: 10px; color: #71717A; flex-shrink: 0; text-align: center; }
        .bl-tree-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bl-tree-dot.done { background: #22c55e; }
        .bl-tree-dot.progress { background: #00E8FF; }
        .bl-tree-dot.pending { background: #52525b; }
        .bl-tree-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bl-tree-type {
          font-size: 9px;
          padding: 1px 4px;
          border-radius: 3px;
          background: #353542;
          color: #71717A;
          flex-shrink: 0;
        }
        .bl-tree-child { padding-left: 20px; }
        .bl-tree-level-2 { padding-left: 36px; }
        .bl-tree-level-3 { padding-left: 48px; }
        .bl-tree-empty { font-size: 11px; color: #52525b; padding: 8px; text-align: center; }

        .bl-conv-new {
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #B07AFF;
          transition: background 0.15s;
        }
        .bl-conv-new:hover { background: rgba(138, 0, 255, 0.1); }
        .bl-conv-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #a1a1aa;
          transition: background 0.15s;
        }
        .bl-conv-title-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }
        .bl-conv-delete {
          flex-shrink: 0;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 11px;
          padding: 2px 4px;
          border-radius: 3px;
          opacity: 0;
          transition: opacity 0.15s, color 0.15s;
        }
        .bl-conv-item:hover .bl-conv-delete { opacity: 1; }
        .bl-conv-delete:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .bl-conv-item:hover { background: #353542; color: #E4E4E7; }
        .bl-conv-item.active { background: rgba(138, 0, 255, 0.15); color: #B07AFF; }

        /* ─── Chat Area ─── */
        .bl-chat-area {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .bl-chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .bl-chat-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid #353542;
          flex-shrink: 0;
        }
        .bl-chat-conv-title { font-size: 13px; font-weight: 500; color: #E4E4E7; }
        .bl-chat-topbar-right { display: flex; align-items: center; gap: 10px; }
        .bl-chat-counter { font-size: 11px; color: #71717A; }
        .bl-chat-counter .bl-count-current { color: #B07AFF; font-weight: 600; }
        .bl-chat-counter.maxed { color: #ef4444; }
        .bl-chat-counter.maxed .bl-count-current { color: #ef4444; }
        .settings-icon-btn {
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0 !important;
          border-radius: 6px;
          color: #71717A;
          background: transparent;
        }
        .settings-icon-btn:hover { background: #353542; color: #E4E4E7; }

        /* ─── Messages ─── */
        .bl-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bl-chat-messages::-webkit-scrollbar { width: 4px; }
        .bl-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .bl-chat-messages::-webkit-scrollbar-thumb { background: #353542; border-radius: 2px; }

        .bl-chat-msg {
          max-width: 85%;
          animation: slideUp 0.2s ease-out;
        }
        .bl-chat-msg.user { align-self: flex-end; }
        .bl-chat-msg.ai { align-self: flex-start; }

        .bl-chat-role {
          display: block;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #71717A;
          margin-bottom: 4px;
        }
        .bl-chat-msg.user .bl-chat-role { text-align: right; }

        .bl-chat-content {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
          word-break: break-word;
        }
        .bl-chat-msg.user .bl-chat-content {
          white-space: pre-wrap;
          background: #8A00FF;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .bl-chat-msg.ai .bl-chat-content {
          background: #2c2c38;
          color: #E4E4E7;
          border-bottom-left-radius: 4px;
        }

        .bl-chat-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
        }

        /* ─── Markdown in chat ─── */
        .bl-md-pre {
          background: #0a0a0e;
          border: 1px solid #353542;
          border-radius: 6px;
          padding: 10px 12px;
          margin: 8px 0;
          overflow-x: auto;
          font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre;
        }
        .bl-md-pre code { color: #E4E4E7; }
        .bl-md-code {
          background: rgba(138, 0, 255, 0.15);
          padding: 1px 5px;
          border-radius: 3px;
          font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace;
          font-size: 12px;
          color: #c084fc;
        }
        .bl-md-h2 { font-size: 15px; font-weight: 600; margin: 12px 0 6px; color: #E4E4E7; }
        .bl-md-h3 { font-size: 14px; font-weight: 600; margin: 10px 0 4px; color: #E4E4E7; }
        .bl-md-li { padding-left: 12px; margin: 2px 0; }

        /* ─── Typing indicator ─── */
        .bl-chat-typing {
          display: flex;
          gap: 4px;
          padding: 14px 18px;
        }
        .bl-typing-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #71717A;
          animation: typingBounce 1.2s infinite;
        }
        .bl-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .bl-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* ─── Input Area ─── */
        .bl-chat-input-area {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #353542;
          flex-shrink: 0;
        }
        .bl-chat-input {
          flex: 1;
          padding: 10px 14px;
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 10px;
          color: #E4E4E7;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }
        .bl-chat-input:focus { border-color: #B07AFF; }
        .bl-chat-input::placeholder { color: #71717A; }
        .bl-chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .bl-chat-send {
          width: 38px; height: 38px;
          background: #8A00FF;
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }
        .bl-chat-send:hover:not(:disabled) { opacity: 0.85; }
        .bl-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ─── Approval Cards ─── */
        .bl-approval-card {
          background: #0a0a0e;
          border: 1px solid #353542;
          border-radius: 10px;
          padding: 12px;
          margin-top: 10px;
        }
        .bl-approval-title {
          font-size: 12px;
          font-weight: 600;
          color: #B07AFF;
          margin-bottom: 8px;
        }
        .bl-approval-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          font-size: 12px;
          color: #a1a1aa;
        }
        .bl-approval-type {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          background: rgba(138, 0, 255, 0.15);
          color: #B07AFF;
          flex-shrink: 0;
        }
        .bl-approval-name { flex: 1; }
        .bl-approval-priority {
          font-size: 9px;
          padding: 1px 5px;
          border-radius: 3px;
          font-weight: 600;
        }
        .bl-approval-priority.must { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .bl-approval-priority.should { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .bl-approval-priority.could { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .bl-approval-note {
          font-size: 11px;
          color: #71717A;
          font-style: italic;
          padding: 6px 0;
          border-top: 1px solid #353542;
          margin-top: 6px;
        }
        .bl-approval-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .bl-approval-btn {
          flex: 1;
          padding: 7px 14px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s;
        }
        .bl-approval-btn:hover { opacity: 0.85; }
        .bl-approval-btn.accept { background: #22c55e; color: white; }
        .bl-approval-btn.reject { background: #353542; color: #a1a1aa; }

        /* ─── Chat Welcome / Setup ─── */
        .bl-chat-setup, .bl-chat-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px;
          text-align: center;
        }
        .bl-chat-setup-icon, .bl-chat-welcome-icon { font-size: 40px; margin-bottom: 16px; }
        .bl-chat-setup-title, .bl-chat-welcome-title {
          font-size: 18px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 8px;
        }
        .bl-chat-setup-text, .bl-chat-welcome-text {
          font-size: 13px;
          color: #71717A;
          max-width: 320px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .bl-chat-setup-btn, .bl-chat-new-btn {
          padding: 10px 24px;
          background: #8A00FF;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s;
        }
        .bl-chat-setup-btn:hover, .bl-chat-new-btn:hover { opacity: 0.85; }
        .bl-chat-setup-steps {
          text-align: left;
          max-width: 360px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bl-chat-setup-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.5;
        }
        .bl-step-num {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(138, 0, 255, 0.15);
          color: #B07AFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        .bl-chat-setup-scroll {
          overflow-y: auto;
          justify-content: flex-start;
          padding-top: 24px;
        }
        .bl-chat-setup-footer {
          font-size: 12px;
          color: #71717A;
          margin-top: 16px;
          text-align: center;
          line-height: 1.6;
        }
        .bl-provider-guide {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 440px;
          width: 100%;
          text-align: left;
        }
        .bl-provider-guide-card {
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .bl-provider-guide-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .bl-provider-guide-name {
          font-size: 14px;
          font-weight: 600;
          color: #E4E4E7;
        }
        .bl-provider-guide-tag {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .bl-provider-guide-tag.free {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .bl-provider-guide-tag.paid {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .bl-provider-guide-desc {
          font-size: 12px;
          color: #71717A;
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .bl-provider-guide-steps {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: #a1a1aa;
          line-height: 1.5;
        }
        .bl-link {
          color: #B07AFF;
          text-decoration: none;
        }
        .bl-link:hover { text-decoration: underline; }

        /* ─── Settings Modal ─── */
        .bl-settings-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
        }
        .bl-settings-modal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #262632;
          border: 1px solid #353542;
          border-radius: 14px;
          padding: 24px;
          z-index: 101;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .bl-settings-modal-wide { max-width: 520px; max-height: 80vh; overflow-y: auto; }
        .bl-settings-modal-wide::-webkit-scrollbar { width: 4px; }
        .bl-settings-modal-wide::-webkit-scrollbar-track { background: transparent; }
        .bl-settings-modal-wide::-webkit-scrollbar-thumb { background: #353542; border-radius: 2px; }
        .bl-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .bl-settings-title { font-size: 16px; font-weight: 700; color: #E4E4E7; display: flex; align-items: center; gap: 8px; }
        .bl-settings-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .bl-settings-close {
          background: none;
          border: none;
          color: #71717A;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        }
        .bl-settings-close:hover { color: #E4E4E7; }
        .bl-settings-loading { padding: 24px; text-align: center; color: #a1a1aa; font-size: 13px; }
        /* ─── Slik fungerer det-popup ─── */
        .hiw-intro { font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 16px; }
        .hiw-steps { display: flex; flex-direction: column; gap: 10px; }
        .hiw-step { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 12px; background: rgba(138,0,255,0.06); border: 1px solid rgba(138,0,255,0.15); }
        .hiw-num { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, rgba(138,0,255,0.35), rgba(100,0,200,0.2)); border: 1px solid rgba(138,0,255,0.4); color: #d4b0ff; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .hiw-step-h { font-size: 13.5px; font-weight: 700; color: #E4E4E7; margin-bottom: 2px; }
        .hiw-step-d { font-size: 12.5px; color: #a1a1aa; line-height: 1.55; }
        .hiw-phases { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 16px; }
        .hiw-phase { font-size: 12px; font-weight: 600; color: #d4b0ff; background: rgba(138,0,255,0.1); border: 1px solid rgba(138,0,255,0.2); border-radius: 8px; padding: 4px 9px; }
        .hiw-phase-arrow { color: rgba(138,0,255,0.5); font-size: 12px; }
        .hiw-modes { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #353542; padding-top: 14px; }
        .hiw-mode { font-size: 12.5px; color: #a1a1aa; line-height: 1.5; }
        .hiw-mode-tag { display: inline-block; font-weight: 700; color: #E4E4E7; background: rgba(138,0,255,0.15); border-radius: 6px; padding: 1px 8px; margin-right: 6px; }
        .light-theme .hiw-intro, .light-theme .hiw-step-d, .light-theme .hiw-mode { color: #52525b; }
        .light-theme .hiw-step-h, .light-theme .hiw-mode-tag { color: #1e1e2e; }
        .light-theme .hiw-modes { border-top-color: #d0d0de; }
        .bl-settings-field { margin-bottom: 12px; }
        .bl-settings-label {
          display: block;
          font-size: 12px;
          color: #a1a1aa;
          margin-bottom: 6px;
          font-weight: 500;
        }
        .bl-settings-input {
          width: 100%;
          padding: 10px 12px;
          background: #2c2c38;
          border: 1px solid #353542;
          border-radius: 8px;
          color: #E4E4E7;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
        }
        .bl-settings-input:focus { border-color: #B07AFF; }
        select.bl-settings-input {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
          cursor: pointer;
        }
        .bl-settings-hint {
          font-size: 11px;
          color: #52525b;
          margin-top: 6px;
          line-height: 1.4;
        }
        .bl-settings-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .bl-settings-btn {
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          font-size: 13px;
          cursor: pointer;
          font-weight: 500;
          font-family: inherit;
        }
        .bl-settings-btn.primary { background: #8A00FF; color: white; }
        .bl-settings-btn.primary:hover { opacity: 0.85; }
        .bl-settings-btn.secondary { background: #353542; color: #a1a1aa; }
        .bl-settings-btn.secondary:hover { background: #3f3f46; }
        .bl-settings-btn.danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .bl-settings-btn.danger:hover { background: rgba(239, 68, 68, 0.25); }

        /* ─── Provider List ─── */
        .bl-provider-list { display: flex; flex-direction: column; gap: 8px; }
        .bl-provider-item {
          border: 1px solid #353542;
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .bl-provider-item.expanded { border-color: #B07AFF; }
        .bl-provider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .bl-provider-header:hover { background: rgba(255, 255, 255, 0.03); }
        .bl-provider-info { display: flex; flex-direction: column; gap: 2px; }
        .bl-provider-name { font-size: 13px; font-weight: 600; color: #E4E4E7; }
        .bl-provider-status { font-size: 11px; color: #71717A; }
        .bl-provider-status.configured { color: #22c55e; }
        .bl-provider-actions-top { display: flex; align-items: center; gap: 8px; }
        .bl-provider-activate {
          background: none;
          border: 1px solid #353542;
          color: #a1a1aa;
          padding: 3px 10px;
          border-radius: 5px;
          font-size: 11px;
          cursor: pointer;
          font-family: inherit;
        }
        .bl-provider-activate:hover { border-color: #B07AFF; color: #B07AFF; }
        .bl-provider-deactivate {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #B07AFF;
          background: rgba(138, 0, 255, 0.15);
          padding: 3px 10px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .bl-provider-deactivate:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .bl-provider-active-badge {
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
          color: #B07AFF; background: rgba(138, 0, 255, 0.15); padding: 3px 10px; border-radius: 5px;
        }
        .bl-provider-chevron { font-size: 12px; color: #71717A; }
        .bl-provider-detail {
          padding: 0 14px 14px;
          border-top: 1px solid #353542;
        }
        .bl-provider-detail .bl-settings-field:first-child { margin-top: 12px; }
        .bl-provider-detail-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          align-items: center;
          margin-top: 4px;
        }
        .bl-save-confirm {
          color: #22c55e;
          font-size: 13px;
          font-weight: 500;
          animation: fadeInOut 3s ease;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* ─── Light Theme ──────────────────────────────────── */
        .light-theme { background: #f0f0f6; color: #1e1e2e; }
        .light-theme .fab-badge { border-color: #f0f0f6; }
        .light-theme .panel-header { background: #e6e6f0; border-bottom: 1px solid #d0d0de; }
        .light-theme .logo { color: #7000d0; }
        .light-theme .project-name { color: #4a4a5a; }
        .light-theme .status-badge { background: rgba(34,197,94,0.12); color: #16a34a; }
        .light-theme .status-badge.disconnected { background: rgba(239,68,68,0.1); color: #dc2626; }
        .light-theme .status-badge.has-errors { background: rgba(239,68,68,0.1); color: #dc2626; }
        .light-theme .panel-btn { color: #6b6b7a; }
        .light-theme .panel-btn:hover { background: #dcdce8; color: #1e1e2e; }
        .light-theme .panel-nav { background: #e6e6f0; border-bottom-color: #d0d0de; }
        .light-theme .nav-item { color: #6b6b7a; }
        .light-theme .nav-item:hover { color: #1e1e2e; }
        .light-theme .nav-item.active { color: var(--tab-color, #7000d0); border-bottom-color: var(--tab-color, #7000d0); }
        .light-theme .nav-separator { background: #d0d0de; }
        .light-theme .sidebar, .light-theme .panel-sidebar { background: #e6e6f0; border-right: 1px solid #d0d0de; }
        .light-theme .sidebar-title { color: #6b6b7a; }
        .light-theme .sidebar-divider { background: #d0d0de; }
        .light-theme .sidebar-item { color: #4a4a5a; }
        .light-theme .sidebar-item:hover { background: rgba(112,0,208,0.06); color: #1e1e2e; }
        .light-theme .sidebar-item.selected { background: rgba(112,0,208,0.1); color: #7000d0; }
        .light-theme .phase-item { border-bottom-color: #d8d8e4; }
        .light-theme .phase-item.clickable:hover { background: rgba(112,0,208,0.05); }
        .light-theme .phase-item.active { background: rgba(112,0,208,0.08); border-right-color: #7000d0; }
        .light-theme .phase-item.selected { background: rgba(112,0,208,0.12); border-right-color: #7000d0; }
        .light-theme .phase-label.completed { color: #4a4a5a; }
        .light-theme .phase-label.active { color: #1e1e2e; }
        .light-theme .phase-label.pending { color: #8888a0; }
        .light-theme .phase-icon-circle.completed { background: rgba(34,197,94,0.1); color: #16a34a; }
        .light-theme .phase-icon-circle.active { background: rgba(112,0,208,0.1); color: #7000d0; }
        .light-theme .phase-icon-circle.pending { background: rgba(107,114,128,0.1); color: #8888a0; }
        .light-theme .phase-arrow { color: #8888a0; }
        /* panel-tabs moved to panel-nav — see .nav-item above */
        .light-theme .panel-content { color: #1e1e2e; }
        .light-theme .panel-content::-webkit-scrollbar-thumb { background: #c8c8d4; }
        .light-theme .back-btn { color: #6b6b7a; }
        .light-theme .back-btn:hover { background: #dcdce8; color: #1e1e2e; }

        /* Dashboard light */
        .light-theme .dash-container { color: #1e1e2e; }
        .light-theme .dash-header { color: #1e1e2e; }
        .light-theme .dash-title { color: #1e1e2e; }
        .light-theme .dash-section { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .dash-section-title { color: #1e1e2e; }
        .light-theme .st-info-card { background: #f0f0f8; border-color: #d8d8e4; }
        .light-theme .st-info-label { color: #6b6b7a; }
        .light-theme .st-info-value { color: #1e1e2e; }
        .light-theme .st-info-hint { color: #8888a0; }
        .light-theme .st-gate-item { color: #4a4a5a; }

        /* Phase detail light */
        .light-theme .phase-detail-header { border-bottom-color: #d8d8e4; }
        .light-theme .phase-detail-name { color: #1e1e2e; }
        .light-theme .phase-detail-num { background: rgba(112,0,208,0.1); color: #7000d0; }
        .light-theme .phase-detail-content { color: #1e1e2e; }
        .light-theme .phase-detail-content::-webkit-scrollbar-thumb { background: #c8c8d4; }
        .light-theme .phase-detail-section { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .phase-section-title { color: #1e1e2e; border-bottom-color: #d8d8e4; }
        /* phase-summary-section removed — class not used in HTML */
        .light-theme .phase-summary-text { color: #4a4a5a; }
        .light-theme .phase-time-item { color: #6b6b7a; }
        .light-theme .phase-status-badge.completed { background: rgba(34,197,94,0.1); color: #16a34a; }
        .light-theme .phase-status-badge.active { background: rgba(112,0,208,0.08); color: #7000d0; }
        .light-theme .phase-status-badge.pending { background: rgba(107,114,128,0.08); color: #8888a0; }
        .light-theme .phase-gate-badge { color: #16a34a; background: rgba(34,197,94,0.08); }
        .light-theme .phase-step-item { color: #4a4a5a; }
        .light-theme .phase-step-item.done { color: #1e1e2e; }
        .light-theme .phase-doc-item { color: #4a4a5a; }
        .light-theme .phase-log-entry { border-bottom-color: #e8e8f0; }
        .light-theme .phase-log-entry .log-text { color: #4a4a5a; }
        .light-theme .phase-log-time { color: #8888a0; }
        .light-theme .back-btn { color: #4a4a5a; border-color: #d0d0de; }
        .light-theme .back-btn:hover { background: #e8e8f0; color: #1e1e2e; }

        /* Tabs content light */
        .light-theme .pt-view-tabs { border-bottom-color: #d0d0de; }
        .light-theme .pt-view-tab { color: #6b6b7a; }
        .light-theme .pt-view-tab.active { color: #7000d0; background: rgba(112,0,208,0.08); border-color: #7000d0; }
        .light-theme .pt-task { border-color: #d8d8e4; }
        .light-theme .pt-task-header:hover { background: rgba(112,0,208,0.04); }
        .light-theme .pt-task-name { color: #1e1e2e; }
        .light-theme .pt-task-chevron { color: #8888a0; }
        .light-theme .pt-task-status { color: #8888a0; background: rgba(107,114,128,0.08); }
        .light-theme .pt-task-body { color: #4a4a5a; border-top-color: #e8e8f0; }
        .light-theme .pt-task-action { background: linear-gradient(135deg, #7000d0, #5800a8); }
        .light-theme .pt-task-expert { color: #0090a0; }
        .light-theme .pt-task-level { color: #0090a0; }
        .light-theme .pt-task-reason { color: #6b6b7a; }
        .light-theme .pt-task.not_done .pt-task-name { color: #8888a0; }
        .light-theme .pt-status-tag--completed { color: #16a34a; background: rgba(22,163,74,0.10); }
        .light-theme .pt-status-tag--not-done  { color: #8888a0; background: rgba(136,136,160,0.08); }
        .light-theme .pt-status-tag--skipped   { color: #8888a0; background: rgba(136,136,160,0.10); }
        .light-theme .pt-status-tag--activated { color: #7c3aed; background: rgba(124,58,237,0.10); }
        .light-theme .pt-task-deliverable      { color: #4a4a5a; }
        .light-theme .pt-task-deliverable code { color: #16a34a; background: rgba(22,163,74,0.08); }
        .light-theme .pt-dep-name { color: #4a4a5a; }

        /* Modules light */
        .light-theme .modules-placeholder { color: #6b6b7a; }
        .light-theme .mod-section-title { color: #1e1e2e; }
        .light-theme .module-item { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .module-item:hover { border-color: #b0b0c0; }
        .light-theme .module-name { color: #1e1e2e; }
        .light-theme .module-meta { color: #6b6b7a; }
        .light-theme .module-status.done { background: rgba(34,197,94,0.1); color: #16a34a; }
        .light-theme .module-status.building { background: rgba(0,144,160,0.1); color: #0090a0; }
        .light-theme .module-status.pending { background: rgba(112,0,208,0.08); color: #7000d0; }
        .light-theme .desc-text { background: #f5f5fa; color: #1e1e2e; border-color: #d8d8e4; }
        .light-theme .feature-row { border-bottom-color: #e8e8f0; color: #4a4a5a; }
        .light-theme .feature-row.done .feature-name { color: #1e1e2e; text-decoration-color: #a1a1aa; }
        .light-theme .feature-row.done .feature-check { color: #16a34a; }
        .light-theme .feature-row:not(.done) .feature-name { color: #4a4a5a; }
        .light-theme .feature-name.clickable { border-bottom-color: #c0c0d0; }
        .light-theme .feature-name.clickable:hover { color: #7c3aed; border-bottom-color: #8A00FF40; }
        .light-theme .feature-row.expanded .feature-name.clickable { color: #6d28d9; border-bottom-color: #7c3aed; }
        .light-theme .feat-detail-text { color: #4b5563; border-left-color: #8A00FF20; }
        .light-theme .mod-filter-toggle { background: #22c55e10 !important; border-color: #22c55e25 !important; color: #16a34a !important; }
        .light-theme .mod-filter-toggle:hover { background: #22c55e18 !important; color: #15803d !important; }
        .light-theme .mod-add-btn { background: #f0f0f8; border-color: #c0c0d0; color: #6b6b7a; }
        .light-theme .mod-add-btn:hover { background: #e8e8f4; border-color: #8A00FF40; color: #7c3aed; }
        .light-theme .mod-add-form { background: #f5f5fa; border-color: #8A00FF30; }
        .light-theme .mod-add-title { color: #1e1e2e; }
        .light-theme .mod-add-name, .light-theme .mod-add-desc { background: #fff; border-color: #d0d0de; color: #1e1e2e; }
        .light-theme .mod-add-name:focus, .light-theme .mod-add-desc:focus { border-color: #7c3aed; }
        .light-theme .mod-add-cancel { border-color: #d0d0de; color: #6b6b7a; }
        .light-theme .mod-add-cancel:hover { border-color: #a0a0b0; color: #1e1e2e; }
        .light-theme .mod-add-save { background: #8A00FF10; border-color: #8A00FF30; color: #7c3aed; }
        .light-theme .mod-add-save:hover { background: #8A00FF20; color: #6d28d9; }
        .light-theme .toggle-btn.mod-type-toggle { background: #e0e0ec; color: #4a4a5a; }
        .light-theme .toggle-btn.mod-type-toggle:hover { background: #d0d0de; color: #1e1e2e; }

        /* Log light */
        .light-theme .log-entry { border-bottom-color: #e8e8f0; }
        .light-theme .log-message { color: #1e1e2e; }
        .light-theme .log-time { color: #8888a0; }
        .light-theme .log-icon { color: #6b6b7a; }

        /* Errors light */
        .light-theme .errors-explainer, .light-theme .tab-explainer { background: #f8f8fc; border-color: #e0e0ec; }
        .light-theme .errors-explainer-title, .light-theme .tab-explainer-title { color: #1e1e2e; }
        .light-theme .errors-explainer-text, .light-theme .tab-explainer-text { color: #6b6b7a; }
        .light-theme .error-filters button { background: #e0e0ec; color: #4a4a5a; border-color: #d0d0de; }
        .light-theme .error-filters button.active { background: rgba(112,0,208,0.1); color: #7000d0; border-color: #7000d0; }
        .light-theme .error-item { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .error-type { color: #dc2626; }
        .light-theme .error-message { color: #1e1e2e; }
        .light-theme .error-source { color: #8888a0; }
        .light-theme .clear-errors-btn { color: #dc2626; border-color: #dc2626; }

        /* Data panels (Innsikt) light */
        .light-theme .dp-nav { background: #e6e6f0; border-right-color: #d0d0de; }
        .light-theme .dp-nav-btn { color: #4a4a5a; }
        .light-theme .dp-nav-btn:hover { background: #dcdce8; color: #1e1e2e; }
        .light-theme .dp-nav-btn.active { background: rgba(112,0,208,0.08); color: #7000d0; }
        .light-theme .dp-nav-desc { color: #8888a0; }
        .light-theme .dp-nav-btn.active .dp-nav-desc { color: rgba(112,0,208,0.5); }
        .light-theme .dp-nav-btn:hover .dp-nav-desc { color: #6b6b7a; }
        .light-theme .dp-content { color: #1e1e2e; }
        .light-theme .dp-hint { background: #f0f0f8; color: #4a4a5a; border-left-color: #7000d0; }
        .light-theme .dp-placeholder { color: #8888a0; }
        .light-theme .dp-stat-row { color: #1e1e2e; }
        .light-theme .dp-stat-label { color: #6b6b7a; }
        .light-theme .dp-stat-value { color: #1e1e2e; }
        .light-theme .dp-event-desc { color: #1e1e2e; }
        .light-theme .dp-event-time { color: #8888a0; }
        .light-theme .dp-card { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .dp-card-time { color: #8888a0; }
        .light-theme .dp-card-body { color: #1e1e2e; }
        .light-theme .dp-card-footer { color: #6b6b7a; }
        /* dp-metric-card removed — correct class is .dp-metric (styled below) */
        .light-theme .dp-metric-val { color: #1e1e2e; }
        .light-theme .dp-metric-label { color: #8888a0; }
        /* dp-quality-item removed — correct class is .dp-quality-row (styled below) */
        .light-theme .dp-quality-name { color: #1e1e2e; }
        .light-theme .dp-module-card { border-color: #d8d8e4; }
        .light-theme .dp-module-name { color: #1e1e2e; }
        /* dp-module-bar-bg removed — correct class is .dp-progress-bar (styled below) */
        .light-theme .dp-module-stats { color: #8888a0; }
        .light-theme .dp-timeline-item { border-left-color: #d0d0de; }
        .light-theme .dp-timeline-title { color: #1e1e2e; }
        .light-theme .dp-timeline-meta { color: #8888a0; }
        .light-theme .dp-timeline-item:not(:last-child)::before { background: #d0d0de; }
        .light-theme .dp-timeline-dot { background: #7000d0; }
        /* Checkpoint tab — light theme */
        .light-theme .cp-timeline-item:not(:last-child)::before { background: #d0d0de; }
        .light-theme .cp-timeline-dot { background: #7000d0; }
        .light-theme .cp-timeline-title { color: #1e1e2e; }
        .light-theme .cp-timeline-meta { color: #8888a0; }
        .light-theme .cp-restore-btn { border-color: #8A00FF30; background: #8A00FF10; color: #7c3aed; }
        .light-theme .cp-restore-btn:hover { background: #8A00FF20; color: #6d28d9; }
        .light-theme .cp-confirm-overlay { background: rgba(255,255,255,0.6); }
        .light-theme .cp-confirm-dialog { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .cp-confirm-title { color: #1e1e2e; }
        .light-theme .cp-confirm-desc { color: #6b6b7a; }
        .light-theme .cp-confirm-desc strong { color: #1e1e2e; }
        .light-theme .cp-confirm-safety { background: #22c55e08; border-color: #22c55e20; color: #16a34a; }
        .light-theme .cp-confirm-btn.cancel { background: #f0f0f8; color: #6b6b7a; border-color: #d8d8e4; }
        .light-theme .cp-confirm-btn.confirm { background: #8A00FF15; border-color: #8A00FF30; color: #7c3aed; }
        .light-theme .cp-step-indicator { color: #8888a0; }
        .light-theme .cp-saved-check { background: #22c55e08; border-color: #22c55e20; }
        .light-theme .cp-saved-detail { color: #6b6b7a; }
        .light-theme .cp-confirm-divider { background: #e8e8f0; }
        .light-theme .cp-saving-spinner { border-color: #e8e8f0; border-top-color: #7000d0; }

        /* Checkpoint: git SHA — light theme */
        .light-theme .cp-git-sha { color: #7c3aed; background: #8A00FF10; }

        /* Checkpoint: manuell lagring — light theme */
        .light-theme .cp-save-section { background: #f8f8fc; border-color: #e0e0ec; }
        .light-theme .cp-save-title { color: #1e1e2e; }
        .light-theme .cp-save-btn { background: #8A00FF15; border-color: #8A00FF30; color: #7c3aed; }
        .light-theme .cp-save-btn:hover:not(:disabled) { background: #8A00FF25; color: #6d28d9; border-color: #8A00FF50; }
        .light-theme .cp-save-hint { color: #8888a0; }
        .light-theme .cp-suggestions-label { color: #8888a0; }
        .light-theme .cp-suggestion { border-color: #8A00FF25; background: #8A00FF08; color: #7c3aed; }
        .light-theme .cp-suggestion:hover { background: #8A00FF18; color: #6d28d9; border-color: #8A00FF40; }
        .light-theme .cp-save-spinner { border-color: #e8e8f0; border-top-color: #7000d0; }

        /* Checkpoint: git info-boks — light theme */
        .light-theme .cp-git-info { background: #eff6ff; border-color: #93c5fd40; }
        .light-theme .cp-git-info-icon { color: #3b82f6; }
        .light-theme .cp-git-info-title { color: #1d4ed8; }
        .light-theme .cp-git-info-text { color: #4b5563; }
        .light-theme .cp-git-info-text em { color: #7c3aed; }
        .light-theme .cp-git-info-step-title { color: #1e1e2e; }
        .light-theme .cp-git-info-step { color: #4b5563; }
        .light-theme .cp-git-step-num { background: #8A00FF15; color: #7c3aed; }
        .light-theme .cp-git-info-prompt { background: #f6f8fa; border-color: #d0d7de; }
        .light-theme .cp-git-info-prompt code { color: #24292f; }
        .light-theme .cp-git-copy-btn { background: #f0f0f8; border-color: #d0d7de; color: #6b7280; }
        .light-theme .cp-git-copy-btn:hover { background: #e5e5f0; color: #24292f; }
        .light-theme .cp-git-info-steps { border-top-color: #e5e7eb; }

        .light-theme .dp-section-title { color: #1e1e2e; }
        .light-theme .dp-list-item { background: #f0f0f8; color: #1e1e2e; }
        .light-theme .dp-event-type { background: #e8e8f0; color: #6b6b7a; }
        .light-theme .dp-file-item { background: #f0f0f8; color: #4a4a5a; }
        .light-theme .dp-quality-row { border-bottom-color: #e8e8f0; }
        .light-theme .dp-quality-stats { color: #6b6b7a; }
        .light-theme .dp-module-card { background: #ffffff; }
        .light-theme .dp-progress-bar { background: #e0e0ec; }
        .light-theme .dp-progress-fill { background: #7000d0; }
        .light-theme .dp-risk-type { color: #6b6b7a; }
        .light-theme .dp-tag { background: #e8e8f0; color: #4a4a5a; }
        .light-theme .int-custom-section { border-color: #00000010; background: #00000004; }
        .light-theme .int-custom-label { color: #333; }
        .light-theme .int-custom-sublabel { color: #666; }
        .light-theme .int-custom input { background: #ffffff; border-color: #00000020; color: #222; }
        .light-theme .int-custom input:focus { border-color: #7000d060; }
        .light-theme .int-custom button { border-color: #7000d040; background: #7000d020; color: #555; }
        .light-theme .int-custom button:hover { background: #7000d040; color: #222; }
        .light-theme .int-confirm { color: #0090a0; }
        .light-theme .int-active-section { border-bottom-color: #d0d0de; }
        .light-theme .int-active-title { color: #6b6b7a; }
        .light-theme .int-active-tag.tag-active { background: rgba(34,197,94,0.1); color: #16a34a; border-color: rgba(34,197,94,0.25); }
        .light-theme .int-active-tag.tag-detected { background: rgba(234,179,8,0.1); color: #b45309; border-color: rgba(234,179,8,0.25); }
        .light-theme .int-active-empty { color: #8888a0; }
        .light-theme .int-section-title { color: #1e1e2e; border-bottom-color: #e0e0ec; }
        .light-theme .int-cat-name { color: #1e1e2e; }
        .light-theme .int-cat-why { color: #666; }
        .light-theme .int-card { border-color: #00000010; background: #ffffff; }
        .light-theme .int-card:hover { border-color: #00000020; }
        .light-theme .int-card.active { border-color: #22c55e40; background: #f0fdf4; }
        .light-theme .int-card.setup { border-color: #0090a040; background: #f0fdfa; }
        .light-theme .int-card.detected { border-color: #eab30840; background: #fefce8; }
        .light-theme .int-card-name { color: #222; }
        .light-theme .int-card-desc { color: #666; }
        .light-theme .int-badge.active { color: #16a34a; background: #16a34a18; }
        .light-theme .int-badge.connected { color: #16a34a; background: #16a34a18; }
        .light-theme .int-badge.configuring { color: #2563eb; background: #2563eb18; }
        .light-theme .int-badge.auth-required { color: #d97706; background: #d9770618; }
        .light-theme .int-badge.error-badge { color: #dc2626; background: #dc262618; }
        .light-theme .int-badge.setup { color: #0090a0; background: #0090a018; }
        .light-theme .int-badge.detected { color: #b45309; background: #b4530918; }
        .light-theme .int-badge.recommended { color: #7c3aed; background: #7c3aed18; }
        .light-theme .int-card.auth-required { border-left-color: #d97706; }
        .light-theme .int-card.error-status { border-left-color: #dc2626; }
        .light-theme .int-card-details.open { border-top-color: #00000008; }
        .light-theme .int-detail-label { color: #888; }
        .light-theme .int-pro { color: #16a34a; }
        .light-theme .int-con { color: #dc2626; }
        .light-theme .int-pricing { color: #444; }
        .light-theme .int-bestfor { color: #2563eb; }
        .light-theme .int-card-footer { border-top-color: #00000008; }
        .light-theme .int-toggle-btn { border-color: #8A00FF30; background: #8A00FF10; color: #7c3aed; }
        .light-theme .int-toggle-btn:hover { background: #8A00FF20; color: #6d28d9; border-color: #8A00FF40; }
        .light-theme .int-add-btn { border-color: #00000020; background: #00000006; color: #555; }
        .light-theme .int-add-btn:hover { background: #00000012; color: #222; }
        .light-theme .int-strategy-banner.active { background: rgba(34,197,94,0.06); border-color: rgba(34,197,94,0.2); color: #16a34a; }
        .light-theme .int-strategy-banner.none { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.1); color: #71717a; }
        .light-theme .int-strategy-link { color: #7c3aed; }
        .light-theme .int-strategy-link:hover { color: #6d28d9; }
        .light-theme .st-model-info { color: #16a34a; background: rgba(34,197,94,0.06); border-color: rgba(34,197,94,0.15); }
        /* Light theme: Onboarding (F37) */
        .light-theme .ob-progress-bar-wrap { background: #E4E4E7; }
        .light-theme .ob-card { background: #fff; border-color: #E4E4E7; }
        .light-theme .ob-card.completed { border-color: rgba(16,185,129,0.3); }
        .light-theme .ob-card-title { color: #18181B; }
        .light-theme .ob-card-desc { color: #71717A; }
        .light-theme .ob-action-btn { color: #059669; border-color: #059669; }
        .light-theme .ob-action-btn:hover { background: rgba(5,150,105,0.08); }
        .light-theme .ob-value-badge { background: rgba(16,185,129,0.08); }
        /* Light theme: Credentials (F38) */
        .light-theme .cred-label { color: #3F3F46; }
        .light-theme .cred-input { background: #ffffff; color: #18181B; border-color: #d0d0de; }
        .light-theme .cred-input:focus { border-color: #10B981; }
        .light-theme .cred-save-btn { border-color: #10B981; background: rgba(16,185,129,0.06); color: #059669; }
        .light-theme .cred-save-btn:hover { background: rgba(16,185,129,0.12); }
        .light-theme .cred-save-btn.saved { background: #10B981; color: #fff; }
        .light-theme .cred-help { color: #52525B; }
        .light-theme .cred-input.cred-configured { border-color: #10B98130; }
        .light-theme .cred-input.cred-configured::placeholder { color: #059669; }
        .light-theme .st-model-label { color: #52525B; }
        .light-theme .dp-bar-track { background: #e0e0ec; }
        .light-theme .dp-bar-fill { background: #7000d0; }
        .light-theme .dp-bar-label { color: #6b6b7a; }
        .light-theme .dp-bar-count { color: #4a4a5a; }
        .light-theme .dp-dep-card { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .dp-dep-name { color: #1e1e2e; }
        .light-theme .dp-dep-count { color: #6b6b7a; }
        .light-theme .dp-dep-features { color: #4a4a5a; }
        .light-theme .dp-type-file { background: rgba(0,144,160,0.1); color: #0090a0; }
        .light-theme .dp-scope-id { color: #0090a0; }
        .light-theme .dp-scope-change { color: #4a4a5a; }
        .light-theme .dp-file-path { color: #1e1e2e; }
        .light-theme .dp-empty { color: #8888a0; }
        .light-theme .dp-session-id { color: #8888a0; }
        .light-theme .dp-card-fix { color: #16a34a; }
        .light-theme .dp-metric { background: #ffffff; border-color: #d8d8e4; }

        /* Backlog (Byggeliste) light */
        .light-theme .bl-layout { color: #1e1e2e; }
        .light-theme .bl-conv-sidebar { background: #e6e6f0; border-right-color: #d0d0de; }
        .light-theme .bl-build-sidebar { background: #e6e6f0; border-left-color: #d0d0de; }
        .light-theme .bl-conv-item { color: #4a4a5a; }
        .light-theme .bl-conv-item:hover { background: rgba(112,0,208,0.04); }
        .light-theme .bl-conv-item.active { background: rgba(112,0,208,0.08); color: #7000d0; }
        .light-theme .bl-chat-area { background: #f5f5fa; }
        .light-theme .bl-chat-messages { color: #1e1e2e; }
        .light-theme .bl-chat-msg.user .bl-chat-content { background: #7000d0; color: white; }
        .light-theme .bl-chat-msg.ai .bl-chat-content { background: #ffffff; color: #1e1e2e; border: 1px solid #d8d8e4; }
        .light-theme .bl-chat-input-area { background: #f0f0f6; border-top-color: #d0d0de; }
        .light-theme .bl-chat-input { background: #ffffff; color: #1e1e2e; border-color: #d0d0de; }
        .light-theme .bl-chat-input:focus { border-color: #7000d0; }
        .light-theme .bl-welcome-title, .light-theme .bl-chat-welcome-title, .light-theme .bl-chat-setup-title { color: #1e1e2e; }
        .light-theme .bl-welcome-text, .light-theme .bl-chat-welcome-text, .light-theme .bl-chat-setup-text { color: #6b6b7a; }
        .light-theme .bl-tree-section-title { color: #6b6b7a; }
        .light-theme .bl-tree-dot.progress { background: #0090a0; }
        .light-theme .bl-tree-item { color: #4a4a5a; }
        .light-theme .bl-tree-item:hover { background: rgba(112,0,208,0.04); }
        .light-theme .bl-approval-card { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .bl-approval-task { color: #1e1e2e; }

        /* Settings in dashboard & backlog light */
        .light-theme .st-label { color: #1e1e2e; }
        .light-theme .st-sub { color: #6b6b7a; }
        .light-theme .st-input { background: #ffffff; color: #1e1e2e; border-color: #d0d0de; }
        .light-theme .st-input:focus { border-color: #7000d0; }
        .light-theme .cp-save-input .cp-save-name { background: #ffffff; color: #1e1e2e; border-color: #d0d0de; }
        .light-theme .cp-save-input .cp-save-name:focus { border-color: #7000d0; }
        .light-theme .st-select { background: #ffffff; color: #1e1e2e; border-color: #d0d0de; }
        .light-theme .st-select:focus { border-color: #7000d0; }
        .light-theme .st-hint { color: #8888a0; }
        .light-theme .st-check-label { background: #f8f8fc; border-color: #d8d8e4; }
        .light-theme .st-check-label:hover { border-color: #b0b0c0; background: #f0f0f8; }
        .light-theme .st-check-label:has(.st-checkbox:checked) { border-color: #7000d0; background: rgba(112, 0, 208, 0.05); }
        .light-theme .st-checkbox { border-color: #b0b0c0; }
        .light-theme .st-checkbox:checked { background: #7000d0; border-color: #7000d0; }
        .light-theme .st-check-text { color: #1e1e2e; }
        .light-theme .st-check-desc { color: #8888a0; }
        .light-theme .st-field { background: #f0f0f8; border-color: #d8d8e4; }
        .light-theme .st-section { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .st-section-title { color: #1e1e2e; }
        .light-theme .st-status { color: #8888a0; }
        .light-theme .bl-settings-overlay { background: rgba(240,240,246,0.95); }
        .light-theme .bl-settings-modal { background: #ffffff; border-color: #d0d0de; }
        .light-theme .bl-settings-title { color: #1e1e2e; }
        .light-theme .bl-settings-label { color: #6b6b7a; }
        .light-theme .bl-settings-input { background: #f0f0f8; border-color: #d8d8e4; color: #1e1e2e; }
        .light-theme .bl-settings-btn.secondary { background: #e0e0ec; color: #4a4a5a; }
        .light-theme .bl-settings-btn.secondary:hover { background: #d0d0de; }
        .light-theme .bl-settings-btn.danger { background: rgba(239, 68, 68, 0.08); }
        .light-theme .bl-provider-item { border-color: #d8d8e4; }
        .light-theme .bl-provider-item.expanded { border-color: #7000d0; }
        .light-theme .bl-provider-header:hover { background: rgba(0, 0, 0, 0.02); }
        .light-theme .bl-provider-name { color: #1e1e2e; }
        .light-theme .bl-provider-status { color: #8888a0; }
        .light-theme .bl-provider-status.configured { color: #16a34a; }
        .light-theme .bl-provider-activate { border-color: #d8d8e4; color: #6b6b7a; }
        .light-theme .bl-provider-activate:hover { border-color: #7000d0; color: #7000d0; }
        .light-theme .bl-provider-deactivate { color: #7000d0; background: rgba(112, 0, 208, 0.1); }
        .light-theme .bl-provider-deactivate:hover { color: #dc2626; background: rgba(239, 68, 68, 0.1); }
        .light-theme .bl-provider-active-badge { color: #7000d0; background: rgba(112, 0, 208, 0.1); }
        .light-theme .bl-provider-detail { border-top-color: #d8d8e4; }
        .light-theme .settings-icon-btn { color: #6b6b7a; }
        .light-theme .settings-icon-btn:hover { background: #dcdce8; color: #1e1e2e; }
        .light-theme .bl-settings-section-title { color: #6b6b7a; }
        .light-theme .bl-provider-guide-card { background: #ffffff; border-color: #d8d8e4; }
        .light-theme .bl-provider-guide-name { color: #1e1e2e; }
        .light-theme .bl-provider-guide-desc { color: #6b6b7a; }
        .light-theme .bl-provider-guide-steps { color: #4a4a5a; }
        .light-theme .bl-chat-setup-footer { color: #6b6b7a; }
        .light-theme .bl-link { color: #7000d0; }

        /* Connection error light */
        .light-theme .connection-error { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2); }

        /* Toast: rendered in light DOM via showToast() */
      `
    }
  }

  // Registrer Custom Element
  customElements.define('kit-cc-overlay', KitCCOverlay)

  // Start console-capture i begge moduser:
  // - Standalone: Fanger nettverksfeil, uncaught errors og console.error/warn
  // - Proxy: I tillegg fanges brukerens app-feil
  const isStandalone = window.location.pathname === '/' && document.querySelector('script[src="/overlay.js"]')
  KitCCOverlay.initConsoleCapture(isStandalone)

  // Legg til overlay i DOM
  document.body.appendChild(document.createElement('kit-cc-overlay'))
})()
