---
name: M:detaljvisning
version: 1.0
applies_to:
  paths: []
  contexts: [detaljvisning, detalj-side, sidepanel, drill-down, element-visning]
last_reviewed: 2026-05-13
skip_if: aldri (når brukeren borer ned i ett element, må mønsteret følges)
ekspert_trigger: [UIUX-ekspert]
---

# Mønster: Detaljvisning

> Brukes når brukeren borer ned i ett enkelt element for full info — som egen side, sidepanel, modal eller utvidet rad.
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Bruker klikker rad/kort i liste for å se mer
- Lenke peker til ett spesifikt element (permalink)
- Metadata, historikk eller relatert innhold må vises
- Brukeren skal kunne navigere forrige/neste

## Når brukes det IKKE

- Bekreftelse eller kort handling → bruk M:modal
- Lett redigering uten full kontekst → bruk M:inline-redigering
- Bare visning av én verdi → tooltip eller inline

## Skip-regel

Aldri — hver gang brukeren borer ned i ett element bør vurderingene tas.

---

## Sjekkliste — still ett spørsmål av gangen

### Gruppe 1 — Åpning og presentasjon
- Hvordan åpnes — klikk, lenke, navigering?
- Hvor vises — ny side, sidepanel, modal, utvidet rad?
- Standardvalg: ny side hvis rikt innhold; sidepanel hvis bruker hopper ofte

### Gruppe 2 — Innhold og layout
- Tittel / hovedidentifikator øverst?
- Seksjoner (beskrivelse, metadata, vedlegg, historikk)?
- Rekkefølge: viktigst øverst, metadata nederst

### Gruppe 3 — Handlinger
- Hvilke (rediger, slett, del, eksporter, duplikér)?
- Plassering: øverst-høyre, overflow-meny, flytende rad?
- Standardvalg: primær øverst-høyre, sekundære i overflow

### Gruppe 4 — Navigering
- Forrige/neste i listen? Breadcrumbs?
- Nettleserens tilbake-knapp må virke
- Standardvalg: breadcrumbs + historikk; forrige/neste hvis meningsfullt

### Gruppe 5 — Lasting
- Alt på en gang, eller progressivt (tittel → innhold → vedlegg)?
- Hva vises mens det laster (skeleton, spinner)?

### Gruppe 6 — Relatert, deling, redigering, versjonering
- Relatert innhold (referanser, avhengigheter)?
- Permalink / delings-URL? Offentlig vs. privat?
- Inline-redigering (se M:inline-redigering), eller "Rediger"-knapp?
- Versjoner / "sist endret av X, dato"?

---

## Tilstander (states)

- **Loading** — skeleton for tittel + seksjoner, eller spinner sentralt
- **Empty** — "Elementet finnes ikke / er slettet" + CTA tilbake
- **Error** — feilmelding med retry
- **Success** — innhold vises; subtil bekreftelse ved redigering
- **Disabled** — handlinger gråes ut hvis manglende tilgang, tooltip forklarer

---

## Tilgjengelighet (WCAG 2.2)

Konsulter https://www.w3.org/WAI/WCAG22/quickref/ for hvert:

- **1.3.1 Info and Relationships** — korrekt overskrifts-hierarki (h1 tittel, h2 seksjoner)
- **2.4.3 Focus Order** — fokus til tittel/hovedhandling ved åpning; returneres til trigger ved lukking av sidepanel/modal
- **2.4.6 Headings and Labels** — beskrivende og unike seksjons-overskrifter
- **2.4.7 Focus Visible** — synlig fokus-indikator
- **2.4.11 Focus Not Obscured (Minimum)** — sticky header/footer må ikke skjule fokuserte elementer (WCAG 2.2 nytt)
- **3.2.3 Consistent Navigation** — breadcrumbs/forrige-neste plasseres konsistent
- **4.1.2 Name, Role, Value** — sidepanel: `role="complementary"` eller `"dialog"` [VERIFISER WCAG]
- **4.1.3 Status Messages** — "Lagret", "Slettet", "Ikke funnet" via live region

---

## Kanttilfeller

- Element slettet mens bruker ser → varsle + tilbake
- Mister tilgang midt i → vis 403-tilstand
- Veldig stort innhold → lazy-load seksjoner
- Permalink til manglende element → 404 + CTA til liste/søk
- Nettverksfeil → retry-knapp, behold URL
- Forrige/neste på første/siste → deaktiver knappen
- Sidepanel på mobil → bli full skjerm
- Stale data → vis "Oppdater" når endring oppdages
- Anchor-deeplenking → scroll og fokuser seksjon

---

## Anti-mønster

- ❌ All info i én lang vegg uten seksjoner — vanskelig å scanne
- ❌ Handlinger spredt på mange steder — bruker leter
- ❌ Sidepanel som låser bakgrunn uten å være modal
- ❌ Mangler breadcrumb / vei tilbake
- ❌ Modal som detaljvisning for rikt innhold — for trangt
- ❌ URL endres ikke ved sidepanel-åpning — deling brytes

---

## Eksempler

**Eksempel 1: Oppgave-detalj (sidepanel)** — glir inn fra høyre, tittel + beskrivelse + metadata + kommentarer; inline-redigering; forrige/neste-pil; URL oppdateres.

**Eksempel 2: Artikkel (egen side)** — full side, H1 + ingress + kropp, metadata i sidekolonne, handlinger øverst-høyre, breadcrumb.

**Eksempel 3: Brukerprofil (modal)** — liten modal med kun visning, "Rediger" åpner egen side, Escape lukker.

---

## Relaterte mønstre

- [M:modal] — når detaljvisning vises som popup
- [M:inline-redigering] — for redigering i detaljvisning
- [M:slett] — for sletting fra detaljvisning
- [M:laste-tom-feil] — for lasting-tilstander

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
