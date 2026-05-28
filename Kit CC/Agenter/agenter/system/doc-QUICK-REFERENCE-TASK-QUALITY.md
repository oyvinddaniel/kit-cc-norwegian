# QUICK-REFERENCE: Task Quality Systems

> **TL;DR:** Before starting any task, check Zone (🟢🟡🔴), Complexity (0-10), and Review Requirements

---

## WHEN TO USE THESE SYSTEMS

**Trigger points:**
1. 🎯 **Before task starts** - User requests a task
2. 🎯 **During planning** - Breaking down work into subtasks
3. 🎯 **At phase gates** - Validating completed work

---

## THE THREE SYSTEMS (30-SECOND OVERVIEW)

### 1️⃣ TASK-CLASSIFICATION (Zones: 🟢🟡🔴)

**Purpose:** Decide if AI can work autonomously or needs human oversight

```
🟢 GREEN ZONE → AI works autonomously
   Examples: UI components, docs, tests, simple CRUD

🟡 YELLOW ZONE → AI implements, MANDATORY human review
   Examples: API design, business logic, database queries

🔴 RED ZONE → HUMAN designs, AI assists only
   Examples: Auth, payment, PII, production deployments
```

**Decision Rule:**
```
Does it involve auth/payment/PII/production? → 🔴 RED
Does it involve business logic/API/database? → 🟡 YELLOW
Otherwise → 🟢 GREEN
```

---

### 2️⃣ TASK-COMPLEXITY-ASSESSMENT (Score: 0-10)

**Purpose:** Warn if task complexity doesn't match user's intensity choice

**Scoring:**
```
Security Impact:        0-3 points
Integration Complexity: 0-3 points
State Management:       0-2 points
Testing Difficulty:     0-2 points
─────────────────────────────────
TOTAL:                  0-10 points
```

**Mapping to Intensity:**
```
0-2 points  → MINIMAL ✅
3-5 points  → FORENKLET ⚠️
6-8 points  → STANDARD ⚠️⚠️
9-10 points → GRUNDIG 🚫 (never MINIMAL)
```

**Action:**
- If score matches intensity → Proceed
- If mismatch (±3 points) → WARN user about "80/20 trap"
- If 9-10 + MINIMAL → STRONG WARNING, suggest upgrade

---

### 3️⃣ CODE-QUALITY-GATES (Review Triggers)

**Purpose:** Know when code requires human review

```
🔴 MANDATORY REVIEW:
   - Auth/authorization logic
   - Payment handling
   - Sensitive data (PII, health, financial)
   - Access control (RBAC, permissions)
   - Database migrations

⚠️ RECOMMENDED REVIEW:
   - >100 lines changed or >5 files
   - New dependencies
   - API endpoints
   - Complex queries
   - State management

🟢 OPTIONAL REVIEW:
   - UI components, docs, tests
   - Config files, formatting
```

---

## QUICK DECISION FLOW

```
NEW TASK
    │
    ├─ Step 1: CLASSIFY ZONE (🟢🟡🔴)
    │   └─ 🔴 RED? → STOP AI autonomous work
    │
    ├─ Step 2: SCORE COMPLEXITY (0-10)
    │   └─ Compare with user intensity
    │   └─ Mismatch? → WARN user
    │
    ├─ Step 3: CHECK REVIEW REQUIREMENTS
    │   └─ 🔴 MANDATORY? → Plan review
    │
    └─ PROCEED with task
```

---

## PRACTICAL EXAMPLES

### Example 1: "Build a checkout component"

```
STEP 1 - ZONE CLASSIFICATION:
❓ Auth/payment/PII? → YES (payment data)
→ 🔴 RED ZONE

STEP 2 - COMPLEXITY SCORING:
Security: 3 (payment data)
Integration: 2 (Stripe API)
State: 2 (cart state + async)
Testing: 2 (mocking payment)
─────────────────────────────
TOTAL: 9/10 → GRUNDIG recommended

STEP 3 - REVIEW REQUIREMENTS:
→ 🔴 MANDATORY: Payment handling

ACTION:
User chose MINIMAL → ⚠️ STRONG MISMATCH WARNING
"This is CRITICAL complexity (9/10). MINIMAL will hit 80/20 trap.
Recommend: GRUNDIG intensity"
```

---

### Example 2: "Create a button component"

```
STEP 1 - ZONE CLASSIFICATION:
❓ Auth/payment/PII? → NO
❓ Business logic/API? → NO
→ 🟢 GREEN ZONE

STEP 2 - COMPLEXITY SCORING:
Security: 0
Integration: 0
State: 0
Testing: 0
─────────────────────────────
TOTAL: 0/10 → MINIMAL ✅

STEP 3 - REVIEW REQUIREMENTS:
→ 🟢 OPTIONAL: Just automated checks

ACTION:
User chose MINIMAL → ✅ PERFECT MATCH
Proceed autonomously
```

---

### Example 3: "Add API endpoint for search"

```
STEP 1 - ZONE CLASSIFICATION:
❓ Auth/payment/PII? → NO
❓ Business logic/API? → YES (API endpoint)
→ 🟡 YELLOW ZONE

STEP 2 - COMPLEXITY SCORING:
Security: 1 (input validation)
Integration: 1 (single API)
State: 1 (cache)
Testing: 1 (mock needed)
─────────────────────────────
TOTAL: 4/10 → FORENKLET ⚠️

STEP 3 - REVIEW REQUIREMENTS:
→ ⚠️ RECOMMENDED: API endpoints

ACTION:
User chose FORENKLET → ✅ GOOD MATCH
AI implements → Senior dev reviews → Merge
```

---

## INTEGRATION WITH PHASE GATES

