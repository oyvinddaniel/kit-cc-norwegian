# Scenario B — Kundevendt booking-system

## Brukerprofil
- AI-utvikler med noe erfaring
- Bygger kommersielt produkt (frisør-booking)
- Skal håndtere betaling, kalender, brukere
- Tid: 2-4 timer planlegging

## Brukerens initial-melding

"Jeg trenger et booking-system for små bedrifter (frisør, klinikk, terapeut). Kundene skal kunne bestille time, betale, få bekreftelse. Eieren skal kunne se kalender, håndtere avlysninger, sende påminnelser."

## Klassifisering forventet
STANDARD eller GRUNDIG (15-23)

## Tidsmodus forventet
"2 timer" eller "Halve dagen"

## KPI-mål

| KPI | Mål |
|---|---|
| Hovedfunksjoner | 6-10 |
| Underfunksjoner | 20-35 |
| Detaljer | 50-80 |
| Mikrodetaljer | 250-500 totalt |
| Obligatoriske mønstre dekket | 100% |
| GDPR-mønstre (M:revisjonsspor) | Aktivert (personvern-data) |
| Betalings-relevante mønstre (M:tilgangsport, M:feilhandtering) | Aktivert |
| VALIDERING-karakter | B eller bedre |
| Time-to-plan-completion | < 4 timer |

## Spesielle sjekker

- **M:tilgangsport** for "kunde vs eier vs admin"-roller
- **M:revisjonsspor** for betalings-handlinger (GDPR Art. 30)
- **M:offline** for mobil-flyt (kunde på mobil)
- **M:internasjonalisering** hvis flerspråklig
- **M:feilhandtering** for betalings-feil (Stripe-failure)
- **M:undo-first vs M:slett** for avlysning (avlysning bør være undo-able)

## Hvordan kjøre

Som scenario A, men:
- Forvent at AI tilbyr GRUNDIG eller STANDARD klassifisering
- Brukeren bør velge "2 timer" tidsmodus
- AI skal sjekke om mobil → da aktiveres M:mobil-beroring + M:offline
- REVIEW bør gi karakter B+ med klare advarsler om GDPR-arbeid trengs

## Suksess-signaler

- Plan dekker betaling, kalender, brukere, varsler, GDPR
- Hver underfunksjon har edge cases dokumentert (overlap-booking, timezone, dst)
- REVIEW identifiserer ingen kritiske gap
- M:revisjonsspor brukt på alle betalings-relaterte underfunksjoner

## Feil-signaler

- Planlegging hopper over GDPR/revisjonsspor
- Betalingsflyt mangler edge cases (failure, refund, partial)
- Booking-conflict (race condition) ikke planlagt
- Mobil-flyt mangler M:mobil-beroring

## Forventede mikrodetaljer (utdrag)

For "Avlys time"-funksjonen, AI bør tenke på:
- Bruker M:undo-first (15 sek angre-vindu) vs M:slett (umiddelbar) — diskutere med bruker
- Refusjons-policy (M:feilhandtering for Stripe-feil)
- Varsel til motpart (eier/kunde)
- Audit-log (M:revisjonsspor — GDPR Art. 30)
- Cascade: hva med påminnelse som var planlagt
- Edge: avlysning < 24t (gebyr?)

For "Velg time"-funksjonen:
- Real-time tilgjengelighets-sjekk
- Race condition: to brukere velger samme time samtidig (M:kanttilfeller)
- Tidssone-håndtering (M:internasjonalisering)
- WCAG 2.4.7 fokus på kalender-grid (M:tilgjengelighet)

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
