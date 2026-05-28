# protocol-INTEGRATIONS-SCHEMA.md — SSOT for integrasjoner og leverandørvalg

> **Versjon:** 1.0.0
> **Type:** Protokoll (SSOT — Single Source of Truth)
> **Lag:** 2 (Skrivebordsskuff — lastes on-demand av prosess-agenter)
> **Erstatter:** Implisitt integrasjonsregistrering spredt i PROJECT-STATE.json

---

## FORMÅL

Definerer strukturen for `integrations.confirmed[]` i PROJECT-STATE.json, slik at alle faser som arbeider med integrasjoner (ARKITEKTUR, MVP, ITERASJONS, KVALITETSSIKRINGS) bruker samme skjema og kan kommunisere konsistent.

**Integrasjoner** = Tjenester utenfor prosjektet som systemet er avhengig av (Stripe, Google Auth, Supabase, etc.)

---

## INTEGRASJONSTYPER

| Type | Eksempler | Fase innført | Kritisk |
|------|-----------|-------------|---------|
| `auth` | Google Auth, GitHub Auth, Auth0 | Fase 2 (krav) | Ofte |
| `payment` | Stripe, Vipps, PayPal | Fase 2 (krav) | Hvis transaksjoner |
| `database` | Supabase, Firebase, PostgreSQL, MongoDB | Fase 3 (arkitektur) | Alltid |
| `storage` | AWS S3, Google Cloud Storage, Supabase Storage | Fase 2-3 (krav → arkitektur) | Hvis filer |
| `email` | Resend, SendGrid, Mailgun | Fase 2 (krav) | Hvis e-post |
| `sms` | Twilio, Vonage | Fase 2 (krav) | Hvis SMS |
| `maps` | Google Maps, Mapbox | Fase 2 (krav) | Sjelden kritisk |
| `analytics` | Vercel Analytics, Mixpanel, Plausible | Fase 3-4 | Ikke kritisk |
| `cdn` | Vercel Edge, Cloudflare, AWS CloudFront | Fase 3 (arkitektur) | Performance |
| `hosting` | Vercel, Netlify, AWS, Railway, Render | Fase 3 (arkitektur) | Alltid |
| `vcs` | GitHub, GitLab | Fase 1 (oppstart) | Alltid |
| `api` | REST API, GraphQL API, WebSocket services | Fase 2 (krav) | Variabelt |
| `devtools` | Kit CC Monitor, Sentry, LogRocket | Fase 4 (MVP) | Ikke kritisk |
| `design` | Figma, Adobe XD | Fase 1 (design) | Ikke kritisk |
| `ai-services` | OpenAI, Anthropic, Google AI | Fase 2 (krav) | Hvis AI-features |
| `other` | [Spesifisér] | Variabelt | Variabelt |

---

## SKJEMA FOR `integrations.confirmed[]`

Hver integrasjon i arrayen MÅ ha følgende struktur:

```json
{
  "id": "string",                    // Unik ID: [type]-[nummer], f.eks. "auth-01", "payment-01"
  "name": "string",                  // Menneskelesbar navn: "Google Authentication", "Stripe Payments"
  "type": "string",                  // Fra integrationstyper-tabellen ovenfor
  "provider": "string|null",         // Konkret leverandør: "Google", "Stripe", "Supabase", etc. — null hvis ikke bestemt ennå
  "description": "string",           // Kort forklaring: hva gjør denne integrasjonen?
  "phase_introduced": "integer",     // Hvilken fase ble denne integrasjonen identifisert? (1-7)
  "critical": "boolean",             // Er dette kritisk for MVP? true/false
  "reason": "string",                // Begrunnelse for valget av leverandør (tomt hvis provider=null)
  "config_requirements": {           // Hva må konfigureres?
    "environment_variables": [       // Liste over env-variabler som trengs
      { "key": "string", "sensitive": "boolean" }
    ],
    "api_keys": "boolean",           // Trenger API-nøkler?
    "webhooks": "boolean",           // Trenger webhook-setup?
    "oauth_scopes": ["string"],      // Hvis auth: hvilke OAuth-scoper?
    "database_schema": "boolean",    // Trenger database-table/schema-konfigurering?
    "other": "string"                // Annet som må konfigureres
  },
  "security_considerations": {       // Hva må sikres?
    "secrets_needed": "boolean",
    "rate_limiting": "boolean",
    "encryption_required": "boolean",
    "data_classification": "string", // "public" | "internal" | "confidential" | "restricted"
    "compliance": ["string"],        // ["GDPR", "PCI-DSS", ...] hvis relevant
    "notes": "string"                // Fritekst sikkerhetsfokus
  },
  "status": "string",                // "pending" | "selected" | "implemented" | "deprecated"
  "implementation_order": "integer", // Prioritet: 1=første, 5=siste. Hjelper MVP-agent å bygge i riktig rekkefølge
  "cost_estimate": {                 // Kostnadsestimering
    "monthly_usd": "number|null",    // Gjennomsnittlig månedlig kostnad (null = ukjent/gratis)
    "currency": "string",            // "USD" eller annen valuta
    "notes": "string"                // "Gratis tier opp til 100K requests", "Pay-as-you-go"
  },
  "alternatives": [                  // Andre leverandører som ble vurdert
    {
      "provider": "string",          // Navn på alternativ: "GitHub Auth", "Auth0"
      "why_not_chosen": "string"     // Begrunnelse for avslag: "Dyrere enn Google", "Overkompleks"
    }
  ],
  "notes": "string",                 // Fritekst: avklaringer, ADRs, åpne spørsmål
  "last_updated": "string"           // ISO 8601 tidsstempel for siste oppdatering
}
```

