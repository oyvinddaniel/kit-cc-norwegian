/**
 * Komplett oppgavekatalog for Kit CC — alle 7 faser
 *
 * Hver oppgave har intensitetsmapping (MÅ/BØR/KAN/IKKE per nivå),
 * sone-indikator og ekspert-referanse.
 *
 * Brukes av:
 *   GET /kit-cc/api/phases/:num/tasks  — oppgaver for én fase
 *   POST /kit-cc/api/tasks/activate    — aktiver oppgave til Byggeliste
 */

// Intensitetsnivåer i rekkefølge (lavest → høyest)
export const INTENSITY_LEVELS = ['MINIMAL', 'FORENKLET', 'STANDARD', 'GRUNDIG', 'ENTERPRISE']

// Intensitetsnivå-navn (brukervennlige)
export const INTENSITY_LABELS = {
  MINIMAL: 'Enkelt hobbyprosjekt',
  FORENKLET: 'Lite, oversiktlig prosjekt',
  STANDARD: 'Vanlig app-prosjekt',
  GRUNDIG: 'Viktig prosjekt med sensitive data',
  ENTERPRISE: 'Stort, kritisk system'
}

// Intensitetsnivå-score-ranges
export const INTENSITY_SCORES = {
  MINIMAL: [7, 10],
  FORENKLET: [11, 14],
  STANDARD: [15, 18],
  GRUNDIG: [19, 23],
  ENTERPRISE: [24, 28]
}

// Fase-metadata
export const PHASES = [
  null, // index 0 ubrukt
  { num: 1, name: 'Idé og visjon', agent: '1-OPPSTART-agent.md' },
  { num: 2, name: 'Planlegg', agent: '2-KRAV-agent.md' },
  { num: 3, name: 'Arkitektur', agent: '3-ARKITEKTUR-agent.md' },
  { num: 4, name: 'MVP', agent: '4-MVP-agent.md' },
  { num: 5, name: 'Bygg funksjonene', agent: '5-ITERASJONS-agent.md' },
  { num: 6, name: 'Kvalitetssjekk', agent: '6-KVALITETSSIKRINGS-agent.md' },
  { num: 7, name: 'Publiser', agent: '7-PUBLISERINGS-agent.md' }
]

// ─── FASE 1: Idé og visjon ──────────────────────────────────────────

