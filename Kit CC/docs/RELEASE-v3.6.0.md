# Kit CC v3.6.0 — Release Notes

**Dato:** 2026-05-13
**Tema:** Native planleggings-funksjon

## Nytt

### Hyperdetaljert planlegging via naturlig språk
- Bruker kan si "jeg vil planlegge" → starter PLAN-modus
- Eller "har vi planlagt nok?" → REVIEW-modus auto-triggers
- Slash-kommandoer (`/kitcc-plan`) beholdes for de som vil bruke dem

### 4 planleggings-moduser i PLANLEGGER-agent v3.0.0
- PLAN — 4-nivå-flyt (Hovedfunksjon → Underfunksjon → Detalj → Mikrodetalj) med mønstre
- BRAINSTORM — utforskning uten lagring
- STATUS — read-only oversikt
- REVIEW — self-consistency, karakter A-D

Detaljer: `Kit CC/Agenter/agenter/basis/PLANLEGGER-agent.md` og `Kit CC/Agenter/agenter/system/protocol-PLANLEGGER-MODUSER.md`.

### 22 mønstre i `Kit CC/Agenter/MONSTRE/`
15 originale fra Planner Skill v4.0 + 7 nye fra research:
- M:tilstander (NN/g #1 oversett UX-flate)
- M:feilhåndtering (separat fra skjema)
- M:undo-first (Gmail/Linear-mønster)
- M:onboarding (første-bruk)
- M:internasjonalisering (RTL, pluralisering)
- M:offline (mobil + dårlig nett)
- M:kanttilfeller (LLM-svakhet-metamønster, arXiv 2406.07021)

Katalog: `Kit CC/Agenter/MONSTRE/_katalog.md`.

### Mikrodetalj-nivå (nivå 4) — kjerneverdi
AI fyller inn mikrodetaljer som ellers glemmes: sletting-bekreftelse, undo, tom-tilstand, edge cases, mobil-touch, GDPR-audit. Eksempel: `Kit CC/Agenter/maler/MODUL-SPEC-EKSEMPEL.md` (M-007 med 20+ mikrodetaljer).

### State-hardning
- PROGRESS-LOG som JSONL (atomær append, ikke logfmt)
- PROJECT-STATE.json med `stateVersion` (optimistic locking)
- MODULREGISTER regenereres deterministisk fra modulfiler
- File lock for samtidighet (`Kit CC/Agenter/scripts/state-lock.sh`)

### Intent-deteksjon
- 4 intents (PLAN/BRAINSTORM/STATUS/REVIEW) detekteres fra naturlig språk
- Confidence-threshold (0.7+ direkte, 0.5-0.7 bekreft, <0.5 spør)
- AMBIGUOUS-håndtering

Detaljer: `Kit CC/Agenter/agenter/system/protocol-INTENT-DETEKSJON.md`.

### VALIDERING-karakter A-D
- Self-consistency med 3 plan-varianter i REVIEW-modus
- PHASE-GATES krever B+ før gate-PASS
- Bruker kan overstyre via GATE_OVERRIDE-event

Detaljer: `Kit CC/Agenter/agenter/system/protocol-VALIDERING-SKALA.md`.

### Auto-trigger-tabell
11 fase- og intent-baserte triggere som starter riktig modus automatisk.

### Eval-suite (kommer i v3.6.1)
3 test-scenarier (hobby-todo, kundevendt booking, enterprise HR-portal) — implementeres i Steg 9.

## Brytende endringer

**Ingen.** v3.5.0-prosjekter er fullt kompatible.

## Migrering fra v3.5.0

Automatisk ved sesjonsstart:
- `PROGRESS-LOG.md` konverteres til `PROGRESS-LOG.jsonl` (via `Kit CC/Agenter/scripts/convert-progress-log-to-jsonl.py`)
- `PROJECT-STATE.json` får `stateVersion: 1` og `schemaVersion: 2`
- Eksisterende moduler virker — mikrodetaljer kan legges til ved behov via PLAN-modus

## Kjente begrensninger / utsatt

- Subagent-konvertering utsatt til v4.0 (.md-agenter forblir .md)
- Klassifisering → tidsmodus auto-mapping ikke implementert (bruker velger)
- Pattern-til-ekspert-trigger er statisk (fremtidig dynamisk)

## Takk

Bygd basert på Kit CC Planner Skill v4.0-filosofi (Planner Skill-prosjekt).
3 kvalitetssjekk-runder kjørt per implementeringssteg.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
