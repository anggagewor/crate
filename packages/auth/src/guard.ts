/**
 * @purdia/auth — Route Guard
 *
 * Vue Router navigation guard that handles:
 * - Redirecting unauthenticated users to login
 * - Redirecting authenticated users away from guest-only pages
 */

import type { Router, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from './store'

export interface AuthGuardOptions {
  /** Route name for login page (default: 'login') */
  loginRoute?: string
  /** Route name for authenticated landing (default: 'dashboard') */
  homeRoute?: string
  /** Meta key that marks a route as guest-only (default: 'guest') */
  guestMeta?: string
  /** Meta key that marks a route as public (default: 'public') */
  publicMeta?: string
}

/**
 * Install auth guard on a Vue Router instance.
 *
 * @example
 * ```ts
 * import { createAuthGuard } from '@purdia/auth'
 *
 * createAuthGuard(router, {
 *   loginRoute: 'login',
 *   homeRoute: 'dashboard',
 * })
 * ```
 */
export function createAuthGuard(router: Router, options: AuthGuardOptions = {}): void {
  const {
    loginRoute = 'login',
    homeRoute = 'dashboard',
    guestMeta = 'guest',
    publicMeta = 'public',
  } = options

  router.beforeEach(async (to: RouteLocationNormalized) => {
    const auth = useAuthStore()

    // Wait for auth to be ready (async decrypt from secure storage)
    if (!auth.ready) {
      await auth.init()
    }

    const isGuestRoute = to.meta[guestMeta] === true
    const isPublicRoute = to.meta[publicMeta] === true

    // If not authenticated and trying to access a protected route → login
    if (!auth.isAuthenticated && !isGuestRoute && !isPublicRoute) {
      return { name: loginRoute, query: { redirect: to.fullPath } }
    }

    // If authenticated and trying to access guest-only route → home
    if (auth.isAuthenticated && isGuestRoute && !isPublicRoute) {
      return { name: homeRoute }
    }
  })
}
