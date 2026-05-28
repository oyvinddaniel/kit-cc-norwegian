# METRICS-KPI v2.0

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for autoritativ Kit CC-versjon.

> **v2.0 — 2026-04-19** — Oppdatert for Kit CC profesjonell pakke v3 (30 nye komponenter)

> Standardiserte metrics og KPIer for Kit CC agent-systemet.

> **Revidert 2026-02-19:** Metrikker basert på data som faktisk er tilgjengelig
> via PROGRESS-LOG.jsonl og Kit CC Monitor. Runtime-telemetri er ikke implementert.

---

## FORMÅL

Definerer målbare indikatorer for:
- Agent-ytelse
- Prosjekt-progresjon
- Kvalitetsmåling
- System-helse

---

## MÅLBARE METRIKKER (via PROGRESS-LOG)

| Metrikk | Kilde | Beregning |
|---------|-------|-----------|
| Oppgaver fullført per fase | PROGRESS-LOG `"event":"DONE"` | Tell DONE-events gruppert per fase |
| Gjennomsnittlig oppgavetid | PROGRESS-LOG `"event":"START"`/`"event":"DONE"` | Tid mellom START og DONE for samme task-ID |
| Feilrate per fase | PROGRESS-LOG `"event":"ERROR"` | Antall ERROR-events / antall START-events per fase |
| Fase-varighet | PROGRESS-LOG | Tid fra første START til siste DONE i fasen |
| Kontekstbudsjett-treff | PROGRESS-LOG `"event":"CONTEXT_BUDGET"` | Antall sesjoner som treffer budsjettet |
| Beslutninger per fase | PROGRESS-LOG `"event":"DECISION"` | Tell DECISION-events per fase |

## MONITOR-METRIKKER (via Kit CC Monitor dashboard)

| Metrikk | Kilde | Visning |
|---------|-------|---------|
| Prosjektfremdrift | PROJECT-STATE.json currentPhase + completedTasks | Prosentbar per fase |
| Aktive oppgaver | PROJECT-STATE.json pendingTasks | Liste med status |
| Fase-gate status | PROJECT-STATE.json gateOverrides | Grønn/gul/rød indikator |
| Siste aktivitet | PROGRESS-LOG siste 5 linjer | Tidslinje |

---

## AGENT-METRICS

> PLANLAGT -- krever runtime-telemetri

### Respons-tid (per agent-type) — PLANLAGT, krever runtime-telemetri

| Agent-type | Mål | Advarsel | Kritisk |
|------------|-----|----------|---------|
| SYSTEM-agenter | < 5s | 5-15s | > 15s |
| PROSESS-agenter | < 30s | 30-60s | > 60s |
| BASIS-agenter | < 60s | 60-120s | > 120s |
| EKSPERT-agenter | < 120s | 120-300s | > 300s |

### Suksess-rate — PLANLAGT, krever runtime-telemetri

| Metric | Formel | Mål |
|--------|--------|-----|
| Task Completion Rate | Fullførte / Startede | > 95% |
| Handoff Success Rate | Vellykkede handoffs / Totale | > 98% |
| Gate Pass Rate | Passerte / Forsøkte | > 90% |
| Retry Rate | Retries / Totale kall | < 5% |

### Feil-frekvens — PLANLAGT, krever runtime-telemetri

Feiltyper følger taksonomien i `ERROR-CODE-REGISTRY.md v2.0`. Aggregat pr `type`:

| Feil-type | Akseptabel | Advarsel | Kritisk |
|-----------|------------|----------|---------|
| `state` (KRITISK) | 0 | 1/uke | > 1/uke |
| `planning` (HØY) | < 1/dag | 1-3/dag | > 3/dag |
| `execution` (HØY) | < 2/dag | 2-5/dag | > 5/dag |
| `context` (MEDIUM) | < 3/dag | 3-6/dag | > 6/dag |
| `communication` (MEDIUM) | < 5/dag | 5-10/dag | > 10/dag |
| `dependency` (MEDIUM) | < 2/dag | 2-5/dag | > 5/dag |
| `validation` (MEDIUM) | < 5/dag | 5-10/dag | > 10/dag |
| `timeout` (LAV) | < 1/dag | 1-3/dag | > 3/dag |

