# Runbook: RLS-feil som eksponerer brukerdata

## Basert på
Lovable-incident, mai 2025 — RLS-feil i produksjon eksponerte brukeres private data for andre brukere.

## Symptomer
- Brukere rapporterer å se andres data (bestillinger, profiler, meldinger)
- Sentry fanger cross-user data i request-kontekst
- Unormalt høy data-aksess på tvers av user_id-er i logger

## Detekterings-steg
1. Sjekk Sentry for feil med "RLS" eller "row level security" i beskrivelsen
2. Sjekk database-logger for SELECT-queries uten `WHERE user_id = auth.uid()`
3. Kjør manuell test: Logg inn som bruker A, forsøk å hente bruker B sine data

## Akutt-respons (første 15 minutter)
1. Slå av appen umiddelbart (Vercel: sett deployment til "paused" eller deploy en vedlikeholdsside)
2. Post til #ops-critical og #[proj]-errors: "Kritisk RLS-feil — appen er midlertidig nede"
3. Opprett incident-kanal: `#inc-[dato]-rls-failure`
4. Identifiser hvilke tabeller som mangler RLS eller har feil policy
5. Lag emergency RLS-patch og kjør mot produksjonsdatabase
6. Test patch mot staging FØR du ruller tilbake

## Varsel til brukere
- Send e-post til alle berørte brukere (bruk epost-kunde.md-malen)
- Vurder GDPR-varsling til Datatilsynet innen 72 timer

## Langsiktig forebygging
- K1 (RLS-TESTER): Kjør pgTAP-tester etter ALLE databasemigrasjoner
- K5 (CLAUDE-CODE-HOOKS): prod-db-write-block stopper utilsiktede produksjonsskrivinger
- extension-GITHUB-BRANCH-PROTECTION: Krever godkjenning av db-eier på /supabase/migrations/

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
