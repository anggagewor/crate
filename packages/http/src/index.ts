/**
 * @purdia/http — Axios HTTP Client
 *
 * Framework-agnostic HTTP client with:
 * - Multi-service instance management
 * - Bearer token injection (encrypted via @purdia/crypto)
 * - Silent token refresh with request queuing
 * - Configurable error/unauthorized handlers
 */

import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { secureGet, secureRemove, secureSet } from '@purdia/crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status: number
}

export interface ServiceConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

export interface HttpClientConfig {
  /** Service definitions (at least 'main' and 'auth' recommended) */
  services: Record<string, ServiceConfig>
  /** Called when token refresh fails and user must re-authenticate */
  onUnauthorized?: () => void
  /** Called on non-422 errors (e.g. show toast) */
  onError?: (error: ApiError) => void
  /** Locale header value (default: 'id') */
  locale?: string | (() => string)
  /** Token storage keys */
  tokenKeys?: {
    access?: string
    refresh?: string
  }
}

// ---------------------------------------------------------------------------
// Module State
// ---------------------------------------------------------------------------

let config: HttpClientConfig = {
  services: {
    main: { baseURL: '/api', timeout: 30_000 },
    auth: { baseURL: '/api/auth', timeout: 15_000 },
  },
}

const instances = new Map<string, AxiosInstance>()

// ---------------------------------------------------------------------------
// Silent Refresh logic
// ---------------------------------------------------------------------------

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

function onRefreshFailed() {
  refreshSubscribers = []
}

function getTokenKey(type: 'access' | 'refresh'): string {
  if (type === 'access') return config.tokenKeys?.access ?? 'auth_token'
  return config.tokenKeys?.refresh ?? 'refresh_token'
}

async function attemptSilentRefresh(): Promise<string | null> {
  const refreshToken = await secureGet(getTokenKey('refresh'))
  if (!refreshToken) return null

  try {
    const authService = config.services['auth'] ?? config.services['main']!
    const response = await axios.post<{ data: { token: string; refresh_token?: string } }>(
      `${authService.baseURL}/refresh`,
      { refresh_token: refreshToken },
      {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: authService.timeout ?? 15_000,
      },
    )

    const { token, refresh_token: newRefreshToken } = response.data.data

    await secureSet(getTokenKey('access'), token)
    if (newRefreshToken) {
      await secureSet(getTokenKey('refresh'), newRefreshToken)
    }

    return token
  } catch {
    return null
  }
}

function forceLogout() {
  secureRemove(getTokenKey('access'))
  secureRemove(getTokenKey('refresh'))
  secureRemove('auth_user')
  config.onUnauthorized?.()
}

function getLocale(): string {
  if (!config.locale) return localStorage.getItem('app_locale') ?? 'id'
  if (typeof config.locale === 'function') return config.locale()
  return config.locale
}

// ---------------------------------------------------------------------------
// Default messages
// ---------------------------------------------------------------------------

function getDefaultMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Permintaan tidak valid.',
    401: 'Sesi telah berakhir. Silakan login kembali.',
    403: 'Akses ditolak.',
    404: 'Data tidak ditemukan.',
    422: 'Data yang dikirim tidak valid.',
    429: 'Terlalu banyak permintaan.',
    500: 'Terjadi kesalahan di server.',
  }
  return messages[status] ?? `Terjadi kesalahan (${status}).`
}

// ---------------------------------------------------------------------------
// Instance factory
// ---------------------------------------------------------------------------

