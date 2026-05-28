# protocol-SYSTEM-COMMUNICATION v3.5.0

> Protokoll for kommunikasjon og koordinering mellom de 6 system-agentene (Nivå 0): ORCHESTRATOR, AUTO-CLASSIFIER, BROWNFIELD-SCANNER, CONTEXT-LOADER, PHASE-GATES, AGENT-PROTOCOL.
> Inkludert: 3-lags hierarkisk kontekstarkitektur (Kit CC v3.5)
>
> **Rolleavgrensning:** Denne filen dekker Nivå 0 (system-agenter). For kommunikasjon mellom prosess-agenter (Nivå 2) og ekspert-agenter (Nivå 3), se `agent-AGENT-PROTOCOL.md`.

---

## FORMÅL

Denne filen definerer:
1. Hvordan de 6 system-agentene kommuniserer med hverandre
2. State-locking via sekvensiell kø
3. Unified history-struktur
4. Feilhåndtering mellom system-agenter
5. Oppstarts-sekvens med timeout og fallback
6. **Session-status og krasj-deteksjon** (ny v1.1)
7. **Ekspert-konflikt håndtering** (ny v1.1)
8. **Circuit-breaker med glidende vindu** (ny v1.1)
9. **Bruker-kommunikasjonsnivåer** (ny v3.3)

> **Oppdatert for v3.2:** State-skrivetilgang er desentralisert. Fase-agenter skriver nå direkte til PROJECT-STATE.json under normal drift. Se ny seksjon "State-skrivetilgang (v3.2)" under STATE-LOCKING-delen.

**Viktig:** Denne protokollen er BINDENDE for alle system-agenter. Avvik krever eksplisitt brukerbekreftelse.

---

## DE 6 SYSTEM-AGENTENE

| Agent | Forkortelse | Primæransvar |
|-------|-------------|--------------|
| ORCHESTRATOR | ORC | Sentral koordinering, dirigent |
| AGENT-PROTOCOL | PRO | Kommunikasjonsstandarder for alle agenter |
| AUTO-CLASSIFIER | CLA | Prosjektklassifisering og intensitetsnivå |
| BROWNFIELD-SCANNER | BRF | 25-agents sverm for analyse av eksisterende kodebaser |
| CONTEXT-LOADER | CON | Kontekst-lasting ved session-start |
| PHASE-GATES | GAT | Kvalitetsvalidering ved fasebytte |

---

## KOMMUNIKASJONSMODELL

### Prinsipp: Hub-and-Spoke

```
                    ┌─────────────────┐
                    │   ORCHESTRATOR  │
                    │     (Hub)       │
                    └────────┬────────┘
                             │
    ┌────────────────┬───────┼───────┬────────────────┐
    │                │       │       │                │
    ▼                ▼       ▼       ▼                ▼
┌─────────┐   ┌──────────┐ ┌───┐ ┌─────────┐   ┌──────────────┐
│ CONTEXT-│   │ AUTO-    │ │   │ │ PHASE-  │   │ BROWNFIELD-  │
│ LOADER  │   │CLASSIFIER│ │   │ │ GATES   │   │ SCANNER      │
└─────────┘   └──────────┘ │   │ └─────────┘   └──────────────┘
     │              │      │   │      │               │
     └──────────────┴──────┤   ├──────┴───────────────┘
                           │   │
                    ┌──────┴───┴──────┐
                    │ AGENT-PROTOCOL  │
                    │ (Referanse)     │
                    └─────────────────┘
```

### Regler

1. **ORCHESTRATOR er alltid mellomledd**
   - Ingen system-agent kommuniserer direkte med en annen system-agent
   - Alle forespørsler går via ORCHESTRATOR
   - ORCHESTRATOR logger alle interaksjoner

2. **AGENT-PROTOCOL er referanse, ikke aktør**
   - AGENT-PROTOCOL definerer formater og regler
   - Den "utfører" ikke oppgaver selv
   - Andre agenter konsulterer den for korrekt format

3. **Synkron kommunikasjon (Chat-basert AI)**
   - System-agenter venter på svar før de fortsetter
   - Timeout-verdier: Veiledende for fremtidig automatisering
   - I dag: AI signaliserer umiddelbar respons eller BLOCKED/NEED-INPUT
   - Ved blokkering: Eskalér til bruker med NEED-INPUT-signal
   - Ved chat timeout: Neste sesjon fortsetter fra PROGRESS-LOG

---

## STATE-LOCKING: SEKVENSIELL KØ

### State-skrivetilgang (v3.2)

I v3.2-arkitekturen har flere agenter skrivetilgang til PROJECT-STATE.json, fordelt etter rolle:

| Rolle | Skriver | Felt |
|-------|---------|------|
| Aktiv fase-agent | Under normal drift | `phaseProgress.completedSteps[]`, `phaseProgress.skippedSteps[]`, `completedTasks[]`, `session.lastSignificantAction` |
| ORCHESTRATOR | Ved faseovergang | `currentPhase`, `lastCheckpoint`, `pendingDecisions[]`, `history.events[]` |
| AUTO-CLASSIFIER | Ved bootstrap (engangs) | Hele filen (initial opprettelse) |
| PHASE-GATES | Ved gate-validering | `phaseProgress.gateResult` |

**Regel:** Kun ÉN agent skriver om gangen. Fase-agenten eier state under normal drift. ORCHESTRATOR tar over kun ved faseovergang.

### Eksplisitt feltansvarsfordeling

For å eliminere race conditions er følgende feltansvarsfordeling BINDENDE:

| Felt | Skriver | Når | Kommentar |
|------|---------|-----|----------|
| `phaseProgress.currentPhase` | ORCHESTRATOR | Ved faseovergang (FASE N → FASE N+1) | Kun ORCHESTRATOR kan initiere fasebytte. Ingen andre skriver. |
| `phaseProgress.gateResults` | PHASE-GATES | Ved gate-validering | PHASE-GATES skriver resultat direkte. ORCHESTRATOR relayer forespørsel (ikke modifiserer). |
| `phaseProgress.completedPhases` | ORCHESTRATOR | Etter PHASE-GATES passerer gate | ORCHESTRATOR oppdaterer etter bekreftelse. |
| `metadata.*` | AUTO-CLASSIFIER | Ved klassifisering/reklassifisering | Kun AUTO-CLASSIFIER endrer klassifiseringsmetadata. |
| `history.events[]` | Alle system-agenter | Append-only etter hendelse | Append tillatt, modifisering av eksisterende events FORBUDT. |
| `completedSteps[]`, `skippedSteps[]` | Aktiv fase-agent | Under normal drift | Fase-agenten dokumenterer sitt eget arbeid. |
| `session.lastSignificantAction` | Aktiv agent | Etter vesentlig handling | Progressiv state-oppdatering for crash-recovery. |
| `imageStrategy` | AUTO-CLASSIFIER | Under klassifisering | Velges basert på prosjekttype. Brukes av BYGGER-agent i Fase 4-5. |
| `devServer.port` | 4-MVP-agent | Steg 4.6.0 (dev-server oppsett) | Port for dev-server. Leses av DEBUGGER-agent og alle agenter for "Vis status". |
| `overlay.port` | Boot-sekvens (protocol-MONITOR-OPPSETT.md, CLAUDE.md steg 5) | Første gang Monitor settes opp | Port for Kit CC Monitor. Håndteres av boot-sekvensen, søker etter ledig port. |

