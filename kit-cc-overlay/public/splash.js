/**
 * M-007: Splash Screen with Adaptive Hybrid Retry
 *
 * Phased retry approach for connecting to health endpoint:
 *   Phase 1: Fast (5 retries × 100ms = 500ms total)
 *   Phase 2: Medium (5 retries × 300ms = 1.5s total)
 *   Phase 3: Slow (5 retries × 1000ms = 5s total)
 * Total max time: 7 seconds
 *
 * Status messages:
 *   Phase 1: "Starter Kit CC Monitor..."
 *   Phase 2: "Venter på server..."
 *   Phase 3: "Tar lenger enn forventet..."
 *   Failure: "Kunne ikke koble til. Sjekk konsollen." + Retry-button
 */

// Auth skjer via httpOnly cookie (satt av server ved HTML-levering).
// credentials: 'same-origin' sikrer at cookie sendes med alle fetch-kall.

// Adaptive retry config
const RETRY_PHASES = [
  { retries: 5, delayMs: 100 },   // Fast: 500ms total
  { retries: 5, delayMs: 300 },   // Medium: 1.5s total
  { retries: 5, delayMs: 1000 }   // Slow: 5s total
];
const MAX_TOTAL_MS = 7000;

/**
 * Health check with adaptive phased retry
 */
async function pollHealthEndpoint() {
  const startTime = Date.now();
  let totalAttempts = 0;
  const phaseMessages = [
    'Starter Kit CC Monitor...',
    'Venter på server...',
    'Tar lenger enn forventet...'
  ];

  for (let phaseIdx = 0; phaseIdx < RETRY_PHASES.length; phaseIdx++) {
    const phase = RETRY_PHASES[phaseIdx];
    const phaseMessage = phaseMessages[phaseIdx];

    console.log(`[Splash] Fase ${phaseIdx + 1}: ${phaseMessage} (${phase.retries} × ${phase.delayMs}ms)`);

    for (let attempt = 0; attempt < phase.retries; attempt++) {
      totalAttempts++;

      // Check total time budget
      if (Date.now() - startTime > MAX_TOTAL_MS) {
        console.log(`[Splash] Tidsbudsjett oppbrukt (${MAX_TOTAL_MS}ms)`);
        return { success: false, phase: phaseIdx + 1, attempts: totalAttempts, reason: 'timeout' };
      }

      try {
        console.log(`[Splash] Forsøk ${totalAttempts}: Sjekker /kit-cc/api/health`);
        const res = await fetch('/kit-cc/api/health', {
          method: 'GET',
          credentials: 'same-origin',
          signal: AbortSignal.timeout(2000) // 2s timeout per request
        });

        if (res.ok) {
          const elapsed = Date.now() - startTime;
          console.log(`[Splash] ✅ Suksess etter ${elapsed}ms (forsøk ${totalAttempts})`);
          return { success: true, phase: phaseIdx + 1, attempts: totalAttempts, elapsed };
        }
        console.log(`[Splash] Status ${res.status} — prøver igjen`);
      } catch (err) {
        console.log(`[Splash] Feil: ${err.message}`);
      }

      // Wait before next attempt (except last attempt in phase)
      if (attempt < phase.retries - 1) {
        console.log(`[Splash]   Venter ${phase.delayMs}ms før neste forsøk`);
        await new Promise(resolve => setTimeout(resolve, phase.delayMs));
      }
    }
  }

  const totalElapsed = Date.now() - startTime;
  console.log(`[Splash] ❌ Alle faser fullført uten suksess (${totalElapsed}ms, ${totalAttempts} forsøk)`);
  return { success: false, phase: RETRY_PHASES.length, attempts: totalAttempts, reason: 'exhausted' };
}

/**
 * Show error state with retry button
 */
function showErrorState() {
  const splash = document.querySelector('.splash');
  const statusText = document.getElementById('statusText');
  const welcomeText = document.getElementById('welcomeText');
  const status = document.querySelector('.splash .status');

  statusText.textContent = 'Tilkoblingsfeil';
  welcomeText.innerHTML =
    'Kunne ikke koble til Kit CC Monitor. Sjekk at serveren kjører.';

  // Stop pulse animation
  const dot = status.querySelector('.dot');
  if (dot) {
    dot.style.animation = 'none';
  }

  // Add retry button
  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'Prøv igjen';
  retryBtn.style.cssText = `
    margin-top: 1.5rem;
    padding: 8px 16px;
    background: linear-gradient(135deg, #8A00FF, #6B00CC);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: opacity 0.2s;
  `;
  retryBtn.onmouseover = () => (retryBtn.style.opacity = '0.85');
  retryBtn.onmouseout = () => (retryBtn.style.opacity = '1');
  retryBtn.onclick = () => {
    location.reload();
  };

  splash.appendChild(retryBtn);
}

