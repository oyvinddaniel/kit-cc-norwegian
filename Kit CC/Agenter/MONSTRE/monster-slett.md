---
name: M:slett
version: 1.0
applies_to:
  paths: []
  contexts: [slett-knapp, slett-flyt, destruktiv-handling, kaskade-sletting, myk-sletting]
last_reviewed: 2026-05-13
skip_if: aldri (alle slett-flater må vurderes mot dette)
ekspert_trigger: [SIKKERHETS-agent, TEST-GENERATOR-ekspert]
---

# Mønster: Slett

> Brukes når en funksjon lar brukeren slette noe (rad, fil, kontakt, opptak, konto, kommentar).
>
> Tilpass alltid. Å slette et opptak er ikke det samme som å slette en kommentar.

---

## Når brukes dette mønsteret

- Når en handling fjerner data fra brukerens synsfelt eller systemet
- Når en handling reduserer rettigheter (fjerne medlem, tilbakekalle deling)
- Når en handling er destruktiv selv om "delete" ikke står på knappen (tøm, fjern, avslutt, lukk konto)

## Når brukes det IKKE

- Skjul/filtrer som ikke endrer underliggende data → ingen mønster nødvendig
- Lukke en modal eller dialog → ikke destruktivt
- Logge ut → bruker M:tilgangsport eller eget mønster

## Skip-regel

Aldri. Selv "trivielle" slettinger trenger eksplisitt vurdering av bekreftelse + angre.

---

## Sjekkliste — still bruker ett spørsmål av gangen

### Gruppe 1 — Inngang til sletting
- Hvor klikker brukeren? (ikonknapp, høyreklikkmeny, meny, sveip på mobil, flervalg-toolbar)
- Tastatursnarvei? (Del, Cmd+Backspace) — kun hvis fokuset er entydig
- Fra hvilke steder kan man slette? (liste, detaljside, flervalg)
- Standardvalg hvis bruker ikke vet: ikon-knapp på rad + flervalg fra liste

### Gruppe 2 — Bekreftelse (avhenger av reversibilitet)
- Ingen bekreftelse → KUN hvis fullt reversibel via angre (M:angre)
- Enkel modal "er du sikker?" → standard for synlig destruktiv handling
- Skriv inn navn-bekreftelse → kun for kritisk uomgjørelig (slett prosjekt, slett konto)
- Begrunnelse: hvorfor dette nivået og ikke et annet?

### Gruppe 3 — Effekt
- Forsvinner umiddelbart, eller markeres som slettet (myk sletting)?
- Hvor lenge til permanent? (24t, 30 dager, aldri)
- Hva med tilknyttet data? (kaskade, foreldreløs, blokker sletting hvis referert)

### Gruppe 4 — Tilgang og logg
- Hvem kan slette? (eier, admin, skrivetilgang, samme som kan opprette)
- Logges sletting? (hvem, hva, når) — påkrevd hvis persondata (GDPR)
- GDPR: er dette personopplysninger? → krever sletting også fra backup-rutine

### Gruppe 5 — Tilbakemelding og angre
- Tilbakemelding: stille / toast / banner / lyd
- Tilbys angre? (sterkt anbefalt) — hvor lenge? Se M:angre
- Hvor i UI vises angre-tilbudet?

---

## Tilstander (states)

- **Idle** — slett-knapp synlig, ikke trykket
- **Confirming** — modal/dialog åpen, fokus på "Avbryt" som default
- **Pending** — request sendt, knapp disabled, spinner
- **Success** — element borte fra UI, angre-toast vises (hvis aktivert)
- **Error** — feilmelding nær handlingen, element fortsatt synlig, retry mulig
- **Conflict** — element ble endret/slettet av annen bruker → vis status og oppdater UI

---

## Tilgjengelighet (WCAG 2.2)

- 2.5.2 Pointer Cancellation — slett-trigger må kunne avbrytes ved å dra bort før release
- 2.5.8 Target Size (Minimum) — slett-ikon ≥ 24×24 CSS-piksler
- 2.4.7 Focus Visible — fokus på bekreftelsesknapp må være synlig
- 4.1.3 Status Messages — "Slettet" / feil må kunngjøres til skjermleser (aria-live)
- 3.3.4 Error Prevention (Legal, Financial, Data) — bekreftelse/angre/verifikasjon påkrevd for uomgjørelige slettinger

Marker som `[VERIFISER WCAG]` hvis kontekst er uvanlig.

---

## Kanttilfeller

- Elementet er allerede slettet av en annen bruker → vis 404/gone, oppdater liste
- Nettverksfeil under sletting → element fortsatt synlig, retry-knapp
- Permission-denied (403) → forklar hvorfor, ikke bare "feil"
- Race: bruker trykker slett to ganger raskt → debounce + idempotent backend
- Element referert av annet data → blokker eller kaskade (eksplisitt valg)
- Slett alt / bulk-delete → krever ekstra bekreftelse (antall)
- Backup/audit-log må bevares selv etter "permanent" sletting (juridisk)
- Stale cache: andre faner viser fortsatt elementet → invalidér via realtime/refetch

---

## Anti-mønster

- ❌ Slett uten bekreftelse OG uten angre — uomgjørelig tap er forutsigbart
- ❌ "Er du sikker?" som default-fokus på "Slett" — fokus skal være på "Avbryt"
- ❌ Slette-knapp samme farge/posisjon som primær-handling — øker feilklikk
- ❌ Toast-melding "Slettet" uten angre når sletting er reversibel
- ❌ Hard-delete persondata uten logg (GDPR-brudd) eller med logg som beholder dataen (også brudd)

---

## Eksempler

**Eksempel 1: Slett kommentar i feed**
- Ikon-knapp (kebab-meny) → "Slett"
- Ingen modal, fjernes umiddelbart
- Angre-toast 10 sek
- Soft-delete i DB i 24t, deretter permanent

**Eksempel 2: Slett prosjekt med alle data**
- Knapp i innstillinger
- Modal med "Skriv prosjektnavnet for å bekrefte"
- Kaskade-sletter alle relasjoner
- Logger handling, sender e-postbekreftelse til eier

**Eksempel 3: Slett konto (GDPR-rett til sletting)**
- Egen flyt, ikke kun en knapp
- Identitetsbekreftelse + 14-dagers grace period
- Audit-log beholdes hashet, persondata fjernes fra backup på neste rotasjon

---

## Relaterte mønstre

- M:angre — slett uten angre er sjelden riktig
- M:skjema — for bekreftelsesinput (skriv-navn-bekreftelse)
- M:flervalg — for flervalg-sletting

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
