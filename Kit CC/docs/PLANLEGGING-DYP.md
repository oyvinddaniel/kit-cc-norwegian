# PLANLEGGING-DYP — Kit CC v3.6.0

> Komplett guide til hyperdetaljert planlegging i Kit CC. For både utviklere og ny-vibecodere.

## Innhold

1. [Filosofi](#1-filosofi)
2. [De 4 nivåene](#2-de-4-nivaene)
3. [De 4 modusene](#3-de-4-modusene)
4. [De 22 mønstrene](#4-de-22-monstrene)
5. [Tidsmoduser](#5-tidsmoduser)
6. [Hvordan komme i gang](#6-hvordan-komme-i-gang)
7. [Eksempler](#7-eksempler)
8. [FAQ](#8-faq)

---

## 1. Filosofi

Kit CC v3.6.0 bygger på én kjernepåstand:

> **Bruk 90% av tiden på planlegging — slik at AI kan bygge autonomt etterpå med 100% kontekst.**

Tradisjonell "vibecoding" gjør det motsatt: 10% planlegging, 90% bygging — og resultatet er apper som mangler de små funksjonene som faktisk gjør dem brukbare. Slett-knapper uten bekreftelse. Tom-tilstand som bare viser en hvit skjerm. Skjemaer som krasjer på tom input. Mobil-knapper som er umulige å treffe med fingeren.

**Mikrodetalj-nivå (nivå 4) er hjertet i Kit CCs verdiløfte.** Det er der AI tar over og fyller inn nyansene brukere systematisk glemmer:

- Bekreftelses-dialoger før destruktive handlinger
- Undo-vinduer (Gmail/Linear-stil)
- Loading-skeletons, tom-tilstander, feilmeldinger
- WCAG 2.2 AA-tilgjengelighet
- Mobil touch-targets på 44×44 px
- Kanttilfeller: null, tom, maks, samtidig, offline

Når disse er planlagt på forhånd, kan AI bygge en komplett app uten å gjette eller hoppe over. Det er forskjellen på en demo og et produkt.

---

## 2. De 4 nivåene

Planleggingen er hierarkisk med 4 nivåer. Eierskapet skifter gradvis fra bruker til AI etter hvert som detaljene blir mindre strategiske og mer tekniske.

### 🌳 Nivå 1 — Hovedfunksjon (bruker eier)

De store områdene appen din skal kunne. Du bestemmer hva som skal være med.

> Eksempler: "Brukerprofil", "Eksport", "Søk", "Betalinger", "Innstillinger"

### 🌿 Nivå 2 — Underfunksjon (bruker eier, AI foreslår)

Konkrete handlinger inne i hver hovedfunksjon. AI foreslår basert på domenet, du bekrefter eller endrer.

> Under "Brukerprofil": opprette, redigere, slette, vise, bytte passord, slette konto

### 🍃 Nivå 3 — Detalj (hybrid — AI foreslår, bruker bekrefter)

Hvordan hver underfunksjon faktisk oppfører seg. AI skriver akseptansekriterier i GIVEN-WHEN-THEN-format, du sier ja/nei/juster.

> "GIVEN en innlogget bruker, WHEN hen trykker 'slett konto', THEN vis bekreftelses-dialog med tekst 'Dette kan ikke angres'."

### ✨ Nivå 4 — Mikrodetalj (AI eier — kjerneverdiløftet)

Nyansene som typisk glemmes. AI går gjennom 22 mønstre (sjekklister) og fyller inn alle relevante mikrodetaljer per underfunksjon. Typisk 15-30 per underfunksjon.

> Bekreftelses-dialog, undo-vindu på 5 sek, loading-skeleton, ARIA-label, tastatur-navigasjon, mobil-touch-target, error-toast ved nettverksfeil, idempotens ved dobbeltklikk, ...

---

## 3. De 4 modusene

PLANLEGGER-agent (`Kit CC/Agenter/agenter/basis/PLANLEGGER-agent.md`) opererer i én av fire moduser. Modusen aktiveres automatisk basert på hva du sier. Detaljert flyt: `Kit CC/Agenter/agenter/system/protocol-PLANLEGGER-MODUSER.md`.

| Modus | Trigger | Hva den gjør | Output |
|---|---|---|---|
| **PLAN** | "Jeg vil planlegge", "La oss strukturere X" | Hyperdetaljert 4-nivå-flyt med mønster-coverage | Oppdatert `BRUKERENS-PLAN.md`, `MODULREGISTER.md`, `M-XXX-spec.md` |
| **BRAINSTORM** | "La oss tenke fritt", "Idé-myldring" | Fri utforskning — ingenting lagres uten samtykke | Samtaletråd, eventuelt oppsummering hvis du ber om det |
| **STATUS** | "Hvor er vi?", "Vis fremdrift" | Read-only oversikt over aktiv plan | Kort statusrapport, ingen filendringer |
| **REVIEW** | "Har vi planlagt nok?", "Sjekk planen" | Kvalitetssjekk med self-consistency, karakter A-D | Rapport med gaps, karakter, forslag til neste steg |

REVIEW-karakterene følger `protocol-VALIDERING-SKALA.md`:
- **A** — Klar for bygging (alle obligatoriske mønstre dekket, nivå 4 fullført)
- **B** — Bygg-klar med småmangler (AI fyller inn underveis)
- **C** — Trenger mer planlegging før bygging
- **D** — Vesentlige hull, kjør PLAN-modus på nytt

---

## 4. De 22 mønstrene

Mønster-biblioteket (`Kit CC/Agenter/MONSTRE/_katalog.md`) er sjekklister AI bruker for å fange mikrodetaljer på nivå 4. Uten mønstre — ingen sikker dekning av mikrodetaljer.

### Obligatoriske (alltid sjekket)

- **M:tilstander** — loading / empty / error / success (NN/g #1 oversett UX-flate)
- **M:tilgjengelighet** — WCAG 2.2 AA (kontrast, ARIA, tastatur, skjermleser)
- **M:kanttilfeller** — null / tom / maks / samtidig / offline (LLM-svakhet)

### Mobil-obligatorisk (når appen er mobil eller responsiv)

- **M:mobil-beroring** — Touch-target ≥ 44×44 px, gesture-hints, no-hover-fallback

### De øvrige 18

`M:feilhandtering`, `M:undo-first`, `M:onboarding`, `M:internasjonalisering`, `M:offline`, `M:angre`, `M:detaljvisning`, `M:skjema`, `M:liste`, `M:slett`, `M:flervalg`, `M:filter-sortering`, `M:inline-redigering`, `M:modal`, `M:tilbakemelding`, `M:tilgangsport`, `M:revisjonsspor`, `M:laste-tom-feil`.

Full liste og hva hver dekker: `Kit CC/Agenter/MONSTRE/_katalog.md`. Mal for nye mønstre: `Kit CC/Agenter/MONSTRE/_MAL-MONSTER.md`.

---

## 5. Tidsmoduser

Du velger hvor dypt AI går. Kortere tidsmodus = færre nivåer.

| Tidsmodus | Dybde | Når passer det |
|---|---|---|
| **10 min** | Nivå 1 | Hurtigskisse, idé-validering |
| **1 time** | Nivå 1-2 | Helgehack, prototype |
| **2 timer** | Nivå 1-3 | Hobby-app som skal faktisk fungere |
| **Halve dagen** | Alle 4 | Kundevendt app (anbefalt) |
| **Flere dager** | Alle 4 + research | Forretningskritisk |
| **Ukesvis** | Enterprise + ekstern validering | Regulert bransje, høy risiko |

Tidsmodus kan endres underveis. Si "la oss gå dypere" eller "vi har dårlig tid, hopp over nivå 4 på denne".

---

## 6. Hvordan komme i gang

### Det enkleste: bare snakk med Kit CC

Du trenger ikke huske kommandoer. Skriv det du tenker. Eksempler på fraser som trigger PLANLEGGER-agent:

| Du sier | Hva som skjer |
|---|---|
| "Jeg vil planlegge en ny app" | PLAN-modus starter, ber om hovedfunksjoner |
| "Vi må også ha sletting av brukere" | Eksisterende plan utvides (`protocol-MODULREGISTRERING.md`) |
| "La oss brainstorme på pricing" | BRAINSTORM-modus, ingen lagring uten samtykke |
| "Hvor er vi i planleggingen?" | STATUS-modus, kort oversikt |
| "Har vi planlagt nok til å begynne å bygge?" | REVIEW-modus, karakter A-D |
| "Gjør den mer detaljert" | Går ett nivå dypere |
| "Hopp over nivå 4 her" | Mikrodetalj utelates for denne underfunksjonen |

Intent-deteksjon styres av `Kit CC/Agenter/agenter/system/protocol-INTENT-DETEKSJON.md`. Hvis AI er usikker på hva du mener, spør den om avklaring.

### Hvis du vil bruke slash-kommando direkte

`/kitcc-plan` invokerer PLANLEGGER-agent eksplisitt i PLAN-modus. Andre: `/kitcc-plan-brainstorm`, `/kitcc-plan-status`, `/kitcc-plan-review`. Begge inngangene (naturlig språk og slash) skriver til samme filer.

---

## 7. Eksempler

Se `Kit CC/Agenter/maler/MODUL-SPEC-EKSEMPEL.md` for en komplett utfylt modul — M-007 Eksport — med alle 4 nivåer, mønster-referanser og mikrodetaljer i seksjon 3.5.

Malen for nye moduler ligger i `Kit CC/Agenter/maler/MODUL-SPEC-MAL.md` (utvidet i v3.6.0 med seksjon 3.5 for mønster-coverage).

---

## 8. FAQ

**Hva hvis jeg ikke vil ha nivå 4?**
Velg kortere tidsmodus (1 time eller mindre). Da hopper Kit CC over nivå 4 helt. Du kan også si "hopp over nivå 4 på denne modulen" underveis hvis det bare er enkelte deler du vil forenkle.

**Hva hvis bygging finner manglende detaljer?**
ITERASJONS-agent (Fase 5) sjekker mikrodetaljer før hver modul bygges. Hvis det er færre enn 10 mikrodetaljer per underfunksjon, foreslår den å kjøre PLAN-modus først for å fylle ut. Du kan også overstyre og bygge videre — AI fyller da inn standard-mikrodetaljer fra mønster-biblioteket basert på beste-praksis.

**Kan jeg manuelt skrive M-XXX-spec?**
Ja. Bruk malen i `Kit CC/Agenter/maler/MODUL-SPEC-MAL.md` og pass på å inkludere seksjon 3.5 med eksplisitte mønster-referanser (f.eks. `M:tilstander`, `M:kanttilfeller`). REVIEW-modus vil flagge moduler som mangler seksjon 3.5.

**Hvor lagres tilstand mellom sesjoner?**
Tre steder:
- `.ai/PROJECT-STATE.json` — overordnet prosjekt-state med `stateVersion` (optimistic locking)
- `.ai/PROGRESS-LOG.jsonl` — append-only event-logg (JSONL for atomisk skriving)
- `docs/` — leveranser (BRUKERENS-PLAN, MODULREGISTER, M-XXX-spec-filer)

Ved sesjonsstart leser Kit CC disse automatisk via boot-sekvensen i `CLAUDE.md`.

**Hva hvis intent-deteksjon feiler?**
Hvis AI ikke klarer å rute frasen din til riktig modus med høy nok confidence, spør den om avklaring — f.eks. "Vil du planlegge en ny funksjon (PLAN) eller bare tenke høyt (BRAINSTORM)?" Du kan også alltid bruke slash-kommandoen direkte for å være tydelig.

**Hvordan migrerer jeg et v3.5-prosjekt til v3.6?**
Automatisk ved sesjonsstart. Konkrete steg:
1. `PROGRESS-LOG.md` konverteres til `PROGRESS-LOG.jsonl` via `Kit CC/Agenter/scripts/convert-progress-log-to-jsonl.py`
2. `PROJECT-STATE.json` får `stateVersion=1` (atomic write via `safe-state-write.sh`)
3. Eksisterende moduler virker uendret — du kan legge til mikrodetaljer ved behov

Full endringslogg: `Kit CC/docs/RELEASE-v3.6.0.md`. Ingen brytende endringer.

---

## Relaterte filer

- `CLAUDE.md` (i rotmappa) — Boot-sekvens og overordnet system
- `Kit CC/docs/HURTIGSTART.md` — Kjapp innføring
- `Kit CC/docs/RELEASE-v3.6.0.md` — Endringslogg
- `Kit CC/Agenter/agenter/basis/PLANLEGGER-agent.md` — PLANLEGGER-agenten selv
- `Kit CC/Agenter/agenter/system/protocol-PLANLEGGER-MODUSER.md` — De 4 modusene i detalj
- `Kit CC/Agenter/agenter/system/protocol-INTENT-DETEKSJON.md` — Hvordan AI ruter språk
- `Kit CC/Agenter/agenter/system/protocol-VALIDERING-SKALA.md` — REVIEW-karakter A-D
- `Kit CC/Agenter/agenter/system/protocol-MODULREGISTRERING.md` — Modul-tillegg underveis
- `Kit CC/Agenter/MONSTRE/_katalog.md` — Alle 22 mønstre
- `Kit CC/Agenter/maler/MODUL-SPEC-MAL.md` — Mal med seksjon 3.5
- `Kit CC/Agenter/maler/MODUL-SPEC-EKSEMPEL.md` — Komplett utfylt eksempel
- `Kit CC/Agenter/scripts/safe-state-write.sh` — Atomic state-write
- `Kit CC/Agenter/scripts/convert-progress-log-to-jsonl.py` — Migrering fra v3.5

---

## Versjon

**v1.0** — 2026-05-13 (for Kit CC v3.6.0)

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
