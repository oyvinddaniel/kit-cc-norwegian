# ZONE-AUTONOMY-GUIDE v3.1

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for autoritativ Kit CC-versjon.

> **SSOT for autonomi-regler.** Hva har AI-en lov til å gjøre i en gitt sone?

## Rolleavgrensning (v3.1 — 2026-04-22)

| Dokument | Rolle | SSOT for |
|----------|-------|----------|
| **ZONE-AUTONOMY-GUIDE.md** (denne) | *Hva får AI gjøre?* | Sonedefinisjoner, autonomi-regler pr sone, operasjonskategorier, stack-indikatorer, eskalering |
| **TASK-CLASSIFICATION.md** | *Hvilken sone?* | Oppgave-eksempler pr sone, decision tree, validation checklists |

Bruk TASK-CLASSIFICATION til å avgjøre hvilken sone en oppgave hører hjemme i, og deretter denne filen for å avgjøre hva AI-en har lov til å gjøre.

---

## FORMÅL

Definerer:
- Konsistent bruk av zone-indikatorer (🟢🟡🔴)
- Autonomi-regler per zone
- Oppgave-klassifisering
- Stack-indikatorer (🟢🟣🔵⚪)

---

## FORHOLD TIL BYGGEMODUS

Zone-klassifiseringen gjelder **kun når builderMode er `ai-bestemmer`**.
- `ai-bestemmer` + GREEN zone → AI kjører fritt
- `ai-bestemmer` + YELLOW zone → AI ber om bekreftelse
- `ai-bestemmer` + RED zone → AI stopper og spør bruker
- `samarbeid` eller `detaljstyrt` → Bruker styrer allerede. Zone-klassifisering er informativ men overstyres av byggemodus.

---

## OPERASJONSKATEGORIER

Detaljerte operasjonskategorier per zone. Brukes til rask klassifisering av konkrete handlinger.

### GREEN ZONE operasjoner (fullt automatisk)

#### Code Generation & Analysis
- Generere kode basert på spesifikasjoner
- Kjøre automated security scans (Semgrep, CodeQL)
- Beregne code coverage metrics
- Generere unit tests
- Kjøre linting og formatting
- Dependency vulnerability scanning
- Generere dokumentasjon (README, API docs)

#### Project Management
- Oppdatere PROJECT-STATE.json
- Logge til PROGRESS-LOG.md
- Beregne quality metrics
- Generere KPI dashboard
- Create checkpoints

#### Communication
- Agent-to-agent handoffs (JSON protocol)
- Status updates til bruker
- Error logging

**Filosofi:** Hvis operasjonen er **read-only** eller **lokalt reverserbar**, er den automatisk.

---

### YELLOW ZONE operasjoner (Announce and Proceed)

AI varsler bruker om valget og fortsetter umiddelbart. Bruker kan avbryte om nødvendig.

#### Medium-risk operations

- **Skip BOR-oppgaver**
  AI: "Jeg skipper [oppgave] fordi [reason]" og fortsetter. Bruker kan avbryte.

- **Dependency upgrades** med breaking changes
  AI varsler om potensielle konsekvenser og fortsetter med oppgraderingen.

- **Store filendringer** (>500 linjer)
  AI varsler: "Jeg endrer [N] linjer i [fil]" og fortsetter.

- **Teknisk gjeld-beslutninger**
  AI varsler: "Jeg bruker quick fix i stedet for refactor" og fortsetter.

**Filosofi:** Operasjonen er **teknisk trygg**, men kan være **suboptimal**. Bruker informeres.

**VIKTIG:** AI varsler og fortsetter umiddelbart (Announce and Proceed). Det er brukerens ansvar å avbryte om nødvendig. Ingen nedtelling eller venteperiode.

---

### RED ZONE operasjoner (obligatorisk godkjenning)

AI må stoppe og vente på eksplisitt godkjenning fra bruker.

#### Security & Compliance
- **Production deployment** — Krever eksplisitt "deploy"-kommando
- **Kode med failed security scan** — Blokkerer helt til issues er fikset
- **Override phase gates** — Krever eksplisitt override med begrunnelse
- **Behandle sensitive data** — Krever godkjenning av tilnærming (hashing, kryptering, etc.)

