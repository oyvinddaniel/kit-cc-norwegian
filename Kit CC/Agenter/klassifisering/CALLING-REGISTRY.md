# CALLING-REGISTRY v2.1

> **v2.1 — 2026-04-22** — Oppdatert for Kit CC profesjonell pakke v3 (30 nye komponenter)

> Sentralisert register over alle agent-aktiveringer og kalle-relasjoner i Kit CC.

---

## FORMÅL

Dette dokumentet er den **single source of truth** for:
- Hvilke agenter som kan kalle hvilke andre agenter
- Aktiveringsvilkår for hver agent
- Avhengigheter mellom agenter
- Autoriseringsnivåer

**Referanse:** Alle agenter skal peke til dette dokumentet for kalle-regler.

---

## AGENT-HIERARKI

> **Nivåhierarki:** Nivå 0 (System: 6) → Nivå 1 (Basis: 7) → Nivå 2 (Prosess: 7) → Nivå 3 (Ekspert: 37) = 57 agenter totalt

```
NIVÅ 0: SYSTEM-AGENTER (Infrastruktur - alltid aktive)
    │
    ├── ORCHESTRATOR ──────────────► Koordinerer PROSESS-agenter
    ├── AUTO-CLASSIFIER ───────────► Klassifiserer prosjekter
    ├── BROWNFIELD-SCANNER ────────► Analyserer eksisterende kodebaser
    ├── CONTEXT-LOADER ────────────► Laster kontekst
    ├── PHASE-GATES ───────────────► Validerer fase-overganger
    └── AGENT-PROTOCOL ────────────► Definerer kommunikasjon
    │
    ▼
NIVÅ 2: PROSESS-AGENTER (Fase-koordinatorer)
    │
    ├── 1-OPPSTART-agent (Fase 1)
    ├── 2-KRAV-agent (Fase 2)
    ├── 3-ARKITEKTUR-agent (Fase 3)
    ├── 4-MVP-agent (Fase 4)
    ├── 5-ITERASJONS-agent (Fase 5)
    ├── 6-KVALITETSSIKRINGS-agent (Fase 6)
    └── 7-PUBLISERINGS-agent (Fase 7)
    │
    ▼
NIVÅ 1: BASIS-AGENTER (Verktøy - kalles av PROSESS)
    │
    ├── BYGGER-agent
    ├── DEBUGGER-agent
    ├── DOKUMENTERER-agent
    ├── PLANLEGGER-agent
    ├── REVIEWER-agent
    ├── SIKKERHETS-agent
    └── VEILEDER-agent
    │
    ▼
NIVÅ 3: EKSPERT-AGENTER (Spesialister - kalles av PROSESS/BASIS)
    │
    └── 37 ekspert-agenter (33 i fase-tabeller + 4 i profesjonell-pakke)
```

---

## AKTIVERINGSTABELL: SYSTEM-AGENTER (Nivå 0)

| Agent | Kalles av | Aktiveringstrigger | Autoritet |
|-------|-----------|-------------------|-----------|
| ORCHESTRATOR | Session-start / PHASE-GATES / Agent-signal | Alltid aktiv ved session | Koordinerer alle |
| AUTO-CLASSIFIER | ORCHESTRATOR / Manuell | Nytt prosjekt, re-klassifisering | Klassifiserer prosjekt |
| BROWNFIELD-SCANNER | AUTO-CLASSIFIER | Eksisterende kode oppdaget (>=3 kildekodefiler) | Analyserer kodebase |
| CONTEXT-LOADER | ORCHESTRATOR | Session-boot, fase-bytte | Laster kontekst |
| PHASE-GATES | ORCHESTRATOR / PROSESS-agent | Fase-overgang | Validerer leveranser |
| AGENT-PROTOCOL | Referanse | Alltid tilgjengelig | Definerer protokoll |

---

## AKTIVERINGSTABELL: PROSESS-AGENTER (Nivå 2)

