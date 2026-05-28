# AGENT-DEPENDENCIES v2.1

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for autoritativ Kit CC-versjon.

> **v2.1 — 2026-04-22** — Oppdatert for Kit CC profesjonell pakke v3 (30 nye komponenter)

> Komplett oversikt over agent-avhengigheter i Kit CC.

---

## FORMÅL

Dokumenterer:
- Hvilke agenter som avhenger av hvilke
- Informasjonsflyt mellom agenter
- Kritiske avhengighetskjeder
- Fallback-strategier

---

## AVHENGIGHETS-TYPER

| Type | Symbol | Beskrivelse |
|------|--------|-------------|
| HARD | → | Mottaker KAN IKKE kjøre uten avsender |
| SOFT | ⇢ | Mottaker KAN kjøre, men fungerer bedre med avsender |
| INFO | ⋯> | Mottaker leser informasjon fra avsender |
| SIGNAL | ⟶ | Avsender signaliserer til mottaker |

---

## SYSTEM-AVHENGIGHETER (Nivå 0)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SYSTEM-AGENT AVHENGIGHETER                   │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   ORCHESTRATOR  │
                    │   (Sentral hub) │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AUTO-CLASSIFIER │ │ CONTEXT-LOADER  │ │  PHASE-GATES    │
│                 │ │                 │ │                 │
│ → ORCHESTRATOR  │ │ → ORCHESTRATOR  │ │ → ORCHESTRATOR  │
│ ⋯> PROJECT-STATE│ │ ⋯> PROJECT-STATE│ │ ⋯> PROJECT-STATE│
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                   │                   │
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ AGENT-PROTOCOL  │
                    │ (Referanse)     │
                    │                 │
                    │ ⋯> Alle agenter │
                    └─────────────────┘
```

### Detaljert avhengighetstabell

| Agent | Avhenger av (HARD) | Avhenger av (SOFT) | Leser fra |
|-------|--------------------|--------------------|-----------|
| ORCHESTRATOR | Ingen | PHASE-GATES | PROJECT-STATE, SESSION-HANDOFF |
| AUTO-CLASSIFIER | ORCHESTRATOR | Ingen | PROJECT-STATE |
| CONTEXT-LOADER | ORCHESTRATOR | Ingen | PROJECT-STATE, alle filer |
| PHASE-GATES | ORCHESTRATOR | Ingen | PROJECT-STATE, leveranser |
| AGENT-PROTOCOL | Ingen | Ingen | Ingen (er referanse) |

---

## PROSESS-AVHENGIGHETER (Nivå 2)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROSESS-AGENT AVHENGIGHETER                   │
└─────────────────────────────────────────────────────────────────┘

ORCHESTRATOR
     │
     │ → (HARD: aktiveringssignal)
     │
     ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ OPPSTART │ → │   KRAV   │ → │ARKITEKTUR│ → │   MVP    │
│  (Fase 1)│    │ (Fase 2) │    │ (Fase 3) │    │ (Fase 4) │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
     ┌───────────────────────────────────────────────┘
     │
     ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│ITERASJON│ → │  KVALITET │ → │PUBLISERING│
│ (Fase 5) │    │ (Fase 6) │    │ (Fase 7) │
└──────────┘    └──────────┘    └──────────┘
```

### Informasjonsflyt mellom faser

| Fra fase | Til fase | Kritisk informasjon |
|----------|----------|---------------------|
| 1 OPPSTART | 2 KRAV | Personas, visjon, risikoregister |
| 2 KRAV | 3 ARKITEKTUR | User stories, PRD, sikkerhetskrav |
| 3 ARKITEKTUR | 4 MVP | Tech-stack, database-schema, API-design |
| 4 MVP | 5 ITERASJON | Fungerende prototype, test-resultater |
| 5 ITERASJON | 6 KVALITET | Feature-complete kodebase |
| 6 KVALITET | 7 PUBLISERING | Validert kodebase, compliance-docs |

---

