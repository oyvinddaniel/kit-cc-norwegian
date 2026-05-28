# Modulspesifikasjon: [Modulnavn]

> **Formål:** Detaljert spesifikasjon for én modul. Bevarer hele brukerens visjon og sporer implementeringsstatus.
> **Plassering:** `docs/moduler/M-XXX-[modulnavn].md`
> **Opprettet:** [dato]
> **Sist oppdatert:** [dato]

---

## 1. Identifikasjon

| Felt | Verdi |
|------|-------|
| Modul-ID | M-XXX |
| Modulnavn | [Navn] |
| MVP | Ja / Nei |
| Prioritet | [1-N] |
| Avhenger av | [M-XXX, M-YYY / Ingen] |
| Status | Pending |
| Fase 5 Bygg funksjonene | - |

---

## 2. Brukerens visjon

> **VIKTIG:** Denne seksjonen inneholder brukerens EGNE ord, uendret. Alt brukeren har beskrevet om denne modulen bevares her — ingenting fjernes eller forkortes.

[Lim inn brukerens komplette beskrivelse her. HELE teksten bevares, inkludert detaljer, eksempler, referanser til andre apper, ønsker om utseende, oppførsel, edge cases, og alt annet brukeren har fortalt.]

---

## 3. Underfunksjoner

| # | Underfunksjon | Beskrivelse | Akseptansekriterier | Status |
|---|---------------|-------------|---------------------|--------|
| 1 | [Navn] | [Hva den gjør] | [Konkrete kriterier] | Pending |
| 2 | [Navn] | [Hva den gjør] | [Konkrete kriterier] | Pending |
| 3 | [Navn] | [Hva den gjør] | [Konkrete kriterier] | Pending |

**Statusverdier for underfunksjoner:**
- `Pending` — Ikke startet
- `Building` — Under utvikling
- `Testing` — Ferdig bygget, under testing
- `Polishing` — Testes OK, poleres (bugs, UX, ytelse)
- `Done` — Implementert og testet
- `Blocked` — Blokkert (se notater)

---

## 4. Avhengigheter

### Andre moduler
| Modul | Type avhengighet | Beskrivelse |
|-------|-------------------|-------------|
| M-XXX | Teknisk | [Hva denne modulen trenger fra den andre] |

### Data-avhengigheter
| Datakilde | Beskrivelse |
|-----------|-------------|
| [Tabell/API/tjeneste] | [Hva denne modulen trenger] |

---

## 5. Tekniske notater (fylles av AI under bygging)

### Arkitekturbeslutninger
- [Beslutning 1]: [Begrunnelse]

### Filer som berøres
- `[filsti]` — [hva som endres/opprettes]

### Kjente utfordringer
- [Utfordring]: [Mulig løsning]

---

## 6. Byggnotater (oppdateres HVER sesjon)

### Sesjon [dato]
**Hva ble gjort:**
- [Konkret arbeid utført]

**Hva gjenstår:**
- [Konkret arbeid som gjenstår]

**Problemer/blokkere:**
- [Eventuelle problemer]

**Neste steg:**
- [Hva som bør gjøres neste gang]

---

## 7. Validerings-sjekkliste

Alle punkter må være avkrysset før modulen kan markeres som `Done`:

```
FUNKSJONALITET:
☐ Alle underfunksjoner implementert
☐ Happy path fungerer for alle underfunksjoner
☐ Feilhåndtering på plass (unhappy paths)
☐ Edge cases håndtert

KVALITET:
☐ Kode gjennomgått (code review)
☐ Ingen hardkodede verdier
☐ Responsivt design (mobil + desktop)
☐ Brukeropplevelse polert (loading states, feedback, transitions)

SIKKERHET:
☐ Input-validering på plass (server-side)
☐ Tilgangskontroll verifisert
☐ Ingen sensitive data eksponert

TESTING:
☐ Manuell testing av alle underfunksjoner
☐ Grenseverdier testet (tom input, lang tekst, spesialtegn)
```

---

## 8. Vedlegg: Råe notater fra chat

> Alt fra brukerens beskrivelser som ikke er kategorisert over, lagres her. Ingenting kastes.

[Eventuelt ekstra innhold fra chat som ikke passer i andre seksjoner]

---

> **AI-instruksjon:** Når brukeren beskriver nye detaljer om denne modulen i en samtale, oppdater UMIDDELBART denne filen med ny informasjon i riktig seksjon. Bekreft til brukeren med: `📋 MODUL: oppdatert docs/moduler/M-XXX-[navn].md`

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
