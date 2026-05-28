/**
 * SSE (Server-Sent Events) Manager
 *
 * Håndterer sanntids-push av hendelser til alle tilkoblede monitor-klienter.
 * Hendelsestyper: STATE_CHANGED, PROGRESS_UPDATED, MODULES_CHANGED, ERROR_CAPTURED
 *
 * Sikkerhet: Rate-limiting og maksimalt antall tilkoblinger for å forhindre DoS
 */

// Maks tilkobling levetid: 30 minutter (forhindrer zombie-tilkoblinger)
const MAX_CONNECTION_MS = 30 * 60 * 1000
// Maks antall samtidige SSE-tilkoblinger
const MAX_SSE_CLIENTS = 10

export class SSEManager {
  constructor() {
    /** @type {Set<import('http').ServerResponse>} */
    this.clients = new Set()
  }

  /**
   * Koble til en ny SSE-klient
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  connect(req, res) {
    // Rate-limiting: nekt nye tilkoblinger hvis antallet overstiger maks
    if (this.clients.size >= MAX_SSE_CLIENTS) {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Too many SSE connections' }))
      return
    }

    // SSE-headere
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Nginx-kompatibilitet
    })

    // Send initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`)

    // Heartbeat hvert 30. sekund for å holde tilkoblingen åpen
    const heartbeat = setInterval(() => {
      try {
        if (!res.writableEnded) {
          res.write(': heartbeat\n\n')
        } else {
          cleanup()
        }
      } catch {
        cleanup()
      }
    }, 30000)

    // Timeout: lukk tilkoblinger etter MAX_CONNECTION_MS (forhindrer minnelekkasje)
    const timeout = setTimeout(() => {
      cleanup()
      try {
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ type: 'RECONNECT', reason: 'timeout' })}\n\n`)
          res.end()
        }
      } catch {}
    }, MAX_CONNECTION_MS)

    this.clients.add(res)

    const cleanup = () => {
      clearInterval(heartbeat)
      clearTimeout(timeout)
      this.clients.delete(res)
    }

    // Rydd opp når klienten kobler fra
    req.on('close', cleanup)
    req.on('error', cleanup)
  }

  /**
   * Send hendelse til alle tilkoblede klienter
   * @param {string} type - Hendelsestype (STATE_CHANGED, PROGRESS_UPDATED, etc.)
   * @param {any} data - Data å sende
   */
  broadcast(type, data = {}) {
    const message = JSON.stringify({ type, data, timestamp: Date.now() })
    const payload = `data: ${message}\n\n`

    const deadClients = []
    for (const client of this.clients) {
      try {
        if (!client.writableEnded) {
          client.write(payload)
        } else {
          deadClients.push(client)
        }
      } catch {
        // Klienten har koblet fra — fjern den
        deadClients.push(client)
      }
    }
    // Rydd opp døde klienter etter iterasjon
    for (const client of deadClients) {
      this.clients.delete(client)
    }
  }

  /**
   * Antall tilkoblede klienter
   */
  get clientCount() {
    return this.clients.size
  }

  /**
   * Lukk alle tilkoblinger
   */
  closeAll() {
    for (const client of this.clients) {
      try {
        if (!client.writableEnded) client.end()
      } catch {
        // Ignorer feil ved lukking
      }
    }
    this.clients.clear()
  }
}
