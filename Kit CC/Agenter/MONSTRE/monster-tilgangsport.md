---
name: M:tilgangsport
version: 1.0
applies_to:
  paths: []
  contexts: [rolle-basert tilgang, RBAC, autorisasjon, multi-tenant]
last_reviewed: 2026-05-13
skip_if: alle brukere har identisk tilgang til alle ressurser (svært sjelden)
ekspert_trigger: [OWASP-ekspert, RLS-TESTER-ekspert]
---

# Mønster: Tilgangsport (roller og rettigheter)

> Brukes når bare noen brukere kan utføre en handling eller se data. Dekker UI-skjuling, serverside-validering og feilrespons.
>
> Tilpass alltid til situasjonen. Mønstre er sjekklister, ikke maler.

---

## Når brukes dette mønsteret

- Når en handling krever spesifikk rolle (admin, eier, medlem)
- Når data tilhører organisasjon, team eller individ
- Når deler av UI skal være skjult eller deaktivert
- Når API-endepunkt leser/skriver ressurser med eierskap
- Multi-tenant logikk

## Når brukes det IKKE

- Helt offentlige ressurser uten innlogging
- Ren autentisering uten rolle → bruk M:tilgangsport
- Skjema-validering → bruk M:skjema

## Skip-regel

Hopp over hvis ALLE er sanne:
- Bare én brukertype
- Ingen sensitiv eller eierskapsbasert data
- Ingen destruktive eller kostnadsbærende handlinger

(Vanligvis: aldri.)

---

## Sjekkliste — still ett spørsmål av gangen

### Gruppe 1 — Rollemodell og matrise
- Hvilke roller? (standard: eier + medlem + gjest)
- Globale eller per-ressurs?
- Hvilke handlinger får hver rolle? Lese vs. skrive vs. slette?

### Gruppe 2 — UI-strategi
- Skjul knapp (renest), deaktivert med tooltip (mest pedagogisk), eller egen admin-seksjon
- Standardvalg: skjul admin-only, deaktiver ellers

### Gruppe 3 — Respons ved direkte forsøk
- Modal, redirect + banner, eller dedikert 403-side
- Standardvalg: 403-side for navigering, modal for handling
- Begrunnelse: rollebeskrivelse + hvem kontakte + be-om-tilgang-knapp

### Gruppe 4 — Delegering og endringer
- Tilgang overføres? (eierbytte) Tidsbegrenset?
- Hva skjer ved organisasjons-exit?
- Varsel ved rolle-endring midt i sesjon? Re-validering per handling?

### Gruppe 5 — Sikkerhet vs. UX
- Serverside-validering på HVER mutasjon (aldri stol på UI)
- Klientside-skjul er kun UX
- Row-Level Security (RLS) ved multi-tenant

### Gruppe 6 — Logging
- Logg forsøk uten tilgang (se M:revisjonsspor)
- Varsle admin ved gjentatte forsøk? Rate-limiting på 403?

---

## Tilstander

- **Loading** — sjekker tilgang (skjelett, ikke avslør innhold)
- **Tilgang** — normal visning
- **Ingen tilgang (kjent rolle)** — forklarende melding + CTA
- **Ingen tilgang (anonym)** — innloggings-prompt
- **Tilgang utløpt midt i sesjon** — banner + redirect

---

## Tilgjengelighet (WCAG 2.2)

- 4.1.3 Status Messages — kunngjør "Ingen tilgang" via aria-live
- 3.3.1 Error Identification — tekstlig feilmelding, ikke kun farge
- 1.4.1 Use of Color — deaktiverte knapper trenger mer enn farge
- 2.4.6 Headings and Labels — 403-siden trenger tydelig overskrift

---

## Kanttilfeller

- Tilgang når siden laster, mistes før handling fullføres
- Cache-mismatch mellom faner
- Admin fjerner egen admin-rolle (skal forhindres)
- Siste eier prøver å forlate organisasjon
- Slettet bruker referert i delte ressurser
- Race: to admins endrer samme tilgang
- Token utløpt, men cachet UI viser admin-knapper

---

## Anti-mønster

- Kun klientside-sjekk — ALDRI tilstrekkelig
- "Security through obscurity" — skjult URL er ikke beskyttelse
- Generisk 403 uten forklaring
- Lekke info i feilmelding ("Bruker X eier denne")
- Hardkodet rolle-sjekk spredt — sentraliser i policy-lag

---

## Eksempler

**Multi-tenant SaaS:** Eier/admin/medlem/gjest. RLS i database. Admin-seksjon skjult for medlem/gjest.

**Personlig dokumentapp med deling:** Eier vs. delt-med. Delings-link med valgbar rolle. "Be om redigeringstilgang"-knapp.

---

## Relaterte mønstre

- M:revisjonsspor — logging av tilgangsendringer
- M:tilgangsport — forutsetning
- M:feilhandtering — 403-respons og recovery
- M:skjema — separat dimensjon (input)

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
