/**
 * @purdia/auth — Auth Store
 *
 * Pinia store for auth state with encrypted token storage.
 * Framework for login/register — actual API calls are injected via config.
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { secureGet, secureSet, secureRemove } from '@purdia/crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  [key: string]: unknown
}

export interface AuthTokens {
  token: string
  refresh_token?: string
}

export interface AuthConfig {
  /** Custom login implementation. Return tokens + user. */
  login?: (email: string, password: string) => Promise<{ user: User; tokens: AuthTokens }>
  /** Custom register implementation. Return tokens + user. */
  register?: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ user: User; tokens: AuthTokens }>
  /** Custom forgot password implementation. */
  forgotPassword?: (email: string) => Promise<{ message: string }>
  /** Custom logout hook (e.g. call API to revoke token). */
  onLogout?: () => Promise<void> | void
  /** Storage keys (defaults: auth_token, refresh_token, auth_user) */
  keys?: {
    token?: string
    refreshToken?: string
    user?: string
  }
}

// ---------------------------------------------------------------------------
// Module config
// ---------------------------------------------------------------------------

let authConfig: AuthConfig = {}

/**
 * Configure the auth module. Call once at app startup.
 */
export function configureAuth(config: AuthConfig): void {
  authConfig = config
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

function getKey(type: 'token' | 'refreshToken' | 'user'): string {
  const defaults = { token: 'auth_token', refreshToken: 'refresh_token', user: 'auth_user' }
  return authConfig.keys?.[type] ?? defaults[type]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function init() {
    if (ready.value) return
    const savedToken = await secureGet(getKey('token'))
    const savedUser = await secureGet(getKey('user'))
    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        await clearStorage()
      }
    }
    ready.value = true
  }

  async function login(email: string, password: string) {
    if (authConfig.login) {
      const result = await authConfig.login(email, password)
      user.value = result.user
      token.value = result.tokens.token
      await secureSet(getKey('token'), result.tokens.token)
      if (result.tokens.refresh_token) {
        await secureSet(getKey('refreshToken'), result.tokens.refresh_token)
      }
      await secureSet(getKey('user'), JSON.stringify(result.user))
    } else {
      // Default mock implementation for development
      const mockUser: User = { id: 1, name: 'Admin User', email, avatar: undefined }
      const mockToken = 'mock-jwt-token-' + Date.now()
      const mockRefreshToken = 'mock-refresh-token-' + Date.now()

      user.value = mockUser
      token.value = mockToken
      await secureSet(getKey('token'), mockToken)
      await secureSet(getKey('refreshToken'), mockRefreshToken)
      await secureSet(getKey('user'), JSON.stringify(mockUser))
    }
  }

  async function register(name: string, email: string, password: string) {
    if (authConfig.register) {
      const result = await authConfig.register(name, email, password)
      user.value = result.user
      token.value = result.tokens.token
      await secureSet(getKey('token'), result.tokens.token)
      if (result.tokens.refresh_token) {
        await secureSet(getKey('refreshToken'), result.tokens.refresh_token)
      }
      await secureSet(getKey('user'), JSON.stringify(result.user))
    } else {
      const mockUser: User = { id: 1, name, email, avatar: undefined }
      const mockToken = 'mock-jwt-token-' + Date.now()
      const mockRefreshToken = 'mock-refresh-token-' + Date.now()

      user.value = mockUser
      token.value = mockToken
      await secureSet(getKey('token'), mockToken)
      await secureSet(getKey('refreshToken'), mockRefreshToken)
      await secureSet(getKey('user'), JSON.stringify(mockUser))
    }
  }

  async function forgotPassword(email: string) {
    if (authConfig.forgotPassword) {
      return authConfig.forgotPassword(email)
    }
    return { message: 'Link reset password telah dikirim ke email Anda.' }
  }

  async function clearStorage() {
    secureRemove(getKey('token'))
    secureRemove(getKey('refreshToken'))
    secureRemove(getKey('user'))
  }

  async function logout() {
    await authConfig.onLogout?.()
    user.value = null
    token.value = null
    await clearStorage()
  }

  return { user, token, isAuthenticated, ready, init, login, register, forgotPassword, logout }
})
