# protocol-DYNAMISK-AGENT-VALG v1.0

> **SSOT for intelligent ekspert-agent-valg.** Denne protokollen beskriver hvordan prosess-agenter dynamisk velger de mest relevante ekspert-agenter basert på oppgavens domene, kontekst og kompleksitet — i stedet for hardkodede referanser.

---

## FORMÅL

**Kjerneprinsipp:** Fase-agenter skal ikke hardkode hvilke eksperter de trenger. I stedet skal de deklarativt beskrive **hva** de trenger hjelp med, og denne protokollen hjelper AI-systemet å velge de beste ekspertene automatisk.

**Fordeler:**
- **Fleksibilitet** — Nye eksperter kan legges til uten å endre fase-agenter
- **Kontekst-bevisst** — Valget tilpasses oppgavens spesifikke behov
- **Skalerbar** — Systemet vokser med flere eksperter uten kompleksitet i fase-agentene
- **Gjenbrukbar** — Alle fase-agenter bruker samme valg-logikk

---

## EKSPERT-KATALOG (v1.1)

Denne tabellen er den eneste og autoritative liste over alle tilgjengelige eksperter. Hver ekspert har:
- **Fil:** Filnavn i `Kit CC/Agenter/agenter/ekspert/`
- **Spesialisering:** 1-linjebeskrivelse
- **Kategori:** Funksjonell kategori (sikkerhet, testing, UX, arkitektur, etc.)
- **Triggers:** Nøkkelord/scenarier som aktiverer denne eksperten
- **Når bruke:** Konkrete situasjoner hvor denne eksperten bør velges