### Obligatoriske felt (MÅ alltid fylles)
- `id`, `name`, `type`, `description`, `phase_introduced`, `critical`, `status`

### Betinget obligatoriske felt
- `provider`: MÅ fylles når `status="selected"` eller `status="implemented"`
- `reason`: MÅ fylles når `provider` er satt
- `implementation_order`: MÅ fylles når `status="selected"` eller `status="implemented"`

### Valgfrie felt
- `reason`, `notes`, `alternatives`, `cost_estimate` (men anbefalt for dokumentasjon)

---

## SKJEMA FOR `integrations.setup[]`

`setup[]` er **runtime-sporing** av integrasjons-oppsett (skrives av MVP-agent i Fase 4 via `protocol-INTEGRASJONS-OPPSETT.md`). Mens `confirmed[]` er den deklarative listen (hvilke integrasjoner prosjektet skal ha), er `setup[]` den operasjonelle loggen (hvilke som faktisk er satt opp).

Hver entry i `integrations.setup[]` MÅ ha:

```json
{
  "category": "string",        // Matcher type fra confirmed[] (f.eks. "auth", "payment", "hosting")
  "provider": "string|null",   // Valgt leverandør (f.eks. "Stripe", "Supabase")
  "status": "string",          // "configured" | "deferred" | "skipped" | "failed"
  "setupAt": "ISO 8601",       // Tidsstempel for oppsett
  "reason": "string",          // Begrunnelse (særlig ved deferred/skipped/failed)
  "notes": "string"            // Valgfri kontekst (f.eks. "API-nøkkel i .env")
}
```

### Statusverdier
- `configured`: Integrasjonen er satt opp og verifisert
- `deferred`: Utsatt til senere fase (f.eks. Tier 4-integrasjoner etter MVP)
- `skipped`: Bruker hoppet over
- `failed`: Forsøkt, men mislyktes (se `reason`)

### Forhold til `confirmed[]`
- `confirmed[]` er deklarativ: listen over hvilke integrasjoner som skal være der (satt av AUTO-CLASSIFIER → KRAV-agent → ARKITEKTUR-agent)
- `setup[]` er operasjonell: loggen over oppsett-handlinger (skrives av MVP-agent via `protocol-INTEGRASJONS-OPPSETT.md`)
- Én oppføring i `confirmed[]` kan ha flere tilsvarende i `setup[]` (f.eks. ved re-oppsett eller migrering)

---

## LIVSSYKLUS FOR EN INTEGRASJON

```
Fase 2 (KRAV-agent):
  ├─ Identifiser integrasjon fra krav
  ├─ Opprett entry med status="pending"
  ├─ provider=null (leverandør ikke bestemt ennå)
  └─ Logg: {"event":"FILE","path":"... INTEGRASJONS-OVERSIKT oppdatert","schemaVersion":1}

Fase 3 (ARKITEKTUR-agent):
  ├─ Les eksisterende integrasjoner fra Fase 2
  ├─ For hver integrasjon: 🟡 YELLOW zone (menneske godkjenner)
  │   ├─ Anbefal leverandør basert på valgt tech stack
  │   ├─ Fyll: provider, reason, security_considerations
  │   ├─ Spør bruker: "Godkjenn leverandør?"
  │   └─ Sett status="selected" når godkjent
  ├─ Identifiser OGSÅ nye integrasjoner fra arkitektur-valg
  │   ├─ CDN: Hvis hosting=Vercel → Vercel Edge
  │   ├─ Analytics: Hvis hosting=Vercel → Vercel Analytics
  │   └─ Oppretter nye entries med status="pending" → gjør samme prosess
  └─ Oppdater PROJECT-STATE.json med fullstendig integrations.confirmed[]

Fase 4 (MVP-agent):
  ├─ Les integrations.confirmed[] fra PROJECT-STATE.json
  ├─ FOR HVER integrasjon med status="selected":
  │   ├─ Implementer: Opprett API-nøkler, sett opp webhooks, osv.
  │   ├─ Test: Verifiser at integrasjonen fungerer
  │   └─ Sett status="implemented" når klar
  └─ Logg: {"event":"FILE","path":"docs/INTEGRATIONS-SETUP.md","schemaVersion":1} (prosedyre for oppsett)

Fase 5 (ITERASJONS-agent):
  ├─ Bruker beskriver nye funksjoner som trenger nye integrasjoner?
  │   ├─ Samme prosess som Fase 3: anbefal + test + implementer
  │   └─ Sett status="implemented"
  └─ Oppdater integrations.confirmed[] løpende

Fase 6 (KVALITETSSIKRINGS-agent):
  ├─ Verifiser alle implementerte integrasjoner fungerer
  ├─ Sjekk sikkerhetskonfigurering (secrets, rate limits, etc.)
  └─ Rapporter issues hvis noen integrasjoner ikke fungerer

Fase 7 (PUBLISERINGS-agent):
  ├─ Produksjonisér alle integrasjoner
  ├─ Sett opp alerts og monitoring
  └─ Dokumenter operasjonell prosedyre
```

