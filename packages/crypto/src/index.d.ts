/**
 * @purdia/crypto — Secure Storage
 *
 * Encrypt/decrypt data sebelum disimpan ke localStorage menggunakan
 * Web Crypto API (AES-GCM). Key di-derive dari app secret + salt via PBKDF2.
 *
 * Ini bukan pengganti HTTPS atau server-side security, tapi mencegah
 * data sensitif (token, user info) terbaca langsung dari DevTools / XSS dump.
 */
export interface SecureStorageConfig {
    /** Prefix for localStorage keys (default: 'purdia_') */
    prefix?: string;
    /** Passphrase for key derivation (default: 'purdia-client-secret-v1') */
    secret?: string;
    /** PBKDF2 iterations (default: 100_000) */
    iterations?: number;
    /** In-memory cache TTL in ms (default: 5 minutes) */
    cacheTtl?: number;
}
/**
 * Configure the secure storage module.
 * Call once at app startup before any read/write operations.
 */
export declare function configureSecureStorage(config: SecureStorageConfig): void;
/**
 * Encrypt & store a value in localStorage.
 * Also updates the in-memory cache.
 */
export declare function secureSet(key: string, value: string): Promise<void>;
/**
 * Retrieve & decrypt a value from localStorage.
 * Returns null if key doesn't exist or decryption fails.
 */
export declare function secureGet(key: string): Promise<string | null>;
/**
 * Remove an encrypted value from localStorage.
 * Also evicts from in-memory cache.
 */
export declare function secureRemove(key: string): void;
/**
 * Remove all prefixed items from localStorage.
 * Also clears the in-memory cache.
 */
export declare function secureClearAll(): void;
