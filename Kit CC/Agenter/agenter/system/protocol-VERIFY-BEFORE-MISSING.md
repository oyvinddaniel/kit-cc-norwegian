# PROTOCOL: VERIFISER-FØR-MANGEL v1.0

> **SSOT** for søk-og-verifikasjon før noen agent konkluderer med at filer, funksjoner eller informasjon mangler.
> **Plassering:** `Kit CC/Agenter/agenter/system/protocol-VERIFY-BEFORE-MISSING.md` (Lag 2)
> **Gjelder:** ALLE agenter — prosess, basis, ekspert, system og audit-agenter.

---

## FORMÅL

Forhindre falske "mangler"-konklusjoner. AI-agenter har en tendens til å sjekke én forventet filsti, og hvis filen ikke finnes der, konkludere med at den mangler — uten å lete. I prosjekter med hundrevis av filer fordelt på undermapper er dette en alvorlig svakhet som fører til:

- Falske feilrapporter i audits
- Unødvendig gjenskapelse av filer som allerede eksisterer
- Tap av arbeid og tid for brukeren
- Feil beslutningsgrunnlag for agentene

**Kjerneregel:** En agent har IKKE lov til å konkludere med at noe mangler før den har utført et dokumentert søk.

---

## OBLIGATORISK SØKEPROSEDYRE

### Når trigges denne protokollen?

Protokollen aktiveres automatisk når en agent oppdager ET ELLER FLERE av disse:

1. **Fil ikke funnet** — En referert fil finnes ikke på den oppgitte stien
2. **Funksjon ikke funnet** — En beskrevet funksjon/kapabilitet ser ut til å mangle
3. **Informasjon mangler** — Data eller innhold som forventes finnes ikke der det ble sett
4. **Referanse peker feil** — En filsti eller referanse gir 404/tom
5. **Agent hevder "dette finnes ikke"** — Uansett kontekst

### Søkeprosedyre (4 steg — ALLE obligatoriske)

```
VERIFISER-FØR-MANGEL AKTIVERT:

STEG 1: DIREKTE OPPSLAG
  → Prøv den oppgitte stien/referansen direkte
  → Funnet? → Bruk filen, STOPP
  → Ikke funnet? → Fortsett til steg 2

STEG 2: FILNAVNSØK (rekursivt)
  → Søk etter filnavnet (uten sti) i hele prosjektmappen
  → Kommando: find [prosjektrot] -name "[filnavn]" -type f
  → Alternativt: glob-søk med mønster **/{filnavn}
  → Funnet? → Bruk filen fra ny plassering + rapporter FEIL FILREFERANSE (ikke MANGLER)
  → Ikke funnet? → Fortsett til steg 3

STEG 3: INNHOLDSSØK (grep)
  → Søk etter nøkkelord fra det som mangler i alle relevante filer
  → Kommando: grep -r "[nøkkelord]" [prosjektrot] --include="*.md" --include="*.json" --include="*.js"
  → Bruk 2-3 ulike nøkkelord (filnavn, funksjonsnavn, unik tekst)
  → Funnet i annen fil? → Informasjonen eksisterer, bare et annet sted
     → Bruk den + rapporter INKONSISTENS (ikke MANGLER)
  → Ikke funnet? → Fortsett til steg 4

STEG 4: KONKLUSJON MED BEVIS
  → NÅ — og først nå — kan agenten konkludere med "MANGLER"
  → MEN: Konklusjonen MÅ inneholde søkebevis (se OUTPUT-FORMAT)
```

### Tidsbruk

Hele prosedyren tar typisk 10-30 sekunder for en AI-agent. Dette er neglisjerbart sammenlignet med kostnadene ved en falsk "mangler"-konklusjon.

---

## OUTPUT-FORMAT

### Ved funn: Filen eksisterer et annet sted

```
🔍 SØKERESULTAT: Filen finnes — feil referanse
- Oppgitt sti: [sti som ble referert]
- Faktisk plassering: [sti der filen ble funnet]
- Handling: Bruker filen fra faktisk plassering
- Anbefaling: Oppdater referansen i [kildefil] linje [N]
```

### Ved funn: Informasjonen finnes i annen fil

```
🔍 SØKERESULTAT: Informasjonen finnes — annet format/plassering
- Forventet: [hva som var forventet og hvor]
- Funnet i: [filsti:linjenummer]
- Kontekst: [kort utdrag som viser at informasjonen eksisterer]
- Handling: Bruker informasjonen fra alternativ kilde
- Anbefaling: [eventuell opprydding]
```

### Ved reell mangel: Ingenting funnet etter søk

```
🔍 SØKERESULTAT: BEKREFTET MANGLER
- Hva mangler: [beskrivelse]
- Søk utført:
  1. Direkte oppslag: [sti] → Ikke funnet
  2. Filnavnsøk: find . -name "[filnavn]" → 0 treff
  3. Innholdssøk: grep -r "[nøkkelord1]" → 0 treff
  4. Innholdssøk: grep -r "[nøkkelord2]" → 0 treff
- Konklusjon: Filen/informasjonen eksisterer ikke i prosjektet
- Anbefaling: [opprett / ignorer / eskaler]
```

---

## SPESIALREGLER FOR AUDIT-AGENTER

Audit-agentens output-kontrakt (se `agent-BROWNFIELD-SCANNER.md`, som dekker audit av kodebase) krever kategoriene MANGLER og REFERANSE. For disse kategoriene gjelder TILLEGGSREGLER:

### Kategori REFERANSE (ødelagte filstier)

Før et funn rapporteres som REFERANSE, MÅ agenten:
1. Kjøre steg 1-3 i søkeprosedyren
2. Inkludere `Søk utført:`-felt i funnet
3. Hvis filen finnes et annet sted → Rapporter som REFERANSE med fiks-forslag som oppdaterer stien (IKKE som MANGLER)

