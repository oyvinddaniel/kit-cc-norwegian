# Session Handoff Template

> **Formål:** Overlevere kontekst fra én session til neste.
> **Vedlikeholdes av:** ORCHESTRATOR (progressivt under sesjon + fullstendig ved session-slutt)
> **Leses av:** CONTEXT-LOADER (automatisk ved session-start)
> **Crash-resilient:** Ja — oppdateres inkrementelt etter hver milepæl, ikke bare ved shutdown.

**Filplassering:** `.ai/SESSION-HANDOFF.md`

> **v3.3 — Forholdet mellom PROGRESS-LOG og SESSION-HANDOFF:**
> - `PROGRESS-LOG.md` = Minutt-for-minutt handlingslogg (append-only, etter HVER handling)
> - `SESSION-HANDOFF.md` = Fase-overføring og milepælsoversikt (oppdateres ved milepæler/sesjonsslutt)
> - Ved krasj: Les PROGRESS-LOG først (mer detaljert og oppdatert)

---

## Nåværende status

**Dato:** [YYYY-MM-DD HH:MM]
**Fase:** [Fase-nummer og navn]
**Aktiv agent:** [Agent-navn]
**Siste oppdatering:** [Hva gjorde vi sist?]
**Session-status:** [aktiv / avsluttet normalt / gjenopprettet etter krasj]

---

## Inkrementell milepælslogg

> **Denne seksjonen oppdateres progressivt etter hver vesentlig handling.**
> Ved krasj gir denne loggen neste sesjon et presist bilde av hva som ble gjort.
> Nye oppføringer legges til NEDERST (append-only).

### Definisjon av "vesentlig handling" (trigger for oppdatering):
- Fullført oppgave (`TASK_COMPLETED`)
- Fil opprettet (`FILE_CREATED`)
- Fil vesentlig endret (`FILE_MODIFIED`)
- Beslutning tatt (`DECISION_MADE`)
- Feil oppdaget og håndtert (`ERROR_DETECTED`)
- Milepæl nådd (`MILESTONE_REACHED`)
- Faseovergang (`PHASE_TRANSITION`)

### Milepælslogg:

| Tidspunkt | Type | Beskrivelse | Agent | Filer berørt |
|-----------|------|-------------|-------|--------------|
| [HH:MM] | [TYPE] | [Kort beskrivelse] | [Agent] | [fil1, fil2] |
| 10:15 | TASK_COMPLETED | Autentisering implementert | BYGGER | src/auth.py, src/middleware.py |
| 10:32 | DECISION_MADE | Valgte JWT over sessions | ARKITEKTUR | docs/FASE-3/auth-decision.md |
| 10:48 | FILE_CREATED | API-endepunkt for brukere | BYGGER | src/api/users.py |

---

## Pågående arbeid

### Oppgaver i progresjon
- [ ] **[Oppgave 1]** (Fremdrift: X%)
  - Hva er gjort: [beskrivelse]
  - Hva gjenstår: [beskrivelse]
  - Viktige filer: [liste]

- [ ] **[Oppgave 2]** (Ikke startet)
  - Hvorfor venter: [årsak]
  - Avhengigheter: [hva må gjøres først]

### Blokkere og utfordringer
- **[Problem 1]:** [beskrivelse]
  - Mulig løsning: [forslag]
  - Krever: [brukeravgjørelse/research/annet]

---

## Modulstatus (kun Fase 5)

> **Denne seksjonen fylles kun ut under Fase 5 (Bygg funksjonene — Én funksjon om gangen).**
> Den gir neste sesjon umiddelbar oversikt over modulfremdrift.

### Gjeldende modul

| Felt | Verdi |
|------|-------|
| Modul-ID | [M-XXX] |
| Modulnavn | [navn] |
| Status | [Building/Testing/Polishing] |
| MODUL-SPEC | `docs/moduler/M-XXX-[navn].md` |

### Underfunksjoner i gjeldende modul

| # | Underfunksjon | Status | Notater |
|---|---------------|--------|---------|
| 1 | [navn] | DONE | [kort notat] |
| 2 | [navn] | IN_PROGRESS | [hva gjenstår] |
| 3 | [navn] | PENDING | |

### Moduloversikt (alle moduler)

| # | Modul-ID | Modulnavn | Status | Underfunksjoner |
|---|----------|-----------|--------|-----------------|
| 1 | M-001 | [navn] | DONE | 5/5 |
| 2 | M-002 | [navn] | BUILDING | 2/4 |
| 3 | M-003 | [navn] | PENDING | 0/6 |

**MVP-fremdrift:** [X] / [Y] moduler ferdig ([Z]%)
**Total fremdrift:** [X] / [Y] moduler ferdig ([Z]%)

### Byggnotater for neste sesjon

{Kopier siste byggnotater fra MODUL-SPEC seksjon 6 her, slik at neste sesjon har umiddelbar kontekst uten å måtte lese MODUL-SPEC først.}

### Instruksjon til neste sesjon

```
Ved session-start i Fase 5:
1. Les docs/FASE-2/MODULREGISTER.md
2. Finn modul med status "Building"
3. Les docs/moduler/M-XXX-[navn].md (gjeldende MODUL-SPEC)
4. Fortsett der forrige sesjon slapp
```

---

## Viktige beslutninger (siden forrige session)

