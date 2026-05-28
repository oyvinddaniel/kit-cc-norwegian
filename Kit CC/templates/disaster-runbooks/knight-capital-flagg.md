# Runbook: Gammelt feature flag aktivert utilsiktet

## Basert på
Knight Capital Group, august 2012 — Gjenaktivering av gammelt feature flag (SMARS) trigget automatisk handel for $440 millioner på 45 minutter. Selskapet tapte $440M og gikk konkurs.

## Symptomer
- Uventet og uautorisert oppførsel i produksjon
- Feature-flagg med gammel kode aktivert av feiltagelse
- Transaksjonsmønstre som ikke samsvarer med forventet atferd

## Detekterings-steg
1. Sjekk feature_flags-tabellen i Supabase for nylige endringer
2. Sjekk audit-logg for hvilke flagg som er endret og av hvem
3. Identifiser hvilken kode som kjøres under det aktiverte flagget
4. Sjekk database-logg for uventede transaksjoner

## Akutt-respons (første 15 minutter)
1. Deaktiver ALLE feature flags umiddelbart (sett `enabled = false` på alle)
2. Rull tilbake til forrige stabile versjon via Vercel Instant Rollback
3. Verifiser at uønsket oppførsel har stoppet
4. Post til #ops-critical med status

## Flagg-gjenoppretting
1. Gå gjennom alle feature flags en og en
2. For hvert flagg: Er koden trygg å aktivere? Er det testet?
3. Aktiver flagg ett om gangen etter verifisering
4. Dokumenter alle aktive flagg og deres formål

## Langsiktig forebygging
- K2 (FEATURE-FLAGS): Rydd opp flagg etter 100% rollout — ikke la dem leve evig
- K2 (FEATURE-FLAGS): Legg til `cleanup_by`-dato i alle flagg-beskrivelser
- COMPREHENSION-GATE: Aktiver ved flagg-aktivering i produksjon

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
