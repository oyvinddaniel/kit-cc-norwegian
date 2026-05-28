# Scenario A — Hobby todo-app

## Brukerprofil
- AI-novise
- Bygger sin første app
- Vil ha en delt todo-liste med venner
- Tid: 1-2 timer planlegging, deretter Claude Code-bygging

## Brukerens initial-melding

"Jeg vil bygge en todo-app som jeg kan dele med vennene mine. Vi skal kunne legge til oppgaver, dele dem, og se hva som er gjort."

## Klassifisering forventet
MINIMAL eller FORENKLET (7-14)

## Tidsmodus forventet
"1 time" eller "2 timer"

## KPI-mål

| KPI | Mål |
|---|---|
| Hovedfunksjoner (H) | 3-5 |
| Underfunksjoner (U) | 8-15 |
| Detaljer (D) | 15-30 |
| Mikrodetaljer | 80-150 totalt (10-15 per U) |
| Obligatoriske mønstre dekket | 100% (M:tilstander, M:tilgjengelighet, M:kanttilfeller) |
| VALIDERING-karakter | B eller bedre |
| Time-to-plan-completion | < 90 min |

## Hvordan kjøre

1. Start ny Kit CC-sesjon (rent prosjekt — ingen `.ai/`)
2. Lim inn brukerens initial-melding
3. La AUTO-CLASSIFIER klassifisere
4. Bekreft "ja" til hyperdetaljert planlegging
5. Følg PLAN-modus-flyt naturlig
6. Etter ferdig, kjør REVIEW-modus manuelt
7. Mål KPI-er — fyll inn i `resultater/scenario-A-YYYYMMDD.md` (kopier `kpi-mal.md`)

## Forventede mikrodetaljer (eksempler — for testing)

For "slett-oppgave"-funksjonen, AI bør foreslå minst 8 av disse:
- Bekreftelse via M:undo-first (toast med "Angre" i 5 sek)
- Tom-tilstand når liste er tom (M:tilstander)
- Hvis annen bruker sletter samtidig (M:kanttilfeller)
- Tilgjengelighet: tab + enter for sletting (M:tilgjengelighet 2.1.1)
- Mobil: touch-target 44×44 px (M:mobil-beroring 2.5.8)
- WCAG fokus tilbake til list etter slett (2.4.7)
- Audit: hvem slettet hva når (M:revisjonsspor)
- Sync til delte venner (M:offline)

Hvis MINST 8 av disse fanges, fungerer mikrodetalj-nivå.

## Hva som signaliserer suksess

- Bruker sier "Wow, AI har tenkt på ting jeg ikke ville husket"
- Bygging av MVP går glatt (få byggefeil pga manglende spec)
- Final app har fungerende slett-bekreftelse, tom-tilstand, undo

## Hva som signaliserer feil

- AI går rett til kode uten å spørre om planlegging (intent-deteksjon feilet)
- Mikrodetaljer er <50 (langt under mål)
- Obligatoriske mønstre mangler
- REVIEW gir C/D (kritiske gap)

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
