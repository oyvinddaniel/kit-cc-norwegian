# CODE-QUALITY-GATES v1.0

> System-protokoll for automatiserte kvalitetskontroller og code review triggers

---

## IDENTITET

**Navn:** CODE-QUALITY-GATES
**Type:** System-protokoll (Lag 3 — lastes on-demand ved kode-gate-validering)
**Rolle:** Definerer når og hvordan code quality checks skal trigges

### Formål

Sikre at AI-generert kode går gjennom passende kvalitetskontroller før den aksepteres, med spesiell vekt på:
1. Security-kritisk kode får ekstra scrutiny
2. Automated scanning fanger vanlige feil
3. Pre-commit hooks forhindrer åpenbare problemer

---

## CODE REVIEW TRIGGERS

### Automatisk Review Påkrevd Når:

#### 🔴 KRITISK (MANDATORY REVIEW)

Følgende endringer KREVER alltid human code review:

```markdown
1. AUTHENTICATION & AUTHORIZATION
   - Login/logout logikk
   - Token generering/validering
   - Session management
   - Password handling
   - API key management

2. BETALINGSHÅNDTERING
   - Payment gateway integration
   - Transaksjonslogikk
   - Refund handling
   - Pricing calculations
   - Invoice generation

3. SENSITIVE DATA
   - Encryption/decryption
   - PII (Personally Identifiable Information) handling
   - Health data processing
   - Financial data storage

4. ACCESS CONTROL
   - Role-based access control (RBAC)
   - Permission checks
   - Data access policies
   - Admin functionality

5. DATABASE MIGRATIONS
   - Schema changes
   - Data transformations
   - Index modifications
   - Foreign key constraints
```

**Prosedyre:**
```
1. AI implementerer
2. MANDATORY: Senior developer review
3. MANDATORY: Security checklist validation
4. MANDATORY: Test suite må pass
5. Deployment til staging først
6. Manual verification i staging
7. Godkjenning fra security lead (for payment/sensitive data)
```

---

#### ⚠️ ANBEFALT REVIEW

Følgende endringer BØR ha code review:

```markdown
1. STORE ENDRINGER
   - > 100 linjer endret
   - > 5 filer berørt
   - Arkitektur-endringer

2. NYE DEPENDENCIES
   - npm install / yarn add
   - Nye eksterne biblioteker
   - Version upgrades (major)

3. API ENDPOINTS
   - Nye REST/GraphQL endpoints
   - Endpoint modifications
   - Request/response schema changes

4. DATABASE QUERIES
   - Complex SQL queries
   - ORM relationship changes
   - Query optimization

5. STATE MANAGEMENT
   - Global state changes
   - Redux/Zustand store modifications
   - Context API changes

6. ERROR HANDLING
   - Try/catch blocks
   - Error boundaries
   - Fallback logic
```

**Prosedyre:**
```
1. AI implementerer
2. Automated tests må pass
3. Peer review anbefalt
4. Manual testing før merge
```

---

#### 🟢 OPTIONAL REVIEW

Følgende kan gå direkte gjennom automated checks:

```markdown
1. UI COMPONENTS
   - Basic React components
   - CSS/styling
   - Layout changes

2. DOKUMENTASJON
   - README updates
   - Code comments
   - JSDoc additions

3. TESTS
   - Unit tests
   - Integration tests
   - Test data

4. KONFIGURASJONER
   - ESLint rules
   - Prettier config
   - TypeScript config

5. SMÅFIKSER
   - Typos
   - Formatting
   - Console.log removal
```

**Prosedyre:**
```
1. AI implementerer
2. Automated checks (linting, tests, formatting)
3. Merge hvis alle checks pass
```

---

## PRE-COMMIT HOOKS

### Setup: Husky + lint-staged

**Installasjon:**

```bash
# Install dependencies
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Add to package.json
npm pkg set scripts.prepare="husky install"
```

**package.json konfigurering:**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,yml,yaml}\"",
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

---

### Pre-commit Hook: .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 1. Lint-staged (formatting, linting, tests)
npx lint-staged

