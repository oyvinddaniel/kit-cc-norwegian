# Test-checklist: Intent-deteksjon

> Manuell test av klassifikatoren beskrevet i `Kit CC/Agenter/agenter/system/protocol-INTENT-DETEKSJON.md` og rutet via Steg 1.5 i `Kit CC/CLAUDE.md`.

## Hvordan kjøre testen

1. Start en fersk Claude Code-sesjon i Kit CC-rotmappen
2. Når Kit CC spør "Hva vil du gjøre?" (Steg 1) → svar **"Bygge"**
3. Send neste melding ordrett som testfrasen i tabellene nedenfor
4. Observer hva Kit CC gjør:
   - **Aktiverer PLANLEGGER-modus direkte** (sier f.eks. "Jeg starter PLANLEGGER i PLAN-modus") → høy konfidens (≥0.7)
   - **Spør bekreftelse** ("Det høres ut som du vil PLAN. Stemmer det?") → middels konfidens (0.5–0.7)
   - **Spør avklaringsspørsmål** med 5 alternativer → lav konfidens (<0.5, men planleggings-relatert)
   - **Fortsetter normal boot-sekvens** (Steg 2) → UNKNOWN / ikke planleggings-relatert
5. Sjekk `.ai/PROGRESS-LOG.jsonl` for `"event":"INTENT"`-entry med detected, confidence, trigger
6. Marker rad som **PASS** hvis observert intent + konfidens matcher forventet, ellers **FAIL** med notat
7. Reset mellom hver test (ny sesjon eller ny tråd) for å unngå at kontekst farger klassifiseringen

**Pass-kriterium:** ≥17 av 20 PASS. FAIL → iterér på fraser/signaler i `protocol-INTENT-DETEKSJON.md`.

---

## PLAN-intent (forventet høy konfidens ≥0.7)

| # | Frase | Forventet intent | Forventet konfidens | Begrunnelse |
|---|---|---|---|---|
| 1 | "Jeg vil planlegge en ny app" | PLAN | 0.9+ | Sterk signal "planlegge" + "ny" kontekst |
| 2 | "La oss planlegge en deling-funksjon" | PLAN | 0.9+ | Sterk signal "planlegge" + funksjons-kontekst |
| 3 | "Utdyp mikrodetaljene for U-007" | PLAN | 0.8+ | Sterke signaler "utdyp" + "mikrodetaljer" |
| 4 | "Lag hyperdetaljert plan for autentisering" | PLAN | 0.9+ | Sterke signaler "hyperdetaljert" + "plan" |
| 5 | "Vi må planlegge denne funksjonen først" | PLAN | 0.7+ | Sterk signal "planlegge" alene + funksjon |

## BRAINSTORM-intent (forventet konfidens ≥0.5)

| # | Frase | Forventet intent | Forventet konfidens | Begrunnelse |
|---|---|---|---|---|
| 6 | "Jeg lurer på om vi trenger offline-støtte" | BRAINSTORM | 0.8+ | Sterk signal "lurer på" + utforskende |
| 7 | "Hva hvis vi gjorde det på en annen måte?" | BRAINSTORM | 0.7+ | Sterk signal "hva hvis" |
| 8 | "La oss tenke litt på arkitekturen" | BRAINSTORM | 0.7+ | Sterk signal "tenke" |
| 9 | "Brainstorm rundt notifications" | BRAINSTORM | 0.9+ | Eksplisitt "brainstorm" |
| 10 | "Jeg er usikker på løsningen" | BRAINSTORM | 0.5–0.7 | Sterk signal "usikker på" alene |

## STATUS-intent (forventet konfidens ≥0.7)

| # | Frase | Forventet intent | Forventet konfidens | Begrunnelse |
|---|---|---|---|---|
| 11 | "Hvor langt er vi?" | STATUS | 0.9+ | Variant av "hvor er vi" |
| 12 | "Vis meg statusen" | STATUS | 0.9+ | Sterke signaler "vis meg" + "status" |
| 13 | "Hva har vi planlagt så langt?" | STATUS | 0.7+ | Sterk signal "hva har vi" |
| 14 | "Oversikt over moduler" | STATUS | 0.7+ | Sterk signal "oversikt" |

## REVIEW-intent (forventet konfidens ≥0.8)

| # | Frase | Forventet intent | Forventet konfidens | Begrunnelse |
|---|---|---|---|---|
| 15 | "Har vi planlagt nok?" | REVIEW | 0.9+ | Eksakt match sterk signal |
| 16 | "Er vi klare til bygging?" | REVIEW | 0.9+ | Sterk signal "klar til bygging" |
| 17 | "Kjør kvalitetssjekk på planen" | REVIEW | 0.9+ | Sterke signaler "kvalitetssjekk" + "plan" |
| 18 | "Har vi glemt noe?" | REVIEW | 0.8+ | Sterk signal "har vi glemt" |

## UNKNOWN / clarification (skal IKKE aktivere modus automatisk)

| # | Frase | Forventet intent | Forventet konfidens | Begrunnelse |
|---|---|---|---|---|
| 19 | "Hvordan funker dette?" | UNKNOWN | <0.5 | Ambiguøs — kunne være STATUS eller hjelp; krev avklaring |
| 20 | "Vi må fikse en bug" | UNKNOWN | <0.5 (ikke planleggings-relatert) | Bug-flyt, ikke PLANLEGGER. Skal fortsette normal boot-sekvens |

---

## Logging-verifisering

For hver test, sjekk at `.ai/PROGRESS-LOG.jsonl` har en linje på formen:

```json
{"ts":"2026-05-13T17:45:00Z","event":"INTENT","detected":"PLAN","confidence":0.92,"trigger":"Jeg vil planlegge en ny app","modus_aktivert":true,"schemaVersion":1}
```

Også lave-konfidens-deteksjoner (rad 19, 20) skal logges, men med `"modus_aktivert":false`.

## Resultat-mal

```
Dato: ____________
Tester: ____________
Pass: __ / 20
Fail-rader: _______
Notater:
```

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
