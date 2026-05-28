# protocol-PLANLEGGER-MODUSER.md

> Full spesifikasjon for de fire modusene i PLANLEGGER-agent v3.0.0+.
> Denne protokollen er normativ — PLANLEGGER MÅ følge stegene her eksakt.
> Tilhørende karakter-kriterier for REVIEW-modus: se `protocol-VALIDERING-SKALA.md`.
> Mønster-bibliotek: `Kit CC/Agenter/MONSTRE/_katalog.md`.

---

## 0. Felles forutsetninger (alle moduser)

Før AI går inn i en modus, MÅ følgende være gjort:

1. Les `Kit CC/Agenter/MONSTRE/_katalog.md` (mønster-bibliotek)
2. Les `.ai/PROJECT-STATE.json` for `stateVersion`, `currentPhase`, `builderMode`
3. Acquire lock: `bash Kit CC/Agenter/scripts/state-lock.sh acquire PLANLEGGER`
4. Logg modus-start til `.ai/PROGRESS-LOG.jsonl` via `bash Kit CC/Agenter/scripts/progress-log-append.sh`
5. Slipp lock ved modus-slutt: `bash Kit CC/Agenter/scripts/state-lock.sh release PLANLEGGER`

Hvis lock allerede er holdt av annen agent: vent eller foreslå brukeren alternativ. Aldri skriv uten lock.

Modus-overgang logges som event=`MODUS_TRANSITION` (se §6).

---

## 1. PLAN-modus

### 1.1 Tidsmodus-spørsmål (alltid først)

Når PLAN-modus aktiveres for første gang i en økt, ELLER når brukeren eksplisitt sier "ny planleggings-økt", still dette spørsmålet FØRST:

```
"Hvor mye tid har du til denne planleggings-økten?"

Velg ett alternativ:
- 10 min      — Skissere kun nivå 1 (hovedfunksjoner)
- 1 time      — Nivå 1-2 (hovedfunksjoner + underfunksjoner)
- 2 timer     — Nivå 1-3 (legger til detaljer)
- Halve dagen — Alle 4 nivåer inkludert mikrodetaljer
- Flere dager — Hyperdetalj alle 4 + research
- Ukesvis     — Enterprise-nivå med eksternt research
```

Lagre i `PROJECT-STATE.json` under `planlegger.tidsmodus`. Logg event:
```jsonl
{"ts":"...","event":"PLAN_TIDSMODUS_SATT","tidsmodus":"halve_dagen","schemaVersion":1}
```

Tidsmodus styrer hvor langt AI går automatisk uten å spørre:

| Tidsmodus     | Stopp etter nivå | Kommentar |
|---------------|------------------|-----------|
| 10 min        | 1                | Bare hovedfunksjoner |
| 1 time        | 2                | + underfunksjoner |
| 2 timer       | 3                | + detaljer (hybrid) |
| Halve dagen   | 4                | Full mikrodetalj |
| Flere dager   | 4 + research     | AI søker mønstre eksternt |
| Ukesvis       | 4 + dyp research | Enterprise-grad |

### 1.2 Eksisterende vs nytt prosjekt-deteksjon

Etter tidsmodus, sjekk om eksisterende plan finnes — les `docs/BRUKERENS-PLAN.md`, `docs/FASE-2/MODULREGISTER.md`, `.ai/PROJECT-STATE.json` (hvis de finnes).

**Hvis ingen finnes:** Si "Jeg ser ingen eksisterende plan. La oss starte fra null." → Gå til §1.3 (Nivå 1).

**Hvis eksisterende plan finnes:**
> "Du har en eksisterende plan med [N] moduler. Vil du:
> (1) Fortsette der vi slapp
> (2) Legge til ny funksjon
> (3) Utdype eksisterende modul
> (4) Starte på nytt (advarsel: eksisterende beholdes som arkiv)"

- (1) → Les PROJECT-STATE `aktivModul`/`aktivNivå`, fortsett der.
- (2) → Gå til §1.3 nivå 1 for kun den nye funksjonen.
- (3) → Be om M-XXX, hopp til §1.3 nivå 2 for den modulen.
- (4) → Flytt eksisterende `docs/moduler/*` til `docs/arkiv/<dato>/`, start friskt.

### 1.3 4-nivå-flyten (kjerne-mekanikken)

PLAN-modus jobber strengt i fire nivåer — ikke hopp over noen. Eierskap per nivå:

