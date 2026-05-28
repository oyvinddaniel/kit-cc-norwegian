# protocol-INTENT-DETEKSJON

> SSOT for hvordan Kit CC oppdager brukerens intent fra naturlig språk og ruter til riktig PLANLEGGER-modus. Detaljer om hva hvert modus gjør: se `protocol-PLANLEGGER-MODUSER.md`. Event-format og append-mekanikk: se `protocol-PROGRESS-LOG.md`.

## De 4 hoved-intents

### PLAN-intent — strukturert planlegging av ny funksjon/modul

**Eksempel-fraser (norsk + engelsk-blandet):**
- "Jeg vil planlegge en ny app"
- "La oss begynne planleggingen av deling"
- "Vi må planlegge denne funksjonen først"
- "Ny funksjon: bruker-profil"
- "Lag en plan for autentisering"
- "Plan en hovedfunksjon for chat"
- "Utdyp mikrodetaljene for U-007"
- "Hyperdetaljert plan for notifications"
- "Let's plan the onboarding flow"
- "Spec ut betalings-modulen"

**Sterke signaler (high-signal keywords):**
- "planlegg", "planlegging", "planlegger", "plan for"
- "ny funksjon", "ny modul", "ny hovedfunksjon", "ny app"
- "mikrodetaljer", "hyperdetaljert", "spec ut"
- "utdyp", "fyll inn detaljer"

**Output:** PLANLEGGER aktiveres i PLAN-modus.

### BRAINSTORM-intent — fri utforskning av idé

**Eksempel-fraser:**
- "Jeg lurer på om vi trenger offline-støtte"
- "Hva hvis vi gjorde det på en annen måte?"
- "Vi kunne kanskje brukt websockets"
- "Jeg tenker høyt rundt arkitekturen"
- "La oss utforske notifikasjons-design"
- "Brainstorm rundt onboarding"
- "Tenk litt på hvordan dette bør se ut"
- "Jeg er usikker på løsningen"
- "What if we tried a different approach?"
- "Spitballing here, but..."

**Sterke signaler:**
- "lurer på", "tenker (høyt)", "spekulerer"
- "hva hvis", "what if"
- "utforske", "brainstorm", "spitball"
- "usikker på", "vet ikke helt"

**Output:** PLANLEGGER aktiveres i BRAINSTORM-modus.

### STATUS-intent — vis hvor vi er i planen

**Eksempel-fraser:**
- "Hvor er vi?"
- "Vis meg status"
- "Hva har vi planlagt så langt?"
- "Oversikt over planen"
- "Hvor langt har vi kommet?"
- "Hva gjenstår?"
- "Oversikt over moduler"
- "Vis planen"
- "Where are we at?"
- "Show me the plan"

**Sterke signaler:**
- "hvor er vi", "hvor står vi", "hvor langt"
- "status", "oversikt"
- "vis (meg) (planen|status)", "show (me) (the plan|status)"
- "hva har vi (planlagt)", "hva gjenstår"

**Output:** PLANLEGGER aktiveres i STATUS-modus.

### REVIEW-intent — sjekk om planen er god nok

**Eksempel-fraser:**
- "Har vi planlagt nok?"
- "Er vi klare (til bygging)?"
- "Sjekk planen"
- "Kjør kvalitetssjekk på planen"
- "Review planen"
- "Har vi glemt noe?"
- "Er det noe vi mangler?"
- "Klar til implementering?"
- "Is the plan ready?"
- "Did we cover everything?"

**Sterke signaler:**
- "review", "kvalitetssjekk", "sjekk planen"
- "har vi planlagt nok", "planlagt nok"
- "er vi klare", "klar til bygging", "klar til implementering"
- "har vi glemt", "mangler (det) noe", "cover everything"

**Output:** PLANLEGGER aktiveres i REVIEW-modus.

## Klassifikator-algoritme

```
input:  M = brukerens melding
output: { intent: PLAN|BRAINSTORM|STATUS|REVIEW|UNKNOWN, confidence: 0.0-1.0 }

1. Normaliser M:
   - lowercase
   - strip ekstra whitespace
   - fjern tegnsetting i randen av ord (men behold "?" som kontekst-signal)

2. For hver intent-kategori K:
   a. strong_hits[K]  = antall match på sterke signaler i K
   b. phrase_hits[K]  = antall match på eksempel-fraser i K (substring)

3. Beregn konfidens per K:
   - 2+ sterke signaler ELLER (1 sterk + 1 eksempel-frase)   → 0.9
   - 1 sterkt signal                                         → 0.7
   - Kun eksempel-frase-match (ingen sterke)                 → 0.5
   - Ingen match                                             → 0.0

4. Velg K* = argmax(confidence)

5. Hvis confidence(K*) < 0.5  → returner { UNKNOWN, 0.0 }

6. Hvis topp-2 intents har |Δconfidence| < 0.2  →
   returner { AMBIGUOUS, candidates: [K1, K2], confidence: K*.conf }

7. Logg til .ai/PROGRESS-LOG.jsonl (event=INTENT). Se "Loggings-format" nedenfor.
```

## Confidence-threshold og clarification