### Hvorfor?

- Forhindrer konflikter når flere agenter vil skrive samtidig (desentralisert modell reduserer grensesnitt)
- Sikrer konsistent state gjennom klare ansvarslinjer
- Gjør feilsøking enklere (ansvarslinje per agent)
- **Eliminerer race conditions ved å fjerne overlappende skriveansvar**

### PARKÉR IDÉ-MEKANISME (alle faser)

Når bruker foreslår noe som hører til en annen fase:
1. Bekreft at idéen er notert
2. Legg til i PROGRESS-LOG: `{"ts":"<ISO 8601>","event":"PARKED","desc":"[beskrivelse]","targetPhase":[N],"schemaVersion":1}`
3. Informer bruker: "God idé! Jeg har notert det. Vi tar det opp i Fase [N] ([fasenavn])."
4. Fortsett med nåværende arbeid

Denne mekanismen gjelder ALLE faser, ikke bare Fase 5.

---

---

## UNIFIED HISTORY

### Struktur

Istedenfor tre separate historikk-mekanismer, bruker vi én felles struktur i PROJECT-STATE.json:

```json
{
  "history": {
    "events": [
      {
        "id": "evt-001",
        "timestamp": "2026-02-02T10:00:00Z",
        "type": "CHECKPOINT",
        "phase": 2,
        "agent": "ORC",
        "data": {
          "gitCommitHash": "abc123",
          "description": "Fase 2 komplett"
        }
      },
      {
        "id": "evt-002",
        "timestamp": "2026-02-02T10:01:00Z",
        "type": "GATE_RESULT",
        "phase": 2,
        "agent": "GAT",
        "data": {
          "layer1": {"status": "PASS", "mustTasksCompleted": 5, "mustTasksTotal": 5},
          "layer2": {"status": "PASS", "score": 91},
          "breakdown": {"artifacts": 38, "quality": 28, "security": 25}
        }
      },
      {
        "id": "evt-003",
        "timestamp": "2026-02-02T10:02:00Z",
        "type": "CLASSIFICATION",
        "phase": 2,
        "agent": "CLA",
        "data": {
          "previousLevel": "standard",
          "newLevel": "grundig",
          "reason": "Sensitiv data detektert",
          "score": 21
        }
      },
      {
        "id": "evt-004",
        "timestamp": "2026-02-02T10:03:00Z",
        "type": "SESSION_START",
        "phase": 3,
        "agent": "CON",
        "data": {
          "documentsLoaded": 5,
          "contextSize": "120KB"
        }
      }
    ],
    "latestByType": {
      "CHECKPOINT": "evt-001",
      "GATE_RESULT": "evt-002",
      "CLASSIFICATION": "evt-003",
      "SESSION_START": "evt-004"
    }
  }
}
```

### Event-typer

| Type | Genereres av | Beskrivelse |
|------|--------------|-------------|
| `CHECKPOINT` | ORCHESTRATOR | Snapshot av prosjekttilstand |
| `GATE_RESULT` | PHASE-GATES | Resultat av to-lags kvalitetsport (Lag 1: MÅ-sjekk + Lag 2: kvalitetsvurdering) |
| `CLASSIFICATION` | AUTO-CLASSIFIER | Klassifisering eller re-klassifisering |
| `SESSION_START` | CONTEXT-LOADER | Ny session startet |
| `SESSION_END` | ORCHESTRATOR | Session avsluttet normalt |
| `SESSION_CRASH_DETECTED` | ORCHESTRATOR | Forrige sesjon ble avbrutt uten normal avslutning (krasj detektert) |
| `AGENT_SWITCH_CHECKPOINT` | ORCHESTRATOR | Progressiv checkpoint ved agent-bytte |
| `SIGNIFICANT_ACTION` | ORCHESTRATOR | Vesentlig handling utført (oppgave fullført, fil opprettet, beslutning tatt, etc.) |
| `ERROR` | Alle | Feil som ble håndtert |
| `USER_OVERRIDE` | ORCHESTRATOR | Bruker overstyrte en beslutning |
| `REGRESSION` | PHASE-GATES | Kvalitetsregresjon oppdaget |

### Fordeler med Unified History

1. **Enkel rollback:** Finn checkpoint, rull tilbake alt til den tilstanden
2. **Full sporbarhet:** Se alt som skjedde i kronologisk rekkefølge
3. **Kryssreferanser:** Lett å se at GATE_RESULT skjedde rett etter CHECKPOINT
4. **Ingen synkroniseringsproblemer:** Én kilde til sannhet

---

## OPPSTARTS-SEKVENS

### Boot-sekvens med lag-arkitektur (v3.2)

Fra Kit CC v3.2 bruker oppstarten en 3-lags kontekstarkitektur. ORCHESTRATOR og CONTEXT-LOADER lastes ikke automatisk — de er Lag 3 og aktiveres kun når nødvendig.

```
SESSION START
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ STEG 1: Les PROJECT-STATE.json (Lag 1)                  │
│ ├── FINNES → Gå til STEG 2                             │
│ └── FINNES IKKE → Gå til STEG 1B                       │
└─────────────────────────────────────────────────────────┘
    │                              │
    │                              ▼
    │              ┌─────────────────────────────────────┐
    │              │ STEG 1B: Last AUTO-CLASSIFIER (Lag 3)│
    │              │ Timeout: 5 minutter                 │
    │              │ ├── SVAR → Opprett PROJECT-STATE.json│
    │              │ └── TIMEOUT → Bruk MINIMAL nivå    │
    │              └─────────────────────────────────────┘
    │                              │
    ▼◄─────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ STEG 2: Bestem currentPhase → Last fase-agent (Lag 1)   │
│ Lesen fra PROJECT-STATE.json                            │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ STEG 3: Last MISSION-BRIEFING-FASE-{N}.md (Lag 1)       │
│ ├── SUKSESS → Kontekst lastet                          │
│ └── FEIL → Fallback til minimal kontekst               │
│     (kun PROJECT-STATE.json + SESSION-HANDOFF.md)      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ STEG 4: Presenter status til bruker                     │
│ - Prosjektnavn, fase, intensitetsnivå                   │
│ - Hva som ble gjort sist                                │
│ - Foreslått neste handling                              │
└─────────────────────────────────────────────────────────┘
    │
    ▼
KLAR TIL ARBEID
```