---

## HVEM EIER HVA

| Agens | Ansvar |
|-------|--------|
| **KRAV-agent (Fase 2)** | Identifiserer integrasjoner fra krav. Lager initiell liste med status="pending". |
| **ARKITEKTUR-agent (Fase 3)** | Velger leverandører basert på tech stack. Settes status="selected". Filler sikkerhet og konfigurasjonsdetaljer. |
| **MVP-agent (Fase 4)** | Implementerer alle valgte integrasjoner. Sett status="implemented". Skriver oppsettdokumentasjon. |
| **ITERASJONS-agent (Fase 5)** | Håndterer nye integrasjoner etter Fase 3. Samme prosess som ARKITEKTUR. |
| **KVALITETSSIKRINGS-agent (Fase 6)** | Verifiserer alle integrasjoner. Rapporterer bugs. |
| **PUBLISERINGS-agent (Fase 7)** | Produksjoniserer, setup av alerts og monitoring. |

---

## PROVIDER-MAPPING-OVERSIKT (referanse fra ARKITEKTUR)

> **Formål:** Veiledning når ARKITEKTUR-agent skal velge leverandører basert på tech stack.
> Disse er **anbefalinger**, ikke regler — brukeren kan overstyre.

### Etter tech stack er valgt:

| Integrasjonstype | Next.js + Vercel + Supabase | Django + Railway + PostgreSQL | Express + Render + MongoDB | Hybrid/Other |
|---|---|---|---|---|
| **auth** | Google / GitHub | Allauth / Django-Allauth | Passport.js | Spørsmål til bruker |
| **database** | Supabase (PostgreSQL) | PostgreSQL / Railway | MongoDB / Cloud Atlas | Spørsmål til bruker |
| **storage** | Supabase Storage / S3 | S3 / Railway PostgreSQL | AWS S3 / Google Cloud Storage | Spørsmål til bruker |
| **email** | Resend | SendGrid / AWS SES | SendGrid / Mailgun | Spørsmål til bruker |
| **hosting** | Vercel | Railway | Render | Spørsmål til bruker |
| **cdn** | Vercel Edge | Cloudflare | Cloudflare | Spørsmål til bruker |
| **sms** | Twilio | Twilio | Twilio | Samme for alle |
| **payment** | Stripe | Stripe | Stripe | Samme for alle |
| **analytics** | Vercel Analytics | Google Analytics / Plausible | Plausible / Mixpanel | Spørsmål til bruker |
| **vcs** | GitHub | GitHub | GitHub | Samme for alle |
| **monitoring** | Vercel + Sentry | Sentry | Sentry | Samme for alle |

---

## EKSEMPEL: FULLSTENDIG INTEGRASJON