# 2. Secret scanning
echo "🔒 Scanning for secrets..."
npx detect-secrets scan --baseline .secrets.baseline
if [ $? -ne 0 ]; then
  echo "❌ Secrets detected! Please remove them before committing."
  exit 1
fi

# 3. Type checking (if TypeScript)
if [ -f "tsconfig.json" ]; then
  echo "📝 Type checking..."
  npx tsc --noEmit
  if [ $? -ne 0 ]; then
    echo "❌ Type errors detected!"
    exit 1
  fi
fi

echo "✅ Pre-commit checks passed!"
```

---

### Pre-push Hook: .husky/pre-push

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# 1. Full test suite
echo "🧪 Running full test suite..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed!"
  exit 1
fi

# 2. Build check
echo "🏗️  Building project..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

# 3. Security audit
echo "🔐 Running security audit..."
npm audit --audit-level=moderate
if [ $? -ne 0 ]; then
  echo "⚠️  Security vulnerabilities detected!"
  echo "Run 'npm audit fix' to resolve them."
  exit 1
fi

echo "✅ Pre-push checks passed!"
```

---

## AUTOMATED SECURITY SCANNING

### 1. GitHub Advanced Security (Anbefalt)

**Aktivering i GitHub repository:**

```yaml
# .github/workflows/security.yml
name: Security Scanning

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    # Run daily at 2 AM
    - cron: '0 2 * * *'

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    # 1. Dependency vulnerability scanning
    - name: Run npm audit
      run: |
        npm audit --audit-level=moderate

    # 2. Secret scanning
    - name: GitLeaks Secret Scan
      uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    # 3. SAST - Static Application Security Testing
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript, typescript

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3

    # 4. Container scanning (hvis Docker)
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      if: hashFiles('Dockerfile') != ''
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
```

---

### 2. Dependabot Configuration

**.github/dependabot.yml:**

```yaml
version: 2
updates:
  # NPM dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    # Auto-merge patch updates
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    # Group minor and patch updates
    groups:
      production-dependencies:
        patterns:
          - "*"
        exclude-patterns:
          - "eslint*"
          - "prettier*"
      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

### 3. SAST Tool Integration

**ESLint Security Plugin:**

```bash
npm install --save-dev eslint-plugin-security
```

**.eslintrc.json:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:security/recommended"
  ],
  "plugins": ["security"],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-non-literal-require": "warn",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-pseudoRandomBytes": "error"
  }
}
```

---

### 4. OWASP Dependency-Check (CI/CD)

**.github/workflows/owasp-check.yml:**

```yaml
name: OWASP Dependency Check

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  dependency-check:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: OWASP Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'Kit-CC-Project'
        path: '.'
        format: 'HTML'

    - name: Upload Results
      uses: actions/upload-artifact@v4
      with:
        name: dependency-check-report
        path: 'dependency-check-report.html'
```

---

## SECRET SCANNING SETUP

### 1. GitLeaks Pre-commit

**Installasjon:**

```bash
# Install gitleaks
brew install gitleaks  # macOS
# or
curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz | tar -xz
```

**.gitleaksignore:**

```
# Ignore false positives
test/fixtures/fake-api-key.js
docs/examples/*.md
.env.example
```

**.gitleaks.toml:**

```toml
title = "Kit CC Gitleaks Config"

[extend]
useDefault = true

[[rules]]
id = "api-key"
description = "Generic API Key"
regex = '''(?i)(api[_-]?key|apikey)['":\s]*[=:]\s*['"][0-9a-z\-_]{20,}['"]'''
```

---

### 2. Pre-commit Hook med Secret Scanning

Allerede inkludert i `.husky/pre-commit` ovenfor.

---

## INTEGRASJON MED PHASE-GATES

### Gate-validering inkluderer nå:

**FASE 4 (MVP Gate):**

```yaml
quality_checks:
  - "Pre-commit hooks aktivert ✓"
  - "Secret scanning konfigurert ✓"
  - "ESLint security plugin aktiv ✓"
  - "Ingen hardkodede secrets ✓"

blocking_issues:
  - "Pre-commit hooks mangler"
  - "Secrets funnet i kode"
  - "Security linting errors"
```

