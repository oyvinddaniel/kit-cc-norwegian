# doc-FILKATALOG.md — Komplett filkatalog for Kit CC

> **SSOT for alle filer i Kit CC, organisert etter lag.** Referert fra CLAUDE.md v3.5.0.
> Versjon: 2.1 | Oppdatert: 2026-04-22 | Forrige: 1.0.0 (2026-02-23)
>
> **Endringslogg v2.1:** Korrigert tellinger (33 protokoller, 6 system-agenter i Lag 3).
>
> **Endringslogg v2.0:**
> - Komplett dekning av alle ~155 filer i Kit CC (tidligere ~25 % dekning).
> - Lag 2 delt i underkategorier: Prosjektfiler, Basis-agenter, Ekspert-agenter, Prosess-agenter, Protokoller, Extensions, Docs, Klassifisering, Maler.
> - Alle 33 protokoller, 8 extensions, 5 docs, 10 maler, 37 ekspert-agenter, 7 basis-agenter, 7 prosess-agenter og 11 klassifiseringsfiler listet.
> - Lag 3 begrenset til 6 system-agenter + FUNKSJONSOVERSIKT-KOMPLETT + CHECKPOINT-HISTORY (i tråd med CLAUDE.md v3.5.0).
> - Ny seksjon: Støttefiler (scripts, hooks-library, templates/) — ikke del av lag-arkitekturen, men del av Kit CC.
> - Lenke til `CALLING-REGISTRY.md` lagt til for "hvem kaller hvem".

**Se også:**
- `Kit CC/Agenter/klassifisering/CALLING-REGISTRY.md` — Oversikt over hvilke agenter/filer som kaller hvilke.
- `Kit CC/Agenter/klassifisering/AGENT-DEPENDENCIES.md` — Avhengighetsgraf.
- `Kit CC/Agenter/klassifisering/FUNKSJONSOVERSIKT-KOMPLETT.md` — Funksjonell beskrivelse av alt.

---

## Lag 1 — Arbeidsbord (alltid i kontekst, ≤ 4 filer)

Filer som AI starter med. Resten hentes on-demand via mission briefing.

| Fil | Formål | Plassering |
|-----|--------|------------|
| `PROJECT-STATE.json` | Prosjektets tilstand og klassifisering | `.ai/` |
| `{N}-{NAVN}-agent.md` | Aktiv fase-agent (én av sju) | `Kit CC/Agenter/agenter/prosess/` |
| `MISSION-BRIEFING-FASE-{N}.md` | Kompakt kontekstpakke for aktiv fase | `.ai/` |
| `PROGRESS-LOG.md` | Append-only handlingslogg (memory-independent) | `.ai/` |
| `MONITOR-ERRORS.json` | Nettleser-feil fanget av Monitor (fase 4/5) | `.ai/` |
| `MONITOR-PROBES.json` | Browser debug probes — AI ↔ nettleser (fase 4/5) | `.ai/` |

> Disse filene gir agenten 100 % av konteksten den trenger for å starte arbeid i en fase.

---

## Lag 2 — Skrivebordsskuff (hentes on-demand)

### 2.1 Prosjektfiler

| Fil | Formål | Plassering |
|-----|--------|------------|
| `SESSION-HANDOFF.md` | Overlevering mellom chat-sesjoner | `.ai/` |
| Fase-leveranser | Dokumenter fra forrige faser (PRD, arkitektur osv.) | `docs/` |

### 2.2 Basis-agenter (`Kit CC/Agenter/agenter/basis/`)

| Fil | Formål |
|-----|--------|
| `BYGGER-agent.md` | Implementerer kode |
| `DEBUGGER-agent.md` | Finner og fikser feil |
| `DOKUMENTERER-agent.md` | Skriver dokumentasjon |
| `PLANLEGGER-agent.md` | Bryter ned oppgaver |
| `REVIEWER-agent.md` | Gjennomgår kode |
| `SIKKERHETS-agent.md` | Sikkerhetsvurdering |
| `VEILEDER-agent.md` | Veileder-agent for spørremodus (read-only) |

### 2.3 Ekspert-agenter (`Kit CC/Agenter/agenter/ekspert/`) — 37 stk

