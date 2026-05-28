# TASK-CLASSIFICATION v1.1.0

> **SSOT for oppgave→sone-mapping.** Hvilken sone hører en konkret oppgave hjemme i?
> **Agent-fasit:** Se `Agenter/VERSION.json` for autoritativ agent-telling.

## Rolleavgrensning (v1.1.0 — 2026-04-22)

| Dokument | Rolle | SSOT for |
|----------|-------|----------|
| **TASK-CLASSIFICATION.md** (denne) | *Hvilken sone?* | Oppgave-eksempler pr sone, decision tree, validation checklists |
| **ZONE-AUTONOMY-GUIDE.md** | *Hva får AI gjøre?* | Autonomi-regler pr sone, operasjonskategorier, stack-indikatorer, eskalering |

De to filene er **komplementære**: Bruk TASK-CLASSIFICATION til å avgjøre sone, bruk ZONE-AUTONOMY-GUIDE til å avgjøre hva AI-en har lov til deretter. Sonedefinisjonene (grønn/gul/rød) er deklarert i ZONE-AUTONOMY-GUIDE — denne filen peker dit for prinsipper og gjentar bare det som er nødvendig for oppgavemappingen.

---

## IDENTITET

**Navn:** TASK-CLASSIFICATION
**Type:** KLASSIFISERING-SYSTEM
**Rolle:** Klassifisere oppgaver i Green/Yellow/Red zones basert på AI-egnethet og risk

### Formål

Gi konkrete oppgave-eksempler pr sone slik at agenter raskt kan klassifisere nye oppgaver. For autonomi-regler innenfor en sone, se `ZONE-AUTONOMY-GUIDE.md`.

**Research basis:**
- "45% av AI-generert kode inneholder security vulnerabilities" (Synergy Labs, 2026)
- "Green zone (presentation layer) ideal for vibe coding; red zone (business logic, data layers) requires oversight" (DronaHQ, 2026)

---

## DE TRE SONENE

```
┌────────────────────────────────────────────────────┐
│  🟢 GREEN ZONE - AI Autonomous                     │
│  ↓                                                  │
│  🟡 YELLOW ZONE - AI + Mandatory Human Review      │
│  ↓                                                  │
│  🔴 RED ZONE - Human-Led + AI Assistance           │
└────────────────────────────────────────────────────┘
```

---

## 🟢 GREEN ZONE: AI-Friendly Tasks

### Karakteristikk

```
✓ Lav security risk
✓ Klare acceptance criteria
✓ Lett å verifisere output
✓ Feil er lett å oppdage og fikse
✓ Ingen kritiske consequences
✓ Deterministisk behavior
```

### Eksempler

#### UI Components
- React/Vue/Svelte components
- CSS styling og layout
- Responsive design
- Icon integration
- Animation implementation

#### Documentation
- README files
- API documentation
- Code comments
- JSDoc/TypeDoc
- User guides

#### Testing
- Unit tests (pure functions)
- Component tests
- Test data generation
- Snapshot tests
- Visual regression tests

#### Basic CRUD
- Simple GET requests
- Display data in UI
- Basic form handling
- Local storage operations
- Sorting/filtering (client-side)

#### Code Quality
- Code formatting (Prettier)
- Linting fixes
- Dead code removal
- Import organization
- TypeScript type additions

### Prosedyre: AI Autonomous

```
1. AI implementerer task komplett
2. Automated checks (linting, tests, build)
3. Self-review ved AI
4. Merge hvis checks pass
```

**Human oversight:** Minimal - only reactive if issues arise

---

## 🟡 YELLOW ZONE: AI + Mandatory Review

### Karakteristikk

```
⚠️ Moderat security risk
⚠️ Krever domain knowledge
⚠️ Output må reviewes før merge
⚠️ Feil kan ha alvorlige consequences
⚠️ Ikke-trivielt å verifisere korrekthet
```

### Eksempler

#### API Design
- REST/GraphQL endpoint design
- Request/response schemas
- API versioning
- Rate limiting logic
- Pagination implementation

#### Business Logic
- Calculation logic
- Validation rules
- Business rule implementation
- Workflow orchestration
- State machine logic

#### Database Operations
- Database schema design
- Complex queries
- ORM relationships
- Indexing strategies
- Migration scripts

#### State Management
- Global state setup (Redux/Zustand)
- State synchronization
- Optimistic updates
- Cache invalidation
- WebSocket state handling