| # | Fil | Spesialisering | Kategori | Triggers | Når bruke |
|---|-----|----------------|----------|----------|-----------|
| 1 | OWASP-ekspert.md | Sikkerhetstesting (OWASP Top 10, penetrasjon, sårbarheter) | Sikkerhet | sikkerhet, testing, vulnerabilities, penetration, OWASP | Før produksjon, når app håndterer sensitiv data, ved auth-implementering |
| 2 | GDPR-ekspert.md | Personvernforordningen, DPIA, samtykke, slettingsrett, EU AI Act | Sikkerhet/Compliance | personvern, GDPR, EU AI Act, compliance, data-treatment | App med brukerdata, AI-integrering, cloud-lagring, internasjonale brukere |
| 3 | HEMMELIGHETSSJEKK-ekspert.md | Secrets-scanning, API-nøkler, credentials i git, sikker kryptering | Sikkerhet | secrets, credentials, API-keys, encryption, git-security | Oppsett av repo, før første commit, ved credential-rotasjon |
| 4 | SUPPLY-CHAIN-ekspert.md | Avhengighets-sikkerhet, dependency scanning, CVE-oppgjøring | Sikkerhet | dependencies, vulnerabilities, supply-chain, CVE, npm-audit | Oppsett av avhengigheter, regelmessig audit, ved kjente CVEer |
| 5 | TRUSSELMODELLERINGS-ekspert.md | Trussel-analyse, attack trees, risk-matrisering, mikrosegmentering | Sikkerhet | threat-modeling, architecture-review, security-planning, risk-assessment | Fase 3 (arkitektur), før kritisk feature-bygging |
| 6 | TEST-GENERATOR-ekspert.md | Automatisk test-generering (unit, integrasjon, E2E), test-coverage | Testing | testing, test-generation, coverage, E2E, unit-tests | Etter implementering av features, før produksjon |
| 7 | TESTSKRIVER-ekspert.md | Manuell test-planlegging, test-cases, edge-cases, bug-hunting | Testing | manual-testing, test-planning, bug-hunting, QA | Før release, kritiske flows, edge-case-testing |
| 8 | SELF-HEALING-TEST-ekspert.md | Self-healing tests, flaky-test-eliminering, test-resilience | Testing | flaky-tests, self-healing, test-stability, resilience | Når tester feiler sporadisk, CI/CD-stabilitets-problemer |
| 9 | CODE-QUALITY-GATE-ekspert.md | Kodekvalitet, linting, sikkerhet-skanning, code-review-gates | Testing/Arkitektur | code-quality, linting, static-analysis, code-review, gates | Før hver commit, ved PR-review, når kode-standard trengs |
| 10 | REFAKTORING-ekspert.md | Kode-opprusting, kompleksitet-reduksjon, performance-forbedring | Arkitektur | refactoring, technical-debt, code-cleanup, optimization | Når kode blir uleselig, ytelse-problemer, kompleksitets-økning |
| 11 | DATAMODELL-ekspert.md | Database-design, normalisering, queries, indeksering, migrations | Arkitektur | database, schema, migrations, queries, performance, Supabase | Fase 3 (arkitektur), ved datamodell-endringer, query-optimering |
| 12 | API-DESIGN-ekspert.md | REST/GraphQL API-design, OpenAPI, spesifikasjon, DX | Arkitektur | API, REST, GraphQL, OpenAPI, endpoints, specifications | MVP-setup, når backend API må designes, integrasjon med frontend |
| 13 | INFRASTRUKTUR-ekspert.md | Vercel/Supabase/GitHub-konfigurasjon, cloud-native setup, deployment | Arkitektur/DevOps | infrastructure, deployment, Vercel, Supabase, GitHub, CI/CD | Fase 4 (MVP-setup), når hosting må konfigureres, environment-setup |
| 14 | MONITORING-ekspert.md | Logging, alerting, observability, error-tracking, performance-monitoring | DevOps/Arkitektur | monitoring, logging, alerting, observability, production-readiness | Før produksjon, når app er live, ved incident-response |
| 15 | SRE-ekspert.md | Site Reliability Engineering, on-call, incident-response, chaos-engineering | DevOps | incident-response, on-call, SRE, chaos-testing, resilience | Etter launch, ved driftsproblemer, proaktiv reliability-testing |
| 16 | INCIDENT-RESPONSE-ekspert.md | Incident-håndtering, root-cause-analyse, postmortem, beredskap | DevOps | incident, emergency, downtime, outage, critical-issue | Ved production-feil, når app er nede, post-incident-analyse |
| 17 | CICD-ekspert.md | CI/CD-pipelines, GitHub Actions, automated testing, deployment automation | DevOps | CI/CD, pipeline, automation, deployment, github-actions, testing | Fase 4 (MVP), når prosjekt må ha automatisert deployment |
| 18 | MIGRASJON-ekspert.md | Data-migrasjon, versjons-upgrade, zero-downtime-deployment | DevOps | migration, upgrade, data-transition, zero-downtime, legacy-systems | Når app må migrere fra en teknologi til annen |
| 19 | BACKUP-ekspert.md | Backup-strategi, disaster-recovery, BCDR-planlegging, data-redundans | DevOps | backup, disaster-recovery, redundancy, BCDR, data-loss-prevention | Ved launch, når data er kritisk, annual disaster-recovery-testing |
| 20 | YTELSE-ekspert.md | Performance-optimering, load-testing, metrics, profiling, latency | Arkitektur/Performance | performance, optimization, load-testing, metrics, latency, scalability | Når app er treg, før produksjon, ved skalering |
| 21 | LASTTEST-ekspert.md | Load-testing, stress-testing, capacity-planning, scalability-validation | Testing/Performance | load-testing, stress-test, capacity, scalability, performance-validation | Før launch, ved høy trafikk-forventning, kapasitets-planlegging |
| 22 | UIUX-ekspert.md | UX-testing, brukbarhet, accessibility, design-review, brukerinnsikt | UX/Design | UX, design, usability, accessibility, user-feedback, design-review | Når UI implementeres, før launch, ved brukertesting |
| 23 | WIREFRAME-ekspert.md | Wireframe-design, prototyping, user-flow-mapping, mockups | UX/Design | wireframe, prototype, user-flow, mockup, design-planning | Fase 1-2 (idé og planlegging), før implementering |
| 24 | DESIGN-TIL-KODE-ekspert.md | Design-system, CSS, styling, design-token, component-library | UX/Design | design-system, CSS, styling, components, design-tokens, OKLCH | Fase 4 (MVP), når design skal implementeres, design-system-setup |
| 25 | TILGJENGELIGHETS-ekspert.md | Accessibility (WCAG 2.1 AA), screenreader-testing, inclusive-design | UX/Design | accessibility, WCAG, inclusive, screenreader, ADA-compliance | Når UI implementeres, før launch, compliance-krav |
| 26 | CROSS-BROWSER-ekspert.md | Cross-browser testing, legacy-browser-support, compatibility | Testing/UX | cross-browser, compatibility, legacy-browsers, responsive-design | Før produksjon, når browserkompatibilitet er krav |
| 27 | BRUKERTEST-ekspert.md | Bruker-testing, usability-testing, session-recording, heatmaps | UX/Testing | user-testing, usability, session-recording, heatmap, feedback | Fase 5 (feature-bygging), når features er implementert |
| 28 | PERSONA-ekspert.md | Persona-development, user-research, segmentation, journey-mapping | UX/Planning | personas, user-research, segmentation, journey-mapping | Fase 1-2 (idé), før feature-prioritering |
| 29 | LEAN-CANVAS-ekspert.md | Lean Canvas, business-model-validation, go-to-market, MVP-scope | Planning/Business | lean-canvas, business-model, validation, go-to-market, MVP-scope | Fase 1 (idé), ved MVP-definition, business-validation |
| 30 | KONKURRANSEANALYSE-ekspert.md | Konkurranse-analyse, marked-research, feature-benchmarking, positioning | Planning/Business | competition, market-research, benchmarking, positioning, feature-analysis | Fase 1-2 (idé og planlegging), ved feature-prioritering |
| 31 | PROMPT-INGENIØR-ekspert.md | Prompt-engineering, AI-integration, embeddings, RAG, fine-tuning | AI/Integration | AI, LLM, prompts, embeddings, RAG, integration, fine-tuning | Når AI skal integreres, ved LLM-bruk, custom-AI-features |
| 32 | AI-GOVERNANCE-ekspert.md | AI-governance, responsible-AI, model-evaluation, bias-detection | AI/Compliance | AI-governance, responsible-AI, bias, fairness, model-evaluation, audit | Når AI integreres, compliance-krav, før launch |
| 33 | GORGEOUS-UI-ekspert.md | Premium UI-polish, micro-interactions, animations, design-system-implementation | UX/Design | gorgeous-ui, UI-polish, micro-interactions, animations, premium-design | MVP-00/MVP-10/ITR-10, når design-system og polert UI skal implementeres |
| 34 | FEATURE-FLAGS-ekspert.md | Feature flag-strategi, gradual rollout, A/B-testing, kill-switches | DevOps/Arkitektur | feature-flags, rollout, A/B-testing, kill-switch, canary-deployment | Gradual feature-release, A/B-eksperimenter, risikable endringer (STANDARD+) |
| 35 | RLS-TESTER-ekspert.md | Row-Level Security-testing, multi-tenant-isolasjon, Supabase RLS | Sikkerhet/Testing | RLS, multi-tenant, row-level-security, Supabase-RLS, tenant-isolation | Multi-tenant-prosjekter, før produksjon (STANDARD+) |
| 36 | SCHEMA-MIGRASJON-ekspert.md | Database-schema-migrasjon, null-downtime, rollback-strategier | Arkitektur/DevOps | schema-migration, database-migration, null-downtime-migration, rollback | Ved DB-schema-endringer, store migrasjoner (STANDARD+) |
| 37 | HALLUSINASJON-DETEKTOR-ekspert.md | AI-hallusinasjonsdeteksjon, faktasjekk, RAG-validering | AI/Testing | hallucination, AI-validation, RAG-check, factcheck, LLM-output-validation | AI-drevne features, ved LLM-integrasjon (STANDARD+) |