#### Business Logic
- **Kritiske forretningslogikk-beslutninger** — AI kan ikke gjette regler (f.eks. payment provider, refund policy)
- **Finansielle beregninger** — Krever review av logikk for moms, avrunding, rabatter etc.

#### Data & Privacy
- **GDPR-relevant features** — Krever avklaring om samtykke, datalagringstid, slettingsrettigheter
- **Database schema changes (produksjon)** — Destruktive operasjoner krever eksplisitt bekreftelse

**Filosofi:** Operasjonen er **irreversibel**, **security-critical** eller **business-critical**. Menneske må ALLTID godkjenne.

---

## ZONE-INDIKATORER

### Definisjon

| Zone | Indikator | Navn | Betydning |
|------|-----------|------|-----------|
| GREEN | 🟢 | Autonom | AI kan utføre selvstendig |
| YELLOW | 🟡 | Review | AI utfører, menneske reviewer |
| RED | 🔴 | Human-led | Menneske leder, AI assisterer |

### Bruk i dokumentasjon

```markdown
## Oppgave: [Navn]

**Zone:** 🟢 GREEN | 🟡 YELLOW | 🔴 RED

...
```

---

## GREEN ZONE (🟢)

### Kjennetegn
- Lav risiko
- Reverserbare handlinger
- Etablerte mønstre
- Ingen sensitiv data

### Typiske oppgaver

| Kategori | Eksempler |
|----------|-----------|
| Kode | UI-komponenter, utilities, tester |
| Dokumentasjon | README, kommentarer, API-docs |
| Konfigurasjon | .gitignore, linting, formatting |
| Analyse | Kode-review, dependency-sjekk |

### Autonomi-regler

```
AI KAN:
✓ Utføre oppgaven fullstendig
✓ Velge implementeringsdetaljer
✓ Refaktorere for kvalitet
✓ Legge til tester

AI BØR:
○ Informere om valg tatt
○ Dokumentere endringer
○ Følge etablerte mønstre

AI MÅ IKKE:
✗ Endre arkitektur-beslutninger
✗ Introdusere nye avhengigheter uten grunn
```

---

## YELLOW ZONE (🟡)

### Kjennetegn
- Moderat risiko
- Påvirker andre komponenter
- Krever domenekunnskap
- Business-logikk involvert

### Typiske oppgaver

| Kategori | Eksempler |
|----------|-----------|
| Kode | API-endepunkter, database-queries, state-management |
| Integrasjon | Tredjepartsbiblioteker, eksterne APIer |
| Konfigurasjon | CI/CD, miljøvariabler, deployment |
| Design | Data-modeller, API-kontrakter |

### Autonomi-regler

```
AI KAN:
✓ Foreslå implementering
✓ Skrive første utkast
✓ Generere tester
✓ Identifisere edge cases

AI MÅ:
○ Varsle bruker om valg tatt, fortsett med implementering
○ Dokumentere beslutninger
○ Varsle om risiko
○ Ved kritiske endringer: varsle bruker og fortsett — bruker kan avbryte

AI MÅ IKKE:
✗ Merge uten review
✗ Endre kontrakter uten godkjenning
✗ Deploye til produksjon
```

### Review-krav

| Intensitetsnivå | Review-type |
|-----------------|-------------|
| MINIMAL | Ingen (oppgraderes til GREEN) |
| FORENKLET | Self-review |
| STANDARD | Peer review |
| GRUNDIG | Senior review |
| ENTERPRISE | Multi-reviewer + dokumentasjon |

---

## RED ZONE (🔴)

### Kjennetegn
- Høy risiko
- Irreversibel eller kostbar feil
- Sensitiv data (PII, betalingsinfo)
- Compliance/juridisk påvirkning
- Sikkerhetskritisk

### Typiske oppgaver

| Kategori | Eksempler |
|----------|-----------|
| Sikkerhet | Autentisering, autorisasjon, kryptering |
| Data | Personopplysninger, betalingsdata, helseinformasjon |
| Økonomi | Betaling, fakturering, finansielle beregninger |
| Compliance | GDPR, PCI-DSS, HIPAA |
| Infrastruktur | Produksjons-database, secrets, SSL-sertifikater |

### Autonomi-regler