## BASIS-AVHENGIGHETER (Nivå 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                     BASIS-AGENT AVHENGIGHETER                    │
└─────────────────────────────────────────────────────────────────┘

                    PROSESS-AGENT
                    (Kaller)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ BYGGER  │    │DEBUGGER │    │DOKUMEN- │
    │         │    │         │    │ TERER   │
    └─────────┘    └─────────┘    └─────────┘
         │               │               │
         │ ⇢            │ ⇢            │ ⋯>
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │REVIEWER │    │SIKKERHETS│   │PLANLEGGER│
    │         │    │         │    │         │
    └─────────┘    └─────────┘    └─────────┘
```

### Basis-agent avhengighetsmatrise

| Agent | HARD avhengighet | SOFT avhengighet | Kommuniserer med |
|-------|------------------|------------------|------------------|
| BYGGER | PROSESS-agent | REVIEWER, SIKKERHETS | Alle |
| DEBUGGER | PROSESS-agent | BYGGER | BYGGER, REVIEWER |
| DOKUMENTERER | PROSESS-agent | Alle | Alle |
| PLANLEGGER | PROSESS-agent | Ingen | DOKUMENTERER |
| REVIEWER | PROSESS-agent | BYGGER | BYGGER, SIKKERHETS |
| SIKKERHETS | PROSESS-agent | Ingen | BYGGER, REVIEWER |
| VEILEDER | Ingen (read-only) | Ingen | Ingen (kalles av CLAUDE.md boot steg 0) |

---

## SYSTEM-AVHENGIGHETER (Tillegg)

### BROWNFIELD-SCANNER

| Agent | HARD avhengighet | SOFT avhengighet | Kommuniserer med |
|-------|------------------|------------------|------------------|
| BROWNFIELD-SCANNER | AUTO-CLASSIFIER | Ingen | AUTO-CLASSIFIER (kalles fra steg 2) |

---

## EKSPERT-AVHENGIGHETER (Nivå 3) — 37 eksperter

### Fase 1: Idé og visjon (3)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| PERSONA-ekspert | OPPSTART-agent | KRAV-agent (via OPPSTART) |
| LEAN-CANVAS-ekspert | OPPSTART-agent, PERSONA | KRAV-agent |
| KONKURRANSEANALYSE-ekspert | OPPSTART-agent, PERSONA | KRAV-agent |

### Fase 2: Planlegg (2)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| WIREFRAME-ekspert | KRAV-agent, PERSONA-ekspert | ARKITEKTUR-agent, MVP-agent, UIUX-ekspert (handoff) |
| API-DESIGN-ekspert | KRAV-agent, ARKITEKTUR-agent | MVP-agent, DATAMODELL-ekspert |

### Fase 3: Arkitektur og sikkerhet (2)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| DATAMODELL-ekspert | ARKITEKTUR-agent, API-DESIGN-ekspert | MVP-agent, SCHEMA-MIGRASJON-ekspert |
| TRUSSELMODELLERINGS-ekspert | ARKITEKTUR-agent, SIKKERHETS | MVP-agent, OWASP-ekspert |

### Fase 4: MVP (8)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| HEMMELIGHETSSJEKK-ekspert | MVP-agent | KVALITETSSIKRINGS-agent, CICD-ekspert |
| CICD-ekspert | MVP-agent, HEMMELIGHETSSJEKK | PUBLISERINGS-agent |
| SUPPLY-CHAIN-ekspert | MVP-agent | KVALITETSSIKRINGS-agent |
| TEST-GENERATOR-ekspert | BYGGER-agent output | MVP-agent, KVALITETSSIKRINGS-agent |
| INFRASTRUKTUR-ekspert | MVP-agent, ARKITEKTUR-agent | CICD-ekspert, MONITORING-ekspert |
| DESIGN-TIL-KODE-ekspert | WIREFRAME-ekspert, BYGGER-agent | MVP-agent, GORGEOUS-UI-ekspert |
| CODE-QUALITY-GATE-ekspert | Ingen (selvstendig) | MVP-agent, ITERASJONS-agent |
| GORGEOUS-UI-ekspert | MVP-agent (Steg 3B), BYGGER-agent | MVP-agent (MVP-00, MVP-10), ITERASJONS-agent (ITR-10) |

### Fase 5: Bygg funksjonene (5)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| BRUKERTEST-ekspert | ITERASJONS-agent, PERSONA-ekspert | UIUX-ekspert, WIREFRAME-ekspert |
| YTELSE-ekspert | ITERASJONS-agent, MONITORING-ekspert (data) | KVALITETSSIKRINGS-agent |
| UIUX-ekspert | ITERASJONS-agent, WIREFRAME-ekspert, BRUKERTEST-ekspert | KVALITETSSIKRINGS-agent |
| REFAKTORING-ekspert | REVIEWER-agent, CODE-QUALITY-GATE-ekspert | ITERASJONS-agent |
| SELF-HEALING-TEST-ekspert | TEST-GENERATOR-ekspert, BRUKERTEST-ekspert | KVALITETSSIKRINGS-agent |

### Fase 6: Test, sikkerhet og kvalitetssjekk (6)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| OWASP-ekspert | KVALITETSSIKRINGS-agent, TRUSSELMODELLERINGS | PUBLISERINGS-agent |
| GDPR-ekspert | KVALITETSSIKRINGS-agent | PUBLISERINGS-agent, BACKUP-ekspert |
| TILGJENGELIGHETS-ekspert | KVALITETSSIKRINGS-agent, UIUX-ekspert | PUBLISERINGS-agent |
| CROSS-BROWSER-ekspert | KVALITETSSIKRINGS-agent, TEST-GENERATOR | PUBLISERINGS-agent |
| LASTTEST-ekspert | KVALITETSSIKRINGS-agent, YTELSE-ekspert | PUBLISERINGS-agent, SRE-ekspert |
| AI-GOVERNANCE-ekspert | KVALITETSSIKRINGS-agent | PUBLISERINGS-agent |

### Fase 7: Publiser og vedlikehold (4)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| MONITORING-ekspert | PUBLISERINGS-agent, INFRASTRUKTUR-ekspert | Produksjon |
| BACKUP-ekspert | PUBLISERINGS-agent, GDPR-ekspert | Produksjon |
| INCIDENT-RESPONSE-ekspert | PUBLISERINGS-agent, MONITORING-ekspert, SRE-ekspert | Produksjon (IR-plan) |
| SRE-ekspert | PUBLISERINGS-agent, MONITORING-ekspert, LASTTEST-ekspert | Produksjon (SLI/SLO) |

### Fase-agnostiske eksperter (3)

| Ekspert | Avhenger av | Leverer til |
|---------|-------------|-------------|
| MIGRASJON-ekspert | Alle PROSESS ved behov | Aktiv fase-agent |
| PROMPT-INGENIØR-ekspert | Alle PROSESS ved behov | Aktiv fase-agent |
| TESTSKRIVER-ekspert | BYGGER-agent output | MVP-agent, ITERASJONS-agent, KVALITETSSIKRINGS-agent |

### Profesjonell pakke — Eksperter (4)

| Ekspert | Avhenger av | Leverer til | Utløses av |
|---------|-------------|-------------|-----------|
| RLS-TESTER-ekspert | DATAMODELL-ekspert, SIKKERHETS | MVP-agent, KVALITETSSIKRINGS-agent | Multi-tenant prosjekt (STANDARD+) |
| FEATURE-FLAGS-ekspert | MVP-agent, ITERASJONS-agent | Produksjon (gradual rollout) | STANDARD+ |
| SCHEMA-MIGRASJON-ekspert | DATAMODELL-ekspert, BYGGER-agent | MVP-agent, ITERASJONS-agent, PUBLISERINGS-agent | STANDARD+ (DB-endringer) |
| HALLUSINASJON-DETEKTOR-ekspert | AI-GOVERNANCE-ekspert, TEST-GENERATOR-ekspert | ITERASJONS-agent, KVALITETSSIKRINGS-agent | AI-drevne features (STANDARD+) |

---

## KRITISKE AVHENGIGHETSKJEDER

### Kjede 1: Sikkerhetskritisk

```
SIKKERHETS-agent
      │
      ▼
