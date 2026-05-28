# Migrasjons-guide: Kit CC v3.5 → v3.6.0

> Denne guiden viser hvordan eksisterende Kit CC v3.5-prosjekter kan oppgraderes til v3.6.0.

## Forutsetninger

- Kit CC v3.5.x prosjekt med eksisterende `.ai/`, `docs/`-strukturer
- Git-versjonering anbefalt (lag tag før migrering)
- Python 3 og jq installert (for state-konvertering)

## Steg 1: Backup

```bash
git tag v3.5.0-pre-v3.6-migration
git commit -am "Pre-migration snapshot"
```

Eller filsystem-kopi:
```bash
cp -R "Mitt Prosjekt" "Mitt Prosjekt-v3.5-backup"
```

## Steg 2: Konverter PROGRESS-LOG

```bash
python3 "Kit CC/Agenter/scripts/convert-progress-log-to-jsonl.py" \
  ".ai/PROGRESS-LOG.md" \
  ".ai/PROGRESS-LOG.jsonl"
```

Verifiser:
```bash
wc -l .ai/PROGRESS-LOG.jsonl
head -5 .ai/PROGRESS-LOG.jsonl | jq .
```

## Steg 3: Oppdater PROJECT-STATE.json

```bash
jq '. + {"stateVersion": 1, "schemaVersion": 2}' .ai/PROJECT-STATE.json > /tmp/state-new.json
mv /tmp/state-new.json .ai/PROJECT-STATE.json
```

## Steg 4: Regenerer MODULREGISTER

Hvis prosjektet har M-XXX-spec-filer i `docs/moduler/`:
```bash
bash "Kit CC/Agenter/scripts/regenerate-modulregister.sh" "$(pwd)"
```

Bekreft at `docs/FASE-2/MODULREGISTER.md` ble regenerert.

## Steg 5: Mikrodetaljer for eksisterende moduler (valgfritt)

For å fylle inn seksjon 3.5 mikrodetaljer i eksisterende M-XXX-spec:
1. Åpne ny Kit CC-sesjon
2. Si "jeg vil utdype mikrodetaljer for M-XXX"
3. PLAN-modus aktiveres → fyller inn seksjon 3.5

ITERASJONS-agent i Fase 5 vil også foreslå dette automatisk før hver modul-bygging.

## Steg 6: Verifiser

```bash
# Sjekk JSONL er gyldig
cat .ai/PROGRESS-LOG.jsonl | while read line; do echo "$line" | jq . > /dev/null; done

# Sjekk schema
jq '.stateVersion, .schemaVersion' .ai/PROJECT-STATE.json

# Sjekk mønster-bibliotek tilgjengelig (skal allerede være på plass i Kit CC v3.6)
ls "Kit CC/Agenter/MONSTRE/_katalog.md"
```

## Vanlige problemer

### "PROGRESS-LOG.jsonl finnes ikke"
Konvertering ble ikke kjørt. Gå tilbake til Steg 2.

### "Schema validering feiler"
PROJECT-STATE.json mangler nye felt. Gå tilbake til Steg 3.

### "Mønstre ikke funnet"
Verifiser at `Kit CC/Agenter/MONSTRE/`-mappa finnes med 22 mønster-filer.

### Rollback

Hvis migrering går galt:
```bash
git reset --hard v3.5.0-pre-v3.6-migration
```

eller bytt tilbake til filsystem-backup-mappa.

## Hva er nytt etter migrering

- Naturlig-språk-planlegging (se HURTIGSTART.md)
- 22 mønstre tilgjengelig for mikrodetalj-planlegging
- VALIDERING-karakter A-D før produksjons-launch
- Atomic state-skriving med stateVersion

Se `RELEASE-v3.6.0.md` for full liste.

---

**Versjon:** v1.0 — 2026-05-13

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