```
AI KAN:
✓ Analysere og foreslå
✓ Generere boilerplate
✓ Skrive tester
✓ Dokumentere krav

AI MÅ:
○ STOPP før implementering
○ Presentere forslag til menneske
○ Vente på eksplisitt godkjenning
○ Logge alle beslutninger

AI MÅ IKKE:
✗ Implementere selvstendig
✗ Endre produksjonsdata
✗ Håndtere secrets direkte
✗ Gjøre compliance-beslutninger
```

### Eskalering

```
RED ZONE OPPGAVE IDENTIFISERT
            │
            ▼
┌───────────────────────────────┐
│ STOP AUTONOM UTFØRELSE        │
└───────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ PRESENTER TIL BRUKER:         │
│                               │
│ ⚠️ RED ZONE OPPGAVE           │
│                               │
│ Type: [sikkerhet/data/økonomi]│
│ Risiko: [beskrivelse]         │
│ Forslag: [AI-anbefaling]      │
│                               │
│ Bekreft for å fortsette: ___  │
└───────────────────────────────┘
            │
            ▼
    VENT PÅ BRUKER-BEKREFTELSE
```

---

## STACK-INDIKATORER

### Definisjon

| Indikator | Navn | Betydning |
|-----------|------|-----------|
| 🟢 | VIBEKODING | Optimalisert for Supabase + Vercel + GitHub |
| 🟣 | HYBRID | Fungerer med vibekoding OG enterprise |
| 🔵 | ENTERPRISE | Krever enterprise-verktøy |
| ⚪ | STACK-AGNOSTISK | Fungerer uansett stack |

### Bruk i FUNKSJONS-MATRISE

```markdown
| ID | Funksjon | Stack | MIN | FOR | STD | GRU | ENT |
|----|----------|-------|-----|-----|-----|-----|-----|
| F1 | Vercel deploy | 🟢 | KAN | BØR | MÅ | MÅ | MÅ |
| F2 | GitHub Actions | 🟣 | IKKE | BØR | MÅ | MÅ | MÅ |
| F3 | Kubernetes | 🔵 | IKKE | IKKE | IKKE | KAN | BØR |
| F4 | Code review | ⚪ | IKKE | KAN | MÅ | MÅ | MÅ |
```

### Stack-kompatibilitet

```
PROSJEKT-STACK     FUNKSJON-STACK    KOMPATIBILITET
─────────────────────────────────────────────────────
vibekoding    +    🟢 VIBEKODING  →  ✓ Full kompatibel
vibekoding    +    🟣 HYBRID      →  ✓ Kompatibel
vibekoding    +    🔵 ENTERPRISE  →  ⚠ Advarsel - overkill
vibekoding    +    ⚪ AGNOSTISK   →  ✓ Full kompatibel

enterprise    +    🟢 VIBEKODING  →  ⚠ Advarsel - kanskje ikke nok
enterprise    +    🟣 HYBRID      →  ✓ Kompatibel
enterprise    +    🔵 ENTERPRISE  →  ✓ Full kompatibel
enterprise    +    ⚪ AGNOSTISK   →  ✓ Full kompatibel
```

---

## ZONE-KLASSIFISERING AV OPPGAVER

### Kompleksitet vs Zone mapping

Zone-klassifisering er basert på **Complexity Score** fra `protocol-TASK-COMPLEXITY-ASSESSMENT.md`:

| Complexity Score | Anbefalt Zone | Kjennetegn |
|------------------|---------------|-----------|
| **0-2 poeng** | 🟢 GREEN | Lav risiko, etablerte mønstre, reversibel |
| **3-5 poeng** | 🟡 YELLOW | Moderat risiko, krever domene-kunnskap, noe review |
| **6-10 poeng** | 🔴 RED | Høy risiko, sensitiv data, kritisk sikkerhet |

### Automatisk klassifisering

AI skal klassifisere oppgaver basert på disse reglene:

