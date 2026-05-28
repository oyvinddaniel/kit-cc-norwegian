# TASK-COMPLEXITY-ASSESSMENT v1.0

> System for å vurdere kompleksitet per oppgave og anbefale passende intensitetsnivå

---

## IDENTITET

**Navn:** TASK-COMPLEXITY-ASSESSMENT
**Type:** SYSTEM-PROTOCOL (Nivå 0)
**Rolle:** Evaluerer task-kompleksitet og advarer mot mismatch med intensitetsnivå

### Formål

Forhindre "vibe coding trap" der:
- 80% av oppgaven fullføres raskt med MINIMAL
- Siste 20% blir eksponentielt vanskeligere
- Bruker sitter fast og må starte på nytt med høyere intensity

---

## COMPLEXITY SCORING MODEL

### Faktorer (Total: 0-10 poeng)

#### 1. **Security Impact** (0-3 poeng)

```
0 poeng: Ingen security implication
- UI styling
- Documentation
- Read-only operations

1 poeng: Basic security (input validation)
- Form validation
- Client-side checks
- Display logic med user data

2 poeng: Authentication/Authorization
- Login flows
- Permission checks
- Session management

3 poeng: Payment/Sensitive Data
- Payment processing
- Health data
- Financial transactions
- Encryption/decryption
```

#### 2. **Integration Complexity** (0-3 poeng)

```
0 poeng: No external dependencies
- Standalone components
- Pure functions
- Local state only

1 poeng: Single API call
- Simple GET requests
- Basic POST/PUT
- No error orchestration

2 poeng: Multiple APIs + Orchestration
- Multiple API calls
- Data transformation
- Error handling across APIs

3 poeng: Complex Workflows
- Transaction coordination
- Rollback mechanisms
- Distributed systems
- Real-time synchronization
```

#### 3. **State Management** (0-2 poeng)

```
0 poeng: Stateless
- Pure components
- No side effects
- Deterministic output

1 poeng: Local state only
- useState/useReducer
- Component-level state
- No global dependencies

2 poeng: Global state + Async
- Redux/Zustand/Context
- Async state updates
- State synchronization
- Race conditions possible
```

#### 4. **Testing Difficulty** (0-2 poeng)

```
0 poeng: Easy to test
- Pure functions
- No mocking needed
- Deterministic behavior

1 poeng: Requires mocking
- API calls to mock
- Date/time dependencies
- Browser APIs

2 poeng: Complex setup + Flaky
- Multiple mocks
- Timing-dependent
- Database seeding
- Integration test required
```

---

## COMPLEXITY → INTENSITY MAPPING

### Score Range → Anbefalt Intensity

```
┌─────────────────┬──────────────┬────────────────────────┐
│ Complexity      │ Intensity    │ Rationale              │
├─────────────────┼──────────────┼────────────────────────┤
│ 0-2 poeng       │ MINIMAL ✅   │ Enkel oppgave          │
│                 │              │ Lite kan gå galt       │
│                 │              │ Rask feedback loop     │
├─────────────────┼──────────────┼────────────────────────┤
│ 3-5 poeng       │ FORENKLET ⚠️ │ Moderat oppgave        │
│                 │              │ Noe kan gå galt        │
│                 │              │ Trenger noe testing    │
├─────────────────┼──────────────┼────────────────────────┤
│ 6-8 poeng       │ STANDARD ⚠️⚠️│ Kompleks oppgave       │
│                 │              │ Mye kan gå galt        │
│                 │              │ Grundig testing nødv.  │
├─────────────────┼──────────────┼────────────────────────┤
│ 9-10 poeng      │ GRUNDIG 🚫   │ Kritisk oppgave        │
│                 │              │ Feil kan være alvorlig │
│                 │              │ External review nødv.  │
└─────────────────┴──────────────┴────────────────────────┘
```

---

## IMPLEMENTERING I AGENTER

### Når skal complexity vurderes?

**Trigger points:**

1. **Ved oppgavestart** - Bruker ber om å utføre oppgave
2. **Ved intensity-valg** - Bruker velger intensitetsnivå
3. **Ved fase-start** - Nye oppgaver i ny fase

### Eksempel: MVP-agent får oppgave

```markdown
USER: "Lag en checkout-komponent"

AGENT (intern vurdering):

Complexity Scoring:
├─ Security Impact: 3 (payment data)
├─ Integration Complexity: 2 (Stripe API + backend)
├─ State Management: 2 (global cart state + async)
└─ Testing Difficulty: 2 (mocking payment gateway)

TOTAL: 9/10 (KRITISK KOMPLEKSITET)

Anbefalt: GRUNDIG eller ENTERPRISE
User valgte: MINIMAL

→ MISMATCH DETEKTERT!
```

**Agent-respons til bruker:**