**Endringer fra v1.x:**
- ORCHESTRATOR og CONTEXT-LOADER er nå **Lag 3** (ikke automatisk lastet)
- Boot trenger ingen ORCHESTRATOR for normalt arbeid
- **Mission briefing** er primær kontekstoverføring mellom faser
- Fase-agenter kan bruke **NEED_CONTEXT** signaler for Lag 2-ressurser

### Fallback-verdier

| Situasjon | Fallback | Varsling |
|-----------|----------|----------|
| AUTO-CLASSIFIER timeout | MINIMAL intensitetsnivå | "Klassifisering hoppet over - bruker minimalt nivå" |
| CONTEXT-LOADER timeout | Kun state + handoff | "Begrenset kontekst lastet" |
| PROJECT-STATE korrupt | Opprett ny fra scratch | "Prosjektstatus nullstilt - start på nytt" |
| PHASE-GATES utilgjengelig | Hopp over gate-sjekk | "Gate-validering hoppet over" |

### CONTEXT-LOADER Timeout og Fallback (v3.2)

| Scenario | Timeout | Fallback |
|----------|---------|----------|
| Mission briefing-generering | 30 sekunder | Bruk forrige mission briefing + advar bruker |
| NEED_CONTEXT fra Lag 2 | 10 sekunder | Last filen direkte uten komprimering |
| ENTERPRISE kontekstpakking | 60 sekunder | Reduser kontekstvindu + advar bruker |
| Mission briefing mangler ved boot | N/A | Generer minimal briefing fra PROJECT-STATE.json |

**Regel:** Hvis CONTEXT-LOADER ikke er tilgjengelig, kan fase-agenten alltid falle tilbake til å lese Lag 2-filer direkte via filsystem. CONTEXT-LOADER er en optimalisering, ikke en blokkering.

---

## HIERARKISK KONTEKSTPROTOKOLL (v3.2)

### Kontekstlag-definisjon

| Lag | Navn | Innhold | Lasteregler |
|-----|------|---------|-------------|
| 1 | Arbeidsbord | PROJECT-STATE.json + aktiv fase-agent + MISSION-BRIEFING + PROGRESS-LOG.jsonl | Alltid lastet ved boot, maks 4 filer |
| 2 | Skrivebordsskuff | Ekspert/basis-agenter, fase-leveranser, klassifisering | On-demand via NEED_CONTEXT, maks 3-4 filer per forespørsel |
| 3 | Arkiv | System-agenter, protokoller, historikk | Kun ved: nytt prosjekt, krasj, fase-overgang, feil |

### Lag-navigering — NEED_CONTEXT-protokoll

Når en fase-agent trenger mer kontekst:

1. **Sjekk mission briefing** → "TILGJENGELIGE RESSURSER (Lag 2)"
2. **Signal NEED_CONTEXT** med:
   ```
   ---NEED_CONTEXT---
   Agent: {AGENT-ID}
   Filsti: {eksakt filsti fra mission briefing}
   Grunn: {kort beskrivelse av behov}
   Lag: 2
   ---END_NEED_CONTEXT---
   ```
3. **Mottaker:** CONTEXT-LOADER (Lag 3, lastes midlertidig for å oppfylle forespørselen)
4. **Respons:** Filen returneres (komprimert hvis >500 linjer)
5. **Eskalering:** Hvis filen ikke er i Lag 2, eskaleres til ORCHESTRATOR (Lag 3)

**Timeout-spesifikasjon (NYT):**

NEED_CONTEXT-forespørsler: Veiledende timeout var 30 sekunder (for fremtidig automatisering). I dag, i chat-basert AI:
- Agenten signaliserer NEED_CONTEXT med filstiangabe
- AI leser filen direkte fra filsystemet (ingen timeout)
- **Hvis fil mangler:** Kjør VERIFISER-FØR-MANGEL-protokollen (SSOT: `protocol-VERIFY-BEFORE-MISSING.md`):
  1. Søk etter filnavnet rekursivt i prosjektmappen
  2. Søk etter innhold/nøkkelord med grep
  3. Funnet annet sted? → Bruk filen + logg feil referanse i PROGRESS-LOG
  4. Ikke funnet etter søk? → Signaliser ERROR med søkebevis
- Systemet faller tilbake til følgende alternativ:
- **Lag 2-fil:** Last filen direkte via filsystem uten komprimering
- **Lag 3-ressurs:** Eskalér til ORCHESTRATOR for manuell kontekstløsning
- **Feil/utilgjengelig etter søk:** Varsle bruker og fortsett med tilgjengelig kontekst

### Boot-sekvens med lag-bevissthet

```
NORMAL BOOT (90% av tilfellene):
1. CLAUDE.md → Les PROJECT-STATE.json (Lag 1)
2. Bestem currentPhase → Last fase-agent (Lag 1)
3. Last MISSION-BRIEFING-FASE-{N}.md (Lag 1)
4. Start arbeid — ferdig!

NYTT PROSJEKT (10% av tilfellene):
1. CLAUDE.md → Ingen PROJECT-STATE.json
2. Last AUTO-CLASSIFIER (Lag 3, engangs)
3. Klassifisering → Opprett PROJECT-STATE.json
4. Last CONTEXT-LOADER (Lag 3) → Generer MISSION-BRIEFING-FASE-1.md
5. Normal boot fra steg 1

KRASJ-RECOVERY:
1. CLAUDE.md → PROJECT-STATE.json med session.status = "active"
2. Last SESSION-HANDOFF.md (Lag 2)
3. Informer bruker → Tilby gjenoppretting
4. Eventuelt: Last ORCHESTRATOR (Lag 3) for avansert recovery
5. Normal boot fra steg 1
```

### Fase-overgang med mission briefing

```
FASE N → FASE N+1:
1. Fase-agent signalerer PHASE_COMPLETE
2. Last PHASE-GATES (Lag 3, midlertidig) → Kjør validering
3. HVIS PASS:
   a. Fase-agent genererer MISSION-BRIEFING-FASE-{N+1}.md
   b. Oppdater PROJECT-STATE.json (currentPhase = N+1)
   c. Avlast Lag 3-filer (PHASE-GATES)
   d. Last neste fase-agent + ny mission briefing (Lag 1)
4. HVIS FAIL:
   a. Vis mangler til bruker
   b. Forbli i Fase N
```

### Mission briefing som kontekstkontrakt

Mission briefing fungerer som en **kontrakt** mellom faser:
- **Avsender-fase** garanterer at all nødvendig kontekst er inkludert
- **Mottaker-fase** kan starte umiddelbart uten å laste ekstra filer
- **Lag 2-referanser** i briefingen garanterer at agenten vet nøyaktig hva den KAN hente
- **Komprimeringsreferanser** garanterer at fullversjoner alltid er tilgjengelige

### Recoverable compression-prinsipp

1. **Komprimer først** — reduser lengde men behold all informasjon
2. **Oppsummer bare som siste utvei** — kun når komprimering ikke er nok
3. **Behold alltid filstier** — til fullversjoner i Lag 2/3
4. **AI skal aldri miste informasjonstilgang** — komprimering er reversibel via filsti-referanser

