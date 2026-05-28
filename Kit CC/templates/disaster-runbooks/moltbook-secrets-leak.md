# Runbook: API-nøkler i kodebasen

## Basert på
Moltbook-incident, januar 2026 — Supabase service_role-nøkkel committet til offentlig GitHub-repo og brukt av ondsinnede aktører.

## Symptomer
- Uautorisert API-bruk oppdaget i Anthropic/Stripe/Supabase-dashboard
- Uventet høy regning fra AI-tjenester
- Uautoriserte databaseoperasjoner i logger

## Detekterings-steg
1. Kjør HEMMELIGHETSSJEKK-ekspert på hele kodebasen
2. Sjekk git-historikk: `git log --all -S "eyJ"` (søker etter JWT-mønstre)
3. Sjekk GitHub Security-varsler (Secrets scanning)
4. Sjekk API-brukslogger hos tjenesteleverandør

## Akutt-respons (første 15 minutter)
1. Roter alle eksponerte nøkler UMIDDELBART (Supabase Dashboard → Settings → API → Regenerate)
2. Oppdater Vercel Environment Variables med nye nøkler
3. Trigger ny deploy for å ta nye nøkler i bruk
4. Sjekk API-logg for uautorisert bruk de siste 24 timene
5. Fjern nøkkelen fra git-historikk (git filter-branch eller BFG Repo Cleaner)
6. Gjør repoet privat midlertidig hvis det er offentlig

## Kostnadsestimering
- Sjekk alle API-leverandørers bruks-dashboard for uautoriserte kall
- Kontakt leverandørene for refusjon (mange er imøtekommende ved lekkasjer)

## Langsiktig forebygging
- P3 (KEY-MANAGEMENT): Aldri legg nøkler i kode — alltid Vercel env vars
- K5 (CLAUDE-CODE-HOOKS): service-role-key-leak-block stopper nøkler i kode
- HEMMELIGHETSSJEKK-ekspert: Kjør FØR alle commits

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