---

## VALG-ALGORITME

### Oversikt

**Når en fase-agent trenger ekspertise** (f.eks. sikkerhetstesting, API-design, testing), følg denne algoritmen for å velge den beste eksperten:

```
1. IDENTIFISER OPPGAVENS DOMENE
   ↓
2. SØKPROSESS
   ├─ Søk EKSPERT-KATALOG etter kategori og triggers
   ├─ Samle alle relevante kandidater
   └─ Prioriter etter spesifisitet
   ↓
3. VELG BESTE MATCH
   ├─ Hvis eksakt trigger-match → velg denne
   ├─ Hvis flere matches → velg mest spesifikk for konteksten
   └─ Hvis ingen match → bruk basis-agent (BYGGER/DEBUGGER/REVIEWER)
   ↓
4. LOGG VALGET
   └─ Dokumenter: "[ekspert] valgt for [oppgave]"
```

### Detaljert prosess

#### Steg 1: Identifisering av oppgavens domene

Spør deg selv: **Hva er kjernebehovet i oppgaven?**

| Scenario | Domene | Eksempler |
|----------|--------|----------|
| "Jeg må teste sikkerheten" | Sikkerhet | OWASP, vulnerabilities, penetration |
| "App håndterer brukerdata" | Sikkerhet/Compliance | GDPR, personvern, consent |
| "Jeg må skrive tester" | Testing | Unit-tests, E2E, coverage |
| "Jeg designet en database" | Arkitektur | Schema, queries, indeksering |
| "Jeg skal deploye til Vercel" | DevOps | Infrastructure, deployment, CI/CD |
| "Appen er treg" | Performance | Optimization, profiling, load-testing |
| "Jeg trenger UI-components" | UX/Design | Design-system, CSS, components |
| "App skal være tilgjengelig" | UX/Design | WCAG, accessibility, inclusive |
| "Jeg skal integrere AI" | AI | Prompts, embeddings, governance |

