# ROLLBACK-PROTOCOL v1.0

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for autoritativ Kit CC-versjon.

> Standardisert protokoll for rollback og recovery i Kit CC.

---

## FORMÅL

Definerer:
- Når rollback skal utføres
- Hvordan rollback gjennomføres
- Recovery-strategier per scenario
- Validering etter rollback

---

## ROLLBACK-TYPER

| Type | Beskrivelse | Trigger |
|------|-------------|---------|
| **SOFT** | Gjenopprett kun agent-state | Agent-feil, state-korrupsjon |
| **PARTIAL** | Gjenopprett til checkpoint + selektive filer | Delvis feil i fase |
| **FULL** | Gjenopprett alt til checkpoint (Git + state) | Kritisk feil, korrupt kodebase |
| **EMERGENCY** | Gjenopprett til siste stabile versjon | Produksjonsfeil |

---

## SOFT ROLLBACK

### Når brukes det
- Agent returnerer ugyldig output
- State-mismatch mellom agenter
- Ikke-kritiske feil som kan fikses ved re-run

### Prosess

```
1. IDENTIFISER PROBLEMET
   └─ Logg feil med kontekst
   └─ Identifiser berørte agenter

2. LAGRE NÅVÆRENDE STATE
   └─ Kopier PROJECT-STATE.json til backup
   └─ Kopier SESSION-HANDOFF.md til backup

3. GJENOPPRETT AGENT-STATE
   └─ Les siste gyldige state fra history
   └─ Skriv tilbake til PROJECT-STATE.json
   └─ Reset agent-teller

4. RESTART AGENT
   └─ Re-initialiser agent med riktig kontekst
   └─ Fortsett fra siste checkpoint

5. VERIFISER
   └─ Kjør state-validering
   └─ Sjekk agent-respons
```

### Eksempel

```
[2026-02-05T10:30:00Z] [ORCHESTRATOR] [ERROR] BYGGER returned invalid output
[2026-02-05T10:30:01Z] [ORCHESTRATOR] [INFO] Initiating SOFT ROLLBACK
[2026-02-05T10:30:02Z] [ORCHESTRATOR] [INFO] Backed up current state
[2026-02-05T10:30:03Z] [ORCHESTRATOR] [INFO] Restored state from checkpoint-004
[2026-02-05T10:30:04Z] [ORCHESTRATOR] [INFO] SOFT ROLLBACK complete
[2026-02-05T10:30:05Z] [ORCHESTRATOR] [INFO] Restarting BYGGER agent
```

---

## PARTIAL ROLLBACK

### Når brukes det
- Noen leveranser er korrupte, andre er OK
- Fase delvis fullført med feil
- Spesifikke filer må gjenopprettes

### Prosess

```
1. IDENTIFISER SCOPE
   └─ List berørte filer
   └─ List berørte state-felter
   └─ Bestem checkpoint å rulle tilbake til

2. BRUKER-BEKREFTELSE
   └─ Vis hva som vil rulles tilbake
   └─ Vis hva som beholdes
   └─ Vent på bekreftelse

3. GIT SELEKTIV RESTORE
   └─ git checkout [checkpoint-hash] -- [fil1] [fil2]
   └─ Behold andre filer urørt

4. STATE-OPPDATERING
   └─ Oppdater PROJECT-STATE.json
   └─ Marker berørte oppgaver som "pending"
   └─ Logg rollback i history

5. VERIFISER
   └─ Sammenlign filer med checkpoint
   └─ Valider state-konsistens
   └─ Kjør berørte tester
```

### Eksempel

```markdown
⚠️ PARTIAL ROLLBACK PÅKREVD

Checkpoint: phase3-complete (2026-02-05T09:00:00Z)
Commit: abc123def

Filer som vil gjenopprettes:
- src/api/auth.ts (korrupt import)
- src/types/user.ts (mangler felt)

Filer som beholdes:
- src/api/products.ts (OK)
- src/components/* (OK)

State-endringer:
- phase4.completedSteps: [auth-endpoint] → []
- phase4.status: "in_progress" → "in_progress"

Bekreft rollback? [Ja] / [Nei]
```

---

## FULL ROLLBACK

### Når brukes det
- Fase-gate feiler kritisk
- Kodebasen er korrupt
- Arkitektur-beslutning var feil

### Prosess

```
1. VARSLE BRUKER
   └─ Vis alvorlig advarsel
   └─ List konsekvenser
   └─ Krev eksplisitt bekreftelse

2. LAGRE NÅVÆRENDE STATE
   └─ git stash (behold endringer tilgjengelig)
   └─ Kopier .ai/ til backup

3. GIT RESET
   └─ git reset --hard [checkpoint-hash]
   └─ Verifiser filer matcher checkpoint

4. RESTORE KOMPLETT STATE
   └─ Kopier checkpoint-state til PROJECT-STATE.json
   └─ Kopier checkpoint-handoff til SESSION-HANDOFF.md
   └─ Gjenopprett SESSION-HANDOFF.md

5. VERIFISER KONSISTENS
   └─ Sammenlign Git HEAD med checkpoint
   └─ Valider PROJECT-STATE.json
   └─ Kjør full test-suite

6. FORTSETT FRA CHECKPOINT
   └─ Informer bruker om ny posisjon
   └─ Aktiver riktig agent
```

