# Klassifiseringsbasert Metadata-System v3.5.0

> **Formål:** Sentralt system som kobler AUTO-CLASSIFIER til alle agenter, fase-oppgaver og funksjoner.
> **Agent-fasit:** 6 system + 7 basis + 7 prosess + 37 ekspert = **57 agenter totalt**. Autoritativ kilde: `Agenter/VERSION.json`.

> **Governance-modell:** Denne filen definerer **reglene og rammeverket** for MÅ/BØR/KAN-klassifisering.
> Faktiske oppgave-klassifiseringer eies av hver prosess-agent (federated governance).
> PHASE-GATES validerer at agentenes klassifiseringer følger disse reglene.

---

## FILSTRUKTUR (Relative baner)

> Denne strukturen er portabel - fungerer uansett hvor agentmappen kopieres.

```
Agenter/                            ← Hovedmappe (kopieres til nye prosjekter)
│
├── klassifisering/                 ← Metadata og oversikter (denne mappen)
│   ├── KLASSIFISERING-METADATA-SYSTEM.md  ← Denne filen (hovedreferanse)
│   ├── FUNKSJONSOVERSIKT-KOMPLETT.md      ← Alle agent-funksjoner
│   ├── CALLING-REGISTRY.md                ← Agent-aktiveringsregler
│   ├── ERROR-CODE-REGISTRY.md             ← Standardiserte feilkoder
│   ├── ARCHITECTURE-DIAGRAM.md            ← Visuell arkitektur
│   ├── METRICS-KPI.md                     ← Målinger og KPIer
│   ├── ROLLBACK-PROTOCOL.md               ← Recovery-prosedyrer
│   ├── ZONE-AUTONOMY-GUIDE.md             ← Zone-klassifisering (🟢🟡🔴)
│   └── AGENT-DEPENDENCIES.md              ← Avhengigheter mellom agenter
│
├── scripts/                        ← Verktøy-scripts
│   └── validate-consistency.sh    ← Konsistens-validering
│
├── agenter/                        ← Alle agent-filer
│   ├── system/                     ← Nivå 0: System-agenter (6)
│   │   ├── agent-AUTO-CLASSIFIER.md
│   │   ├── agent-ORCHESTRATOR.md
│   │   ├── agent-CONTEXT-LOADER.md
│   │   ├── agent-PHASE-GATES.md
│   │   ├── agent-AGENT-PROTOCOL.md
│   │   └── agent-BROWNFIELD-SCANNER.md
│   │
│   ├── basis/                      ← Nivå 1: Basis-agenter
│   │   ├── BYGGER-agent.md
│   │   ├── SIKKERHETS-agent.md
│   │   └── ...
│   │
│   ├── prosess/                    ← Nivå 2: Prosess-agenter
│   │   ├── 4-MVP-agent.md          (format: {nr}-{NAVN}-agent.md)
│   │   └── ...
│   │
│   └── ekspert/                    ← Nivå 3: Ekspert-agenter
│       ├── GDPR-ekspert.md
│       └── ...
│
├── maler/                          ← Agent-maler
│   ├── MAL-PROSESS.md
│   └── MAL-EKSPERT.md
│
└── .ai/                            ← Prosjekt-spesifikk data (per prosjekt)
    └── PROJECT-STATE.json
```

### Relative baner fra ulike filer

| Fra fil | Til klassifisering/ | Til PROJECT-STATE |
|---------|---------------------|-------------------|
| `agenter/system/agent-AUTO-CLASSIFIER.md` | `../../klassifisering/` | `../../../../.ai/PROJECT-STATE.json` |
| `agenter/basis/BYGGER-agent.md` | `../../klassifisering/` | `../../../../.ai/PROJECT-STATE.json` |
| `agenter/prosess/4-MVP-agent.md` | `../../klassifisering/` | `../../../../.ai/PROJECT-STATE.json` |
| `agenter/ekspert/GDPR-ekspert.md` | `../../klassifisering/` | `../../../../.ai/PROJECT-STATE.json` |
| `klassifisering/` (denne) | `./` | `../../../.ai/PROJECT-STATE.json` |
| `maler/` | `../klassifisering/` | `../../../.ai/PROJECT-STATE.json` |

---

## OVERSIKT

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AUTO-CLASSIFIER                                                          │
│ Progressiv avsløring → Score 7-28 → Intensitetsnivå                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PROJECT-STATE.json                                                       │
│ {                                                                        │
│   "classification": { "intensityLevel": "standard", "score": 17 }         │
│   "builderMode": "samarbeid"                                               │
│ }                                                                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ FASE-OPPGAVER        │  │ AGENTER              │  │ AGENT-FUNKSJONER     │
│ MÅ/BØR/KAN/IKKE      │  │ Aktiveres av oppgaver│  │ MÅ/BØR/KAN/IKKE      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

Dette systemet kobler **AUTO-CLASSIFIER** (prosjektklassifisering) med **agent-funksjoner** gjennom standardisert metadata. Hver funksjon i en agent har metadata som forteller AI:

1. **HVA** funksjonen gjør
2. **NÅR** den skal brukes (basert på intensitetsnivå)
3. **HVILKE** eksterne tjenester den krever
4. **HVA** den koster
5. **HVOR** viktig den er for prosjektet

---

## BETINGELSESLOGIKK

**Betingelser brukes for å bestemme når funksjoner aktiveres, fase-oppgaver skal kjøres, og spørsmål skal stilles.**

### AND-logikk (Standard — alle betingelser må oppfylles)

Når betingelser er listet uten eksplisitt `ELLER`, tolkes det som `OG`:

```
Betingelse: "Spørsmål 2 = C OG Spørsmål 3 = C"
Betydning:  Bruker må svare C på BÅDE spørsmål 2 OG spørsmål 3
Trigger:    BARE når begge betingelser er sanne samtidig
```

### OR-logikk (Eksplisitt — minst ÉN betingelse må oppfylles)

Når betingelser skal behandles med `ELLER`, er det **eksplisitt merket**:

```
Betingelse: "Prosjektet har UI (webapp/mobilapp/desktop) ELLER landingsside"
Betydning:  Minst ÉN av disse må være sann
Trigger:    Når ÉN ELLER BEGGE betingelser er sanne
```

### Eksempler fra Lag 2-spørsmål

| Betingelse | Logikk | Trigger |
|-----------|--------|---------|
| "Spørsmål 2 = C (Kunder)" | AND (implisitt) | Bare når Q2=C |
| "Spørsmål 1 nevner helse ELLER medisin ELLER terapi" | OR (eksplisitt) | Når ÉN av ordene nevnes |
| "Prosjektet har UI (webapp, mobilapp, desktop) ELLER landingsside ELLER e-handel" | OR (eksplisitt) | Når minst ÉN betingelse er oppfylt |

---

## INTENSITETSNIVÅER (Fra AUTO-CLASSIFIER)

| Nivå | Score | Brukervennlig navn | Typisk prosjekt | Agenter brukt | Tidsbruk |
|------|-------|---|-----------------|---------------|----------|
| **MINIMAL** | 7-10 | **enkelt hobbyprosjekt** | Hobbyprosjekt, læring | Kun basis | Timer-dager |
| **FORENKLET** | 11-14 | **lite, oversiktlig prosjekt** | Internt verktøy, småteam | Utvalgte eksperter | Uker |
| **STANDARD** | 15-18 | **vanlig app-prosjekt** | Kundevendt app | Alle prosess + utvalgte eksperter | 1-3 mnd |
| **GRUNDIG** | 19-23 | **viktig prosjekt med sensitive data** | Viktig system, stor brukerbase | Alle agenter | 3-6 mnd |
| **ENTERPRISE** | 24-28 | **stort, kritisk system** | Kritisk infrastruktur, regulert | Alle + eksterne eksperter | 6+ mnd |

**Merk:** Brukervennlig navn vises alltid til brukere. De interne nivånavnene (MINIMAL, FORENKLET, etc.) brukes kun internt i PROJECT-STATE.json.

---

## FUNKSJONS-PRIORITET (MÅ/BØR/KAN/SKAL IKKE)

Hver funksjon har en prioritet per intensitetsnivå:

| Prioritet | Symbol | Betydning |
|-----------|--------|-----------|
| **MÅ** | 🔴 | Påkrevd for dette nivået. Prosjektet er ikke komplett uten. |
| **BØR** | 🟡 | Sterkt anbefalt. Skip kun med god begrunnelse. |
| **KAN** | 🟢 | Valgfri. Nyttig men ikke nødvendig. |
| **SKAL IKKE** | ⚫ | Overkill for dette nivået. Unødvendig kompleksitet. |

---

## STACK-INDIKATORER

Funksjoner merkes med relevans for ulike tech-stacker:

| Indikator | Betydning | Eksempel |
|-----------|-----------|----------|
| 🟢 **VIBEKODING** | Optimalisert for Supabase + Vercel + GitHub | Vercel deploy, Supabase RLS |
| 🟣 **HYBRID** | Fungerer med vibekoding OG enterprise | GitHub Actions, PostgreSQL |
| 🔵 **ENTERPRISE** | Krever enterprise-verktøy | Kubernetes, Terraform, SOC2 |
| ⚪ **STACK-AGNOSTISK** | Fungerer uansett stack | Code review, dokumentasjon |

---

## METADATA-STRUKTUR FOR FUNKSJONER

Hver funksjon i en agent skal ha denne strukturen:

```markdown
### [Funksjonsnavn] [Stack-indikator]

**ID:** [Unik ID, f.eks. INF-01]

**Beskrivelse:** [Hva funksjonen gjør - én setning]

**For vibekodere:** [Forklaring i hverdagsspråk - hva dette betyr for dem]

| Intensitetsnivå | Prioritet | Begrunnelse |
|-----------------|-----------|-------------|
| MINIMAL | [MÅ/BØR/KAN/SKAL IKKE] | [Hvorfor] |
| FORENKLET | [MÅ/BØR/KAN/SKAL IKKE] | [Hvorfor] |
| STANDARD | [MÅ/BØR/KAN/SKAL IKKE] | [Hvorfor] |
| GRUNDIG | [MÅ/BØR/KAN/SKAL IKKE] | [Hvorfor] |
| ENTERPRISE | [MÅ/BØR/KAN/SKAL IKKE] | [Hvorfor] |

**Eksterne tjenester:** [Liste over tjenester som kreves]

**Kostnad:** [Gratis / Lavkost ($1-50/mnd) / Moderat ($50-200/mnd) / Enterprise ($200+/mnd)]

**Kompleksitet:** [Lav / Medium / Høy]

**Typisk tidsbruk:** [Estimat]
```

---

## EKSEMPEL: Komplett funksjons-metadata

### Vercel Prosjekt-Konfigurasjon 🟢

**ID:** INF-01

**Beskrivelse:** Setter opp Vercel-prosjekt med riktige miljøvariabler, domener og build-settings.

**For vibekodere:** Dette er "hjemmet" til frontend-koden din. Funksjonen sørger for at alt er satt opp riktig så koden din blir tilgjengelig på internett med én gang du pusher til GitHub.

| Intensitetsnivå | Prioritet | Begrunnelse |
|-----------------|-----------|-------------|
| MINIMAL | 🟢 KAN | Kan deploye manuelt for hobbyprosjekter |
| FORENKLET | 🟡 BØR | Automatisk deploy sparer tid |
| STANDARD | 🔴 MÅ | Kundevendte apper krever profesjonelt oppsett |
| GRUNDIG | 🔴 MÅ | Kritisk for staging/prod-separasjon |
| ENTERPRISE | 🔴 MÅ | Påkrevd med full konfigurasjon |

**Eksterne tjenester:** Vercel (gratis tier tilgjengelig), GitHub

**Kostnad:** Gratis - $20/mnd (Vercel Pro)

**Kompleksitet:** Lav

**Typisk tidsbruk:** 15-30 minutter

---

## KOMPAKT FORMAT (For oversikter)

For raske oversikter, bruk dette kompakte formatet:

