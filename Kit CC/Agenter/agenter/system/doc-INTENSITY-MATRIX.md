# INTENSITY-MATRIX v2.0

> Samlet oversikt over hvordan intensitetsnivå påvirker alle agenter.

---

## FORMÅL

Denne filen samler på ett sted hva hvert intensitetsnivå betyr for:
- Alle 6 system-agenter
- Alle 7 basis-agenter
- Alle 7 prosess-agenter
- Alle 37 ekspert-agenter

**Viktig:** Denne filen beskriver hvordan intensitetsnivå påvirker agentenes *atferd* (dybde, omfang, tidsbruk). For autoritative MÅ/BØR/KAN-klassifiseringer, se `../../klassifisering/KLASSIFISERING-METADATA-SYSTEM.md` som er Single Source of Truth (SSOT) for alle klassifiseringer.

---

## INTENSITETSNIVÅER OVERSIKT

| Nivå | Score | Typisk prosjekt | Nøkkelord |
|------|-------|-----------------|-----------|
| **MINIMAL** | 7-10 | Hobby, læring, personlige verktøy | Rask, enkel, minimal dokumentasjon |
| **FORENKLET** | 11-14 | Interne verktøy, små team | Balansert, effektiv |
| **STANDARD** | 15-18 | Kundevendte apper, mellomstore | Full prosess, profesjonell |
| **GRUNDIG** | 19-23 | Viktige systemer, store brukerbaser | Ekstra validering, høy kvalitet |
| **ENTERPRISE** | 24-28 | Kritisk infrastruktur, regulerte | Maksimal sikkerhet, compliance |

---

## TASK-LEVEL COMPLEXITY ASSESSMENT (Før Intensity Brukes)

> **NY FUNKSJON:** Før user velger intensity for en spesifikk task, må agent vurdere task complexity.

### Workflow: Complexity-First Approach

```
USER: "Lag en [oppgave]"
    │
    ▼
1. TASK-COMPLEXITY-ASSESSMENT (Score 0-10)
    ├─ Security Impact (0-3)
    ├─ Integration Complexity (0-3)
    ├─ State Management (0-2)
    └─ Testing Difficulty (0-2)
    │
    ▼
2. ANBEFAL INTENSITY basert på score:
    ├─ 0-2: MINIMAL ✅
    ├─ 3-5: FORENKLET ⚠️
    ├─ 6-8: STANDARD ⚠️⚠️
    └─ 9-10: GRUNDIG 🚫 (MINIMAL NOT ALLOWED)
    │
    ▼
3. USER VELGER intensity
    │
    ├─ Match with recommendation → Proceed
    │
    └─ Mismatch (±3 poeng) → WARN user
        ├─ Show "80/20 trap" warning
        ├─ Explain consequences
        └─ WAIT for confirmation
```

**Referanse:** `./protocol-TASK-COMPLEXITY-ASSESSMENT.md` for full scoring model.

### Examples

```
Task: "Lag en button"
Complexity: 0/10
Anbefaling: MINIMAL ✅
→ No warning needed

Task: "Lag contact form"
Complexity: 4/10
Anbefaling: FORENKLET
User valgte: MINIMAL
→ SLIGHT MISMATCH (warning, men fortsett)

Task: "Implementer checkout med Stripe"
Complexity: 10/10
Anbefaling: GRUNDIG/ENTERPRISE
User valgte: MINIMAL
→ CRITICAL MISMATCH (BLOCK, require confirmation)
```

### Mismatch Warning Template

```markdown
⚠️ COMPLEXITY MISMATCH

Task complexity: {score}/10
Recommended: {recommended_intensity}
You chose: {user_intensity}

Factors:
- Security: {security_score}/3
- Integration: {integration_score}/3
- State: {state_score}/2
- Testing: {testing_score}/2

"80/20 Trap" Risk: {risk_level}

Research shows: "Vibe coding completes 80% fast,
but remaining 20% becomes exponentially harder"

Options:
A) Switch to {recommended} (recommended)
B) Continue with {user_intensity} (I'll warn you again if stuck)
C) Break task into smaller pieces
```

---

## SYSTEM-AGENTER (NIVÅ 0)

### ORCHESTRATOR

| Nivå | Autonomi | Handoff-bekreftelse | Logging |
|------|----------|---------------------|---------|
| MINIMAL | Høy - auto-fortsett | Kun ved kritiske valg | INFO kun |
| FORENKLET | Moderat | Ved fasebytte | INFO + noen WARN |
| STANDARD | Standard | Ved fase + agent-bytte | Full logging |
| GRUNDIG | Lav - eksplisitt godkjenning | Alle handoffs | DEBUG inkludert |
| ENTERPRISE | Minimal - alt bekreftes | Dokumentert godkjenning | Full audit trail |

### AUTO-CLASSIFIER