**Mal-referanse:**

Se `Kit CC/Agenter/maler/MISSION-BRIEFING-MAL.md` for komplett mal-struktur og eksempler på mission briefing-generering.

---

## FEILHÅNDTERING MELLOM SYSTEM-AGENTER

### Hierarki

```
Feilnivå 1: Agent-intern feil
└── Agent prøver å løse selv (maks 3 forsøk)

Feilnivå 2: Kommunikasjonsfeil
└── ORCHESTRATOR tar over, prøver alternativ rute

Feilnivå 3: Systemfeil
└── Eskalér til bruker med konkrete alternativer
```

### Feilhåndterings-protokoll

```
FEIL OPPSTÅR I SYSTEM-AGENT
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ STEG 1: Lokal håndtering (maks 3 forsøk)                │
│ Agent prøver å løse feilen selv                         │
│ ├── LØST → Fortsett, logg hendelse                     │
│ └── IKKE LØST → Gå til STEG 2                          │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ STEG 2: Eskalér til ORCHESTRATOR                        │
│ Send: ---SYSTEM-ERROR---                                │
│       Agent: [AGENT-ID]                                 │
│       Feiltype: [TIMEOUT|CORRUPT|UNAVAILABLE]           │
│       Forsøk: 3                                         │
│       Kontekst: [hva skjedde]                           │
│       ---END---                                         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ STEG 3: ORCHESTRATOR vurderer                           │
│ ├── Fallback tilgjengelig? → Bruk fallback             │
│ ├── Kan hoppe over? → Hopp over med varsel             │
│ └── Kritisk? → Eskalér til bruker                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ STEG 4: Bruker-eskalering (hvis nødvendig)              │
│                                                         │
│ "⚠️ SYSTEMFEIL                                          │
│                                                         │
│  [AGENT-NAVN] kunne ikke fullføre oppgaven.             │
│                                                         │
│  Problem: [beskrivelse]                                 │
│                                                         │
│  Alternativer:                                          │
│  A) Prøv på nytt                                        │
│  B) Hopp over denne delen                               │
│  C) Avslutt og lagre tilstand                          │
│                                                         │
│  Velg (A/B/C):"                                         │
└─────────────────────────────────────────────────────────┘
```

---

## SYNKRONISERING VED FASEBYTTE (Med Mission Briefing — v3.2)

### Prosess

Ved overgang fra én fase til neste, må alle system-agenter synkroniseres. Fra Kit CC v3.2 er mission briefing generering en sentral del av faseovergangen.

```
FASEBYTTE FORESPØRSEL
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. ORCHESTRATOR mottar forespørsel (Lag 3 aktiveres)    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Last PHASE-GATES for validering (Lag 3, midlertidig) │
│    └── Vent på PASS/PARTIAL/FAIL                       │
└─────────────────────────────────────────────────────────┘
    │
    ├── FAIL → Stopp, vis mangler, returner
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Kall AUTO-CLASSIFIER for re-klassifisering (Lag 3)   │
│    └── Sjekk om intensitetsnivå bør endres             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Fase-agent genererer MISSION-BRIEFING-FASE-{N+1}.md  │
│    (Lag 1 for neste fase)                              │
│    ├── Oppsummering av gjeldende fase                  │
│    ├── Leveranser og resultater                        │
│    ├── "TILGJENGELIGE RESSURSER" (Lag 2-refs)          │
│    └── Oppgaveliste for neste fase                     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 5. ORCHESTRATOR oppdaterer PROJECT-STATE.json           │
│    ├── currentPhase = neste fase                       │
│    ├── history += CHECKPOINT event                      │
│    └── history += GATE_RESULT event                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Avlast Lag 3-filer (PHASE-GATES)                     │
│    └── Kun mission briefing og fase-agent forblir i Lag 1│
└─────────────────────────────────────────────────────────┘
    │
    ▼
FASEBYTTE KOMPLETT — KLAR FOR FASE N+1
```

**Endringer fra v1.x:**
- Mission briefing generering er nå **eksplisitt steg** i prosessen
- ORCHESTRATOR og CONTEXT-LOADER er **Lag 3** (lastes midlertidig)
- PHASE-GATES er **midlertidig lastet** — avlastes etter validering
- Neste fase starter med **kun 4 filer i Lag 1**: PROJECT-STATE.json + fase-agent + MISSION-BRIEFING + PROGRESS-LOG.jsonl

---

## SESSION-STATUS OG KRASJ-DETEKSJON (v2.0 — Progressiv)

### Formål

Oppdage og håndtere situasjoner hvor forrige session ikke ble avsluttet korrekt (krasj, strømbrudd, bruker lukket vindu), med minimalt datatap takket være progressiv state-oppdatering.

### Kjerneprinsipp

```
HYBRID CRASH-RECOVERY:

1. PROGRESSIV STATE (fundament)
   └─ Oppdater PROJECT-STATE.json og SESSION-HANDOFF.md etter
      hver vesentlig handling → maks 1 oppgave tapt ved krasj

2. CRASH-DETEKSJON (sikkerhetsnett)
   └─ session.status-flagg detekterer om forrige sesjon krasjet
   └─ Neste sesjon vet nøyaktig hva som skjedde
   └─ Informerer bruker og tilbyr gjenoppretting

3. "REN TILSTAND" (tillegg)
   └─ Kodebasen er alltid i brukbar tilstand
   └─ Git commit ved hvert agent-bytte
   └─ Ingen halvferdige filer etterlates
```

### Implementering — PROJECT-STATE.json session-felt

```json
{
  "session": {
    "status": "active | completed",
    "startedAt": "2026-02-03T10:00:00Z",
    "sessionId": "sess-abc123",
    "lastSignificantAction": {
      "timestamp": "2026-02-03T10:14:30Z",
      "type": "TASK_COMPLETED",
      "description": "Autentisering implementert — src/auth.py opprettet",
      "agent": "BYGGER"
    },
    "crashRecovery": {
      "previousSessionCrashed": false,
      "recoveredAt": null,
      "lastKnownState": null,
      "dataLossEstimate": null
    }
  }
}
```

### Eksplisitte triggere for PROGRESS-LOG (erstatter "vesentlig handling")

> **v3.3:** Vage triggere ("vesentlig handling") er erstattet med formulaiske triggere.