| Nivå | Eier | Hva |
|------|------|-----|
| 1 | Bruker | Hovedfunksjoner |
| 2 | Bruker (AI foreslår) | Underfunksjoner |
| 3 | Hybrid | Detaljer + akseptansekriterier |
| 4 | AI (kjerneverdiløftet) | Mikrodetaljer fra mønstre |

#### Nivå 1 — Hovedfunksjon (bruker eier)

Spør:
> "Hva er de viktigste tingene appen din skal kunne gjøre? Bare beskriv på et høyt nivå — vi går i dybden senere."

For hver hovedfunksjon brukeren nevner:

1. Append brukerens ord ordrett til `docs/BRUKERENS-PLAN.md` med tidsstempel.
2. Opprett `docs/moduler/M-XXX-[kortnavn].md` med frontmatter (harmonisert med MODUL-SPEC-MAL.md):
   ```yaml
   ---
   id: M-XXX
   navn: "[brukerens ord, kort form]"
   beskrivelse: "[En setning — fylles inn ved nivå 2 hvis tom på nivå 1]"
   mvp: ukjent          # Ja/Nei/ukjent
   status: Pending       # Pending/Building/Testing/Polishing/Done/Blocked
   prioritet: MA         # MA/BOR/KAN
   avhenger: []          # Liste av M-IDer eller tom
   estimat: ukjent       # S/M/L/XL/ukjent
   opprettet: <ISO timestamp>
   sist_oppdatert: <ISO timestamp>
   brukerord_kilder: []  # Liste av BRU:SN-referanser
   # Kit CC interne felter:
   nivaa_fullfort: 1
   tidsmodus: <fra §1.1>
   underfunksjoner: []
   monstre_anvendt: []
   versjon: 0.1
   ---
   ```
   Felter `beskrivelse`, `mvp`, `avhenger`, `estimat`, `sist_oppdatert`, `brukerord_kilder` er felles med `Kit CC/Agenter/maler/MODUL-SPEC-MAL.md` (autoritativ).
3. M-XXX bruker neste ledige sekvensnummer (M-001, M-002 ...). Aldri gjenbruk slettede ID-er — marker `Forkastet` i registeret.
4. Append ordrett brukersitat til seksjon `## 1. Brukerord` i M-XXX-filen.
5. Bekreft til bruker: "Modul: M-XXX — [navn]".

Når bruker virker ferdig: "Er det flere hovedfunksjoner, eller skal vi gå dypere på de vi har?"

Hvis tidsmodus = 10 min → stopp etter nivå 1, kjør R6-light (status-snapshot) og avslutt.

#### Nivå 2 — Underfunksjon (bruker eier, AI foreslår)

For hver M-XXX (ta én om gangen) spør:
> "Hvilke konkrete handlinger må appen støtte under [hovedfunksjonen]? For eksempel: opprette, vise, redigere, slette, søke, dele, eksportere..."

AI MÅ lese `MONSTRE/_katalog.md` og foreslå standard underfunksjoner. Vis hvilke mønstre forslaget kommer fra:

> "Dette ser ut som en CRUD-modul. Basert på M:opprett, M:les, M:redigere, M:slett er typiske underfunksjoner: opprette / vise liste / redigere / slette / søke / sortere. Beholde alle, fjerne noen, eller legge til flere?"

For hver godkjent underfunksjon:

1. Tildel U-ID. **Flat nummerering per modul**: U-001, U-002 ... ID-er gjenbrukes aldri.
2. Append til `M-XXX-*.md` seksjon `## 3. Underfunksjoner`:
   ```markdown
   ### U-001 — Opprette ny brukerprofil
   - Brukerord: "kunne lage en bruker"
   - Status: Pending
   - Detaljer: (nivå 3)
   - Mikrodetaljer: (nivå 4)
   ```
3. Oppdater frontmatter: `underfunksjoner: [U-001, ...]`, `nivaa_fullfort: 2`, `versjon += 0.1`.

Hvis tidsmodus = 1 time → stopp etter nivå 2.

#### Nivå 3 — Detalj (hybrid, AI foreslår aggressivt)

For hver U-XXX MÅ AI: (1) lese relevante mønstre fra `MONSTRE/_katalog.md`, (2) erklære eksplisitt hvilke mønstre som brukes, (3) foreslå konkrete detaljer.

**Eksempel — U-007 "Slett brukerprofil":**
> "Jeg bruker M:slett og M:revisjonsspor. Forslag til detaljer:
> - Bekreftelses-dialog (passord eller skriv navnet)
> - Soft-delete vs hard-delete?
> - Hva skjer med tilknyttet data (innlegg, kommentarer)?
> - Audit log med tidsstempel og initiator
> - GDPR-konsekvenser (rett til sletting)
> - Undo-vindu (24t soft-delete før permanent)
>
> Skal jeg legge inn disse, eller vil du justere først?"