| Nivå | Antall spørsmål | Re-klassifisering | Confidence-krav |
|------|-----------------|-------------------|-----------------|
| MINIMAL | 3 hurtigspørsmål | Aldri automatisk | 50% OK |
| FORENKLET | 5 spørsmål | Ved store endringer | 60% OK |
| STANDARD | Progressiv avsløring (full) | Ved fasebytte | 70% krav |
| GRUNDIG | 7 + oppfølging | Hver fase | 80% krav |
| ENTERPRISE | 7 + ekspertvalidering | Kontinuerlig | 90% krav |

### CONTEXT-LOADER

| Nivå | Dokumenter | Semantic search | Komprimering |
|------|------------|-----------------|--------------|
| MINIMAL | Kun state + handoff | Av | Ingen |
| FORENKLET | + Fase-dokumenter | Enkel | Standard |
| STANDARD | + Relevante filer | Full | LLM-scoring |
| GRUNDIG | Progressive loading | Full + reranking | Sandwich-effekt |
| ENTERPRISE | Alt + caching | Avansert | Full optimalisering |

### PHASE-GATES (To-lags kvalitetsport)

**Lag 1 (MÅ-sjekk):** Binær, blokkerende — alle MÅ-oppgaver må være fullført. Gjelder ALLE nivåer.

**Lag 2 (Kvalitetsvurdering):** Vektet scoring — kjøres kun hvis Lag 1 er bestått.

| Nivå | Gate-strenghet | Lag 2 min. score | Regression-sjekk |
|------|----------------|------------------|------------------|
| MINIMAL | Kun blokkere | 50/100 | Aldri |
| FORENKLET | Basis + sikkerhet | 60/100 | Ved release |
| STANDARD | Full validering | 70/100 | Ved fasebytte |
| GRUNDIG | Ekstra valideringer | 80/100 | Kontinuerlig |
| ENTERPRISE | Compliance-sjekk | 90/100 | Alltid |

**Merk:** Lag 1 (MÅ-sjekk) har INGEN nivåjustering — MÅ er MÅ uansett nivå.

### BROWNFIELD-SCANNER

| Nivå | Analyse-dybde | Sverm-størrelse | Output |
|------|--------------|-----------------|--------|
| MINIMAL | Ikke aktivert | - | - |
| FORENKLET | Ikke aktivert | - | - |
| STANDARD | Automatisk ved ≥3 kildekodefiler | 25 under-agenter | Analyse-rapport |
| GRUNDIG | Automatisk ved ≥3 kildekodefiler | 25 under-agenter | Detaljert rapport + anbefalinger |
| ENTERPRISE | Automatisk ved ≥3 kildekodefiler | 25 under-agenter | Full audit-rapport |

Analyse av eksisterende kodebase ved brownfield-prosjekter (≥3 kildekodefiler). Sverm av 25 under-agenter.

### AGENT-PROTOCOL

| Nivå | Handoff-format | ACK påkrevd | Warm handoff |
|------|----------------|-------------|--------------|
| MINIMAL | Forenklet | Nei | Aldri |
| FORENKLET | Standard | Ved kritisk | Sjelden |
| STANDARD | Full med kontekst | Alltid | Anbefalt |
| GRUNDIG | Full + detaljer | Alltid + timeout | Ofte |
| ENTERPRISE | Dokumentert | Obligatorisk | Alltid |

---

## BASIS-AGENTER (NIVÅ 1)

### Samlet matrise

| Agent | MINIMAL | FORENKLET | STANDARD | GRUNDIG | ENTERPRISE |
|-------|---------|-----------|----------|---------|------------|
| **BYGGER** | Direkte koding | + Grunnleggende struktur | + Beste praksis | + Sikkerhetsfokus | + Compliance |
| **DEBUGGER** | Console.log | + Stack trace | + Systematisk | + Root cause | + Dokumentert |
| **DOKUMENTERER** | README kun | + API-docs | + Full docs | + Arkitektur | + Revisjonsklar |
| **REVIEWER** | Ingen | Grunnleggende | Full review | + Sikkerhet | + Ekstern |
| **SIKKERHETS** | OWASP Top 3 | OWASP Top 10 | + Trusselmodell | + Pentest-prep | + Audit |
| **PLANLEGGER** | Enkel liste | + Prioritering | + Avhengigheter | + Risiko | + Milepæler |

### BYGGER-agent detaljert

| Nivå | Kode-kvalitet | Testing | Sikkerhet | Dokumentasjon |
|------|---------------|---------|-----------|---------------|
| MINIMAL | Fungerende | Ingen | Input-validering | Inline kommentarer |
| FORENKLET | Lesbar | Happy path | + Autentisering | + README |
| STANDARD | Best practices | 60% coverage | + Autorisasjon | + API-docs |
| GRUNDIG | Optimalisert | 80% coverage | + Kryptering | + Arkitektur |
| ENTERPRISE | Produksjonsklar | 90%+ coverage | Full stack | Komplett |

### DEBUGGER-agent detaljert

| Nivå | Feilsøkingsmetode | Logging | Root cause | Dokumentasjon |
|------|-------------------|---------|------------|---------------|
| MINIMAL | Console output | Minimal | Symptombehandling | Ingen |
| FORENKLET | + Breakpoints | Standard | Overfladisk | Kort notat |
| STANDARD | + Profiling | Strukturert | Systematisk | Feilrapport |
| GRUNDIG | + Tracing | Detaljert | Dyp analyse | Full rapport |
| ENTERPRISE | + Distributed | Full audit | Komplett | Revisjonslogg |

