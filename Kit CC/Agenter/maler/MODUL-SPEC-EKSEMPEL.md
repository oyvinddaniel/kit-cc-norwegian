---
id: M-007
navn: Eksport-funksjon
beskrivelse: Brukere kan eksportere sin data til CSV eller PDF
mvp: Ja
status: Pending
prioritet: BØR
avhenger: [M-003]
estimat: M
opprettet: 2026-05-13
sist_oppdatert: 2026-05-13
brukerord_kilder: [BRU:S2]
---

# M-007 — Eksport-funksjon (KOMPLETT EKSEMPEL)

> Referanse-eksempel for MODUL-SPEC-MAL.md seksjon 3.5. Viser hvordan PLANLEGGER PLAN-modus fyller inn mikrodetaljer (nivå 4) for en realistisk modul.

## 1. Identifikasjon

- **Modul-ID:** M-007
- **MVP:** Ja
- **Prioritet:** BØR
- **Avhenger av:** M-003 (Brukerdata og listestruktur)
- **Estimat:** M (3-5 dager)

## 2. Brukerens visjon

> "Jeg vil at brukerne kan eksportere alt de har laget — listene, kommentarene, bildene — til en fil de kan ta med seg. CSV for de tekniske, PDF for de andre." — BRU:S2

## 3. Underfunksjoner

### U7-1 — Eksporter til CSV

Bruker velger "Eksporter som CSV" og får download-fil med all sin data i kommaseparert format.

**Akseptansekriterier:**
- **GIVEN** bruker har minst én liste **WHEN** de trykker "Eksporter CSV" **THEN** nedlasting starter innen 3 sekunder
- **GIVEN** tom konto **WHEN** bruker trykker "Eksporter CSV" **THEN** vises melding "Ingen data å eksportere"
- **GIVEN** eksport feiler på server **WHEN** bruker ser feilmelding **THEN** vises retry-knapp med tydelig årsak

### U7-2 — Eksporter til PDF

Bruker velger "Eksporter som PDF" og får download-fil med formatert PDF inkludert bilder og typografi.

**Akseptansekriterier:**
- **GIVEN** bruker har data **WHEN** de trykker "Eksporter PDF" **THEN** PDF genereres med korrekt sidebrekk innen 10 sekunder
- **GIVEN** bruker har bilder i data **WHEN** PDF genereres **THEN** bilder inkluderes i original-oppløsning, maks 300 DPI
- **GIVEN** PDF >50MB **WHEN** generering starter **THEN** bruker varsles og kan avbryte

## 3.5 Mikrodetaljer per underfunksjon

### U7-1 — Eksporter til CSV

