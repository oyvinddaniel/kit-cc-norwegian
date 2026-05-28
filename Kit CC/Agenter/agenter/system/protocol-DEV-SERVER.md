# Protocol: Dev-server port-håndtering

> Ekstrahert fra 4-MVP-agent.md Steg 4.6.0. Brukes av MVP-agent (Fase 4) og ITERASJONS-agent (Fase 5).

> **TRIGGER:** Når prosjektet er klart til å kjøres (typisk etter MVP-01 og MVP-02 er fullført, dev-server kan startes).
> **FORMÅL:** Sikre at ALLE prosjekter — inkludert statiske HTML-sider — kjører på localhost, slik at Kit CC Monitor proxy fungerer. Sikrer også unike porter for flere samtidige prosjekter.

**ALLE prosjekter skal kjøre på localhost via en server. Aldri lever HTML-filer som `file://`.**
**ALDRI start dev-server uten eksplisitt port. Bruk ALLTID `--port` flagget (eller tilsvarende).**

## Prosess

```
1. BESTEM SERVER-TYPE
   └─ Har prosjektet et rammeverk med innebygd dev-server?
      ├─ JA (Next.js, Vite, CRA, Remix, Nuxt, SvelteKit, Express, etc.)
      │   → Bruk rammeverkets dev-server (se steg 2A)
      └─ NEI (statisk HTML/CSS/JS, ren landingsside, prototype, etc.)
          → Bruk enkel statisk server (se steg 2B)

2A. RAMMEVERK MED DEV-SERVER — Finn ledig port og start:
   └─ Sjekk om standard-port (3000) er ledig:
      Portsjekk (OS-spesifikk):
      ├─ macOS/Linux: `lsof -ti:3000` (tom output = ledig)
      ├─ Windows: `netstat -ano | findstr :3000` (tom output = ledig)
      └─ Automatisk: Sjekk OS med `uname -s` ("Darwin", "Linux", "MINGW/MSYS")
      ├─ Tom output → Port 3000 er ledig
      └─ Output → Port 3000 er opptatt
         └─ Prøv neste: 3001, 3002, ... opptil 3020
         └─ Alternativt: npx detect-port 3000 (returnerer første ledige)
   └─ Start med eksplisitt port OG uten auto-åpning av nettleser:
      KRITISK: Bruk ALLTID flagg som forhindrer at dev-serveren åpner nettleseren automatisk.
      Brukeren skal ALDRI se port 300x — kun Monitor-porten (444x) som proxy.
      - Next.js:          npx next dev --port [PORT]  (åpner ikke nettleser som standard)
      TURBOPACK OG NATIVE MODULER: Hvis prosjektet bruker native Node-moduler
         (better-sqlite3, sharp, bcrypt, canvas, etc.), bruk `next dev --webpack --port [PORT]`
         i stedet for standard Turbopack. Native C/C++ addons kan ikke kompileres av Turbopack
         (standard-bundler fra Next.js 15+). Alternativ: Bruk rene JS-alternativer
         (f.eks. sql.js i stedet for better-sqlite3).
      - Vite/SvelteKit:   npx vite --port [PORT] --open false
      - Create React App: BROWSER=none PORT=[PORT] npm start
      - Remix:            npx remix dev --port [PORT] --no-open
      - Nuxt:             npx nuxt dev --port [PORT] --no-open
      - Express/Node:     PORT=[PORT] node server.js
      - Annet:            Sjekk rammeverkets docs for port-flagg + --no-open

2B. STATISK PROSJEKT (HTML/CSS/JS) — Start lokal server:
   └─ Finn ledig port (samme metode som 2A, start fra 3000)
   └─ Start enkel HTTP-server fra prosjektmappen:
      - Foretrukket: npx serve -l [PORT]        (installerer seg selv, null config)
      - Alternativ:  npx http-server -p [PORT]  (enklere, men færre features)
      - Alternativ:  python3 -m http.server [PORT]  (alltid tilgjengelig, ingen npm)
   └─ Aldri lever bare en .html-fil. Brukeren skal alltid åpne localhost:[PORT],
      ikke file:///path/to/index.html. Dette sikrer at:
      - Kit CC Monitor proxy fungerer (injiserer dashboard i appen)
      - Relative stier og fetch() virker korrekt
      - Hot-reload kan legges til senere

3. LAGRE I PROJECT-STATE.json (gjøres AUTOMATISK — ikke spør bruker)
   └─ Oppdater "devServer"-feltet:
      "devServer": {
        "port": [PORT],
        "url": "http://localhost:[PORT]",
        "framework": "[next|vite|cra|express|remix|nuxt|svelte|static|annet]",
        "startCommand": "[den faktiske kommandoen]"
      }

3B. VALIDERING (etter lagring — sjekk at startCommand fungerer):
   └─ Test den lagrede kommandoen:
      - Kjør: [startCommand] i bakgrunnen
      - Vent 10 sekunder
      - Sjekk: `curl -s http://localhost:[PORT]` skal returnere HTML (ikke "Connection refused")
      - HVIS OK → Kommandoen fungerer
      - HVIS feil → Logg til PROGRESS-LOG: "FEIL: startCommand feilet — [feilmelding]"
        → Prøv alternative kommandoer for rammeverket
        → Spør bruker hvis ingen alternativer fungerer

4. INFORMER BRUKER (kort og tydelig)
   ALDRI vis dev-server-porten (300x) til brukeren. Den er en intern detalj.
   └─ Vis KUN: "[Prosjektnavn] er klar. Steg 4.6.1 kobler Monitor til appen."
   └─ Brukeren får URL-en i steg 4.6.1 (alltid Monitor-porten, aldri dev-porten)

5. GÅ UMIDDELBART TIL STEG 4.6.1
   IKKE stopp her. Dev-server er en intern detalj — brukeren trenger proxy.
   └─ For webapp-prosjekter: Steg 4.6.1 er OBLIGATORISK rett etter dev-server start.
   └─ For CLI/API/backend: Hopp over 4.6.1 (standalone er korrekt).
```

---

*Ekstrahert fra 4-MVP-agent.md v3.5.0 — 2026-02-23 (referanse oppdatert 2026-04-22)*

*Kompatibel med: Kit CC v3.5.0*

> **Systemversjon:** Se `Kit CC/Agenter/VERSION.json` for Kit CC-versjon.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
