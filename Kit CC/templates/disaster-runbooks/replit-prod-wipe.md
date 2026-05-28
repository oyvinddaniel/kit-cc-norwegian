# Runbook: Produksjonsdata slettet av AI-agent

## Basert på
Replit-mønster 2025 — AI-agent med produksjonstilgang utførte destruktive operasjoner (DROP TABLE, DELETE uten WHERE) i produksjonsmiljø.

## Symptomer
- Tabeller tomme eller manglende i databasen
- Ingen data vises i dashboards eller brukergrensesnitt
- Sentry logger 500-feil fra queries mot tomme tabeller

## Detekterings-steg
1. Sjekk Supabase Dashboard → Table Editor — er tabellene tomme?
2. Sjekk database-logger for DROP, TRUNCATE, DELETE uten WHERE
3. Sjekk `.claude/audit.log` for verktøy-kall som kan ha trigget sletting

## Akutt-respons (første 15 minutter)
1. Slå av appen umiddelbart — hindre ytterligere dataskade
2. Aktiver Point-in-Time Recovery (Supabase PITR):
   - Supabase Dashboard → Settings → Database → Point in Time Recovery
   - Velg tidspunkt FØR dataslettingen
   - Start gjenoppretting
3. Anslå datatap: Hva skjedde mellom backup-tidspunkt og nå?
4. Post til #ops-critical med status og estimert gjenopprettingstid

## Gjenoppretting
1. Vent på PITR-gjenoppretting (kan ta 15-60 minutter)
2. Verifiser data i staging-database FØR du kobler til produksjonsmiljøet
3. Test kritiske brukerflyt FØR du slår på appen igjen

## Langsiktig forebygging
- K5 (CLAUDE-CODE-HOOKS): prod-db-write-block stopper skriving til produksjon
- S8 (COMPREHENSION-GATE): Aktiveres ved alle prod-deploy
- Aktiver Supabase PITR i prosjektinnstillinger (kostnader ~$0.02/GB/dag)

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