### SIKKERHETS-agent detaljert

#### Minstekrav for sikkerhet (gjelder ALLE intensitetsnivåer)

Uavhengig av intensitetsnivå, ALLE prosjekter må oppfylle disse grunnleggende sikkerhetskravene:
- **Ingen hardkodede passord eller secrets** (MÅ for ALLE)
- **Grunnleggende input-validering** (MÅ for ALLE)
- **HTTPS/TLS** (MÅ for ALLE med nettverkskommunikasjon)

Disse er ikke forhandlingsbare og er blokkerende for alle nivåer (se "Blokkerende kriterier" nedenfor).

#### Intensitetsavhengige sikkerhetskrav

Utover minstekravene:

| Nivå | Sjekkliste | Verktøy | Trusselmodell | Rapport |
|------|------------|---------|---------------|---------|
| MINIMAL | Minstekrav bare | Manuell | Ingen | Muntlig |
| FORENKLET | Minstekrav + OWASP Top 10 | npm audit | Enkel | Kort skriftlig |
| STANDARD | Minstekrav + Autentisering | + SAST | STRIDE | Full rapport |
| GRUNDIG | Minstekrav + Kryptering | + DAST | Detaljert | + Anbefalinger |
| ENTERPRISE | Minstekrav + Full compliance | + Pentest | Kontinuerlig | Revisjonsrapport |

---

## PROSESS-AGENTER (NIVÅ 2)

### Samlet matrise per fase

| Fase | Agent | MINIMAL | FORENKLET | STANDARD | GRUNDIG | ENTERPRISE |
|------|-------|---------|-----------|----------|---------|------------|
| 1 | OPPSTART | 30 min | 2 timer | 1 dag | 2-3 dager | 1 uke |
| 2 | KRAV | Enkel liste | User stories | Full PRD | + NFR | + Legal |
| 3 | ARKITEKTUR | Skisse | Diagram | Full spec | + Trusselmodell | + Review |
| 4 | MVP | Fungerer | + Tester | + Sikkerhet | + Optimalisert | + Dokumentert |
| 5 | ITERASJON | Ad-hoc | Sprint | Agile | + Metrics | + Governance |
| 6 | KVALITET | Manuell test | Automatisert | + Sikkerhet | + Ytelse | + Compliance |
| 7 | PUBLISERING | Enkel deploy | CI/CD | + Monitoring | + DR | + SLA |

### OPPSTART-agent (Fase 1: Idé og visjon)

| Nivå | Aktiviteter | Leveranser | Tid |
|------|-------------|------------|-----|
| MINIMAL | Navngiving, enkel beskrivelse | README.md | 30 min |
| FORENKLET | + Målgruppe, grunnleggende risiko | + prosjektbeskrivelse.md | 2 timer |
| STANDARD | + Visjon, full risikoanalyse | + risikoregister.md | 1 dag |
| GRUNDIG | + Brukervalidering, konkurrentanalyse | + brukerintervjuer.md | 2-3 dager |
| ENTERPRISE | + Juridisk, compliance-vurdering | + compliance-sjekk.md | 1 uke |

### KRAV-agent (Fase 2: Planlegg)

| Nivå | Kravtype | Sikkerhetskrav | Leveranser |
|------|----------|----------------|------------|
| MINIMAL | Funksjoner som liste | Grunnleggende | Enkel liste |
| FORENKLET | User stories | + Autentisering | User stories doc |
| STANDARD | Full PRD | + Autorisasjon, GDPR | PRD + sikkerhetskrav |
| GRUNDIG | + Non-functional | + Full compliance | Alt + NFR-dokument |
| ENTERPRISE | + Legal review | Bransjespesifikk | Revisjonsklare docs |

### KVALITETSSIKRINGS-agent (Fase 6: Test, sikkerhet og kvalitetssjekk)

| Nivå | Testing | Sikkerhet | Akseptanse |
|------|---------|-----------|------------|
| MINIMAL | Manuell smoke test | Ingen | Fungerer |
| FORENKLET | + Unit tests | npm audit | Ingen kritiske bugs |
| STANDARD | + Integration | + SAST | 70/100 gate score |
| GRUNDIG | + E2E, ytelse | + DAST | 80/100 + review |
| ENTERPRISE | + Tilgjengelighet | + Pentest | 90/100 + audit |

---

## EKSPERT-AGENTER (NIVÅ 3)

### Aktiveringsmatrise