#### Performance
- Query optimization
- Caching strategies
- Bundle optimization
- Lazy loading
- Code splitting

#### Integration
- Third-party API integration
- Webhook handling
- Event-driven architecture
- Message queue setup
- File upload/download

### Prosedyre: AI with Mandatory Review

```
1. AI implementerer solution
2. AI runs automated tests
3. AI creates Pull Request

   ⏸️ PAUSE FOR REVIEW

4. Senior developer MUST review:
   ✓ Business logic correctness
   ✓ Edge case handling
   ✓ Error scenarios
   ✓ Performance implications

5. Automated tests MUST pass

6. Manual testing in staging

7. Approval required før merge
```

**Human oversight:** MANDATORY - proactive review before merge

---

## 🔴 RED ZONE: Human-Led Tasks

### Karakteristikk

```
🚫 Høy security risk
🚫 Regulatory requirements
🚫 Catastrophic failure possible
🚫 Krever expert judgment
🚫 Irreversible actions
🚫 Legal implications
```

### Eksempler

#### Security-Critical
- Authentication implementation
- Authorization logic
- Token generation/validation
- Password hashing
- Encryption/decryption
- Security headers
- CORS configuration
- Session management

#### Financial
- Payment processing
- Pricing calculations
- Invoice generation
- Refund logic
- Financial reporting
- Tax calculations
- Currency conversion (financial context)

#### Data Privacy
- PII (Personally Identifiable Information) handling
- GDPR compliance implementation
- Data anonymization
- Right to deletion
- Consent management
- Audit logging (sensitive data)

#### Production Operations
- Production deployments
- Database migrations (production)
- Rollback procedures
- Infrastructure changes
- Access control modifications
- Backup/restore operations

#### Compliance
- Regulatory reporting
- Audit trail implementation
- Compliance validation
- Legal document handling
- Terms of service updates

### Prosedyre: Human-Led with AI Assistance

```
1. HUMAN designs solution
   - Security review upfront
   - Threat modeling
   - Compliance check

2. AI assists with implementation
   - Boilerplate code
   - Standard patterns
   - Test generation

3. MULTIPLE human reviewers required:
   ✓ Senior developer
   ✓ Security expert
   ✓ Domain expert

4. Comprehensive testing:
   ✓ Unit tests
   ✓ Integration tests
   ✓ Security tests
   ✓ Manual penetration testing (for payment/auth)

5. External audit (for critical systems):
   ✓ Security audit
   ✓ Compliance audit
   ✓ Third-party review

6. Staged rollout:
   ✓ Deploy to staging
   ✓ Manual verification
   ✓ Deploy to production (canary/blue-green)
   ✓ Monitor closely

7. Post-deployment verification
```

**Human oversight:** CRITICAL - human leads, AI assists

---

## DECISION TREE

```
START: New task identified
    │
    ├─ Involves authentication/authorization?
    │   └─ YES → 🔴 RED ZONE
    │
    ├─ Handles payment/financial data?
    │   └─ YES → 🔴 RED ZONE
    │
    ├─ Processes PII/sensitive data?
    │   └─ YES → 🔴 RED ZONE
    │
    ├─ Production deployment/infrastructure?
    │   └─ YES → 🔴 RED ZONE
    │
    ├─ Contains business logic/calculations?
    │   └─ YES → 🟡 YELLOW ZONE
    │
    ├─ Involves database schema changes?
    │   └─ YES → 🟡 YELLOW ZONE
    │
    ├─ API endpoint design/modification?
    │   └─ YES → 🟡 YELLOW ZONE
    │
    ├─ Complex state management?
    │   └─ YES → 🟡 YELLOW ZONE
    │
    └─ UI/docs/tests/simple CRUD?
        └─ YES → 🟢 GREEN ZONE
```

---

## ZONE VALIDATION CHECKLIST

### 🟢 GREEN ZONE Checklist

```
Before allowing autonomous AI work, verify:

[ ] No authentication/authorization logic
[ ] No payment/financial data
[ ] No PII/sensitive data
[ ] No database schema changes
[ ] No complex business logic
[ ] No production deployment
[ ] Automated tests can verify correctness
[ ] Failure impact is low
[ ] Easy rollback if issues

If all ✓ → GREEN ZONE approved
```

---

### 🟡 YELLOW ZONE Checklist

