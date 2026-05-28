# doc-NAVNEKONVENSJON.md — Navnekonvensjon for filer i Kit CC

> **SSOT for filnavn-prefikser og konvensjoner.** Referert fra CLAUDE.md.
> Versjon: 2.0 | Oppdatert: 2026-04-22 | Opprinnelig: 2026-02-23 (v1.0)

Denne konvensjonen er **bindende for alle nye filer** i Kit CC. Gjør det 100 % tydelig hva som er agent, protokoll, dokumentasjon eller extension — uten å måtte åpne filen.

---

## System-mappen (`Kit CC/Agenter/agenter/system/`)

| Prefiks | Type | Antall | Beskrivelse |
|---------|------|--------|-------------|
| `agent-*` | System-agent | 6 | Tar beslutninger, koordinerer arbeid |
| `protocol-*` | Protokoll | 30 | Standarder, regler, prosedyrer — kan ikke ta beslutninger selv |
| `doc-*` | Dokumentasjon | 5 | Oversikter, matriser, referansedokumenter — passiv informasjon |
| `extension-*` | Extension | 8 | Utvider funksjonalitet til en annen agent — ikke selvstendig |

### Hvordan gjenkjenne typen når filnavnet er tvetydig

| Type | Kjennetegn i innholdet |
|------|------------------------|
| Agent | `"Du er [NAVN], system-agenten..."` eller `"Type: SYSTEM-AGENT"` i IDENTITET-seksjon |
| Protokoll | `"Type: SYSTEM-PROTOCOL"` — definerer regler, ingen `"Du er..."` |
| Dokumentasjon | Oversikter, tabeller, referanser — ingen `"Du er..."` eller `"Type: AGENT"` |
| Extension | Refererer eksplisitt til hvilken agent den utvider |

## Andre mapper

| Mappe | Format | Antall | Eksempel |
|-------|--------|--------|----------|
| Basis-agenter (`agenter/basis/`) | `[NAVN]-agent.md` | 7 | `BYGGER-agent.md` |
| Prosess-agenter (`agenter/prosess/`) | `[NR]-[NAVN]-agent.md` | 7 | `4-MVP-agent.md` |
| Ekspert-agenter (`agenter/ekspert/`) | `[NAVN]-ekspert.md` | 37 | `GDPR-ekspert.md` |
| Maler (`maler/`) | `MAL-[TYPE].md` eller `[NAVN]-MAL.md` | 10 | `MAL-EKSPERT.md`, `SESSION-HANDOFF-MAL.md` |

## Rot-filer (`Kit CC/Agenter/`)

| Prefiks | Format | Målgruppe | Eksempel |
|---------|--------|-----------|----------|
| `AI-*` | `AI-[NAVN].md` eller `AI-[NAVN].json` | AI-agenter (internt byggverktøy) | `AI-BYGGEINSTRUKSJONER.md`, `AI-OPPGAVER.json` |
| Ingen | `[NAVN].md` (ingen prefix) | Både AI og bruker | `README.md`, `CLAUDE.md` |

---

## Ved nye filer

1. Bestem hvilken kategori filen tilhører (agent, protokoll, dokumentasjon, extension, mal).
2. Bruk riktig prefix/suffix basert på kategori.
3. Følg eksisterende mønstre i samme mappe.
4. Oppdater `Kit CC/Agenter/AI-OPPGAVER.json` med riktig filsti (for agenter).
5. Oppdater `doc-FILKATALOG.md` hvis filen er del av Lag 1/2/3.

## Aldri

- Lag filer uten prefix/suffix i `system/`-mappen.
- Bland navnekonvensjoner fra ulike mapper.
- Bruk gamle filnavn uten prefix (f.eks. `ORCHESTRATOR.md` i stedet for `agent-ORCHESTRATOR.md`).

---

## Eksempler

### Feil

```
agenter/system/ORCHESTRATOR.md           # Mangler agent- prefix
agenter/system/my-protocol.md            # Skal være protocol-MY-PROTOCOL.md (stor bokstav, bindestrek)
agenter/basis/BYGGER.md                  # Mangler -agent suffix
agenter/ekspert/GDPR.md                  # Mangler -ekspert suffix
```

### Riktig

```
agenter/system/agent-ORCHESTRATOR.md
agenter/system/protocol-MY-PROTOCOL.md
agenter/basis/BYGGER-agent.md
agenter/ekspert/GDPR-ekspert.md
```

---

## Automatisk verifikasjon

```bash
# Sjekk at alle filer i system/ følger konvensjonen
cd Kit\ CC/Agenter/agenter/system
for file in *.md; do
  if ! echo "$file" | grep -qE "^(agent-|protocol-|doc-|extension-)"; then
    echo "FEIL: $file følger ikke navnekonvensjon"
  fi
done
```

Bruk `Kit CC/Agenter/scripts/validate-consistency.sh` for komplett sjekk av hele Kit CC.

---

## Endringslogg

| Versjon | Dato | Endring |
|---------|------|---------|
| 1.0 | 2026-02-23 | Initial SSOT-versjon (27 linjer, tabellformat) |
| 2.1 | 2026-04-22 | Korrigert protokoll-telling 29 → 30 (faktisk antall verifisert mot filsystem). |
| 2.0 | 2026-04-22 | Integrert detaljer fra `Agenter/NAVNEKONVENSJON.md` (nå slettet): Kjennetegn pr type, verifikasjonsskript, eksempler på feil/riktig. Oppdaterte antall (6 system, 30 protokoller, 37 eksperter). |

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