```markdown
## FUNKSJONS-MATRISE

| ID | Funksjon | Stack | MIN | FOR | STD | GRU | ENT | Kostnad |
|----|----------|-------|-----|-----|-----|-----|-----|---------|
| INF-01 | Vercel Setup | 🟢 | KAN | BØR | MÅ | MÅ | MÅ | Gratis |
| INF-02 | Supabase RLS | 🟢 | IKKE | BØR | MÅ | MÅ | MÅ | Gratis |
| INF-03 | K8s Cluster | 🔵 | IKKE | IKKE | IKKE | KAN | BØR | $200+ |
```

---

## BESLUTNINGSTRE FOR AI

Når AI skal velge hvilke funksjoner å bruke:

```
1. Les PROJECT-STATE.json → Finn intensitetsnivå
2. For hver funksjon i agenten:
   a. Sjekk prioritet for nåværende nivå
   b. Hvis MÅ → Kjør alltid
   c. Hvis BØR → Kjør med mindre eksplisitt skip
   d. Hvis KAN → Foreslå til bruker
   e. Hvis SKAL IKKE → Skip (nevn ikke for bruker)
3. Sjekk stack-indikator
   a. Hvis 🔵 ENTERPRISE og prosjekt bruker vibekoding-stack → Advar bruker
   b. Hvis 🟢 VIBEKODING og prosjekt er enterprise → Foreslå alternativ
4. Verifiser kostnad
   a. Hvis kostnad > prosjekt-budget → Foreslå alternativ
```

---

## AGENT-TYPE SPESIFIKKE REGLER

### Prosess-agenter (Nivå 2)
- Bruker metadata for å bestemme hvilke eksperter som kalles
- Tilpasser fase-oppgaver basert på intensitetsnivå
- Justerer leveranse-krav per nivå

### Ekspert-agenter (Nivå 3)
- Bruker metadata for å velge riktig dybde på analyse
- Tilpasser output-format per nivå
- Hopper over enterprise-funksjoner for vibekoding-prosjekter

### Basis-agenter (Nivå 1)
- Generelt stack-agnostiske (⚪)
- Bruker metadata for å tilpasse kompleksitet
- Samme funksjoner, forskjellig dybde

---

## OPPDATERING AV AGENTER

For å legge til metadata i en eksisterende agent:

### Steg 1: Identifiser alle funksjoner
Les gjennom agenten og list opp alle distinkte oppgaver den utfører.

### Steg 2: Klassifiser per intensitetsnivå
For hver funksjon, bestem MÅ/BØR/KAN/SKAL IKKE for hvert nivå.

### Steg 3: Legg til stack-indikator
Bestem om funksjonen er 🟢/🟣/🔵/⚪.

### Steg 4: Dokumenter kostnad og kompleksitet
Legg til metadata om eksterne tjenester og kostnader.

### Steg 5: Oppdater agent-fil
Legg til FUNKSJONS-MATRISE-seksjon i agenten.

---

## INTEGRASJON MED AUTO-CLASSIFIER

### Ved prosjektstart:
1. AUTO-CLASSIFIER klassifiserer prosjekt
2. PROJECT-STATE.json oppdateres med intensitetsnivå
3. Alle agenter leser nivået og filtrerer funksjoner

### Ved fase-overgang:
1. AUTO-CLASSIFIER (continuous reclassification) sjekker om nivå har endret seg
2. Hvis nivå endres → Agenter re-evaluerer hvilke funksjoner som gjelder
3. Nye MÅ-funksjoner aktiveres, SKAL IKKE-funksjoner deaktiveres

### Ved manuell overstyring:
1. Bruker kan alltid be om en spesifikk funksjon
2. AI varsler hvis funksjonen er merket SKAL IKKE for nivået
3. AI dokumenterer avviket i PROJECT-STATE.json

---

## VISUELL HURTIGREFERANSE

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUNKSJONS-VALG FLYT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PROJECT-STATE.json                                            │
│   intensityLevel: "standard"                                    │
│           │                                                     │
│           ▼                                                     │
│   ┌───────────────────────────────────────────────────────┐    │
│   │  FUNKSJON: Kubernetes Setup 🔵                        │    │
│   │  ├── MINIMAL:    SKAL IKKE                            │    │
│   │  ├── FORENKLET:  SKAL IKKE                            │    │
│   │  ├── STANDARD:   SKAL IKKE  ← Nåværende nivå          │    │
│   │  ├── GRUNDIG:    KAN                                  │    │
│   │  └── ENTERPRISE: BØR                                  │    │
│   └───────────────────────────────────────────────────────┘    │
│           │                                                     │
│           ▼                                                     │
│   Resultat: SKIP denne funksjonen (SKAL IKKE)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

---

## KOMPLETT FASE-OPPGAVER REGISTER

> Alle oppgaver i alle 7 faser med klassifisering per intensitetsnivå.

> **ID-format:** Alle faser bruker agent-spesifikke prefikser som standard:
> Fase 1: OPP-xx, Fase 2: KRAV-xx, Fase 3: ARK-xx, Fase 4: MVP-xx, Fase 5: F5-xx, Fase 6: F6-xx, Fase 7: F7-xx.
> Disse ID-ene er autoritative og eies av hver prosess-agent (federated governance).

### FASE 1: Idé og visjon