```
Before review, AI must complete:

[ ] Implementation complete
[ ] Unit tests written and passing
[ ] Integration tests (if applicable)
[ ] Error handling implemented
[ ] Edge cases considered
[ ] Documentation updated
[ ] Pull request created

Human reviewer must verify:

[ ] Business logic correctness
[ ] Error scenarios handled
[ ] Edge cases covered
[ ] Performance acceptable
[ ] Security implications reviewed
[ ] No accidental RED ZONE elements

If all ✓ → Approve for merge
```

---

### 🔴 RED ZONE Checklist

```
Before implementation, human must:

[ ] Design reviewed by security expert
[ ] Threat model completed (if security-critical)
[ ] Compliance requirements identified
[ ] Architecture approved
[ ] Test strategy defined

During implementation:

[ ] Human leads implementation
[ ] AI assists with boilerplate only
[ ] Continuous security review
[ ] Multiple reviewers assigned

Before deployment:

[ ] Multiple human reviews complete
[ ] Security audit complete (for payment/auth)
[ ] Penetration testing complete (if applicable)
[ ] Compliance validation complete
[ ] Rollback plan documented
[ ] Monitoring/alerting setup
[ ] Staged rollout plan approved

If all ✓ → Approve for staged deployment
```

---

## INTEGRASJON MED AGENTER

### I hver agent: FUNKSJONS-MATRISE med Zone

**Eksempel (illustrerende; bruker EKS-prefiks for å unngå kollisjon med SSOT-IDer i `KLASSIFISERING-METADATA-SYSTEM.md`):**

| ID | Oppgave | Zone | Rationale |
|----|---------|------|-----------|
| EKS-MVP-01 | Git repo setup | 🟢 | Standard setup, low risk |
| EKS-MVP-02 | Secrets management | 🔴 | Security-critical |
| EKS-MVP-03 | React components | 🟢 | UI code, easy to verify |
| EKS-MVP-04 | API endpoints | 🟡 | Business logic, needs review |
| EKS-MVP-05 | Database schema | 🟡 | Can't easily undo in prod |
| EKS-MVP-06 | Auth implementation | 🔴 | Security-critical |

> **Merk:** Autoritative MVP-xx IDer eies av `KLASSIFISERING-METADATA-SYSTEM.md` (f.eks. MVP-02 = ".gitignore + .env.example", MVP-03 = "Secrets management"). Tabellen over er kun illustrerende sone-klassifisering — IKKE en erstatning for SSOT.

---

### I PHASE-GATES: Zone Verification

**FASE 4 (MVP Gate):**

```yaml
red_zone_verification:
  - "Auth implementation reviewed by security expert ✓"
  - "Secrets management verified by human ✓"
  - "No hardcoded credentials ✓"

yellow_zone_verification:
  - "API endpoints reviewed by senior dev ✓"
  - "Business logic has unit tests ✓"
  - "Database schema approved ✓"

green_zone_verification:
  - "Automated checks passed ✓"
  - "Build successful ✓"
```

---

## COMMON PITFALLS

### ❌ Pitfall 1: "It's just a small change"

```
WRONG:
"It's just changing the auth token expiry from 1h to 24h"
→ Treated as 🟢 GREEN ZONE

CORRECT:
Auth configuration = 🔴 RED ZONE
Even "small" changes need security review
```

### ❌ Pitfall 2: "AI wrote good tests"

```
WRONG:
AI wrote unit tests for payment logic
→ Approved without review

CORRECT:
Payment logic = 🔴 RED ZONE
Tests must be reviewed by humans
AI might miss critical edge cases
```

### ❌ Pitfall 3: "It's in a feature flag"

```
WRONG:
"Auth logic behind feature flag, so safe to auto-deploy"
→ Treated as 🟢 GREEN ZONE

CORRECT:
Feature flag doesn't reduce risk
Auth = 🔴 RED ZONE regardless of flag
```

### ❌ Pitfall 4: "We'll fix it later"

```
WRONG:
Deploy with known issues in 🔴 RED ZONE
"We'll patch it after launch"

CORRECT:
🔴 RED ZONE issues MUST be fixed before deployment
No exceptions for security/payment/data privacy
```

---

## EXAMPLES BY DOMAIN

### E-Commerce Application

```
🟢 GREEN ZONE:
- Product listing UI
- Shopping cart display
- Product image gallery
- CSS styling
- Loading spinners

🟡 YELLOW ZONE:
- Search functionality
- Filter logic
- Sorting algorithms
- Cart state management
- Inventory checks

🔴 RED ZONE:
- Checkout flow
- Payment processing
- Order creation
- User authentication
- Admin panel
- Pricing calculations
```

---