> **SSOT-referanse:** MÅ/BØR/KAN-klassifiseringer for ekspert-agenter er definert i
> `../../klassifisering/KLASSIFISERING-METADATA-SYSTEM.md` → seksjon "KOMPLETT FASE-OPPGAVER REGISTER".
>
> Se den filen for autoritative verdier per intensitetsnivå og fase-oppgave.
> Klassifiseringsverdiene vedlikeholdes kun på ett sted for å unngå inkonsistenser.
>
> **Forklaring av klassifiseringsnivåer (definert i KLASSIFISERING-METADATA-SYSTEM.md):**
> - IKKE / ❌ = Ikke aktivert (irrelevant for dette nivået)
> - KAN / ⚠️ = Valgfri, bruker kan aktivere
> - BØR / ✅ = Anbefalt, men ikke obligatorisk
> - MÅ / ✅ = Obligatorisk, må kjøres

---

## KOMPETANSEMATRISE FOR EKSPERTER

### Formål

Noen eksperter har overlappende kompetanse. Denne matrisen hjelper ORCHESTRATOR velge riktig ekspert og unngå duplisering.

### Kompetansematrise

| Ekspert | Primær kompetanse | Sekundær kompetanse | Kan hjelpe med |
|---------|-------------------|---------------------|----------------|
| **YTELSE-ekspert** | Frontend-ytelse | - | Lighthouse, Core Web Vitals, bundle size |
| **SRE-ekspert** | Infrastruktur-ytelse | Monitoring | SLI/SLO, oppetid, skalering |
| **MONITORING-ekspert** | Overvåking | Logging | Dashboards, alerting |
| **INCIDENT-RESPONSE-ekspert** | Beredskap | Overvåking | Runbooks, post-mortem |
| **SIKKERHETS-agent** | Generell sikkerhet | Input-validering | Rask sikkerhetssjekk |
| **OWASP-ekspert** | Web-sårbarheter | Penetrasjonstest | OWASP Top 10, dypskanning |
| **HEMMELIGHETSSJEKK-ekspert** | Secrets | Git-historikk | API-nøkler, passord i kode |
| **TRUSSELMODELLERINGS-ekspert** | Trusselanalyse | Arkitektur | STRIDE, DREAD |
| **GDPR-ekspert** | Personvern | Compliance | Samtykke, sletting |
| **TILGJENGELIGHETS-ekspert** | WCAG | UX | Skjermleser, tastatur |
| **UIUX-ekspert** | Brukeropplevelse | Tilgjengelighet | Polering, loading states |

### Valgregler for ORCHESTRATOR

```
NÅR VELGE HVILKEN EKSPERT:

Spørsmål om ytelse:
├── "Nettsiden er treg" → YTELSE-ekspert (frontend-fokus)
├── "Serveren takler ikke trafikken" → SRE-ekspert (infrastruktur)
└── "Vil overvåke responstider" → MONITORING-ekspert (dashboards)

Spørsmål om sikkerhet:
├── "Rask sikkerhetssjekk" → SIKKERHETS-agent (basis)
├── "Full sikkerhetsgjennomgang" → OWASP-ekspert (dyp)
├── "Har jeg passord i koden?" → HEMMELIGHETSSJEKK-ekspert
└── "Hvilke trusler finnes?" → TRUSSELMODELLERINGS-ekspert

Spørsmål om compliance:
├── "GDPR-krav" → GDPR-ekspert
├── "Tilgjengelighet/a11y" → TILGJENGELIGHETS-ekspert
└── "Begge deler" → Begge, i sekvens
```

### Samarbeid mellom eksperter

Noen oppgaver krever flere eksperter. Her er anbefalte kombinasjoner:

| Oppgave | Eksperter | Rekkefølge |
|---------|-----------|------------|
| **Sikkerhetssertifisering** | TRUSSELMODELLERINGS → OWASP → HEMMELIGHETSSJEKK | Sekvensiell |
| **Produksjonsklargjøring** | YTELSE + MONITORING + BACKUP | Parallell |
| **Compliance-sjekk** | GDPR → TILGJENGELIGHETS → OWASP | Sekvensiell |
| **Full performance-analyse** | YTELSE + SRE + LASTTEST | Parallell, sammenstill |

### Unngå duplisering

Hvis to eksperter ville gjort samme jobb, velg basert på:

```
1. SPESIFISITET: Velg mest spesialisert ekspert
   Eksempel: For WCAG → TILGJENGELIGHETS-ekspert (ikke UI/UX)

2. DYBDE: Velg basert på hvor grundig analyse trengs
   Eksempel: Rask sjekk → SIKKERHETS-agent
             Dyp analyse → OWASP-ekspert

3. FASE: Velg basert på hvor i prosjektet du er
   Eksempel: Fase 3 arkitektur → TRUSSELMODELLERINGS-ekspert
             Fase 6 testing → OWASP-ekspert
```

---

## PRESENTASJONSMAL FOR BØR/KAN-VALG

> **Eier:** ORCHESTRATOR bruker denne malen. Prosess-agenter mottar kun resultatet.
> Prosess-agenter skal ALDRI presentere BØR/KAN-valg selv.

### Når malen brukes

ORCHESTRATOR presenterer BØR/KAN-valg til bruker FØR oppgavegruppen delegeres til prosess-agent. Prosess-agenten mottar sin oppgaveliste med brukerens valg allerede inkludert.

### Standardmal

