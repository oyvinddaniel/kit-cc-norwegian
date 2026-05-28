---
name: M:feilhandtering
version: 1.0
applies_to:
  paths: []
  contexts: [recovery actions, error boundaries, fallback UX, network resilience]
last_reviewed: 2026-05-13
skip_if: ren statisk side uten nettverkskall, API-er eller dynamisk data
ekspert_trigger: [SIKKERHETS-agent, TEST-GENERATOR-ekspert, INCIDENT-RESPONSE-ekspert]
---

# Mønster: Feilhåndtering (recovery, fallback, error boundaries)

> Brukes når noe kan gå galt utenfor brukerens kontroll — nettverk, API, parsere, server. SEPARAT fra M:skjema (input-validering).
>
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Nettverkskall (fetch, GraphQL, RPC)
- Parsing av JSON, XML, CSV, brukergenerert markup
- Eksterne tjenester som kan være nede
- Data som kan være utdatert (cache)
- Kall som avhenger av hverandre (cascading)

## Når brukes det IKKE

- Skjema-validering → M:skjema
- Forutsigbar forretningslogikk (f.eks. "ikke nok kreditter") → vanlig UI-state
- Programmeringsfeil i utvikling → fix bug, ikke håndter

## Skip-regel

Hopp over hvis ALLE er sanne: ingen ekstern I/O, ingen parsing, ingen server-avhengighet. (Vanligvis: aldri.)

---

## Sjekkliste — still ett spørsmål av gangen

### Gruppe 1 — Klassifisering
- **Soft fail** (retryable): timeout, 503, 429
- **Hard fail** (vis alternativ): 404, parser-feil, manglende data
- **Kritisk** (logout/redirect): 401 utløpt, kontosperring

### Gruppe 2 — Nettverkskall
- Timeout: 10s default, 30s for opplasting
- Eksponentiell backoff (1s, 2s, 4s, max 3 forsøk)
- Retry: 408, 429, 502, 503, 504. IKKE retry: 400, 401, 403, 404, 422
- Cancel ved navigering bort

### Gruppe 3 — API-respons
- 401 → token-refresh; deretter logout
- 403 → koordiner med M:tilgangsport
- 404 → fallback UI + alternativer
- 422 → koordiner med M:skjema
- 5xx → "Vi prøver igjen" + manuell retry + status-link

### Gruppe 4 — Parser-feil
- Schema-validering ved inngang (zod/valibot/joi)
- Logg råinput (uten PII)
- Fallback: hopp over korrupt element, ikke kræsj listen

### Gruppe 5 — Error boundaries
- Per route og per widget (isolert feil)
- Reset-knapp "Prøv igjen"
- Logg til sentral sporing (Sentry e.l.)

### Gruppe 6 — Fallback UX
- 404: forklar + søk + lenke til forsiden
- 500: beklagelse + retry + status-side + support
- Offline: indikator + lokal cache + kø

### Gruppe 7 — Cascading, partial, stale
- Circuit breaker mot nede tjeneste; graceful degradation (kjerne før nice-to-have)
- Partial render: vis det som lastet, marker det som feilet
- Stale: "sist oppdatert"-tidsstempel; stale-while-revalidate; konflikt ved skriving

### Gruppe 8 — Brukerkommunikasjon og logging
- Klartekst, ikke statuskoder; aldri stack traces til bruker
- Korrelasjon-ID synlig for support; tone rolig og handlingsorientert
- Telemetri (sample høyvolum) + alarmer ved feilrate-piker (M:revisjonsspor)

---

## Tilstander

- **Loading** — skjelett, ikke kun spinner
- **Error (retryable)** — melding + "Prøv igjen" + auto-retry-teller
- **Error (terminal)** — forklaring + alternativer + support-CTA
- **Partial** — vist data + markering av manglende
- **Offline** — banner + offline-modus
- **Stale** — tidsstempel + "Oppdater nå"

---

## Tilgjengelighet (WCAG 2.2)

- **3.3.1 Error Identification** — tekstlig feil, ikke kun ikon/farge
- **3.3.3 Error Suggestion** — gi konkret neste-steg
- **4.1.3 Status Messages** — retry-status via aria-live
- **2.2.1 Timing Adjustable** — timeouts skal kunne forlenges eller varsles før utløp [VERIFISER WCAG]
- **1.4.1 Use of Color** — feiltilstand med mer enn farge (ikon + tekst)

---

## Kanttilfeller

- Nettverk gjenoppstår midt i backoff (cancel pending, nytt forsøk)
- Bruker klikker retry 10 ganger på 1s (debounce)
- Server svarer 200 med feil-payload (sjekk innhold)
- Token utløper midt i kjede (refresh + re-spill)
- Race: gammelt svar lander etter nytt (ignorer stale)
- Quota 429 midt i batch (pause + gjenoppta)
- localStorage/IndexedDB full ved offline-kø; SW serverer eldgammel cache

---

## Anti-mønster

- Generisk "Noe gikk galt" uten kontekst/handlingsvei
- Eksponere stack trace eller SQL-feil til bruker
- Retry på ikke-idempotente operasjoner uten idempotency-key
- Uendelig retry uten max-grense eller backoff
- Silent fail; blande skjemafeil med systemfeil
- Full app-kræsj fra ett widget (mangler error boundary)

---

## Eksempler

**Dashboard med widgets:** Egen error boundary per widget. Failed widget viser inline retry. Telemetri per widget.

**Skjema mot ustabil API:** Retry 5xx tre ganger med backoff + idempotency-key. Ved permanent feil: lokalt utkast. 422 → M:skjema.

**Offline-først notatapp:** Lokal kø, bakgrunns-synk med konflikthåndtering. Banner: "Offline — 3 endringer venter".

---

## Relaterte mønstre

- M:skjema — input-validering (separat)
- M:tilgangsport — 401/403-respons + token-refresh-flyt
- M:revisjonsspor — logging av sikkerhetsrelevante feil

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