| Agent | Kalles av | Aktiveringstrigger | Kan kalle |
|-------|-----------|-------------------|-----------|
| 1-OPPSTART-agent | ORCHESTRATOR | `currentPhase == 1` | PLANLEGGER, DOKUMENTERER, PERSONA-ekspert, LEAN-CANVAS-ekspert, KONKURRANSEANALYSE-ekspert |
| 2-KRAV-agent | ORCHESTRATOR | `currentPhase == 2` | PLANLEGGER, DOKUMENTERER, SIKKERHETS-agent, WIREFRAME-ekspert, API-DESIGN-ekspert |
| 3-ARKITEKTUR-agent | ORCHESTRATOR | `currentPhase == 3` | BYGGER, SIKKERHETS-agent, DOKUMENTERER, DATAMODELL-ekspert, API-DESIGN-ekspert, TRUSSELMODELLERINGS-ekspert |
| 4-MVP-agent | ORCHESTRATOR | `currentPhase == 4` | BYGGER, SIKKERHETS-agent, REVIEWER, HEMMELIGHETSSJEKK-ekspert, CICD-ekspert, SUPPLY-CHAIN-ekspert, TEST-GENERATOR-ekspert, INFRASTRUKTUR-ekspert, DESIGN-TIL-KODE-ekspert, CODE-QUALITY-GATE-ekspert, GORGEOUS-UI-ekspert |
| 5-ITERASJONS-agent | ORCHESTRATOR | `currentPhase == 5` | BYGGER, REVIEWER, DEBUGGER, DOKUMENTERER, BRUKERTEST-ekspert, YTELSE-ekspert, UIUX-ekspert, REFAKTORING-ekspert, SELF-HEALING-TEST-ekspert, GORGEOUS-UI-ekspert |
| 6-KVALITETSSIKRINGS-agent | ORCHESTRATOR | `currentPhase == 6` | REVIEWER, SIKKERHETS-agent, TEST-GENERATOR-ekspert, OWASP-ekspert, GDPR-ekspert, TILGJENGELIGHETS-ekspert, CROSS-BROWSER-ekspert, LASTTEST-ekspert, AI-GOVERNANCE-ekspert, YTELSE-ekspert |
| 7-PUBLISERINGS-agent | ORCHESTRATOR | `currentPhase == 7` | BYGGER, DOKUMENTERER, CICD-ekspert, MONITORING-ekspert, BACKUP-ekspert, INCIDENT-RESPONSE-ekspert, SRE-ekspert |

---

## AKTIVERINGSTABELL: BASIS-AGENTER (Nivå 1)

| Agent | Kalles av | Aktiveringstrigger | Autoritet |
|-------|-----------|-------------------|-----------|
| BYGGER-agent | MVP, ITERASJONS, ARKITEKTUR, PUBLISERINGS | Implementeringsoppgave | WRITE til kode |
| DEBUGGER-agent | ITERASJONS, MVP | Feilsituasjon | READ/WRITE for debugging |
| DOKUMENTERER-agent | Alle PROSESS-agenter | Dokumentasjonsbehov | WRITE til docs/ |
| PLANLEGGER-agent | OPPSTART, KRAV | Planleggingsbehov | READ-only + rådgiving |
| REVIEWER-agent | MVP, ITERASJONS, KVALITETSSIKRING | Code review | READ-only + feedback |
| SIKKERHETS-agent | KRAV, ARKITEKTUR, MVP, KVALITETSSIKRING | Sikkerhetssjekk | READ + varsling |
| VEILEDER-agent | Alle PROSESS-agenter, ORCHESTRATOR | Bruker ber om forklaring/veiledning | READ-only + nettsøk |

---

## AKTIVERINGSTABELL: EKSPERT-AGENTER (Nivå 3)

### Fase 1: Idé og visjon
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| PERSONA-ekspert | OPPSTART-agent | Personas + JTBD | OPP-04, OPP-05 |
| LEAN-CANVAS-ekspert | OPPSTART-agent | Forretningsmodell | OPP-06 |
| KONKURRANSEANALYSE-ekspert | OPPSTART-agent | Markedsanalyse | OPP-07 |

### Fase 2: Planlegg
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| WIREFRAME-ekspert | KRAV-agent | UI-design | KRAV-07 |
| API-DESIGN-ekspert | KRAV-agent, ARKITEKTUR-agent | API-spec | KRAV-08, ARK-04 |

### Fase 3: Arkitektur og sikkerhet
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| DATAMODELL-ekspert | ARKITEKTUR-agent | Database-design | ARK-02, ARK-03 |
| TRUSSELMODELLERINGS-ekspert | ARKITEKTUR-agent | STRIDE/DREAD | ARK-06 |

### Fase 4: MVP
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| HEMMELIGHETSSJEKK-ekspert | MVP-agent | Secrets management | MVP-03, F6-03 |
| CICD-ekspert | MVP-agent, PUBLISERINGS-agent | Pipeline-setup | MVP-04, F7-01 |
| SUPPLY-CHAIN-ekspert | MVP-agent | SAST + SBOM | MVP-05, MVP-06 |
| TEST-GENERATOR-ekspert | MVP-agent, KVALITETSSIKRINGS-agent | Test-generering | MVP-07, MVP-12, F6-01 |
| INFRASTRUKTUR-ekspert | MVP-agent | Miljø-setup | MVP-08 |
| DESIGN-TIL-KODE-ekspert | MVP-agent | Wireframe → Kode | MVP-10 |
| CODE-QUALITY-GATE-ekspert | MVP-agent | Kodekvalitet | MVP-14 |
| GORGEOUS-UI-ekspert | MVP-agent, ITERASJONS-agent | Design system + UI-implementasjon | MVP-00, MVP-10, ITR-10 |