For HVER BØR/KAN-oppgave, presenter følgende til bruker:

```
📋 VALGFRI OPPGAVE: [Navn på funksjonen]

Kategori: [BØR (anbefalt) / KAN (valgfritt)]
Fase: [Hvilken fase dette tilhører]

Hva er dette?
[1-2 setninger som forklarer funksjonen i klart språk uten fagsjargong.
 Vibekodere kan ikke kode — forklar som om de aldri har programmert.]

Fordeler:
- [Fordel 1 — konkret, med eksempel]
- [Fordel 2 — konkret, med eksempel]

Ulemper:
- [Ulempe 1 — typisk ekstra tid/kompleksitet]

Min anbefaling: [Anbefalt ✅ / Nøytral ⚖️ / Kan vente ⏳]
Estimert ekstra-innsats: [Lav / Middels / Høy]

Vil du inkludere denne? [Ja / Nei / Vet ikke - forklar mer]
```

### Rekkefølge

```
1. Presenter alle BØR-oppgaver først (anbefalt)
2. Deretter alle KAN-oppgaver (valgfritt)
3. Presenter én om gangen
4. Vent på brukerens svar før neste
```

### Ved "Vet ikke"

Hvis bruker velger "Vet ikke":
- Gi en mer utdypende forklaring med et konkret eksempel
- Forklar hva som skjer hvis de IKKE inkluderer den
- Gjenta spørsmålet

### Etter alle valg — Oppsummering

```
✅ DINE VALG FOR FASE [X]:

Obligatorisk (kjøres alltid):
- [MÅ-oppgave 1]
- [MÅ-oppgave 2]

Du valgte å inkludere:
- [BØR/KAN-oppgave bruker sa ja til]

Du valgte bort:
- [BØR/KAN-oppgave bruker sa nei til]

Skal jeg starte med disse oppgavene?
```

### Registrering i PROJECT-STATE.json

Etter brukervalg, oppdater PROJECT-STATE.json:

```json
"userChoices": {
  "phase": 3,
  "timestamp": "2026-02-05T14:30:00Z",
  "choices": [
    {
      "id": "ARK-07",
      "name": "Trusselmodellering (STRIDE)",
      "requirement": "BØR",
      "userChoice": "included",
      "reason": "Bruker ønsket trusselmodellering"
    },
    {
      "id": "ARK-09",
      "name": "Ekstern arkitektur-review",
      "requirement": "KAN",
      "userChoice": "excluded",
      "reason": "Bruker prioriterte raskere levering"
    }
  ]
}
```

---

## FUNKSJONSFILTRERING

### Ansvarsfordeling mellom ORCHESTRATOR og agenter

```
ORCHESTRATOR (eier timing og brukervalg):
1. Leser intensityLevel fra PROJECT-STATE.json
2. Slår opp i denne filen (doc-INTENSITY-MATRIX.md)
3. Filtrerer funksjoner for nåværende fase:
   - MÅ → Inkluderes automatisk i oppgavelisten
   - BØR → Presenteres til bruker med standardmalen (se over)
   - KAN → Presenteres til bruker med standardmalen (se over)
   - ❌ → Skjules helt, vises aldri
4. Venter på brukerens valg
5. Oppdaterer PROJECT-STATE.json med valg
6. Genererer oppgaveliste: MÅ + brukerens valgte BØR/KAN
7. Sender oppgavelisten til PROSESS-agent

PROSESS-AGENT (mottar oppgaveliste, utfører arbeid):
- Mottar ferdig oppgaveliste fra ORCHESTRATOR
- Vet IKKE om BØR/KAN ble valgt eller valgt bort
- Utfører oppgavene i listen
- Oppdaterer status per oppgave i PROJECT-STATE.json
```

### Sporing av alle beslutninger

```
ORCHESTRATOR oppdaterer PROJECT-STATE.json med ALLE oppgaver:
- MÅ → status: completed (eller blocked med begrunnelse)
- BØR → status: completed | skipped (med brukerens begrunnelse)
- KAN → status: completed | skipped | not_offered
- ❌ → Ikke inkludert i sporing

**VIKTIG:** Hurtigspor-modus fritar IKKE fra sporing.
Selv i hurtigspor skal ORCHESTRATOR dokumentere hvilke BØR/KAN
som ble inkludert eller ekskludert, og hvorfor.
```

#### Eksempel: Hurtigspor-sporing

Selv i hurtigspor skal alle beslutninger dokumenteres:

```json
"completedSteps": [
  {
    "id": "ARK-01",
    "requirement": "MÅ",
    "status": "completed",
    "deliverable": "tech-stack-decision.md"
  },
  {
    "id": "ARK-07",
    "requirement": "BØR",
    "status": "completed",
    "deliverable": "threat-model-stride.md",
    "note": "Inkludert i STRIDE-leveranse — naturlig del av MÅ-arbeid"
  }
],
"skippedSteps": [
  {
    "id": "ARK-09",
    "requirement": "KAN",
    "reason": "Hurtigspor — ekstern review ikke nødvendig for MVP"
  }
]
```

