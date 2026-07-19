/**
 * @purdia/crypto — Secure Storage
 *
 * Encrypt/decrypt data sebelum disimpan ke localStorage menggunakan
 * Web Crypto API (AES-GCM). Key di-derive dari app secret + salt via PBKDF2.
 *
 * Ini bukan pengganti HTTPS atau server-side security, tapi mencegah
 * data sensitif (token, user info) terbaca langsung dari DevTools / XSS dump.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface SecureStorageConfig {
  /** Prefix for localStorage keys (default: 'purdia_') */
  prefix?: string
  /** Passphrase for key derivation (default: 'purdia-client-secret-v1') */
  secret?: string
  /** PBKDF2 iterations (default: 100_000) */
  iterations?: number
  /** In-memory cache TTL in ms (default: 5 minutes) */
  cacheTtl?: number
}

let STORAGE_PREFIX = 'purdia_'
let APP_SECRET = 'purdia-client-secret-v1'
let ITERATIONS = 100_000
let DEFAULT_CACHE_TTL = 5 * 60 * 1000

/**
 * Configure the secure storage module.
 * Call once at app startup before any read/write operations.
 */
export function configureSecureStorage(config: SecureStorageConfig): void {
  if (config.prefix !== undefined) STORAGE_PREFIX = config.prefix
  if (config.secret !== undefined) APP_SECRET = config.secret
  if (config.iterations !== undefined) ITERATIONS = config.iterations
  if (config.cacheTtl !== undefined) DEFAULT_CACHE_TTL = config.cacheTtl
}

// ---------------------------------------------------------------------------
// In-memory cache — avoid re-decrypting on every request
// ---------------------------------------------------------------------------

interface CacheEntry {
  value: string
  expiresAt: number
}

const memCache = new Map<string, CacheEntry>()

function cacheGet(key: string): string | null {
  const entry = memCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key)
    return null
  }
  return entry.value
}

function cacheSet(key: string, value: string, ttl = DEFAULT_CACHE_TTL): void {
  memCache.set(key, { value, expiresAt: Date.now() + ttl })
}

function cacheDelete(key: string): void {
  memCache.delete(key)
}

function cacheClear(): void {
  memCache.clear()
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function decode(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer)
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encode(APP_SECRET) as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encrypt & store a value in localStorage.
 * Also updates the in-memory cache.
 */
export async function secureSet(key: string, value: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await deriveKey(salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encode(value) as BufferSource,
  )

  // Store as: salt(base64) . iv(base64) . ciphertext(base64)
  const payload = [
    toBase64(salt.buffer as ArrayBuffer),
    toBase64(iv.buffer as ArrayBuffer),
    toBase64(encrypted),
  ].join('.')

  localStorage.setItem(STORAGE_PREFIX + key, payload)
  cacheSet(key, value)
}

/**
 * Retrieve & decrypt a value from localStorage.
 * Returns null if key doesn't exist or decryption fails.
 */
export async function secureGet(key: string): Promise<string | null> {
  const cached = cacheGet(key)
  if (cached !== null) return cached

  const raw = localStorage.getItem(STORAGE_PREFIX + key)
  if (!raw) return null

  try {
    const [saltB64, ivB64, dataB64] = raw.split('.')
    if (!saltB64 || !ivB64 || !dataB64) return null

    const salt = fromBase64(saltB64)
    const iv = fromBase64(ivB64)
    const data = fromBase64(dataB64)
    const cryptoKey = await deriveKey(salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      cryptoKey,
      data as BufferSource,
    )
    const value = decode(decrypted)

    cacheSet(key, value)
    return value
  } catch {
    secureRemove(key)
    return null
  }
}

/**
 * Remove an encrypted value from localStorage.
 * Also evicts from in-memory cache.
 */
export function secureRemove(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key)
  cacheDelete(key)
}

/**
 * Remove all prefixed items from localStorage.
 * Also clears the in-memory cache.
 */
export function secureClearAll(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(STORAGE_PREFIX)) keys.push(k)
  }
  keys.forEach((k) => localStorage.removeItem(k))
  cacheClear()
}