const PHASE_1_TASKS = [
  {
    id: 'OPP-01', name: 'Definér problem og visjon',
    desc: 'Kartlegger hvilket problem produktet skal løse og hvordan suksess ser ut.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'PERSONA-ekspert'
  },
  {
    id: 'OPP-02', name: 'Kartlegg Jobs-to-Be-Done',
    desc: 'Identifiserer hva brukere egentlig prøver å oppnå.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'PERSONA-ekspert'
  },
  {
    id: 'OPP-03', name: 'Lag personas',
    desc: 'Skaper detaljerte profiler av typiske brukere.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'PERSONA-ekspert'
  },
  {
    id: 'OPP-04', name: 'Tegn brukerreiser',
    desc: 'Visualiserer brukerens reise fra behov til mål.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'PERSONA-ekspert'
  },
  {
    id: 'OPP-05', name: 'Lag Lean Canvas',
    desc: 'Oppsummerer forretningsmodellen på én side.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'LEAN-CANVAS-ekspert'
  },
  {
    id: 'OPP-06', name: 'Definer verdiforslag',
    desc: 'Definerer hvorfor kunder skal velge deg.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'LEAN-CANVAS-ekspert'
  },
  {
    id: 'OPP-07', name: 'Kostnadsestimering',
    desc: 'Estimerer hva det vil koste å bygge og drifte.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'LEAN-CANVAS-ekspert'
  },
  {
    id: 'OPP-08', name: 'Kartlegg markedskonkurrenter',
    desc: 'Kartlegger hvem andre som løser samme problem.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'KONKURRANSEANALYSE-ekspert'
  },
  {
    id: 'OPP-09', name: 'Differensiering og blå ocean',
    desc: 'Finner hva som gjør deg unik i markedet.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'KONKURRANSEANALYSE-ekspert'
  },
  {
    id: 'OPP-10', name: 'Identifiser risikoscenarioer',
    desc: 'Lister opp hva som kan gå galt.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'OPP-11', name: 'Risikovurdering (DREAD)',
    desc: 'Scorer og prioriterer risikoer.',
    intensity: { MINIMAL: 'BØR', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'OPP-12', name: 'Klassifiser prosjekttype',
    desc: 'Bestemmer hvor omfattende prosjektet skal være.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'AUTO-CLASSIFIER'
  },
  {
    id: 'OPP-13', name: 'Kartlegg datatyper',
    desc: 'Lister opp all data systemet vil håndtere.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'OPP-14', name: 'Dataklassifisering',
    desc: 'Kategoriserer data etter sensitivitet.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: null
  },
  {
    id: 'OPP-15', name: 'Compliance-krav analyse',
    desc: 'Sjekker lovkrav (GDPR, bransjeregler).',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'SIKKERHETS-ekspert'
  },
  {
    id: 'OPP-16', name: 'Juridiske vurderinger',
    desc: 'Vurderer juridiske implikasjoner.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: null
  },
  {
    id: 'OPP-17', name: 'Marked og timing',
    desc: 'Analyserer om timingen er riktig.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'LEAN-CANVAS-ekspert'
  },
  {
    id: 'OPP-18', name: 'Ressursbehov estimering',
    desc: 'Estimerer hva som trengs av folk og tid.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'OPP-19', name: 'Go/No-Go vurdering',
    desc: 'Vurderer om prosjektet bør fortsette.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: null
  },
  {
    id: 'OPP-20', name: 'Beslutningstaking',
    desc: 'Tar den endelige beslutningen om prosjektet skal fortsette.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: null
  },
  {
    id: 'OPP-21', name: 'Oppsummering av Fase 1',
    desc: 'Dokumenterer alt som ble gjort i fasen.',
    intensity: { MINIMAL: 'BØR', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'OPP-22', name: 'Forberedelse til Fase 2',
    desc: 'Klargjør alt neste fase trenger.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  }
]

// ─── FASE 2: Planlegg ───────────────────────────────────────────────

const PHASE_2_TASKS = [
  {
    id: 'KRAV-01', name: 'User stories (med akseptansekriterier)',
    desc: 'Beskriver hva brukeren skal kunne gjøre i appen.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: null
  },
  {
    id: 'KRAV-02', name: 'Sikkerhetskrav og dataklassifisering',
    desc: 'Definerer krav til autentisering, autorisering og databeskyttelse.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'SIKKERHETS-ekspert'
  },
  {
    id: 'KRAV-03', name: 'MVP-definisjon (MoSCoW-prioritering)',
    desc: 'Bestemmer hva som MUST/SHOULD/COULD/WON\'T være med.',
    intensity: { MINIMAL: 'BØR', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: null
  },
  {
    id: 'KRAV-04', name: 'Wireframes (low-fi)',
    desc: 'Enkle skisser av hvordan skjermene skal se ut.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'WIREFRAME-ekspert'
  },
  {
    id: 'KRAV-05', name: 'API-spesifikasjon og datamodell',
    desc: 'Definerer hvordan frontend og backend snakker sammen.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'API-DESIGN-ekspert'
  },
  {
    id: 'KRAV-06', name: 'Akseptansekriterier per brukerhistorie',
    desc: 'Konkrete kriterier for når en feature er ferdig.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'KRAV-07', name: 'Regulatorisk og compliance kartlegging',
    desc: 'Kartlegger lovkrav som GDPR, PCI-DSS, etc.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: null
  },
  {
    id: 'KRAV-08', name: 'Brukerflyt-diagram og edge cases',
    desc: 'Visualiserer brukerens vei gjennom appen og hva som kan gå galt.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'KRAV-09', name: 'Modulregister-utvinning',
    desc: 'Lager hierarkisk oversikt over alle moduler med underfunksjoner.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: null
  },
  {
    id: 'KRAV-10', name: 'Integrasjonsbehov',
    desc: 'Kobler detekterte integrasjoner til brukerhistorier og bekrefter med bruker.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  }
]

// ─── FASE 3: Arkitektur ──────────────────────────────────────────────

const PHASE_3_TASKS = [
  {
    id: 'ARK-01', name: 'Tech stack-valg',
    desc: 'Velger hvilke teknologier som passer best for prosjektet.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: null
  },
  {
    id: 'ARK-02', name: 'Database-design',
    desc: 'Planlegger hvordan data skal lagres og organiseres.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'DATAMODELL-ekspert'
  },
  {
    id: 'ARK-03', name: 'API-arkitektur',
    desc: 'Definerer hvordan frontend og backend snakker sammen.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'API-DESIGN-ekspert'
  },
  {
    id: 'ARK-04', name: 'STRIDE-analyse (trusselmodellering)',
    desc: 'Tenker gjennom alle måter noen kan angripe systemet på.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'TRUSSELMODELLERING-ekspert'
  },
  {
    id: 'ARK-05', name: 'Arkitektur-diagram (C4)',
    desc: 'Tegner bilder av hvordan systemet henger sammen.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'DOKUMENTERER-ekspert'
  },
  {
    id: 'ARK-06', name: 'Sikkerhetskontroller-design',
    desc: 'Definerer konkrete tiltak for å beskytte mot hver trussel.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'SIKKERHETS-ekspert'
  },
  {
    id: 'ARK-07', name: 'DREAD-rangering og risikomitigation',
    desc: 'Scorer hvor alvorlig hver trussel er (1-10).',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'TRUSSELMODELLERING-ekspert'
  },
  {
    id: 'ARK-08', name: 'Phase gate-validering',
    desc: 'Sjekker at alt er klart før vi går videre til koding.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'PLANLEGGER-ekspert'
  }
]

// ─── FASE 4: MVP ─────────────────────────────────────────────────────

const PHASE_4_TASKS = [
  {
    id: 'MVP-00', name: 'Design System (Tokens + Tailwind + Komponenter)',
    desc: 'Setter opp design tokens, Tailwind-config og komponenter som alle UI-oppgaver bruker.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'DESIGN-TIL-KODE-ekspert'
  },
  {
    id: 'MVP-01', name: 'Git repo-struktur',
    desc: 'Oppretter mappen som alle filene skal ligge i, med riktig layout og branches.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'MVP-02', name: '.gitignore + .env.example',
    desc: 'Sikrer at hemmeligheter ikke pushes til GitHub, lager mal for miljøvariabler.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  },
  {
    id: 'MVP-03', name: 'Secrets management',
    desc: 'Setter opp sikker håndtering av passord og API-nøkler.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'HEMMELIGHETSSJEKK-ekspert'
  },
  {
    id: 'MVP-04', name: 'CI/CD-pipeline',
    desc: 'Automatiserer testing og deploy ved hver code push.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'CICD-ekspert'
  },
  {
    id: 'MVP-05', name: 'SAST + dependency-sjekk',
    desc: 'Automatisk sikkerhetskontroll av koden og biblioteker.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'SUPPLY-CHAIN-ekspert'
  },
  {
    id: 'MVP-06', name: 'SBOM generering',
    desc: 'Katalog over alle biblioteker som brukes.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'SUPPLY-CHAIN-ekspert'
  },
  {
    id: 'MVP-07', name: 'Test coverage 70%+',
    desc: 'Sikrer at minst 70% av koden er testet.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'TEST-GENERATOR-ekspert'
  },
  {
    id: 'MVP-08', name: 'Multi-environment setup',
    desc: 'Oppsett for test/staging/production miljøer.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'INFRASTRUKTUR-ekspert'
  },
  {
    id: 'MVP-09', name: 'Backend-implementasjon',
    desc: 'Bygger serveren som håndterer data.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'BYGGER-agent'
  },
  {
    id: 'MVP-10', name: 'Frontend-implementasjon + bilder',
    desc: 'Bygger brukergrensesnitt og legger til bilder.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'DESIGN-TIL-KODE-ekspert'
  },
  {
    id: 'MVP-11', name: 'Authentication',
    desc: 'Innloggingssystem for brukere.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'SIKKERHETS-ekspert'
  },
  {
    id: 'MVP-12', name: 'Unit + integration-tester',
    desc: 'Tester enkeltdeler og hvordan de fungerer sammen.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'TEST-GENERATOR-ekspert'
  },
  {
    id: 'MVP-13', name: 'Code review før merge',
    desc: 'Annen person går gjennom koden før den merges.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'REVIEWER-agent'
  },
  {
    id: 'MVP-14', name: 'Phase gate validering',
    desc: 'Sjekker at alle MÅ-oppgaver er gjort før du går til neste fase.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: null
  }
]

// ─── FASE 5: Bygg funksjonene ────────────────────────────────────────

const PHASE_5_TASKS = [
  {
    id: 'ITR-01', name: 'Feature-implementasjon',
    desc: 'Bygger de faktiske funksjonene brukerne skal bruke.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'BYGGER-agent'
  },
  {
    id: 'ITR-02', name: 'Brukertest/validering',
    desc: 'Tester at det du bygde fungerer for brukerne.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'BRUKERTEST-ekspert'
  },
  {
    id: 'ITR-03', name: 'Ytelse-optimalisering',
    desc: 'Gjør appen raskere og mer responsiv.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'YTELSE-ekspert'
  },
  {
    id: 'ITR-04', name: 'UI/UX-forbedring',
    desc: 'Polerer grensesnitt med animasjoner og micro-interactions.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'UI/UX-ekspert'
  },
  {
    id: 'ITR-05', name: 'Code review',
    desc: 'En annen persons vurdering på koden før den går live.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'REVIEWER-agent'
  },
  {
    id: 'ITR-06', name: 'Refaktorering',
    desc: 'Rydder opp i koden uten å endre funksjonalitet.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'REFAKTORING-ekspert'
  },
  {
    id: 'ITR-07', name: 'Test-oppdatering',
    desc: 'Oppdaterer testene når features endres.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'TEST-GENERATOR-ekspert'
  },
  {
    id: 'ITR-08', name: 'Self-healing tester',
    desc: 'Tester som reparerer seg selv når UI endres.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'SELF-HEALING-TEST-ekspert'
  },
  {
    id: 'ITR-09', name: 'Security review',
    desc: 'Sjekker for sikkerhetshull.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'SIKKERHETS-ekspert'
  },
  {
    id: 'ITR-10', name: 'Design-til-kode iterasjon',
    desc: 'Loop mellom designer og utvikler.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'DESIGN-TIL-KODE-ekspert'
  },
  {
    id: 'ITR-11', name: 'Dependency-oppgradering',
    desc: 'Oppdaterer biblioteker til nyere versjoner.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'MIGRASJON-ekspert'
  }
]

// ─── FASE 6: Kvalitetssjekk ──────────────────────────────────────────

const PHASE_6_TASKS = [
  {
    id: 'KVA-01', name: 'E2E-testing (kritisk brukerflyt)',
    desc: 'Tester hele brukerreisen fra start til slutt.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'TEST-GENERATOR-ekspert'
  },
  {
    id: 'KVA-02', name: 'OWASP Top 10 sjekk',
    desc: 'Sjekker de 10 vanligste sikkerhetsfeilene i webapper.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'OWASP-ekspert'
  },
  {
    id: 'KVA-03', name: 'Hemmelighetssjekk',
    desc: 'Søker gjennom koden etter passord og API-nøkler.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'HEMMELIGHETSSJEKK-ekspert'
  },
  {
    id: 'KVA-04', name: 'GDPR-compliance audit',
    desc: 'Sjekker at appen følger personvernlovgivningen.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'GDPR-ekspert'
  },
  {
    id: 'KVA-05', name: 'Tilgjengelighet (WCAG 2.2 AA)',
    desc: 'Sjekker at appen fungerer for alle, inkludert de med funksjonshemninger.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'TILGJENGELIGHET-ekspert'
  },
  {
    id: 'KVA-06', name: 'Cross-browser testing',
    desc: 'Sjekker at appen fungerer i alle store nettlesere.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'CROSS-BROWSER-ekspert'
  },
  {
    id: 'KVA-07', name: 'Load/stress testing',
    desc: 'Simulerer mange brukere samtidig for å se om systemet tåler.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'LASTTEST-ekspert'
  },
  {
    id: 'KVA-08', name: 'Ytelse-testing (Lighthouse)',
    desc: 'Måler hvor rask og optimalisert appen er.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'YTELSE-ekspert'
  },
  {
    id: 'KVA-09', name: 'Regressjonstesting',
    desc: 'Sjekker at gamle features fortsatt fungerer etter endringer.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'KAN', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'TEST-GENERATOR-ekspert'
  },
  {
    id: 'KVA-10', name: 'AI-governance audit',
    desc: 'Sjekker at AI-bruk er ansvarlig og etisk.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'AI-GOVERNANCE-ekspert'
  },
  {
    id: 'KVA-11', name: 'Self-healing test vedlikehold',
    desc: 'Vedlikeholder tester som reparerer seg selv.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'SELF-HEALING-TEST-ekspert'
  },
  {
    id: 'KVA-12', name: 'Feilsøking og bug-triaging',
    desc: 'Finner, klassifiserer og prioriterer bugs.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'DEBUGGER-agent'
  }
]

// ─── FASE 7: Publiser og vedlikehold ─────────────────────────────────

const PHASE_7_TASKS = [
  {
    id: 'PUB-01', name: 'CI/CD-pipeline-setup',
    desc: 'Automatiserer at kode går fra GitHub til live-nettside.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'CICD-ekspert'
  },
  {
    id: 'PUB-02', name: 'Produksjon-infrastruktur',
    desc: 'Setter opp servere, databaser og nettverk for live-miljøet.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'INFRASTRUKTUR-ekspert'
  },
  {
    id: 'PUB-03', name: 'Secrets-håndtering',
    desc: 'Holder passord og API-nøkler trygge utenfor koden.',
    intensity: { MINIMAL: 'MÅ', FORENKLET: 'MÅ', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'SIKKERHETS-ekspert'
  },
  {
    id: 'PUB-04', name: 'Monitoring-oppsett',
    desc: 'Overvåker at appen fungerer og varsler ved problemer.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'MONITORING-ekspert'
  },
  {
    id: 'PUB-05', name: 'Alerting-konfigurasjon',
    desc: 'Sender SMS/e-post når noe går galt.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'MONITORING-ekspert'
  },
  {
    id: 'PUB-06', name: 'Backup og DR-plan',
    desc: 'Tar sikkerhetskopier og har plan for gjenoppretting ved katastrofe.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'BACKUP-ekspert'
  },
  {
    id: 'PUB-07', name: 'Incident Response-plan',
    desc: 'Plan for hvordan håndtere kriser.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'BØR', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'INCIDENT-RESPONSE-ekspert'
  },
  {
    id: 'PUB-08', name: 'SLI/SLO-definering',
    desc: 'Definerer målsetninger for oppetid og ytelse.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'RED', expert: 'SRE-ekspert'
  },
  {
    id: 'PUB-09', name: 'Post-deployment validering',
    desc: 'Sjekker at alt fungerer etter deploy.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'KAN', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'CICD-ekspert'
  },
  {
    id: 'PUB-10', name: 'Operations-guide og runbooks',
    desc: 'Dokumentasjon for drift av systemet.',
    intensity: { MINIMAL: 'IKKE', FORENKLET: 'IKKE', STANDARD: 'KAN', GRUNDIG: 'BØR', ENTERPRISE: 'MÅ' },
    zone: 'GREEN', expert: 'DOKUMENTASJON-ekspert'
  },
  {
    id: 'PUB-11', name: 'Rollback-prosedyre dokumentert',
    desc: 'Dokumentert plan for å gå tilbake hvis deploy feiler.',
    intensity: { MINIMAL: 'KAN', FORENKLET: 'BØR', STANDARD: 'MÅ', GRUNDIG: 'MÅ', ENTERPRISE: 'MÅ' },
    zone: 'YELLOW', expert: 'MIGRASJON-ekspert'
  }
]

// ─── Komplett oppgavekatalog ─────────────────────────────────────────

const ALL_TASKS = {
  1: PHASE_1_TASKS,
  2: PHASE_2_TASKS,
  3: PHASE_3_TASKS,
  4: PHASE_4_TASKS,
  5: PHASE_5_TASKS,
  6: PHASE_6_TASKS,
  7: PHASE_7_TASKS
}

/**
 * Hent alle oppgaver for en fase
 * @param {number} phaseNum - Fasenummer (1-7)
 * @returns {Array} Oppgaver for fasen
 */
export function getTasksForPhase(phaseNum) {
  return ALL_TASKS[phaseNum] || []
}

/**
 * Hent oppgaver gruppert etter klassifisering for et gitt intensitetsnivå
 * @param {number} phaseNum - Fasenummer (1-7)
 * @param {string} intensityLevel - 'MINIMAL'|'FORENKLET'|'STANDARD'|'GRUNDIG'|'ENTERPRISE'
 * @returns {{ MÅ: Array, BØR: Array, KAN: Array, IKKE: Array }}
 */
export function getTasksByClassification(phaseNum, intensityLevel) {
  const tasks = getTasksForPhase(phaseNum)
  const level = intensityLevel?.toUpperCase() || 'STANDARD'

  const grouped = { MÅ: [], BØR: [], KAN: [], IKKE: [] }

  for (const task of tasks) {
    const classification = task.intensity[level] || 'IKKE'
    grouped[classification].push(task)
  }

  return grouped
}

/**
 * Beregn minimumsnivå for en oppgave (laveste nivå der den er MÅ)
 * @param {Object} task - Oppgave-objekt
 * @returns {string|null} Intensitetsnivå eller null hvis aldri MÅ
 */
export function getMinimumLevel(task) {
  for (const level of INTENSITY_LEVELS) {
    if (task.intensity[level] === 'MÅ') return level
  }
  return null
}

/**
 * Bestem om en oppgave er "utenfor nivå" for gitt intensitet
 * Returnerer merkelapp som "Grundig+" hvis oppgaven krever høyere nivå
 * @param {Object} task
 * @param {string} currentLevel
 * @returns {string|null} Merkelapp eller null hvis innenfor nivå
 */
export function getOutOfLevelLabel(task, currentLevel) {
  const currentIdx = INTENSITY_LEVELS.indexOf(currentLevel?.toUpperCase())
  if (currentIdx === -1) return null

  const classification = task.intensity[currentLevel?.toUpperCase()]
  if (classification !== 'IKKE') return null

  // Finn laveste nivå der oppgaven ikke er IKKE
  for (let i = currentIdx + 1; i < INTENSITY_LEVELS.length; i++) {
    if (task.intensity[INTENSITY_LEVELS[i]] !== 'IKKE') {
      return `${INTENSITY_LABELS[INTENSITY_LEVELS[i]].split(',')[0]}+`
    }
  }
  return null
}

/**
 * Merg oppgavekatalog med status fra PROJECT-STATE.json
 * @param {number} phaseNum
 * @param {Object} state - PROJECT-STATE.json data
 * @returns {Array} Oppgaver med status-felt
 */
export function getTasksWithStatus(phaseNum, state) {
  const tasks = getTasksForPhase(phaseNum)

  // Les fra riktig sti: state.phaseProgress.phase{N}.completedSteps
  const phaseData = state?.phaseProgress?.['phase' + phaseNum] || {}
  const completed = phaseData.completedSteps || []
  const skipped = phaseData.skippedSteps || []
  const currentPhase = state?.currentPhase || 1
  const intensityLevel = state?.classification?.intensityLevel?.toUpperCase() || 'STANDARD'
  const currentLevelLabel = INTENSITY_LABELS[intensityLevel] || intensityLevel
  const phaseCompleted = phaseData.status === 'completed'

  return tasks.map(task => {
    let status = 'pending'  // ⏳ Gjenstår
    let reason = null
    let deliverable = null
    let explanation = null

    // Bruk .find() med type-sjekk (håndterer både string og {id, deliverable} format)
    const completedEntry = completed.find(s => (typeof s === 'string' ? s : s?.id) === task.id)
    if (completedEntry) {
      status = 'completed'  // ✅ Gjennomført
      deliverable = typeof completedEntry === 'object' ? completedEntry.deliverable : null
    } else if (skipped.some(s => (typeof s === 'string' ? s : s?.id) === task.id)) {
      status = 'skipped'    // ⏭️ Valgt bort
      const skipEntry = skipped.find(s => (typeof s === 'string' ? s : s?.id) === task.id)
      reason = typeof skipEntry === 'object' ? skipEntry.reason : null
    } else if (task.intensity[intensityLevel] === 'IKKE') {
      status = 'out_of_level' // 🔒 Utenfor nivå
      // Finn laveste nivå der oppgaven ikke er IKKE (for forklaring)
      const currentIdx = INTENSITY_LEVELS.indexOf(intensityLevel)
      let relevantLevelName = null
      for (let i = currentIdx + 1; i < INTENSITY_LEVELS.length; i++) {
        if (task.intensity[INTENSITY_LEVELS[i]] !== 'IKKE') {
          relevantLevelName = INTENSITY_LABELS[INTENSITY_LEVELS[i]]
          break
        }
      }
      explanation = relevantLevelName
        ? `Relevant fra prosjekttypen "${relevantLevelName}". Ditt prosjekt er "${currentLevelLabel}".`
        : `Ikke relevant for prosjekttypen "${currentLevelLabel}".`
    } else if (phaseCompleted) {
      status = 'not_done'   // ⊖ Ikke utført (fasen er ferdig)
    }

    // Finn laveste nivå der oppgaven er MÅ (for visning)
    const minLevel = getMinimumLevel(task)
    const minLevelLabel = minLevel ? (INTENSITY_LABELS[minLevel]?.split(',')[0] || minLevel) : null

    return {
      ...task,
      status,
      reason,
      deliverable,
      explanation,
      levelLabel: getOutOfLevelLabel(task, intensityLevel),
      minLevel,
      minLevelLabel,
      classification: task.intensity[intensityLevel] || 'IKKE'
    }
  })
}

/**
 * Hent totalt antall oppgaver per fase
 * @returns {Object} { 1: 22, 2: 10, ... }
 */
export function getTaskCounts() {
  const counts = {}
  for (const [phase, tasks] of Object.entries(ALL_TASKS)) {
    counts[phase] = tasks.length
  }
  return counts
}