**Merk:** Selv om agenten tok beslutningen autonomt i hurtigspor, er begrunnelsene dokumentert.

#### Hurtigspor-prinsipper: Når inkludere/skippe BØR-oppgaver

**Filosofi:** Hurtigspor handler om å bevege seg raskt, men smart. Bruk disse prinsippene som veiledning, ikke rigide regler.

**Prinsipp 1: "Gratis" BØR skal inkluderes**
```
Inkluder BØR-oppgave hvis:
- Den er del av samme leveranse som en MÅ-oppgave
- Den tar < 10% ekstra arbeid
- Den naturlig inngår i arbeidsflyten

Eksempel: DREAD-rangering i samme threat-model.md som STRIDE (MÅ)
Begrunnelse: "Inkludert i MÅ-leveranse — minimal ekstra innsats"
```

**Prinsipp 2: Skip BØR som krever separat innsats**
```
Skip BØR-oppgave hvis:
- Den krever separat leveranse/dokument
- Den krever betydelig ekstra analyse
- Den ikke er MVP-kritisk

Eksempel: Separat GDPR compliance-rapport når hovedfokus er prototype
Begrunnelse: "Hurtigspor — separat rapport ikke MVP-kritisk"
```

**Prinsipp 3: Sikkerhet og compliance får unntak**
```
ALLTID inkluder BØR hvis:
- Dataklassifisering er SENSITIVE eller HIGH-RISK
- Oppgaven handler om sikkerhet eller personvern
- Oppgaven handler om juridisk compliance

Eksempel: GDPR-vurdering skal IKKE skippes selv i hurtigspor hvis persondata håndteres
Begrunnelse: "Inkludert tross hurtigspor — persondata krever GDPR-vurdering"
```

**Prinsipp 4: Dokumenter ALLTID beslutningen**
```
Uansett valg:
- Legg til note i completedSteps hvis inkludert
- Legg til reason i skippedSteps hvis skipet
- Vær spesifikk og konkret i begrunnelsen

Dårlig: "Hurtigspor"
Bra: "Hurtigspor — separat analyse ikke MVP-kritisk, kan gjøres i Fase 5"
```

**Praktisk anvendelse:**
```
ARKITEKTUR-agent i hurtigspor møter ARK-07 (DREAD-rangering, BØR):

1. Er det del av samme leveranse som STRIDE (MÅ)? → JA
2. → INKLUDER
3. Dokumenter: "Inkludert i STRIDE-analysen — naturlig del av threat model"

ARKITEKTUR-agent møter ARK-08 (Security champions, BØR):

1. Er det del av samme leveranse? → NEI (krever separat dokument)
2. → SKIP
3. Dokumenter: "Hurtigspor — security champions-program ikke kritisk for MVP-arkitektur"
```

**Viktig:** Dette er veiledende prinsipper, ikke en rigid algoritme. ORCHESTRATOR kan bruke skjønn i hurtigspor, men SKAL alltid dokumentere begrunnelsen i PROJECT-STATE.json.

**Merk:** I hurtigspor er det fortsatt ORCHESTRATOR som tar beslutningene — ikke prosess-agentene. ORCHESTRATOR kan velge å inkludere "gratis" BØR-oppgaver uten å spørre bruker, men dette skal dokumenteres.

### Eksempel: ORCHESTRATOR presenterer BØR/KAN for BYGGER-oppgave i STANDARD-prosjekt

```
PROJECT-STATE.json:
{
  "classification": {
    "intensityLevel": "standard"
  }
}

ORCHESTRATOR leser INTENSITY-MATRIX:
→ STANDARD nivå for BYGGER:
  - Kode-kvalitet: Best practices (MÅ)
  - Testing: 60% coverage (MÅ)
  - Sikkerhet: + Autorisasjon (BØR)
  - Dokumentasjon: + API-docs (BØR)

ORCHESTRATOR presenterer til bruker (med standardmal, én om gangen):

📋 VALGFRI OPPGAVE: Autorisasjonssjekk

Kategori: BØR (anbefalt)
Fase: 4 - MVP

Hva er dette?
Systemet sjekker at bare riktige brukere har tilgang til riktige
ting. F.eks. at en vanlig bruker ikke kan se admin-sider.

Fordeler:
- Hindrer at brukere får tilgang til data de ikke skal se
- Mye enklere å legge til nå enn å fikse senere

Ulemper:
- Tar litt ekstra tid å sette opp (ca. 1-2 timer ekstra)

Min anbefaling: Anbefalt ✅
Estimert ekstra-innsats: Lav

Vil du inkludere denne? [Ja / Nei / Vet ikke - forklar mer]

[Bruker: Ja]

→ ORCHESTRATOR registrerer valg i PROJECT-STATE.json
→ ORCHESTRATOR presenterer neste BØR/KAN-oppgave
→ Etter alle valg: Oppsummering + bekreftelse
→ ORCHESTRATOR sender oppgaveliste til BYGGER-agent
→ BYGGER-agent mottar: [Best practices, 60% coverage, Autorisasjon, API-docs]
→ BYGGER-agent vet IKKE at autorisasjon var et BØR-valg
```

