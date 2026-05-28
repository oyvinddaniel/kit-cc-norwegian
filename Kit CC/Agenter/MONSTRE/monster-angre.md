---
name: M:angre
version: 1.0
applies_to:
  paths: []
  contexts: [angre, undo, slett, arkivering, masseendring, destruktiv-handling]
last_reviewed: 2026-05-13
skip_if: handlingen er trivielt reversibel uten state-tap OG bagatellmessig
ekspert_trigger: [SIKKERHETS-agent, UIUX-ekspert]
---

# Mønster: Angre

> Brukes for destruktive eller endrende handlinger som bør kunne angres.
>
> Tilpass alltid. Et 5-sekunders angre-toast er ikke det samme som en 30-dagers søppelbøtte.

---

## Når brukes dette mønsteret

- Sletting (jf. M:slett)
- Arkivering / flytting / skjuling
- Masseendring (bulk-edit, bulk-move)
- Skjema-tilbakestilling til siste lagring
- Drag-and-drop som endrer rekkefølge eller eierskap

## Når brukes det IKKE

- Read-only visninger → ingen endring å angre
- Handlinger med eksplisitt bekreftelse OG ingen feilrisiko (sjelden) → angre kan utelates
- Live-typing i skjema → bruk M:skjema sin dirty-state

## Skip-regel

Kan hoppes over hvis ALLE er sanne:
- Handlingen er bagatellmessig (ikke tap av data eller relasjoner)
- Handlingen er trivielt re-utførbar av brukeren selv
- Det finnes ingen kaskade-effekter

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Omfang
- Hva kan angres? (sletting, flytting, masseendring, skjema-endring)
- Hvilke handlinger har ingen angre? (eksplisitt liste — brukeren skal vite)

### Gruppe 2 — Tidsvindu
- 5 sek — lette handlinger (arkiver, skjul)
- 10-30 sek — synlig destruktiv (slett fra liste)
- Dager-tilbake via søppelbøtte — myk sletting
- Standardvalg: 10 sek toast + 30 dagers søppelbøtte for myk-slettbare ting

### Gruppe 3 — UI-presentasjon
- Toast med "Angre"-knapp (vanligst)
- Banner med nedtelling
- Notifikasjons-historikk (for lengre vindu)
- Søppelbøtte-visning (for permanent recoverable)
- Tastatursnarvei Cmd/Ctrl+Z hvor det gir mening (kun ved fokus i relevant kontekst)

### Gruppe 4 — Hva gjenopprettes
- Selve elementet — ja
- Tilknyttet data — ja/nei (eksplisitt valg)
- Rekkefølge / posisjon i liste
- Relasjoner til andre elementer
- Permissions / delinger

### Gruppe 5 — Tilstandskonflikter
- Noen annen har endret data i mellomtiden → vis konflikt, ikke overskrive blindt
- Elementet er referert av noe nytt → vis varsel, tilby valg
- Brukeren slettet det igjen → no-op, ikke feilmeld

### Gruppe 6 — Kaskade og bulk
- Hvis 5 ting ble slettet samtidig — angre alle eller én og én?
- Standardvalg: alle samtidig (omvendt av handlingen som ble utført)

### Gruppe 7 — Logg og sporing
- Logges angre-handlinger? (anbefalt: ja, for audit)
- Hvem angret hva når?

---

## Tilstander (states)

- **Available** — angre-tilbudet er synlig (toast/banner/knapp)
- **Counting down** — tidsvinduet teller ned, visuelt tydelig
- **Restoring** — angre trykket, request pågår, vis spinner
- **Restored** — element tilbake, bekreftelse vises
- **Expired** — vinduet løp ut, angre fjernet
- **Conflict** — gjenoppretting blokkert (slettet permanent / endret av annen)
- **Error** — gjenoppretting feilet, vis hvorfor + retry

---

## Tilgjengelighet (WCAG 2.2)

- 4.1.3 Status Messages — "Slettet. Angre tilgjengelig i 10 sekunder" kunngjøres via aria-live (polite)
- 2.2.1 Timing Adjustable — gi mulighet til å forlenge/pause tidsvinduet, eller minimum 20 sek default
- 2.4.7 Focus Visible — angre-knapp må ha synlig fokus
- 2.5.8 Target Size — angre-knapp ≥ 24×24 CSS-piksler
- 2.1.1 Keyboard — angre må være tilgjengelig via tastatur (Tab + Enter, eller global snarvei)

Marker som `[VERIFISER WCAG]` hvis tidsvinduet er kortere enn 20 sek uten justering.

---

## Kanttilfeller

- Nettverksfeil under angre → behold tilbudet aktivt, retry
- Bruker lukker nettleser før vindu er ute → state må persisteres server-side hvis kritisk
- Angre på tvers av sesjoner → krever søppelbøtte-modell
- Angre-vindu utløper mens brukeren leser → vurder pause-on-hover
- Flere angre-tilbud samtidig → stable toasts eller én sammenslått (kontekstavhengig)
- Bruker trykker Cmd+Z i feil kontekst → ikke utfør destruktiv ny handling utilsiktet
- Angre etter sidereload → kun mulig hvis server-persistert (soft-delete)
- Permission endret i mellomtiden → blokker gjenoppretting med tydelig grunn

---

## Anti-mønster

- ❌ Toast som forsvinner mens brukeren prøver å klikke — for kort vindu uten pause-on-hover
- ❌ Ingen visuell nedtelling — brukeren vet ikke når det er for sent
- ❌ Angre som silent feiler — må alltid gi feedback
- ❌ Cmd+Z globalt for destruktive operasjoner uten kontekst — kan trigge utilsiktet
- ❌ Soft-delete uten cleanup-rutine — DB vokser uendelig
- ❌ Angre uten audit-log — sikkerhetsbrudd hvis misbrukt

---

## Eksempler

**Slett e-post i innboks:** toast "Flyttet til papirkurv. Angre" i 10 sek, pause-on-hover, deretter tilgjengelig i papirkurv i 30 dager.

**Bulk-arkiver 25 oppgaver:** banner med nedtelling 20 sek + "Angre alle", restore plasserer alle tilbake i opprinnelig rekkefølge, konflikt-dialog hvis én ble endret.

**Slett konto (uomgjørelig):** INGEN inline-angre, 14-dagers grace period med innlogging = avbryt, etter 14 dager permanent (audit-log beholdes).

---

## Relaterte mønstre

- M:slett — angre er ofte parret med slett
- M:skjema — dirty/reset er en form for angre
- M:flervalg — bulk-handlinger trenger alltid angre

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
