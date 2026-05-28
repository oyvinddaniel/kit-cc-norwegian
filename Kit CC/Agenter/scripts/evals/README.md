# Kit CC v3.6.0 Eval-suite

Test-scenarier for å validere Kit CCs planleggings-funksjon.

## Struktur

```
evals/
├── README.md                       ← denne filen
├── scenario-A-hobby-todo.md        ← Hobby-prosjekt (MINIMAL/FORENKLET)
├── scenario-B-kundevendt-booking.md ← Kommersiell (STANDARD/GRUNDIG)
├── scenario-C-enterprise-hr.md     ← Enterprise (ENTERPRISE)
├── kpi-mal.md                       ← Mal for rapportering
└── resultater/                      ← Faktiske eval-resultater
    └── scenario-X-YYYYMMDD.md       ← Per kjøring
```

## Slik kjører du en eval

1. Velg scenario (A, B, eller C)
2. Les scenario-filen for forventet KPI-er og hvordan kjøre
3. Start ny Kit CC-sesjon i et tomt prosjekt
4. Lim inn brukerens initial-melding fra scenario-filen
5. Følg PLAN-modus-flyten naturlig
6. Etter ferdig: kjør REVIEW-modus
7. Kopier `kpi-mal.md` til `resultater/scenario-X-YYYYMMDD.md` og fyll inn

## Tolkning av resultater

- Hvis ≥6 av 7 KPI-er er ✅ → scenario bestått
- Hvis kritiske mønstre (obligatoriske) mangler → kritisk feil, fiks før release
- Hvis VALIDERING-karakter < B → REVIEW-modus eller mønster-coverage må forbedres

## Itererings-policy

- Maks 5 iterasjoner per scenario (per `protocol-REFINEMENT-CAP.md`)
- Etter hver iterasjon: dokumentér justeringer i resultater/-filen
- Hvis ikke nådd KPI-er etter 5 iterasjoner: dokumentér som blokker

## Aggregert resultat

Etter alle 3 scenarier er kjørt: skriv `EVAL-RESULTATER.md` i `Temp Merge Plan/RESEARCH/` med sammendrag og anbefalinger.

## Kostnad

Hver scenario-kjøring er en hel Kit CC-sesjon. Forvent token-bruk på linje med vanlig planleggings-sesjon. REVIEW-modus med self-consistency koster 3x tokens for kritiske moduler.

## Versjon

**v1.0** — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