> **Om MVP-00 (Design system foundation):** Pre-MVP oppgave som etablerer designsystem før øvrige MVP-oppgaver starter. Håndteres av GORGEOUS-UI-ekspert som hard gate i 4-MVP-agent Steg 3B (krever designSystem-felt i PROJECT-STATE.json, jf. PROJECT-STATE-SCHEMA.json).

### Fase 5: Bygg funksjonene
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| BRUKERTEST-ekspert | ITERASJONS-agent | Brukervalidering | F5-03 |
| YTELSE-ekspert | ITERASJONS-agent, KVALITETSSIKRINGS-agent | Ytelse | F5-04, F6-10 |
| UIUX-ekspert | ITERASJONS-agent | UI/UX-polering | F5-05 |
| REFAKTORING-ekspert | ITERASJONS-agent | Teknisk gjeld | F5-06 |
| SELF-HEALING-TEST-ekspert | ITERASJONS-agent | Test-vedlikehold | F5-07 |

### Fase 6: Test, sikkerhet og kvalitetssjekk
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| OWASP-ekspert | KVALITETSSIKRINGS-agent | OWASP Top 10 | F6-02 |
| GDPR-ekspert | KVALITETSSIKRINGS-agent | GDPR-compliance | F6-04 |
| TILGJENGELIGHETS-ekspert | KVALITETSSIKRINGS-agent | WCAG | F6-05 |
| CROSS-BROWSER-ekspert | KVALITETSSIKRINGS-agent | Nettleser-testing | F6-06 |
| LASTTEST-ekspert | KVALITETSSIKRINGS-agent | Lasttest | F6-07 |
| AI-GOVERNANCE-ekspert | KVALITETSSIKRINGS-agent | AI-audit | F6-09 |

### Fase 7: Publiser og vedlikehold
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| MONITORING-ekspert | PUBLISERINGS-agent | Monitoring-setup | F7-02, F7-03 |
| BACKUP-ekspert | PUBLISERINGS-agent | Backup + DR | F7-04, F7-05 |
| INCIDENT-RESPONSE-ekspert | PUBLISERINGS-agent | IR-plan | F7-06 |
| SRE-ekspert | PUBLISERINGS-agent | SLI/SLO | F7-07 |

### Fase-agnostiske eksperter
| Ekspert | Kalles av | Aktiveringstrigger | Oppgave-ID |
|---------|-----------|-------------------|------------|
| MIGRASJON-ekspert | Alle PROSESS ved behov | Migreringsbehov | Ved behov |
| PROMPT-INGENIØR-ekspert | Alle PROSESS ved behov | AI-prompts | Ved behov |
| TESTSKRIVER-ekspert | MVP-agent, ITERASJONS-agent, KVALITETSSIKRINGS-agent | Automatisert testgenerering og test coverage-analyse | MVP-07, F5-07, F6-01 |

### System-agenter (tillegg)
| Agent | Kalles av | Aktiveringstrigger | Oppgave-ID |
|-------|-----------|-------------------|------------|
| BROWNFIELD-SCANNER | AUTO-CLASSIFIER (steg 2) | Eksisterende kode oppdaget (>=3 kildekodefiler) | Steg 2 |

### Basis-agenter (tillegg)
| Agent | Kalles av | Aktiveringstrigger | Oppgave-ID |
|-------|-----------|-------------------|------------|
| VEILEDER-agent | CLAUDE.md boot steg 0 | Bruker velger "Spørre"-modus | Steg 0 |

### Profesjonell pakke — Ekspert-agenter (v2.0)