For hver godkjent detalj:

1. Tildel D-ID. **Flat nummerering per modul**: D-001, D-002 ...
2. Append til `M-XXX-*.md` seksjon `## 3.5 Detaljer per underfunksjon` under U-XXX:
   ```markdown
   #### D-001 — Bekreftelses-dialog ved sletting
   - Mønster: M:slett, M:tilgangsport
   - Akseptansekriterium (GIVEN-WHEN-THEN):
     GIVEN bruker er logget inn og har en konto,
     WHEN bruker trykker "Slett konto",
     THEN vises en modal som krever at brukeren skriver inn kontonavn.
   ```
3. Oppdater frontmatter: `nivaa_fullfort: 3`, `versjon += 0.1`, `monstre_anvendt += [...]`.

Hvis tidsmodus = 2 timer → stopp etter nivå 3.

#### Nivå 4 — Mikrodetalj (AI eier helt — kjerneverdiløftet)

Hvis tidsmodus tillater nivå 4 (halve dagen eller mer), gå automatisk fra nivå 3 til 4 uten å spørre — men varsle:
> "Nå går jeg videre med mikrodetaljer for [U-XXX]. Jeg fyller inn lista, så får du gjennomgang etterpå."

**AI-eid seksjon — autoritativ mal:** AI fyller seksjon `## 3.5 Mikrodetaljer per underfunksjon` i `docs/moduler/M-XXX-*.md` strengt etter strukturen definert i `Kit CC/Agenter/maler/MODUL-SPEC-MAL.md` (seksjon 3.5). For en komplett utfylt referanse, se `Kit CC/Agenter/maler/MODUL-SPEC-EKSEMPEL.md` — denne filen viser forventet detaljnivå, kolonneoppsett og coverage-bekreftelse.

**Obligatoriske krav (håndheves av REVIEW R3 og ITERASJONS-agent i Fase 5):**
- **Minst 10 mikrodetaljer per underfunksjon** (PLANLEGGER målsetting; 15-30 er typisk)
- **Obligatoriske mønstre dekket**: `M:tilstander`, `M:tilgjengelighet`, `M:kanttilfeller` — pluss `M:mobil-beroring` ved mobil/responsiv
- Hvis < 10 mikrodetaljer eller obligatoriske mønstre mangler → ITERASJONS-agent returnerer modul til PLAN-modus

For hver U-XXX: les alle obligatoriske mønstre + alle som matcher typen, generer mikrodetalj-tabell systematisk, skriv til `M-XXX-*.md` seksjon `## 3.5 Mikrodetaljer per underfunksjon`.

**Eksempel — U-007 "Slett brukerprofil":**

| # | Mikrodetalj | Status | Mønster | Begrunnelse |
|---|---|---|---|---|
| 1 | Konfirmasjons-modal med navn-input | Grønn | M:slett | Datatap-bekreftelse |
| 2 | "Slett konto"-knapp er rød, ikke standard farge | Grønn | M:slett | Destruktiv handling skal være visuelt distinkt |
| 3 | Toast: "Konto slettet — kan gjenopprettes i 30 dager" | Grønn | M:tilbakemelding + M:angre | GDPR-vennlig recovery |
| 4 | Slett-knapp disabled mens forespørsel pågår | Grønn | M:tilstander | Forhindrer double-submit |
| 5 | Hvis sletting feiler: vis error med "prøv igjen" + support-lenke | Grønn | M:feilhåndtering | Recovery-action |
| 6 | WCAG: fokus returnerer til logout-knapp etter slett | Grønn | M:tilgjengelighet | 2.4.7 Focus Visible |
| 7 | Mobil: trykk-område minst 44x44px på slett-knapp | Grønn | M:mobil-beroring | WCAG 2.5.5 Target Size |
| 8 | Kantfall: bruker forsøker slett mens admin har lock | Grønn | M:kanttilfeller + M:tilgangsport | Concurrency |

Typisk 15-30 mikrodetaljer per underfunksjon. Presenter for bruker:
> "Jeg har lagt inn [N] mikrodetaljer for U-007. Vil du:
> (1) Godta alle — neste underfunksjon
> (2) Justere noen — pek dem ut
> (3) Legge til flere — beskriv hva som mangler"