### At Phase Gate (e.g., FASE 4: MVP Gate)

**Verify zone requirements:**

```yaml
zone_verification:
  red_zone_tasks:
    - "Auth reviewed by security expert ✓"
    - "Secrets management verified ✓"
    - "No hardcoded credentials ✓"

  yellow_zone_tasks:
    - "API endpoints reviewed by senior dev ✓"
    - "Business logic has unit tests ✓"

  green_zone_tasks:
    - "Automated checks passed ✓"
    - "Build successful ✓"

blocking_issues:
  - "🔴 RED ZONE tasks uten security review"
  - "🟡 YELLOW ZONE tasks uten senior dev review"
```

**Action:**
- If zone verification fails → BLOCK gate
- If verification passes → Allow progression to next phase

---

## COMMON MISTAKES TO AVOID

### ❌ Mistake 1: "It's just a small change"
```
WRONG: "Just changing auth token expiry 1h→24h" → 🟢 GREEN
CORRECT: Auth configuration = 🔴 RED (security-critical)
```

### ❌ Mistake 2: "AI wrote good tests"
```
WRONG: AI wrote tests for payment → Auto-approve
CORRECT: Payment = 🔴 RED (tests must be human-reviewed)
```

### ❌ Mistake 3: "Behind a feature flag"
```
WRONG: "Auth behind flag, safe to auto-deploy"
CORRECT: Auth = 🔴 RED regardless of flag
```

### ❌ Mistake 4: Ignoring mismatch warnings
```
WRONG: User picks MINIMAL for score 9 → Proceed anyway
CORRECT: Show "80/20 trap" warning → Wait for confirmation
```

---

## AGENT WORKFLOW INTEGRATION

### In agent-ORCHESTRATOR.md:
```markdown
TASK QUALITY CHECKS (Før Oppgavestart):
1. TASK-CLASSIFICATION Check (Zone)
2. TASK-COMPLEXITY-ASSESSMENT Check
3. CODE-QUALITY-GATES Check
→ If 🔴 RED → STOP autonomous work
→ If mismatch → WARN user → WAIT confirmation
```

### In doc-INTENSITY-MATRIX.md:
```markdown
TASK-LEVEL COMPLEXITY ASSESSMENT:
1. Score task (0-10)
2. Compare with user intensity
3. WARN if mismatch
4. User confirms or adjusts
→ Then proceed with chosen intensity
```

### In PROSESS-agent (e.g., MVP-agent):
```markdown
Steg 2: Task Quality Assessment
1. TASK-CLASSIFICATION → Classify all functions in FUNKSJONS-MATRISE
2. TASK-COMPLEXITY-ASSESSMENT → Score all functions
3. CODE-QUALITY-GATES → Plan review requirements

Steg 3: Planlegging
- Prioritize: 🔴 RED first (human-led), then 🟡, then 🟢

Steg 4: Koordinert utførelse
- Before each task: Check zone
- 🔴 RED → Human designs, AI assists
- 🟡 YELLOW → AI implements, WAIT for review
- 🟢 GREEN → AI autonomous
```

---

## TROUBLESHOOTING

### Q: User insists on MINIMAL for high complexity task?
**A:** Show warning, document override, proceed cautiously. If stuck at 80%, offer upgrade.

### Q: Unsure if task is 🟡 YELLOW or 🔴 RED?
**A:** When in doubt, choose higher zone (more oversight = safer).

### Q: What if task spans multiple zones?
**A:** Treat as highest zone. Example: "User registration" has 🟢 form + 🔴 auth → Treat entire task as 🔴 RED.

### Q: Should I block user from choosing wrong intensity?
**A:** NO. Warn with clear reasoning, but respect user choice. They might have good reasons (quick prototype, etc.).

### Q: How to handle "80/20 trap" mid-task?
**A:** Detect signals (multiple commits, user asks about edge cases). Offer intensity upgrade. Example: "You've hit the 80% mark. Upgrade to STANDARD for proper error handling?"

---

## CHEAT SHEET

```
┌────────────────────────────────────────────────────────┐
│  BEFORE EVERY TASK:                                    │
│                                                        │
│  1. Zone? 🟢🟡🔴                                         │
│     → 🔴 RED detected? STOP autonomous work            │
│                                                        │
│  2. Complexity? 0-10                                   │
│     → Mismatch with intensity? WARN user               │
│                                                        │
│  3. Review needed? 🔴⚠️🟢                               │
│     → Plan review timing                               │
│                                                        │
│  DURING TASK:                                          │
│  - 🔴 RED → Human designs, AI assists                  │
│  - 🟡 YELLOW → AI implements, WAIT for review          │
│  - 🟢 GREEN → AI autonomous                            │
│                                                        │
│  AT PHASE GATE:                                        │
│  - Verify zone requirements met                       │
│  - Block if 🔴 RED missing security review             │
└────────────────────────────────────────────────────────┘
```

---

## RELATED DOCUMENTS

**Deep dives:**
- `../../klassifisering/TASK-CLASSIFICATION.md` - Full zone definitions
- `./protocol-TASK-COMPLEXITY-ASSESSMENT.md` - Detailed scoring model
- `./protocol-CODE-QUALITY-GATES.md` - Pre-commit hooks, security scanning

**Integration:**
- `./agent-ORCHESTRATOR.md` - System-level triggers
- `./doc-INTENSITY-MATRIX.md` - Intensity levels
- `./agent-PHASE-GATES.md` - Gate validation
- `../prosess/4-MVP-agent.md` - Example prosess-agent with integration

---

*Versjon: 1.0.0*
*Opprettet: 2026-02-04*
*Formål: Quick reference for agenter som skal bruke Task Quality Systems*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