---

## PROSJEKT-METRICS

### Fase-progresjon

| Metric | Beskrivelse | Beregning |
|--------|-------------|-----------|
| Phase Velocity | Gjennomsnittlig tid per fase | Sum(fase-tid) / antall faser |
| Phase Completion % | Andel fullførte oppgaver | Fullførte / Totale i fase |
| Gate Attempts | Antall forsøk før gate-pass | Forsøk til PASS |
| Blocking Time | Tid brukt på blokkeringer | Sum(blokkert-tid) |

### Leveranse-kvalitet

| Metric | Mål | Måling |
|--------|-----|--------|
| Deliverable Completeness | > 95% | Alle påkrevde felter utfylt |
| Documentation Coverage | > 80% | Dokumenterte vs udokumenterte features |
| Test Coverage | > 70% | Linjer dekket av tester |
| Security Score | > 8/10 | OWASP-sjekk + dependency-scan |

---

## INTENSITETSNIVÅ-METRICS

### Per-nivå KPIer

| Nivå | Oppgaver/fase | Gate-tid mål | Review-krav |
|------|---------------|--------------|-------------|
| MINIMAL | 5-10 | < 1 time | Ingen |
| FORENKLET | 10-20 | < 4 timer | Ved fasebytte |
| STANDARD | 20-35 | < 1 dag | Per leveranse |
| GRUNDIG | 35-50 | < 3 dager | Multi-reviewer |
| ENTERPRISE | 50-70 | < 1 uke | Compliance-audit |

### Anbefalt ressursbruk

| Nivå | AI-tid | Bruker-tid | Ratio |
|------|--------|------------|-------|
| MINIMAL | 80% | 20% | 4:1 |
| FORENKLET | 70% | 30% | 2.3:1 |
| STANDARD | 60% | 40% | 1.5:1 |
| GRUNDIG | 50% | 50% | 1:1 |
| ENTERPRISE | 40% | 60% | 0.67:1 |

---

## SYSTEM-HELSE-METRICS — PLANLAGT, krever runtime-telemetri

### State-konsistens

| Metric | Formel | Mål |
|--------|--------|-----|
| State Integrity | Vellykkede valideringer / Totale | 100% |
| Checkpoint Health | Gyldige checkpoints / Totale | 100% |
| History Completeness | Loggede events / Forventede | > 99% |

### Kommunikasjon

| Metric | Beskrivelse | Mål |
|--------|-------------|-----|
| ACK Latency | Tid til ACK mottas | < 30s |
| Handoff Latency | Tid fra COMPLETE til neste START | < 60s |
| Message Queue Depth | Antall ventende meldinger | < 10 |

---

## ZONE-METRICS (Autonomi)

### Zone-distribusjon

| Zone | Beskrivelse | Mål-distribusjon |
|------|-------------|------------------|
| 🟢 GREEN | AI autonomous | 60-70% av oppgaver |
| 🟡 YELLOW | AI + review | 25-35% av oppgaver |
| 🔴 RED | Human-led | 5-10% av oppgaver |

### Zone-overholdelse

| Metric | Formel | Mål |
|--------|--------|-----|
| Zone Compliance | Riktig zone / Totale | 100% |
| RED Zone Violations | Autonomous RED / Totale RED | 0% |
| Review Completion | Reviewede YELLOW / Totale YELLOW | 100% |

---

## LOGGING-METRICS — PLANLAGT, krever runtime-telemetri

### Log-volum

| Log-nivå | Normal | Advarsel | Kritisk |
|----------|--------|----------|---------|
| INFO | 100-500/dag | > 500/dag | > 1000/dag |
| WARN | 10-50/dag | 50-100/dag | > 100/dag |
| ERROR | 0-5/dag | 5-20/dag | > 20/dag |
| DEBUG | Varierer | - | - |

### Log-kvalitet