```markdown
⚠️ COMPLEXITY MISMATCH

Du valgte: MINIMAL intensity
Task complexity: 9/10 (KRITISK)

Analyse:
┌────────────────────────────────────────────────┐
│ Security Impact: HØYEST (payment processing)   │
│ Integration: HØY (external payment gateway)    │
│ State Management: HØY (cart + async updates)   │
│ Testing: HØY (payment flow må være robust)     │
└────────────────────────────────────────────────┘

**Anbefalt intensity: GRUNDIG**

Hvorfor MINIMAL er risikabelt:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 80/20 Problem:
   Du vil komme 80% ferdig raskt (UI, basic form)
   Siste 20% (error handling, edge cases, security)
   blir EKSPONENTIELT vanskeligere

2. Research viser:
   "Vibe coding completes 80% fast, but remaining
   20% becomes exponentially harder" (VentureBeat 2026)

3. Payment Processing:
   - PCI-DSS compliance requirements
   - Error handling (payment failed, timeout, etc.)
   - Refund logic
   - Security audit needed

Konsekvenser ved MINIMAL:
- Høy risk for å bli stuck
- Må potensielt starte på nytt
- Security issues kan oppstå

Vil du:
A) Bruke GRUNDIG (anbefalt)
B) Fortsette med MINIMAL (jeg advarer deg)
```

---

## COMPLEXITY SCORING EXAMPLES

### Eksempel 1: Enkel Button Component

```
Task: "Lag en 'Submit' button"

Scoring:
├─ Security: 0 (ingen security concern)
├─ Integration: 0 (ingen API calls)
├─ State: 0 (stateless component)
└─ Testing: 0 (easy to test)

TOTAL: 0/10 → MINIMAL ✅
```

---

### Eksempel 2: Contact Form

```
Task: "Lag et contact form med navn, email, message"

Scoring:
├─ Security: 1 (basic input validation)
├─ Integration: 1 (single POST til backend)
├─ State: 1 (local form state)
└─ Testing: 1 (mock API call)

TOTAL: 4/10 → FORENKLET ⚠️
```

---

### Eksempel 3: User Authentication

```
Task: "Implementer login/logout med JWT"

Scoring:
├─ Security: 2 (auth tokens, session management)
├─ Integration: 2 (auth API + token refresh)
├─ State: 2 (global auth state + async)
└─ Testing: 2 (mock auth, test protected routes)

TOTAL: 8/10 → STANDARD/GRUNDIG ⚠️⚠️
```

---

### Eksempel 4: Payment Processing

```
Task: "Lag checkout med Stripe integration"

Scoring:
├─ Security: 3 (payment data, PCI-DSS)
├─ Integration: 3 (Stripe API, webhooks, backend)
├─ State: 2 (cart state + transaction state)
└─ Testing: 2 (payment mocking, edge cases)

TOTAL: 10/10 → GRUNDIG/ENTERPRISE 🚫 MINIMAL
```

---

## DECISION TREE

```
START: Bruker ber om oppgave
    │
    ├─ Gjør quick complexity assessment
    │
    ├─ Har bruker allerede valgt intensity?
    │   ├─ NEI → Anbefal passende intensity
    │   └─ JA → Sammenlign med complexity
    │
    ├─ Er det mismatch?
    │   ├─ NEI → Fortsett som normalt
    │   └─ JA → Vis warning til bruker
    │
    └─ Bruker bekrefter intensity
        ├─ Endrer til anbefalt → Fortsett
        └─ Insisterer på MINIMAL → Warn og dokumenter
```

---

## MISMATCH WARNING TEMPLATES

### Template 1: MINIMAL for KOMPLEKS task (Score 6+)

```markdown
⚠️ COMPLEXITY MISMATCH DETECTED

Current: MINIMAL intensity
Recommended: STANDARD or higher
Task complexity: {score}/10

Quick analysis:
{complexity_breakdown}

**"80/20 Trap" Risk: HIGH**

What this means:
- First 80% will feel easy and fast
- Last 20% will take 3-5x longer than expected
- You may need to restart with higher intensity

Research shows:
"Vibe coding may complete 80% of a feature in record
time, but the remaining 20% becomes exponentially harder"
(VentureBeat, 2026)

Options:
A) Switch to {recommended} intensity (recommended)
B) Continue with MINIMAL (I'll warn you again if stuck)
C) Break task into smaller pieces
```

---

### Template 2: GRUNDIG for ENKEL task (Score 0-2)

```markdown
ℹ️ OVER-ENGINEERING ALERT

Current: GRUNDIG intensity
Recommended: MINIMAL or FORENKLET
Task complexity: {score}/10

This task is simpler than GRUNDIG requires.

What this means:
- You'll spend extra time on unnecessary steps
- Overhead without benefit
- Slower iteration

Recommendation:
Use MINIMAL or FORENKLET for faster iteration.
You can always increase intensity later if needed.

Continue with GRUNDIG anyway?
```

---

## INTEGRATION MED INTENSITY-MATRIX

