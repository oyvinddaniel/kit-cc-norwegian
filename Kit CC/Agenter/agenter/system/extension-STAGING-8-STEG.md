# extension-STAGING-8-STEG v1.0

> Skalerbar deploy-sjekkliste fra 4 steg (MINIMAL) til 15 steg (ENTERPRISE)

**Kritiske regler:** De 3 stegene som aldri hoppes over: env-vars, RLS-sjekk, post-deploy-verifisering. Ingen produksjonsdeploy uten at staging er verifisert.

---

## HENSIKT

Tenk på staging-deploy som en flysimulatorkjøring FØR du flyr passasjerer — du øver på alle scenarioene i trygg kontekst.

Sjekklisten skaleres med prosjektets intensitetsnivå.

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## MINIMAL (4 STEG) — Hobbyprosjekter

1. Env-vars: sjekk at nødvendige variabler er satt
2. Build: `vercel deploy` → sjekk at siden laster
3. Smoke-test: test én kritisk brukerflyt manuelt
4. Post-deploy: sjekk at ingen åpenbare feil vises

---

## FORENKLET (6 STEG) — Interne verktøy

1. Env-vars: sjekk `.env.staging` mot `.env.example`
2. Migrasjon: kjør eventuelle DB-migrasjoner mot staging
3. Build: `vercel deploy` → staging-URL
4. Smoke-test: test 2 kritiske brukerflyt
5. Logging: verifiser at Sentry mottar events
6. Post-deploy: sjekk én kritisk flyt, logg resultat

---

## STANDARD (8 STEG) — Kundevendte apper

1. **Env-vars:** Sjekk at `.env.staging` har alle nødvendige variabler mot `.env.example`
2. **Migrasjon:** Kjør `supabase db push --linked` mot staging-prosjektet
3. **Staging-build:** `vercel deploy` → noter staging-URL
4. **Smoke-test:** Test 3 kritiske brukerflyt manuelt:
   - Innlogging + utlogging
   - Kjernefunksjon (den viktigste tingen brukere gjør)
   - Feilscenario (hva skjer ved ugyldig input?)
5. **Sikkerhetssjekk:** HEMMELIGHETSSJEKK-ekspert + OWASP Top 10-sjekk
6. **Ytelse/logging:** Lighthouse score > 80, verifiser at Sentry mottar events fra staging
7. **Prod-deploy:** `vercel --prod`
8. **Post-deploy:** Test én kritisk flyt i prod, sjekk Sentry for nye feil i de første 10 minuttene

---

## GRUNDIG (10-11 STEG) — Viktige systemer

Alle 8 standard-steg, pluss:

9. **RLS-verifisering:** Kjør `supabase test db` mot staging (K1: RLS-TESTER)
10. **Ytelsesbaseline:** Kjør Lighthouse CI og sammenlign med forrige baseline
11. **Rollback-test:** Verifiser at rollback-prosedyren fungerer (er forrige versjon tilgjengelig i Vercel?)

---

## ENTERPRISE (12-15 STEG) — Kritiske systemer

Alle 11 grundig-steg, pluss:

12. **Lasttest:** Kjør enkel lasttest mot staging (LASTTEST-ekspert)
13. **Tredjeparts-integrasjoner:** Verifiser at alle externe API-kall fungerer (Stripe, etc.)
14. **Status-side-oppdatering:** Varsle om planlagt vedlikehold på status-siden
15. **Post-mortem-sjekk:** Gå gjennom forrige incident — er alle tiltak implementert?

---

## DE 3 STEGENE SOM ALDRI HOPPES OVER

Uansett intensitetsnivå:

| Steg | Begrunnelse |
|------|-------------|
| **Env-vars** | Manglende env-var kan crashe hele appen i prod |
| **RLS-sjekk** | Datalekkasje til feil bruker er ikke oppdagbar uten denne |
| **Post-deploy** | Du vet ikke at noe er galt før du sjekker i prod |

---

## CLAUDE CODE-KOMMANDOER FOR STAGING

```bash
# Kjør staging-deploy
vercel deploy

# Push migrasjoner til staging
supabase db push --linked

# Kjør RLS-tester
supabase test db

# Sjekk Lighthouse
npx @lhci/cli collect --url=[staging-url]
```

---

## GUARDRAILS

### Gjør alltid
- Lagre staging-URL fra `vercel deploy` før du går videre
- Test manuelt — ikke bare sjekk at build passerer
- Vent 10 minutter etter prod-deploy og sjekk Sentry for nye feil

### Ikke gjør
- Hopp over staging og deploy direkte til prod
- Skipp env-vars-sjekken — det er den vanligste årsaken til prod-feil

### Stopp og spør
- Hvis Sentry viser nye feil etter staging-deploy — ikke gå til prod

---

## KRITISKE REGLER (gjentas)

De 3 stegene som aldri hoppes over: env-vars, RLS-sjekk, post-deploy-verifisering. Ingen produksjonsdeploy uten at staging er verifisert.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
