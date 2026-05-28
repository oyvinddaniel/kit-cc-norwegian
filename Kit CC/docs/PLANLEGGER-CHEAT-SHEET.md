# PLANLEGGER cheat-sheet — Kit CC v3.6.0

## 4 moduser (sagt naturlig)

| Si til Kit CC | Aktiveres | Hva skjer |
|---|---|---|
| "Jeg vil planlegge..." / "Ny funksjon..." | PLAN | 4-nivå-flyt med mønstre |
| "Jeg lurer på..." / "Hva hvis..." | BRAINSTORM | Tankepartner, ingen lagring |
| "Hvor er vi?" / "Vis status" | STATUS | Read-only oversikt |
| "Har vi planlagt nok?" / "Review" | REVIEW | Kvalitetssjekk A-D |

## 4 nivåer

- 🌳 **Hovedfunksjon** (bruker eier) — store områder
- 🌿 **Underfunksjon** (bruker eier, AI foreslår) — handlinger
- 🍃 **Detalj** (hybrid) — akseptansekriterier GIVEN-WHEN-THEN
- ✨ **Mikrodetalj** (AI eier) — minst 10 per underfunksjon

## 6 tidsmoduser

| Tidsmodus | Stopp etter nivå |
|---|---|
| 10 min | 1 |
| 1 time | 2 |
| 2 timer | 3 |
| Halve dagen | 4 |
| Flere dager | 4 + research |
| Ukesvis | 4 + dyp research |

## Obligatoriske mønstre (alltid sjekkes)

- **M:tilstander** — loading/empty/error/success/disabled
- **M:tilgjengelighet** — WCAG 2.2 AA + 9 nye 2.2-kriterier
- **M:kanttilfeller** — null/tomt/maks/samtidig/permission/network

## Mobil-obligatorisk

- **M:mobil-beroring** — touch-target ≥24×24px (WCAG 2.5.8 minimum), 44×44px anbefalt
- **M:offline** — network-detection, queue-sync

## VALIDERING-karakter

| Karakter | Betyr | Gate |
|---|---|---|
| A | Ingen kritiske gap, ≤2 viktige | PASS |
| B | Ingen kritiske, ≤5 viktige | PASS m/advarsel |
| C | 1-2 kritiske ELLER 5+ viktige | PARTIAL (bruker velger) |
| D | 3+ kritiske ELLER manglende obligatorisk | FAIL |

## Vanlige fraser å gjenkjenne

| Bruker | Intent |
|---|---|
| "by the way, vi må også ha X" | CAPTURE (protocol-MODULREGISTRERING) |
| "stopp" / "pause" | SESSION_PAUSED (recovery-protokoll) |
| "kjør gate" | Phase gate-validering |
| "oversty gate" | GATE_OVERRIDE (logges) |

## Filer å huske

- `docs/BRUKERENS-PLAN.md` — brukerens ord (append-only SSOT)
- `docs/moduler/M-XXX-*.md` — modul-spec med seksjon 3.5
- `docs/FASE-2/MODULREGISTER.md` — auto-generert
- `.ai/PROJECT-STATE.json` — state med stateVersion
- `.ai/PROGRESS-LOG.jsonl` — JSONL event-logg
- `.ai/VALIDERING.md` — REVIEW-output
- `Kit CC/Agenter/MONSTRE/` — 22 mønstre
- `Kit CC/Agenter/scripts/` — bash + Python scripts

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
