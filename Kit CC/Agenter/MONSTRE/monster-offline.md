---
name: M:offline
version: 1.0
applies_to:
  paths: []
  contexts: [offline, darlig-nett, mobil, pwa, service-worker, sync, queue, network-status]
last_reviewed: 2026-05-13
skip_if: strengt desktop-app med stabil tilkobling og ingen brukerdata-input som kan tapes
ekspert_trigger: [YTELSE-ekspert, SRE-ekspert, BRUKERTEST-ekspert]
---

# Mønster: Offline (mobil og dårlig nett)

> Brukes når applikasjonen kan møte mistet/ustabil tilkobling — særlig mobil, PWA, felt-applikasjoner.
>
> Mål: brukerdata mistes aldri, brukeren forstår hva som skjer. Inspirert av Google Docs (offline-editing), Linear (optimistic UI + queue), Notion (lokal cache + sync).

---

## Når brukes dette mønsteret

- Mobil-app eller responsiv web på mobil
- PWA med service worker
- Skjema der nett kan ryke (felt, tunnel, kjøretøy)
- Lister/visninger som bør være lesbare uten nett
- Apper for områder med kjent dårlig dekning

## Når brukes det IKKE

- Strengt sanntids-apper (live video, sanntids-trading)
- Read-only desktop-dashboard med ethernet
- Admin-flater bak VPN med stabilt nett
- Engangs-handlinger som krever umiddelbar server-validering (betaling, OTP)

## Skip-regel

Hopp over hvis ALLE er sanne: kun desktop med stabil tilkobling, ingen brukerdata-input som kan mistes, ingen mobil/PWA planlagt.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Detection (online/offline/slow)
- `navigator.onLine` er hint, IKKE sannhet — suppler med fetch-baserte health-checks
- Lytt på `online`/`offline` events; slow via Network Information API eller fetch > 5 sek

### Gruppe 2 — Handlinger offline
- Tillatt: lese cache, opprett/rediger lokalt (IndexedDB), slett lokalt (markert "pending")
- IKKE tillatt: betaling, OTP, e-postsending, real-time → disabled med forklaring

### Gruppe 3 — Queue av offline-handlinger
- Hver mutering lagres lokalt (id, timestamp, type, payload) — FIFO ved online
- Idempotent via client-generated UUID; vis kø-status ("3 endringer venter")

### Gruppe 4 — Visuell indikator
- Banner: "Du er offline. Endringer lagres lokalt."
- Per-element pending-ikon, back online: "Synkroniserer..." → "Synkronisert ✓"
- Ikke skjul innholdet — la bruker fortsette

### Gruppe 5 — Slow-connection
- Reduser auto-refetch, øk debounce, ikke last tunge media; tilby "spare data"-modus

### Gruppe 6 — Reconnecting og sync
- Eksponentiell backoff (1s, 2s, 4s, 8s, max 30s), progress ("Synkroniserer 3 av 7")
- Partiell sync: vis hvilke feilet, tilby retry — ALDRI stille feile sync

### Gruppe 7 — Conflict-resolution
- Strategier: siste vinner (timestamp), server vinner, merge (CRDT/OT), bruker velger
- Anbefalt: siste vinner for enkle felt, vis konflikt for kritiske data; loggfør alle

### Gruppe 8 — Bevaring av input (KRITISK)
- Skjema-data MÅ ALDRI tapes ved offline-submit
- Auto-save utkast hvert 5. sek til IndexedDB; gjenopprett utkast ved retur

### Gruppe 9 — Service Worker / PWA
- Cache-strategier: cache-first for assets, network-first for data
- App-shell tilgjengelig offline, IndexedDB for store data, versjonér cache

---

## Tilstander (states)

- **Online** — normal drift
- **Offline** — banner synlig, mutering køes, lesing fra cache
- **Slow** — redusert auto-refresh, bruker informert
- **Reconnecting** — eksponentiell backoff
- **Syncing** — spiller av queue med fremdrift
- **Sync-conflict / Sync-failed** — bruker velger eller retry tilgjengelig

---

## Tilgjengelighet (WCAG 2.2)

- 4.1.3 Status Messages — online/offline + sync-status via aria-live="polite"
- 3.3.1 Error Identification — sync-feil må vises tekstlig
- 1.4.1 Use of Color — offline-status med tekst/ikon, ikke kun farge
- 2.4.6 Headings and Labels — konflikt-UI med tydelig overskrift
- 3.3.4 Error Prevention — kritiske handlinger verifiseres etter sync; 2.2.1 Timing Adjustable for reconnect-timeout

`[VERIFISER WCAG]` for 4.1.3 hvis offline-banner er persistent — for hyppig kunngjøring blir støy.

---

## Kanttilfeller

- `navigator.onLine` lyver (wifi uten internett) → suppler med ping
- Offline lenge → queue vokser, vurder grense og varsel
- Server-state endret (ressurs slettet) → vis 404/gone ved sync
- Bruker tømmer browser-data offline → queue tapes → ADVAR
- Flere faner skriver samme ressurs → BroadcastChannel/delt IndexedDB
- Filopplasting offline → IndexedDB hvis < 5 MB, advar ved større
- Reload offline → app-shell laster fra service worker; storage quota → varsle
- Klokke desynkronisert → bruk server-timestamp ved sync; failover (wifi → mobildata) → kort offline

---

## Anti-mønster

- ❌ Miste brukerinput ved offline submit (verste UX-feilen)
- ❌ Stole 100% på `navigator.onLine`
- ❌ Stille sync-feil uten varsel
- ❌ Full-skjerm offline-blokade — bruker kan jobbe lokalt
- ❌ Aggressiv retry uten backoff; kun farge for status (bryter 1.4.1)
- ❌ "Siste vinner" for kritiske data uten logg/varsel

---

## Eksempler

**Notisapp (Notion/Bear-stil):**
- Notater i IndexedDB, sync i bakgrunn — konflikt viser begge versjoner

**Felt-skjema (inspeksjon):**
- Auto-lagre hvert 5. sek, submit offline → queue + "Sendes når online"

**Sanntids-team-app (Linear-stil):**
- Optimistic UI, offline-queue, server-state vinner for status — varsle med diff

---

## Relaterte mønstre

- M:undo-first — undo offline må queue både handling og angre
- M:skjema — auto-save av utkast offline
- M:tilbakemelding — banner/toast for sync-status
- M:flervalg — bulk-mutering offline kan generere stor queue

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
