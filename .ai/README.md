# .ai/ — Kit CC prosjekt-tilstand

Denne mappa er tom ved første oppstart og fylles automatisk under aktiv bruk av Kit CC.

## Filer som blir opprettet

| Fil | Når | Skrevet av |
|-----|-----|------------|
| `PROJECT-STATE.json` | Ved nytt prosjekt (boot steg 3) | AUTO-CLASSIFIER |
| `PROGRESS-LOG.jsonl` | Etter hver handling | Alle fase-agenter |
| `MISSION-BRIEFING-FASE-{N}.md` | Ved fase-overgang | ORCHESTRATOR |
| `SESSION-HANDOFF.md` | Ved milepæler / avslutning | Aktiv fase-agent |
| `MONITOR-ERRORS.json` | Under fase 4/5 | Kit CC Monitor |
| `MONITOR-PROBES.json` | Under fase 4/5 | Kit CC Monitor |
| `CHECKPOINT-HISTORY/` | Ved checkpoint-pruning | ORCHESTRATOR |

## Ikke slett denne mappa

Mappa er kritisk for krasj-gjenoppretting og sesjons-kontinuitet.
Hvis filer mangler ved oppstart, vil Kit CC behandle prosjektet som nytt.

## Schema-versjon

`PROJECT-STATE.json` følger `Kit CC/Agenter/klassifisering/PROJECT-STATE-SCHEMA.json` v3.5.2+ med `schemaVersion: 2` (optimistic locking via `stateVersion`).

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