#### Steg 2: Søkprosess

**Søk i EKSPERT-KATALOG:**

```
A. Match på KATEGORI
   └─ Finn alle eksperter med samme kategori

B. Match på TRIGGERS
   └─ Finn alle eksperter der triggers matcher oppgaven

C. Samle KANDIDATER
   └─ Slå sammen resultater fra A og B
   └─ Fjern duplikater

D. PRIORITER
   ├─ Prioritet 1: Nøyaktig trigger-match (f.eks. "OWASP" i oppgave → OWASP-ekspert)
   ├─ Prioritet 2: Kategori-match + contextual relevance (f.eks. "testing" → TEST-GENERATOR eller TESTSKRIVER)
   └─ Prioritet 3: Overordnet kategori-match (f.eks. "sikkerhet" → HEMMELIGHETSSJEKK hvis OWASP ikke passer)
```

#### Steg 3: Valg av beste match

**Regler for valg:**

1. **Eksakt trigger-match (høyeste prioritet)**
   ```
   Oppgave: "Jeg må gjennomføre sikkerhetstesting før produksjon"
   Trigger-match: "OWASP-ekspert" (triggers: sikkerhet, testing)
   Valg: OWASP-ekspert ✓
   ```

2. **Kategori-match med kontekst (medium prioritet)**
   ```
   Oppgave: "Jeg må skrive automatiserte tester for features"
   Kategorier: TEST-GENERATOR (auto-testing), TESTSKRIVER (manual)
   Kontekst: "automatiserte"
   Valg: TEST-GENERATOR-ekspert ✓ (mer relevant enn TESTSKRIVER)
   ```