| Fil | Formål |
|-----|--------|
| `AI-GOVERNANCE-ekspert.md` | AI-styring, modellvalg, policyer |
| `API-DESIGN-ekspert.md` | API-design (REST/GraphQL) |
| `BACKUP-ekspert.md` | Backup/restore-strategi |
| `BRUKERTEST-ekspert.md` | Brukertest-opplegg |
| `CICD-ekspert.md` | CI/CD-pipelines |
| `CODE-QUALITY-GATE-ekspert.md` | Kodekvalitetsporter |
| `CROSS-BROWSER-ekspert.md` | Cross-browser-test |
| `DATAMODELL-ekspert.md` | Datamodellering |
| `DESIGN-TIL-KODE-ekspert.md` | Figma→kode-konvertering |
| `FEATURE-FLAGS-ekspert.md` | Feature flags-strategi |
| `GDPR-ekspert.md` | GDPR/personvern |
| `GORGEOUS-UI-ekspert.md` | Visuell polish |
| `HALLUSINASJON-DETEKTOR-ekspert.md` | Hallusinasjon-sjekk |
| `HEMMELIGHETSSJEKK-ekspert.md` | Secret scanning |
| `INCIDENT-RESPONSE-ekspert.md` | Hendelseshåndtering |
| `INFRASTRUKTUR-ekspert.md` | IaC/infrastruktur |
| `KONKURRANSEANALYSE-ekspert.md` | Markedsanalyse |
| `LASTTEST-ekspert.md` | Last-/stresstest |
| `LEAN-CANVAS-ekspert.md` | Lean Canvas-oppsett |
| `MIGRASJON-ekspert.md` | Migrasjonsstrategi |
| `MONITORING-ekspert.md` | Observability/monitoring |
| `OWASP-ekspert.md` | OWASP Top 10-sjekk |
| `PERSONA-ekspert.md` | Personautvikling |
| `PROMPT-INGENIØR-ekspert.md` | Prompt engineering |
| `REFAKTORING-ekspert.md` | Refaktorering |
| `RLS-TESTER-ekspert.md` | Row-level security-test |
| `SCHEMA-MIGRASJON-ekspert.md` | DB-skjemamigrasjon |
| `SELF-HEALING-TEST-ekspert.md` | Self-healing-tester |
| `SRE-ekspert.md` | Site Reliability Engineering |
| `SUPPLY-CHAIN-ekspert.md` | Supply chain-sikkerhet |
| `TEST-GENERATOR-ekspert.md` | Testgenerering |
| `TESTSKRIVER-ekspert.md` | Testskriving |
| `TILGJENGELIGHETS-ekspert.md` | WCAG/a11y |
| `TRUSSELMODELLERINGS-ekspert.md` | Trusselmodellering |
| `UIUX-ekspert.md` | UX-design |
| `WIREFRAME-ekspert.md` | Wireframes |
| `YTELSE-ekspert.md` | Ytelse/performance |

### 2.4 Prosess-agenter (`Kit CC/Agenter/agenter/prosess/`) — 7 stk

> Aktiv fase-agent lever i Lag 1; de andre seks er Lag 2 og hentes ved behov (f.eks. rollback).

| Fil | Fase |
|-----|------|
| `1-OPPSTART-agent.md` | 1 — Idé og visjon |
| `2-KRAV-agent.md` | 2 — Planlegg (krav/PRD) |
| `3-ARKITEKTUR-agent.md` | 3 — Arkitektur |
| `4-MVP-agent.md` | 4 — MVP |
| `5-ITERASJONS-agent.md` | 5 — Bygg funksjonene |
| `6-KVALITETSSIKRINGS-agent.md` | 6 — Kvalitetssjekk |
| `7-PUBLISERINGS-agent.md` | 7 — Publiser |

### 2.5 Protokoller (`Kit CC/Agenter/agenter/system/`) — 33 stk