TRUSSELMODELLERINGS-ekspert
      │
      ▼
HEMMELIGHETSSJEKK-ekspert
      │
      ▼
OWASP-ekspert
      │
      ▼
Produksjon
```

**Konsekvens ved brudd:** Sikkerhetssårbarheter i produksjon

### Kjede 2: Datakritisk

```
DATAMODELL-ekspert
      │
      ▼
BYGGER-agent (database-migrering)
      │
      ▼
GDPR-ekspert
      │
      ▼
BACKUP-ekspert
      │
      ▼
Produksjon
```

**Konsekvens ved brudd:** Datatap eller compliance-brudd

### Kjede 3: Deploy-kritisk

```
BYGGER-agent
      │
      ▼
TEST-GENERATOR-ekspert
      │
      ▼
CICD-ekspert
      │
      ▼
MONITORING-ekspert
      │
      ▼
Produksjon
```

**Konsekvens ved brudd:** Ustabil deployment

---

## FALLBACK-STRATEGIER

### Når avhengighet feiler

| Avhengighet-type | Strategi |
|------------------|----------|
| HARD | STOPP - Kan ikke fortsette uten |
| SOFT | FORTSETT med advarsel |
| INFO | FORTSETT - bruk default/cache |
| SIGNAL | RETRY med backoff |

### Spesifikke fallbacks

| Mangler | Fallback |
|---------|----------|
| PERSONA-ekspert | OPPSTART-agent lager forenklet persona |
| TRUSSELMODELLERINGS-ekspert | SIKKERHETS-agent gjør basis STRIDE |
| CICD-ekspert | Manuell deployment |
| MONITORING-ekspert | Basis logging |

---

## AVHENGIGHETS-VALIDERING

### Før fase-start

```
1. Identifiser alle HARD avhengigheter for fasen
2. Verifiser at alle er tilgjengelige
3. HVIS mangler:
   └─ Vis manglende avhengigheter
   └─ Foreslå løsning
   └─ STOPP til løst