Etter godkjenning per underfunksjon (når seksjon 3.5 for én U-XXX er ferdig utfylt): oppdater frontmatter (`nivaa_fullfort: 4`, `sist_oppdatert`, `versjon += 0.1`, `monstre_anvendt += [...]`) og append event obligatorisk:
```jsonl
{"ts":"...","event":"MIKRODETALJER_KOMPLETT","modul":"M-007","underfunksjon":"U-001","antall":18,"obligatoriske_dekket":["M:tilstander","M:tilgjengelighet","M:kanttilfeller"],"min_10_oppfylt":true,"schemaVersion":1}
```
Event MÅ logges per underfunksjon — ikke per modul. Felt `min_10_oppfylt: false` flagger at modulen ikke kan passere PHASE-GATES uten override.

### 1.4 Mønster-aktivering (obligatorisk lesing)

Før AI foreslår en underfunksjon, detalj eller mikrodetalj: MÅ lese `Kit CC/Agenter/MONSTRE/_katalog.md`, identifisere relevante mønstre, og liste dem eksplisitt til bruker ("Jeg bruker M:slett, M:undo-first, M:tilgjengelighet, M:revisjonsspor for dette.")

**Obligatoriske mønstre (sjekkes ALLTID for alle UI-funksjoner):**
- `M:tilstander` — tom/laster/feil/data-tilstander
- `M:tilgjengelighet` — WCAG-vurdering
- `M:kanttilfeller` — kanttilfelle-analyse

**Mobile-spesifikke (hvis prosjekttype = mobil eller responsiv web):**
- `M:mobil-beroring` — trykk-områder, gester, offline

Hvis obligatorisk mønster mangler etter nivå 4: marker som gap — REVIEW-modus flagger som KRITISK GAP.

### 1.5 Skriving til Kit CC SSOT-filer

Etter hver brukerrespons som genererer endring:

1. Acquire lock (`bash Kit CC/Agenter/scripts/state-lock.sh acquire PLANLEGGER`)
2. Append til `docs/BRUKERENS-PLAN.md` (rå, ordrett, append-only)
3. Oppdater relevant `docs/moduler/M-XXX-*.md` (versjon += 0.1 i frontmatter)
4. Regenerer `docs/FASE-2/MODULREGISTER.md` via `bash Kit CC/Agenter/scripts/regenerate-modulregister.sh`
5. Logg event til `.ai/PROGRESS-LOG.jsonl` via `bash Kit CC/Agenter/scripts/progress-log-append.sh`
6. Inkrementer `stateVersion` i PROJECT-STATE.json (atomisk: .tmp → rename)
7. Release lock (`bash Kit CC/Agenter/scripts/state-lock.sh release PLANLEGGER`)

Hvis et trinn feiler: rull tilbake til siste `.prev`-backup og rapporter feilen til bruker.

### 1.6 Fatigue-deteksjon

Tell brukerens svarlengder fortløpende. Hvis 3 påfølgende svar er 1-3 ord:
> "Jeg merker vi har holdt på en stund. Vil du at jeg tar resten av mikrodetaljene selv? Du ser resultatet og kan endre det du vil."

- Hvis ja → AI kjører autonomi-modus for resten av nivå 4 (presenter aggregert resultat).
- Hvis nei → fortsett normal flyt.

Fatigue-deteksjon må IKKE være paternalistisk: SPØR, ikke anta. Bruker kan ha legitime grunner til korte svar. Reset telleren ved svar på 4+ ord.

### 1.7 Avbryting og recovery midt i PLAN-modus

Hvis bruker avbryter midt i nivå 2, 3 eller 4 ("stopp", "pause", "avslutt"):

1. **Lagre sist-fullført state:** for aktiv M-XXX-*.md: hvis kun delvis utfylt, lagre med suffiks `_INCOMPLETE` (f.eks. `M-007-eksport_INCOMPLETE.md`). Behold eksisterende komplett-versjon hvis den finnes. Sett `status: paused_mid_level_N` i frontmatter.

2. **Append til PROGRESS-LOG.jsonl:**
   ```jsonl
   {"ts":"...","event":"SESSION_PAUSED","modus":"PLAN","last_complete_level":2,"last_module":"M-007","last_underfunction":"U-007-003","reason":"bruker_avbrot","schemaVersion":1}
   ```

3. **Oppdater PROJECT-STATE.json:** `planlegger.aktivSteg: "PLAN"`, `planlegger.aktivNivaa: 3`, `planlegger.aktivModul: "M-007"`, inkrementer `stateVersion`.

4. **Oppdater `TILSTAND/OYEBLIKKSBILDE.md`** med faktisk status — ikke "N/A" når implementering pågår.