3. **Fallback til basis-agent (laveste prioritet)**
   ```
   Oppgave: "Jeg trenger hjelp med en liten kodejust"
   Ingen ekspert-match
   Valg: BYGGER-agent (basis) ✓
   ```

4. **Multi-ekspert for komplekse oppgaver**
   ```
   Oppgave: "API-design + sikkerhetstesting + dokumentasjon"
   Kandidater: API-DESIGN-ekspert, OWASP-ekspert
   Valg: Kall begge sekvensielt eller parallelt (se SUPERVISOR-MODE i ORCHESTRATOR)
   Rekkefølge: 1) API-DESIGN (design først), 2) OWASP (sikkerhet på design)
   ```

#### Steg 4: Logging av valg

**Dokumenter alltid agent-valget i PROGRESS-LOG:**

```
- HH:MM 🔀 AGENT-VALG: [ekspert-navn] valgt for [oppgave-ID]
  Oppgave: [kort beskrivelse]
  Årsak: [trigger eller kategori som matchet]
  Alternativer som ble vurdert: [andre kandidater]
```

**Eksempel:**
```
- 14:32 🔀 AGENT-VALG: OWASP-ekspert valgt for TASK-SEC-001
  Oppgave: Sikkerhetstesting før produksjon
  Årsak: Eksakt trigger-match: sikkerhetstesting, OWASP Top 10
  Alternativer: HEMMELIGHETSSJEKK, TRUSSELMODELLERINGS (relevante men mindre spesifikke)
```

---

## PRAKTISK BRUK I FASE-AGENTER

### Gammel måte (hardkoding — IKKE GJØR DETTE)

```markdown
## For sikkerhetstesting
Les OWASP-ekspert.md og gjennomfør sikkerhetstesting.
```

**Problem:** Hvis en annen sikkerhetsekspert opprett senere, må alle fase-agenter oppdateres.

### Ny måte (dynamisk — GJØR DETTE)

```markdown
## For sikkerhetstesting

Signal behov:
```
NEED_EXPERT: sikkerhet
- Oppgave: Gjennomføre sikkerhetstesting før produksjon
- Kontekst: [oppgave-detaljer]
- Tidsfrist: [hvis relevant]
```

AI skal:
1. Les protocol-DYNAMISK-AGENT-VALG.md
2. Søk i EKSPERT-KATALOG etter triggers: "sikkerhet", "testing"
3. Match: OWASP-ekspert (høyeste prioritet)
4. Les OWASP-ekspert.md
5. Utfør sikkerhetstesting
6. Logg valget i PROGRESS-LOG
```

**Fordel:** Fase-agenten er agnostisk til hvilke eksperter som finnes. Valget gjøres dynamisk basert på kontekst.

---

## FALLBACK-REGLER

Hvis den valgte eksperten ikke har eksakt det som trengs:

### Regel 1: Cascade til neste beste match
```
HVIS OWASP-ekspert ikke dekker ALL sikkerhet
THEN prøv HEMMELIGHETSSJEKK-ekspert for credential-delen
THEN prøv GDPR-ekspert for personvernsdelen
```

### Regel 2: Combination av flere eksperter
```
HVIS oppgave er kompleks og krever flere perspektiver
THEN aktiver SUPERVISOR-MODE (se ORCHESTRATOR)
THEN kall parallelt:
  ├─ EKSPERT-1 (primær)
  ├─ EKSPERT-2 (sekundær perspektiv)
  └─ EKSPERT-3 (tertiary perspektiv)
```

### Regel 3: Fallback til basis-agent
```
HVIS ingen ekspert matcher
THEN bruk BYGGER-agent
OG logg: "Ingen ekspert-match, bruker basis-agent"
```

### Regel 4: NEED_CLARIFICATION
```
HVIS oppgaven er tvetydig og eksperten ikke er sikker
SIGNAL: NEED_CLARIFICATION med oppgaven til brukeren
(ikke prøv å velge blind — be om presisering)
```

