---
name: M:tilbakemelding
version: 1.0
applies_to:
  paths: []
  contexts: ["alle handlinger som endrer tilstand", "skjema-innsending", "sletting", "lagring", "deling"]
last_reviewed: 2026-05-13
skip_if: handlingen er triviell og selvforklarende (f.eks. veksle av/på med synlig endring)
ekspert_trigger: [UIUX-ekspert, GORGEOUS-UI-ekspert]
---

# Mønster: Tilbakemelding til bruker

> Brukes når en funksjon bekrefter at en handling er utført. Uten tilbakemelding
> lurer brukeren på om noe faktisk skjedde — og prøver ofte igjen.

---

## Når brukes dette mønsteret

- Bruker trykker en knapp som endrer tilstand (lagre, slett, send, del)
- Skjema sendes inn
- Bakgrunnsoppgave fullføres (eksport, opplasting)
- Innstilling endres
- Asynkron operasjon avsluttes

## Når brukes det IKKE

- Triviell veksling med umiddelbar synlig endring → ingen tilbakemelding trengs
- Navigasjon mellom sider → sideskiftet er tilbakemeldingen
- Tekstinput-feltet endres → kun validering ved blur, ikke per tegn

## Skip-regel

Mønsteret kan hoppes over hvis ALLE disse er sanne:
- Handlingens resultat er umiddelbart og åpenbart synlig
- Det finnes ingen risiko for at brukeren tror handlingen feilet
- Handlingen er reversibel uten kost

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Form på tilbakemelding
- Toast (boble i hjørnet) — for vellykkede handlinger? Standardvalg.
- Banner øverst — for viktigere meldinger som må sees?
- Inline (ved selve handlingen) — f.eks. hake ved send-knappen?
- Modal — kun for kritiske bekreftelser?
- Lyd eller haptikk (mobil) — kun med bruker-samtykke?

### Gruppe 2 — Innhold
- Kort og handlingsorientert: "Opptak slettet" (ikke "Operasjonen var vellykket")
- Forklar i menneskespråk hva som skjedde
- Tilby angre-handling hvis relevant (se M:angre)
- Inkluder lenke til detaljer hvis nyttig

### Gruppe 3 — Varighet og plassering
- Toast: 3-5 sek (suksess), 8-10 sek (feil), permanent (krever handling)
- Banner: til bruker lukker eller ny handling
- Inline: 2-3 sek, så fade
- Plassering: nederst-høyre (web), øverst (mobil), aldri over hovedinnhold

### Gruppe 4 — Flere samtidig
- Stable (nyeste øverst)?
- Erstatte (kun én synlig)?
- Gruppere lignende ("3 opptak slettet")? Standardvalg når >2 samme type.

### Gruppe 5 — Farge og ikon
- Suksess: grønt, hake
- Info: blått, "i"
- Advarsel: gult/oransje, triangel
- Feil: rødt, kryss
- Aldri kun farge — alltid også ikon og tekst (WCAG 1.4.1)

---

## Tilstander (states)

- **Loading** — vis spinner i knappen mens handling pågår; disable knappen
- **Success** — tilbakemelding + foreslå neste-steg (f.eks. "Opptak lagret. Del nå?")
- **Error** — tydelig feilmelding + recovery-action (se M:laste-tom-feil)
- **Disabled** — knapp grået ut + tooltip med hvorfor

---

## Tilgjengelighet (WCAG 2.2)

- **4.1.3 Status Messages** — tilbakemelding må kunngjøres til skjermleser via `aria-live="polite"` (suksess) eller `aria-live="assertive"` (feil)
- **1.4.1 Use of Color** — aldri kun farge; alltid ikon + tekst
- **2.2.1 Timing Adjustable** — toast-varighet må kunne forlenges av bruker eller pauses
- **2.3.3 Animation from Interactions** — respekter `prefers-reduced-motion`

---

## Kanttilfeller

- Handlingen tok lang tid — vis kontekst: "Slettet (for 5 min siden)"
- Bruker navigerte bort før tilbakemelding kom → lagre i notifikasjonsarkiv
- Samme handling spammes raskt → debounce, vis kun én gruppert melding
- Offline-tilstand → tilbakemelding må reflektere at handling er køet, ikke utført
- Tilbakemelding kommer etter bruker har angret → ikke vis
- Skjermleser-bruker → ikke autodismiss kritiske meldinger

---

## Anti-mønster

- Generisk tekst: "Operasjonen var vellykket" → bruk konkret hva
- Modal for triviell suksess → invaderende, brukeren må klikke bort
- Kun farge som indikator → bryter WCAG 1.4.1
- Auto-dismiss feilmeldinger på 2 sek → bruker rekker ikke lese
- Stable opp 10 toasts → grupper i stedet
- Mangler angre når handling er destruktiv → bruker mister tillit

---

## Eksempler

**Eksempel 1: Slett opptak**
- Toast nederst-høyre: "Opptak slettet"
- Inkluderer "Angre"-knapp (synlig i 8 sek)
- Aria-live="polite" til skjermleser
- Hvis 3 slettet raskt: "3 opptak slettet — Angre alle"

**Eksempel 2: Skjema-innsending feiler**
- Inline feilmelding ved felt som feilet
- Banner øverst med oppsummering: "Kunne ikke sende. Sjekk feltene markert i rødt."
- Aria-live="assertive"
- Send-knappen reaktiveres så bruker kan prøve igjen

**Eksempel 3: Eksport ferdig (bakgrunn)**
- Toast: "Eksport ferdig — [Last ned]"
- Persistent til bruker klikker
- Notifikasjons-prikk i menyen hvis bruker navigerte bort

---

## Relaterte mønstre

- [M:tilstander] — overordnet UI-tilstandshåndtering (obligatorisk)
- [M:laste-tom-feil] — feilmelding ved mislykket handling
- [M:angre] — angre-handling i tilbakemelding

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