```javascript
function classifyZone(task, complexityScore = null) {
  // PRIORITET 1: RED ZONE triggers (sikkerhet/data/compliance)
  if (task.involves(['authentication', 'authorization', 'payment',
                     'pii', 'encryption', 'secrets', 'production-data',
                     'compliance', 'legal', 'sensitive-data'])) {
    return '🔴 RED';
  }

  // PRIORITET 2: Complexity Score hvis tilgjengelig
  if (complexityScore !== null) {
    if (complexityScore >= 6) {
      return '🔴 RED';
    } else if (complexityScore >= 3) {
      return '🟡 YELLOW';
    } else {
      return '🟢 GREEN';
    }
  }

  // PRIORITET 3: YELLOW ZONE triggers (integrasjon/business-logikk)
  if (task.involves(['api', 'database', 'external-integration',
                     'state-management', 'business-logic', 'deployment',
                     'configuration', 'third-party-api'])) {
    return '🟡 YELLOW';
  }

  // PRIORITET 4: GREEN ZONE (standard CRUD, UI, docs, tests)
  if (task.involves(['ui-component', 'styling', 'documentation',
                     'comments', 'readme', 'configuration-files',
                     'simple-crud', 'basic-tests'])) {
    return '🟢 GREEN';
  }

  // DEFAULT: GREEN ZONE
  return '🟢 GREEN';
}
```

### Klassifisering med eksempler

#### 🟢 GREEN ZONE EKSEMPLER

**Eksempel 1: Lag Button-komponent**
```
Complexity Score: 0/10
Triggers: UI component, no API, no state
Zone: 🟢 GREEN
AI: Implementer fullstendig selvstendig
```

**Eksempel 2: Skriv README for prosjekt**
```
Complexity Score: 0/10
Triggers: Documentation, no code logic
Zone: 🟢 GREEN
AI: Skriv og publiser uten review
```

**Eksempel 3: Legg til input validation på form**
```
Complexity Score: 1/10
Triggers: Basic validation, client-side only
Zone: 🟢 GREEN
AI: Implementer og test
```

**Eksempel 4: Lag enkel data-formatter utility**
```
Complexity Score: 1/10
Triggers: Pure function, no side effects
Zone: 🟢 GREEN
AI: Skriv funksjon + tester
```

#### 🟡 YELLOW ZONE EKSEMPLER

**Eksempel 1: Lag contact form med API**
```
Complexity Score: 4/10
Factors:
├─ Security: 1 (input validation)
├─ Integration: 1 (single API call)
├─ State: 1 (local form state)
└─ Testing: 1 (API mocking)
Zone: 🟡 YELLOW
AI: Implementer + markér for review
Menneske: Peer review før merge
```

**Eksempel 2: Designé database schema for produkter**
```
Complexity Score: 4/10
Factors:
├─ Security: 0 (no sensitive data)
├─ Integration: 2 (multiple tables, relationships)
├─ State: 1 (persistent state)
└─ Testing: 1 (schema validation)
Zone: 🟡 YELLOW
AI: Foreslå design + implementer
Menneske: Review data-modell før produksjon
```

**Eksempel 3: Integrer med tredjeparts API (Stripe)**
```
Complexity Score: 5/10
Factors:
├─ Security: 1 (API keys in env)
├─ Integration: 3 (complex API orchestration)
├─ State: 1 (local state)
└─ Testing: 0 (API stubs/mocks)
Zone: 🟡 YELLOW
AI: Implementer med error handling
Menneske: Senior review av API-integrasjon
```

**Eksempel 4: Implementer global state management**
```
Complexity Score: 5/10
Factors:
├─ Security: 0 (no sensitive data)
├─ Integration: 1 (Redux actions)
├─ State: 2 (global state + async)
└─ Testing: 2 (complex setup)
Zone: 🟡 YELLOW
AI: Implementer Redux struktur
Menneske: Review state-flyt og tester
```

#### 🔴 RED ZONE EKSEMPLER

**Eksempel 1: Implementer login/auth flow**
```
Complexity Score: 8/10
Factors:
├─ Security: 2 (JWT tokens, session)
├─ Integration: 2 (auth API + refresh)
├─ State: 2 (global auth state)
└─ Testing: 2 (mock auth, test routes)
Zone: 🔴 RED
AI: Analyse + anbefaling + generate boilerplate
Menneske: Implementerer + security review
```

**Eksempel 2: Betaling med Stripe**
```
Complexity Score: 10/10
Factors:
├─ Security: 3 (PCI-DSS, payment data)
├─ Integration: 3 (Stripe API + webhooks)
├─ State: 2 (cart + transaction state)
└─ Testing: 2 (payment mocking)
Zone: 🔴 RED
AI: STOPP - Vent på menneske
Menneske: Leder implementering + compliance review
```

