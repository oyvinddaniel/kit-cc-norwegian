# ARCHITECTURE-DIAGRAM v2.0

> Visuell arkitektur-dokumentasjon for Kit CC agent-systemet.
> **Agent-fasit:** 6 system + 7 basis + 7 prosess + 37 ekspert = **57 agenter totalt**. Autoritativ kilde: `Agenter/VERSION.json`.

> **Merk:** Dette diagrammet bruker "Nivå 0-3" for agent-hierarkiet (hvem kaller hvem).
> CLAUDE.md bruker "Lag 1-3" for kontekst-hierarkiet (hvilke filer lastes når).
> De to hierarkiene er uavhengige: Nivå = agentroller, Lag = informasjonstilgang.

---

## OVERORDNET ARKITEKTUR

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              KIT CC AGENT SYSTEM                              │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                   NIVÅ 0: SYSTEM-AGENTER (6)                            │ │
│  │                           (Infrastruktur)                               │ │
│  │                                                                         │ │
│  │    ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │ │
│  │    │ ORCHESTRATOR│◄───│PHASE-GATES  │    │    AUTO-CLASSIFIER      │   │ │
│  │    │  (Sentral)  │    │(Validering) │    │   (Klassifisering)      │   │ │
│  │    └──────┬──────┘    └─────────────┘    └─────────────────────────┘   │ │
│  │           │                                                             │ │
│  │    ┌──────┴──────┐    ┌─────────────┐    ┌─────────────────────────┐   │ │
│  │    │CONTEXT-LOADER│    │AGENT-PROTOCOL│    │   BROWNFIELD-SCANNER    │   │ │
│  │    │(Kontekst)   │    │(Protokoll)  │    │   (Kodebase-analyse)    │   │ │
│  │    └─────────────┘    └─────────────┘    └─────────────────────────┘   │ │
│  │                                                                         │ │
│  │  Merk: protocol-SYSTEM-COMMUNICATION er en protokoll (ikke agent).     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                         │
│                                     ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      NIVÅ 2: PROSESS-AGENTER                            │ │
│  │                        (Fase-koordinatorer)                             │ │
│  │                                                                         │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │ │
│  │  │FASE1│→│FASE2│→│FASE3│→│FASE4│→│FASE5│→│FASE6│→│FASE7│              │ │
│  │  │ OPP │ │KRAV │ │ ARK │ │ MVP │ │ITER │ │ QA  │ │ PUB │              │ │
│  │  │START│ │     │ │ITEK │ │     │ │ASJON│ │     │ │     │              │ │
│  │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘              │ │
│  └─────┼───────┼───────┼───────┼───────┼───────┼───────┼────────────────────┘ │
│        │       │       │       │       │       │       │                      │
│        ▼       ▼       ▼       ▼       ▼       ▼       ▼                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    NIVÅ 1: BASIS-AGENTER (7)                            │ │
│  │                          (Verktøy)                                      │ │
│  │                                                                         │ │
│  │     ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │ │
│  │     │ BYGGER │  │DEBUGGER│  │DOKUMEN-│  │PLANLEG-│  │REVIEWER│        │ │
│  │     │        │  │        │  │ TERER  │  │  GER   │  │        │        │ │
│  │     └────────┘  └────────┘  └────────┘  └────────┘  └────────┘        │ │
│  │                    ┌────────┐  ┌────────┐                              │ │
│  │                    │SIKKER- │  │VEILEDER│                              │ │
│  │                    │  HETS  │  │(spørre)│                              │ │
│  │                    └────────┘  └────────┘                              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                         │
│                                     ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      NIVÅ 3: EKSPERT-AGENTER                            │ │
│  │                        (37 spesialister)                                │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │ PERSONA │ LEAN │ WIREFRAME │ API │ DATAMODELL │ TRUSSEL │ ...  │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │ CICD │ SUPPLY │ TEST │ INFRA │ OWASP │ GDPR │ MONITORING │ ... │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        EKSTERNE KOMPONENTER                                   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       KIT CC MONITOR                                    │ │
│  │            (Visuelt dashboard / dev-verktøy)                           │ │
│  │                                                                         │ │
│  │  Kommuniserer med AI via:                                              │ │
│  │    • .ai/MONITOR-ERRORS.json (nettleser-feil → AI)                    │ │
│  │    • .ai/MONITOR-PROBES.json (toveis AI ↔ nettleser)                  │ │
│  │    • .ai/PROJECT-STATE.json (leser prosjektstatus)                    │ │
│  │                                                                         │ │
│  │  Kjører som standalone Node.js-server på port 444x                     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## FASE-FLYT

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                          UTVIKLINGSLIVSSYKLUS                            │
  └─────────────────────────────────────────────────────────────────────────┘

   FASE 1         FASE 2         FASE 3         FASE 4         FASE 5
  ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐
  │OPPSTART│─────►│ KRAV  │─────►│ARKITEK│─────►│  MVP  │─────►│ITERAS-│
  │       │      │       │      │  TUR  │      │       │      │  JON  │
  │Vision │      │User   │      │Tech   │      │First  │      │Feature│
  │Persona│      │Stories│      │Stack  │      │Proto- │      │Polish │
  │Risk   │      │PRD    │      │DB     │      │type   │      │UX     │
  └───────┘      └───────┘      └───────┘      └───────┘      └───────┘
      │              │              │              │              │
      ▼              ▼              ▼              ▼              ▼
  ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐
  │GATE-1 │      │GATE-2 │      │GATE-3 │      │GATE-4 │      │GATE-5 │
  │CHECK  │      │CHECK  │      │CHECK  │      │CHECK  │      │CHECK  │
  └───────┘      └───────┘      └───────┘      └───────┘      └───────┘
                                                                    │
                                                                    │
   FASE 6         FASE 7                                            │
  ┌───────┐      ┌───────┐                                          │
  │KVALITET│◄────────────────────────────────────────────────────────┘
  │SIKRING│─────►│PUBLI- │
  │       │      │SERING │
  │OWASP  │      │Deploy │
  │GDPR   │      │Monitor│
  │Test   │      │SRE    │
  └───────┘      └───────┘
      │              │
      ▼              ▼
  ┌───────┐      ┌───────┐
  │GATE-6 │      │GATE-7 │
  │CHECK  │      │CHECK  │
  └───────┘      └───────┘
