# Modulspesifikasjon: [Modulnavn]

> **Formål:** Detaljert spesifikasjon for én modul. Bevarer hele brukerens visjon og sporer implementeringsstatus.
> **Plassering:** `docs/moduler/M-XXX-[modulnavn].md`
> **Opprettet:** [dato]
> **Sist oppdatert:** [dato]

---

## YAML frontmatter (obligatorisk)

Hver modulspesifikasjon MÅ starte med denne YAML-blokken (før H1-tittelen):

```yaml
---
id: M-XXX
navn: [Modul-navn]
beskrivelse: [En setning]
mvp: [Ja/Nei]
status: [Pending/Building/Testing/Polishing/Done/Blocked]
prioritet: [MÅ/BØR/KAN]
avhenger: [Liste av M-IDer eller tom]
estimat: [S/M/L/XL]
opprettet: [YYYY-MM-DD]
sist_oppdatert: [YYYY-MM-DD]
brukerord_kilder: [Liste av BRU:SN-referanser]
---
```

Brukes av:
- `regenerate-modulregister.sh` for å bygge MODULREGISTER
- PLANLEGGER STATUS-modus for telling
- PHASE-GATES for fremdrift-vurdering

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

## 3.5 Mikrodetaljer per underfunksjon

> **AI-eid seksjon.** PLANLEGGER i PLAN-modus fyller inn dette. Bruker reviewer og kan endre.
> Dette er det avgjørende verdiløftet i Kit CC — uten mikrodetalj-planlegging mangler apper små funksjoner.
> Se `Kit CC/Agenter/agenter/system/protocol-PLANLEGGER-MODUSER.md` for hvordan AI fyller seksjonen.
> Mønstre hentes fra `Kit CC/Agenter/MONSTRE/_katalog.md`.

For hver underfunksjon, lag en tabell over mikrodetaljer:

### U[N] — [Underfunksjons-navn]

| # | Mikrodetalj | Status | Mønster | Begrunnelse |
|---|---|---|---|---|
| 1 | [Konkret detalj] | 🟢/🔵/⚪/⊘ | [M:navn] | [Kort hvorfor / kilde] |
| 2 | ... | ... | ... | ... |

**Status-koder:**
- 🟢 Bestemt (skal implementeres)
- 🔵 Vurderes
- ⚪ Foreslått (vent på bruker-godkjenning)
- ⊘ Forkastet (med strek-gjennom i tabell)

**Krav til mikrodetalj-coverage:**
- Minst 10 mikrodetaljer per underfunksjon (PLANLEGGER målsetting)
- Minst de 3 obligatoriske mønstrene dekket: M:tilstander, M:tilgjengelighet, M:kanttilfeller
- Mobil-spesifikke moduler: M:mobil-beroring også obligatorisk
- WCAG-referanser eksplisitt der relevant

**Verifisering i Fase 5 (ITERASJONS-agent):**
ITERASJONS-agent sjekker denne seksjonen før bygging. Hvis < 10 mikrodetaljer eller mangler obligatoriske mønstre → tilbake til PLANLEGGER PLAN-modus.

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
