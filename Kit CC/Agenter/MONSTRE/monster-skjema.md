---
name: M:skjema
version: 1.0
applies_to:
  paths: []
  contexts: [skjema, form, input, registrering, redigering, innstillinger, sjekkout]
last_reviewed: 2026-05-13
skip_if: aldri (alle skjemaer trenger vurdering av validering + tilgjengelighet)
ekspert_trigger: [TEST-GENERATOR-ekspert, TILGJENGELIGHETS-ekspert]
---

# Mønster: Skjema

> Brukes når en funksjon lar brukeren fylle inn felter og sende (opprette, redigere, registrere, sende inn).
>
> Tilpass alltid. Et 3-felts kontaktskjema er ikke det samme som et 20-felts sjekkout-skjema.

---

## Når brukes dette mønsteret

- Brukeren skriver inn data som lagres (opprett, rediger)
- Innstillinger / preferanser
- Sjekkout, betaling, registrering, innlogging
- Søkefelt med avanserte filtre

## Når brukes det IKKE

- Enkel toggle / switch uten input → ingen mønster
- Read-only visning → bruk M:detaljvisning
- Søk med ett felt og live-resultater → bruk M:filter-sortering (hvis finnes)

## Skip-regel

Aldri. Selv et felt med ett input trenger validering, label og feilhåndtering.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Felter og struktur
- Hvilke felter trengs? (list dem)
- Påkrevd vs. valgfri — marker valgfri eksplisitt (ikke kun *)
- Rekkefølge: viktigst / mest gjenkjent først, logisk flyt
- Over 10 felter? → vurder steg-for-steg eller seksjoner
- Standardvalg: gruppér i logiske seksjoner ved 5+ felter

### Gruppe 2 — Validering
- Når valideres? (on-blur for format, on-submit for helhet, on-change kun for sterk feedback som passord-styrke)
- Regler per felt: format, lengde, påkrevd, unik (server)
- Visning av feil: inline under felt (alltid) + summary øverst ved submit-feil
- Alltid både klient- og server-validering — klient er UX, server er sannhet

### Gruppe 3 — Lagring og navigasjon
- Autolagring eller eksplisitt submit?
- Hva ved navigering bort med usaved endringer? (advarsel via beforeunload + intern guard)
- Utkast: lever hvor lenge? hvor lagres (server, localStorage)?
- Redigering vs. ny: samme skjema eller ulike? dirty-indikator?

### Gruppe 4 — Send-handlingen
- Knappetekst: handlingsverb ("Opprett konto", "Lagre endringer") — ikke "Send"/"OK"
- Når aktiveres? (alltid + valider on-submit er ofte bedre enn permanent disabled)
- Mens vi sender: spinner + disabled + uendret bredde (unngå layout-shift)
- Etter suksess: hvor går brukeren? hva sees?

### Gruppe 5 — Tilgjengelighet og mobil
- Tab-rekkefølge følger visuell rekkefølge
- `<label for>` korrekt koblet til hvert input
- Skjermleser leser feil (aria-describedby på input)
- Autofocus første felt KUN på dedikert side, ikke i modal
- Mobil: riktig `inputmode`/`type` (email, tel, numeric, url)
- Felter og knapper minst 24×24 px

### Gruppe 6 — Feil ved send
- Nettverksfeil → behold inputdata, vis retry
- Server-validering → map feltvis hvor mulig + summary
- Timeout → ikke send på nytt automatisk (idempotens-risiko)
- Redundant Entry: ikke be brukeren skrive samme info to ganger i samme flyt

---

## Tilstander (states)

- **Idle** — skjema klart, første felt fokusert (kun ved dedikert side)
- **Editing** — bruker skriver, ingen feil vist før blur
- **Validating** — async-validering (f.eks. unik e-post) — vis subtil spinner
- **Invalid** — feil vist inline + summary ved submit-forsøk
- **Submitting** — knapp disabled, spinner, felter låst
- **Success** — bekreftelse + neste-steg (redirect, toast, eller bli)
- **Error (submit)** — feilmelding nær knapp, data bevart, retry mulig

---

## Tilgjengelighet (WCAG 2.2)

- 3.3.1 Error Identification — feil identifiseres i tekst, ikke kun farge
- 3.3.2 Labels or Instructions — alle felter har label/instruksjon
- 3.3.3 Error Suggestion — gi forslag til retting når mulig
- 3.3.4 Error Prevention (Legal, Financial, Data) — bekreftelse/angre/verifikasjon for juridiske/finansielle skjemaer
- 3.3.7 Redundant Entry (WCAG 2.2) — ikke krev re-inntasting av info som allerede er gitt i samme sesjon
- 4.1.3 Status Messages — submit-status (success/error) kunngjøres via aria-live
- 2.4.7 Focus Visible — fokus alltid synlig
- 2.5.8 Target Size — knapper/checkboxer ≥ 24×24 CSS-piksler
- 1.3.5 Identify Input Purpose — bruk `autocomplete`-attributter

---

## Kanttilfeller

- Bruker trykker submit to ganger raskt → debounce + idempotens
- Veldig lang input (paste fra Word) → maxlength + sanering
- Spesialtegn, emoji, unicode → test eksplisitt
- Kopier-lim med usynlige tegn (zero-width) → trim/normaliser
- Brutt nettverk midt i submit → behold state, retry
- Bruker har autofyll på → ikke overstyr `autocomplete=off` uten god grunn
- Stale form: bruker hadde skjemaet åpent i timer, server-state endret → konflikt-håndtering
- Skjema i modal vs. egen side: ulike fokus-regler

---

## Anti-mønster

- ❌ Submit-knapp permanent disabled til alt er gyldig — bruker forstår ikke hvorfor
- ❌ Valider on-change for alle felter — feil dukker opp før brukeren er ferdig å skrive
- ❌ Kun rød ramme uten tekstmelding — bryter 3.3.1
- ❌ "Send"/"OK" som knappetekst — uinformativt
- ❌ Resette skjema ved server-feil — bruker mister alt
- ❌ `placeholder` som label — forsvinner ved skriving, dårlig for skjermleser

---

## Eksempler

**Kontaktskjema (3 felter):** valider on-blur, submit aktiverer alltid + valider på klikk, suksess → toast + reset.

**Registrering med passord:** e-post async unique on-blur, passord med live styrke-indikator (on-change OK her), server-validering → redirect til onboarding.

**Innstillinger med autolagring:** hvert felt lagres on-blur via PATCH, subtil "Lagret"-indikator per felt, ingen submit-knapp.

---

## Relaterte mønstre

- M:feilhandtering — dypere regler hvis kompleks
- M:angre — for skjemaer med stor endring
- M:tilgangsport — registrering/innlogging-spesifikt

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
