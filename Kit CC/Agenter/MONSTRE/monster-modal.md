---
name: M:modal
version: 1.0
applies_to:
  paths: []
  contexts: [modal, popup, dialog, bekreftelse, overlay]
last_reviewed: 2026-05-13
skip_if: aldri (når modal først brukes, må mønsteret følges)
ekspert_trigger: [UIUX-ekspert, TILGJENGELIGHETS-ekspert]
---

# Mønster: Popup-boks midt på skjermen (modal)

> Brukes når en funksjon åpner en popup-boks som tar over fokus og krever bruker-handling.
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Handling krever eksplisitt bekreftelse (sletting, irreversibelt)
- Kort skjema må fylles ut uten å forlate konteksten
- Kritisk feil eller advarsel må stoppe flyten
- Blokkerende beslutning før bruker kan fortsette

## Når brukes det IKKE

- Ikke-blokkerende melding → bruk M:tilbakemelding eller inline
- Lengre skjema → egen side eller sidepanel
- Lett redigering av enkelt-felt → bruk M:inline-redigering
- Info uten respons-krav → tooltip eller M:detaljvisning

## Skip-regel

Aldri — hvis modal brukes, MÅ mønsteret følges (særlig fokus-felle og Escape).

---

## Sjekkliste — still ett spørsmål av gangen

### Gruppe 1 — Åpning og kontekst
- Hva trigger åpning (klikk, automatisk, feil)?
- Kun én modal om gangen, eller stables?
- Standardvalg: kun én modal om gangen

### Gruppe 2 — Visuell presentasjon
- Animasjon (fade, slide, ingen)? Overlay-mørkning?
- Størrelse — fast, responsiv, full skjerm på mobil?
- Standardvalg: fade-in 150-200ms, overlay 50%, responsiv

### Gruppe 3 — Innhold og handlinger
- Tittel (kort, handlingsorientert)?
- Primær (rød hvis destruktiv) og sekundær knapp?
- Rekkefølge: primær til høyre på web, venstre på iOS

### Gruppe 4 — Lukking
- Hvilke lukkemåter — X, Avbryt, klikk utenfor, Escape?
- Standardvalg: alle fire, MEN destruktive lukkes IKKE på klikk-utenfor

### Gruppe 5 — Etter bekreftelse
- Lukker og utfører, eller bytter innhold (flertrinns)?
- Suksess-melding først, eller umiddelbar lukking?

---

## Tilstander (states)

- **Loading** — knapper låses, spinner i primærknapp
- **Error** — feilmelding i modalen, primærknapp aktiv igjen, fokus til feilmelding
- **Success** — kort bekreftelse (inline eller toast etter lukking)
- **Disabled** — primærknapp grå hvis ugyldig, tooltip forklarer

---

## Tilgjengelighet (WCAG 2.2)

Konsulter https://www.w3.org/WAI/WCAG22/quickref/ for hvert:

- **2.1.2 No Keyboard Trap** — fokus holdes INNENFOR modalen til lukking (focus trap)
- **2.4.3 Focus Order** — fokus til første interaktive element/tittel ved åpning; returneres til trigger ved lukking
- **2.4.7 Focus Visible** — synlig fokus-indikator på alle interaktive elementer
- **2.4.11 Focus Not Obscured (Minimum)** — fokuserte elementer skal ikke skjules av overlay (WCAG 2.2 nytt)
- **2.4.12 Focus Not Obscured (Enhanced)** — fokus FULLT synlig [VERIFISER WCAG] (AAA)
- **4.1.2 Name, Role, Value** — `role="dialog"` eller `"alertdialog"`, `aria-modal="true"`, `aria-labelledby` til tittel
- **4.1.3 Status Messages** — feil/status i modalen kunngjøres via live region uten å flytte fokus

---

## Kanttilfeller

- Lukking med ulagrede endringer → "Forkast endringer?"
- Nettverksfeil under sending → vis feil i modalen, ikke lukk
- Sesjon utløper → re-autentisering eller lukk pent
- Permission-denied (403) → vis årsak, ingen retry
- Stablede modaler → subtil hierarki, Escape lukker øverste først
- Tastatur skjuler primærknapp på mobil → scrollbar innhold + sticky knapper
- Veldig langt innhold → scrollbart innhold, faste header/footer
- Race: modal lukkes av annen handling → vis varsel

---

## Anti-mønster

- ❌ Auto-popup uten brukerhandling — bryter flyt
- ❌ Modal uten Escape-støtte — bryter 2.1.2
- ❌ Destruktiv primærknapp UTEN rød farge eller bekreftelse — farlig
- ❌ Destruktiv lukkes på klikk-utenfor — utilsiktet
- ❌ Modal uten focus trap — fokus drifter ut
- ❌ Modal i stedet for inline for enkle felter — overkill

---

## Eksempler

**Eksempel 1: Bekreft sletting** — "Slett prosjekt?", rød primær "Slett", "Avbryt"; klikk-utenfor lukker IKKE; `role="alertdialog"`; fokus til "Avbryt".

**Eksempel 2: Opprett element (kort skjema)** — 2-4 felter, fokus til første felt, Enter sender hvis gyldig, loading-state på primærknapp.

**Eksempel 3: Velg fra liste** — søkefelt + scrollbar liste, klikk velger og lukker, Escape lukker uten valg.

---

## Relaterte mønstre

- [M:inline-redigering] — alternativ for enkle felt
- [M:detaljvisning] — alternativ for visning uten redigering
- [M:slett] — bekreftelses-modal for sletting

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