---

## GATE-KRAV PER NIVÅ

### To-lags kvalitetsport

**Lag 1 — MÅ-sjekk (gjelder alle nivåer):**
Alle MÅ-oppgaver må være fullført. Ingen unntak, ingen nivåjustering. FAIL = blokkerende.

**Lag 2 — Quality score terskler:**

| Nivå | Minimum score | PASS terskel | Regression varsling |
|------|---------------|--------------|---------------------|
| MINIMAL | 40/100 | 50/100 | Kun ved kritisk |
| FORENKLET | 50/100 | 60/100 | Ved 10% drop |
| STANDARD | 60/100 | 70/100 | Ved 5% drop |
| GRUNDIG | 70/100 | 80/100 | Ved enhver drop |
| ENTERPRISE | 80/100 | 90/100 | Kontinuerlig |

**Lag 2 scoring-vekter (standard):**

| Kategori | Vekt |
|----------|------|
| Artefakter | 40% |
| Kvalitetssjekker | 30% |
| Sikkerhet | 30% |

### Blokkerende kriterier per nivå

| Nivå | Blokkerer alltid (ALLE nivåer)* | Blokkerer i tillegg ved dette nivået |
|------|----------------------------------|--------------------------------------|
| MINIMAL | Hardkodede passord, grunnleggende input-validering | - |
| FORENKLET | ↑ | Kritiske CVE-er, manglende autentisering |
| STANDARD | ↑ | SQL injection, manglende autorisasjon |
| GRUNDIG | ↑ | XSS, manglende kryptering |
| ENTERPRISE | ↑ | Alle OWASP Top 10, compliance-brudd |

> \* Per minstekrav for sikkerhet: Hardkodede passord og grunnleggende input-validering blokkerer for ALLE nivåer.

---

## DOKUMENTASJONSKRAV

| Nivå | Obligatorisk | Anbefalt | Valgfritt |
|------|--------------|----------|-----------|
| MINIMAL | README.md | - | Alt annet |
| FORENKLET | + prosjektbeskrivelse | API-docs | Arkitektur |
| STANDARD | + PRD, sikkerhetskrav | + Arkitektur | Brukerguide |
| GRUNDIG | + Trusselmodell, NFR | + Brukerguide | Opplæringsmateriell |
| ENTERPRISE | + Compliance-docs | + Opplæring | - |

---

## TIDESTIMATER

### Typisk prosjektvarighet per nivå

| Nivå | Fase 1-2 | Fase 3-4 | Fase 5-6 | Fase 7 | Totalt |
|------|----------|----------|----------|--------|--------|
| MINIMAL | 1 dag | 1-2 dager | 1-2 uker | 1 dag | 2-3 uker |
| FORENKLET | 2-3 dager | 1 uke | 2-4 uker | 2-3 dager | 1-2 mnd |
| STANDARD | 1 uke | 2 uker | 1-2 mnd | 1 uke | 2-4 mnd |
| GRUNDIG | 2 uker | 1 mnd | 2-4 mnd | 2 uker | 4-8 mnd |
| ENTERPRISE | 1 mnd | 2 mnd | 4-8 mnd | 1 mnd | 8-12+ mnd |

---

## TIMEOUT-VERDIER PER NIVÅ

### Formål

Timeout-verdier justeres basert på prosjektets kompleksitet. Mer komplekse prosjekter har tyngre operasjoner som trenger mer tid.

### Viktig merknad

**Timeout gjelder IKKE bruker-input.** Brukeren kan ta den tiden de trenger for å svare på spørsmål. Timeout gjelder kun tekniske operasjoner.

### Timeout-matrise

| Operasjon | MINIMAL | FORENKLET | STANDARD | GRUNDIG | ENTERPRISE | Begrunnelse |
|-----------|---------|-----------|----------|---------|------------|-------------|
| **Agent-kommunikasjon** | 20 sek | 30 sek | 45 sek | 60 sek | 90 sek | Enterprise har tyngre logging |
| **Kontekst-lasting** | 30 sek | 1 min | 2 min | 3 min | 5 min | Større prosjekter har mer dokumentasjon |
| **Gate-validering** | 30 sek | 1 min | 2 min | 5 min | 10 min | Flere sjekker på høyere nivåer |
| **Fil-operasjoner** | 10 sek | 15 sek | 20 sek | 30 sek | 45 sek | Store kodebaser |
| **Ekspert-analyse** | 1 min | 2 min | 3 min | 5 min | 10 min | Dypere analyser tar lengre tid |
| **NEED_CONTEXT (henting av Lag 2-filer)** | 10 sek | 20 sek | 30 sek | 45 sek | 60 sek | Komplekse dokumenter eller tunge søk |
| **Health check** | 2 sek | 2 sek | 3 sek | 5 sek | 5 sek | Rask ping uansett nivå |

### Timeout for BRUKER-interaksjon