| # | Beslutning | Begrunnelse | Konsekvens |
|---|-----------|-------------|------------|
| 1 | Valgte Next.js over Vite | Bedre SSR-støtte for SEO | Litt tregere dev-server |
| 2 | Droppet feature X | Ikke kritisk for MVP | Sparer 2 dager utvikling |
| 3 | Byttet til Supabase fra Firebase | Bedre PostgreSQL-støtte | Må lære nytt API |

---

## Leveranser (for fase-handoff)

> **Note:** Denne seksjonen brukes ved fase-handoff (mellom faser).
> Ved vanlig session-handoff, se "Nye filer" nedenfor.

### MÅ-leveranser
- [ID]: [filnavn] — [Beskrivelse av hva filen inneholder]
- [Liste alle påkrevde leveranser for denne fasen]

### BØR-leveranser (utført)
- [ID]: [filnavn] — [Hva den inneholder og hvorfor viktig]
- [Liste alle BØR-leveranser som ble utført]

### Skippede BØR-oppgaver (med begrunnelse)
- [ID]: [oppgavenavn] — **Skipet fordi:** [konkret årsak]
- [Liste alle skippede BØR-oppgaver med begrunnelse]

**Viktig for neste fase:**
- [Konsekvenser av skippede oppgaver, hvis noen]
- [Hva neste fase bør være oppmerksom på]
- [Eventuelle tekniske beslutninger som påvirker neste fase]

---

## Nye filer siden forrige session

**Opprettet:**
- `src/components/Header.jsx` (komplett)
- `src/pages/dashboard.jsx` (50% ferdig)
- `docs/api-spec.yaml` (utkast)

**Endret:**
- `docs/tech-stack.md` (oppdatert med database-valg)
- `plan.md` (lagt til 3 nye tasks)

**Slettet:**
- `old-prototype/` (ikke lenger relevant)

---

## Neste steg (prioritert)

### Umiddelbart (neste session)
1. **Fullføre dashboard.jsx**
   - Legg til data-fetching
   - Implementer loading states
   - Test responsivitet

2. **Starte auth-implementering**
   - Les Supabase Auth docs
   - Implementere login/logout
   - Teste signup-flow

### Kort sikt (denne uken)
3. Deploy til staging
4. Brukerteste dashboard
5. Fikse feedback fra testing

### Mellomlang sikt (denne måneden)
- Fullføre Fase 5
- Starte Fase 6 (QA)
- OWASP-testing

---

## Sikkerhetshensyn å huske

- [ ] All brukerinput må valideres før database
- [ ] Supabase RLS-regler må settes opp før prod
- [ ] Secrets må flyttes fra kode til env-variabler
- [ ] Implementere rate-limiting på API-endpoints

---

## Kjente bugs (må fikses)

| # | Bug | Alvorlighet | Status | Notater |
|---|-----|-------------|--------|---------|
| 1 | Login feiler på Safari | Medium | Under utredning | Mulig cookie-problem |
| 2 | Dashboard loader for sakte | Low | Ikke startet | Vurder lazy loading |

---

## Notater til neste session

**Viktig å huske:**
- Brukeren ønsket dark mode, men vi utsatte det til Fase 6
- Database-schema må oppdateres hvis vi legger til feature Y
- Vi har 2 dager til demo for kunde - prioriter synlige forbedringer

**Ting å sjekke:**
- Har Vercel-deployment funket siden sist?
- Er alle dependencies oppdatert?
- Trenger vi å re-klassifisere prosjektet? (har vi lagt til persondata?)

**Lenker og ressurser:**
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

## Kontekst for AI

**Brukerens stil og preferanser:**
- Foretrekker TypeScript over JavaScript
- Liker clean code med mange små funksjoner
- Ønsker alltid comprehensive error handling

**Prosjektets "personlighet":**
- Minimalistisk design
- Rask og responsiv
- Fokus på tilgjengelighet

**Hva fungerte bra:**
- 3-stage approach fungerte perfekt for auth-implementering
- Incremental PR-strategy gjorde review lettere

**Hva fungerte dårlig:**
- For stor PR for dashboard (600 linjer) - split neste gang
- Hallusinerte at Supabase hadde built-in dark mode (finnes ikke)

---

## Statistikk

**Denne session:**
- Tid brukt: 3 timer
- Filer endret: 12
- Lines of code: +450, -120
- Commits: 5

**Totalt prosjekt:**
- Fase: 5 av 7
- Fremdrift: 65%
- Estimert tid igjen: 1-2 uker

---

## Crash-recovery informasjon

> **Denne seksjonen fylles ut automatisk hvis forrige sesjon ble avbrutt.**

**Forrige sesjon krasjet:** [Ja/Nei]
**Siste kjente handling:** [beskrivelse fra milepælsloggen]
**Estimert datatap:** [ingen / minimal (maks 1 oppgave) / delvis]
**Kodebase-tilstand:** [stabil / mulig halvferdig arbeid]
**Anbefalt handling:** [Fortsett der du var / Sjekk siste endringer / Rull tilbake til checkpoint]

---

## Checkpoint

Denne session-handoff ble opprettet automatisk av ORCHESTRATOR.
Oppdateres inkrementelt etter hver milepæl under sesjon.
Neste session vil CONTEXT-LOADER lese denne filen og gjenopprette konteksten.

**Session ID:** [generert UUID]
**Lagret:** [timestamp]
**Siste inkrementelle oppdatering:** [timestamp]
**Avsluttet normalt:** [Ja/Nei]

---

**Vil du gjenoppta arbeidet? Si bare "Fortsett" i neste session.**

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
