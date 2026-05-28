---
name: M:onboarding
version: 1.0
applies_to:
  paths: []
  contexts: [forste-bruk, tom-tilstand, empty-state, guided-tour, welcome-flyt, first-run]
last_reviewed: 2026-05-13
skip_if: eksisterende bruker med data eller har eksplisitt hoppet over tidligere
ekspert_trigger: [UIUX-ekspert, BRUKERTEST-ekspert]
---

# Mønster: Onboarding (første-bruk)

> Brukes når ny bruker møter applikasjonen for første gang, eller når område er helt tomt og krever innledende handling.
>
> Mål: rask time-to-value uten å overvelde. Inspirert av Notion (tom-tilstand med maler), Linear (3-stegs onboarding), Slack (velkomstmeldinger).

---

## Når brukes dette mønsteret

- Helt nytt prosjekt eller første innlogging (ingen data)
- Tom hoved-visning (ingen oppgaver, prosjekter, filer)
- Nytt funksjonsområde lansert (feature-discovery)
- Bruker har slettet all data og er tilbake i tom tilstand
- Invitert bruker som åpner delt ressurs første gang

## Når brukes det IKKE

- Eksisterende bruker med data → normal hovedvisning
- Bruker som har hoppet over → respekter valget
- Power-user-flater (admin, dev tools) → forventer dok
- Påloggings-/registreringsside → bruker M:tilgangsport
- Tomme tilstander pga. filter → M:tilbakemelding

## Skip-regel

Hopp over hvis ALLE er sanne: bruker har tidligere fullført/hoppet over (lagret i preferanser), det finnes data i visningen, funksjonen er ikke ny.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Trigger og scope
- Trigger: første pålogging, første gang i område, ny feature
- Lagring i bruker-preferanser i DB (ikke kun localStorage — sync på tvers av enheter)
- Standardvalg: ved første pålogging + tom hoved-visning

### Gruppe 2 — Tom-tilstand (alltid)
- Skal alltid finnes (selv om tour hoppes over)
- Kort illustrasjon, én forklarende setning, én tydelig CTA mot enkleste verdi-handling
- Sekundær lenke: "Lær mer" / "Importér data" / "Se eksempel"

### Gruppe 3 — Guided tour (valgfri)
- Form: tooltip-overlay, modal-sekvens eller side-panel
- Maks 3-5 steg (mer = bruker mister fokus)
- Hopp over-knapp og lukk (X) alltid synlig
- Standardvalg: 3-stegs progressiv onboarding med hopp over

### Gruppe 4 — Første-verdi-handling
- Hva gir raskest "aha"-opplevelse? (Notion: mal på 1 klikk. Linear: 3 demo-oppgaver)
- Anbefaling: tilby "Last inn eksempeldata", verdi innen 60 sek

### Gruppe 5 — Progresjon og avhopp
- Indikator: "Steg 1 av 3" eller prikker, tilbake-knapp tilgjengelig
- Hopp over lagres (ikke vis igjen automatisk), tour kan startes på nytt fra hjelp-meny
- Tom tilstand etter sletting: vis tom-tilstand, IKKE tour igjen

### Gruppe 6 — Mobil og tastatur
- Mobil: swipe + synlige neste/forrige-knapper, touch ≥ 44×44 px
- Tastatur: Tab/Enter/Space/Escape (Escape lagrer som hoppet over)
- Skjermleser: hvert steg har riktig overskriftshierarki

---

## Tilstander (states)

- **Empty** — ingen data, tom-tilstand med CTA og illustrasjon
- **First-time** — aldri sett onboarding, vis tour/velkomst
- **In-progress** — midt i tour (steg N av M)
- **Skipped/Completed** — lagret i preferanser, normal/tom-tilstand
- **Returning-empty** — har sett tour, tilbake i tom tilstand → kun tom-tilstand-CTA

---

## Tilgjengelighet (WCAG 2.2)

- 2.4.1 Bypass Blocks — bruker må kunne hoppe over onboarding helt
- 2.4.6 Headings and Labels — hvert steg har tydelig overskrift
- 1.3.1 Info and Relationships — progresjon kommuniseres semantisk (aria-current, role="progressbar")
- 2.1.1 Keyboard — alle steg navigerbare (Tab, Enter, Esc, piler)
- 2.4.3 Focus Order — fokus flyttes logisk til neste steg
- 4.1.2 Name, Role, Value — modal har `role="dialog"` og `aria-labelledby`
- 2.4.11 Focus Not Obscured — overlay må ikke skjule fokuserte elementer

`[VERIFISER WCAG]` for 2.4.11 hvis overlay-tour bruker pekepiler/highlights — sjekk fokus-synlighet.

---

## Kanttilfeller

- Ny enhet → onboarding IKKE igjen (preferanse synced via DB)
- Lukker app midt i tour → lagre fremdrift eller start på nytt (definer)
- Bytter språk midt i tour → re-render uten å miste fremdrift
- Slow network → tekst-fallback for bilder/video, ikke blokker
- JS deaktivert / screen reader → tom-tilstand med CTA fungerer uten tour
- "Ny" bruker med importert data → hopp over tom-tilstand
- Fullført tour men sletter alt → tom-tilstand, ikke tour igjen
- Tour refererer UI som er endret → versjonering eller hold tour stabil

---

## Anti-mønster

- ❌ Tvungen onboarding uten hopp over (bryter 2.4.1)
- ❌ Mer enn 5 steg — bruker mister motivasjon
- ❌ Tom-tilstand uten CTA ("Ingen oppgaver" og ingenting mer)
- ❌ Full tour hver gang tom tilstand oppstår
- ❌ Onboarding som blokkerer hovedfunksjonalitet (modal som ikke kan lukkes)
- ❌ "Hoppet over" lagret kun i localStorage (vises på nytt på annen enhet)
- ❌ Progresjon vist, men ikke mulig å gå tilbake

---

## Eksempler

**Linear-stil onboarding:**
- 3 steg: "Opprett team" → "Opprett prosjekt" → "Inviter teammedlemmer"
- Hopp over alltid synlig, demo-oppgaver lastes inn etterpå

**Notion-stil tom tilstand:**
- "Trykk + for å starte, eller velg en mal" + mal-galleri som CTA
- Ingen tour — bruker lærer ved å gjøre

**Feature-discovery:**
- Ny feature → tooltip én gang ved første relevante visning
- "Ny: AI-forslag" med "Prøv nå" og "Lukk" (lukk lagrer)

---

## Relaterte mønstre

- M:tilbakemelding — bekreftelse av fullført onboarding-steg
- M:modal — hvis onboarding bruker modal-overlay
- M:skjema — første-bruker-skjema (navn, preferanser)
- M:tilgangsport — registrering/pålogging før onboarding

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