5. **Gjenoppta-prosedyre ved neste sesjon:** les PROGRESS-LOG siste 5 linjer. Hvis siste event = SESSION_PAUSED → "Vi var i PLAN-modus med [modul] på nivå [N]. Vil du fortsette der?". Hvis ja → last `_INCOMPLETE`-fil og fortsett. Hvis nei → marker `_INCOMPLETE`-fil som `_ABORTED`, start friskt.

---

## 2. BRAINSTORM-modus

### 2.1 Aktivering

- Intent BRAINSTORM oppdaget av intent-detektor
- Bruker sier eksplisitt "la oss tenke på dette", "jeg lurer på", "hva hvis"
- Bruker invokerer manuelt

### 2.2 Prinsipper

Si EKSPLISITT ved modus-start: "Vi er i utforsknings-modus. Ingenting lagres uten ditt samtykke."

Atferd: vær tankepartner ikke driver; still "hva hvis"-spørsmål; tilby 2-3 alternativer før evaluering; tilby research når naturlig ("Skal jeg hente inspirasjon på nettet?"); hold kort respons (≤ 3-5 setninger).

### 2.3 Hva som IKKE skjer i BRAINSTORM

Ingen skriving til `BRUKERENS-PLAN.md`, ingen M-XXX opprettelse, ingen `MODULREGISTER`-oppdatering. Bare lesing av eksisterende state for kontekst.

Eneste tillatte skriving er event-logging:
```jsonl
{"ts":"...","event":"BRAINSTORM_NOTAT","beskrivelse":"vurderte alternativ A vs B for ...","schemaVersion":1}
```

### 2.4 Commit-handoff til PLAN

Hvis brukeren sier "OK, la oss faktisk lage dette", "kan vi notere det", "la oss bygge dette":
> "Vil du jeg fanger denne idéen til planen? Jeg kan starte PLAN-modus med disse beskrivelsene."

Hvis ja: (1) logg `MODUS_TRANSITION` (BRAINSTORM → PLAN), (2) bytt modus, (3) fang brukerens beskrivelse ORDRETT som første brukerord for ny M-XXX, (4) fortsett PLAN-flyt fra §1.3 nivå 1.

---

## 3. STATUS-modus

### 3.1 Aktivering

- Intent STATUS oppdaget
- Bruker sier "hvor er vi", "vis status", "hva er status", "vis planen"

### 3.2 Lese-rekkefølge (read-only)

STATUS-modus er strengt read-only. Lås IKKE state. Les: (1) `.ai/PROJECT-STATE.json`, (2) `.ai/SESSION-HANDOFF.md` hvis finnes, (3) `docs/FASE-2/MODULREGISTER.md`, (4) `docs/moduler/M-*.md` (oppsummering), (5) `.ai/VALIDERING.md` hvis finnes, (6) `.ai/PROGRESS-LOG.jsonl` siste 20 events.

### 3.3 Telling fra autoritative kilder

Aldri stol på cachede tall. Tell direkte:
- **Hovedfunksjoner**: tell `M-*.md`-filer med status != `Forkastet`
- **Underfunksjoner**: tell U-IDer i alle M-*.md
- **Detaljer**: tell D-IDer
- **Mikrodetaljer**: tell rader i seksjon 3.5

### 3.4 Output-format

Presenter strukturert:

```
Status for prosjekt: [navn]

Fase: [N — navn]
Klassifisering: [nivå]
Tidsmodus: [modus]
Builder-modus: [ai-bestemmer / samarbeid / detaljstyrt]

Moduler: [N totalt] — [X Grønn (Bestemt), Y Blå (Pågående), Z Hvit (Pending)]
Underfunksjoner: [N] (gjennomsnitt [M] per modul)
Detaljer: [N]
Mikrodetaljer: [N] (gjennomsnitt [M] per underfunksjon)

Sist VALIDERING: karakter [A-D], [dato]

Åpne spørsmål: [liste, maks 5]
Blokkerte: [liste]

Anbefalt neste handling: [én konkret ting]
```

### 3.5 Hva som IKKE skjer i STATUS

Ingen skriving til noen fil (strengt read-only), ingen oppfølgings-spørsmål, ingen lock-acquire. Unntak: én sporbarhets-event `{"ts":"...","event":"STATUS_VIST","schemaVersion":1}`.

---

## 4. REVIEW-modus

### 4.1 Aktivering

- Intent REVIEW oppdaget
- Bruker sier "review planen", "har vi planlagt nok", "er vi klare"
- **Auto-trigger**: Før hver PHASE-GATES (Fase 2→3, 3→4, 5→6, 6→7)