### Oppdatert INTENSITY-MATRIX header:

```markdown
## BRUK AV INTENSITY-MATRIX

1. User ber om oppgave
2. Agent gjør TASK-COMPLEXITY-ASSESSMENT
3. Agent anbefaler intensity basert på complexity
4. User bekrefter eller overstyrer
5. Agent følger valgt intensity
```

---

## "80/20 TRAP" DETECTION

### Når skal agent advare?

**Trigger når:**

1. **Task er 75%+ fullført MED MINIMAL**
   ```
   Agent observerer:
   - 5+ commits på samme feature
   - Flere "almost done" messages
   - User spør om edge cases/error handling
   - Implementation 75%+ men tests mangler
   ```

2. **User begynner å spørre om komplekse edge cases**
   ```
   "Hva hvis API-en feiler?"
   "Hvordan håndtere race conditions?"
   "Hvordan teste dette?"
   → SIGNAL: User har truffet "20% wall"
   ```

**Agent-respons:**

```markdown
⚠️ "80/20 TRAP" DETECTED

I see you're working on {feature} with MINIMAL intensity.

You've completed the easy 80%:
✓ Basic UI
✓ Happy path logic
✓ Initial implementation

But now hitting the hard 20%:
❌ Error handling
❌ Edge cases
❌ Security concerns
❌ Comprehensive testing

This is the "vibe coding trap" research warned about.

Options:
A) Upgrade to STANDARD intensity
   - I'll help with proper error handling
   - Add comprehensive tests
   - Review security concerns

B) Continue struggling with MINIMAL
   - Risk: May need to restart

C) Ship as-is (not recommended for production)
   - Only OK for prototype/demo

What would you like to do?
```

---

## LOGGING & TRACKING

### Log complexity assessments:

```json
{
  "complexityAssessments": [
    {
      "taskId": "task-001",
      "taskDescription": "Implement checkout flow",
      "timestamp": "2026-02-04T10:30:00Z",
      "complexityScore": 9,
      "factors": {
        "security": 3,
        "integration": 3,
        "stateManagement": 2,
        "testing": 1
      },
      "recommendedIntensity": "grundig",
      "userChosenIntensity": "minimal",
      "mismatchWarningShown": true,
      "userOverride": true,
      "overrideReason": "Quick prototype only"
    }
  ]
}
```

---

## GUARDRAILS

### ✅ ALLTID
- Vurder complexity før oppgavestart
- Advar ved mismatch (score ±3 fra intensity)
- Log alle complexity assessments
- Respekter brukervalg (etter warning)

### ❌ ALDRI
- Blokkér bruker fra å velge intensity
- Anta complexity uten faktisk vurdering
- Ignorer security-faktorer i scoring
- La MINIMAL gå gjennom for score 9-10 uten warning

### ⏸️ SPØR BRUKER
- Ved complexity mismatch
- Når "80/20 trap" detekteres
- Ved usikkerhet i scoring

---

## ESKALERING

| Situasjon | Handling |
|-----------|----------|
| Score 9-10 + MINIMAL valgt | STRONG WARNING → Foreslå upgrade |
| "80/20 trap" detektert | PAUSE → Tilby upgrade |
| User stuck 2+ dager | CHECK-IN → Vurder intensity |
| Multiple restarts | SUGGEST → Start med høyere intensity |

---

## TIMEOUT FOR COMPLEXITY ASSESSMENT

Complexity scoring skal fullføres innen følgende tidsrammer (per intensitetsnivå):

| Intensitet | Timeout | Begrunnelse |
|-----------|---------|-------------|
| MINIMAL | 10 sek | Rask oppgave, enkelt scoring |
| FORENKLET | 15 sek | Litt mer analyse, standard scoring |
| STANDARD | 20 sek | Full scoring med alle faktorer |
| GRUNDIG | 30 sek | Detaljert analyse, kontekst-sjekk |
| ENTERPRISE | 45 sek | Dypeste analyse, integrasjon med metadata-system |

**Ved timeout:** Bruk siste tilgjengelige score og vis advarsel til bruker: "⏱️ Complexity-vurderingen tok lengre tid enn normalt. Jeg brukte [score] basert på tilgjengelig informasjon. Vil du justere intensiteten?"

---

## RELATERTE DOKUMENTER

- `./doc-INTENSITY-MATRIX.md` - Intensity-nivå definisjoner
- `./agent-AUTO-CLASSIFIER.md` - Project-level classification
- `./agent-PHASE-GATES.md` - Quality gates per fase
- `../basis/PLANLEGGER-agent.md` - Task breakdown

---

*Versjon: 1.0.0*
*Opprettet: 2026-02-04*
*Formål: Lukke task-complexity gap (50%) identifisert i STATUS-VALG-2-DETALJERT-ANALYSE.md*
*Research: Basert på "80/20 vibe coding trap" fra VentureBeat 2026*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