```

---

## KOMMUNIKASJONSFLYT

```
                    ┌────────────────────────────────────────┐
                    │              BRUKER                     │
                    └───────────────────┬────────────────────┘
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │            ORCHESTRATOR                 │
                    │     (Hub - Sentral koordinering)        │
                    └───────────────────┬────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            │                           │                           │
            ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │ AUTO-CLASSIFIER│           │ CONTEXT-LOADER│           │  PHASE-GATES  │
    └───────────────┘           └───────────────┘           └───────────────┘
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │          PROSESS-AGENT                  │
                    │    (Aktiv fase-koordinator)             │
                    └───────────────────┬────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
            │ BASIS-AGENT   │   │ BASIS-AGENT   │   │ EKSPERT-AGENT │
            │   (BYGGER)    │   │  (REVIEWER)   │   │   (OWASP)     │
            └───────────────┘   └───────────────┘   └───────────────┘
```

---

## HANDOFF-SEKVENS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HANDOFF-PROTOKOLL                                    │
└─────────────────────────────────────────────────────────────────────────────┘

     Agent A                  ORCHESTRATOR                  Agent B
        │                          │                           │
        │  1. TASK_COMPLETE        │                           │
        │─────────────────────────►│                           │
        │                          │                           │
        │                          │  2. Oppdater STATE        │
        │                          │─────────┐                 │
        │                          │         │                 │
        │                          │◄────────┘                 │
        │                          │                           │
        │                          │  3. PHASE-GATES check     │
        │                          │─────────┐                 │
        │                          │         │ PASS            │
        │                          │◄────────┘                 │
        │                          │                           │
        │  4. HANDOFF-MELDING      │                           │
        │─────────────────────────►│                           │
        │                          │                           │
        │                          │  5. Aktiver Agent B       │
        │                          │──────────────────────────►│
        │                          │                           │
        │                          │         6. ACK            │
        │                          │◄──────────────────────────│
        │                          │                           │
        │  7. HANDOFF-WITHDRAWN    │                           │
        │─────────────────────────►│                           │
        │                          │                           │
        │                          │  8. Agent B WORKING       │
        │                          │◄──────────────────────────│
        │                          │                           │
```

---

## STATE-MANAGEMENT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT-STATE ARKITEKTUR                              │
└─────────────────────────────────────────────────────────────────────────────┘

                        .ai/PROJECT-STATE.json
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ classification│      │    phase      │      │    history    │
│               │      │   Progress    │      │    events     │
│ intensityLevel│      │               │      │               │
│ score         │      │ currentPhase  │      │ checkpoints   │
│ stack         │      │ completedSteps│      │ transitions   │
│               │      │ skippedSteps  │      │ activities    │
└───────────────┘      └───────────────┘      └───────────────┘

                               │
                               ▼
                    ┌───────────────────┐
                    │  UNIFIED HISTORY  │
                    │                   │
                    │  • Checkpoints    │
                    │  • Gate passes    │
                    │  • Agent activity │
                    │  • User decisions │
                    └───────────────────┘