### Kategori MANGLER (noe som burde eksistere)

Før et funn rapporteres som MANGLER, MÅ agenten:
1. Kjøre ALLE 4 steg i søkeprosedyren
2. Inkludere `Søk utført:`-felt i funnet med minimum 3 søk
3. Dokumentere søkekommandoer og antall treff
4. Kun konkludere MANGLER hvis alle søk gir 0 treff

### Eksempel: Audit-funn med søkebevis

```
### 05-03: Manglende feilhåndtering i proxy-modulen
- **Alvorlighet:** 🟡 MEDIUM
- **Fil:** kit-cc-overlay/src/proxy.js
- **Linje:** hele filen
- **Kategori:** MANGLER
- **Problem:** Ingen timeout-håndtering ved proxy-forespørsler
- **Søk utført:**
  1. grep -r "timeout" kit-cc-overlay/src/ → 0 treff i proxy.js
  2. grep -r "AbortController" kit-cc-overlay/ → 0 treff
  3. grep -r "request.*timeout" kit-cc-overlay/ → Funnet i server.js:45 (kun server-timeout, ikke proxy)
- **Konklusjon:** Timeout-håndtering for utgående proxy-forespørsler mangler genuint
- **Konsekvens:** Proxy kan henge uendelig ved treg upstream-server
- **Fiks-forslag:** Legg til AbortController med 30s timeout i proxy.js
```

---

## INTEGRASJON MED EKSISTERENDE PROTOKOLLER

### NEED_CONTEXT (protocol-SYSTEM-COMMUNICATION.md)

Når en agent signaliserer NEED_CONTEXT og filen ikke finnes:

```
EKSISTERENDE FLYT (uten denne protokollen):
  NEED_CONTEXT → fil mangler → signal ERROR → fortsett uten

NY FLYT (med denne protokollen):
  NEED_CONTEXT → fil mangler på oppgitt sti
    → VERIFISER-FØR-MANGEL steg 2-3
    → Funnet annet sted? → Bruk filen + rapporter feil referanse i PROGRESS-LOG
    → Ikke funnet? → Signal ERROR med søkebevis → fortsett uten
```

### Mission briefing (Lag 2-referanser)

Når en fase-agent leser mission briefing og en Lag 2-referanse peker til en fil som ikke finnes:

```
FLYT:
  Les Lag 2-referanse fra mission briefing → fil mangler
    → VERIFISER-FØR-MANGEL steg 2-3
    → Funnet? → Bruk filen + logg feil referanse i PROGRESS-LOG
    → Ikke funnet? → Logg i PROGRESS-LOG: "❌ FEIL: Lag 2-referanse [sti] → Søkt, ikke funnet"
```

### PROGRESS-LOG

Ved søk som avdekker feil referanser, logg:
```
- HH:MM 🔍 SØK: [filnavn] ikke funnet på [oppgitt sti] → Funnet på [faktisk sti]
```

Ved bekreftet mangel etter søk, logg:
```
- HH:MM 🔍 SØK: [filnavn] MANGLER BEKREFTET — søkt i [N] stier, 0 treff
```

---

## FOR AI: IMPLEMENTERINGSREGLER

```
VERIFISER-FØR-MANGEL — KOMPAKTREGLER FOR AGENTER:

1. ALDRI si "filen mangler" eller "finnes ikke" uten å ha søkt
2. ALDRI rapporter kategori MANGLER uten søkebevis
3. ALLTID søk rekursivt (hele prosjektmappen) — ikke bare oppgitt sti
4. ALLTID bruk minst 2 søkemetoder (filnavn + innhold)
5. ALLTID dokumenter søket (hva du søkte etter, hvor, antall treff)
6. HVIS funnet et annet sted → bruk filen + rapporter REFERANSE-feil (ikke MANGLER)
7. HVIS funnet i annen form → bruk informasjonen + rapporter INKONSISTENS (ikke MANGLER)
8. KUN etter 0 treff på alle søk → konkluder MANGLER med bevis

SØKEKOMMANDOER (bruk det som er tilgjengelig):
- Filnavn:  find . -name "filnavn" -type f
- Filnavn:  ls -R | grep "filnavn"  (alternativ)
- Innhold:  grep -r "nøkkelord" . --include="*.md"
- Innhold:  grep -r "nøkkelord" . --include="*.json" --include="*.js"
- Glob:     **/{filnavn}  (i verktøy som støtter glob)

YTELSESTIPS:
- Begrens grep til relevante filtyper (--include)
- Søk med det mest unike nøkkelordet først
- Stopp ved første treff hvis du bare trenger å bekrefte eksistens
```

---

## REFERANSER

| Fil | Relativ sti | Relevant seksjon |
|-----|-------------|------------------|
| SYSTEM-COMMUNICATION | `./protocol-SYSTEM-COMMUNICATION.md` | NEED_CONTEXT-protokoll |
| CLAUDE.md | `../../../CLAUDE.md` | VIKTIGE REGLER → Aldri |
| MISSION-BRIEFING-MAL | `../../maler/MISSION-BRIEFING-MAL.md` | Lag 2-referanser |
| BROWNFIELD-SCANNER | `./agent-BROWNFIELD-SCANNER.md` | 25-agents sverm — output-kontrakt for brownfield-analyse |

---

*Versjon: 1.0.0*
*Opprettet: 2026-02-15*
*Formål: SSOT for søk-og-verifikasjon — forhindre falske "mangler"-rapporter fra AI-agenter*
*Bakgrunn: Agenter konkluderte med at filer manglet uten å søke — filene lå i undermapper*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