| # | Mikrodetalj | Status | Mønster | Begrunnelse |
|---|---|---|---|---|
| 1 | "Eksporter CSV"-knapp øverst i listevisningen | 🟢 | M:liste | Synlig affordance, ikke skjult i meny |
| 2 | Tooltip "Last ned som regneark (CSV)" på hover/focus | 🟢 | M:tilgjengelighet | WCAG 3.3.2 Labels or Instructions |
| 3 | Loading-spinner mens generering pågår | 🟢 | M:tilstander | Tilstand: loading må vises <100ms |
| 4 | Hvis estimert >3 sek: vis progress-bar med % | 🟢 | M:tilstander | Bruker venter ikke i blinde |
| 5 | Filnavn-format: "[appnavn]-eksport-YYYY-MM-DD.csv" | 🟢 | — | Forutsigbart, sorterbart i filsystem |
| 6 | UTF-8 BOM (0xEF 0xBB 0xBF) først i fil | 🟢 | M:kanttilfeller | Excel feiler på Æ/Ø/Å uten BOM |
| 7 | Komma vs semikolon basert på brukerens locale | 🟢 | M:internasjonalisering | NO/SE/DE bruker semikolon i Excel |
| 8 | Kolonner alltid i samme rekkefølge per versjon | 🟢 | — | Konsistent output for skript |
| 9 | Tomme felter → tom streng, ikke "null" eller "NaN" | 🟢 | M:kanttilfeller | Kompatibel m/regneark-import |
| 10 | Linjeskift i celler → escaped med dobbel-quote | 🟢 | M:kanttilfeller | RFC 4180-kompatibel CSV |
| 11 | Hvis eksport feiler: vis spesifikk feilmelding | 🟢 | M:feilhandtering | Recovery-action mulig |
| 12 | Retry-knapp i feiltilstand | 🟢 | M:feilhandtering | Bruker kan prøve igjen uten reload |
| 13 | Toast "CSV lastet ned (X rader)" når ferdig | 🟢 | M:tilbakemelding | Bekreftelse med konkret info |
| 14 | 403 Forbidden hvis ikke-eier prøver eksportere | 🟢 | M:tilgangsport | Server-side validering, ikke kun UI |
| 15 | Audit-log: "[brukerID] eksporterte CSV [tidsstempel] [N rader]" | 🟢 | M:revisjonsspor | GDPR Art. 30 register over behandling |
| 16 | Tastatur-tilgjengelig: Tab → Enter trigger eksport | 🟢 | M:tilgjengelighet | WCAG 2.1.1 Keyboard |
| 17 | Synlig focus-ring på knapp (≥3:1 kontrast) | 🟢 | M:tilgjengelighet | WCAG 2.4.7 Focus Visible |
| 18 | Mobil: trykk-område minst 44x44 px (iOS HIG / WCAG 2.5.8) | 🟢 | M:mobil-beroring | WCAG 2.5.8 Target Size Minimum |
| 19 | Offline: knapp deaktiveres med tekst "Ikke tilgjengelig offline" | 🟢 | M:offline | Tydelig årsak, ikke stille svikt |
| 20 | Kantfall: 0 data → empty state med tekst "Ingen data å eksportere" | 🟢 | M:laste-tom-feil | Tom-tilstand, ikke tom CSV |
| 21 | Kantfall: bruker eksporterer mens noen redigerer → snapshot ved start | 🟢 | M:kanttilfeller | Konsistent øyeblikksbilde |
| 22 | RTL-bruker (arabisk/hebraisk) får riktig kolonne-orientering | 🟢 | M:internasjonalisering | Kun for RTL-locales |
| 23 | Skjermleser annonserer "Eksport ferdig, fil lastet ned" via aria-live | 🟢 | M:tilgjengelighet | WCAG 4.1.3 Status Messages |
| 24 | Ingen tids-grense på operasjonen fra UI-side | 🟢 | M:tilgjengelighet | WCAG 2.2.1 Timing Adjustable |

**Coverage U7-1:** 24 mikrodetaljer. Obligatoriske dekket: M:tilstander, M:tilgjengelighet, M:kanttilfeller. Mobil dekket: M:mobil-beroring. Bonus: M:offline, M:feilhandtering, M:tilgangsport, M:revisjonsspor, M:internasjonalisering, M:tilbakemelding, M:liste, M:laste-tom-feil.

### U7-2 — Eksporter til PDF

| # | Mikrodetalj | Status | Mønster | Begrunnelse |
|---|---|---|---|---|
| 1 | "Eksporter PDF"-knapp ved siden av CSV-knapp | 🟢 | M:liste | Konsistent plassering |
| 2 | Tooltip "Last ned som PDF (egnet for utskrift)" | 🟢 | M:tilgjengelighet | WCAG 3.3.2 |
| 3 | Loading-spinner + estimert tid (PDF tar lengre enn CSV) | 🟢 | M:tilstander | Brukerens mental modell |
| 4 | Progress-indikator: "Side X av Y" mens generering | 🟢 | M:tilstander | Konkret fremdrift |
| 5 | Filnavn: "[appnavn]-eksport-YYYY-MM-DD.pdf" | 🟢 | — | Konsistent med CSV |
| 6 | Sidetall i footer på hver side | 🟢 | — | Standard PDF-konvensjon |
| 7 | Bilder embeddes i original-oppløsning (maks 300 DPI) | 🟢 | M:kanttilfeller | Balanse kvalitet vs filstørrelse |
| 8 | Hvis >50MB: vis advarsel med "Avbryt"-knapp | 🟢 | M:kanttilfeller | Bruker kan velge bort |
| 9 | Sidebrekk respekterer overskrifter (orphan/widow control) | 🟢 | — | Lesbarhet |
| 10 | Hvis generering feiler: spesifikk feilmelding + retry | 🟢 | M:feilhandtering | Recovery |
| 11 | Toast "PDF lastet ned (X sider)" når ferdig | 🟢 | M:tilbakemelding | Bekreftelse |
| 12 | 403 hvis ikke-eier prøver | 🟢 | M:tilgangsport | Server-validering |
| 13 | Audit-log entry per generering | 🟢 | M:revisjonsspor | GDPR Art. 30 |
| 14 | Tastatur-tilgjengelig (Tab + Enter) | 🟢 | M:tilgjengelighet | WCAG 2.1.1 |
| 15 | Synlig focus-ring (≥3:1 kontrast) | 🟢 | M:tilgjengelighet | WCAG 2.4.7 |
| 16 | Mobil: trykk-område 44x44 px | 🟢 | M:mobil-beroring | WCAG 2.5.8 |
| 17 | Offline: knapp deaktivert med årsak | 🟢 | M:offline | Tydelig state |
| 18 | Kantfall: 0 data → empty state, ingen PDF genereres | 🟢 | M:laste-tom-feil | Konsistent med CSV |
| 19 | PDF-metadata: tittel, forfatter, opprettelses-dato | 🟢 | — | Søkbart i filsystem |
| 20 | aria-live annonserer "PDF ferdig generert" | 🟢 | M:tilgjengelighet | WCAG 4.1.3 |

