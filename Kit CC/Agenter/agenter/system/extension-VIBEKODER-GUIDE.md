# extension-VIBEKODER-GUIDE v1.1.0

> Extension: Klartekst-guide for vibekodere. Alle prosess-agenter kan referere hit for brukervennlige forklaringer.
> Denne filen erstatter IKKE agentenes egne instruksjoner — den gir et supplement for bruker-kommunikasjon.

---

## FORMÅL

Vibekodere (nybegynnere som bruker AI til å bygge apper) trenger klare forklaringer uten teknisk sjargong. Denne guiden gir alle agenter et felles språk for å kommunisere med brukeren.

**Når brukes denne filen?**
- Når en prosess-agent starter en ny fase og ønsker å gi brukeren kontekst
- Når brukeren virker forvirret eller spør "hva skjer nå?"
- Ved fase-overganger for å forberede brukeren på hva som kommer

**Intensitetstilpasning:**
- MINIMAL/FORENKLET: Bruk kun "Kort forklaring" (2-3 setninger)
- STANDARD: Bruk "Kort forklaring" + analogien
- GRUNDIG/ENTERPRISE: Bruk alt inkludert "Hva du bør vite"

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## FASE 1: IDÉ OG VISJON

**Kort forklaring:**
Du forteller oss hva du vil bygge. Vi stiller noen spørsmål for å forstå visjonen din, og så hjelper vi deg med å få den ned på papir.

**Analogi:** Som å møte en arkitekt for første gang — du beskriver drømmehuset, og arkitekten stiller spørsmål for å forstå hva du egentlig trenger.

**Hva du bør vite:**
- Du trenger ikke ha alle svarene klare. Vi hjelper deg med å finne dem.
- Det er bedre å si "jeg vet ikke" enn å gjette. Vi finner ut av det sammen.
- Ingenting er satt i stein ennå — dette er idéfasen.

**Resultat:** Et klart bilde av hva du skal bygge og hvorfor.

---

## FASE 2: PLANLEGG

**Kort forklaring:**
Vi bryter ned visjonen din i konkrete funksjoner og lager en plan. Hva skal appen gjøre? Hvem er brukerne? Hva er viktigst å bygge først?

**Analogi:** Som å lage en romplan for huset. Du bestemmer hvilke rom du trenger, hvor store de skal være, og hvilke du bygger først.

**Hva du bør vite:**
- Vi prioriterer funksjonene for deg: MÅ ha, BØR ha, KAN ha.
- Du bestemmer alltid ved tvil. AI foreslår, du godkjenner.
- Vi lager et "modulregister" — en liste over alle funksjoner du skal bygge.

**Resultat:** En komplett plan med funksjonsliste, prioriteringer og wireframes.

---

## FASE 3: ARKITEKTUR OG SIKKERHET

**Kort forklaring:**
Vi velger teknologien og sørger for at appen bygges på et trygt fundament. Hvilke verktøy bruker vi? Hvordan beskytter vi brukerdata?

**Analogi:** Som å velge byggematerialer og sørge for at huset har brannvarslere og gode låser før du begynner å bygge.

**Hva du bør vite:**
- Du trenger ikke forstå all teknologien. Vi forklarer valgene i klartekst.
- Sikkerhet er ikke valgfritt — det er innbygd fra starten.
- Valgene her påvirker resten av prosjektet, så vi tar oss tid.

**Resultat:** Tech stack-beslutninger, sikkerhetsplan, og arkitekturtegninger.

---

## FASE 4: MVP (MINIMUM VIABLE PRODUCT)

**Kort forklaring:**
Vi setter opp prosjektet og bygger den første fungerende versjonen. Ikke alt er med ennå — bare nok til at skjelettet står og grunnmuren er på plass.

**Analogi:** Som å reise veggene og legge taket. Huset er ikke innflyttingsklart, men strukturen er der.

**Hva du bør vite:**
- MVP-en ser kanskje ikke ferdig ut — det er meningen.
- Vi bygger fundamentet som resten skal stå på.
- Etter dette starter den store bygge-loopen (Fase 5).

**Resultat:** Et fungerende prosjekt med grunnleggende infrastruktur.

---

## FASE 5: BYGG FUNKSJONENE (LOOP)

> **⚠️ VIKTIG:** Denne fasen fungerer HELT ANNERLEDES enn alle andre faser.

**Kort forklaring:**
Du bygger én funksjon ferdig om gangen. Bygg → Test → Fiks feil → Poler → Godkjenn → Neste funksjon. Gjenta til alt er ferdig. Aldri flere funksjoner samtidig.

