---
name: M:undo-first
version: 1.0
applies_to:
  paths: []
  contexts: [angre, undo, toast, slett-liste-element, arkiver, marker-som-lest, ikke-katastrofal-handling]
last_reviewed: 2026-05-13
skip_if: handlingen er katastrofal eller uomgjørelig (bruk M:slett i stedet)
ekspert_trigger: [UIUX-ekspert, SIKKERHETS-agent]
---

# Mønster: Undo-first (angre-toast i stedet for bekreftelse)

> Foretrekk angre-toast etter handling fremfor "er du sikker?"-dialog før handling — for reverserbare, ikke-katastrofale handlinger.
>
> Inspirert av Gmail (arkiver/slett), Linear (status-endring), Material 3 Snackbar.

---

## Når brukes dette mønsteret

- Slett liste-element som kan gjenopprettes (e-post, oppgave, kommentar)
- Arkiver / flytt til papirkurv (myk sletting)
- Marker som lest/ulest, fullført/ikke fullført
- Endre status (Linear-style: "To Do" → "Done")
- Bulk-handling med reverserbar effekt
- Drag-and-drop som flytter element til feil sted

## Når brukes det IKKE

- Slett konto, betaling, team, organisasjon → bruk M:slett (eksplisitt bekreftelse)
- Send penger / iverksett transaksjon → bruk M:slett
- Publiser offentlig / send e-post eksternt → forventer bekreftelse
- Permanent sletting fra papirkurv → krev bekreftelse
- Endring som påvirker andre brukere uten varsel → M:slett

## Skip-regel

Hopp over hvis ALLE er sanne: handlingen er fullt reversibel innen toast-vinduet, effekten er kun synlig for nåværende bruker, verdien som risikeres er lav.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Undo-first vs bekreftelse
- Er handlingen katastrofal/uomgjørelig? → bruk M:slett
- Reverserbar innen ~10 sek? → undo-first egnet
- Påvirker andre brukere umiddelbart? → vurder M:slett
- Standardvalg: undo-first for liste-handlinger, M:slett for konto/betaling/team

### Gruppe 2 — Toast-varighet
- 5 sek default (vanlige handlinger), 10 sek for viktige (bulk, kommentar med innhold)
- Vurder lengre tid for skjermlesere (WCAG 2.2.1)
- Toast pauses ved hover/fokus (anbefalt)

### Gruppe 3 — Plassering og utseende
- Plassering: bunn-midten (mobil/standard) eller bunn-høyre (desktop dashboards)
- "Angre"-knapp ≥ 44×44 px, tydelig kontrast, tekst (ikke kun ikon)
- Standardvalg: bunn-midten, mørk bakgrunn, hvit tekst

### Gruppe 4 — Multiple undos
- To slettinger raskt: erstatt forrige toast (siste vinner) ELLER stack FIFO (maks 3)
- Anbefalt: erstatt forrige + samle bulk til én toast ("3 elementer slettet")
- Forrige handling commit'es umiddelbart ved erstatning

### Gruppe 5 — Navigasjon og persistens
- Ved navigasjon: toast forsvinner → handling permanent (enkleste), eller toast følger sider
- Anbefalt: toast forsvinner ved navigasjon + papirkurv som siste utvei

### Gruppe 6 — Offline og tastatur
- Offline: queue handling og angre i lokal state, ikke send før online (se M:offline)
- Tastatur: Ctrl/Cmd+Z mens toast er synlig (desktop)
- Escape lukker toast UTEN å angre

---

## Tilstander (states)

- **Idle** — ingen toast synlig
- **Active** — handling utført, toast med nedtelling
- **Hovered/Focused** — nedtelling pauset, Tab til "Angre"
- **Undoing** — element gjenopprettes, kort bekreftelse "Gjenopprettet"
- **Expired** — toast forsvinner, handling permanent (soft-delete + audit-logg)
- **Replaced** — ny handling, forrige toast erstattes (commit'er forrige)

---

## Tilgjengelighet (WCAG 2.2)

- 4.1.3 Status Messages — toast via `aria-live="polite"` (ikke "assertive")
- 2.2.1 Timing Adjustable — bruker må kunne forlenge/pause (hover/fokus pauser)
- 2.4.7 Focus Visible — synlig fokus på "Angre"
- 2.5.8 Target Size (Minimum) — "Angre" ≥ 24×24 CSS-px, 44×44 anbefalt
- 2.5.2 Pointer Cancellation — drag-bort avbryter "Angre"-trykk
- 1.4.3 Contrast (Minimum) — kontrast ≥ 4.5:1

`[VERIFISER WCAG]` for 2.2.1 hvis auto-dismiss < 20 sek uten innstilling for forlengelse.

---

## Kanttilfeller

- Bruker trykker handling igjen før toast utløper → erstatt, commit forrige
- Skjermleser: aria-live + minimum 5 sek (helst konfigurerbar)
- Offline: queue handling og angre lokalt (se M:offline)
- z-index: over modal-content, men under native alerts
- Bruker lukker fanen → handling commit'es på server (eller defineres som mistet)
- Flere faner åpne → angre i én må reflekteres i andre (realtime/refetch)
- `prefers-reduced-motion: reduce` → ingen animasjon inn/ut
- Permanent etter timeout: definer eksplisitt om "papirkurv-angre" finnes

---

## Anti-mønster

- ❌ Undo-first for katastrofale handlinger (slett konto, send penger)
- ❌ Toast uten aria-live (forsvinner uten å bli lest av skjermleser)
- ❌ "Angre"-knapp kun som ikon uten tekst
- ❌ Auto-dismiss < 5 sek — for kort for tastatur/skjermleser
- ❌ Hijack fokus (aria-live="assertive")
- ❌ "Er du sikker?" PLUSS undo-toast — velg én strategi

---

## Eksempler

**Gmail-mønster — slett e-post:**
- Slett-ikon → forsvinner umiddelbart → toast "Conversation archived. Undo" 5 sek → soft-delete 30 dager

**Linear-mønster — status-endring:**
- "Done" → status endres → toast "Status changed. Undo" → Cmd+Z mens toast synlig → audit-logg uansett

**Bulk-arkiver 12 meldinger:**
- Velg 12, "Arkiver" → toast "12 messages archived. Undo all" 10 sek → angre gjenoppretter alle atomisk

---

## Relaterte mønstre

- M:slett — for katastrofale slettinger der undo-first IKKE er nok
- M:tilbakemelding — generell toast/snackbar
- M:offline — undo offline
- M:flervalg — bulk-handlinger med undo-toast

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