| ID | Oppgave | Stack | MIN | FOR | STD | GRU | ENT | Agent |
|----|---------|-------|-----|-----|-----|-----|-----|-------|
| OPP-01 | Definér problem og visjon | ⚪ | MÅ | MÅ | MÅ | MÅ | MÅ | OPPSTART, PERSONA-ekspert |
| OPP-02 | Kartlegg Jobs-to-Be-Done | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | PERSONA-ekspert |
| OPP-03 | Lag personas | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | PERSONA-ekspert |
| OPP-04 | Tegn brukerreiser | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | PERSONA-ekspert |
| OPP-05 | Lag Lean Canvas | ⚪ | IKKE | BØR | MÅ | MÅ | MÅ | LEAN-CANVAS-ekspert |
| OPP-06 | Definer verdiforslag | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | LEAN-CANVAS-ekspert |
| OPP-07 | Kostnadsestimering | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | LEAN-CANVAS-ekspert |
| OPP-08 | Kartlegg markedskonkurrenter | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | KONKURRANSEANALYSE-ekspert |
| OPP-09 | Differensiering og blå ocean | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | KONKURRANSEANALYSE-ekspert |
| OPP-10 | Identifiser risikoscenarioer | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | OPPSTART |
| OPP-11 | Risikovurdering (DREAD) | ⚪ | BØR | MÅ | MÅ | MÅ | MÅ | OPPSTART |
| OPP-12 | Klassifiser prosjekttype | ⚪ | MÅ | MÅ | MÅ | MÅ | MÅ | AUTO-CLASSIFIER |
| OPP-13 | Kartlegg datatyper | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | OPPSTART |
| OPP-14 | Dataklassifisering | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | OPPSTART |
| OPP-15 | Compliance-krav analyse | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | SIKKERHETS-agent |
| OPP-16 | Juridiske vurderinger | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | OPPSTART |
| OPP-17 | Marked og timing | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | LEAN-CANVAS-ekspert |
| OPP-18 | Ressursbehov estimering | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | OPPSTART |
| OPP-19 | Go/No-Go vurdering | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | OPPSTART |
| OPP-20 | Beslutningstaking | ⚪ | MÅ | MÅ | MÅ | MÅ | MÅ | Bruker |
| OPP-21 | Oppsummering av Fase 1 | ⚪ | BØR | BØR | MÅ | MÅ | MÅ | DOKUMENTERER-agent |
| OPP-22 | Forberedelse til Fase 2 | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | OPPSTART |

### FASE 2: Planlegg

| ID | Oppgave | Stack | MIN | FOR | STD | GRU | ENT | Agent |
|----|---------|-------|-----|-----|-----|-----|-----|-------|
| KRAV-01 | User stories (med akseptansekriterier) | ⚪ | KAN | MÅ | MÅ | MÅ | MÅ | KRAV |
| KRAV-02 | Sikkerhetskrav & dataklassifisering | ⚪ | IKKE | BØR | MÅ | MÅ | MÅ | KRAV, SIKKERHETS-agent |
| KRAV-03 | MVP-definisjon (MoSCoW-prioritering) | ⚪ | BØR | MÅ | MÅ | MÅ | MÅ | KRAV |
| KRAV-04 | Wireframes (low-fi) | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | WIREFRAME-ekspert |
| KRAV-05 | API-spesifikasjon & datamodell | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | API-DESIGN-ekspert |
| KRAV-06 | Akseptansekriterier per brukerhistorie | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ | KRAV |
| KRAV-07 | Regulatorisk & compliance kartlegging | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | KRAV |
| KRAV-08 | Brukerflyt-diagram & edge cases | ⚪ | IKKE | KAN | KAN | BØR | MÅ | KRAV |
| KRAV-09 | Modulregister-utvinning | ⚪ | IKKE | BØR | MÅ | MÅ | MÅ | KRAV |
| KRAV-10 | Integrasjonsbehov (fra B12) | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | KRAV |

### FASE 3: Arkitektur og sikkerhet

| ID | Oppgave | Stack | MIN | FOR | STD | GRU | ENT | Agent |
|----|---------|-------|-----|-----|-----|-----|-----|-------|
| ARK-01 | Tech stack-valg | ⚪ | MÅ | MÅ | MÅ | MÅ | MÅ | ARKITEKTUR |
| ARK-02 | Database-design (normalisering + sikring) | ⚪ | KAN | MÅ | MÅ | MÅ | MÅ | DATAMODELL-ekspert |
| ARK-03 | API-arkitektur (design + sikkerhet) | ⚪ | IKKE | BØR | MÅ | MÅ | MÅ | API-DESIGN-ekspert |
| ARK-04 | STRIDE-analyse (trusselmodellering) | ⚪ | IKKE | IKKE | BØR | MÅ | MÅ | TRUSSELMODELLERINGS-ekspert |
| ARK-05 | Arkitektur-diagram (C4) | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | DOKUMENTERER-agent |
| ARK-06 | Sikkerhetskontroller-design | ⚪ | IKKE | BØR | MÅ | MÅ | MÅ | SIKKERHETS-agent |
| ARK-07 | DREAD-rangering + risikomitigation | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | TRUSSELMODELLERINGS-ekspert |
| ARK-08 | Phase gate-validering | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | ARKITEKTUR |

### FASE 4: MVP

| ID | Oppgave | Stack | MIN | FOR | STD | GRU | ENT | Agent |
|----|---------|-------|-----|-----|-----|-----|-----|-------|
| MVP-01 | Git repo-struktur | 🟣 | MÅ | MÅ | MÅ | MÅ | MÅ | MVP |
| MVP-02 | .gitignore + .env.example | 🟣 | MÅ | MÅ | MÅ | MÅ | MÅ | MVP |
| MVP-03 | Secrets management | 🟣 | KAN | MÅ | MÅ | MÅ | MÅ | HEMMELIGHETSSJEKK-ekspert |
| MVP-04 | CI/CD-pipeline | 🟣 | IKKE | BØR | MÅ | MÅ | MÅ | CICD-ekspert |
| MVP-05 | SAST + dependency-sjekk | 🟣 | IKKE | KAN | BØR | MÅ | MÅ | SUPPLY-CHAIN-ekspert |
| MVP-06 | SBOM generering | ⚪ | IKKE | IKKE | KAN | MÅ | MÅ | SUPPLY-CHAIN-ekspert |
| MVP-07 | Test coverage 70%+ | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | TEST-GENERATOR-ekspert |
| MVP-08 | Multi-environment setup | 🟢🟣 | IKKE | KAN | BØR | MÅ | MÅ | INFRASTRUKTUR-ekspert |
| MVP-09 | Backend-implementasjon | ⚪ | MÅ | MÅ | MÅ | MÅ | MÅ | BYGGER |
| MVP-10 | Frontend-implementasjon | ⚪ | MÅ | MÅ | MÅ | MÅ | MÅ | BYGGER, DESIGN-TIL-KODE |
| MVP-11 | Authentication | 🟢 | MÅ | MÅ | MÅ | MÅ | MÅ | SIKKERHETS-agent |
| MVP-12 | Unit + integration-tester | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | TEST-GENERATOR-ekspert |
| MVP-13 | Code review før merge | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ | REVIEWER |
| MVP-14 | Phase gate validering | ⚪ | IKKE | IKKE | MÅ | MÅ | MÅ | PHASE-GATES |
| MVP-15 | Integrasjons-gate (B12 oppsett) | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | MVP |

