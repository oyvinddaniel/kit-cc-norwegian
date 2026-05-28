---
name: M:inline-redigering
version: 1.0
applies_to:
  paths: []
  contexts: [inline-edit, redigering, click-to-edit, in-place-edit, liste-redigering]
last_reviewed: 2026-05-13
skip_if: aldri (når inline-redigering først brukes, må mønsteret følges)
ekspert_trigger: [UIUX-ekspert, TILGJENGELIGHETS-ekspert]
---

# Mønster: Redigering direkte i listen (inline)

> Brukes når redigering skjer på stedet uten å navigere til egen side eller åpne popup.
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Enkle felter endres ofte (tittel, status, prioritet, dato)
- Bruker skal kunne redigere flere elementer raskt etter hverandre
- Omkringliggende kontekst er viktig for redigeringen
- Åpning av skjema eller modal hadde brutt flyten

## Når brukes det IKKE

- Skjema med mange felter → egen side eller M:modal
- Kompleks kryss-felt-validering → skjema-side
- Endringer som påvirker mange objekter → skjema med forhåndsvisning
- Mobil med små målflater → vurder M:modal

## Skip-regel

Aldri — hvis inline-redigering brukes, MÅ tilgjengelighet og lagre/avbryt-logikk være korrekt.

---

## Sjekkliste — still ett spørsmål av gangen

### Gruppe 1 — Omfang
- Hvilke felter inline (tittel, status, dato, kort tekst)?
- Hvilke åpner skjema/modal (lang tekst, mange felter, kompleks validering)?
- Standardvalg: one-liners inline; alt annet i skjema

### Gruppe 2 — Trigger
- Enkeltklikk, dobbeltklikk, eller blyant-ikon ved hover?
- Standardvalg: enkeltklikk + tydelig hover-indikator

### Gruppe 3 — Visuell skille
- Hvordan vises redigerbart (hover-ramme, ikon)?
- Hvordan vises aktiv redigering (full ramme, fokus-ring)?
- Hvordan vises ikke-redigerbart (statisk, ingen hover)?

### Gruppe 4 — Lagring
- Enter lagrer? Escape avbryter alltid
- Klikk utenfor: lagre eller avbryt? (avklar én policy)
- Auto-lagre etter inaktivitet?
- Standardvalg: Enter lagrer, Escape avbryter, klikk-utenfor lagrer hvis gyldig

### Gruppe 5 — Validering og feedback
- Feil inline under feltet? Blokkering til feil er rettet?
- Subtil bekreftelse ved lagring (kort farge-pulsering)?
- Ingen popup-bokser (bryter flyten)

### Gruppe 6 — Konkurranse og mobil
- To brukere redigerer samme felt — siste vinner eller konflikt-varsel?
- Standardvalg: optimistisk UI + varsel ved server-konflikt
- Mobil: fungerer det, eller åpne skjema/modal?

---

## Tilstander (states)

- **Loading** — felt deaktivert med spinner ved lagring
- **Empty** — placeholder "Klikk for å legge til..."
- **Error** — rød ramme + feilmelding under; gammel verdi beholdes
- **Success** — kort subtil farge-pulsering (200-300ms)
- **Disabled** — grå tekst, ingen hover, tooltip "Du har ikke tilgang"
- **Editing** — tydelig ramme/fokus-ring

---

## Tilgjengelighet (WCAG 2.2)

Konsulter https://www.w3.org/WAI/WCAG22/quickref/ for hvert:

- **1.3.1 Info and Relationships** — felt har `<label>` eller `aria-label`
- **2.1.1 Keyboard** — start redigering via tastatur (Enter/Space)
- **2.4.3 Focus Order** — fokus til input ved aktivering; returnert til visning ved lagre/avbryt
- **2.4.7 Focus Visible** — synlig fokus både i visning og redigering
- **2.4.11 Focus Not Obscured (Minimum)** — virtuelt tastatur/sticky header må ikke skjule aktivt felt (WCAG 2.2 nytt)
- **3.2.2 On Input** — endring trigger ikke kontekstbytte
- **3.3.1 Error Identification** — valideringsfeil knyttes til felt med `aria-describedby`
- **3.3.3 Error Suggestion** — gi forslag til rettelse
- **4.1.2 Name, Role, Value** — riktig rolle for redigerbar tekst; bytte vises via `aria-readonly` eller element-bytte
- **4.1.3 Status Messages** — "Lagret"/"Feil" via live region uten å flytte fokus

---

## Kanttilfeller

- Listen oppdateres under redigering → behold redigeringstilstand
- Element slettes av andre → varsle + behold endringer
- Lang tekst overflyter rad → utvid eller scroll
- Bruker navigerer bort med åpen redigering → advarsel
- Nettverksfeil ved lagring → behold modus, vis retry
- Race: Enter mens server lagret → idempotent håndtering
- Virtuelt tastatur dekker felt → auto-scroll i syne
- Mister tilgang midt i → blokker lagring, melding
- Tom verdi sendes → er det gyldig, eller bruk gammel?

---

## Anti-mønster

- ❌ Klikk-utenfor avbryter UTEN advarsel ved ugyldig — datatap
- ❌ Popup-bekreftelse for hver inline-endring — bryter flyten
- ❌ Ingen visuell antydning om at noe er redigerbart
- ❌ Lagre KUN via knapp — bryter Enter-flow
- ❌ Skjuler feil i kortvarig toast — bruker mister informasjon
- ❌ Tab tar bruker ut av rad i stedet for neste felt
- ❌ Inline-redigering på mobil for små målflater

---

## Eksempler

**Eksempel 1: Tittel i oppgaveliste** — klikk → input med fokus + markert tekst; Enter lagrer, Escape avbryter; grønn pulsering ved lagring; tom verdi avvises.

**Eksempel 2: Status-dropdown i tabell** — klikk på status-pill → dropdown; valg lagres umiddelbart; live region kunngjør "Status endret til Ferdig".

**Eksempel 3: Pris-felt** — klikk → tallinput; validering ≥ 0; klikk utenfor lagrer hvis gyldig, ellers hold fokus med feil.

---

## Relaterte mønstre

- [M:modal] — alternativ for komplekse skjemaer
- [M:detaljvisning] — hvor inline-redigering ofte brukes
- [M:laste-tom-feil] — for lagre-tilstander

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