---

## INTEGRASJON MED MISSION BRIEFING

Hver fase-agents MISSION-BRIEFING skal ha en seksjon som dokumenterer:

### TILGJENGELIGE EKSPERTER (Lag 2)

ikke alle 37 eksperter er relevant for hver fase. Mission briefing skal liste **kun** de ekspertene som er relevante for fasen:

**Eksempel fra MVP-fase (Fase 4):**
```
TILGJENGELIGE EKSPERTER (Lag 2):
Denne fasen kan bruke:
- API-DESIGN-ekspert (for API-spesifisering)
- DESIGN-TIL-KODE-ekspert (for komponenter)
- CODE-QUALITY-GATE-ekspert (for kodestandard)
- INFRASTRUKTUR-ekspert (for deployment-setup)
- TEST-GENERATOR-ekspert (hvis tester trengs)

Bruk NEED_EXPERT: [domene] for dynamisk valg av riktig ekspert.
Se protocol-DYNAMISK-AGENT-VALG.md for algoritmen.
```

**Fordel:** Fase-agenten vet hvilke eksperter som er rimelig relevant, men valgen gjøres fortsatt dynamisk basert på faktisk behov.

---

## EKSEMPLER

### Eksempel 1: MVP-fase trenger API-design

**Scenario:**
```
MVP-agent sier: "Jeg må designe API for innlogging"
```

**Dynamisk valg:**
1. Domene: API-design
2. Søk katalog: triggers "API", "REST", "endpoints"
3. Match: API-DESIGN-ekspert (høyeste prioritet)
4. Kall: Les API-DESIGN-ekspert.md
5. Oppgave: Designe /auth/login endpoint
6. Logg: "🔀 AGENT-VALG: API-DESIGN-ekspert for auth-API design"

### Eksempel 2: Kvalitetssikring med flere eksperter

**Scenario:**
```
KVALITETSSIKRINGS-agent sier: "Jeg må sikre at alt funker før produksjon"
```

**Dynamisk valg (SUPERVISOR-MODE):**
1. Behov: Sikkerhet + Testing + Monitoring + Accessibility
2. Søk katalog:
   - Sikkerhet: OWASP-ekspert, HEMMELIGHETSSJEKK-ekspert, GDPR-ekspert
   - Testing: TEST-GENERATOR-ekspert, TESTSKRIVER-ekspert
   - Monitoring: MONITORING-ekspert
   - Accessibility: TILGJENGELIGHETS-ekspert
3. Kall parallelt (SUPERVISOR-MODE):
   - OWASP-ekspert (sikkerhet — primær)
   - TEST-GENERATOR-ekspert (testing)
   - MONITORING-ekspert (observability)
   - TILGJENGELIGHETS-ekspert (accessibility)
4. Hver analyser parallelt (lesing)
5. Samle resultater
6. Logg alle valg

### Eksempel 3: Fallback når ingen eksakt match

**Scenario:**
```
MVP-agent sier: "Jeg trenger å optimalisere databasespørringer"
```

**Dynamisk valg med fallback:**
1. Domene: Database/Performance
2. Søk katalog: triggers "queries", "performance", "database"
3. Primære matches: DATAMODELL-ekspert (queries), YTELSE-ekspert (performance)
4. Valg strategi:
   - Kall DATAMODELL-ekspert først (for query-optimering)
   - Hvis ikke dekker alt, kall YTELSE-ekspert (for performance-testing)
5. Logg: "🔀 AGENT-VALG: DATAMODELL-ekspert (primær) + YTELSE-ekspert (sekundær)"

---

## VEDLIKEHOLD AV KATALOGEN

### Når eksperter legges til