### FASE 5: Bygg funksjonene

| ID | Oppgave | Stack | MIN | FOR | STD | GRU | ENT | Agent |
|----|---------|-------|-----|-----|-----|-----|-----|-------|
| F5-01 | Feature-implementering | ⚪ | MÅ | MÅ | MÅ | MÅ | MÅ | ITERASJONS, BYGGER |
| F5-02 | Code review | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ | REVIEWER |
| F5-03 | Brukervalidering | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | BRUKERTEST-ekspert |
| F5-04 | Ytelses-optimalisering | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | YTELSE-ekspert |
| F5-05 | UI/UX-polering | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | UIUX-ekspert |
| F5-06 | Teknisk gjeld-håndtering | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | REFAKTORING-ekspert |
| F5-07 | Test-vedlikehold | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | SELF-HEALING-TEST-ekspert |
| F5-08 | Dokumentasjonsoppdatering | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ | DOKUMENTERER |

### FASE 6: Test, sikkerhet og kvalitetssjekk

| ID | Oppgave | Stack | MIN | FOR | STD | GRU | ENT | Agent |
|----|---------|-------|-----|-----|-----|-----|-----|-------|
| F6-01 | E2E-testing | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | TEST-GENERATOR, Playwright |
| F6-02 | OWASP Top 10 testing | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ | OWASP-ekspert |
| F6-03 | Hemmelighetssjekk (full repo) | ⚪ | KAN | MÅ | MÅ | MÅ | MÅ | HEMMELIGHETSSJEKK-ekspert |
| F6-04 | GDPR-compliance | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | GDPR-ekspert |
| F6-05 | Tilgjengelighet (WCAG) | ⚪ | IKKE | IKKE | BØR | MÅ | MÅ | TILGJENGELIGHETS-ekspert |
| F6-06 | Cross-browser testing | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | CROSS-BROWSER-ekspert |
| F6-07 | Lasttest | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | LASTTEST-ekspert |
| F6-08 | Penetrasjonstest | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | Ekstern |
| F6-09 | AI Governance audit | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | AI-GOVERNANCE-ekspert |
| F6-10 | Ytelses-benchmark | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | YTELSE-ekspert |

### FASE 7: Publiser og vedlikehold

| ID | Oppgave | Stack | MIN | FOR | STD | GRU | ENT | Agent |
|----|---------|-------|-----|-----|-----|-----|-----|-------|
| F7-01 | Produksjons-deploy | 🟣 | MÅ | MÅ | MÅ | MÅ | MÅ | PUBLISERINGS, CICD-ekspert |
| F7-02 | Monitoring-oppsett | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | MONITORING-ekspert |
| F7-03 | Alerting-konfigurasjon | ⚪ | IKKE | IKKE | KAN | MÅ | MÅ | MONITORING-ekspert |
| F7-04 | Backup-strategi | 🟢 | IKKE | KAN | BØR | MÅ | MÅ | BACKUP-ekspert |
| F7-05 | Disaster recovery-plan | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | BACKUP-ekspert |
| F7-06 | Incident response-plan | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | INCIDENT-RESPONSE-ekspert |
| F7-07 | SLI/SLO-definisjon | ⚪ | IKKE | IKKE | KAN | BØR | MÅ | SRE-ekspert |
| F7-08 | Dokumentasjon-ferdigstilling | ⚪ | KAN | BØR | MÅ | MÅ | MÅ | DOKUMENTERER |
| F7-09 | Vedlikeholdsplan | ⚪ | IKKE | KAN | BØR | MÅ | MÅ | PUBLISERINGS |

---

## AGENT-REGISTER MED AKTIVERINGSREGLER

### System-agenter (Nivå 0) — 6 agenter, alltid aktive

| Agent | Aktivering | Funksjonsmatrise |
|-------|------------|------------------|
| ORCHESTRATOR | Alltid | Infrastruktur - ingen brukervalg |
| CONTEXT-LOADER | Alltid | Infrastruktur - ingen brukervalg |
| AUTO-CLASSIFIER | Ved prosjektstart | Infrastruktur - ingen brukervalg |
| PHASE-GATES | Ved fase-overgang | Infrastruktur - ingen brukervalg |
| AGENT-PROTOCOL | Alltid | Infrastruktur - ingen brukervalg |
| BROWNFIELD-SCANNER | Ved eksisterende kode (≥3 kildekodefiler) | Infrastruktur - ingen brukervalg |

### Basis-agenter (Nivå 1) — 7 agenter

| Agent | Aktiveres av | Har FUNKSJONS-MATRISE |
|-------|--------------|---------------------|
| PLANLEGGER | Alle prosess-agenter | ⏳ Trenger oppdatering |
| BYGGER | MVP, ITERASJONS | ⏳ Trenger oppdatering |
| REVIEWER | MVP, ITERASJONS, KVALITETSSIKRING | ⏳ Trenger oppdatering |
| SIKKERHETS | Alle faser | ⏳ Trenger oppdatering |
| DEBUGGER | Ved feil | ⏳ Trenger oppdatering |
| DOKUMENTERER | Alle faser | ⏳ Trenger oppdatering |
| VEILEDER | Bruker velger "Spørre"-modus (boot steg 1) | Read-only spørre-agent |

### Prosess-agenter (Nivå 2)