REVIEW-modus er den dyreste modusen (tokens) — kjøres bare når nødvendig.

### 4.2 Steg R1: Lesing

Les ALLE planning-filer: Kit CCs `CLAUDE.md` + relevante protokoll-filer, `.ai/PROJECT-STATE.json`, `docs/BRUKERENS-PLAN.md`, `docs/FASE-2/MODULREGISTER.md`, alle `docs/moduler/M-*.md`, events `DECISION`/`ERROR` i `PROGRESS-LOG.jsonl`, `UTSATT.md` (hvis finnes), `Kit CC/Agenter/MONSTRE/_katalog.md` + refererte mønster-filer, og `.ai/PROGRESS-LOG.jsonl`.

### 4.3 Steg R2: Self-consistency (3 plan-varianter)

For hver kritisk modul (status `Grønn (Bestemt)` + `mvp: Ja`), generer 3 variant-vurderinger:
- **Variant A**: "Er dette komplett som spesifisert?"
- **Variant B**: "Hva ville en kritisk reviewer si mangler?"
- **Variant C**: "Hva ville feile i produksjon med denne planen?"

Mest konsistente funn = mest sannsynlig korrekt (se R2b). Self-consistency koster 3x tokens — bruk KUN for kritiske moduler.

**Konkret eksempel — M-007 "Slett brukerprofil":**

| Variant | Spørsmål | Funn |
|---|---|---|
| A (Komplett-sjekk) | "Er alle akseptansekriterier oppfylt? Mangler vi steps?" | Mangler: ingen retry-flow ved sletteoperasjon-feil |
| B (Kritisk reviewer) | "Hva ville en kritisk reviewer si mangler?" | Mangler: GDPR-bekreftelse til bruker etter sletting, og audit-log med IP/timestamp |
| C (Produksjons-sjekk) | "Hva ville feile i prod med denne planen?" | Mangler: cascade-handling for tilknyttet data, ingen retry-flow |

**Aggregering** (se R2b for full logikk):
- "Retry-flow ved feil" → 2 av 3 varianter → **kritisk gap** (konvergens)
- "GDPR-bekreftelse" → 1 av 3 varianter → spør bruker om prioritering (singleton)
- "Cascade-handling for tilknyttet data" → 1 av 3 (men obligatorisk M:kanttilfeller-mønster mangler) → **kritisk gap** (trumfes av obligatorisk mønster-regel)

### 4.4 Steg R2b: Hva betyr "mest konsistent" konkret?

Når de tre variantene gir forskjellige funn:

1. **Konvergens-prinsipp**: Hvis 2 eller flere varianter peker på samme gap → høy konfidens, logg som funn.
2. **Singleton-funn**: Hvis kun 1 variant nevner et gap → lavere konfidens, men logg med flag `varianter-1-av-3`.
3. **Motstridende funn**: Hvis varianter har konflikt (A sier OK, B sier kritisk):
   - Vurder mot eksisterende BESLUTNINGER (i PROGRESS-LOG) — er valg allerede tatt?
   - Vurder mot obligatoriske mønstre (M:tilstander, M:tilgjengelighet, M:kanttilfeller) — disse trumfer.
   - Hvis fortsatt uklart: rapporter som "varianter uenig" — bruker må avgjøre.

4. **Aggregering**:
   - **Kritiske gap** = funn rapportert av 2+ varianter ELLER funn mot obligatorisk mønster.
   - **Viktige mangler** = funn rapportert av 1 variant + rimelig begrunnelse.
   - **Små mangler** = forslag som ingen variant kalte kritisk.

5. **Eksplisitt bruker-commit ved tvilstilfeller**:
   - For konvergens-funn (2+ varianter): rapporter som kritisk, ingen avklaring nødvendig.
   - For singleton-funn: spør bruker — "Jeg fant dette gapet i kun 1 av 3 plan-varianter: [gap]. Skal jeg rapportere det som kritisk, viktig, eller forkaste?"
   - For motstridende funn: spør bruker — "Variantene er uenige om [gap]. A sier OK, B sier kritisk. Hvilken vurdering stemmer best med din intensjon?"
   - Logg brukerens valg som event=`REVIEW_USER_DECISION`.

6. **Logg konsistens-vurderingen**:
   ```jsonl
   {"ts":"...","event":"REVIEW_CONSISTENCY","modul":"M-007","funn":[...],
    "konvergens":["gap1","gap2"],"singleton":["gap3"],"motstridende":[],"schemaVersion":1}
   ```

