# Modulregister: [Prosjektnavn]

> **Formål:** Master-oversikt over alle moduler i prosjektet. Opprettes i Fase 2, brukes aktivt i Fase 5.
> **Plassering:** `docs/FASE-2/MODULREGISTER.md`

---

## Modulregister-Schema

Hver modul i registeret skal ha følgende struktur og felter:

| Kolonne | Type | Påkrevd | Beskrivelse |
|---------|------|---------|-------------|
| **ID** | string | Ja | Unik modul-ID (M-001, M-002, osv.) |
| **Modul** | string | Ja | Modulnavn (menneskelesbar navn) |
| **Beskrivelse** | string | Ja | Kort beskrivelse av hva modulen gjør |
| **Underfunksjoner** | number | Ja | Antall sub-features denne modulen inneholder |
| **MVP** | boolean | Ja | Er denne med i MVP? (Ja/Nei) |
| **Status** | enum | Ja | Status: Pending / Building / Testing / Polishing / Done / Blocked |
| **Prioritet** | enum | Nei | MÅ / BØR / KAN (valgfritt, for oppgave-klassifisering) |
| **Avhenger av** | string | Nei | ID-liste av moduler som må være ferdig først (f.eks. "M-001, M-003") |
| **Estimat** | enum | Ja | T-shirt size: S / M / L / XL |
| **Fase** | number | Ja | Hvilken fase modulen planlegges: 4 (MVP) / 5 (Iterasjon) |

### Status-verdier (obligatorisk enum)

- `Pending` — Ikke startet, venter på avhengigheter
- `Building` — Under utvikling i Fase 5 Bygg funksjonene
- `Testing` — Ferdig bygget, under testing
- `Polishing` — Testes OK, poleres (bugs, UX, ytelse)
- `Done` — Ferdig, validert, godkjent
- `Blocked` — Blokkert av avhengighet eller teknisk issue

### Estimat-verdier (T-shirt sizing)

- `S` — Liten (1-2 dager arbeid)
- `M` — Medium (3-5 dager arbeid)
- `L` — Large (1-2 uker arbeid)
- `XL` — X-Large (2+ uker arbeid)

---

## Oppsummering

| Nøkkeltall | Verdi |
|------------|-------|
| Totalt antall moduler | X |
| MVP-moduler | Y |
| Implementerte moduler | Z |
| Gjenstående moduler | X - Z |

---

## Moduloversikt

| ID | Modul | Beskrivelse | Underfunksjoner | MVP | Status | Fase 5 Bygg funksjonene |
|----|-------|-------------|:---------------:|:---:|--------|:-----------------:|
| M-001 | [Modulnavn] | [Kort beskrivelse] | X stk | Ja/Nei | Pending | - |
| M-002 | [Modulnavn] | [Kort beskrivelse] | X stk | Ja/Nei | Pending | - |
| M-003 | [Modulnavn] | [Kort beskrivelse] | X stk | Ja/Nei | Pending | - |

**Statusverdier:**
- `Pending` — Ikke startet
- `Building` — Under utvikling i Fase 5 Bygg funksjonene
- `Testing` — Ferdig bygget, under testing
- `Polishing` — Testes OK, poleres (bugs, UX, ytelse)
- `Done` — Ferdig, validert, godkjent

---

## Avhengighetsdiagram

```
M-001 [Modulnavn]
  └── M-003 [Modulnavn] (avhenger av M-001)

M-002 [Modulnavn]
  └── M-004 [Modulnavn] (avhenger av M-002)
  └── M-005 [Modulnavn] (avhenger av M-002)
```

> **Regel:** Moduler uten avhengigheter kan bygges i vilkårlig rekkefølge. Moduler med avhengigheter bygges etter at avhengighetene er ferdige.

---

## MVP-moduler (bygges først)

| Prioritet | ID | Modul | Avhenger av |
|:---------:|----|-------|-------------|
| 1 | M-00X | [Modulnavn] | - |
| 2 | M-00X | [Modulnavn] | M-001 |
| 3 | M-00X | [Modulnavn] | - |

---

## Status-oppsummering

```
MVP-moduler ferdig:  [ ] / [ ]  (0%)
Alle moduler ferdig: [ ] / [ ]  (0%)

Gjeldende modul: [ingen / M-XXX Modulnavn]
Gjeldende status: [Pending / Building / Testing / Polishing]
```

---

## Endringslogg

| Dato | Endring | Av |
|------|---------|----|
| [dato] | Modulregister opprettet i Fase 2 | AI + bruker |

---

> **Viktig for AI:** Dette registeret er kilden til sannhet for Fase 5-loopen. Sjekk dette registeret ved starten av HVER sesjon for å finne neste modul å jobbe på. Oppdater status UMIDDELBART når en modul endrer tilstand.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