**Eksempel 3: Endring av produksjons-database**
```
Complexity Score: 9/10
Factors:
├─ Security: 3 (data loss risk)
├─ Integration: 2 (production system)
├─ State: 1 (persistent data)
└─ Testing: 2 (must test backup/restore)
Zone: 🔴 RED
AI: Analyse + migration script
Menneske: Godkjenner + kjører migration
```

**Eksempel 4: GDPR compliance implementering**
```
Complexity Score: 9/10
Factors:
├─ Security: 3 (legal implications)
├─ Integration: 2 (multiple systems)
├─ State: 1 (user data)
└─ Testing: 2 (audit trail)
Zone: 🔴 RED
AI: Analyse + dokumenter krav
Menneske: Juridisk review + implementering
```

### Manual override

Bruker kan alltid override zone-klassifisering:

```markdown
Bruker: "Behandle denne oppgaven som YELLOW"

AI: "Forstått. Oppgaven er nå klassifisert som 🟡 YELLOW.
     Jeg vil:
     - Utføre implementering
     - Markere for review før merge
     - Vente på din godkjenning"
```

---

## ZONE-KOMBINASJONER MED INTENSITET

### Matrise: Hva gjøres når zone møter intensity level?

| Zone | MINIMAL | FORENKLET | STANDARD | GRUNDIG | ENTERPRISE |
|------|---------|-----------|----------|---------|------------|
| 🟢 GREEN | Auto | Auto | Auto | Auto + log | Auto + audit |
| 🟡 YELLOW | Oppgradert til GREEN* | Self-review | Peer review | Senior review | Multi-review |
| 🔴 RED | Human-led** | Human-led** | Human + AI | Human + AI + review | Human + AI + audit + approval |

*YELLOW + MINIMAL: Oppgraderes automatisk til FORENKLET (AI kan ikke håndtere YELLOW med kun MINIMAL)
**RED + MINIMAL/FORENKLET: Humans leder, AI assisterer med analyse og forslag

### Detalj-mapping per intensitet

#### GREEN ZONE med ulike intensiteter

```
🟢 GREEN + MINIMAL
├─ AI: Utfører oppgaven fullstendig
├─ Logging: Minimal (kun task completion)
└─ Resultat: Deploy direkte

🟢 GREEN + FORENKLET
├─ AI: Utfører + informerer bruker om valg
├─ Logging: Task + approach
└─ Resultat: Deploy med notifikasjon

🟢 GREEN + STANDARD
├─ AI: Utfører + forklarer
├─ Logging: Full task log
└─ Resultat: Deploy + document

🟢 GREEN + GRUNDIG
├─ AI: Utfører + forklarer + auditt-spor
├─ Logging: Detaljert audit trail
└─ Resultat: Deploy + audit log

🟢 GREEN + ENTERPRISE
├─ AI: Utfører + compliance-logging
├─ Logging: Full audit trail + compliance
└─ Resultat: Deploy + compliance cert
```

#### YELLOW ZONE med ulike intensiteter

```
🟡 YELLOW + MINIMAL
├─ OPPGRADERING: Automatisk til FORENKLET
├─ Årsak: MINIMAL kan ikke håndtere YELLOW krav
└─ AI: Varsler bruker om oppgradering

🟡 YELLOW + FORENKLET
├─ AI: Implementer + self-review
├─ Review: AI selv (self-review)
├─ Logging: Task + review notat
└─ Resultat: Merge hvis alle OK

🟡 YELLOW + STANDARD
├─ AI: Implementer + marked for review
├─ Review: Peer review (annen AI/menneske)
├─ Logging: Full task + review log
└─ Resultat: Merge etter peer OK

🟡 YELLOW + GRUNDIG
├─ AI: Implementer + marked for review
├─ Review: Senior review
├─ Logging: Detaljert med rationale
└─ Resultat: Merge etter senior OK

🟡 YELLOW + ENTERPRISE
├─ AI: Implementer + multi-review
├─ Review: Senior + compliance review
├─ Logging: Audit trail + approval chain
└─ Resultat: Merge etter multi-approval
```

#### RED ZONE med ulike intensiteter