### Eksempel

```markdown
🚨 FULL ROLLBACK PÅKREVD

Årsak: Gate 4 kritisk feil - API-arkitektur inkompatibel

Rollback til: phase3-complete (2026-02-05T09:00:00Z)
Git commit: abc123def456

KONSEKVENSER:
❌ Alt arbeid i Fase 4 vil gå tapt
❌ 15 fullførte oppgaver vil nullstilles
❌ 3 timer arbeid må gjøres på nytt

BEHOLDES:
✓ Fase 1-3 leveranser
✓ Git-historikk (stash)
✓ Dokumentasjon til Fase 3

Skriv "BEKREFT ROLLBACK" for å fortsette:
```

---

## EMERGENCY ROLLBACK

### Når brukes det
- Produksjonsfeil oppdaget
- Sikkerhetssårbarhet i deployed kode
- Kritisk bug som påvirker brukere

### Prosess

```
1. UMIDDELBAR STOP
   └─ Stopp alle aktive agenter
   └─ Blokker nye handoffs
   └─ Logg emergency

2. IDENTIFISER SISTE STABILE
   └─ Finn siste deployede versjon
   └─ Verifiser at den var stabil
   └─ Noter rollback-mål

3. PRODUKSJONS-ROLLBACK
   └─ Trigger deployment-rollback
   └─ Verifiser produksjon fungerer
   └─ Overvåk for feil

4. LOKAL ROLLBACK
   └─ Kjør FULL ROLLBACK til samme punkt
   └─ Synkroniser med produksjon

5. POST-MORTEM
   └─ Dokumenter årsak
   └─ Identifiser forbedringer
   └─ Oppdater prosesser
```

---

## CHECKPOINT-MEKANISME

### Hvem lager checkpoints?
**ORCHESTRATOR** lager checkpoints ved faseoverganger. Fase-agenter lager IKKE egne checkpoints.

### Når lages checkpoints?
- Automatisk ved hver vellykket fase-gate passering
- Automatisk ved session-avslutning (session.status = "completed")

### Format
Checkpoints lagres i `.ai/PROJECT-STATE.json` under `checkpoints[]`:

```json
{
  "checkpoints": [
    {
      "id": "CP-001",
      "timestamp": "2026-02-08T14:30:00Z",
      "phaseId": 3,
      "gitCommit": "abc123def456",
      "gitBranch": "main",
      "trigger": "phase-gate-pass",
      "description": "Fase 3 Arkitektur fullført",
      "stateSnapshot": { /* kopi av PROJECT-STATE ved dette tidspunktet */ }
    }
  ]
}
```

### Rollback-prosess
Når bruker sier "Gå tilbake til [dato/checkpoint]":
1. Finn nærmeste checkpoint (etter dato eller ID)
2. Vis bruker hva som vil gå tapt (oppgaver fullført etter checkpoint)
3. Be om bekreftelse
4. Erstatt PROJECT-STATE.json med stateSnapshot fra checkpoint
5. Sett currentPhase til checkpoint.phase
6. Generer ny MISSION-BRIEFING for den fasen
7. Start fase-agenten på nytt

> **Etter vellykket rollback:** oppdater `lastRestore` i PROJECT-STATE.json med tidspunkt for gjenoppretting.

### "Vis alle checkpoints"
Når bruker sier dette, les checkpoints[] fra PROJECT-STATE.json og vis:
| # | Dato | Fase | Beskrivelse |
|---|------|------|-------------|
| CP-001 | 2026-02-08 | Fase 3 | Arkitektur fullført |

---

## CHECKPOINT-MANAGEMENT

> **v3.2-notat:** Checkpoint-typer lagres i `.ai/PROJECT-STATE.json` under `checkpoints[]`. Hver entry har `{ type, timestamp, phaseId, stateSnapshot }`. Gyldige `type`-verdier: `"phase-complete"`, `"milestone"`, `"manual"`, `"safety-backup"`.

### Automatiske checkpoints

| Event | Checkpoint-type | Retention |
|-------|-----------------|-----------|
| Gate PASS | Full checkpoint | 90 dager |
| Dag slutt | Session checkpoint | 30 dager |
| Før risikofull operasjon | Pre-op checkpoint | 7 dager |

### Manuell checkpoint

```markdown
Bruker: "Lagre checkpoint manuelt"

ORCHESTRATOR:
1. Genererer checkpoint-ID: checkpoint-manual-2026-02-05-1030
2. Git commit med tag
3. Lagrer state-snapshot
4. Bekrefter til bruker

Checkpoint lagret: checkpoint-manual-2026-02-05-1030
Beskrivelse: [bruker-beskrivelse]
```

