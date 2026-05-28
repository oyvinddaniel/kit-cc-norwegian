# Runbook: Feil miljø-variabler i produksjon

## Basert på
GitLab env-confusion-pattern — Staging-konfigurasjon (inkl. nøkler og URL-er) havner i produksjonsmiljøet og forårsaker datablekkasje mellom miljøer.

## Symptomer
- Produksjonsappen kobler til staging-database
- Data fra staging-testbrukere vises i produksjon
- Feil API-endepunkter kontaktes (Stripe test vs live, Supabase staging vs prod)
- Betalinger kjøres mot test-miljø i stedet for live

## Detekterings-steg
1. Sjekk Vercel Environment Variables for produksjon — er alle nøkler live-nøkler?
2. Sjekk `NEXT_PUBLIC_SUPABASE_URL` — peker den på riktig Supabase-prosjekt?
3. Sjekk Stripe nøkkel-prefix: `sk_live_` (prod) vs `sk_test_` (staging)
4. Kjør extension-STAGING-8-STEG steg 1 (env-vars) i produksjonsmiljøet

## Akutt-respons (første 15 minutter)
1. Identifiser hvilke env-vars som er feil
2. Oppdater Vercel Environment Variables med korrekte prod-verdier
3. Trigger ny deploy for å ta endringer i bruk
4. Verifiser at appen nå kobler til riktig miljø

## Datatap-vurdering
1. Var det transaksjoner i staging-periode som skal til prod? (f.eks. betalinger)
2. Ble staging-data skrevet til prod-database? (eller omvendt?)
3. Dokumenter alle datasekvenser for post-mortem

## Langsiktig forebygging
- P2 (STAGING-8-STEG): Steg 1 (env-vars) sjekkes alltid FØR deploy
- P3 (KEY-MANAGEMENT): Nøkkel × miljø-tabell vedlikeholdes og verifiseres kvartalsvis
- HEMMELIGHETSSJEKK-ekspert: Sjekk for staging-nøkler i prod-konfigurasjon

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
