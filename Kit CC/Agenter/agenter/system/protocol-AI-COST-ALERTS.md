# protocol-AI-COST-ALERTS v1.0

> Konfigurerbart rammeverk for daglig AI-kostnadsvarsling via GitHub Actions

**Kritiske regler:** Alle API-nøkler lagres i GitHub Secrets — aldri i ai-cost-config.json eller workflow-filen. Terskler settes per prosjekt, ikke universelt.

---

## HENSIKT

Tenk på det som: en strømmåler med SMS-varsling — du vet nøyaktig hva som brukes før regningen kommer.

Daglig GitHub Actions-cron som henter AI-API-kostnader, konverterer til NOK og poster til Slack. Konfigureres per prosjekt via `ai-cost-config.json`.

---

## KONFIGURASJONSFIL

Opprett `ai-cost-config.json` i prosjektroten:

```json
{
  "currency": "NOK",
  "exchangeRateUSD": 10.5,
  "slackChannel": "#[proj]-costs",
  "alertChannel": "#ops-costs",
  "dailyThresholdNOK": 500,
  "weeklyThresholdNOK": 2000,
  "services": [
    {
      "name": "Anthropic",
      "enabled": true,
      "usageEndpoint": "https://api.anthropic.com/v1/usage",
      "authHeader": "x-api-key",
      "envVar": "ANTHROPIC_API_KEY"
    },
    {
      "name": "OpenAI",
      "enabled": false,
      "usageEndpoint": "https://api.openai.com/v1/usage",
      "authHeader": "Authorization",
      "envVar": "OPENAI_API_KEY"
    }
  ]
}
```

---

## GITHUB ACTIONS WORKFLOW

Opprett `.github/workflows/ai-cost-daily.yml`:

```yaml
name: AI Cost Daily Report
on:
  schedule:
    - cron: '0 7 * * *'  # 08:00 norsk tid (UTC+1)
  workflow_dispatch:

jobs:
  cost-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Fetch og rapporter AI-kostnader
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          SLACK_COST_WEBHOOK: ${{ secrets.SLACK_COST_WEBHOOK }}
        run: |
          node scripts/ai-cost-report.js
```

---

## RAPPORTSKRIPT

Opprett `scripts/ai-cost-report.js`:

```javascript
const fs = require('fs');
const https = require('https');

const config = JSON.parse(fs.readFileSync('ai-cost-config.json', 'utf-8'));

async function fetchCost(service) {
  // Hent kostnad fra konfigurerte tjenester
  // Implementasjon varierer per tjeneste-API
  return { name: service.name, usd: 0, nok: 0 };
}

async function main() {
  const results = [];
  for (const service of config.services.filter(s => s.enabled)) {
    const cost = await fetchCost(service);
    results.push(cost);
  }
  
  const totalNOK = results.reduce((sum, r) => sum + r.nok, 0);
  const isOverThreshold = totalNOK > config.dailyThresholdNOK;
  
  const message = {
    text: formatSlackMessage(results, totalNOK, isOverThreshold)
  };
  
  // Post til Slack
  const channel = isOverThreshold ? config.alertChannel : config.slackChannel;
  await postToSlack(channel, message);
  
  // Lagre til logg for Monitor
  fs.writeFileSync('.ai/AI-COST-LOG.json', JSON.stringify({
    date: new Date().toISOString(),
    results,
    totalNOK,
    threshold: config.dailyThresholdNOK
  }));
}

main().catch(console.error);
```

---

## SLACK-FORMAT

```
AI-kostnadsrapport — 2026-04-19
Prosjekt: min-app

Anthropic:     $4.20 (NOK 44)
Totalt i dag:  NOK 44
Trend:         stabil

Detaljer: [GitHub Actions Run]
```

Ved overskridelse av `dailyThresholdNOK`:
- Post til `alertChannel` (#ops-costs) med @here

---

## GUARDRAILS

### Gjør alltid
- Konfigurer tjenester per prosjekt i ai-cost-config.json
- Sett terskler som er realistiske for prosjektets volum
- Lagre kostnadslogg til `.ai/AI-COST-LOG.json` for Monitor (N3)

### Ikke gjør
- Hardkod API-nøkler i workflow-filen eller ai-cost-config.json
- Bruk universelle terskler for alle prosjekter

### Stopp og spør
- Hvis Slack-webhook ikke er satt opp — spør bruker om kanal-navn

---

## KRITISKE REGLER (gjentas)

Alle API-nøkler lagres i GitHub Secrets — aldri i ai-cost-config.json eller workflow-filen. Terskler settes per prosjekt, ikke universelt.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