### Checkpoint-struktur

```json
{
  "id": "checkpoint-gate4-2026-02-05T10:00:00Z",
  "type": "GATE_PASS",
  "timestamp": "2026-02-05T10:00:00Z",
  "gitCommit": "abc123def456789",
  "gitBranch": "main",
  "phase": 4,
  "description": "Phase 4 complete - MVP deployed",
  "state": {
    "completedSteps": ["..."],
    "pendingTasks": ["..."],
    "artifacts": ["..."]
  },
  "checksums": {
    "projectState": "sha256:abc...",
    "sessionHandoff": "sha256:def..."
  }
}
```

### Checkpoint Pruning og Retention

**Ansvarlig for pruning:** ORCHESTRATOR kjører pruning-sjekk ved hver faseovergang. Gamle checkpoints arkiveres til `.ai/CHECKPOINT-HISTORY/` (opprettes ved behov) før de fjernes fra `checkpoints[]`.

Retention-policy:
- **Full checkpoint (Gate PASS):** 90 dager
- **Session checkpoint (Dag slutt):** 30 dager
- **Pre-op checkpoint (Før risikofull operasjon):** 7 dager
- **Manual checkpoint:** 180 dager

Arkiverte checkpoints blir aldri slettet fra `.ai/CHECKPOINT-HISTORY/` — de beholdes som permanent logg, men fjernes fra aktiv `checkpoints[]` når retention-perioden utløper.

---

## VALIDERING ETTER ROLLBACK

### Obligatoriske sjekker

```
1. GIT INTEGRITET
   ├─ git status (clean working tree)
   ├─ git log (riktig HEAD)
   └─ git diff [checkpoint] (ingen diff)

2. STATE INTEGRITET
   ├─ PROJECT-STATE.json valider mot schema
   ├─ Checksum matcher checkpoint
   └─ History er konsistent

3. FIL INTEGRITET
   ├─ Alle checkpoint-filer eksisterer
   ├─ Innhold matcher checkpoint
   └─ Ingen korrupte filer

4. AGENT INTEGRITET
   ├─ ORCHESTRATOR kan starte
   ├─ Riktig fase-agent aktiveres
   └─ Context-loading fungerer
```

### Post-rollback rapport

```markdown
## ROLLBACK RAPPORT

**Type:** FULL ROLLBACK
**Tidspunkt:** 2026-02-05T10:30:00Z
**Checkpoint:** phase3-complete

### Status
✓ Git reset vellykket
✓ State gjenopprettet
✓ Validering bestått

### Tapt arbeid
- 15 oppgaver i Fase 4
- 3 timer estimert gjenoppbygging

### Neste steg
1. Analyser årsak til rollback
2. Planlegg ny tilnærming
3. Start Fase 4 på nytt

### Anbefaling
Vurder GRUNDIG intensitetsnivå for Fase 4.
```

---

## ROLLBACK-BESLUTNINGSTRE

```
FEIL OPPSTÅTT
     │
     ▼
┌─────────────────────────┐
│ Er det agent-output-feil│
│ eller state-mismatch?   │
└───────────┬─────────────┘
        JA  │  NEI
            │    │
            ▼    │
     SOFT ROLLBACK
            │    │
            │    ▼
            │ ┌─────────────────────────┐
            │ │ Er noen filer korrupte  │
            │ │ mens andre er OK?       │
            │ └───────────┬─────────────┘
            │         JA  │  NEI
            │             │    │
            │             ▼    │
            │    PARTIAL ROLLBACK
            │             │    │
            │             │    ▼
            │             │ ┌─────────────────────────┐
            │             │ │ Er det kritisk system-  │
            │             │ │ feil eller arkitektur?  │
            │             │ └───────────┬─────────────┘
            │             │         JA  │  NEI
            │             │             │    │
            │             │             ▼    │
            │             │      FULL ROLLBACK
            │             │             │    │
            │             │             │    ▼
            │             │             │ ┌─────────────────────────┐
            │             │             │ │ Er det produksjons-     │
            │             │             │ │ påvirkning?             │
            │             │             │ └───────────┬─────────────┘
            │             │             │         JA  │  NEI
            │             │             │             │    │
            │             │             │             ▼    │
            │             │             │   EMERGENCY     │
            │             │             │   ROLLBACK      │
            │             │             │             │    │
            └─────────────┴─────────────┴─────────────┴────┘
                                                      │
                                                      ▼
                                              FORTSETT UTEN
                                              ROLLBACK
```

---

## VERSJONSKONTROLL

| Felt | Verdi |
|------|-------|
| Versjon | 1.0.1 |
| Opprettet | 2026-02-05 |
| Sist oppdatert | 2026-04-22 |

---

*Relatert:*
- `../agenter/system/agent-ORCHESTRATOR.md` - CHECKPOINT-RECOVERY
- `ERROR-CODE-REGISTRY.md` - Feilkoder
- `../agenter/system/protocol-SYSTEM-COMMUNICATION.md` - State-management

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
