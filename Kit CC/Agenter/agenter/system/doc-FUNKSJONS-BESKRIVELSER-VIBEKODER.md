# Funksjons-beskrivelser for vibekodere

> Ekstrahert fra 4-MVP-agent.md. Brukes når du presenterer BØR/KAN-oppgaver til bruker (Steg 3).

**MVP-00: Design System (Designtokens, Tailwind, Komponenter)** ⚪
- *Hva gjør den?* Setter opp det visuelle fundamentet for hele appen — farger, typografi, komponent-stiler.
- *Tenk på det som:* Oppskriftboken som sikrer at hele restauranten lager mat på samme måte.
- *Hvorfor først?* Alle senere komponenter bygger på dette systemet. Uten det risikerer du grå, inkonsekvent design.
- *Lovable-filosofi:* Designsystemet ER ALT. Semantiske tokens i CSS, Tailwind-konfigur, ingen hardkodede farger.
- *Kostnad:* Gratis - alt innebygd i Tailwind.

**MVP-01: Git repo-struktur** 🟣
- *Hva gjør den?* Oppretter en strukturert mappe for koden din på GitHub.
- *Tenk på det som:* En ryddig arkivmappe der alt har sin plass.
- *Relevant for GitHub:* Ja - dette er fundamentet for versjonskontroll.

**MVP-02: .gitignore + .env.example** 🟣
- *Hva gjør den?* Forteller Git hvilke filer som IKKE skal deles, og gir et eksempel på miljøvariabler.
- *Tenk på det som:* En liste over private ting som aldri skal vises offentlig.
- *Relevant for Vercel:* Ja - .env.example hjelper deg sette opp Vercel Environment Variables.

**MVP-03: Secrets management** 🟣
- *Hva gjør den?* Sikrer at passord og API-nøkler holdes utenfor koden.
- *Tenk på det som:* En safe for alle hemmelighetene dine.
- *Relevant for Vercel:* Ja - bruk Vercel Environment Variables.

**MVP-04: CI/CD-pipeline** 🟣
- *Hva gjør den?* Automatiserer testing og deploy hver gang du pusher kode.
- *Tenk på det som:* En robot som sjekker arbeidet ditt og leverer det til produksjon.
- *Kostnad:* Gratis med GitHub Actions.

**MVP-05: SAST + dependency-sjekk** 🟣
- *Hva gjør den?* Scanner koden din for sikkerhetshull og sjekker at bibliotekene du bruker er trygge.
- *Tenk på det som:* En sikkerhetsvakt som sjekker alt før det går ut døra.
- *Kostnad:* Gratis med GitHub Dependabot + npm audit.

**MVP-06: SBOM generering** ⚪
- *Hva gjør den?* Lager en komplett liste over alle biblioteker og versjoner i prosjektet.
- *Tenk på det som:* En ingrediensliste på en matvare - du vet nøyaktig hva som er i produktet.
- *Kostnad:* Gratis med cyclonedx eller syft.

**MVP-07: Test coverage 70%+** ⚪
- *Hva gjør den?* Sikrer at minst 70% av koden din er testet automatisk.
- *Tenk på det som:* En kvalitetskontroll som sjekker at det meste fungerer.
- *Kostnad:* Gratis med Jest/Vitest + nyc.

**MVP-08: Multi-environment setup** 🟢
- *Hva gjør den?* Setter opp separate miljøer for utvikling, testing og produksjon.
- *Tenk på det som:* Øvingssal vs konsertsal - du øver ett sted, opptrer et annet.
- *Relevant for Supabase/Vercel:* Ja - begge støtter preview deployments.

**MVP-09: Backend-implementasjon** ⚪
- *Hva gjør den?* Bygger "hjernen" til appen - logikk, database, API.
- *Tenk på det som:* Kjøkkenet i en restaurant - der maten lages.
- *Relevant for Supabase:* Ja - Edge Functions, Database, Auth.

**MVP-10: Frontend-implementasjon + bilder** ⚪
- *Hva gjør den?* Bygger det brukerne ser og klikker på, inkludert visuelle elementer (bilder, gradienter, ikoner).
- *Tenk på det som:* Spisesalen i en restaurant - det gjestene opplever. Med flotte serveringer og dekorasjon.
- *Bilder:* Integrert her - AI-genererte, fra MCP, eller high-quality placeholders (aldri grå bokser).
- *Design-tokens:* Alle farger og stiler bruker systemet fra MVP-00 (aldri hardkodede hex).
- *Relevant for Vercel:* Ja - optimalisert for Next.js hosting.

**MVP-11: Authentication** 🟢
- *Hva gjør den?* Lar brukere logge inn og beskytter private data.
- *Tenk på det som:* Dørvakten som sjekker ID før du slipper inn.
- *Relevant for Supabase:* Ja - bruk Supabase Auth (gratis).

**MVP-12: Unit + integration-tester** ⚪
- *Hva gjør den?* Skriver automatiske tester som sjekker at koden fungerer.
- *Tenk på det som:* Prøvekjøring av bilen før du leverer den til kunden.
- *Kostnad:* Gratis med Jest/Vitest.

**MVP-13: Code review før merge** ⚪
- *Hva gjør den?* En annen utvikler (eller AI) sjekker koden før den legges inn.
- *Tenk på det som:* Korrekturlesing før du sender en viktig e-post.
- *Kostnad:* Gratis - manuelt eller med AI.

**MVP-14: Phase gate validering** ⚪
- *Hva gjør den?* Sjekker at alle påkrevde leveranser er på plass før neste fase.
- *Tenk på det som:* Eksamen du må bestå før du får gå videre til neste klasse.
- *Kostnad:* Gratis - automatisk sjekk.

---

*Ekstrahert fra 4-MVP-agent.md v3.5.0 — 2026-02-23, oppdatert 2026-04-22*

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
