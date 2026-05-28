/**
 * API-nøkkel-kryptering (AES-256-GCM)
 *
 * Nøkkelavledning: scryptSync med tilfeldig master key (lagret i .master-key).
 * Salt basert på maskinspesifikke verdier (hostname + homedir).
 * IV: 12 bytes per NIST SP 800-38D for AES-GCM.
 * Hver kryptering bruker tilfeldig IV for å sikre unikhet.
 */

import { scryptSync, randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto'
import { hostname, homedir } from 'node:os'
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 12  // NIST SP 800-38D: 96 bits (12 bytes) for AES-GCM
const AUTH_TAG_LENGTH = 16
const MASTER_KEY_FILENAME = '.master-key'
const SCRYPT_COST = 16384  // N=2^14, balanse mellom sikkerhet og oppstartstid

/** @type {Buffer|null} */
let cachedKey = null

/** @type {string|null} */
let _overlayDir = null

/**
 * Sett overlay-dir for å finne .master-key filen.
 * MÅ kalles før encrypt/decrypt.
 * @param {string} dir - Sti til kit-cc-overlay/
 */
export function setCryptoDir(dir) {
  _overlayDir = dir
  cachedKey = null  // Tving ny nøkkelavledning
}

/**
 * Les eller opprett master key-fil.
 * Master key er en tilfeldig 64-tegns hex-streng lagret i .master-key.
 * @returns {string} Master key
 */
function loadOrCreateMasterKey() {
  if (!_overlayDir) throw new Error('setCryptoDir() må kalles før kryptoperasjoner')

  const keyPath = join(_overlayDir, MASTER_KEY_FILENAME)

  if (existsSync(keyPath)) {
    try {
      const key = readFileSync(keyPath, 'utf-8').trim()
      if (key.length >= 32) return key
    } catch {}
  }

  // Generer ny tilfeldig master key
  const key = randomBytes(32).toString('hex')
  writeFileSync(keyPath, key, 'utf-8')

  // Sett filrettigheter (kun eier) — skip på Windows
  if (process.platform !== 'win32') {
    try { chmodSync(keyPath, 0o600) } catch {}
  }

  return key
}

/**
 * Avled en stabil krypteringsnøkkel.
 * Bruker tilfeldig master key (fra fil) + maskin-salt via scrypt.
 * @returns {Buffer} 32-byte nøkkel
 */
export function deriveKey() {
  if (cachedKey) return cachedKey

  const masterKey = loadOrCreateMasterKey()
  const machineId = `${hostname()}:${homedir()}`
  const salt = createHash('sha256').update(machineId).digest()

  cachedKey = scryptSync(masterKey, salt, KEY_LENGTH, { N: SCRYPT_COST, r: 8, p: 1 })
  return cachedKey
}

/**
 * Krypter en plaintext-streng med AES-256-GCM.
 * @param {string} plaintext - Tekst å kryptere
 * @returns {{ iv: string, authTag: string, encrypted: string }} Kryptert objekt (alle hex)
 */
export function encrypt(plaintext) {
  const key = deriveKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  let encrypted = cipher.update(plaintext, 'utf-8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return {
    iv: iv.toString('hex'),
    authTag,
    encrypted
  }
}

/**
 * Dekrypter et kryptert objekt tilbake til plaintext.
 * @param {{ iv: string, authTag: string, encrypted: string }} data - Kryptert objekt
 * @returns {string} Dekryptert plaintext
 */
export function decrypt(data) {
  const key = deriveKey()
  const iv = Buffer.from(data.iv, 'hex')
  const authTag = Buffer.from(data.authTag, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(data.encrypted, 'hex', 'utf-8')
  decrypted += decipher.final('utf-8')

  return decrypted
}

/**
 * Sjekk om en verdi er et kryptert objekt (har iv, authTag, encrypted).
 * @param {any} value - Verdi å sjekke
 * @returns {boolean}
 */
export function isEncrypted(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.iv === 'string' &&
    typeof value.authTag === 'string' &&
    typeof value.encrypted === 'string'
  )
}