```json
{
  "id": "auth-01",
  "name": "Google Authentication",
  "type": "auth",
  "provider": "Google",
  "description": "Brukere kan logge inn med Google-konto",
  "phase_introduced": 2,
  "critical": true,
  "reason": "Google OAuth anbefales for Next.js. Enkelt setup, pålitelig, allerede brukt av 90% av brukerne.",
  "config_requirements": {
    "environment_variables": [
      { "key": "NEXT_PUBLIC_GOOGLE_CLIENT_ID", "sensitive": false },
      { "key": "GOOGLE_CLIENT_SECRET", "sensitive": true }
    ],
    "api_keys": true,
    "webhooks": false,
    "oauth_scopes": ["profile", "email"],
    "database_schema": true,
    "other": "Supabase User Management integrering"
  },
  "security_considerations": {
    "secrets_needed": true,
    "rate_limiting": false,
    "encryption_required": false,
    "data_classification": "confidential",
    "compliance": ["GDPR"],
    "notes": "OAuth secrets lagres i .env.local. API-nøkkelen må roteres quarterly. Brukerens Google profile er klassifisert som 'Personlig opplysning' under GDPR."
  },
  "status": "implemented",
  "implementation_order": 1,
  "cost_estimate": {
    "monthly_usd": 0,
    "currency": "USD",
    "notes": "Gratis — Google OAuth har ingen kost for applikasjoner"
  },
  "alternatives": [
    {
      "provider": "GitHub Auth",
      "why_not_chosen": "Krever at brukere har GitHub-konto — mindre inkluderende"
    },
    {
      "provider": "Auth0",
      "why_not_chosen": "Dyrere ($49/mnd+). Overkompleks for enkel innlogging"
    }
  ],
  "notes": "Sett opp i Fase 4 med NextAuth. Fiks redirect-URI til localhost:3000/auth/callback under dev.",
  "last_updated": "2026-02-19T14:30:00Z"
}
```

---

## EKSEMPEL: PENDING INTEGRASJON (Fase 2)

```json
{
  "id": "payment-01",
  "name": "Payment Processing",
  "type": "payment",
  "provider": null,
  "description": "Brukere kan betale for abonnement (NOK/USD)",
  "phase_introduced": 2,
  "critical": true,
  "reason": null,
  "config_requirements": {
    "environment_variables": [],
    "api_keys": true,
    "webhooks": true,
    "oauth_scopes": [],
    "database_schema": true,
    "other": "Webhook-signeringsopppsett for transaksjonsbekreftelse"
  },
  "security_considerations": {
    "secrets_needed": true,
    "rate_limiting": true,
    "encryption_required": true,
    "data_classification": "restricted",
    "compliance": ["PCI-DSS"],
    "notes": "Klassifisert som RESTRICTED — betalingsinformasjon. PCI-DSS compliance ikke praksis ennå (anbefales i Fase 3)."
  },
  "status": "pending",
  "implementation_order": null,
  "cost_estimate": {
    "monthly_usd": null,
    "currency": "USD",
    "notes": "Avhengig av valgt leverandør. Stripe: ~2,9% + $0,30 per transaksjon. Vipps: variabelt."
  },
  "alternatives": [],
  "notes": "Avgjøres i Fase 3 basert på geografi (Norge → Vipps primærkjell). Venter på ARKITEKTUR-agent.",
  "last_updated": "2026-02-19T10:15:00Z"
}
```

---

## LESING OG SKRIVING

### Lesing
- **ARKITEKTUR-agent:** Leser Fase 2-integrasjoner fra PROJECT-STATE.json → integrations.confirmed[]
- **MVP-agent:** Leser Fase 3-valg (med provider satt) → implementerer
- **ITERASJONS-agent:** Leser eksisterende, legger til nye
- **KVALITETSSIKRINGS-agent:** Leser alle for verifisering

### Skriving
- Kun **fasen som håndterer integrasjonen** skriver til arrayen
- Sekvens: Fase 2 (opprett) → Fase 3 (velg provider) → Fase 4 (implementer) → osv.
- Hver skriving logger til PROGRESS-LOG: `{"ts":"<ISO 8601>","event":"FILE","op":"modified","path":".ai/PROJECT-STATE.json","desc":"integrations.confirmed[] oppdatert","schemaVersion":1}`

---

## REFERANSER

| Fil | Formål |
|-----|--------|
| `docs/INTEGRATIONS-SETUP.md` (genereres i Fase 4) | Praktisk oppsettdokumentasjon for hver integrasjon |
| `docs/FASE-3/security-controls.md` | Sikkerhetskontroller som ivaretar integrasjonsrisiko |
| `docs/FASE-3/tech-stack-decision.md` | Tech stack som påvirker provider-valg |
| `.ai/PROJECT-STATE.json` → `integrations.confirmed[]` | SSOT for gjeldende integrasjonsvalg |

---

## VIKTIG

- **En integrasjon = en entry i arrayen.** Ikke duplikater.
- **Samme integrasjon kan ha flere provider-alternativer:** Bruk `alternatives[]` for å dokumentere disse
- **Leverandørvalg kan endres:** Sett `status="deprecated"` for gammel provider, opprett ny entry med `status="selected"` for ny
- **Fase 2 lager listen, Fase 3 godkjenner leverandørene.** Fase 2 skal ALDRI sette `provider` selv
- **Hemmelig-håndtering:** Se ARKITEKTUR-agent og MVP-agent for hvordan `.env` konfigureres sikkert

---

*Versjon: 1.0.0*
*Opprettet: 2026-02-19*
*Implementerer OPP-45: Integrasjoner schema*
*SSOT for: integrations.confirmed[] struktur, leverandørvalg, fase-eierskap*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