| Agent | Fase | Har FUNKSJONS-MATRISE |
|-------|------|---------------------|
| OPPSTART | 1 | ✅ Oppdatert |
| KRAV | 2 | ✅ Oppdatert |
| ARKITEKTUR | 3 | ✅ Oppdatert |
| MVP | 4 | ✅ Oppdatert |
| ITERASJONS | 5 | ⏳ Trenger oppdatering |
| KVALITETSSIKRINGS | 6 | ⏳ Trenger oppdatering |
| PUBLISERINGS | 7 | ⏳ Trenger oppdatering |

### Ekspert-agenter (Nivå 3) — 37 eksperter

> **ID-format:** "Aktiveres av oppgave"-kolonnen bruker agent-spesifikke prefikser (OPP-xx, KRAV-xx, ARK-xx, MVP-xx, F5-xx, F6-xx, F7-xx).

| Agent | Aktiveres av oppgave | Stack | Har FUNKSJONS-MATRISE |
|-------|---------------------|-------|---------------------|
| PERSONA-ekspert | OPP-02, OPP-03 | ⚪ | ⏳ Trenger oppdatering |
| LEAN-CANVAS-ekspert | OPP-05 | ⚪ | ⏳ Trenger oppdatering |
| KONKURRANSEANALYSE-ekspert | OPP-08 | ⚪ | ⏳ Trenger oppdatering |
| WIREFRAME-ekspert | KRAV-04 | ⚪ | ⏳ Trenger oppdatering |
| API-DESIGN-ekspert | KRAV-05, ARK-03 | ⚪ | ⏳ Trenger oppdatering |
| TRUSSELMODELLERINGS-ekspert | ARK-04 | ⚪ | ⏳ Trenger oppdatering |
| DATAMODELL-ekspert | ARK-02 | 🟢 | ⏳ Trenger oppdatering |
| HEMMELIGHETSSJEKK-ekspert | MVP-03, F6-03 | 🟣 | ⏳ Trenger oppdatering |
| CICD-ekspert | MVP-04, F7-01 | 🟣 | ⏳ Trenger oppdatering |
| SUPPLY-CHAIN-ekspert | MVP-05, MVP-06 | ⚪ | ✅ Oppdatert |
| TEST-GENERATOR-ekspert | MVP-07, MVP-12, F6-01 | ⚪ | ⏳ Trenger oppdatering |
| INFRASTRUKTUR-ekspert | MVP-08 | 🟢🟣 | ⏳ Trenger oppdatering |
| DESIGN-TIL-KODE-ekspert | MVP-10 | ⚪ | ⏳ Trenger oppdatering |
| BRUKERTEST-ekspert | F5-03 | ⚪ | ⏳ Trenger oppdatering |
| YTELSE-ekspert | F5-04, F6-10 | ⚪ | ⏳ Trenger oppdatering |
| UIUX-ekspert | F5-05 | ⚪ | ⏳ Trenger oppdatering |
| REFAKTORING-ekspert | F5-06 | ⚪ | ✅ Oppdatert |
| SELF-HEALING-TEST-ekspert | F5-07 | ⚪ | ⏳ Trenger oppdatering |
| OWASP-ekspert | F6-02 | ⚪ | ✅ Oppdatert |
| GDPR-ekspert | F6-04 | ⚪ | ✅ Oppdatert |
| TILGJENGELIGHETS-ekspert | F6-05 | ⚪ | ⏳ Trenger oppdatering |
| CROSS-BROWSER-ekspert | F6-06 | ⚪ | ⏳ Trenger oppdatering |
| LASTTEST-ekspert | F6-07 | ⚪ | ⏳ Trenger oppdatering |
| AI-GOVERNANCE-ekspert | F6-09 | ⚪ | ⏳ Trenger oppdatering |
| MONITORING-ekspert | F7-02, F7-03 | ⚪ | ⏳ Trenger oppdatering |
| BACKUP-ekspert | F7-04, F7-05 | 🟢 | ⏳ Trenger oppdatering |
| INCIDENT-RESPONSE-ekspert | F7-06 | ⚪ | ⏳ Trenger oppdatering |
| SRE-ekspert | F7-07 | ⚪ | ⏳ Trenger oppdatering |
| MIGRASJON-ekspert | Ved behov | ⚪ | ⏳ Trenger oppdatering |
| PROMPT-INGENIØR-ekspert | Ved behov | ⚪ | ⏳ Trenger oppdatering |
| RLS-TESTER-ekspert | MVP-xx, F6-xx | 🟢 | ✅ Oppdatert |
| FEATURE-FLAGS-ekspert | MVP-xx, F5-xx | 🟢 | ✅ Oppdatert |
| SCHEMA-MIGRASJON-ekspert | ARK-xx, MVP-xx, F5-xx | 🟢 | ✅ Oppdatert |
| HALLUSINASJON-DETEKTOR-ekspert | F5-xx, F6-xx | ⚪ | ✅ Oppdatert |
| CODE-QUALITY-GATE-ekspert | MVP-14, F5-xx, F6-xx | ⚪ | ⏳ Trenger oppdatering |
| GORGEOUS-UI-ekspert | MVP-00 (design system), MVP-10, ITR-10 | ⚪ | ⏳ Trenger oppdatering |
| TESTSKRIVER-ekspert | MVP-07, F5-07, F6-01 | ⚪ | ⏳ Trenger oppdatering |

---

## PROJECT-STATE.json STRUKTUR

```json
{
  "projectName": "MinApp",
  "currentPhase": 4,
  "classification": {
    "intensityLevel": "standard",
    "score": 17,
    "confidenceScore": 85,
    "userLevel": "erfaren-vibecoder",
    "confidenceBreakdown": {
      "clarity": 0.9,
      "consistency": 0.85,
      "pattern": 0.8
    },
    "classifiedAt": "2026-02-02T10:00:00Z",
    "classifiedBy": "AUTO-CLASSIFIER"
  },
  "builderMode": "samarbeid",
  "session": {
    "status": "active",
    "startedAt": "2026-02-02T10:00:00Z",
    "sessionId": "sess-abc123"
  },
  "phaseProgress": {
    "1": {
      "status": "completed",
      "completedSteps": ["OPP-01", "OPP-12", "OPP-20"]
    },
    "4": {
      "status": "in_progress",
      "completedSteps": [
        { "id": "MVP-01", "name": "Git repo-struktur", "requirement": "MÅ", "status": "completed" },
        { "id": "MVP-02", "name": ".gitignore + .env.example", "requirement": "MÅ", "status": "completed" }
      ],
      "skippedSteps": [
        { "id": "MVP-06", "name": "SBOM generering", "requirement": "KAN", "reason": "Ikke relevant for standard-nivå" }
      ]
    }
  }
}
```