```
🔴 RED + MINIMAL
├─ STOPP: Ikke AI-autonomous
├─ Menneske: Leder oppgaven
├─ AI: Assisterer med analyse
└─ Review: Menneske bestemmer

🔴 RED + FORENKLET
├─ STOPP: Ikke AI-autonomous
├─ Menneske: Leder oppgaven
├─ AI: Foreslår + analyserer
└─ Review: Menneske bestemmer

🔴 RED + STANDARD
├─ AI: Analysér + foreslå + test-scaffold
├─ Menneske: Implementerer
├─ Review: Human review
└─ Resultat: Merge etter human approval

🔴 RED + GRUNDIG
├─ AI: Analysér + foreslå + test + doc
├─ Menneske: Implementerer
├─ Review: Human + security review
└─ Resultat: Merge etter multi-review approval

🔴 RED + ENTERPRISE
├─ AI: Analysér + foreslå + test + doc + audit
├─ Menneske: Implementerer
├─ Review: Human + security + compliance + audit
└─ Resultat: Merge etter full approval chain
```

---

## LOGGING AV ZONE-BESLUTNINGER

### Format

```
[TIMESTAMP] [AGENT-ID] [ZONE] Task classified
{
  "task": "[oppgave-navn]",
  "zone": "GREEN|YELLOW|RED",
  "reason": "[begrunnelse]",
  "triggers": ["[trigger1]", "[trigger2]"],
  "override": null | "[bruker-override]"
}
```

### Eksempel

```
[2026-02-05T10:30:00Z] [BYGGER] [ZONE] Task classified
{
  "task": "Implement user authentication",
  "zone": "RED",
  "reason": "Involves authentication and user credentials",
  "triggers": ["authentication", "credentials", "security"],
  "override": null
}
```

---

## GUARDRAILS PER ZONE

### 🟢 GREEN ZONE REGLER

#### ✅ ALLTID
- Klassifiser oppgave før start
- Utfør oppgaven fullstendig selvstendig
- Velg implementeringsdetaljer
- Legg til tester og dokumentasjon
- Logg task completion

#### ❌ ALDRI
- Endre arkitektur-beslutninger
- Introdusere nye dependencies uten grunn
- Endre konfigurasjons-filer uten forvarsel
- Hopp over testing
- Deploy til produksjon uten notifikasjon

#### ⏸️ SPØR BRUKER
- Hvis du er usikker på klassifiseringen
- Hvis oppgaven har sensitiv data (oppgrader til YELLOW)
- Hvis oppgaven involverer sikkerhetskritiske systemer

---

### 🟡 YELLOW ZONE REGLER

#### ✅ ALLTID
- Klassifiser oppgave før start
- Implementer oppgaven
- Dokumenter dine valg og antagelser
- Markér for review (unntatt MINIMAL som oppgraderes)
- Følg review-krav for valgt intensitetsnivå
- Test implementeringen
- Vent på godkjenning før merge (over MINIMAL)

#### ❌ ALDRI
- Merge uten review (unntatt oppgradert MINIMAL → FORENKLET)
- Endre API-kontrakter uten godkjenning
- Deploye til produksjon uten godkjenning
- Ignorer risiko-advarsler
- Håndter sensitiv data direkte

#### ⏸️ SPØR BRUKER
- Hvis oppgaven involverer sensitiv data (oppgrader til RED)
- Hvis oppgaven er sikkerhetskritisk (oppgrader til RED)
- Hvis oppgaven har høyere kompleksitet enn 5
- Ved usikkerhet i klassifiseringen
- Ved grensetilfeller mellom YELLOW og RED

---

### 🔴 RED ZONE REGLER

#### ✅ ALLTID
- STOPP før implementering
- Analysér oppgaven grundig
- Generer dokumentasjon av krav
- Lag test-scaffolding og eksempler
- Presentér forslag til menneske
- Vent på eksplisitt bruker-godkjenning
- Logg alle beslutninger og godkjenninger
- Dokumenter sikkerhetskonsekvenser

#### ❌ ALDRI
- Implementer selvstendig
- Endre produksjonsdata
- Håndter secrets eller credentials direkte
- Gjør compliance-beslutninger
- Merge uten human-godkjenning (unntatt STANDARD+)
- Ignorer sikkerhets- eller compliance-krav
- Skjul risiko-faktorer

#### ⏸️ SPØR BRUKER
- ALLTID ved RED zone oppgave
- Før hver implementerings-fase
- Ved usikkerhet om sikkerhetskonsekvenser
- Hvis nye risikoer oppdages
- Ved behov for design-review

---

### GENERISKE GUARDRAILS