**ALLTID append til `.ai/PROGRESS-LOG.jsonl` etter:**
1. Git commit → `{"ts":"<ISO 8601>","event":"COMMIT","msg":"[melding]","schemaVersion":1}`
2. Ny fil opprettet → `{"ts":"<ISO 8601>","event":"FILE","op":"created","path":"[filsti]","desc":"[beskrivelse]","schemaVersion":1}`
3. Fil vesentlig endret → `{"ts":"<ISO 8601>","event":"FILE","op":"modified","path":"[filsti]","desc":"[hva endret]","schemaVersion":1}`
4. Oppgave fullført → `{"ts":"<ISO 8601>","event":"DONE","task":"[oppgave-ID]","output":"[leveranse]","schemaVersion":1}`
5. Før ny oppgave startes → `{"ts":"<ISO 8601>","event":"START","task":"[oppgave-ID]","desc":"[beskrivelse]","schemaVersion":1}`
6. Brukerbeslutning → `{"ts":"<ISO 8601>","event":"DECISION","what":"[beslutning]","reason":"[begrunnelse]","schemaVersion":1}`
7. Feil oppdaget → `{"ts":"<ISO 8601>","event":"ERROR","type":"[state|planning|execution|context|communication|dependency|timeout|validation]","desc":"[beskrivelse]","fix":"[løsning]","schemaVersion":1}`

**Oppdater PROJECT-STATE.json SJELDNERE (per 3 fullførte oppgaver / sesjonsslutt).**

### Forhold mellom loggfiler

| Fil | Frekvens | Kostnad | Formål |
|-----|----------|---------|--------|
| PROGRESS-LOG.jsonl | Etter HVER handling | Lav (1 linje append) | Minutt-for-minutt historikk |
| PROJECT-STATE.json | Etter 3 oppgaver / sesjonsslutt | Høy (les+skriv JSON) | Strukturert tilstand |
| SESSION-HANDOFF.md | Ved milepæler / sesjonsslutt | Medium | Fase-overføring |

### Kontekstbudsjett-protokoll (v3.4)

**PAUSE-trigger:** Etter 8 filer lest/skrevet ELLER 25 meldinger:

**STEG 1 — LAGRE FØRST (alt FØR noe vises til bruker):**
1. Hvis nåværende fase er ferdig (alle MÅ-oppgaver fullført):
   → Oppdater `currentPhase` til neste fase i PROJECT-STATE.json
   → Generer MISSION-BRIEFING for neste fase (kort versjon)
2. Oppdater PROJECT-STATE.json med alt fullført arbeid + `session.status = "completed"` (ALT i samme skriveoperasjon)
3. Oppdater SESSION-HANDOFF.md med neste steg
4. Append til PROGRESS-LOG: `{"ts":"<ISO 8601>","event":"STATE_CHANGE","subtype":"CONTEXT_BUDGET","desc":"Budsjett nådd — state lagret, session completed","schemaVersion":1}`

**STEG 2 — VIS MELDING (etter at alt er lagret):**
5. Vis bruker kontekstbudsjett-meldingen (se CLAUDE.md Kontekstbudsjett-protokoll)

**VIKTIG:** Lagring (steg 1-4) MÅ skje FØR meldingen vises. Uten dette ser neste sesjon en falsk "krasj".

### Krasj-recovery med PROGRESS-LOG (v3.4)

Ved krasj-deteksjon (session.status = "active"):
1. Les `.ai/PROGRESS-LOG.jsonl` siste 10 linjer — dette er PRIMÆRKILDEN (mest oppdatert)
2. **SJEKK FØRST:** Finnes `"subtype":"CONTEXT_BUDGET"` (eller legacy `⚠️ KONTEKST: Budsjett nådd`) i logg?
   → JA: Dette er en **budget-pause** (ikke krasj) — state er allerede lagret, gjenoppta normalt
   → NEI: Fortsett med crash-recovery (steg 3)
3. Les `.ai/PROJECT-STATE.json` — backup/strukturert tilstand
4. Ved uenighet mellom PROGRESS-LOG og PROJECT-STATE → stol på PROGRESS-LOG
5. Presenter siste registrerte handling til bruker

### Ved session-start (BOOT med krasj-deteksjon)

```
NY SESSION STARTER
    │
    ▼
Les PROJECT-STATE.json
    │
    ├── session.status = "completed"
    │   └── Alt OK → Sett status til "active" → Lagre UMIDDELBART → Fortsett normalt
    │
    └── session.status = "active"
        │
        ▼
    ⚠️ FORRIGE SESSION BLE AVBRUTT

    ORCHESTRATOR:
    1. Les PROGRESS-LOG.jsonl siste 10 linjer (PRIMÆRKILDE)
    2. Les session.lastSignificantAction for siste kjente handling
    3. Les milepælsloggen i SESSION-HANDOFF.md for komplett bilde
    4. Estimer datatap basert på tidsdifferanse og handlingstype
    5. Sett session.crashRecovery-felter
    6. Logg SESSION_CRASH_DETECTED event i history

    PRESENTER TIL BRUKER:

    "⚠️ Forrige arbeidsøkt ble avbrutt uventet.

    Sist lagrede handling: [lastSignificantAction.description]
    Tidspunkt: [lastSignificantAction.timestamp]
    Du var i: Fase [X] - [beskrivelse]
    Siste agent: [lastSignificantAction.agent]

    Takket være progressiv lagring er tilstanden oppdatert.
    Estimert datatap: Maks 1 oppgave.

    Hva vil du gjøre?

    A) Fortsett der du var (anbefalt)
       → Gjenopptar fra siste lagrede handling

    B) Se milepælslogg
       → Viser komplett logg over alt som ble gjort i forrige sesjon

    C) Rull tilbake til siste formelle checkpoint
       → Går tilbake til forrige PHASE-GATE checkpoint"
```

### Progressiv oppdatering under sesjon

```
ETTER HVER VESENTLIG HANDLING:

1. Oppdater PROJECT-STATE.json:
   ├─ session.lastSignificantAction (type, beskrivelse, agent, timestamp)
   ├─ lastCheckpoint (timestamp, agent, summary)
   ├─ completedTasks[] / pendingTasks[] (hvis relevant)
   ├─ phaseProgress (hvis relevant)
   ├─ history.events[] += SIGNIFICANT_ACTION event
   └─ Lagre filen

2. Oppdater SESSION-HANDOFF.md inkrementelt:
   ├─ Legg til ny rad i milepælsloggen (append-only)
   ├─ Oppdater "Nåværende status"-seksjonen
   └─ Lagre filen

RESULTAT: Ved krasj er tilstanden oppdatert til
siste vesentlige handling (typisk 2-10 min gammelt).
```

### Ved session-avslutning (normal)

```
NORMAL AVSLUTNING:
1. Sett session.status = "completed"     ← KRITISK for krasj-deteksjon
2. Nullstill session.crashRecovery
3. Lagre PROJECT-STATE.json UMIDDELBART
4. Skriv fullstendig SESSION-HANDOFF.md (komplettér inkrementell versjon)
5. Vis: "Arbeidet er lagret. Du kan trygt lukke vinduet."
```

### Eksempel: Komplett krasj-recovery-flyt