---

## NIVÅ-SPESIFIKKE PROFILER

### MINIMAL-profil
```
Fokus: Raskest mulig til fungerende produkt
Ignorerer: Compliance, enterprise-sikkerhet, testing
Typisk oppgaver: 15-20 totalt
Eksperter aktivert: Ingen
```

### FORENKLET-profil
```
Fokus: Fungerende produkt med grunnleggende kvalitet
Inkluderer: Secrets management, basic testing, auth
Typisk oppgaver: 25-35
Eksperter aktivert: HEMMELIGHETSSJEKK, TEST-GENERATOR
```

### STANDARD-profil
```
Fokus: Profesjonelt produkt for kunder
Inkluderer: CI/CD, code review, GDPR, testing
Typisk oppgaver: 50-65
Eksperter aktivert: De fleste relevante
```

### GRUNDIG-profil
```
Fokus: Høy kvalitet med compliance
Inkluderer: Alt i STANDARD + penetrasjonstest, WCAG, lasttest
Typisk oppgaver: 65-80
Eksperter aktivert: Alle relevante + eksterne
```

### ENTERPRISE-profil
```
Fokus: Maksimal sikkerhet og compliance
Inkluderer: Alt + audit-ready, SRE, disaster recovery
Typisk oppgaver: 80-95
Eksperter aktivert: Alle + eksterne spesialister
```

---

## RELATERTE DOKUMENTER

### System-dokumentasjon (klassifisering/)

| Dokument | Formål | Når bruke |
|----------|--------|-----------|
| [CALLING-REGISTRY.md](./CALLING-REGISTRY.md) | Agent-aktiveringsregler | Hvem kaller hvem |
| [ERROR-CODE-REGISTRY.md](./ERROR-CODE-REGISTRY.md) | Standardiserte feilkoder | Ved feilhåndtering |
| [ARCHITECTURE-DIAGRAM.md](./ARCHITECTURE-DIAGRAM.md) | Visuell arkitektur | Forstå systemet |
| [METRICS-KPI.md](./METRICS-KPI.md) | Målinger og KPIer | Måle ytelse |
| [ROLLBACK-PROTOCOL.md](./ROLLBACK-PROTOCOL.md) | Recovery-prosedyrer | Ved feil og rollback |
| [ZONE-AUTONOMY-GUIDE.md](./ZONE-AUTONOMY-GUIDE.md) | Zone-klassifisering | Bestemme autonomi |
| [AGENT-DEPENDENCIES.md](./AGENT-DEPENDENCIES.md) | Agent-avhengigheter | Forstå dataflyt |
| [FUNKSJONSOVERSIKT-KOMPLETT.md](./FUNKSJONSOVERSIKT-KOMPLETT.md) | Alle funksjoner | Detaljert referanse |

### System-agenter (agenter/system/)

| Dokument | Formål |
|----------|--------|
| [agent-ORCHESTRATOR.md](../agenter/system/agent-ORCHESTRATOR.md) | Sentral koordinering |
| [agent-AGENT-PROTOCOL.md](../agenter/system/agent-AGENT-PROTOCOL.md) | Kommunikasjonsstandarder |
| [agent-PHASE-GATES.md](../agenter/system/agent-PHASE-GATES.md) | Fase-validering |
| [protocol-SYSTEM-COMMUNICATION.md](../agenter/system/protocol-SYSTEM-COMMUNICATION.md) | State-locking |
| [doc-INTENSITY-MATRIX.md](../agenter/system/doc-INTENSITY-MATRIX.md) | Intensitetsnivåer |

### Scripts (scripts/)

| Script | Formål | Kjør |
|--------|--------|------|
| [validate-consistency.sh](../scripts/validate-consistency.sh) | Konsistens-validering | `./scripts/validate-consistency.sh` |

---

## PROFESJONELL PAKKE v3 — 30 KOMPONENTER

> **Aktivering:** Automatisk ved intensitetsnivå STANDARD, GRUNDIG eller ENTERPRISE.
> MINIMAL og FORENKLET: kun N1 (MULTI-TENANT-REKLASSIFISERING) er alltid aktiv.
> Se `agenter/system/protocol-PROFESJONELL-PAKKE.md` for full aktiveringslogikk.

Kolonner: MIN = MINIMAL, FOR = FORENKLET, STD = STANDARD, GRU = GRUNDIG, ENT = ENTERPRISE

### K — Kjernefunksjoner (database og flagg)

| ID | Navn | MIN | FOR | STD | GRU | ENT |
|----|------|-----|-----|-----|-----|-----|
| K1 | RLS-TESTER-ekspert | IKKE | IKKE | MÅ (multi-tenant) | MÅ | MÅ |
| K2 | FEATURE-FLAGS-ekspert | IKKE | KAN | MÅ | MÅ | MÅ |
| K3 | SCHEMA-MIGRASJON-ekspert | IKKE | KAN | MÅ | MÅ | MÅ |
| K4 | hooks-library | IKKE | KAN | MÅ | MÅ | MÅ |
| K5 | protocol-CLAUDE-CODE-HOOKS | IKKE | IKKE | MÅ | MÅ | MÅ |

### V — Varsling og synlighet (ops og kommunikasjon)

| ID | Navn | MIN | FOR | STD | GRU | ENT |
|----|------|-----|-----|-----|-----|-----|
| V1 | protocol-AI-COST-ALERTS | KAN | MÅ | MÅ | MÅ | MÅ |
| V2 | protocol-PII-SANITERING | IKKE | KAN | MÅ | MÅ | MÅ |
| V3 | protocol-SLACK-ALERT-STRUKTUR | IKKE | IKKE | BØR | MÅ | MÅ |
| V4 | templates/incident-communication | IKKE | IKKE | MÅ | MÅ | MÅ |
| V5 | extension-STATUS-PAGE-SETUP | IKKE | IKKE | MÅ | MÅ | MÅ |
| V6 | extension-GITHUB-BRANCH-PROTECTION | IKKE | KAN | MÅ | MÅ | MÅ |