#### ✅ ALLTID (Alle zoner)
- Klassifiser oppgave før start
- Respekter zone-regler
- Logg zone-beslutninger med begrunnelse
- Følg review-krav for zone + intensitet
- Dokumenter valg tatt
- Test implementeringen passende for zone
- Rapport status til bruker

#### ❌ ALDRI (Alle zoner)
- Ignorer zone-klassifisering
- Merge/deploy uten nødvendig review
- Override zone uten bruker-bekreftelse
- Skip logging for zone-endringer
- Håndter sensitiv data uforvarsomt
- Gjør sikkerhetskritiske valg uten menneske

#### ⏸️ SPØR BRUKER (Alle zoner)
- Ved usikker klassifisering
- Ved grensetilfeller
- Ved zone-oppgradering
- Hvis kompleksitet høyere enn forventet
- Hvis nye risikoer oppdages
- Ved unormale eller uventede funn

---

## COMPLEXITY SCORE → ZONE MAPPING (DETALJERT)

### Kompleksitet 0-2: 🟢 GREEN ZONE

**Karakteristikk:**
- Enkel oppgave
- Etablerte mønstre
- Lav risiko
- Reverserbare handlinger
- Ingen sensitiv data

**Eksempler:**
- UI komponenter (buttons, cards, inputs)
- Utility funktioner (formatters, validators)
- Dokumentasjon (README, API docs)
- Enkle tester
- Styling og layout

**AI Autonomi:**
- ✓ Implementer fullstendig selvstendig
- ✓ Velg implementeringsdetaljer
- ✓ Deploy direkte (med notifikasjon)

---

### Kompleksitet 3-5: 🟡 YELLOW ZONE

**Karakteristikk:**
- Moderat oppgave
- Krever domenekunnskap
- Business-logikk involvert
- Noen integrasjonspunkter
- Påvirker andre komponenter

**Eksempler:**
- API-endepunkter (GET, POST, PUT)
- Database-queries og data-modeller
- State management (global state)
- Tredjepartsintegrasjoner
- Enkel autentisering

**AI Autonomi:**
- ✓ Implementer + test
- ○ Markér for review (avhengig av intensitet)
- ✓ Vent på godkjenning før merge (over MINIMAL)
- ✓ Dokumenter beslutninger

---

### Kompleksitet 6-10: 🔴 RED ZONE

**Karakteristikk:**
- Kompleks oppgave
- Høy risiko
- Sensitiv data (PII, betalinger, helseinformasjon)
- Sikkerhetskritisk
- Compliance/juridisk påvirkning
- Irreversible konsekvenser ved feil

**Eksempler:**
- Autentisering og autorisasjon
- Betalingsintegrasjon (Stripe, etc.)
- GDPR/HIPAA/PCI-DSS compliance
- Produksjons-database endringer
- Secrets og kryptering
- Infrastruktur-endringer

**AI Autonomi:**
- ✓ Analysér + foreslå
- ✓ Dokumenter krav
- ✓ Generer boilerplate + tester
- ✗ Implementer selvstendig
- ✗ Endre produksjonsdata
- ✗ Håndter secrets direkte

---

## QUICK REFERENCE: ZONE CLASSIFICATION FLOWCHART

```
START: Ny oppgave
    │
    ├─ SPØRSMÅL 1: Involverer sensitiv data?
    │   ├─ JA (PII, payment, health data) → 🔴 RED ZONE
    │   └─ NEI → Gå til Spørsmål 2
    │
    ├─ SPØRSMÅL 2: Involverer sikkerhet?
    │   ├─ JA (auth, crypto, secrets) → 🔴 RED ZONE
    │   └─ NEI → Gå til Spørsmål 3
    │
    ├─ SPØRSMÅL 3: Compliance/juridisk påvirkning?
    │   ├─ JA (GDPR, HIPAA, PCI) → 🔴 RED ZONE
    │   └─ NEI → Gå til Spørsmål 4
    │
    ├─ SPØRSMÅL 4: Kjenn complexity score (fra protocol)?
    │   ├─ JA, score 6-10 → 🔴 RED ZONE
    │   ├─ JA, score 3-5 → 🟡 YELLOW ZONE
    │   ├─ JA, score 0-2 → 🟢 GREEN ZONE
    │   └─ NEI → Gå til Spørsmål 5
    │
    ├─ SPØRSMÅL 5: Involverer API/database/integrasjon?
    │   ├─ JA → 🟡 YELLOW ZONE
    │   └─ NEI → Gå til Spørsmål 6
    │
    └─ SPØRSMÅL 6: Enkle UI, docs, utilities?
        ├─ JA → 🟢 GREEN ZONE
        └─ USIKKER → SPØR BRUKER
```

