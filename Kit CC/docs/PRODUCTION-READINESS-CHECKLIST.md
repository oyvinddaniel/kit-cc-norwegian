# PRODUCTION READINESS CHECKLIST v1.0

> Definerer hva som MÅ være på plass før deployment til produksjon

**Formål:** Sikre at INGEN kode når produksjon uten å møte minimumskrav for kvalitet, sikkerhet og robusthet.

**Target:** Redusere failure rate fra 40-50% til <10% ved deployment.

---

## HVORDAN BRUKE DENNE CHECKLISTIEN

### Automatisk (anbefalt):
```
PUBLISERINGS-agent kjører automatisk relevante eksperter
(MONITORING, INFRASTRUKTUR, SRE, BACKUP, INCIDENT-RESPONSE)
    ↓
Ekspertene sjekker alle items
    ↓
    ├─ 100% KRITISK → ✅ GODKJENT deployment
    ├─ <100% KRITISK → 🔴 BLOKKERER deployment
    ├─ ≥90% VIKTIG → ✅ OK
    └─ <90% VIKTIG → ⚠️ WARNING (fortsetter med disclaimer)
```

### Manuelt:
```
Type: "Sjekk production readiness"
→ PUBLISERINGS-agent kjører checks via MONITORING/INFRASTRUKTUR/SRE/BACKUP/INCIDENT-RESPONSE-eksperter
→ Viser rapport med pass/fail per item
```

---

## 🔴 KRITISK (MÅ være 100% før prod)

### 1. SIKKERHET

#### 1.1 Security Scan
- [ ] **CODE-QUALITY-GATE scan passed**
  - 0 critical security vulnerabilities
  - 0 high severity vulnerabilities
  - <5 medium severity vulnerabilities

**Hvordan sjekke:**
```bash
# Kjør CODE-QUALITY-GATE
semgrep --config=auto src/
```

**Kriterier:**
- ✅ PASS: 0 critical, 0 high
- ❌ FAIL: Any critical or high

**Blokkering:**
```
🔴 PRODUCTION DEPLOYMENT BLOKKERT

Security scan found critical issues.
You CANNOT deploy to production until these are fixed.

Run: semgrep --config=auto src/
Then: Type 'fixed' to rescan
```

---

#### 1.2 Hard-coded Secrets
- [ ] **NO hard-coded secrets in code**
  - No API keys (sk_live_, pk_live_)
  - No database passwords
  - No JWT secrets
  - All secrets in environment variables

**Hvordan sjekke:**
```bash
# Scan for secrets
grep -rn "api[_-]?key\s*=\s*['\"]" src/
grep -rn "password\s*=\s*['\"]" src/
grep -rn "jwt[_-]?secret" src/
```

**Kriterier:**
- ✅ PASS: No matches found
- ❌ FAIL: Any matches

**Blokkering:**
```
🔴 HARD-CODED SECRETS DETECTED

These MUST be moved to .env before production:
- src/config.ts:12 → API key
- src/db.ts:45 → Database password

Action required:
1. Move secrets to .env
2. Add .env to .gitignore
3. Use process.env.SECRET_NAME
```

---

#### 1.3 Authentication & Authorization
- [ ] **Authentication implemented** (hvis appen har brukere)
  - Login flow implemented
  - Session management configured
  - Logout flow implemented

- [ ] **Authorization implemented** (hvis appen har roller)
  - Permission checks on sensitive routes
  - Role-based access control
  - API endpoints protected

**Hvordan sjekke:**
```typescript
// Sjekk at sensitive routes har auth middleware
app.post('/api/admin/*', requireAuth, requireAdmin, ...)
```

**Kriterier:**
- ✅ PASS: All sensitive routes protected
- ❌ FAIL: Unprotected sensitive routes

---

#### 1.4 Input Validation
- [ ] **All user input validated**
  - Email validation (regex eller library)
  - Phone number validation
  - Data type validation (string/number/date)
  - Length limits enforced (max 255 chars for text, etc.)

**Hvordan sjekke:**
```typescript
// BAD - No validation ❌
function createUser(email: string) {
  db.insert({ email });
}

// GOOD - Validated ✅
function createUser(email: string) {
  if (!validateEmail(email)) {
    throw new Error('Invalid email');
  }
  db.insert({ email });
}
```

**Kriterier:**
- ✅ PASS: All inputs validated
- ❌ FAIL: Any unvalidated inputs

---

#### 1.5 Error Handling
- [ ] **Proper error handling implemented**
  - Try-catch blocks on all async operations
  - Error boundaries in React (if applicable)
  - NO sensitive info in error messages to users
  - Errors logged to monitoring system