```

---

## CHECKPOINT-RECOVERY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CHECKPOINT-RECOVERY FLYT                               │
└─────────────────────────────────────────────────────────────────────────────┘

     NORMAL FLYT                                   RECOVERY FLYT
         │                                              │
         ▼                                              ▼
    ┌─────────┐                                   ┌─────────┐
    │ Fase N  │                                   │  FEIL   │
    │ komplett│                                   │ oppdaget│
    └────┬────┘                                   └────┬────┘
         │                                              │
         ▼                                              ▼
    ┌─────────┐                                   ┌─────────┐
    │  GATE   │                                   │ Velg    │
    │  PASS   │                                   │checkpoint│
    └────┬────┘                                   └────┬────┘
         │                                              │
    ┌────┴────────────────────────────────────────────┴────┐
    │                                                       │
    ▼                                                       ▼
┌───────────┐                                         ┌───────────┐
│ Git commit│                                         │ Git reset │
│ + tag     │                                         │ to commit │
└─────┬─────┘                                         └─────┬─────┘
      │                                                     │
      ▼                                                     ▼
┌───────────┐                                         ┌───────────┐
│ Lagre     │                                         │ Restore   │
│ checkpoint│                                         │ agent     │
│ i history │                                         │ state     │
└─────┬─────┘                                         └─────┬─────┘
      │                                                     │
      ▼                                                     ▼
┌───────────┐                                         ┌───────────┐
│ Fortsett  │                                         │ Verifiser │
│ til Fase  │                                         │ konsistens│
│   N+1     │                                         └─────┬─────┘
└───────────┘                                               │
                                                            ▼
                                                      ┌───────────┐
                                                      │ Resume    │
                                                      │ fra       │
                                                      │ checkpoint│
                                                      └───────────┘
```

---

## CIRCUIT-BREAKER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CIRCUIT-BREAKER MØNSTER                               │
└─────────────────────────────────────────────────────────────────────────────┘

                          ┌───────────────┐
                          │    NORMAL     │
                          │   OPERASJON   │
                          └───────┬───────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │    Feil oppstår?        │
                    └───────────┬─────────────┘
                          │           │
                         NEI         JA
                          │           │
                          ▼           ▼
                    ┌─────────┐ ┌─────────────┐
                    │Fortsett │ │  Teller++   │
                    └─────────┘ └──────┬──────┘
                                       │
                                       ▼
                          ┌─────────────────────┐
                          │  Teller >= 3?       │
                          └──────────┬──────────┘
                                │          │
                               NEI        JA
                                │          │
                                ▼          ▼
                          ┌─────────┐ ┌─────────────────┐
                          │  Retry  │ │ CIRCUIT-BREAKER │
                          │  med    │ │    AKTIVERT     │
                          │ backoff │ └────────┬────────┘
                          └─────────┘          │
                                               ▼
                                    ┌───────────────────┐
                                    │   BRUKER-VALG     │
                                    │                   │
                                    │  A) RETRY         │
                                    │  B) ALTERNATE     │
                                    │  C) SKIP          │
                                    │  D) ABORT         │
                                    └───────────────────┘
```

---

## SUPERVISOR-MODE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPERVISOR-MODE                                      │
│                    (Parallell ekspert-analyse)                               │
└─────────────────────────────────────────────────────────────────────────────┘

                          ORCHESTRATOR
                               │
                               ▼
                    ┌───────────────────┐
                    │   PROSESS-AGENT   │
                    │   (WRITE access)  │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │  EKSPERT-1    │ │  EKSPERT-2    │ │  EKSPERT-3    │
    │  (READ-ONLY)  │ │  (READ-ONLY)  │ │  (READ-ONLY)  │
    │               │ │               │ │               │
    │  Sikkerhet    │ │   Ytelse      │ │ Vedlikehold   │
    └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    AGGREGATOR     │
                    │ Samler analyser   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  PROSESS-AGENT    │
                    │ Implementerer     │
                    │ med ekspert-input │
                    └───────────────────┘
```

---