| Agent | Fil | Kalles av | Fase | Krav |
|-------|-----|-----------|------|------|
| RLS-TESTER-ekspert | `agenter/ekspert/RLS-TESTER-ekspert.md` | 4-MVP, 6-KVALITETSSIKRINGS | F4, F6 | MÅ (multi-tenant, STANDARD+) |
| FEATURE-FLAGS-ekspert | `agenter/ekspert/FEATURE-FLAGS-ekspert.md` | 4-MVP, 5-ITERASJONS | F4, F5 | MÅ (STANDARD+) |
| SCHEMA-MIGRASJON-ekspert | `agenter/ekspert/SCHEMA-MIGRASJON-ekspert.md` | 3-ARKITEKTUR, 4-MVP, 5-ITERASJONS | F3, F4, F5 | MÅ (STANDARD+) |
| HALLUSINASJON-DETEKTOR-ekspert | `agenter/ekspert/HALLUSINASJON-DETEKTOR-ekspert.md` | 5-ITERASJONS, 6-KVALITETSSIKRINGS | F5, F6 | MÅ (STANDARD+) |

---

## TILGANGSKONTROLL

### Skrive-tilgang (WRITE)
| Agent-type | Skrive-tilgang til |
|------------|-------------------|
| BASIS-agenter | Kun innenfor sitt domene (BYGGER → src/, DOKUMENTERER → docs/) |
| PROSESS-agenter | PROJECT-STATE.json, HANDOFF-filer |
| EKSPERT-agenter | Kun leveranse-filer, ikke kode |
| SYSTEM-agenter | .ai/-mappen, SESSION-filer |

### Lese-tilgang (READ)
Alle agenter har READ-tilgang til alle filer relevante for oppgaven.

### SUPERVISOR-MODE (Parallell READ)
ORCHESTRATOR kan aktivere flere EKSPERT-agenter i READ-ONLY mode for parallell analyse.

---

## BLOKKERTE KALL (ALDRI tillatt)

| Fra | Til | Begrunnelse |
|-----|-----|-------------|
| EKSPERT-agent | PROSESS-agent | Hierarki-brudd |
| BASIS-agent | ORCHESTRATOR | Hierarki-brudd |
| EKSPERT-agent | EKSPERT-agent | Må gå via PROSESS |
| Alle | PHASE-GATES direkte | Må gå via ORCHESTRATOR |

---

## VALIDERING

Før en agent kaller en annen, skal følgende sjekkes:

```
1. ER KALL TILLATT?
   └─ Sjekk denne tabellen for kaller → mottaker
   └─ Hvis ikke i tabellen → BLOKKERT

2. ER INTENSITETSNIVÅ RIKTIG?
   └─ Sjekk PROJECT-STATE.json → intensityLevel
   └─ Sjekk FUNKSJONS-MATRISE for MÅ/BØR/KAN/IKKE
   └─ Hvis IKKE for nivået → SKIP

3. ER FASE RIKTIG?
   └─ Sjekk PROJECT-STATE.json → currentPhase
   └─ Sjekk oppgave-ID i KLASSIFISERING-METADATA-SYSTEM
   └─ Hvis feil fase → BLOKKERT
```

---

## AUDIT-LOGGING

Alle agent-kall skal logges med følgende format:

```
[TIMESTAMP] [KALLER-ID] → [MOTTAKER-ID] | TRIGGER: [årsak] | STATUS: [ALLOWED/BLOCKED]
```

**Eksempel:**
```
[2026-02-05T10:30:00Z] [MVP] → [CICD-ekspert] | TRIGGER: MVP-04 | STATUS: ALLOWED
[2026-02-05T10:31:00Z] [GDPR-ekspert] → [OWASP-ekspert] | TRIGGER: cross-check | STATUS: BLOCKED (hierarki-brudd)
```

---

## VERSJONSKONTROLL

| Felt | Verdi |
|------|-------|
| Versjon | 2.1.0 |
| Opprettet | 2026-02-05 |
| Sist oppdatert | 2026-04-22 |
| Kompatibel med | Agent-system v3.5.0 |

### Endringslogg
| Versjon | Dato | Endring |
|---------|------|---------|
| 1.0.0 | 2026-02-05 | Initial versjon med komplett agent-register |
| 2.0.0 | 2026-04-19 | Oppdatert for Kit CC profesjonell pakke v3 (30 nye komponenter) |
| 2.1.0 | 2026-04-22 | Korrigerte agent-tellinger: 33→37 eksperter, 53→57 totalt (inkluderer profesjonell-pakke-eksperter RLS-TESTER/FEATURE-FLAGS/SCHEMA-MIGRASJON/HALLUSINASJON-DETEKTOR) |

---

*Relatert:*
- `KLASSIFISERING-METADATA-SYSTEM.md` - Oppgave-til-agent mapping
- `../agenter/system/agent-AGENT-PROTOCOL.md` - Kommunikasjonsprotokoll
- `../agenter/system/agent-ORCHESTRATOR.md` - Koordineringslogikk
- `../VERSION.json` - Autoritativ agent-fasit (6/7/7/37/57)

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