```
[SESSION 1 — KRASJER]

10:00 — Session startet, session.status = "active"
10:05 — TASK_COMPLETED: "Opprettet database-schema" → state oppdatert
10:12 — FILE_CREATED: "src/models/user.py" → state oppdatert
10:18 — DECISION_MADE: "Valgte bcrypt for passord-hashing" → state oppdatert
10:22 — Agent jobber med API-endepunkt...
10:23 — ⚡ KRASJ (nettverket faller / bruker lukker vindu)
         → session.status forblir "active"
         → session.lastSignificantAction = "Valgte bcrypt" (10:18)
         → Milepælslogg har 3 oppføringer
         → Datatap: kun arbeidet fra 10:18 til 10:23 (5 min, 1 oppgave)

[SESSION 2 — GJENOPPRETTING]

11:00 — Ny session starter
11:00 — Leser session.status = "active" → KRASJ DETEKTERT
11:00 — Leser lastSignificantAction: "Valgte bcrypt" (10:18)
11:00 — Leser milepælslogg: 3 oppføringer (database, user.py, bcrypt)
11:00 — Informerer bruker:
         "Forrige sesjon ble avbrutt kl 10:23.
          Sist lagrede: 'Valgte bcrypt for passord-hashing' (10:18).
          Du mistet maks 5 minutter arbeid.
          Anbefaler: Fortsett med API-endepunktet."
11:01 — Bruker velger A) Fortsett
11:01 — Session.status = "active" (ny sesjon), fortsetter arbeidet
```

---

## EKSPERT-KONFLIKT HÅNDTERING

### Formål

Når flere eksperter gir motstridende råd, presentere dette tydelig til bruker med AI-forklaring.

### Når oppstår konflikt?

Konflikt oppstår når:
- To eller flere eksperter gir motsatt anbefaling
- Anbefalinger er gjensidig utelukkende
- Prioriteringer kolliderer (f.eks. sikkerhet vs. brukervennlighet)

### Håndterings-protokoll

```
KONFLIKT DETEKTERT
    │
    ▼
Samle alle ekspert-råd
    │
    ▼
Presenter til bruker:

"🔄 EKSPERTENE ER UENIGE

Jeg har fått råd fra flere eksperter som peker i ulike retninger.
La meg forklare hva hver mener, så kan du velge:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ALTERNATIV A: [Ekspert-navn sitt råd]
Anbefaling: [Kort beskrivelse]

Hva betyr dette?
[Enkel forklaring for ikke-tekniske]

✅ Fordeler:
• [Fordel 1]
• [Fordel 2]

⚠️ Ulemper:
• [Ulempe 1]
• [Ulempe 2]

🎯 Min vurdering: [X]/10
   Begrunning: [Kort begrunnelse]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ALTERNATIV B: [Ekspert-navn sitt råd]
[Samme struktur som over]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 MIN ANBEFALING:

Basert på ditt prosjekt ([prosjekttype], [intensitetsnivå]),
anbefaler jeg Alternativ [X] fordi:
[Begrunnelse tilpasset brukerens situasjon]

Hva vil du velge? [A] [B] [Annet]"
```

### Prioriteringsregler (når AI må velge)

Ved automatisk valg (f.eks. ved autonomt arbeid), bruk denne prioriteringen:

```
1. SIKKERHET vinner over alt annet
   - Hvis ett alternativ er tryggere, velg det

2. COMPLIANCE vinner over bekvemmelighet
   - GDPR, PCI-DSS, lovkrav går foran

3. Ved lik prioritet: SPØR BRUKER
   - Aldri gjett når det er ekte konflikt
```

---

## CIRCUIT-BREAKER MED GLIDENDE VINDU

### Formål

Oppdage ustabile agenter selv når feil ikke kommer på rad, men i et mønster.

### Ny trigger-logikk

```
CIRCUIT-BREAKER AKTIVERES VED:

┌─────────────────────────────────────────────────────────┐
│ TRIGGER 1: Påfølgende feil (eksisterende)               │
│ → 3 feil PÅ RAD                                         │
├─────────────────────────────────────────────────────────┤
│ TRIGGER 2: Glidende vindu (NY)                          │
│ → 5 feil av siste 10 forsøk                             │
│                                                         │
│ Eksempel som trigger:                                   │
│ ✓ ✗ ✓ ✗ ✗ ✓ ✗ ✗ ✓ ✗  (5 feil av 10 = trigger)        │
├─────────────────────────────────────────────────────────┤
│ TRIGGER 3: Tidsbasert (NY)                              │
│ → 10 feil totalt siste time                             │
│                                                         │
│ Selv om agenten "fungerer", er 10 feil i timen          │
│ et tegn på at noe er galt                               │
└─────────────────────────────────────────────────────────┘
```

### Implementering

**Nytt felt i PROJECT-STATE.json:**

```json
{
  "agentHealth": {
    "BYGGER": {
      "recentResults": ["success", "fail", "success", "fail", "fail"],
      "failuresLastHour": 4,
      "lastFailure": "2026-02-03T10:15:00Z",
      "successRate": 0.60
    }
  }
}
```

### Varsling til bruker

```
⚠️ AGENT USTABIL

[Agent-navn] har hatt problemer nylig:

📊 Statistikk siste time:
   • Vellykkede forsøk: 6
   • Feilede forsøk: 4
   • Suksessrate: 60%

🔍 Siste feil:
   • [Tidspunkt]: [Kort beskrivelse]
   • [Tidspunkt]: [Kort beskrivelse]

Dette betyr at agenten fungerer, men ikke pålitelig.
Det kan skyldes:
• Midlertidige tekniske problemer
• Uklare instruksjoner
• Kompleks oppgave som trenger oppdeling

Hva vil du gjøre?

A) Fortsett likevel
   → Agenten prøver på nytt, men kan feile igjen

B) Prøv en annen tilnærming
   → Jeg foreslår alternative løsninger

C) Ta en pause og fortsett senere
   → Lagrer tilstand, du kan fortsette når som helst
```

---

## SPORING AV BØR- OG KAN-OPPGAVER

**VIKTIG:** Alle oppgaver som faktisk utføres SKAL spores, uavhengig av intensitetsnivå (MÅ/BØR/KAN).
Oppgaver som er BØR eller KAN ved gjeldende nivå og som SKIPPES skal også dokumenteres.

### Ny completedSteps-struktur

Fra versjon 3.0 støtter completedSteps både enkel format (bakoverkompatibilitet) og utvidet format:

**Enkel format (kun for MÅ-oppgaver):**
```json
"completedSteps": [
  "ARK-01-tech-stack-decision",
  "ARK-02-database-schema"
]
```

**Utvidet format (ANBEFALT for alle oppgaver):**
```json
"completedSteps": [
  {
    "id": "ARK-01",
    "name": "Tech stack-valg",
    "requirement": "MÅ",
    "status": "completed",
    "deliverable": "tech-stack-decision.md",
    "timestamp": "2026-02-03T14:30:00Z"
  },
  {
    "id": "ARK-07",
    "name": "DREAD-rangering",
    "requirement": "BØR",
    "status": "completed",
    "deliverable": "threat-model-stride.md",
    "note": "Inkludert som del av STRIDE-analysen",
    "timestamp": "2026-02-03T15:45:00Z"
  }
]
```