### 4.5 Steg R3: Pattern coverage audit

For hver U-XXX: (1) sjekk anvendte mønstre i Mønster-kolonnen i seksjon 3.5, (2) sjekk obligatoriske (`M:tilstander`, `M:tilgjengelighet`, `M:kanttilfeller` — pluss `M:mobil-beroring` hvis mobil/responsiv), (3) hvis obligatorisk mangler → KRITISK GAP, logg det.

### 4.6 Steg R4: Konsistens-sjekker

- Alle hovedfunksjoner har minst én underfunksjon?
- Alle underfunksjoner har minst én detalj?
- Alle detaljer har akseptansekriterier (GIVEN-WHEN-THEN)?
- Ingen orphaned IDer (referert men finnes ikke)?
- Ingen ID-gaps (M-005 etterfulgt av M-007 uten M-006)?
- BRUKERORD-referanser matcher faktisk innhold (verbatim-validering)?
- `versjon` i frontmatter konsistent med antall endringer i PROGRESS-LOG?

### 4.7 Steg R5: Human language audit

Sjekk for utvikler-jargon uten forklaring: "Repository pattern" må ha parentes-forklaring første gang; "JWT" → "token-basert innlogging (JWT)"; akronymer må utvides; engelske ord erstattes hvor norsk fungerer like godt. Flagg brudd som "Små mangler" med linje-referanse.

### 4.8 Steg R6: Skriv VALIDERING.md

Skriv (overskriv) `.ai/VALIDERING.md`:

```markdown
# VALIDERING.md

## Siste sjekk
- Dato: YYYY-MM-DD HH:MM
- Karakter: [A/B/C/D]
- Self-consistency kjørt: ja/nei
- Moduler vurdert: [liste M-XXX]

## Sammendrag
[3-5 setninger om generell tilstand]

## Kritiske gap (må fikses før bygging)
- [Liste med konkrete handlinger, hver med M-XXX/U-XXX-referanse]

## Viktige mangler (bør fikses)
- [Liste]

## Små mangler (nice-to-have)
- [Liste]

## Styrker
- [Liste — gi balansert kritikk]

## Inkonsistenser
- [Liste]

## Anbefaling
[Én av:]
- "Klar for bygging — gå til Fase 5"
- "Fiks kritiske gap først"
- "Stor opprydding nødvendig"
```

Logg event:
```jsonl
{"ts":"...","event":"REVIEW_KOMPLETT","karakter":"B","kritiske":0,"viktige":3,"smaa":7,"schemaVersion":1}
```

### 4.9 Steg R7: Karakter-skala

Tildel karakter A-D. **B er minimum for at PHASE-GATES skal returnere PASS** (med mindre brukeren eksplisitt overstyrer via `gateOverrides[]`).

Kort versjon:

| Karakter | Kort kriterium |
|----------|---------------|
| A | Ingen kritiske gap, max 2 viktige, alle obligatoriske mønstre dekket |
| B | Ingen kritiske, inntil 5 viktige, obligatoriske mønstre dekket |
| C | 1-2 kritiske ELLER 5+ viktige ELLER delvis manglende obligatoriske |
| D | 3+ kritiske ELLER manglende obligatoriske ELLER fundamental inkonsistens |

**Detaljerte kriterier:** se `protocol-VALIDERING-SKALA.md`.

---

## 5. Modus-overgangs-regler

Alle modus-overganger MÅ logges som event:

```jsonl
{"ts":"...","event":"MODUS_TRANSITION","fra":"BRAINSTORM","til":"PLAN","trigger":"bruker_commit","schemaVersion":1}
```

### Fra PLAN
- → BRAINSTORM: hvis bruker sier "la oss tenke", "jeg lurer på", "hva hvis" midt i flyt
- → STATUS: hvis bruker sier "hvor er vi", "vis status"
- → REVIEW: hvis bruker sier "ferdig", "klare", "har vi planlagt nok"

### Fra BRAINSTORM
- → PLAN: hvis bruker commit-er på en idé (se §2.4)
- → STATUS: hvis bruker spør om eksisterende plan-tilstand

### Fra STATUS
- → PLAN: hvis bruker sier "la oss fortsette" eller velger neste-handling
- → REVIEW: hvis bruker sier "review planen"

### Fra REVIEW
- → PLAN: hvis bruker vil fikse identifiserte gap (gå direkte til berørt M-XXX/U-XXX)
- → BRAINSTORM: hvis kritisk gap krever ny tenking