/**
 * Main splash initialization
 */
async function initSplash() {
  try {
    console.log('[Splash] Starter adaptive retry...');

    const result = await pollHealthEndpoint();

    if (result.success) {
      console.log('[Splash] Server er klar — henter prosjektinfo');

      // Hent prosjektinfo og oppdater splash-teksten
      try {
        const res = await fetch('/kit-cc/api/state', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          const name = data.projectName || 'Venter på prosjektnavn...';
          const phase = data.currentPhase || 0;

          const projectNameEl = document.getElementById('projectName');
          const welcomeTextEl = document.getElementById('welcomeText');
          const statusTextEl = document.getElementById('statusText');
          const guideEl = document.getElementById('splashGuide');

          if (projectNameEl) projectNameEl.textContent = name;
          if (welcomeTextEl) {
            welcomeTextEl.textContent = phase === 0
              ? 'Prosjektet klargjøres. Snart starter vi byggingen!'
              : 'Her bygges ' + name + '. Appen din er på vei!';
          }
          if (statusTextEl) {
            statusTextEl.textContent = phase === 0 ? 'Klassifisering pågår' : 'Fase ' + phase + ' aktiv';
          }
          // Vis veiviseren og pil kun for pre-MVP (fase 0-3)
          const arrowEl = document.getElementById('splashArrow');
          if (phase < 4) {
            if (guideEl) guideEl.classList.add('visible');
            if (arrowEl) setTimeout(() => arrowEl.classList.add('visible'), 800);
          } else {
            if (guideEl) guideEl.classList.remove('visible');
            if (arrowEl) arrowEl.classList.remove('visible');
          }
          document.title = 'Kit CC Monitor — ' + name;
        }
      } catch (err) {
        console.log('[Splash] Kunne ikke hente prosjektinfo:', err.message);
      }

      // Lytt på SSE for live-oppdateringer (f.eks. når prosjektnavn settes under klassifisering)
      try {
        const events = new EventSource('/kit-cc/api/events', { withCredentials: true });
        events.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'STATE_CHANGED' && msg.data) {
              const d = msg.data;
              const projectNameEl = document.getElementById('projectName');
              const welcomeTextEl = document.getElementById('welcomeText');
              const statusTextEl = document.getElementById('statusText');
              const guideEl = document.getElementById('splashGuide');
              const arrowEl = document.getElementById('splashArrow');

              if (d.projectName && projectNameEl) {
                projectNameEl.textContent = d.projectName;
                document.title = 'Kit CC Monitor — ' + d.projectName;
              }
              if (d.currentPhase != null) {
                const pName = d.projectName || projectNameEl?.textContent || '';
                if (welcomeTextEl) {
                  welcomeTextEl.textContent = d.currentPhase === 0
                    ? 'Prosjektet klargjøres. Snart starter vi byggingen!'
                    : 'Her bygges ' + pName + '. Appen din er på vei!';
                }
                if (statusTextEl) {
                  statusTextEl.textContent = d.currentPhase === 0 ? 'Klassifisering pågår' : 'Fase ' + d.currentPhase + ' aktiv';
                }
                if (d.currentPhase < 4) {
                  if (guideEl) guideEl.classList.add('visible');
                  if (arrowEl) setTimeout(() => arrowEl.classList.add('visible'), 800);
                } else {
                  if (guideEl) guideEl.classList.remove('visible');
                  if (arrowEl) arrowEl.classList.remove('visible');
                }
              }
            }
          } catch (_) { /* ignorer parse-feil */ }
        };
      } catch (err) {
        console.log('[Splash] SSE ikke tilgjengelig:', err.message);
      }

      // Splash forblir synlig som velkomstside
    } else {
      console.error(`[Splash] Kunne ikke koble til (fase ${result.phase}, ${result.attempts} forsøk)`);
      showErrorState();
    }
  } catch (err) {
    console.error('[Splash] Uventet feil:', err);
    showErrorState();
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSplash);
} else {
  initSplash();
}