function createInstance(serviceName: string): AxiosInstance {
  const serviceConfig = config.services[serviceName]
  if (!serviceConfig) {
    throw new Error(`[http] Service "${serviceName}" is not configured.`)
  }

  const instance = axios.create({
    baseURL: serviceConfig.baseURL,
    timeout: serviceConfig.timeout ?? 30_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...serviceConfig.headers,
    },
  })

  // --- Request Interceptor ---
  instance.interceptors.request.use(
    async (reqConfig: InternalAxiosRequestConfig) => {
      const token = await secureGet(getTokenKey('access'))
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`
      }
      reqConfig.headers['Accept-Language'] = getLocale()
      return reqConfig
    },
    (error) => Promise.reject(error),
  )

  // --- Response Interceptor ---
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
      // Network error / timeout
      if (!error.response) {
        const apiError: ApiError = {
          message: 'Koneksi gagal. Periksa jaringan internet kamu.',
          status: 0,
        }
        config.onError?.(apiError)
        return Promise.reject(apiError)
      }

      const { status, data } = error.response

      const apiError: ApiError = {
        message: data?.message ?? getDefaultMessage(status),
        errors: data?.errors,
        status,
      }

      // 401 Unauthorized — try silent refresh
      if (status === 401) {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (originalRequest._retry || originalRequest.url?.includes('/refresh')) {
          forceLogout()
          return Promise.reject(apiError)
        }

        if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true

          const newToken = await attemptSilentRefresh()

          if (newToken) {
            isRefreshing = false
            onTokenRefreshed(newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return instance(originalRequest)
          } else {
            isRefreshing = false
            onRefreshFailed()
            forceLogout()
            return Promise.reject(apiError)
          }
        }

        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(instance(originalRequest))
          })
          const checkInterval = setInterval(() => {
            if (!isRefreshing && refreshSubscribers.length === 0) {
              clearInterval(checkInterval)
              reject(apiError)
            }
          }, 50)
        })
      }

      // 403 Forbidden
      if (status === 403) {
        apiError.message = data?.message ?? 'Kamu tidak punya akses untuk melakukan ini.'
      }

      // 419 CSRF token mismatch
      if (status === 419) {
        apiError.message = 'Sesi telah kadaluarsa. Silakan refresh halaman.'
      }

      // 429 Too many requests
      if (status === 429) {
        apiError.message = 'Terlalu banyak permintaan. Coba lagi nanti.'
      }

      // 500+ Server error
      if (status >= 500) {
        apiError.message = 'Terjadi kesalahan di server. Coba lagi nanti.'
      }

      // Show error toast for all non-silent errors
      if (status !== 401 && status !== 422) {
        config.onError?.(apiError)
      }

      return Promise.reject(apiError)
    },
  )

  return instance
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize the HTTP client. Call once at app startup.
 *
 * @example
 * ```ts
 * import { initHttp } from '@purdia/http'
 *
 * initHttp({
 *   services: {
 *     main: { baseURL: '/api' },
 *     auth: { baseURL: '/api/auth' },
 *   },
 *   onUnauthorized: () => router.push('/login'),
 *   onError: (err) => toast.error(err.message),
 * })
 * ```
 */
export function initHttp(userConfig: HttpClientConfig): void {
  config = userConfig
  instances.clear()
}

/**
 * Get (or create) an axios instance for a given service.
 */
export function useHttp(service = 'main'): AxiosInstance {
  if (!instances.has(service)) {
    instances.set(service, createInstance(service))
  }
  return instances.get(service)!
}

/**
 * Default http instance (main service).
 * Lazy-initialized on first access.
 */
function getHttp(): AxiosInstance {
  return useHttp('main')
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

export function get<T = unknown>(url: string, cfg?: AxiosRequestConfig) {
  return getHttp()
    .get<ApiResponse<T>>(url, cfg)
    .then((r) => r.data)
}

export function post<T = unknown>(url: string, data?: unknown, cfg?: AxiosRequestConfig) {
  return getHttp()
    .post<ApiResponse<T>>(url, data, cfg)
    .then((r) => r.data)
}

export function put<T = unknown>(url: string, data?: unknown, cfg?: AxiosRequestConfig) {
  return getHttp()
    .put<ApiResponse<T>>(url, data, cfg)
    .then((r) => r.data)
}

export function patch<T = unknown>(url: string, data?: unknown, cfg?: AxiosRequestConfig) {
  return getHttp()
    .patch<ApiResponse<T>>(url, data, cfg)
    .then((r) => r.data)
}

export function del<T = unknown>(url: string, cfg?: AxiosRequestConfig) {
  return getHttp()
    .delete<ApiResponse<T>>(url, cfg)
    .then((r) => r.data)
}

/**
 * Upload file(s) with multipart/form-data.
 */
export function upload<T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
) {
  return getHttp()
    .post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    .then((r) => r.data)
}

/**
 * Download file as Blob.
 */
export function download(url: string, cfg?: AxiosRequestConfig) {
  return getHttp()
    .get<Blob>(url, { ...cfg, responseType: 'blob' })
    .then((response) => response)
    .catch(async (error) => {
      if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
        return Promise.reject(error)
      }

      if (error instanceof AxiosError && error.response?.data instanceof Blob) {
        const blob = error.response.data
        const status = error.response.status

        if (blob.type === 'application/json' || blob.type.includes('json')) {
          try {
            const text = await blob.text()
            const parsed = JSON.parse(text) as {
              message?: string
              errors?: Record<string, string[]>
            }
            const apiError: ApiError = {
              message: parsed.message ?? getDefaultMessage(status),
              errors: parsed.errors,
              status,
            }
            return Promise.reject(apiError)
          } catch {
            // fallthrough
          }
        }

        const apiError: ApiError = {
          message: getDefaultMessage(status),
          status,
        }
        return Promise.reject(apiError)
      }

      return Promise.reject(error)
    })
}

// Re-export types for consumers
export type { AxiosInstance, AxiosRequestConfig } from 'axios'