| Konfidens | Handling |
|---|---|
| ≥ 0.7 | Aktiver modus direkte. Si: "Jeg starter PLANLEGGER i [modus]-modus." |
| 0.5 – < 0.7 | Bekreft først. Si: "Det høres ut som du vil [intent]. Stemmer det?" |
| < 0.5 og planleggings-relatert | Still avklaringsspørsmål med 5 valg (PLAN/BRAINSTORM/STATUS/REVIEW/annet) |
| < 0.5 og ikke planleggings-relatert | IKKE aktiver PLANLEGGER. Fortsett normal Kit CC-flyt |
| AMBIGUOUS (topp-2 < 0.2 fra hverandre) | Spør: "Mente du [K1] eller [K2]?" |

## Falske positiver å unngå

### Klare falske positiver (skal IKKE aktivere PLANLEGGER)
- "Planet" ≠ "plan" — engelsk astronomi-ord
- "Status quo" ≠ STATUS — idiomatisk uttrykk
- "Vi lurer på prisen" ≠ BRAINSTORM — kommersiell prat
- "Sjekk koden" ≠ REVIEW — kode-review, ikke plan-review
- "Plansje", "planke", "planering" ≠ PLAN — andre ord som inneholder "plan"
- "Statushierarki", "statusbar" ≠ STATUS — UI-terminologi
- "Reviewer av filmen" ≠ REVIEW — domene-fremmed
- "Hyperlink" ≠ "hyperdetaljert" — felles prefiks, ulik betydning

### Tvetydige fraser (krever clarification)
- "Kan du planere inn et møte?" — kalender-handling, ikke PLAN
- "Statusmøte neste uke" — møte-avtale, ikke STATUS-intent
- "Skal vi se på dette?" — kan være STATUS eller REVIEW
- "Vi må også ha sletting" — modul-input, fanges av `protocol-MODULREGISTRERING` som "by the way"
- "Bare en idé" — kan være BRAINSTORM, kan være utsagn
- "Hva er status på X?" — STATUS hvis X = prosjekt; ikke STATUS hvis X = ekstern ting (vær, leveranse)
- "Vi mangler XYZ" — kan være BRAINSTORM (utforske hvordan) eller PLAN (legg til modul)
- "Jeg tror vi bør reintentere oppgavene" — kan være BRAINSTORM eller bare et utsagn

### Generell regel: kontekst trumfer keyword
- Et enkeltord som "plan", "status" eller "review" har generelle norske betydninger utenfor planleggings-kontekst — vurder hele setningen, ikke ord alene.
- Hvis forrige melding handlet om kode/bygging/feil → vær konservativ med å aktivere PLANLEGGER.
- Hvis brukeren allerede er i et modus → krev sterkere signal for modus-bytte.
- Korte meldinger (≤ 2 ord) som "hei", "ok", "ja" → ALDRI aktiver PLANLEGGER.

### Bevisbasert konfidens-skala
- 1 sterkt signal alene, uten støttende kontekst → 0.5 (utløser clarification)
- 1 sterkt signal + støttende kontekst (forrige melding i samme tema) → 0.7+
- 2+ sterke signaler, eller 1 sterk + 1 eksempel-frase → 0.9+
- Ved tvil: velg lavere konfidens. Konservativ tolkning er trygg.

## Loggings-format

Hver intent-deteksjon → append én JSONL-linje til `.ai/PROGRESS-LOG.jsonl` (via `progress-log-append.sh`, se `protocol-PROGRESS-LOG.md`):

```jsonl
{"ts":"2026-05-13T17:45:00Z","event":"INTENT","detected":"PLAN","confidence":0.92,"trigger":"Jeg vil planlegge en ny funksjon","modus_aktivert":true,"schemaVersion":1}
{"ts":"2026-05-13T17:46:00Z","event":"INTENT","detected":"UNKNOWN","confidence":0.0,"trigger":"hei","modus_aktivert":false,"schemaVersion":1}
{"ts":"2026-05-13T17:47:00Z","event":"INTENT","detected":"AMBIGUOUS","confidence":0.55,"trigger":"skal vi se på dette?","modus_aktivert":false,"candidates":["STATUS","REVIEW"],"schemaVersion":1}
```

Lav-konfidens-deteksjoner og UNKNOWN logges også, med `modus_aktivert: false`. AMBIGUOUS logges med ekstra felt `candidates: ["PLAN","BRAINSTORM"]` for å spore hva brukeren ble bedt om å avklare.

## Vedlikehold

Månedlig review av PROGRESS-LOG.jsonl (filter `event=INTENT`):

1. **Tell UNKNOWN-rate.** Høy rate (> 20%) → vi mangler eksempel-fraser. Legg til de hyppigste reelle brukerfrasene som ikke matchet.
2. **Tell clarification-rate** (konfidens 0.5–0.7). Høy rate → signalene er for svake. Vurder å oppgradere sterke signaler eller legge til kontekst-heuristikker.
3. **Tell feil-aktiveringer** (bruker korrigerte intent etterpå). Legg til i "Falske positiver" og senk konfidens for trigger-frasen.
4. **Legg til nye fraser** brukere faktisk bruker — språket utvikler seg.

Oppdater dette dokumentet og bump versjon (semver: patch for fraser, minor for algoritme-endring).

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