**Hvordan sjekke:**
```typescript
// BAD - No error handling ❌
async function fetchData() {
  const data = await api.get('/data');
  return data;
}

// GOOD - Error handling ✅
async function fetchData() {
  try {
    const data = await api.get('/data');
    return data;
  } catch (error) {
    logger.error('Failed to fetch data', error);
    throw new AppError('Unable to load data');
  }
}
```

---

### 2. TESTING

#### 2.1 Test Coverage
- [ ] **Unit test coverage ≥80%**
  - All business logic tested
  - Edge cases covered
  - Error scenarios tested

**Hvordan sjekke:**
```bash
npm run test:coverage
# eller
pytest --cov=src --cov-report=term
```

**Kriterier:**
- ✅ PASS: ≥80% coverage
- ⚠️ WARNING: 70-79% coverage (kan fortsette med disclaimer)
- ❌ FAIL: <70% coverage

**Blokkering:**
```
🔴 INSUFFICIENT TEST COVERAGE

Current: 65%
Required: 80%

Missing tests for:
- src/auth/login.ts (0% coverage)
- src/api/payments.ts (45% coverage)

Run: npm run test:coverage
```

---

#### 2.2 Critical Path Testing
- [ ] **All critical user flows tested**
  - E2E tests for signup/login
  - E2E tests for core features
  - E2E tests for payment flow (if applicable)

**Hvordan sjekke:**
```bash
npm run test:e2e
# eller
playwright test
```

**Kriterier:**
- ✅ PASS: All critical flows pass
- ❌ FAIL: Any critical flow fails

---

### 3. AI-KODE GOVERNANCE

#### 3.1 Human Review
- [ ] **All AI-generated code reviewed by human**
  - Check @reviewed flag in code headers
  - All @reviewed: false must be reviewed before prod

**Hvordan sjekke:**
```bash
# Finn all ureviewed AI-kode
grep -rn "@reviewed false" src/
```

**Kriterier:**
- ✅ PASS: No "@reviewed false" found
- ❌ FAIL: Any "@reviewed false" found

**Blokkering:**
```
🔴 UNREVIEWED AI-GENERATED CODE

These files contain AI-generated code that has NOT been human-reviewed:
- src/auth/login.ts (145 lines)
- src/api/users.ts (89 lines)

You MUST review and approve before production deployment.

After review, update headers to:
@reviewed true
@reviewed-by [Your Name]
```

---

### 4. DEPLOYMENT

#### 4.1 Environment Configuration
- [ ] **Production environment configured**
  - .env.production exists
  - All required env vars present
  - Database connection string valid
  - API keys configured

**Hvordan sjekke:**
```bash
# Sjekk at alle required env vars er satt
[ -z "$DATABASE_URL" ] && echo "Missing DATABASE_URL"
[ -z "$API_KEY" ] && echo "Missing API_KEY"
```

---

#### 4.2 Database Migrations
- [ ] **All migrations applied to production**
  - Schema up-to-date
  - Migration history logged
  - Rollback plan exists

**Hvordan sjekke:**
```bash
npm run migrate:status
# eller
python manage.py showmigrations
```

---

## 🟡 VIKTIG (BØR være ≥90% før prod)

### 5. MONITORING & LOGGING

#### 5.1 Error Monitoring
- [ ] **Error tracking configured**
  - Sentry, Rollbar, eller lignende
  - Error alerts configured
  - Team notified on critical errors

**Hvordan sjekke:**
```javascript
// Sjekk at Sentry er initialized
if (typeof Sentry === 'undefined') {
  console.warn('Sentry not configured');
}
```

---

#### 5.2 Logging
- [ ] **Structured logging implemented**
  - All critical operations logged
  - Log level configured (info/warn/error)
  - Logs sent to aggregation service (Datadog, CloudWatch, etc.)

---

### 6. PERFORMANCE

#### 6.1 Load Testing
- [ ] **Basic load testing performed**
  - Tested with expected user load
  - Response times acceptable (<2s for API)
  - No memory leaks detected

**Hvordan sjekke:**
```bash
# k6 load test
k6 run loadtest.js
```

---

#### 6.2 Database Optimization
- [ ] **Database indexes created**
  - Indexes on frequently queried columns
  - Query performance profiled
  - N+1 queries eliminated

---

### 7. DOCUMENTATION

#### 7.1 Deployment Docs
- [ ] **Deployment procedure documented**
  - Step-by-step deployment guide
  - Rollback procedure documented
  - Environment setup documented

