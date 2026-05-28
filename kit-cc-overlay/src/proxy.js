/**
 * Proxy-modus for Kit CC Monitor
 *
 * Proxyer brukerens dev-server og injiserer monitor-scriptet i HTML-responser.
 * Støtter WebSocket/HMR (Vite, Next.js, Webpack).
 */

import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware'
import { randomBytes } from 'node:crypto'

const startTime = Date.now()

/**
 * Sett opp proxy middleware
 *
 * @param {import('express').Application} app - Express-app
 * @param {import('http').Server} server - HTTP-server (for WebSocket upgrade)
 * @param {Object} options
 * @param {number} options.devServerPort - Brukerens dev-server port
 * @param {string} options.prefix - Kit CC rute-prefix (f.eks. /kit-cc)
 */
export function setupProxy(app, server, { devServerPort, prefix }) {
  const port = Number.isInteger(devServerPort) ? devServerPort : parseInt(devServerPort, 10)
  if (!port || port < 1 || port > 65535) {
    throw new Error(`Ugyldig devServerPort: ${devServerPort}. Må være et heltall mellom 1 og 65535.`)
  }
  const target = `http://localhost:${port}`

  const proxyMiddleware = createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    selfHandleResponse: true,

    // Interceptor: Injiser overlay-script i HTML-responser
    on: {
      proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const contentType = proxyRes.headers['content-type'] || ''

        // Kun injiser i HTML-responser
        if (!contentType.includes('text/html')) {
          return responseBuffer
        }

        const html = responseBuffer.toString('utf-8')

        // Generer unik nonce for denne requesten
        const nonce = randomBytes(16).toString('base64')

        // Modifiser CSP-headere til å tillate Kit CC-scriptet via nonce
        modifyCSPHeaders(res, nonce)

        // Guard: don't double-inject if overlay.js is already present
        if (html.includes('overlay.js')) {
          return responseBuffer
        }

        // Injiser overlay-script med nonce før </body>
        const overlayScript = `
<!-- Kit CC Monitor -->
<script nonce="${nonce}" src="${prefix}/assets/overlay.js?v=${startTime}"></script>
`
        if (html.includes('</body>')) {
          return html.replace('</body>', `${overlayScript}</body>`)
        }

        // Fallback: append til slutten
        return html + overlayScript
      }),

      error: (err, req, res) => {
        console.error(`❌ Proxy-feil: ${err.message}`)

        // Ikke krasj ved tilkoblingsfeil — dev-serveren er kanskje ikke startet ennå
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(`
<!DOCTYPE html>
<html lang="no">
<head><title>Kit CC — Venter på dev-server</title></head>
<body style="font-family: system-ui; padding: 40px; background: #101014; color: #E4E4E7;">
  <h1>⏳ Venter på dev-server</h1>
  <p>Kit CC prøver å koble til <code>localhost:${port}</code>, men den svarer ikke ennå.</p>
  <p>Start dev-serveren din (f.eks. <code>npm run dev</code>) og last siden på nytt.</p>
  <script>setTimeout(() => location.reload(), 3000)</script>
</body>
</html>`)
        }
      }
    },

    // Ikke proxy Kit CC sine egne ruter
    pathFilter: (path) => {
      return !path.startsWith(prefix)
    }
  })

  // Registrer proxy som siste middleware (etter Kit CC-ruter)
  app.use(proxyMiddleware)

  // WebSocket upgrade for HMR
  server.on('upgrade', (req, socket, head) => {
    // Ikke proxy Kit CC sine egne WebSocket-tilkoblinger (SSE bruker HTTP)
    if (req.url && req.url.startsWith(prefix)) {
      return
    }
    try {
      proxyMiddleware.upgrade(req, socket, head)
    } catch (err) {
      console.error('⚠️  WebSocket upgrade feilet:', err.message)
      socket.destroy()
    }
  })

  // Håndter socket-feil for å unngå krasj
  server.on('error', (err) => {
    console.error('⚠️  Server-feil:', err.message)
  })
}

/**
 * Modifiser CSP-headere for å tillate Kit CC Monitor-scriptet via nonce.
 * Bruker nonce-basert tilnærming i stedet for 'unsafe-inline' — dette
 * bevarer appens CSP-policy og tillater kun det spesifikke injiserte scriptet.
 *
 * @param {import('http').ServerResponse} res
 * @param {string} nonce - Base64-kodet tilfeldig nonce for denne requesten
 */
function modifyCSPHeaders(res, nonce) {
  const cspHeaders = [
    'content-security-policy',
    'content-security-policy-report-only',
    'x-content-security-policy'
  ]

  const nonceDirective = `'nonce-${nonce}'`

  for (const header of cspHeaders) {
    const existing = res.getHeader(header)
    if (!existing) continue

    const csp = String(existing)
    if (csp.includes('script-src')) {
      // Legg til nonce i eksisterende script-src
      const modified = csp.replace(
        /script-src\s+([^;]*)/,
        (match, sources) => `script-src ${sources} ${nonceDirective}`
      )
      res.setHeader(header, modified)
    } else if (csp.includes('default-src')) {
      // Ingen script-src men default-src finnes — legg til script-src med nonce
      const modified = csp + `; script-src 'self' ${nonceDirective}`
      res.setHeader(header, modified)
    } else {
      // Minimal CSP uten relevante direktiver — legg til script-src med nonce
      const modified = csp + `; script-src ${nonceDirective}`
      res.setHeader(header, modified)
    }
  }
}