### SaaS Dashboard

```
🟢 GREEN ZONE:
- Dashboard widgets
- Charts/graphs display
- Navigation menu
- User profile display
- Settings UI

🟡 YELLOW ZONE:
- Data aggregation
- Report generation
- Export functionality
- Webhook configuration
- API key generation (display)

🔴 RED ZONE:
- User authentication
- Role-based access control
- Billing integration
- Data deletion (GDPR)
- Audit logging
- API key generation (security)
```

---

### Healthcare Application

```
🟢 GREEN ZONE:
- Appointment calendar display
- Patient list UI
- Documentation templates
- Search interface

🟡 YELLOW ZONE:
- Appointment scheduling logic
- Notification system
- Report formatting
- Data export (anonymized)

🔴 RED ZONE:
- Patient data access
- Medical records handling
- HIPAA compliance
- Prescription management
- Authentication
- Audit trails
- Data encryption
```

---

## SPECIAL CASES

### "Green Zone in Development, Red Zone in Production"

Some tasks change zones based on environment:

```
Database migrations:
- Development: 🟢 GREEN ZONE (easy to reset)
- Staging: 🟡 YELLOW ZONE (review recommended)
- Production: 🔴 RED ZONE (critical, irreversible)

Configuration changes:
- Local: 🟢 GREEN ZONE
- Staging: 🟡 YELLOW ZONE
- Production: 🔴 RED ZONE

Feature flags:
- Adding flag: 🟢 GREEN ZONE
- Toggling flag in prod: 🟡 YELLOW ZONE
- Removing flag: 🟡 YELLOW ZONE
```

---

### "Composite Tasks" (Multiple Zones)

```
Task: "Build user registration flow"

Breakdown:
├─ Registration form UI → 🟢 GREEN ZONE
├─ Form validation → 🟢 GREEN ZONE
├─ Email verification logic → 🟡 YELLOW ZONE
├─ Password hashing → 🔴 RED ZONE
├─ Session creation → 🔴 RED ZONE
└─ Welcome email → 🟡 YELLOW ZONE

→ Treat as 🔴 RED ZONE (highest zone wins)
```

---

## GUARDRAILS

### ✅ ALLTID
- Klassifiser hver task før start
- Ved tvil, velg høyere zone (mer oversight)
- Respekter zone-prosedyrer
- Dokumenter zone i task metadata
- Review 🔴 RED ZONE tasks med security expert

### ❌ ALDRI
- Auto-deploy 🔴 RED ZONE uten review
- Skip review for 🟡 YELLOW ZONE
- Nedgrader zone for å spare tid
- Merge payment/auth kode uten security review
- Ignorer zone classification

### ⏸️ SPØR BRUKER
- Ved grensesnitt mellom zones
- Hvis task endrer zone underveis
- Ved usikkerhet om classification

---

## ESKALERING

| Situasjon | Handling |
|-----------|----------|
| 🔴 RED ZONE detected | STOP → Human designer leads |
| 🟡 YELLOW ZONE uten review | BLOCK merge → Request review |
| 🟢 GREEN ZONE med security concern | UPGRADE to 🟡 or 🔴 |
| Zone classification unclear | ASK USER → Document decision |

---

## RELATERTE DOKUMENTER

- `./KLASSIFISERING-METADATA-SYSTEM.md` - Metadata for funksjoner
- `../agenter/system/agent-PHASE-GATES.md` - Quality gates
- `../agenter/system/protocol-CODE-QUALITY-GATES.md` - Review triggers
- `../agenter/system/protocol-TASK-COMPLEXITY-ASSESSMENT.md` - Complexity scoring
- `../agenter/basis/SIKKERHETS-agent.md` - Security review

---

*Versjon: 1.1.0*
*Opprettet: 2026-02-04*
*Sist oppdatert: 2026-04-22*
*Agent-fasit: Se `Agenter/VERSION.json`*
*Formål: Lukke green/red zone gap (100%) identifisert i STATUS-VALG-2-DETALJERT-ANALYSE.md*
*Research: Basert på "45% av AI-kode har security issues" (Synergy Labs 2026) og "Green zone vs Red zone" (DronaHQ 2026)*
*v1.1.0 (2026-04-22): Versjon synkronisert mellom header/footer. Eksempel-IDer i FUNKSJONS-MATRISE (linje ~411-420) byttet til EKS-MVP-prefiks for å unngå kollisjon med SSOT-IDer i KLASSIFISERING-METADATA-SYSTEM.md.*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