## INTENSITETSNIVÅ-PÅVIRKNING

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTENSITETSNIVÅ → AGENT-AKTIVERING                        │
└─────────────────────────────────────────────────────────────────────────────┘

    MINIMAL (7-10)          STANDARD (15-18)         ENTERPRISE (24-28)
    ┌─────────────┐         ┌─────────────┐          ┌─────────────┐
    │   PROSESS   │         │   PROSESS   │          │   PROSESS   │
    │   agenter   │         │   agenter   │          │   agenter   │
    │   (alle)    │         │   (alle)    │          │   (alle)    │
    └──────┬──────┘         └──────┬──────┘          └──────┬──────┘
           │                       │                        │
           ▼                       ▼                        ▼
    ┌─────────────┐         ┌─────────────┐          ┌─────────────┐
    │   BASIS     │         │   BASIS     │          │   BASIS     │
    │   (utvalgte)│         │   (alle)    │          │   (alle)    │
    │             │         │             │          │             │
    │ • BYGGER    │         │ • BYGGER    │          │ • BYGGER    │
    │ • PLANLEGGER│         │ • DEBUGGER  │          │ • DEBUGGER  │
    │             │         │ • DOKUMEN-  │          │ • DOKUMEN-  │
    │             │         │   TERER     │          │   TERER     │
    │             │         │ • PLANLEGGER│          │ • PLANLEGGER│
    │             │         │ • REVIEWER  │          │ • REVIEWER  │
    │             │         │ • SIKKERHETS│          │ • SIKKERHETS│
    └─────────────┘         └──────┬──────┘          └──────┬──────┘
                                   │                        │
                                   ▼                        ▼
                            ┌─────────────┐          ┌─────────────┐
                            │  EKSPERT    │          │  EKSPERT    │
                            │  (utvalgte) │          │   (ALLE)    │
                            │             │          │             │
                            │ • OWASP     │          │ • Alle 37   │
                            │ • GDPR      │          │   eksperter │
                            │ • CICD      │          │             │
                            │ • TEST-GEN  │          │ + Eksterne  │
                            └─────────────┘          │   spesial-  │
                                                     │   ister     │
                                                     └─────────────┘
```

---

## FIL-STRUKTUR

```
Agenter/
├── klassifisering/
│   ├── KLASSIFISERING-METADATA-SYSTEM.md    ← Metadata + oppgave-register
│   ├── FUNKSJONSOVERSIKT-KOMPLETT.md        ← Alle funksjoner
│   ├── CALLING-REGISTRY.md                  ← Agent-aktiveringsregler
│   ├── ERROR-CODE-REGISTRY.md               ← Feilkoder
│   └── ARCHITECTURE-DIAGRAM.md              ← Denne filen
│
├── agenter/
│   ├── system/                              ← Nivå 0: Infrastruktur
│   │   ├── agent-ORCHESTRATOR.md
│   │   ├── agent-AUTO-CLASSIFIER.md
│   │   ├── agent-CONTEXT-LOADER.md
│   │   ├── agent-PHASE-GATES.md
│   │   ├── agent-AGENT-PROTOCOL.md
│   │   ├── agent-BROWNFIELD-SCANNER.md
│   │   └── protocol-*.md
│   │
│   ├── basis/                               ← Nivå 1: Verktøy
│   │   ├── BYGGER-agent.md
│   │   ├── DEBUGGER-agent.md
│   │   ├── DOKUMENTERER-agent.md
│   │   ├── PLANLEGGER-agent.md
│   │   ├── REVIEWER-agent.md
│   │   ├── SIKKERHETS-agent.md
│   │   └── VEILEDER-agent.md               ← Read-only spørre-agent
│   │
│   ├── prosess/                             ← Nivå 2: Fase-koordinatorer
│   │   ├── 1-OPPSTART-agent.md
│   │   ├── 2-KRAV-agent.md
│   │   ├── 3-ARKITEKTUR-agent.md
│   │   ├── 4-MVP-agent.md
│   │   ├── 5-ITERASJONS-agent.md
│   │   ├── 6-KVALITETSSIKRINGS-agent.md
│   │   └── 7-PUBLISERINGS-agent.md
│   │
│   └── ekspert/                             ← Nivå 3: Spesialister
│       └── [37 ekspert-agenter]
│
├── maler/                                   ← Agent-maler
│   ├── MAL-PROSESS.md
│   └── MAL-EKSPERT.md
│
└── .ai/                                     ← Per-prosjekt data
    ├── PROJECT-STATE.json
    ├── SESSION-HANDOFF.md
    └── CHECKPOINT-HISTORY/
```

---

## VERSJONSKONTROLL

| Felt | Verdi |
|------|-------|
| Versjon | 2.0 |
| Opprettet | 2026-02-05 |
| Sist oppdatert | 2026-04-22 |
| Agent-fasit | `Agenter/VERSION.json` (6 system + 7 basis + 7 prosess + 37 ekspert = 57 totalt) |

### Endringslogg

| Versjon | Dato | Endring |
|---------|------|---------|
| 1.0.0 | 2026-02-05 | Initial versjon |
| 2.0 | 2026-04-22 | Korrigerte agent-tellinger (33→37 eksperter, total 57). Fjernet SYSTEM-COMMUNICATION fra system-agent-listen (er protokoll, ikke agent). La til VEILEDER i basis-boksen. Fjernet duplisert SESSION-HANDOFF i fil-struktur. |

---

*Relatert:*
- `CALLING-REGISTRY.md` - Agent-kall-regler
- `KLASSIFISERING-METADATA-SYSTEM.md` - Oppgave-til-agent mapping
- `../agenter/system/agent-ORCHESTRATOR.md` - Koordineringslogikk
- `../VERSION.json` - Autoritativ agent-fasit

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