| Fil | Formål |
|-----|--------|
| `protocol-AI-COST-ALERTS.md` | AI-kostnadsvarsler og budsjettgrenser |
| `protocol-BYGGEMODUS.md` | Byggemodus-klassifisering (ai-bestemmer/samarbeid/detaljstyrt) |
| `protocol-CLAUDE-CODE-HOOKS.md` | Claude Code-hooks-oppsett og bruk |
| `protocol-CODE-QUALITY-GATES.md` | Kvalitetskontroll-triggers |
| `protocol-COMPREHENSION-GATE.md` | Forståelsessjekk før store endringer |
| `protocol-CRASH-RECOVERY.md` | Krasj-deteksjon og gjenoppretting |
| `protocol-DEV-SERVER.md` | Dev-server-oppstart og kontroll |
| `protocol-DRIFT-DETECTOR.md` | Deteksjon av drift fra spec |
| `protocol-DYNAMISK-AGENT-VALG.md` | Dynamisk agent-valg basert på oppgave |
| `protocol-ERROR-AUTOFIX.md` | Automatisk feilhåndtering via Monitor |
| `protocol-FASEOVERGANGSSPORING.md` | Sporing av fase-overganger |
| `protocol-INTEGRASJONS-OPPSETT.md` | Integrasjons-oppsett (Supabase, Stripe, osv.) |
| `protocol-INTEGRATIONS-SCHEMA.md` | Skjema for integrasjoner |
| `protocol-KEY-MANAGEMENT.md` | Nøkkelrotasjon og secrets-håndtering |
| `protocol-KONTEKSTBUDSJETT.md` | Kontekstbudsjett-terskler og pause-prosedyre |
| `protocol-MANDATORY-RUNTIME-VERIFICATION.md` | Obligatorisk runtime-verifisering |
| `protocol-MCP-GATEWAY-GUARD.md` | MCP-gateway-sikring |
| `protocol-MEMORY-HARDENING.md` | Minne-/tilstandshardening |
| `protocol-MODULREGISTRERING.md` | Modulregistrering og "Vis funksjoner" |
| `protocol-MONITOR-OPPSETT.md` | Monitor oppstartsprotokoll |
| `protocol-MULTI-TENANT-REKLASSIFISERING.md` | Reklassifisering for multi-tenant |
| `protocol-PII-SANITERING.md` | PII-sanering i logger/feilmeldinger |
| `protocol-PROFESJONELL-PAKKE.md` | Profesjonell-pakke (pro-nivå) |
| `protocol-PROGRESS-LOG.md` | Handlingslogg-format og triggere |
| `protocol-PROMPT-INJECTION-DEFENSE.md` | Vern mot prompt-injeksjon |
| `protocol-REFINEMENT-CAP.md` | Grense for iterativ forbedring |
| `protocol-SLACK-ALERT-STRUKTUR.md` | Struktur for Slack-varsler |
| `protocol-SYSTEM-COMMUNICATION.md` | System-kommunikasjonsstandard |
| `protocol-TASK-COMPLEXITY-ASSESSMENT.md` | Oppgavekompleksitet-vurdering |
| `protocol-VERIFY-BEFORE-MISSING.md` | Obligatorisk søk før "mangler"-konklusjon |

### 2.6 Extensions (`Kit CC/Agenter/agenter/system/`) — 8 stk

| Fil | Formål |
|-----|--------|
| `extension-DESIGN-QUALITY.md` | Designkvalitetsvurdering |
| `extension-DESIGN-REACT-TAILWIND.md` | React + Tailwind-mønstre |
| `extension-GIT-FLOW-VIBECODER.md` | Git-flow for vibecoders |
| `extension-GITHUB-BRANCH-PROTECTION.md` | GitHub branch protection-oppsett |
| `extension-REPLICATE-IMAGES.md` | Bildegenerering via Replicate |
| `extension-STAGING-8-STEG.md` | 8-stegs staging-prosess |
| `extension-STATUS-PAGE-SETUP.md` | Status-side-oppsett |
| `extension-VIBEKODER-GUIDE.md` | Guide for ny-vibecoder-nivå |

### 2.7 Docs (`Kit CC/Agenter/agenter/system/`) — 5 stk

| Fil | Formål |
|-----|--------|
| `doc-FILKATALOG.md` | Denne filen — SSOT for alle filer |
| `doc-FUNKSJONS-BESKRIVELSER-VIBEKODER.md` | Funksjoner forklart for vibecoders |
| `doc-INTENSITY-MATRIX.md` | Intensitetsnivå-detaljer (MÅ/BØR/KAN pr. nivå) |
| `doc-NAVNEKONVENSJON.md` | Navnekonvensjon for filer |
| `doc-QUICK-REFERENCE-TASK-QUALITY.md` | Rask referanse: oppgave- og kvalitetsporter |