---

## PRAKTISKE SCENARIOER

### Scenario 1: Feature implementation (Gronn -> Gul -> Rod)

```
BRUKER: "Lag en login-side med email/password"

AI (PLANLEGGER): GREEN ZONE — AUTOMATISK
  Genererer PRD med auth flow
  Lister opp tasks
  Oppdaterer PROJECT-STATE

AI (BYGGER): GREEN ZONE — AUTOMATISK
  Genererer login.tsx (150 linjer)
  Genererer auth.ts med bcrypt
  Genererer unit tests

AI (CODE-QUALITY-GATE): GREEN ZONE — AUTOMATISK
  Kjører security scan
  Resultat: 0 critical, 1 medium (rate limiting missing)
  Status: PASSED (medium er OK)

AI (BYGGER): YELLOW ZONE — ANNOUNCE AND PROCEED
  "Jeg har IKKE implementert rate limiting ennå.
   Dette er BOR-oppgave for STANDARD-nivå.
   Implementerer det nå."
  (Bruker kan avbryte og velge å skippe.)

AI (REVIEWER): GREEN ZONE — AUTOMATISK
  Code review: Good practices
  Suggestion: Add password strength meter

AI (til bruker): "Koden er klar for testing."

BRUKER: "Deploy til prod"

AI (PUBLISERINGS-agent): RED ZONE — OBLIGATORISK GODKJENNING
  "Klar til production deployment.

   Readiness Check:
   - Security scan: PASSED
   - Test coverage: 85%
   - Rate limiting: Implemented
   - All MAA-tasks: Completed

   Type 'deploy' for å bekrefte."

BRUKER: "deploy"

AI: FORTSETTER
  Deployer til prod
```

### Scenario 2: Security issue blocking (Rod sone)

```
BRUKER: "Lag payment processing med Stripe"

AI (BYGGER): GREEN ZONE — AUTOMATISK
  Genererer stripe-integration.ts

AI (CODE-QUALITY-GATE): RED ZONE — BLOKKERER
  "CRITICAL SECURITY ISSUE FOUND

   Hard-coded Stripe secret key i koden:
   stripe-integration.ts:12

   const stripeKey = 'sk_live_abc123...'

   Secret keys skal ALDRI være i kode.

   JEG KAN IKKE FORTSETTE før du:
   1. Flytter key til .env file
   2. Legger .env i .gitignore
   3. Bruker process.env.STRIPE_SECRET_KEY

   Type 'fixed' når du har fikset dette."

BRUKER: [fikser manuelt eller ber AI fikse]
BRUKER: "fixed"

AI (CODE-QUALITY-GATE): GREEN ZONE — RESCANNER
  Kjører scan på nytt
  "No more hard-coded secrets. Continuing..."
```

---

## VERSJONSKONTROLL

| Felt | Verdi |
|------|-------|
| Versjon | 3.0.0 |
| Opprettet | 2026-02-05 |
| Sist oppdatert | 2026-02-23 |
| Endringer | v3.0: Integrert innhold fra HUMAN-IN-THE-LOOP-PROTOCOL.md (nå DEPRECATED). Lagt til OPERASJONSKATEGORIER-seksjon med detaljerte operasjoner per zone. Lagt til PRAKTISKE SCENARIOER. Erstattet "10s countdown" med "Announce and Proceed"-mønster i YELLOW zone. Oppdatert autonomi-regler for YELLOW zone. |

---

*Relatert:*
- `KLASSIFISERING-METADATA-SYSTEM.md` - Oppgave-klassifisering
- `../agenter/system/doc-INTENSITY-MATRIX.md` - Intensitetsnivåer
- `../agenter/system/protocol-TASK-COMPLEXITY-ASSESSMENT.md` - Kompleksitets-vurdering
- `../agenter/system/protocol-CODE-QUALITY-GATES.md` - Review-krav
- `HUMAN-IN-THE-LOOP-PROTOCOL.md` - **DEPRECATED** — Alt innhold er integrert i dette dokumentet (v3.0)

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
