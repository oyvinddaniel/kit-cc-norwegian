# extension-STATUS-PAGE-SETUP v1.0

> Steg-for-steg oppskrift for å sette opp en offentlig status-side for produksjonsapper

**Kritiske regler:** Status-siden settes opp FØR første produksjonsdeploy. Abonnenter varsles automatisk — ikke manuelt.

---

## HENSIKT

Tenk på det som: et togstasjons-informasjonsboard — passasjerene ser selv status uten å ringe kundeservice.

En offentlig status-side viser driftsstatusen til tjenestene dine. Den reduserer support-henvendelser under incidents og bygger tillit hos betalende kunder.

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## VALGTRE: HVILKEN TJENESTE?

| Tjeneste | Pris | Anbefalt for |
|----------|------|--------------|
| **Statuspage.io** | $29/mnd | Anbefalt — Atlassian-produkt, bredt kjent, god Sentry-integrasjon |
| **Instatus** | $19/mnd | Enklere UI, lavere pris, fortsatt veldig god |
| **Uptime Kuma** | Gratis (self-hosted) | Hobbyprosjekter og interne verktøy — krever server |

**Anbefaling:** Statuspage.io for kundevendte SaaS. Instatus for lavere kostnad med full funksjonalitet.

---

## STATUSPAGE.IO — STEG-FOR-STEG

### Steg 1: Opprett konto
1. Gå til https://www.atlassian.com/software/statuspage
2. Klikk "Get Started Free" (gratis trial)
3. Opprett side med prosjektets navn

### Steg 2: Legg til komponenter
Legg til én komponent per kritisk tjeneste:
- "Webapplikasjon"
- "Database"
- "API"
- "Autentisering"

### Steg 3: Custom domain
Sett opp `status.[app].no` (eller `.com`):

1. Gå til **Settings → Custom Domain**
2. Kopier CNAME-verdi (format: `something.statuspage.io`)
3. Gå til din DNS-leverandør (Vercel Domains, Cloudflare, etc.)
4. Legg til CNAME-peker:
   ```
   Navn: status
   Type: CNAME
   Verdi: [det Statuspage.io gav deg]
   ```
5. Vent 5-30 minutter på DNS-propagering
6. Verifiser at `status.[app].no` viser status-siden din

### Steg 4: Abonnenter
1. Aktiver **Email subscribers** (standard)
2. Vurder **Slack subscribers** for team-intern varsling
3. Legg til subscription-widget på `[app].no/status`-lenke i footer

### Steg 5: Sentry-integrasjon
Auto-oppdater status-side ved error-spike:

1. I Statuspage.io: **Integrations → Sentry**
2. I Sentry: **Settings → Integrations → Statuspage**
3. Konfigurer: Når feilrate > X% på 5 min → sett komponent til "Degraded Performance"
4. Test med en manuell Sentry-alert

---

## INSTATUS — STEG-FOR-STEG

1. Gå til https://instatus.com og opprett konto
2. Opprett status-side med prosjektets navn
3. Legg til komponenter (samme som over)
4. Custom domain: Instatus-guide er i appen under Settings → Custom Domain
5. CNAME-peker fungerer identisk som Statuspage.io

---

## UPTIME KUMA — SELF-HOSTED

Krever en server (f.eks. en $5 DigitalOcean droplet):

```bash
# Docker-installasjon
docker run -d --restart=always -p 3001:3001 \
  -v uptime-kuma:/app/data \
  --name uptime-kuma louislam/uptime-kuma:1
```

Nå tilgjengelig på `http://[server-ip]:3001`.

---

## GUARDRAILS

### Gjør alltid
- Test varsling FØR produksjonsdeploy (trigger en manuell incident)
- Legg til `status.[app].no`-lenke i appens footer og README
- Sett opp minst én Slack-subscriber for intern varsling

### Ikke gjør
- Oppdater status manuelt under incidents — bruk Sentry-integrasjon
- Vis interne systemdetaljer på offentlig status-side

### Stopp og spør
- Hvis prosjektet ikke har betalende kunder ennå — Uptime Kuma er gratis og tilstrekkelig

---

## KRITISKE REGLER (gjentas)

Status-siden settes opp FØR første produksjonsdeploy. Abonnenter varsles automatisk — ikke manuelt.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