### 2.8 Klassifisering (`Kit CC/Agenter/klassifisering/`) — 11 stk

| Fil | Formål |
|-----|--------|
| `KLASSIFISERING-METADATA-SYSTEM.md` | MÅ/BØR/KAN-regler og rammeverk (SSOT for regler) |
| `AGENT-DEPENDENCIES.md` | Avhengigheter mellom agenter |
| `ARCHITECTURE-DIAGRAM.md` | Arkitekturdiagram |
| `CALLING-REGISTRY.md` | "Hvem kaller hvem"-register |
| `ERROR-CODE-REGISTRY.md` | Registrerte feilkoder |
| `METRICS-KPI.md` | Systemets KPI-er |
| `PROJECT-STATE-SCHEMA.json` | JSON Schema for PROJECT-STATE.json |
| `ROLLBACK-PROTOCOL.md` | Rollback-prosedyre |
| `TASK-CLASSIFICATION.md` | Klassifisering av oppgaver |
| `ZONE-AUTONOMY-GUIDE.md` | Autonomisoner (hva AI kan gjøre alene) |
| `FUNKSJONSOVERSIKT-KOMPLETT.md` | Komplett funksjonsoversikt (Lag 3 — se nedenfor) |

> NB: `FUNKSJONSOVERSIKT-KOMPLETT.md` ligger i klassifisering-mappen, men er klassifisert som Lag 3 (arkiv).

### 2.9 Maler (`Kit CC/Agenter/maler/`) — 10 stk

| Fil | Formål |
|-----|--------|
| `MAL-BASIS.md` | Mal for nye basis-agenter |
| `MAL-EKSPERT.md` | Mal for nye ekspert-agenter |
| `MAL-PROSESS.md` | Mal for nye prosess-agenter |
| `MAL-SYSTEM.md` | Mal for nye system-agenter |
| `MISSION-BRIEFING-MAL.md` | Mal for MISSION-BRIEFING-FASE-{N}.md |
| `MODUL-SPEC-MAL.md` | Mal for modul-spec |
| `MODULREGISTER-MAL.md` | Mal for modulregister |
| `PROGRESS-LOG-MAL.md` | Mal for PROGRESS-LOG.md |
| `SESSION-HANDOFF-MAL.md` | Mal for SESSION-HANDOFF.md |
| `PHASE-SUMMARY-MAL.md` | Mal for fase-sammendrag |

---

## Lag 3 — Arkiv (kun ved fase-overgang, krasj eller kompleks routing)

### 3.1 System-agenter (`Kit CC/Agenter/agenter/system/`) — 6 stk

| Fil | Formål |
|-----|--------|
| `agent-ORCHESTRATOR.md` | Sentral koordinering — kjører ved fase-overgang (steg 7) |
| `agent-AUTO-CLASSIFIER.md` | Klassifiserer prosjektet — kjører kun ved nytt prosjekt (steg 3) |
| `agent-BROWNFIELD-SCANNER.md` | 25-agents sverm for eksisterende kode |
| `agent-CONTEXT-LOADER.md` | Kontekst-pakking on-demand |
| `agent-PHASE-GATES.md` | Kvalitetsvalidering ved fase-overgang |
| `agent-AGENT-PROTOCOL.md` | Kommunikasjonsstandard mellom agenter (referanse) |

### 3.2 Øvrige arkivfiler

| Fil | Formål | Plassering |
|-----|--------|------------|
| `FUNKSJONSOVERSIKT-KOMPLETT.md` | Alle funksjoner forklart (referanse, gjenopprettet 2026-04-22) | `Kit CC/Agenter/klassifisering/` |
| `CHECKPOINT-HISTORY/` | Lagringspunkter for rollback | `.ai/` |

---

## Støttefiler (del av Kit CC, men utenfor lag-arkitekturen)

Disse er operasjonelle ressurser (scripts, hooks, templates). De kalles ikke direkte fra fase-agenter, men brukes av installasjon/CI/hendelsesmaler.