**Coverage U7-2:** 20 mikrodetaljer. Obligatoriske dekket: M:tilstander, M:tilgjengelighet, M:kanttilfeller. Mobil dekket: M:mobil-beroring.

## 4. Avhengigheter

- **M-003 (Brukerdata):** Eksport leser fra samme data-modell. Endring i M-003 schema krever oppdatering av kolonne-mapping her.
- **Backend:** Trenger endpoint `POST /api/export/{format}` som returnerer signert nedlastings-URL (gyldig 5 min).
- **Tredjepart:** PDF-generering bruker `pdf-lib` (MIT-lisens, verifisert i Fase 3 sikkerhetsgjennomgang).

## 5. Tekniske notater

- **Generering:** Server-side for både CSV og PDF. Ikke klient-side — for stor risiko for memory-issues på mobil og inkonsistens mellom enheter.
- **Streaming:** CSV streames (gzip) for filer >5MB. PDF buffres helt før respons (pdf-lib krever det).
- **Caching:** Ikke cache eksport-output. Hver request = ny snapshot. Cache-Control: no-store.
- **Rate-limit:** Maks 10 eksporter per bruker per time (audit-log + serverressurs-vern).
- **Sikkerhet:** Signert URL inneholder bruker-ID + utløp. Ingen direkte fil-tilgang.

## 6. Byggnotater

*Tomt — fylles inn av ITERASJONS-agent under Fase 5.*

## 7. Validerings-sjekkliste

- [ ] 1. YAML frontmatter komplett med alle obligatoriske felter
- [ ] 2. Brukerens visjon sitert ordrett med BRU:SN-referanse
- [ ] 3. Minst én underfunksjon definert
- [ ] 4. Hver underfunksjon har GIVEN-WHEN-THEN akseptansekriterier
- [ ] 5. Akseptansekriterier er testbare (ikke vage)
- [ ] 6. Seksjon 3.5 inneholder mikrodetalj-tabell per underfunksjon
- [ ] 7. Minst 10 mikrodetaljer per underfunksjon
- [ ] 8. M:tilstander dekket i hver underfunksjon
- [ ] 9. M:tilgjengelighet dekket i hver underfunksjon
- [ ] 10. M:kanttilfeller dekket i hver underfunksjon
- [ ] 11. M:mobil-beroring dekket (hvis modul har mobil-UI)
- [ ] 12. WCAG-referanser eksplisitte og presise (2.1.1, 2.4.7, 2.5.8 osv.)
- [ ] 13. Status-koder konsistente (🟢/🔵/⚪/⊘)
- [ ] 14. Avhengigheter listet med M-ID
- [ ] 15. Tekniske notater inkluderer sikkerhets- og ytelses-hensyn
- [ ] 16. Audit-log/GDPR-vurdering inkludert hvis behandling av persondata
- [ ] 17. Offline-tilstand spesifisert
- [ ] 18. Kantfall: tom data, feil, rettighet
- [ ] 19. Coverage-summering ved slutten av hver tabell

## 8. Vedlegg: Råe notater

*Tomt enda.*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
