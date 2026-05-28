# protocol-MONITOR-OPPSETT.md — Kit CC Monitor Oppstartsprotokoll

> **SSOT for Monitor-oppsett.** Referert fra CLAUDE.md boot-sekvens.
> Versjon: 1.0.0 | Opprettet: 2026-02-23

---

## REGLER (alltid gjeldende)

- I all brukervendt kommunikasjon: Si "Kit CC Monitor" — ALDRI mappenavnet "kit-cc-overlay".
- En health-check som svarer betyr IKKE at det er dette prosjektets Monitor. Andre prosjekter kan kjøre Monitor på samme port. Bruk ALLTID PID-fil for å verifisere eierskap.
- Brukeren skal ALLTID dirigeres til Monitor-porten (444x), ALDRI dev-serverporten (300x). Alle URL-er, meldinger og oppstartsinfo skal vise Monitor-porten. Dev-serveren er en intern detalj.
- **Proxy er STANDARD. Standalone er SISTE UTVEI.** Monitor skal kjøre i proxy-modus (viser brukerens app med overlay) for alle prosjekter som har web-UI. Standalone-modus (kun dashboard) brukes KUN når proxy er teknisk umulig — dvs. prosjekter uten web-output (CLI, API, backend uten frontend). Hvis Monitor kjører i standalone for et webapp-prosjekt, er det en FEIL som må fikses via steg 4.6.1 i 4-MVP-agent.md.

---

## PROSEDYRE

### Forutsetning: Avhengigheter

Sjekk om `kit-cc-overlay/node_modules` finnes:
- NEI → Kjør automatisk: `npm install --prefix kit-cc-overlay/` (Vis bruker: "⏳ Installerer Monitor-avhengigheter...")
- JA → OK, avhengigheter installert

### Steg A: Sjekk om DETTE prosjektets Monitor allerede kjører

1. Les `kit-cc-overlay/monitor.pid` (hvis filen finnes)
2. Sjekk om PID-en lever: `kill -0 [PID] 2>/dev/null`
   - **PID lever:**
     - Les `overlay.port` fra PROJECT-STATE.json (fallback: 4444 hvis ikke satt)
     - Health-sjekk: `curl -s http://localhost:[PORT]/kit-cc/api/health`
     - Svarer → ✅ DETTE prosjektets Monitor kjører. Vis bruker: "🌐 Kit CC Monitor: http://localhost:[PORT]". **Ferdig — gå videre.**
     - Svarer ikke → PID lever men porten stemmer ikke. Drep prosessen: `kill [PID]`. Gå til Steg B.
   - **PID lever ikke** (eller monitor.pid mangler) → Gå til Steg B

### Steg B: Finn ledig port og start Monitor

1. **Bestem port:**
   - Les `overlay.port` fra PROJECT-STATE.json (hvis satt → start med denne)
   - Ellers → Start med 4444

2. **FOR HVER kandidat-port** (4444, 4445, 4446...):
   - Portsjekk (OS-spesifikk):
     - macOS/Linux: `lsof -ti:[PORT]`
     - Windows: `netstat -ano | findstr :[PORT]`
     - Sjekk OS med `uname -s` hvis usikker
   - Ingen output → Porten er LEDIG ✅ → Bruk denne
   - Output (PID) → Porten er OPPTATT → Prøv neste port

3. **Start Monitor** (Monitor skriver `overlay.port` til PROJECT-STATE.json selv):
   ```
   PORT=[PORT] nohup node kit-cc-overlay/server.js > kit-cc-overlay/monitor.log 2>&1 &
   echo $! > kit-cc-overlay/monitor.pid
   ```
   Vent 2 sekunder, sjekk health: `curl -s http://localhost:[PORT]/kit-cc/api/health`
   Les `overlay.port` tilbake fra PROJECT-STATE.json (Monitor har skrevet den).
   - Fungerer → Vis: "✅ Kit CC Monitor startet på http://localhost:[PORT]"
   - Feilet → Vis bruker:
     ```
     🖥️ Kit CC Monitor er klar, men må startes manuelt.
     Åpne en ny terminal og kjør:
     cd [prosjektsti]/kit-cc-overlay && node server.js
     Åpne deretter http://localhost:[PORT]
     (Du kan fortsette å bygge mens du gjør dette.)
     ```

### Etter oppstart

- ALLTID vis Monitor-URL til bruker: "🌐 Kit CC Monitor: http://localhost:[PORT]" (selv om Monitor allerede kjørte — bruker trenger alltid URL-en.)
- Les `.env` i prosjektroten for å oppdatere sesjonen med lagrede API-nøkler (REPLICATE_API_TOKEN, etc.)
- **MERK:** Ved boot-tid har dev-serveren vanligvis ikke startet ennå — Monitor kjører da i standalone som midlertidig tilstand. For webapp-prosjekter bytter steg 4.6.1 (4-MVP-agent.md) AUTOMATISK til proxy-modus når dev-serveren er klar. IKKE be brukeren åpne Monitor i nettleseren nå — vent til proxy er aktiv (steg 4.6.1), slik at brukeren ser appen sin, ikke bare dashboardet.

<!-- © 2026 Øyvind Daniel Paulsen / Aino AI Lab · ainolab.no · PolyForm-Noncommercial-1.0.0 -->
