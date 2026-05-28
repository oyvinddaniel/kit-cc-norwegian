# Kit CC Changelog

Alle vesentlige endringer i Kit CC dokumenteres her.

Format basert på [Keep a Changelog](https://keepachangelog.com/) og semver.

## [3.6.0] — 2026-05-13

### Lagt til
- **Native planleggings-funksjon** via naturlig språk (intent-deteksjon)
- **22 mønstre** i `Kit CC/Agenter/MONSTRE/` (15 originale fra Planner Skill v4.0 + 7 nye fra forskning)
- **PLANLEGGER-agent v3.0.0** med 4 moduser (PLAN/BRAINSTORM/STATUS/REVIEW)
- **Mikrodetalj-nivå (nivå 4)** AI-eid for systematisk komplette apper
- **protocol-INTENT-DETEKSJON** med klassifikator + 4 intents + AMBIGUOUS-håndtering
- **protocol-PLANLEGGER-MODUSER** med full spec for alle 4 moduser
- **protocol-VALIDERING-SKALA** med karakter A-D
- **State-hardning**:
  - PROGRESS-LOG som JSONL (atomær append)
  - PROJECT-STATE.json med `stateVersion` (optimistic locking)
  - File lock via `state-lock.sh`
  - Deterministisk MODULREGISTER-regenerering
- **Self-consistency i REVIEW-modus** (3 plan-varianter for kritiske moduler)
- **PHASE-GATES** krever VALIDERING karakter B+ før gate-PASS
- **Auto-trigger-tabell** (11 fase- og intent-baserte triggere)
- **Eval-suite** med 3 test-scenarier (hobby-todo, kundevendt booking, enterprise HR)
- 7 nye scripts (bash + Python) i `Kit CC/Agenter/scripts/`
- Dokumentasjon: `PLANLEGGING-DYP.md`, `RELEASE-v3.6.0.md`, `MIGRASJON-v3.5-til-v3.6.md`, `EKSEMPLER-PLANLEGGING.md`, `PLANLEGGER-CHEAT-SHEET.md`

### Endret
- `CLAUDE.md`: Steg 1.5 (intent-deteksjon) + PLANLEGGINGS-MODUS-seksjon
- `MODUL-SPEC-MAL.md`: ny seksjon 3.5 "Mikrodetaljer per underfunksjon"
- 7 prosess-agenter (1-OPPSTART → 7-PUBLISERING) wired med PLANLEGGER-routing
- `agent-PHASE-GATES.md`: sjekker VALIDERING-karakter
- `protocol-PROGRESS-LOG` v2.0.0: JSONL-format (fra logfmt) med 22 event-typer
- `protocol-MODULREGISTRERING`: regenererings-flyt + lock-protokoll
- `protocol-DYNAMISK-AGENT-VALG` v1.1: mønster-til-ekspert-trigger-tabell

### Bevart (ingen brytende endringer)
- Alle 6 system-agenter (ORCHESTRATOR, AUTO-CLASSIFIER, etc.)
- 7 basis-agenter (PLANLEGGER er utvidet, ikke brutt)
- 37 ekspert-agenter
- 7 prosess-agenter (kun utvidet med PLANLEGGER-routing)
- Slash-kommandoer (`/kitcc-plan` osv.) — fungerer som før

### Utsatt til v3.7.0+
- Subagent-konvertering (`.md`-agenter → `.claude/agents/` med `context: fork`)
- Pattern-til-ekspert dynamisk trigger (er statisk i v3.6.0)
- Automatisk klassifisering → tidsmodus-mapping
- UI/dashboard for planleggings-progresjon
- Hooks for deterministisk intent-trigger

## [3.5.1] — 2026-05-13 (kortlivd)

### Endret
- `CLAUDE.md` Steg 1.5 lagt til (intent-deteksjon)
- Bumpet til v3.6.0-dev underveis, avsluttes som v3.6.0 ved release

## [3.5.0] — 2026-02-23

Initial release med 6 system + 7 basis + 7 prosess + 37 ekspert-agenter, 7 faser, 4 nivåer. Se eksisterende dokumentasjon for detaljer.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