1. Opprett ny ekspert-fil: `NyEkspert-ekspert.md`
2. Oppdater denne katalogen (tabellen)
3. Legg til:
   - Filnavn
   - Spesialisering (1 linje)
   - Kategori
   - Triggers (nøkkelord)
   - "Når bruke" (eksempler)
4. Ingen fase-agenter må oppdateres — de bruker allerede dynamisk valg!
5. Oppdater mission briefings hvis eksperten er relevant for nye faser

### Når eksperter fjernes

1. Fjern fra katalogen
2. Søk fase-agenter etter hardkodede referanser (hvis noen finnes — det burde ikke være tilfelle)
3. Ingen problemer med dynamisk system — systemet ignorerer fjerna eksperten automatisk

### Når triggers endres

1. Oppdater katalogen
2. Ingen andre filer må endres
3. Neste gang AI velger ekspert, bruker den oppdaterte triggersene

---

## KONTEKSTBUDSJETT

**Når skal AI laste denne protokollen?**

- **ALLTID:** Når en fase-agent signaliserer `NEED_EXPERT: [domene]`
- **AUTOMATISK:** Hvis fase-agent er usikker på hvilken ekspert som trengs
- **FALLBACK:** Hvis fase-agent nevner en hardkodet ekspert (f.eks. "OWASP-ekspert"), bør AI søke katalogen i stedet

**Lagring:**
- Katalog-tabell (denne protokollen): Lag 2 (hent ved behov)
- Valg-algoritme (denne protokollen): Lag 2 (hent ved behov)
- Ekspert-filer (f.eks. OWASP-ekspert.md): Lag 2 (hent når valgt)

---

## VERSJONERING

| Versjon | Dato | Endringer |
|---------|------|----------|
| 1.0 | 2026-02-16 | Initial versjon: 32 eksperter, valg-algoritme, fallback-regler, integrasjon med mission briefing |
| 1.1 | 2026-04-22 | Utvidet katalog fra 32 til 37 eksperter: lagt til GORGEOUS-UI, FEATURE-FLAGS, RLS-TESTER, SCHEMA-MIGRASJON, HALLUSINASJON-DETEKTOR (alle profesjonell pakke eller MVP-10). Oppdatert ekspert-telling for konsistens med AI-OPPGAVER.json og CALLING-REGISTRY. |

---

## MØNSTER-TIL-EKSPERT-TRIGGER (v3.6.0 — fra mønster-bibliotek)

Når PLANLEGGER-agent eller fase-agent bruker et mønster fra `Kit CC/Agenter/MONSTRE/`, trigges de relevante eksperter automatisk i etterfølgende faser via denne mappingen:

| Mønster | Trigger-fase | Eksperter aktivert |
|---|---|---|
| M:slett | Fase 5 (bygg), Fase 6 (test) | SIKKERHETS-agent (datatap-risiko), TEST-GENERATOR-ekspert |
| M:skjema | Fase 5, Fase 6 | TEST-GENERATOR-ekspert, TILGJENGELIGHETS-ekspert |
| M:liste | Fase 5 | YTELSE-ekspert (paginering, virtualisering), UIUX-ekspert |
| M:modal | Fase 5 | UIUX-ekspert, TILGJENGELIGHETS-ekspert (fokus-håndtering) |
| M:laste-tom-feil | Fase 5, Fase 6 | TEST-GENERATOR-ekspert, BRUKERTEST-ekspert |
| M:tilbakemelding | Fase 5 | UIUX-ekspert, GORGEOUS-UI-ekspert |
| M:angre | Fase 5 | SIKKERHETS-agent (recovery), UIUX-ekspert |
| M:tilgjengelighet (OBLIGATORISK) | Fase 5, Fase 6 | TILGJENGELIGHETS-ekspert |
| M:filter-sortering | Fase 5 | YTELSE-ekspert, UIUX-ekspert |
| M:flervalg | Fase 5 | UIUX-ekspert, TILGJENGELIGHETS-ekspert |
| M:detaljvisning | Fase 5 | UIUX-ekspert |
| M:inline-redigering | Fase 5 | UIUX-ekspert, TILGJENGELIGHETS-ekspert |
| M:tilgangsport | Fase 3, Fase 6 | OWASP-ekspert, RLS-TESTER-ekspert |
| M:mobil-beroring (OBLIGATORISK v/mobil) | Fase 5, Fase 6 | CROSS-BROWSER-ekspert, TILGJENGELIGHETS-ekspert |
| M:revisjonsspor | Fase 3, Fase 6 | GDPR-ekspert, AI-GOVERNANCE-ekspert |
| **M:tilstander (OBLIGATORISK)** | Fase 5, Fase 6 | TEST-GENERATOR-ekspert, UIUX-ekspert, BRUKERTEST-ekspert |
| M:feilhandtering | Fase 5, Fase 6 | SIKKERHETS-agent, TEST-GENERATOR-ekspert, INCIDENT-RESPONSE-ekspert |
| M:undo-first | Fase 5 | UIUX-ekspert, SIKKERHETS-agent |
| M:onboarding | Fase 5 | UIUX-ekspert, BRUKERTEST-ekspert |
| M:internasjonalisering | Fase 5, Fase 6 | TILGJENGELIGHETS-ekspert, CROSS-BROWSER-ekspert |
| M:offline | Fase 5, Fase 6 | YTELSE-ekspert, SRE-ekspert, BRUKERTEST-ekspert |
| **M:kanttilfeller (METAMØNSTER, OBLIGATORISK)** | Fase 5, Fase 6 | TEST-GENERATOR-ekspert, SIKKERHETS-agent, HALLUSINASJON-DETEKTOR-ekspert |

**Aktiveringslogikk:**
1. Når en modul har mønster M:X i seksjon 3.5 (mikrodetaljer), legg de tilsvarende eksperter i kandidat-listen for relevante faser
2. Ved fase-overgang: konsulter mønster-listen for moduler i den fasen, aktiver eksperter prioritert etter:
   - Obligatoriske mønstre (M:tilstander, M:tilgjengelighet, M:kanttilfeller) → høyest prioritet
   - Mobile-spesifikke (M:mobil-beroring) → høy hvis mobil-app
   - Andre → normal prioritet
3. Hver ekspert kjøres maks én gang per fase (deduplisering)
4. Logg aktivering til PROGRESS-LOG.jsonl: `{"event":"EXPERT_TRIGGERED","monster":"M:X","ekspert":"Y","fase":"Z"}`

**Vedlikehold:** Når ny mønster legges til i `Kit CC/Agenter/MONSTRE/`, oppdater også denne tabellen. Hvis ekspert endrer navn eller fjernes, oppdater alle relevante rader.

---

## REFERANSER

- **SSOT for klassifiseringer:** `../../klassifisering/KLASSIFISERING-METADATA-SYSTEM.md` (Lag 2)
- **Fase-agenter:** `Kit CC/Agenter/agenter/prosess/[N]-*.md` (Lag 1)
- **System-kommunikasjon:** `protocol-SYSTEM-COMMUNICATION.md` (Lag 3)
- **Ekspert-agenter:** `Kit CC/Agenter/agenter/ekspert/` (Lag 2)
- **Mønster-bibliotek:** `Kit CC/Agenter/MONSTRE/` (v3.6.0, 22 mønstre)
- **ORCHESTRATOR:** `agent-ORCHESTRATOR.md` (Lag 3) — Se DYNAMIC-ROUTING seksjon

---

*Protokoll: protocol-DYNAMISK-AGENT-VALG*
*Versjon: 1.1 — utvidet med mønster-til-ekspert-trigger for v3.6.0*
*Opprettet: 2026-02-16, oppdatert: 2026-05-13*
*Formål: SSOT for intelligent ekspert-agent-valg basert på oppgavens kontekst*
*Status: Aktiv*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