### S.1 Kit CC-rotfiler

| Fil | Formål | Plassering |
|-----|--------|------------|
| `CLAUDE.md` | Startfil og boot-sekvens (leses automatisk) | Rot |

### S.2 Agenter-rotfiler (`Kit CC/Agenter/`) — 4 stk

| Fil | Formål |
|-----|--------|
| `AI-OPPGAVER.json` | AI-oppgaveregister |
| `AI-BYGGEINSTRUKSJONER.md` | AI-byggeinstruksjoner |
| `AGENT-BYGGEGUIDE-2026.md` | Byggeguide (gjenopprettet 2026-04-22) |

### S.3 Brukerdokumentasjon (`Kit CC/docs/`) — 2 stk

| Fil | Formål |
|-----|--------|
| `HURTIGSTART.md` | Brukerveiledning/hurtigstart (gjenopprettet 2026-04-22) |
| `PRODUCTION-READINESS-CHECKLIST.md` | Sjekkliste for produksjonsklarhet |

### S.4 Scripts (`Kit CC/Agenter/scripts/`) — 3 stk

| Fil | Formål |
|-----|--------|
| `distribute-clean.sh` | Rens før distribusjon |
| `validate-consistency.sh` | Konsistens-validering |
| `validate-dead-fields.sh` | Finner døde felter i PROJECT-STATE |

### S.5 Hooks-bibliotek (`Kit CC/hooks-library/`) — 11 stk

| Fil | Formål |
|-----|--------|
| `install.sh` | Installerer hooks i et prosjekt |
| `settings-template.json` | Mal for settings.json |
| `post-tool-use/audit-logger.sh` | Logger alle verktøy-kall |
| `pre-tool-use/env-file-write-block.sh` | Blokkerer skriving til .env |
| `pre-tool-use/git-main-commit-block.sh` | Blokkerer commit direkte på main |
| `pre-tool-use/prod-curl-block.sh` | Blokkerer curl mot prod |
| `pre-tool-use/prod-db-write-block.sh` | Blokkerer DB-skriving mot prod |
| `pre-tool-use/rm-rf-guard.sh` | Blokkerer `rm -rf` mot risikable stier |
| `pre-tool-use/service-role-key-leak-block.sh` | Blokkerer service-role-nøkkel-lekkasje |
| `pre-tool-use/supabase-prod-push-block.sh` | Blokkerer Supabase-prod-push |
| `session-start/context-loader.sh` | Laster kontekst ved sesjonsstart |

### S.6 Disaster-runbooks (`Kit CC/templates/disaster-runbooks/`) — 7 stk

| Fil | Formål |
|-----|--------|
| `gitlab-env-confusion.md` | Runbook: GitLab env-forvirring |
| `knight-capital-flagg.md` | Runbook: Knight Capital-feature flag-hendelse |
| `lovable-rls-failure.md` | Runbook: Lovable RLS-feil |
| `moltbook-secrets-leak.md` | Runbook: Moltbook secrets-lekkasje |
| `replit-prod-wipe.md` | Runbook: Replit prod-sletting |
| `samsung-chatgpt-leak.md` | Runbook: Samsung ChatGPT-lekkasje |
| `supabase-mcp-abuse.md` | Runbook: Supabase MCP-misbruk |

### S.7 Incident-communication-maler (`Kit CC/templates/incident-communication/`) — 7 stk

| Fil | Formål |
|-----|--------|
| `epost-kunde.md` | E-postmal til kunde |
| `slack-forste-varsling.md` | Slack: første varsling |
| `slack-lest.md` | Slack: hendelse lest/bekreftet |
| `slack-oppdatering.md` | Slack: oppdatering |
| `statuspage-identified.md` | Statuspage: identifisert |
| `statuspage-investigating.md` | Statuspage: undersøker |
| `statuspage-resolved.md` | Statuspage: løst |

---

## Nye filer i v3.6.0

> Tillegg som introduserer mønster-bibliotek, intent-baserte planlegger-moduser, JSONL-progress-log og deterministisk modul-regenerering.

### N.1 Mønster-bibliotek (`Kit CC/Agenter/MONSTRE/`) — 24 filer