**Analogi:** Som å pusse opp et hus, ett rom om gangen. Du gjør ferdig stuen HELT — maling, gulv, lister, møbler — og sjekker at alt er perfekt FØR du starter på soverommet. Du maler ikke alle rommene halvveis.

**Hvorfor loop, ikke lineært?**
Fasene 1-4 var lineære: gjør oppgavene, gå videre. Fase 5 er en loop fordi:
- Én ferdig funksjon er bedre enn ti halvferdige
- AI-en holder bedre kvalitet når den fokuserer på én ting
- Feil oppdages og fikses med én gang, ikke etter at alt er bygd
- Du ser fremgang for hver funksjon som er ferdig

**De tre lagene i loopen:**
1. **Ytre loop (modul):** Plukk neste modul → Bygg ferdig → Godkjenn → Neste
2. **Midtre syklus (per modul):** Bygg → Test → Fiks → Poler → Godkjenn
3. **Indre loop (per underfunksjon):** Kode → Test → Review → Commit

**Kobling til BYGGER-agent:**
Fase 5 bruker BYGGER-agentens 3-trinns system:
- **Stage 1 (Kode)** = Bygg — AI skriver koden for funksjonen
- **Stage 2 (Kvalitet)** = Test — AI kjører tester, looksfor feil, sjekker kvalitetsstandard
- **Stage 3 (Polering)** = Poler — AI optimaliserer, rydder kode, forbedrer ytelse og UX

Hver midtre syklus gjennomgår alle tre stager for ONE funksjon før gjentagelsen starter.

**Hva du bør vite:**
- Du godkjenner HVER modul med "Go" (ferdig), "Mer arbeid" (fikse mer) eller "Blokkert" (hopp over, ta senere)
- Hvis du oppdager noe som hører til en annen modul, parkerer vi idéen uten å forstyrre nåværende arbeid
- Vi anbefaler ny sesjon mellom moduler for best kvalitet
- Fase 5 avsluttes IKKE før alle moduler har status "Done"

**Resultat:** Alle funksjoner ferdigbygd, testet og godkjent.

---

## FASE 6: TEST, SIKKERHET OG KVALITETSSJEKK

**Kort forklaring:**
Vi sjekker at alt fungerer sammen. Sikkerhetstesting, ytelsestesting, og en grundig gjennomgang av hele appen.

**Analogi:** Som en sluttkontroll av huset. Inspektøren sjekker elektrisk, rør, brannsikkerhet — alt må godkjennes før du flytter inn.

**Hva du bør vite:**
- Vi finner og fikser feil som bare dukker opp når alt kjører sammen
- Sikkerhetsjekk er obligatorisk — vi sjekker at brukerdata er trygg
- Denne fasen kan ta kortere eller lengre tid avhengig av hva vi finner

**Resultat:** En grundig testet, sikker app klar for lansering.

---

## FASE 7: PUBLISER OG VEDLIKEHOLD

**Kort forklaring:**
Appen publiseres til brukerne. Vi sørger for at den kjører stabilt og er klar for verden.

**Analogi:** Innflyttingsdag! Huset er ferdig, inspektøren har godkjent, og du åpner døren for gjestene.

**Hva du bør vite:**
- Vi hjelper med deployment (å få appen ut på nettet)
- Vi setter opp overvåking slik at du vet om noe går galt
- Etter lansering handler det om vedlikehold og forbedringer

**Resultat:** En live, fungerende app tilgjengelig for brukere.

---

## UNIVERSELLE PRINSIPPER FOR VIBEKODERE

### Kommunikasjonsregler for alle agenter:
1. **Aldri teknisk sjargong** uten forklaring i parentes
2. **Alltid gi kontekst** for hvorfor noe gjøres
3. **Bekreft forståelse** ved viktige beslutninger
4. **Vis fremgang** — vibekodere motiveres av synlig progresjon
5. **Ved tvil: spør brukeren** — det er bedre å spørre enn å gjette feil

### Typiske vibekoder-feller å forebygge:
- "Bygge alt samtidig" → Forklar loop-mønsteret tydelig
- "Hoppe over testing" → Forklar HVORFOR testing sparer tid
- "Bli overveldet av valg" → Gi tydelige anbefalinger med alternativ
- "Gi opp ved feil" → Normaliser at feil er del av prosessen
- "Scope creep" → Hold fokus, parkér nye idéer

---

*Versjon: 1.1.0*
*Opprettet: 2026-02-14*
*Oppdatert: 2026-02-16*
*Type: Extension (utvider alle prosess-agenter)*
*Navnekonvensjon: extension-* (se doc-NAVNEKONVENSJON.md)*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