---

#### 7.2 Runbook
- [ ] **Incident response runbook exists**
  - Common issues + solutions
  - Who to contact for what
  - Monitoring dashboard links

---

## ✅ ANBEFALT (KAN være <70%, men bør fikses)

### 8. USER EXPERIENCE

#### 8.1 Loading States
- [ ] **Loading indicators for async operations**
- [ ] **Error states designed and implemented**
- [ ] **Empty states designed and implemented**

---

#### 8.2 Accessibility
- [ ] **Basic WCAG 2.2 AA compliance**
  - Keyboard navigation works
  - Alt text on images
  - Contrast ratios meet standards

---

### 9. BACKUP & RECOVERY

#### 9.1 Database Backups
- [ ] **Automated backups configured**
  - Daily backups scheduled
  - Backups tested (can restore)
  - 30-day retention

---

## SCORING SYSTEM

### Beregning:
```
criticalScore = (completed KRITISK items / total KRITISK items) × 100
viktgScore = (completed VIKTIG items / total VIKTIG items) × 100
anbefalScore = (completed ANBEFALT items / total ANBEFALT items) × 100

overallReadiness = (criticalScore × 0.6) + (viktgScore × 0.3) + (anbefalScore × 0.1)
```

### Deployment Decision:

| Kritisk | Viktig | Anbefalt | Decision |
|---------|--------|----------|----------|
| 100% | ≥90% | Any | ✅ GODKJENT deployment |
| 100% | 70-89% | Any | ⚠️ GODKJENT med warning |
| 100% | <70% | Any | ⚠️ GODKJENT med disclaimer |
| <100% | Any | Any | 🔴 BLOKKERT deployment |

---

## EKSEMPEL - Deployment Decision Output

### Scenario 1: GODKJENT ✅

```
✅ PRODUCTION READINESS: APPROVED

Overall Readiness: 96%

🔴 KRITISK: 18/18 (100%) ✅
🟡 VIKTIG: 11/12 (92%) ✅
✅ ANBEFALT: 6/9 (67%) ⚠️

Missing:
- VIKTIG: Load testing not performed
- ANBEFALT: Accessibility audit incomplete
- ANBEFALT: Database backup not tested
- ANBEFALT: Runbook needs updating

Recommendation:
✅ SAFE TO DEPLOY

These items should be completed soon:
- Load testing (prevents scaling issues)
- Backup testing (critical for recovery)

Type 'deploy' to proceed with production deployment.
```

---

### Scenario 2: BLOKKERT 🔴

```
🔴 PRODUCTION READINESS: BLOCKED

Overall Readiness: 73%

🔴 KRITISK: 15/18 (83%) ❌ BLOCKER
🟡 VIKTIG: 10/12 (83%) ⚠️
✅ ANBEFALT: 8/9 (89%) ✅

BLOKKERENDE ISSUES:

1. Security scan FAILED
   - 2 critical vulnerabilities
   - Must fix before deployment

2. Hard-coded secrets detected
   - src/config.ts:12 (Stripe key)
   - src/db.ts:45 (DB password)

3. Unreviewed AI-generated code
   - src/auth/login.ts (145 lines)
   - src/api/users.ts (89 lines)

🔴 YOU CANNOT DEPLOY TO PRODUCTION

Action required:
1. Fix security vulnerabilities
2. Move secrets to .env
3. Review AI-generated code

Type 'fixed' when resolved, then rescan.
```

---

## INTEGRASJON MED KIT CC

### I PUBLISERINGS-agent.md:

```markdown
## DEPLOYMENT GATE

FØR deployment til production:

1. 🔍 AUTO-TRIGGER: PUBLISERINGS-agent kaller MONITORING-, INFRASTRUKTUR-, SRE-, BACKUP- og INCIDENT-RESPONSE-eksperter
   - Kjører full production readiness check
   - VENTER på resultat

2. HVIS readinessScore == 100% KRITISK OG ≥90% VIKTIG:
   - ✅ Present report til bruker
   - Type 'deploy' to confirm

3. HVIS readinessScore == 100% KRITISK OG <90% VIKTIG:
   - ⚠️ Present warning til bruker
   - Type 'deploy anyway' to override

4. HVIS readinessScore < 100% KRITISK:
   - 🔴 BLOKKERER deployment helt
   - Present blocking issues
   - VENTER på 'fixed' → GOTO step 1
```

---

**Versjon:** 1.0.0
**Opprettet:** 2026-02-04
**Formål:** Sikre production-ready deployments
**Target:** Redusere failure rate til <10%

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