| Fil | Formål |
|-----|--------|
| `_katalog.md` | Indeks over alle mønstre |
| `_MAL-MONSTER.md` | Mal for nye mønstre |
| `monster-angre.md` | Angre-handling (undo) |
| `monster-detaljvisning.md` | Detaljvisning av entitet |
| `monster-feilhandtering.md` | Feilhåndtering i UI |
| `monster-filter-sortering.md` | Filter og sortering |
| `monster-flervalg.md` | Flervalg (multi-select) |
| `monster-inline-redigering.md` | Inline-redigering |
| `monster-internasjonalisering.md` | i18n/lokalisering |
| `monster-kanttilfeller.md` | Kanttilfeller (edge cases) |
| `monster-laste-tom-feil.md` | Loading/empty/error-tilstander |
| `monster-liste.md` | Liste-visning |
| `monster-mobil-beroring.md` | Mobil-berøring/touch |
| `monster-modal.md` | Modal/dialog |
| `monster-offline.md` | Offline-håndtering |
| `monster-onboarding.md` | Onboarding-flyt |
| `monster-revisjonsspor.md` | Revisjonsspor (audit trail) |
| `monster-skjema.md` | Skjema (forms) |
| `monster-slett.md` | Slett-handling |
| `monster-tilbakemelding.md` | Tilbakemelding til bruker |
| `monster-tilgangsport.md` | Tilgangsport (auth gate) |
| `monster-tilgjengelighet.md` | Tilgjengelighet (a11y) |
| `monster-tilstander.md` | Tilstandshåndtering |
| `monster-undo-first.md` | Undo-first-design |

### N.2 Protokoller (nye/oppdatert i `Kit CC/Agenter/agenter/system/`)

| Fil | Formål |
|-----|--------|
| `protocol-INTENT-DETEKSJON.md` | Klassifikator for brukerens intent |
| `protocol-PLANLEGGER-MODUSER.md` | De 4 modusene (PLAN/BRAINSTORM/STATUS/REVIEW) |
| `protocol-VALIDERING-SKALA.md` | REVIEW-karakter A-D |
| `protocol-PROGRESS-LOG.md` v2.0.0 | JSONL-format (oppdatert) |
| `protocol-MODULREGISTRERING.md` | Regenererings-flyt + lock (oppdatert) |

### N.3 Maler (oppdatert/ny i `Kit CC/Agenter/maler/`)

| Fil | Formål |
|-----|--------|
| `MODUL-SPEC-MAL.md` | Utvidet med seksjon 3.5 |
| `MODUL-SPEC-EKSEMPEL.md` | Komplett utfylt M-007 |
| `PROGRESS-LOG-MAL.md` | JSONL-format (oppdatert) |

### N.4 Agent-utvidelser

| Fil | Formål | Plassering |
|-----|--------|------------|
| `PLANLEGGER-agent.md` v3.0.0 | 4 moduser | `Kit CC/Agenter/agenter/basis/` |
| `PLANLEGGER-agent-v2.3.0-original.md` | Frozen backup | `Kit CC/Agenter/agenter/basis/` |
| `1-OPPSTART-agent.md` … `7-PUBLISERINGS-agent.md` | Wired med intent-routing | `Kit CC/Agenter/agenter/prosess/` |
| `agent-PHASE-GATES.md` | Med VALIDERING-karakter-sjekk | `Kit CC/Agenter/agenter/system/` |

### N.5 Scripts (`Kit CC/Agenter/scripts/`) — 7 nye

| Fil | Formål |
|-----|--------|
| `safe-state-write.sh` | Atomic write + optimistic locking |
| `regenerate-modulregister.sh` | Deterministisk regenerering |
| `state-lock.sh` | Fil-lock med stale-detect |
| `progress-log-append.sh` | Atomær JSONL-append |
| `convert-progress-log-to-jsonl.py` | Engangs-migrering |
| `test-monstre-struktur.sh` | Validering |
| `test-intent-deteksjon.md` | 20 test-fraser |

### N.6 Dokumentasjon (ny)

| Fil | Formål | Plassering |
|-----|--------|------------|
| `PLANLEGGING-DYP.md` | Brukerguide for hyperdetaljert planlegging | `Kit CC/docs/` |
| `RELEASE-v3.6.0.md` | Endrings-logg | `Kit CC/docs/` |

