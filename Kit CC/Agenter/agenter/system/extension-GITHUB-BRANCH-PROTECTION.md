# extension-GITHUB-BRANCH-PROTECTION v1.0

> Klikk-for-klikk guide for å beskytte main-branchen mot direkte commits

**Kritiske regler:** Branch protection aktiveres FØR første produksjonsdeploy. "Include administrators" skal alltid være krysset av — ingen unntak.

---

## HENSIKT

Tenk på det som: en innsjekking-skranke på flyplassen — alle, inkludert pilotene, må gjennom sikkerhetskontrollen. En ubeskyttet main-branch er en ulykke som venter på å skje.

Si tydelig hvilket punkt du er på i oppsettet FØR du fortsetter. Hvert steg her er basert på det vi har sett gå galt når det hoppes over.

---

## STEG-FOR-STEG

### GitHub.com — Branch Protection Rules

1. Gå til GitHub-repoet ditt
2. Klikk **Settings** (tannhjul-ikon øverst)
3. I venstre meny: **Code and automation → Branches**
4. Klikk **Add branch protection rule**

### Konfigurering

**Branch name pattern:** `main`

Kryss av følgende:

- [ ] **Require a pull request before merging**
  - [ ] Require approvals: 1 (for solopreneur), 2 (for team)
  - [ ] Dismiss stale pull request approvals when new commits are pushed

- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging
  - Legg til relevante CI-jobber (søk etter dem etter første CI-kjøring):
    - `build` (Next.js build)
    - `test` (Jest/Vitest)
    - `lint` (ESLint)
    - `hooks-verify` (fra K5 hooks-verify.yml)

- [ ] **Require conversation resolution before merging**

- [ ] **Include administrators** (VIKTIG — ingen unntak)

- [ ] **Restrict force pushes**

- [ ] **Restrict deletions**

5. Klikk **Create** eller **Save changes**

---

## CODEOWNERS-TEMPLATE

Opprett `.github/CODEOWNERS` for å kreve godkjenning fra rett person:

```
# CODEOWNERS — hvem som eier hvilke deler av kodebasen
# Dokumentasjon: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# Standard eier for alt
* @[team-owner]

# Admin-sider krever ekstra godkjenning
/src/app/admin/ @[admin-owner]

# Databasemigrasjoner krever godkjenning fra DB-ansvarlig
/supabase/migrations/ @[db-owner]

# Sikkerhets-konfig
/src/lib/auth/ @[security-owner]
/.github/ @[devops-owner]
```

Erstatt `@[team-owner]` med GitHub-brukernavn (f.eks. `@oyvind`).

---

## VERIFISERING

Test at branch protection fungerer:

```bash
# Forsøk å pushe direkte til main — skal feile
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test direct push"
git push origin main
# Forventet output: remote: error: GH006: Protected branch update failed
```

---

## GUARDRAILS

### Gjør alltid
- Aktiver branch protection på main FØR første produksjonsdeploy
- Inkluder CI-statussjekker FØR merge
- Kryss alltid av "Include administrators"

### Ikke gjør
- Deaktiver branch protection midlertidig for å "fikse noe raskt" — bruk en feature-branch
- Sett 0 required approvals (selv for solopreneur — 1 er minimumet)

### Stopp og spør
- Hvis CI-jobs ikke er satt opp ennå — sett opp branch protection uten statussjekker, legg til sjekker etter CI er klar

---

## KRITISKE REGLER (gjentas)

Branch protection aktiveres FØR første produksjonsdeploy. "Include administrators" skal alltid være krysset av — ingen unntak.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