### Alltid lov
- Bruker kan eksplisitt avbryte modus med "stopp", "pause", "avslutt økt" → trigger recovery-protokoll (§1.7).

### Aldri lov
- Hoppe over PHASE-GATES uten REVIEW-modus først (med mindre `gateOverrides[]` er satt).
- Bytte fra PLAN til STATUS midt i en mikrodetalj-utfylling uten å lagre `_INCOMPLETE`-fil.
- Kjøre to moduser samtidig — én modus om gangen, alltid.

---

## 6. Auto-trigger-sammendrag

Tabell over når modus auto-triggers (uten eksplisitt brukerinvokasjon).

### 6.1 Fase-baserte auto-triggere (prosess-agenter)

| Når | Trigger | Modus | Kilde |
|---|---|---|---|
| Etter Fase 1 klassifisering | OPPSTART-agent foreslår | PLAN | `1-OPPSTART-agent.md` |
| KRAV-09 i Fase 2 | KRAV-agent kaller direkte | PLAN | `2-KRAV-agent.md` |
| Før hver MVP-oppgave i Fase 4 | MVP-agent foreslår | STATUS | `4-MVP-agent.md` |
| Hver modul-start i Fase 5 | ITERASJONS-agent sjekker mikrodetaljer | PLAN (hvis mangler) | `5-ITERASJONS-agent.md` |
| Før hver PHASE-GATES (2→3, 3→4, 5→6, 6→7) | PHASE-GATES sjekker VALIDERING | REVIEW (hvis mangler) | `agent-PHASE-GATES.md` |
| Før produksjons-launch i Fase 7 | PUBLISERINGS-agent obligatorisk | REVIEW (B+ kreves) | `7-PUBLISERINGS-agent.md` |

### 6.2 Intent-baserte auto-triggere (brukerord)

| Brukerens ord | Modus | Kilde |
|---|---|---|
| "har vi planlagt nok?" | REVIEW | Intent-deteksjon (Steg 5) |
| "hvor er vi?" | STATUS | Intent-deteksjon |
| "la oss tenke" | BRAINSTORM | Intent-deteksjon |
| "vi vil planlegge" / "jeg vil planlegge" | PLAN | Intent-deteksjon |
| Vag idé-beskrivelse | BRAINSTORM | Intent-detektor (Steg 5) |
| "review" / "sjekk planen" | REVIEW | Intent-detektor |

### 6.3 System-/recovery-triggere

| Trigger | Modus | Kilde |
|---|---|---|
| Ny sesjon med tom plan | PLAN | CLAUDE.md Steg 3 (Nytt prosjekt) |
| Fatigue oppdaget (3 korte svar) | PLAN (autonomi-undermodus) | §1.6 |
| Bruker sier "stopp" / "pause" | Recovery → ingen modus | §1.7 |
| Krasj recovery med SESSION_PAUSED event | Forrige modus (resume) | `protocol-CRASH-RECOVERY.md` |
| "la oss faktisk lage dette" i BRAINSTORM | PLAN (commit-handoff) | §2.4 |
| Velger "neste handling" fra STATUS | PLAN | §5 |
| "fiks de kritiske gappa" i REVIEW | PLAN (mot berørte moduler) | §5 |

---

## 7. Referanser

- Mønster-bibliotek: `Kit CC/Agenter/MONSTRE/_katalog.md`
- Karakter-kriterier (R7): `protocol-VALIDERING-SKALA.md`
- State-locking: `Kit CC/Agenter/scripts/state-lock.sh` (fra Steg 3)
- Logg-append: `Kit CC/Agenter/scripts/progress-log-append.sh` (fra Steg 3)
- Modulregister-regen: `Kit CC/Agenter/scripts/regenerate-modulregister.sh` (fra Steg 3)
- SSOT-filer:
  - `docs/BRUKERENS-PLAN.md` (append-only)
  - `docs/FASE-2/MODULREGISTER.md` (auto-generert)
  - `docs/moduler/M-XXX-*.md` (per modul med frontmatter)
- Intent-deteksjon: `protocol-INTENT-DETEKSJON.md` (Steg 5)
- Krasj-recovery: `protocol-CRASH-RECOVERY.md`
- Fase-overgang: `agent-PHASE-GATES.md`

---

## Versjon

**v1.0** — 2026-05-13 — Initial spesifikasjon for de fire PLANLEGGER-modusene (PLAN, BRAINSTORM, STATUS, REVIEW). Implementerer Kit CC Planner Skill v4.0-logikken som native Kit CC-funksjonalitet.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
