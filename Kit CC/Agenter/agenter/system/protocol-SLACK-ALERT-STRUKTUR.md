# protocol-SLACK-ALERT-STRUKTUR v1.0

> Standardisert kanalstruktur for Slack-varsling i produksjonskritiske apper

**Kritiske regler:** Ingen alarm sendes uten en lenke til relevant runbook eller dokumentasjon. Analytics-data blandes aldri med feil-varsler.

---

## HENSIKT

Tenk på det som: et godt designet kontrollrom — kritiske alarmer er aldri begravet i støy, og daglig review har sin egen kanal uten avbrudd.

Definerer kanal-hierarkiet for prosjekter med betalende brukere. Et godt Slack-oppsett gjør at team vet nøyaktig hvilke kanaler de skal sjekke i en krisesituasjon.

---

## 4-KANAL-STRUKTUR PER PROSJEKT

| Kanal | Formål | Pinger? | Oppdateres av |
|-------|--------|---------|---------------|
| `#[proj]-errors` | Kritiske feil (5xx, nedetid) | Alltid — @here | Sentry, GitHub Actions |
| `#[proj]-alerts` | Trenger gjennomgang i dag | Ingen ping | Monitoring, tester |
| `#[proj]-deploys` | Deploy-audit og statusendringer | Ingen ping | Vercel, GitHub Actions |
| `#[proj]-costs` | Daglig AI/infra-kostnadsrapport | Kun ved overskridelse | AI-COST-ALERTS (V1) |

**Erstatt `[proj]` med prosjektets kortnavn** (f.eks. `diedo`, `samiske`).

---

## FELLES OPS-KANALER (deles mellom prosjekter)

| Kanal | Formål | Brukes av |
|-------|--------|-----------|
| `#ops-critical` | Kritiske hendelser på tvers av alle prosjekter | Alle `#[proj]-errors` eskalerer hit |
| `#ops-costs` | Kostnadsoversikt på tvers av prosjekter | Alle prosjekter over threshold |

---

## EPHEMERE INCIDENT-KANALER

Opprett midlertidig kanal for pågående incidents:

Format: `#inc-[dato]-[tema]`

Eksempler:
- `#inc-20260419-db-outage`
- `#inc-20260419-rls-failure`

Arkiver kanalen etter post-mortem er publisert (typisk 48-72 timer etter løsning).

---

## ANALYTICS-KANAL

PostHog og analyseverktøy poster til separat kanal:

| Kanal | Formål |
|-------|--------|
| `#[proj]-analytics` | Konverteringer, funnels, A/B-resultater |

Analytics blandes **aldri** med feil-varsler. Begrunnelse: analytics-støy kan skjule kritiske feil.

---

## EKSEMPEL SLACK-MELDINGER

### #[proj]-errors (kritisk)
```
🔴 KRITISK FEIL — 08:42
Feil: TypeError: Cannot read property 'id' of undefined
URL: /api/checkout
Sentry: [lenke]
Runbook: [lenke til relevant runbook i disaster-runbooks/]

Antall brukere påvirket: ~150/t
```

### #[proj]-alerts (dag-review)
```
⚠️ Ytelsesadvarsel — 07:00
Lighthouse score: 68 (-12 vs. baseline)
Komponent: /checkout
CI-run: [lenke]

Ingen akutt handling nødvendig — gjennomgå i dag.
```

### #[proj]-deploys (audit)
```
✅ Deploy — 14:23
Branch: feat/new-checkout
Commit: abc1234
Miljø: production
Vercel: [lenke]
Deployet av: [bruker]
```

### #[proj]-costs (daglig)
```
AI-kostnadsrapport — 2026-04-19
Prosjekt: min-app

Anthropic: $4.20 (NOK 44)
Totalt: NOK 44 (under terskel NOK 500)
```

---

## REGEL: INGEN ALARM UTEN RUNBOOK-LENKE

Enhver Sentry-alert eller GitHub Actions-varsling til `#[proj]-errors` skal inkludere:
1. Kort beskrivelse av feilen
2. Lenke til Sentry-event
3. Lenke til relevant runbook (fra `templates/disaster-runbooks/`)

Mangler runbook-lenken → reduser alarm til `#[proj]-alerts` i stedet.

---

## GUARDRAILS

### Gjør alltid
- Opprett alle 4 prosjekt-kanaler FØR første deploy
- Test at Sentry-webhooks treffer rett kanal
- Legg alltid runbook-lenke i `#errors`-varsler

### Ikke gjør
- Miks analytics og feil-varsler i samme kanal
- Send @here i `#alerts` (kun i `#errors` og `#ops-critical`)

### Stopp og spør
- Hvis prosjektet ikke har et Slack-workspace — vurder alternativ (e-post, PagerDuty)

---

## KRITISKE REGLER (gjentas)

Ingen alarm sendes uten en lenke til relevant runbook eller dokumentasjon. Analytics-data blandes aldri med feil-varsler.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