| Metric | Krav |
|--------|------|
| Timestamp format | ISO 8601 (100%) |
| Agent-ID present | 100% |
| Error-code present | 100% for ERROR |
| Context present | > 90% |

---

## DASHBOARD-INDIKATORER — PLANLAGT, krever runtime-telemetri

### Sanntids-status

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM HEALTH DASHBOARD                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🟢 ORCHESTRATOR: ONLINE        Uptime: 99.9%                   │
│  🟢 STATE: CONSISTENT           Last sync: 2s ago               │
│  🟢 AGENTS: 57/57 AVAILABLE     Active: 3                       │
│                                                                  │
│  Current Phase: 4 (MVP)         Progress: 67%                   │
│  Active Agent: BYGGER           Task: API endpoint              │
│  Pending Tasks: 5               Blocked: 0                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ RECENT ACTIVITY                                          │    │
│  │ [10:30] ✓ BYGGER completed auth-endpoint                │    │
│  │ [10:28] ➜ BYGGER started api-endpoint                   │    │
│  │ [10:25] ✓ REVIEWER approved auth-endpoint               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ METRICS (Last 24h)                                       │    │
│  │ Task Completion: 94%  │  Handoff Success: 100%          │    │
│  │ Avg Response: 45s     │  Error Rate: 2%                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## RAPPORTERING — PLANLAGT, krever runtime-telemetri

### Daglig rapport-innhold

1. **Sammendrag**
   - Fase-progresjon
   - Fullførte oppgaver
   - Feil og advarsler

2. **Agent-aktivitet**
   - Mest aktive agenter
   - Lengste oppgaver
   - Feil per agent

3. **Kvalitets-indikatorer**
   - Gate-resultater
   - Review-status
   - Test-dekning

### Ukentlig rapport-innhold

1. **Trend-analyse**
   - Velocity-trend
   - Feil-trend
   - Kvalitets-trend

2. **Anbefalinger**
   - Flaskehalser
   - Forbedringsområder
   - Ressurs-optimalisering

---

## ALERTING-REGLER — PLANLAGT, krever runtime-telemetri

| Metric | Trigger | Severity | Aksjon |
|--------|---------|----------|--------|
| Error Rate > 10% | 5 min | WARNING | Log + Notify |
| Error Rate > 25% | 1 min | CRITICAL | Circuit-breaker |
| State Corruption | Umiddelbart | CRITICAL | STOP + Rollback |
| Handoff Timeout | 3 min | WARNING | Retry |
| Handoff Timeout | 10 min | CRITICAL | Manual intervention |
| Phase Stalled | 24h | WARNING | Review blokkering |

---

## IMPLEMENTERING

### I PROJECT-STATE.json

```json
{
  "metrics": {
    "sessionStart": "2026-02-05T10:00:00Z",
    "tasksCompleted": 15,
    "tasksStarted": 18,
    "errorCount": 2,
    "warningCount": 5,
    "avgTaskDuration": 45,
    "phaseProgress": {
      "phase4": {
        "completionPercent": 67,
        "gateAttempts": 0,
        "blockingTime": 0
      }
    },
    "agentMetrics": {
      "BYGGER": {
        "tasksCompleted": 8,
        "avgDuration": 52,
        "errorRate": 0.05
      }
    }
  }
}
```

### Logging-format

```
[2026-02-05T10:30:00Z] [METRICS] [INFO] Task completed
{
  "agent": "BYGGER",
  "task": "api-endpoint",
  "duration": 45,
  "status": "SUCCESS",
  "phase": 4
}
```

---

## VERSJONSKONTROLL

| Felt | Verdi |
|------|-------|
| Versjon | 2.0.0 |
| Opprettet | 2026-02-05 |
| Sist oppdatert | 2026-02-19 |

---

*Relatert:*
- `ERROR-CODE-REGISTRY.md` - Feilkoder
- `../agenter/system/agent-ORCHESTRATOR.md` - Koordinering
- `../agenter/system/protocol-SYSTEM-COMMUNICATION.md` - Logging-standard

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