### Felter i utvidet format

| Felt | Påkrevd | Type | Beskrivelse |
|------|---------|------|-------------|
| `id` | Ja | string | Oppgave-ID (f.eks. "ARK-07") |
| `name` | Ja | string | Menneskelesbart navn |
| `requirement` | Ja | "MÅ" \| "BØR" \| "KAN" | Krav ved gjeldende intensitetsnivå |
| `status` | Ja | "completed" \| "partial" | Status (partial = delvis dekket i annen leveranse) |
| `deliverable` | Nei | string | Filnavn for leveranse |
| `note` | Nei | string | Ekstra kontekst (påkrevd ved partial) |
| `timestamp` | Nei | ISO 8601 | Når oppgaven ble fullført |

### Skippede oppgaver (ny array)

Legg til `skippedSteps` i PROJECT-STATE.json for oppgaver som bevisst ble skipet:

```json
"skippedSteps": [
  {
    "id": "OPP-08",
    "name": "Markedskonkurrenter",
    "requirement": "BØR",
    "reason": "Intern dashboard uten direkte konkurrenter i markedet",
    "timestamp": "2026-02-01T10:00:00Z"
  }
]
```

**Viktig:** En skipet BØR-oppgave MED begrunnelse er like bra som en utført BØR-oppgave.
Poenget er å dokumentere beslutningen, ikke å gjøre alt arbeid.

### Sporingsregler for agenter

1. **MÅ-oppgaver:**
   - SKAL alltid utføres (med mindre blokkert)
   - SKAL alltid spores i completedSteps
   - Hvis blokkert: Dokumenter i pendingTasks med status awaiting_user_input

2. **BØR-oppgaver:**
   - SKAL tilbys til bruker (med mindre hurtigspor)
   - Hvis utført: Legg til i completedSteps med requirement: "BØR"
   - Hvis skipet: Legg til i skippedSteps med begrunnelse
   - Hvis delvis dekket: Legg til i completedSteps med status: "partial" og note

3. **KAN-oppgaver:**
   - KAN tilbys til bruker som valg
   - Hvis bruker valgte ja: Legg til i completedSteps med requirement: "KAN"
   - Hvis bruker valgte nei: Legg til i skippedSteps med reason: "Bruker valgte nei"
   - Hvis ikke tilbudt: Ingen sporing nødvendig

4. **Hurtigspor-modus:**
   - Agent tar beslutninger autonomt
   - MEN: Alle beslutninger SKAL dokumenteres
   - BØR-oppgaver som naturlig inngår i MÅ-arbeid: Inkluder og dokumenter
   - BØR-oppgaver som ikke passer: Skip og dokumenter begrunnelse
   - KAN-oppgaver: Skip med reason: "Hurtigspor-modus"

### pendingTasks (erstatter blockedTasks)
Oppgaver som ikke er fullført lagres i `pendingTasks[]` med status:
- `awaiting_user_input` — Venter på bruker-diskusjon (f.eks. BØR/KAN-oppgaver som ikke ble gjennomgått pga. kontekstbudsjett)
- `blocked` — Blokkert av ekstern avhengighet

Format:
```json
{"id": "[oppgave-ID]", "type": "MÅ|BØR|KAN", "status": "awaiting_user_input|blocked", "desc": "[beskrivelse]", "reason": "[årsak]"}
```

Neste sesjon leser pendingTasks og fortsetter der forrige sluttet.

### Eksempel: Komplett fase-sporing

```json
{
  "phaseProgress": {
    "phase3": {
      "status": "completed",
      "mode": "fast-track",
      "completedSteps": [
        {
          "id": "ARK-01",
          "name": "Tech stack-valg",
          "requirement": "MÅ",
          "status": "completed",
          "deliverable": "tech-stack-decision.md"
        },
        {
          "id": "ARK-07",
          "name": "DREAD-rangering",
          "requirement": "BØR",
          "status": "completed",
          "deliverable": "threat-model-stride.md",
          "note": "Inkludert i STRIDE-analysen"
        }
      ],
      "skippedSteps": [
        {
          "id": "ARK-09",
          "name": "Ekstern trusselmodell-review",
          "requirement": "KAN",
          "reason": "Hurtigspor-modus — intern review tilstrekkelig for MVP"
        }
      ]
    }
  }
}
```

### Verifisering ved handoff

Når en agent fullfører en fase, skal den verifisere:

1. ✅ Alle MÅ-oppgaver er i completedSteps (eller utsatt via pendingTasks med begrunnelse)
2. ✅ Alle BØR-oppgaver er enten i completedSteps eller skippedSteps
3. ✅ Alle skippedSteps har begrunnelse (reason-felt)
4. ✅ Alle completedSteps med status: "partial" har note-felt
5. ✅ Ingen oppgaver mangler sporing

Hvis noen av disse feiler, skal agenten:
- Stoppe før handoff
- Spørre bruker om manglende beslutninger
- Oppdatere PROJECT-STATE.json
- Deretter fortsette med handoff

---

## BRUKER-KOMMUNIKASJONSNIVÅER (v3.3)

### Formål

Tilpasse ALL brukerrettet kommunikasjon basert på brukerens tekniske nivå. Nivået lagres i `classification.userLevel` i PROJECT-STATE.json og settes under klassifisering (AUTO-CLASSIFIER). Bruker kan bytte nivå når som helst med "Bytt til [nivå]".

### De tre nivåene

| Nivå | ID | Målgruppe | Språkstil |
|------|----|-----------|-----------|
| Utvikler | `utvikler` | Profesjonelle utviklere | Teknisk med lette forklaringer |
| Erfaren vibecoder | `erfaren-vibecoder` | Kan kode med AI-hjelp | Hverdagsspråk + tekniske termer i parentes |
| Ny vibecoder | `ny-vibecoder` | Helt ny til utvikling | Analogier + tekniske termer i parentes for læring |

### Stilregler per nivå

**Utvikler (`utvikler`)**
- Bruk tekniske termer direkte uten forklaring
- Korte, presise meldinger — ingen overforklaring
- Forklar KUN uvanlige arkitektur-valg eller Kit CC-spesifikke konsepter
- Eksempel statusmelding: "Fase 4 klar. Scaffold med Next.js App Router + Prisma ORM. Neste: auth-endepunkter."
- Eksempel feilmelding: "CORS-feil på /api/users. Sjekk Access-Control-Allow-Origin i middleware."

**Erfaren vibecoder (`erfaren-vibecoder`)** ← Standard
- Bruk hverdagsspråk som hovedregel
- Sett tekniske termer i parentes første gang: "databaseoppsettet (schema)"
- Forklar hva ting GJØR, ikke bare hva de ER
- Unngå forkortelser uten kontekst
- Eksempel statusmelding: "Fase 4 er klar. Jeg har satt opp prosjektet med Next.js (rammeverket) og en database. Neste steg er å bygge innlogging."
- Eksempel feilmelding: "Nettleseren blokkerer tilgang til brukerdata fra serveren (CORS-feil). Jeg fikser dette i serveroppsettet."