### N.7 Eval (`Kit CC/Agenter/evals/`)

| Fil | Formål |
|-----|--------|
| `evals/` (mappe) | Opprettes i Steg 9 |

---

## Eksternt (ikke del av lag-arkitekturen)

Monitor/overlay-appen `kit-cc-overlay/` lever som egen Node.js-applikasjon og er utenfor Kit CC-agentenes filkatalog. Den kommuniserer via `.ai/MONITOR-ERRORS.json` og `.ai/MONITOR-PROBES.json` (Lag 1).

---

## Mappestruktur

```
[Prosjektmappe]/
├── CLAUDE.md                    ← Startfil (boot-sekvens, leses automatisk)
├── .ai/                         ← Prosjekttilstand (Lag 1 + 3)
│   ├── PROJECT-STATE.json       (Lag 1)
│   ├── PROGRESS-LOG.md          (Lag 1)
│   ├── MISSION-BRIEFING-FASE-{N}.md  (Lag 1)
│   ├── MONITOR-ERRORS.json      (Lag 1, fase 4/5)
│   ├── MONITOR-PROBES.json      (Lag 1, fase 4/5)
│   ├── SESSION-HANDOFF.md       (Lag 2)
│   └── CHECKPOINT-HISTORY/      (Lag 3)
├── Kit CC/
│   ├── CLAUDE.md                ← Prosjektinstruks (autoritativ)
│   ├── Agenter/
│   │   ├── NAVNEKONVENSJON.md, AI-OPPGAVER.json,
│   │   │   AI-BYGGEINSTRUKSJONER.md, AGENT-BYGGEGUIDE-2026.md
│   │   ├── agenter/
│   │   │   ├── prosess/         ← 7 fase-agenter (aktiv = Lag 1)
│   │   │   ├── basis/           ← 7 basis-agenter (Lag 2)
│   │   │   ├── ekspert/         ← 37 ekspert-agenter (Lag 2)
│   │   │   └── system/          ← 6 agent- + 29 protocol- + 8 extension- + 5 doc-
│   │   ├── klassifisering/      ← 11 filer (inkl. FUNKSJONSOVERSIKT = Lag 3)
│   │   ├── maler/               ← 10 maler (Lag 2)
│   │   └── scripts/             ← 3 scripts (støtte)
│   ├── docs/                    ← Brukerdokumentasjon (HURTIGSTART osv.)
│   ├── hooks-library/           ← 11 filer (Claude Code-hooks)
│   └── templates/
│       ├── disaster-runbooks/   ← 7 runbooks
│       └── incident-communication/  ← 7 maler
├── docs/                        ← Generert prosjekt-dokumentasjon
└── src/                         ← Kildekode
```

---

## Filtelling (per 2026-04-22)

| Kategori | Antall |
|----------|-------:|
| Lag 1 (arbeidsbord) | 6 filtyper |
| Lag 2 — Basis-agenter | 7 |
| Lag 2 — Ekspert-agenter | 37 |
| Lag 2 — Prosess-agenter | 7 |
| Lag 2 — Protokoller | 29 |
| Lag 2 — Extensions | 8 |
| Lag 2 — Docs | 5 |
| Lag 2 — Klassifisering | 10 (+1 = FUNKSJONSOVERSIKT i Lag 3) |
| Lag 2 — Maler | 10 |
| Lag 3 — System-agenter | 6 |
| Lag 3 — Øvrig | 2 (FUNKSJONSOVERSIKT + CHECKPOINT-HISTORY) |
| Støtte — Kit CC-rot/Agenter-rot | 5 |
| Støtte — Brukerdokumentasjon | 2 |
| Støtte — Scripts | 3 |
| Støtte — Hooks-library | 11 |
| Støtte — Disaster-runbooks | 7 |
| Støtte — Incident-communication | 7 |
| **Totalt katalogisert** | **~156 filer** |

> Tallet avviker litt fra "150" brukt i tidligere audit — denne v2.0 teller også `CLAUDE.md` (rot), maler, hooks og templates som tidligere ble regnet løselig. Alle filer fra `INVENTORY.md` er med.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