```
REGEL: Ingen timeout på bruker-svar

Hvorfor:
- Brukeren kan bli avbrutt
- Brukeren kan trenge tid til å tenke
- Brukeren kan gå bort og komme tilbake

Hva skjer i stedet:
- Session-status lagres kontinuerlig
- Ved retur: "Velkommen tilbake! Du var på [siste punkt]"
- Alt arbeid er bevart
```

### Ved timeout

```
TIMEOUT OPPSTÅR (teknisk operasjon)
    │
    ▼
1. Logg hendelse (ikke feil, bare info)
2. Vis melding til bruker:

   "Denne operasjonen tar lengre tid enn vanlig.

   Hva som skjer: [Operasjon] jobber fortsatt
   Normal tid: [X sekunder]
   Brukt tid: [Y sekunder]

   Dette kan skyldes:
   • Stor mengde data å behandle
   • Tregt nettverk eller server
   • Kompleks operasjon

   Hva vil du gjøre?
   A) Vent litt til (anbefalt)
   B) Avbryt og prøv igjen
   C) Hopp over denne delen"

3. IKKE auto-avbryt - la bruker velge
```

---

## REFERANSER

| Fil | Bruker denne matrisen for |
|-----|---------------------------|
| agent-ORCHESTRATOR.md | Autonomi-justering, timeout-verdier |
| agent-AUTO-CLASSIFIER.md | Definere nivå-konsekvenser |
| agent-CONTEXT-LOADER.md | Kontekst-strategi |
| agent-PHASE-GATES.md | Gate-strenghet |
| agent-AGENT-PROTOCOL.md | Protokoll-formalitet |
| protocol-SYSTEM-COMMUNICATION.md | Timeout-håndtering |
| Alle prosess-agenter | Aktivitets-omfang |
| Alle ekspert-agenter | Aktivering (se KLASSIFISERING-METADATA-SYSTEM.md) |

---

---

## PROFESJONELL PAKKE — Intensitetsmatrise

> Oversikt over hvilke pakke-komponenter som aktiveres per intensitetsnivå.
> Full protokoll: `protocol-PROFESJONELL-PAKKE.md` | Autoritativ SSOT: `../../klassifisering/KLASSIFISERING-METADATA-SYSTEM.md`

### Aktiveringsatferd per nivå

| Nivå | Pakke-status | Hva aktiveres | Hva hoppes over |
|------|-------------|---------------|-----------------|
| **MINIMAL** | Ikke aktiv | Kun N1 (alltid) | Alle K, V, P, B, S, N2, N3 |
| **FORENKLET** | Ikke aktiv | N1 (alltid), P3 (MÅ), V1 (MÅ), + KAN-komponenter ved behov | K1, K5, V3, V4, V5, S5, S8, S12 |
| **STANDARD** | Aktiv | Alle MÅ-komponenter aktiveres. BØR-komponenter aktiveres med mindre eksplisitt skip. | KAN-komponenter foreslås til bruker |
| **GRUNDIG** | Aktiv | Alle MÅ + alle BØR. S5, S8, P2 oppgraderes fra BØR til MÅ. | — |
| **ENTERPRISE** | Aktiv | Alle 30 komponenter aktive. Fullstendig pakke. | — |

### Hva som aktiveres på STANDARD (28 MÅ/BØR-komponenter)

**MÅ (alltid på STANDARD):**
K2, K3, K4, K5 (multi-tenant: K1), V1, V2, V4, V5, V6, P3, N1, N2, N3, S1, S2, S3, S4, S6, S7, S10, S11

**BØR (aktiveres med mindre skip):**
V3, P1, P2, S5, S8, S9, S12

**Hoppes over på STANDARD:**
K1 (kun ved multi-tenant), ingen andre

### Hva som oppgraderes fra STANDARD til GRUNDIG

| Komponent | STANDARD | GRUNDIG | Endring |
|-----------|----------|---------|---------|
| V3 (Slack-alert) | BØR | MÅ | Oppgradert |
| P2 (Staging) | BØR | MÅ | Oppgradert |
| S5 (Drift-detector) | BØR | MÅ | Oppgradert |
| S8 (Comprehension-gate) | BØR | MÅ | Oppgradert |
| S9 (Ytelse) | BØR | MÅ | Oppgradert |
| S12 (Runbooks) | BØR | MÅ | Oppgradert |

---

*Versjon: 2.1.0*
*Opprettet: 2026-02-02*
*Oppdatert: 2026-04-19*
*Formål: Samlet referanse for intensitetsnivå-påvirkning*
*v1.1: Lagt til kompetansematrise og timeout-verdier per nivå*
*v1.2: Lagt til steg 4-6 i filtreringsprotokoll for BØR/KAN-sporing*
*v1.3: Lagt til hurtigspor-prinsipper (principle-based guidance, ikke rigid regler)*
*v2.1: Lagt til PROFESJONELL PAKKE intensitetsmatrise (30 komponenter)*
*v2.0: BRUKERVALG-SYSTEM — ORCHESTRATOR eier timing og presentasjon av BØR/KAN-valg. Standardisert presentasjonsmal. Prosess-agenter mottar kun oppgaveliste.*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
