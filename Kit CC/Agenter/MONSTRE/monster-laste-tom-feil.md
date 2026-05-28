---
name: M:laste-tom-feil
version: 1.0
applies_to:
  paths: []
  contexts: ["alle skjermer som henter eller viser data", "lister", "detaljvisninger", "søk", "dashbord"]
last_reviewed: 2026-05-13
skip_if: skjermen viser kun statisk innhold uten datakall og uten brukerinput
ekspert_trigger: [TEST-GENERATOR-ekspert, BRUKERTEST-ekspert]
---

# Mønster: Lasting, tomt, og feil (obligatorisk)

> Brukes for alle skjermer som viser data. Nesten universell.
>
> Disse tre tilstandene glemmes oftest. Uten dem ser appen ufullstendig ut.
> Se også M:tilstander for fullstendig dekning av alle UI-tilstander.

---

## Når brukes dette mønsteret

- Skjermen henter data fra API, fil, eller database
- Liste, tabell, eller kort-visning av elementer
- Søk eller filter som returnerer resultater
- Detaljvisning av en ressurs

## Når brukes det IKKE

- Statisk innhold uten datakall → ingen lasting/tomt/feil nødvendig
- Skjema før innsending → bruk M:tilbakemelding ved sending

## Skip-regel

Aldri — alle dataavhengige skjermer må dekke alle tre tilstander.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Lastetilstand
- Under 200 ms: ingen lasteindikator (ville blinke)
- 200 ms – 1 sek: subtil indikator (liten spinner eller pulsering)
- Over 1 sek: tydelig (skeleton eller spinner i sentrum)
- Over 5 sek: progress-bar eller "tar litt tid"-melding
- Skeleton vs spinner: skeleton når layout er forutsigbar; spinner for ukjent struktur
- Vises gammel data mens ny lastes? Standardvalg: ja, med subtil pulsering. Unntak: filterbytte der gammel data er irrelevant.

### Gruppe 2 — Tomtilstand
- Når vises den: ingen data ennå (ny bruker), filter ga ingen treff, alt er slettet
- Tekst skal være vennlig, ikke "Ingen resultater"
- Forklar HVORFOR (fra brukerens perspektiv)
- Gi neste-steg-CTA (opprett første, fjern filter)
- Bruk ulike tomtekster for ulike situasjoner — ikke gjenbruk
- Illustrasjon? Valgfritt — kan hjelpe, kan forstyrre

### Gruppe 3 — Feiltilstand
- Mindre feil (ett element): inline indikator, resten fungerer
- Større feil (hele listen): banner eller full feilmelding
- Full krasj: fallback-skjerm med kontakt-info
- Språk: ikke-teknisk — ikke "HTTP 500" eller "null pointer"
- Forklar hva som skjedde + hva bruker kan gjøre
- Hvis intet kan gjøres: "Vi jobber med det. Prøv igjen om noen minutter"

### Gruppe 4 — Retry-oppførsel
- Retry-knapp: alltid der det er teknisk mulig
- Automatisk retry: kun for nettverk (2-3 stille forsøk), aldri for validering
- Eksponentiell backoff: 1s, 2s, 4s
- Gi feilkode for støtte (skjult ved kollapsbar "Detaljer")

---

## Tilstander (states)

- **Loading** — skeleton eller spinner basert på forventet varighet
- **Empty** — vennlig tekst + neste-handling-CTA + valgfri illustrasjon
- **Error** — recovery-action (retry) + alternativ rute (gå tilbake / kontakt)
- **Success (data lastet)** — standard visning, ingen ekstra UI

---

## Tilgjengelighet (WCAG 2.2)

- **4.1.3 Status Messages** — last/tom/feil må kunngjøres via `aria-live` eller `role="status"`/`role="alert"`
- **2.2.1 Timing Adjustable** — automatisk retry må kunne pauses; loading-timeout må kunne forlenges
- **2.4.6 Headings and Labels** — tom-tilstand må ha tydelig overskrift som forklarer situasjon
- **3.3.1 Error Identification** — feilmelding må identifisere hva som gikk galt
- **3.3.3 Error Suggestion** — feilmelding må foreslå hva bruker kan gjøre
- **1.4.1 Use of Color** — feil må vises med ikon + tekst, ikke bare rødt

---

## Kanttilfeller

- Lang lasting > 30 sek → timeout med vennlig melding
- Tom liste etter sletting (bruker slettet alt selv) → bekreftende, ikke skuffende tekst
- Pagination + tom side N → "Ingen flere resultater" (ikke samme som tom totalliste)
- Filter ga 0 treff men listen har data → "Ingen treff med filtrene — fjern noen?"
- Nettverk ned vs server-feil → ulike meldinger og retry-strategier
- Permission-denied (403) → ikke "feil", men "ikke tilgang" + kontakt-info
- Cache vs frisk data → indiker hvis data er gammel
- Race condition: ny request før forrige fullføres → kanseller forrige

---

## Anti-mønster

- "Ingen resultater" som eneste tomtekst → mangler kontekst og neste steg
- Teknisk feilmelding: "Error 500: Internal Server Error" → ikke-menneskelig
- Spinner forevig uten timeout → bruker antar app er død
- Full skeleton-bytte over eksisterende data → flimmer
- Auto-retry uendelig → bygger opp queue, drar batteri
- Samme tomtekst for "aldri hatt data" og "filter tømte" → forvirrende

---

## Eksempler

**Eksempel 1: Førstegangs-bruker, tom liste**
- Vennlig overskrift: "Her vil opptakene dine dukke opp"
- Beskrivelse: "Start ditt første opptak — det tar mindre enn 30 sekunder"
- CTA-knapp: "Start opptak"
- Illustrasjon: subtil mikrofon-ikon

**Eksempel 2: Filter tømte listen**
- "Ingen treff med filtrene du har valgt"
- CTA: "Fjern filtre" eller "Endre søk"
- Behold filter-UI synlig

**Eksempel 3: Nettverk nede**
- Banner: "Kunne ikke laste — sjekk internett"
- Knapp: "Prøv igjen"
- Vis eventuelt cached data med pulsering og "Sist oppdatert: 5 min siden"

---

## Relaterte mønstre

- [M:tilstander] — fullstendig tilstandsoversikt (obligatorisk)
- [M:tilbakemelding] — for handlings-resultater (ikke data-visning)

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
