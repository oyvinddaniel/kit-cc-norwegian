# protocol-CLAUDE-CODE-HOOKS v1.0

> Claude Code hooks-protokoll — definerer obligatoriske hooks per intensitetsnivå

**Kritiske regler:** Obligatoriske hooks på STANDARD+ kan ikke fjernes uten bruker-godkjenning. Alle overrides skal ha begrunnelse og loggføres i audit-loggen.

---

## HENSIKT

Tenk på hooks som brannalarmer i en bygning: de sitter stille inntil noe potensielt farlig skjer, og da handler de umiddelbart uten å forstyrre vanlig arbeid.

Protokollen definerer:
1. Hvilke av de 9 hooks-library-hookene som er obligatoriske på hvert intensitetsnivå
2. Overrides-mekanismen (miljøvariabler)
3. CI-verifisering av at hooks er på plass
4. Team-onboarding-flyt

---

## INSTALLERING

Bruk `Kit CC/hooks-library/install.sh` for å kopiere hooks til `.claude/hooks/` og opprette `.claude/settings.json` med korrekt hooks-konfigurasjon.

Kjør fra prosjektroten:
```bash
Kit CC/hooks-library/install.sh [SUPABASE_REF] [PROD_DOMAIN]
```

Skriptet:
1. Kopierer alle aktive hook-skript til `.claude/hooks/`
2. Oppretter (eller oppdaterer) `.claude/settings.json` med korrekt hooks-konfigurasjon
3. Setter executable-bit på skriptene

---

## OBLIGATORISKE HOOKS PER NIVÅ

| Hook | Formål | MIN | FOR | STD | GRU | ENT |
|------|--------|-----|-----|-----|-----|-----|
| prod-db-write-block | Blokkerer prod-DB-skriving | IKKE | IKKE | MÅ | MÅ | MÅ |
| git-main-commit-block | Blokkerer direkte main-commit | IKKE | KAN | MÅ | MÅ | MÅ |
| supabase-prod-push-block | Blokkerer supabase push til prod | IKKE | IKKE | MÅ | MÅ | MÅ |
| env-file-write-block | Blokkerer .env-skriving | IKKE | KAN | MÅ | MÅ | MÅ |
| service-role-key-leak-block | Blokkerer service_role i kode | IKKE | KAN | MÅ | MÅ | MÅ |
| rm-rf-guard | Varsler ved destruktiv rm | KAN | KAN | BØR | MÅ | MÅ |
| prod-curl-block | Blokkerer curl til prod-API | IKKE | IKKE | BØR | MÅ | MÅ |
| audit-logger | Logger alle verktøy-kall | IKKE | IKKE | BØR | MÅ | MÅ |
| context-loader | Laster kontekst ved sesjonstart | IKKE | KAN | MÅ | MÅ | MÅ |

---

## OVERRIDE-MEKANISME

Hver hook kan overstyres midlertidig med en miljøvariabel:

```bash
ALLOW_PROD_DB_WRITE=1 claude
ALLOW_MAIN_COMMIT=1 claude
ALLOW_SUPABASE_PROD_PUSH=1 claude
ALLOW_ENV_WRITE=1 claude
ALLOW_SERVICE_ROLE_IN_CODE=1 claude
ALLOW_RM_RF=1 claude
ALLOW_PROD_CURL=1 claude
```

Overrides loggføres automatisk i `.claude/audit.log`.

---

## CI-VERIFISERING

Legg til i `.github/workflows/hooks-verify.yml`:
```yaml
name: Verify Claude Code Hooks
on: [push, pull_request]

jobs:
  hooks-verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify Claude Code hooks
        run: |
          REQUIRED_PRE=(
            "prod-db-write-block.sh"
            "git-main-commit-block.sh"
            "supabase-prod-push-block.sh"
            "env-file-write-block.sh"
            "service-role-key-leak-block.sh"
          )
          REQUIRED_POST=("audit-logger.sh")
          REQUIRED_SESSION=("context-loader.sh")
          
          for hook in "${REQUIRED_PRE[@]}"; do
            [[ -f ".claude/hooks/pre-tool-use/$hook" ]] || { echo "FEIL: $hook mangler"; exit 1; }
          done
          for hook in "${REQUIRED_POST[@]}"; do
            [[ -f ".claude/hooks/post-tool-use/$hook" ]] || { echo "FEIL: $hook mangler"; exit 1; }
          done
          for hook in "${REQUIRED_SESSION[@]}"; do
            [[ -f ".claude/hooks/session-start/$hook" ]] || { echo "FEIL: $hook mangler"; exit 1; }
          done
          echo "Alle obligatoriske hooks er på plass"
```

---

## FUNKSJONS-MATRISE

> **Referanse:** Se `../../klassifisering/KLASSIFISERING-METADATA-SYSTEM.md` for detaljer

| ID | Funksjon | Stack | MIN | FOR | STD | GRU | ENT | Kostnad |
|----|----------|-------|-----|-----|-----|-----|-----|---------|
| K5-01 | Hooks-installasjon | 🟢 | IKKE | IKKE | MÅ | MÅ | MÅ | Gratis |
| K5-02 | Override-mekanisme | 🟢 | IKKE | IKKE | MÅ | MÅ | MÅ | Gratis |
| K5-03 | CI-verifisering | 🟣 | IKKE | IKKE | BØR | MÅ | MÅ | Gratis |
| K5-04 | Audit-logging | ⚪ | IKKE | IKKE | BØR | MÅ | MÅ | Gratis |

### Funksjons-beskrivelser for vibekodere

**K5-01: Hooks-installasjon**
- *Hva gjør den?* Kopierer sikkerhetsbrytere til prosjektet ditt med ett kommando
- *Tenk på det som:* Å installere et alarmsystem i huset ditt — én gang, varig beskyttelse
- *Kostnad:* Gratis

**K5-02: Override-mekanisme**
- *Hva gjør den?* Lar deg midlertidig slå av en hook med en miljøvariabel når du vet hva du gjør
- *Tenk på det som:* Nøkkelen til å deaktivere alarmen når du må gjøre vedlikehold
- *Kostnad:* Gratis

**K5-03: CI-verifisering**
- *Hva gjør den?* Sjekker automatisk at alle obligatoriske hooks er på plass ved hver push
- *Tenk på det som:* En brannvakt som sjekker at alarmanlegget fungerer daglig
- *Kostnad:* Gratis

**K5-04: Audit-logging**
- *Hva gjør den?* Logger hvert verktøy-kall Claude gjør til en fil du kan gjennomgå
- *Tenk på det som:* Overvåkingskameraet som lagrer hvem som kom inn og ut
- *Kostnad:* Gratis

---

## GUARDRAILS

### Gjør alltid
- Kjør install.sh ved prosjektoppstart på STANDARD+
- Verifiser hooks i CI via hooks-verify.yml
- Logg alle overrides i audit-loggen med begrunnelse

### Ikke gjør
- Slett hooks for å "fikse" et problem — løs rotårsaken istedenfor
- Bruke ALLOW_*-variabler uten eksplisitt begrunnelse

### Stopp og spør
- Hvis hooks hindrer en kritisk nødutbedring — avklar med bruker

---

## KRITISKE REGLER (gjentas)

Obligatoriske hooks på STANDARD+ kan ikke fjernes uten bruker-godkjenning. Alle overrides skal ha begrunnelse og loggføres i audit-loggen.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
