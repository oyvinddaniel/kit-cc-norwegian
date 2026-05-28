# protocol-KEY-MANAGEMENT v1.0

> Definerer riktig lagring og bruk av API-nøkler per miljø og risiko-nivå

**Kritiske regler:** Aldri prod-nøkler på Mac i klartekst. service_role-nøkkel eksisterer aldri i kode eller versjonskontroll. Roter kompromitterte nøkler umiddelbart.

---

## HENSIKT

Tenk på nøkler som husøkler: du låser ikke husøkkelen innendørs (i koden), men legger den i en låseboks (Vercel env vars). Service_role er hovednøkkelen til kjelleren — den oppbevares ekstra trygt.

---

## NØKKEL × MILJØ-TABELL

| Nøkkel | Dev | Staging | Prod |
|--------|-----|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | .env.local ✓ | Vercel env ✓ | Vercel env ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | .env.local ✓ | Vercel env ✓ | Vercel env ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ALDRI I KODE | Vercel env ✓ | Vercel env ✓ |
| `DATABASE_URL` (prod) | ALDRI | ALDRI | Vercel env ✓ |
| `ANTHROPIC_API_KEY` | .env.local ✓ | GitHub Secrets ✓ | GitHub Secrets ✓ |
| `STRIPE_SECRET_KEY` | .env.local (test) ✓ | .env.staging (test) ✓ | Vercel env (live) ✓ |

**Tommelregel:** Hvis nøkkelen gir tilgang til produksjonsdata, er den aldri på din Mac i klartekst.

---

## 4 RISIKO-NIVÅER FOR SERVICE_ROLE

| Nivå | Kontekst | Krav |
|------|----------|------|
| **Lav** | Server-side kode (API-routes, Edge Functions) med input-validering | Kun i `SUPABASE_SERVICE_ROLE_KEY` env var |
| **Medium** | Edge Functions med rate-limiting og autentisering | Edge Function + rate limit + auth-sjekk |
| **Høy** | Migrasjons-skript (engangsbruk) | Aldri lagret — kun som temp env var under kjøring |
| **Kritisk** | Backup-prosesser | Isolert miljø, roter hver 90. dag |

---

## .gitignore — ALDRI COMMIT DISSE

Legg til i `.gitignore`:

```gitignore
# Secrets og nøkler
.env
.env.local
.env.development
.env.staging
.env.production
.env*.local

# Konfigurasjoner som kan inneholde nøkler
.claude/settings.json
.claude/settings.local.json
```

---

## VERIFISERING: HEMMELIGHETSSJEKK

Kjør HEMMELIGHETSSJEKK-ekspert FØR alle commits:

```bash
# Enkel sjekk med git-secrets (installer med: brew install git-secrets)
git secrets --scan

# Eller med trufflehog
npx trufflehog@latest git file://. --only-verified
```

---

## VED KOMPROMITTERT NØKKEL

Handlingsplan (utfør i denne rekkefølgen):

1. Roter nøkkelen umiddelbart (i Supabase/Anthropic/Stripe dashboard)
2. Oppdater Vercel env vars med ny nøkkel
3. Trigger ny deploy for å ta ny nøkkel i bruk
4. Sjekk API-logg for uautorisert bruk de siste 24 timene
5. Kjør HEMMELIGHETSSJEKK-ekspert for å finne evt. andre lekkasjer
6. Vurder GDPR-varsling hvis persondata er kompromittert (72-timersregel)

---

## GUARDRAILS

### Gjør alltid
- Bruk `.env.local` for lokal utvikling (aldri `.env` alene)
- Sett alle prod-nøkler i Vercel Environment Variables
- Roter nøkler minimum hvert år, eller umiddelbart ved mistanke om lekkasje

### Ikke gjør
- Hardkod nøkler i kode — selv midlertidig
- Commit `.env*`-filer til git (sjekk `.gitignore`)
- Del service_role-nøkkel i Slack, e-post eller chat

### Stopp og spør
- Hvis du er usikker på om en nøkkel er kompromittert — roter den og spør etterpå

---

## KRITISKE REGLER (gjentas)

Aldri prod-nøkler på Mac i klartekst. service_role-nøkkel eksisterer aldri i kode eller versjonskontroll. Roter kompromitterte nøkler umiddelbart.

---

*Kompatibel med: Kit CC v3.5.0*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