### P — Prosess og pipeline (git og staging)

| ID | Navn | MIN | FOR | STD | GRU | ENT |
|----|------|-----|-----|-----|-----|-----|
| P1 | extension-GIT-FLOW-VIBECODER | KAN | BØR | BØR | BØR | BØR |
| P2 | extension-STAGING-8-STEG | IKKE | KAN | BØR | MÅ | MÅ |
| P3 | protocol-KEY-MANAGEMENT | KAN | MÅ | MÅ | MÅ | MÅ |

### B — Binding (meta-protokoll)

| ID | Navn | MIN | FOR | STD | GRU | ENT |
|----|------|-----|-----|-----|-----|-----|
| B1 | protocol-PROFESJONELL-PAKKE | LESES | LESES | AKTIV | AKTIV | AKTIV |

### N — Nye tverrgående komponenter

| ID | Navn | MIN | FOR | STD | GRU | ENT |
|----|------|-----|-----|-----|-----|-----|
| N1 | protocol-MULTI-TENANT-REKLASSIFISERING | AKTIV | AKTIV | AKTIV | AKTIV | AKTIV |
| N2 | BROWNFIELD-MULTI-TENANT-AUDITOR | IKKE | IKKE | MÅ | MÅ | MÅ |
| N3 | Monitor-utvidelse | IKKE | IKKE | MÅ | MÅ | MÅ |

### S — Sikkerhet og stabilitet (AI-spesifikke risikoer)

| ID | Navn | MIN | FOR | STD | GRU | ENT |
|----|------|-----|-----|-----|-----|-----|
| S1 | HALLUSINASJON-DETEKTOR-ekspert | IKKE | KAN | MÅ | MÅ | MÅ |
| S2 | protocol-MANDATORY-RUNTIME-VERIFICATION | IKKE | KAN | MÅ | MÅ | MÅ |
| S3 | protocol-KONTEKSTBUDSJETT (utv.) | IKKE | BØR | MÅ | MÅ | MÅ |
| S4 | protocol-REFINEMENT-CAP | IKKE | KAN | MÅ | MÅ | MÅ |
| S5 | protocol-DRIFT-DETECTOR | IKKE | IKKE | BØR | MÅ | MÅ |
| S6 | protocol-MEMORY-HARDENING | IKKE | KAN | MÅ | MÅ | MÅ |
| S7 | protocol-MCP-GATEWAY-GUARD | KAN | BØR | MÅ | MÅ | MÅ |
| S8 | protocol-COMPREHENSION-GATE | IKKE | IKKE | BØR | MÅ | MÅ |
| S9 | YTELSE-ekspert (utv.) | IKKE | KAN | BØR | MÅ | MÅ |
| S10 | CODE-QUALITY-GATE-ekspert (utv.) | IKKE | BØR | MÅ | MÅ | MÅ |
| S11 | protocol-PROMPT-INJECTION-DEFENSE | IKKE | KAN | MÅ | MÅ | MÅ |
| S12 | templates/disaster-runbooks | IKKE | IKKE | BØR | MÅ | MÅ |

---

## CHANGELOG

| Versjon | Dato | Endring |
|---------|------|---------|
| 3.5.1 | 2026-04-22 | Korrigerte agent-tellinger: 57 totalt (6 system + 7 basis + 7 prosess + 37 ekspert) — profesjonell-pakke-eksperter (RLS-TESTER, FEATURE-FLAGS, SCHEMA-MIGRASJON, HALLUSINASJON-DETEKTOR) + TESTSKRIVER + GORGEOUS-UI nå inkludert i offisiell ekspert-telling. BROWNFIELD-SCANNER nå inkludert i system-telling. |
| 3.5.0 | 2026-04-19 | Lagt til PROFESJONELL PAKKE v3 (30 nye komponenter, K/V/P/B/N/S-kategorier). Oppdatert for profesjonell pakke-integrering. |
| 3.4.1 | 2026-02-23 | Fase 1-3 oppgave-ID-er migrert til agent-spesifikke prefikser (OPP-xx, KRAV-xx, ARK-xx). Fase 1 utvidet fra 10 til 22 oppgaver. Fase 3 justert fra 9 til 8 oppgaver. Ekspert-aktiveringsreferanser oppdatert. Oppgavetall i profiler justert. |
| 3.4.0 | 2026-02-10 | Versjonsynkronisering til Kit CC v3.4. Bekreftet 5 intensitetsnivåer, 50 agenter (5 system + 7 basis + 7 prosess + 31 ekspert), MÅ/BØR/KAN-matrise fullstendig |
| 2.1.0 | 2026-02-05 | Lagt til RELATERTE DOKUMENTER seksjon, oppdatert filstruktur |
| 2.0.0 | 2026-02-02 | Komplett fase-oppgaver, agent-register, PROJECT-STATE struktur |
| 1.0.0 | 2026-02-02 | Initial versjon |

---

*Versjon: 3.5.0*
*Opprettet: 2026-02-02*
*Sist oppdatert: 2026-04-22*
*Agent-fasit: Se `Agenter/VERSION.json` (6 system + 7 basis + 7 prosess + 37 ekspert = 57 totalt)*
*Relatert: agent-AUTO-CLASSIFIER.md, FUNKSJONSOVERSIKT-KOMPLETT.md, MAL-PROSESS.md, MAL-EKSPERT.md, PROJECT-STATE-SCHEMA.json (v3.5.1), protocol-PROFESJONELL-PAKKE.md*
*v3.5.1: Korrigerte agent-tellinger (6/7/7/37/57), la til BROWNFIELD-SCANNER i system-register, VEILEDER i basis-register, og CODE-QUALITY-GATE/GORGEOUS-UI/TESTSKRIVER i ekspert-register. Versjon synkronisert mellom header/footer/changelog.*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