**FASE 6 (QA Gate):**

```yaml
security_checks:
  - "GitHub CodeQL scanning aktiv ✓"
  - "Dependabot alerts = 0 high/critical ✓"
  - "npm audit clean (moderate+) ✓"
  - "OWASP dependency check passed ✓"

blocking_issues:
  - "High/critical security alerts"
  - "Unpatched vulnerabilities"
```

---

## INTENSITETSNIVÅ-TILPASNING

| Nivå | Pre-commit | CI/CD Scanning | Review Triggers |
|------|-----------|----------------|-----------------|
| **MINIMAL** | Linting + formatting | npm audit | 🔴 KRITISK kun |
| **FORENKLET** | + Secret scan | + GitLeaks | 🔴 + ⚠️ Store endringer |
| **STANDARD** | + Type check | + CodeQL | 🔴 + ⚠️ ANBEFALT |
| **GRUNDIG** | + Test suite | + OWASP check | Alt krever review |
| **ENTERPRISE** | + Custom checks | + Container scan + Pentest | Alt + external audit |

---

## IMPLEMENTERINGSGUIDE

### Quick Start (STANDARD nivå)

**Steg 1: Installer dependencies**

```bash
npm install --save-dev husky lint-staged eslint-plugin-security
npx husky install
npm pkg set scripts.prepare="husky install"
```

**Steg 2: Opprett pre-commit hook**

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

**Steg 3: Konfigurer lint-staged i package.json**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Steg 4: Aktiver GitHub Security Features**

1. Gå til repository → Settings → Security & analysis
2. Aktiver:
   - Dependabot alerts ✓
   - Dependabot security updates ✓
   - Secret scanning ✓
   - Code scanning (CodeQL) ✓

**Steg 5: Legg til GitHub Actions workflows**

```bash
mkdir -p .github/workflows
# Kopier security.yml og owasp-check.yml fra eksemplene ovenfor
```

---

## VEDLIKEHOLD

### Ukentlig:
- [ ] Review Dependabot PRs
- [ ] Sjekk security alerts

### Månedlig:
- [ ] Review og oppdater .gitleaks.toml regler
- [ ] Kjør manuell security audit
- [ ] Oppdater eslint-plugin-security

### Kvartalsvis:
- [ ] Review code review triggers (juster terskler)
- [ ] Evaluér nye security tools
- [ ] Update pre-commit hook scripts

---

## GUARDRAILS

### ✅ ALLTID
- Kjør pre-commit hooks på alle commits
- Scan for secrets før push
- Review all 🔴 KRITISK kode
- Blokkér high/critical vulnerabilities

### ❌ ALDRI
- Skip pre-commit checks (--no-verify)
- Commit secrets eller credentials
- Merge uten review for 🔴 KRITISK
- Ignorer security alerts uten vurdering

### ⏸️ SPØR BRUKER
- Ved false positive secret detection
- Ved breaking changes i dependencies
- Ved konflikter mellom speed og security

---

## ESKALERING

| Situasjon | Handling |
|-----------|----------|
| Secret detektert | BLOKKÉR commit → Fjern secret → Re-commit |
| Critical vulnerability | BLOKKÉR deployment → Patch immediately |
| Review ikke fullført | VENT på approval → Ikke merge |
| Pre-commit feil | Fiks issue → Re-commit |

---

## RELATERTE DOKUMENTER

- `./agent-PHASE-GATES.md` - Gate-validering system
- `../prosess/6-KVALITETSSIKRINGS-agent.md` - QA testing
- `../basis/SIKKERHETS-agent.md` - Security review
- `../basis/REVIEWER-agent.md` - Code review prosess

---

*Versjon: 1.0.0*
*Opprettet: 2026-02-04*
*Formål: Lukke code quality gaps og integrere med `protocol-TASK-COMPLEXITY-ASSESSMENT.md` for å kalibrere dybde på kvalitetssjekker.*
*Kompatibel med: Kit CC v3.5.0*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
