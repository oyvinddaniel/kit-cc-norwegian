---
name: M:flervalg
version: 1.0
applies_to:
  paths: []
  contexts: [liste, tabell, kort-grid, filhåndtering, innboks]
last_reviewed: 2026-05-13
skip_if: listen tillater kun handlinger på enkeltelement
ekspert_trigger: [UIUX-ekspert, TILGJENGELIGHETS-ekspert]
---

# Mønster: Flervalg (bulk-handlinger)

> Brukes når brukeren kan gjøre samme handling på flere elementer samtidig.
>
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Bruker trenger å slette/arkivere/flytte/tagge flere items i én operasjon
- Innboks-, fil-, eller dokument-håndtering
- Admin-grensesnitt med batch-operasjoner
- E-handel: sammenligning eller flytting til ønskeliste

## Når brukes det IKKE

- Single-action-flyt (rediger ett item) → bruk M:detaljvisning
- Wizard med ett valg per steg → bruk M:skjema
- Lister hvor handlinger alltid gjelder hele settet → bruk knapp på toolbar

## Skip-regel

Mønsteret kan hoppes over hvis ALLE er sanne:
- Listen tillater kun handlinger på enkeltelement
- Det er ingen meningsfull batch-operasjon
- Brukerflyten skader ikke av single-handling

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Hvordan velges flere
- Avkrysningsboks på hvert element?
- Shift+klikk for område, Cmd/Ctrl+klikk for enkeltelementer?
- "Velg alle"-knapp (synlig side, eller hele datasettet)?
- Standardvalg: avkrysningsboks + shift+klikk + "Velg alle"

### Gruppe 2 — Synlighet og modus
- Avkrysningsbokser alltid synlige, eller kun i "velg"-modus?
- Mobil: trykk-og-hold for å gå i velg-modus?
- Hvordan vises at element er valgt (farge, ramme, sjekkmerke)?
- Synlig teller: "3 valgt" / "3 av 45"? Vises hvor?

### Gruppe 3 — Handlinger
- Hvilke bulk-handlinger er aktuelle (slett, arkiver, flytt, tagg, last ned, del)?
- Hvor vises de (toolbar øverst, flytende bar nederst, kontekst-meny)?
- Vises kun når noe er valgt?

### Gruppe 4 — Bekreftelse og angre
- Bekreftelse for destruktive handlinger ("Slette 23 opptak?") → se M:slett
- Vis antall i bekreftelsen
- Kan hele bulk-operasjonen angres som én enhet? → se M:angre
- Tidsvindu for angre?

### Gruppe 5 — Feilhåndtering
- Hva hvis noen feiler, men ikke alle?
- Rapport: "5 slettet, 2 feilet" — med detaljer per feilet element?
- Prøv-igjen-knapp for de som feilet?
- Progress-indikator for lange operasjoner?

### Gruppe 6 — Valg på tvers av kontekst
- Velger 3, filtrerer, velger 2 til — fremdeles 5 valgt?
- Velger på side 1, går til side 2 — fremdeles valgt?
- Hvordan fjernes valg (Escape, "Avbryt", klikk utenfor)? Auto etter handling?

---

## Tilstander (states)

- **Idle** — ingen valgt, bulk-toolbar skjult
- **Selecting** — ≥1 valgt, toolbar synlig med teller
- **Processing** — operasjon pågår, progress + disable nye valg
- **Partial success** — "5 slettet, 2 feilet" + retry-mulighet
- **Success** — bekreftelse + valg fjernet + fokus tilbake til liste

---

## Tilgjengelighet (WCAG 2.2)

Konsulter https://www.w3.org/WAI/WCAG22/quickref/:
- **4.1.3 Status Messages** — aria-live kunngjør "3 valgt" ved endring
- **1.3.1 Info and Relationships** — checkbox-rolle og aria-checked korrekt
- **2.1.1 Keyboard** [VERIFISER WCAG] — space toggler valg, shift+pil utvider område
- **2.4.7 Focus Visible** — tydelig fokus på checkboxer og bulk-knapper
- **3.3.4 Error Prevention** — bekreftelses-dialog for destruktive bulk-handlinger
- **2.5.5 Target Size** [VERIFISER WCAG] — checkboxer min 24×24px (mobil 44×44px)

Skjermleser må kunngjøre antall valgt ved hver endring og hvilke handlinger som er tilgjengelige.

---

## Kanttilfeller

- 0 valgt: bulk-handlinger disabled, ikke skjult midt i operasjon
- Velg alle på filtrert visning: gjelder kun synlige eller hele datasettet?
- Maks-grense: hva hvis bruker velger 10.000+ elementer?
- Element slettes/endres av annen bruker mens valgt
- Permission-denied på undermengde (kan slette 5 av 7)
- Nettverksfeil midt i bulk → noen utført, noen ikke
- Bruker navigerer bort med aktive valg → bekreftelses-prompt?
- Ctrl+A: velger alle synlige eller alle eksisterende?
- Idempotens: prøv-igjen må ikke dobbel-slette

---

## Anti-mønster

- ❌ Bulk-slett uten bekreftelse eller angre
- ❌ Miste valg ved sidebytte uten varsling
- ❌ "Velg alle" som tar minutter uten progress
- ❌ Stille feilet undermengde — bruker tror alt gikk bra
- ❌ Trykk-og-hold på mobil uten visuell forklaring

---

## Eksempler

**Eksempel 1: Innboks bulk-slett**
- Avkrysningsbokser alltid synlige; toolbar vises når ≥1 valgt
- "3 valgt | Slett | Arkiver | Merk som lest"; shift+klikk for område
- Slett → bekreftelse "Slette 3 e-poster?" → snackbar "3 slettet [Angre]"

**Eksempel 2: Fil-håndtering på mobil**
- Long-press for velg-modus; avkrysningsbokser dukker opp
- Flytende handlingsrad nederst: Flytt | Slett | Del
- Avbryt-X øverst, eller Escape (med tastatur)

---

## Relaterte mønstre

- M:liste — grunnmønsteret hvor flervalg lever
- M:filter-sortering — valg på tvers av filter-endringer
- M:slett / M:angre — bekreftelse og recovery etter bulk

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