**Ny vibecoder (`ny-vibecoder`)**
- Bruk analogier og hverdagssammenligninger
- Sett tekniske termer i parentes SOM LÆRINGSMOMENT: "husreglene for serveren (CORS-innstillinger)"
- Forklar HVORFOR ting gjøres, ikke bare hva
- Vis sammenheng mellom handlinger og sluttresultat
- Eksempel statusmelding: "Tenk på det som at vi nettopp har bygget grunnmuren til huset ditt. Nå skal vi bygge inngangsdøren — altså innloggingssiden der brukerne dine kommer inn."
- Eksempel feilmelding: "Tenk deg at nettleseren er en vakt som nekter å slippe inn data fra serveren vår. Vi må gi vakten riktig tilgangsbevis (oppdatere CORS-innstillinger) så dataene slipper gjennom."

### Regler for alle agenter

1. **Les `classification.userLevel` fra PROJECT-STATE.json** ved oppstart
2. **Tilpass ALL brukerrettet tekst** — statusmeldinger, feilmeldinger, spørsmål, forslag
3. **Teknisk logging forblir uendret** — PROGRESS-LOG, SESSION-HANDOFF, og interne agent-meldinger bruker alltid teknisk språk
4. **Ved manglende userLevel** → bruk `erfaren-vibecoder` som standard
5. **Respekter nivåbytte** — når bruker sier "Bytt til [nivå]", oppdater PROJECT-STATE.json og tilpass umiddelbart

### Nivåbytte-håndtering

```
BRUKER: "Bytt til utvikler" / "Snakk mer teknisk" / "Jeg er utvikler"
    │
    ▼
1. Oppdater classification.userLevel i PROJECT-STATE.json
2. Bekreft: "Byttet til utvikler-nivå. Kommunikasjonen er nå mer teknisk."
3. Alle påfølgende meldinger bruker nytt nivå
```

### Hva som IKKE tilpasses

- Filnavn og mappestruktur (alltid tekniske)
- Git commit-meldinger (alltid tekniske)
- Innhold i genererte kodefiler (alltid tekniske)
- PROGRESS-LOG.jsonl og SESSION-HANDOFF.md (alltid tekniske)
- Agent-til-agent kommunikasjon (alltid tekniske)

---

## GUARDRAILS FOR SYSTEM-PROTOKOLL

### ✅ ALLTID

- Gå via ORCHESTRATOR for all kommunikasjon mellom system-agenter
- Oppdater PROJECT-STATE.json direkte (fase-agenter har skrivetilgang til sine felter, se STATE-EIERSKAP)
- **Valider PROJECT-STATE.json mot schema før bruk** (se `../../klassifisering/PROJECT-STATE-SCHEMA.json`)
- Logg alle hendelser til unified history
- Respekter timeout-verdier (se `./doc-INTENSITY-MATRIX.md`)
- Bruk fallback ved feil
- **Oppdater PROJECT-STATE.json og SESSION-HANDOFF.md etter hver vesentlig handling** (progressiv state)
- **Sett session.status = "active" ved sesjonstart og "completed" ved normal avslutning** (krasj-deteksjon)
- **Sjekk session.status ved sesjonstart** — hvis "active", forrige sesjon krasjet

### ❌ ALDRI

- Skriv til PROJECT-STATE.json-felt du ikke eier (se feltansvarsfordeling i STATE-LOCKING-seksjonen)
- Kommuniser direkte mellom system-agenter
- Ignorer timeout (alltid håndter)
- Korrumper state ved feil (bruk fallback)
- Fortsett uten å logge feil

### ⏸️ SPØR BRUKER

- Ved systemfeil som ikke kan løses automatisk
- Ved konflikt mellom agenter
- Ved timeout uten fallback
- Ved korrupt state som krever nullstilling

---

## REFERANSER

| Fil | Relativ sti | Innhold |
|-----|-------------|---------|
| ORCHESTRATOR | `./agent-ORCHESTRATOR.md` | Dirigent-logikk |
| AGENT-PROTOCOL | `./agent-AGENT-PROTOCOL.md` | Kommunikasjonsformater |
| AUTO-CLASSIFIER | `./agent-AUTO-CLASSIFIER.md` | Klassifiseringslogikk |
| CONTEXT-LOADER | `./agent-CONTEXT-LOADER.md` | Kontekst-lasting |
| PHASE-GATES | `./agent-PHASE-GATES.md` | Kvalitetsvalidering |
| INTENSITY-MATRIX | `./doc-INTENSITY-MATRIX.md` | Samlet nivå-oversikt |
| KLASSIFISERING | `../../klassifisering/KLASSIFISERING-METADATA-SYSTEM.md` | Metadata-definisjoner |
| VERIFY-BEFORE-MISSING | `./protocol-VERIFY-BEFORE-MISSING.md` | SSOT for søk-før-mangel |

---

*Versjon: 3.5.0*
*Opprettet: 2026-02-02*
*Oppdatert: 2026-04-22*
*Kompatibel med: Kit CC v3.5.0*
*Formål: Sikre konsistent samarbeid mellom system-agenter med 3-lags kontekstarkitektur*
*Nye funksjoner v1.1: Session-status, ekspert-konflikt, forbedret circuit-breaker*
*Nye funksjoner v1.2: BØR/KAN-sporing, completedSteps utvidet format, skippedSteps*
*Nye funksjoner v1.3: AGENT_SWITCH_CHECKPOINT event-type, lastCheckpoint og pendingDecisions i state-felt, SESSION-HANDOFF kun av ORCHESTRATOR*
*Nye funksjoner v1.4: CRASH-RECOVERY — Progressiv state-oppdatering etter vesentlige handlinger. Inkrementell SESSION-HANDOFF med milepælslogg. Forbedret krasj-deteksjon med session.lastSignificantAction og session.crashRecovery. Nye event-typer: SESSION_CRASH_DETECTED, SIGNIFICANT_ACTION. Definisjon av "vesentlig handling". Komplett krasj-recovery-flyt med eksempel.*
*Nye funksjoner v3.2: HIERARKISK KONTEKSTPROTOKOLL — 3-lags arkitektur (Arbeidsbord/Skrivebordsskuff/Arkiv). ORCHESTRATOR og CONTEXT-LOADER er nå Lag 3. Mission briefing som kontekstkontrakt mellom faser. NEED_CONTEXT-signal for Lag 2-ressurser. Boot-sekvens uten ORCHESTRATOR for normalt arbeid. Recoverable compression-prinsipp.*
*Nye funksjoner v3.3: BRUKER-KOMMUNIKASJONSNIVÅER — 3 nivåer (Utvikler/Erfaren vibecoder/Ny vibecoder) med stilregler, eksempler og nivåbytte-håndtering. Lagres i classification.userLevel.*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