4. Identifiser alle SOFT avhengigheter
5. Logg advarsler for manglende
6. Fortsett
```

### Eksempel-output

```markdown
## AVHENGIGHETSSJEKK - FASE 4

HARD AVHENGIGHETER:
✓ ARKITEKTUR-agent output tilgjengelig
✓ tech-stack-decision.md eksisterer
✓ database-schema.sql eksisterer
✓ api-architecture.md eksisterer

SOFT AVHENGIGHETER:
✓ REVIEWER-agent tilgjengelig
⚠ CICD-ekspert: Krever GitHub Actions setup

INFO AVHENGIGHETER:
✓ PROJECT-STATE.json lesbar
✓ SESSION-HANDOFF.md lesbar

RESULTAT: KLAR TIL START (1 advarsel)
```

---

## SIRKULÆR AVHENGIGHETS-SJEKK

### Forbudte sykluser

```
❌ Agent A → Agent B → Agent A (direkte syklus)
❌ Fase N → Fase N-1 (tilbakegående fasehopp)
❌ EKSPERT → PROSESS → EKSPERT (hierarki-brudd)
```

### Tillatte mønstre

```
✓ PROSESS → BASIS → EKSPERT (nedover)
✓ EKSPERT → (info) → EKSPERT (info-flyt, ikke kall)
✓ Fase N → (rollback) → Fase N-1 (eksplisitt rollback)
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
| 1.0.0 | 2026-02-05 | Initial versjon med 16 eksperter |
| 2.0.0 | 2026-04-19 | Oppdatert for profesjonell pakke v3 |
| 2.1.0 | 2026-04-22 | Lagt til 21 manglende eksperter (alle 37 nå dokumentert): API-DESIGN, WIREFRAME, AI-GOVERNANCE, BRUKERTEST, CROSS-BROWSER, DESIGN-TIL-KODE, FEATURE-FLAGS, HALLUSINASJON-DETEKTOR, INCIDENT-RESPONSE, INFRASTRUKTUR, LASTTEST, MIGRASJON, PROMPT-INGENIØR, REFAKTORING, RLS-TESTER, SCHEMA-MIGRASJON, SELF-HEALING-TEST, TEST-GENERATOR, TILGJENGELIGHETS, UIUX, YTELSE. Organisert etter fase (1-7) + fase-agnostiske + profesjonell pakke. |

---

*Relatert:*
- `CALLING-REGISTRY.md` - Hvem kaller hvem
- `ARCHITECTURE-DIAGRAM.md` - Visuell arkitektur
- `../agenter/system/agent-ORCHESTRATOR.md` - Koordinering

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
