# extension-GIT-FLOW-VIBECODER v1.0

> Git-arbeidsflyt tilpasset vibekodere — med analogier og konkrete Claude Code-kommandoer

**Kritiske regler:** Aldri push direkte til main. Én feature-branch per oppgave — aldri samle flere funksjoner i én branch.

---

## HENSIKT

Git er ikke bare for utviklere. Det er et forsikringssystem for koden din — og med Claude Code kan du bruke det uten å huske alle kommandoene.

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## BRANCHES — DEN ENKLE ANALOGIEN

Tenk på en branch som en lagring du gjør i et videospill FØR du prøver noe risikabelt. Hvis det går galt, laster du bare opp den gamle lagringen. Main er din "tryggeste lagring" — branchen er eksperimentet.

---

## FEATURE BRANCH-ARBEIDSFLYT

### Start en ny funksjon

```bash
# Sørg for at du er oppdatert med main
git checkout main
git pull

# Opprett ny branch (navngi med hva du bygger)
git checkout -b feat/brukerlogin
```

### Jobb på branchen

```bash
# Etter hver meningsfull endring
git add [filnavn]
git commit -m "legg til brukerlogin-side"
```

### Push og lag PR

```bash
# Push branchen til GitHub
git push -u origin feat/brukerlogin

# GitHub viser nå en knapp "Compare & Pull Request"
# Klikk den og beskriv hva du har bygd
```

---

## GODE COMMIT-MELDINGER

Commit-meldingen er notatet du skriver til deg selv i fremtiden.

| Dårlig | Bedre |
|--------|-------|
| "fix stuff" | "fiks feil i brukerlogin ved tom e-post" |
| "update" | "legg til validering på checkout-form" |
| "wip" | "start ny betalingsside (work in progress)" |

**Formelen:** Hva endret du + hvorfor (hvis ikke åpenbart)

```bash
git commit -m "legg til brukerlogin via Supabase Auth"
git commit -m "fiks manglende error-state på checkout"
git commit -m "refaktorer betalingsskjema til egne komponenter"
```

---

## PR — KODE TIL KORREKTUR

Tenk på en PR (Pull Request) som å sende en artikkel til en korrektur-leser FØR publisering. Selv om du er solopreneur, hjelper det å skrive en god PR-beskrivelse — du tvinger deg selv til å tenke gjennom hva du faktisk har gjort.

**God PR-mal:**
```markdown
## Hva er endret?
[Beskriv funksjonaliteten]

## Hvorfor?
[Beskriv problemet som løses]

## Testet?
- [ ] Lokalt i nettleser
- [ ] Sentry mottar ikke nye feil
```

---

## WORKTREES — TO SKRIVEBORD SAMTIDIG

Tenk på worktrees som å ha to versjoner av prosjektet åpent i to forskjellige mapper. Du kan jobbe på en bugfix i én mappe mens du er midt i en feature i en annen — uten å gjemme (stash) arbeidet ditt.

```bash
# Lag en worktree for en rask bugfix mens du jobber på noe annet
git worktree add ../min-app-hotfix main
cd ../min-app-hotfix
# Jobb på bugfixen her
# Tilbake til feature-arbeid:
cd ../min-app
```

---

## MED CLAUDE CODE

Fortell Claude Code hva du vil gjøre — den vet git-kommandoene:

- "Lag en ny branch for brukerlogin-funksjonaliteten"
- "Commit disse endringene med en god melding"
- "Push branchen og lag en PR"
- "Merge main inn i denne branchen"

---

## GUARDRAILS

### Gjør alltid
- Navngi branches med hva de inneholder (feat/, fix/, chore/)
- Skriv meningsfulle commit-meldinger
- Merge main inn i feature-branch før du lager PR (for å unngå konflikter)

### Ikke gjør
- Push direkte til main (branch protection blokkerer dette, men unngå forsøket)
- Samle mange urelaterte endringer i én branch

### Stopp og spør
- Hvis du er usikker på hva som er i main vs. branchen din: `git diff main...[din-branch]`

---

## KRITISKE REGLER (gjentas)

Aldri push direkte til main. Én feature-branch per oppgave — aldri samle flere funksjoner i én branch.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
