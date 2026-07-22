/**
 * @purdia/theme — Theme Store
 *
 * Dark/light mode toggle + primary color switching.
 * Supports per-user persistence via a configurable user key.
 */

import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = 'light' | 'dark' | 'system'
export type PrimaryColor =
  | 'indigo'
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'teal'
  | 'violet'
  | 'slate'

export interface ColorOption {
  name: PrimaryColor
  label: string
  swatch: string
}

export interface ThemeConfig {
  /** Default color (default: 'indigo') */
  defaultColor?: PrimaryColor
  /** Function that returns current user identifier for per-user prefs */
  getUserKey?: () => string | null
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

let themeConfig: ThemeConfig = {}

export function configureTheme(config: ThemeConfig): void {
  themeConfig = config
}

// ---------------------------------------------------------------------------
// Color options
// ---------------------------------------------------------------------------

export const colorOptions: ColorOption[] = [
  { name: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { name: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { name: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { name: 'rose', label: 'Rose', swatch: '#f43f5e' },
  { name: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { name: 'teal', label: 'Teal', swatch: '#14b8a6' },
  { name: 'violet', label: 'Violet', swatch: '#8b5cf6' },
  { name: 'slate', label: 'Slate', swatch: '#64748b' },
]

const validColors = colorOptions.map((c) => c.name)

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(getInitialTheme())
  const primaryColor = ref<PrimaryColor>(getInitialColor())

  function getUserKey(): string | null {
    return themeConfig.getUserKey?.() ?? null
  }

  function getStorageKey(suffix: string): string {
    const userKey = getUserKey()
    return userKey ? `${suffix}:${userKey}` : suffix
  }

  function getInitialTheme(): Theme {
    const userKey = themeConfig.getUserKey?.() ?? null
    if (userKey) {
      const saved = localStorage.getItem(`theme:${userKey}`) as Theme | null
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    }

    const generic = localStorage.getItem('theme') as Theme | null
    if (generic === 'light' || generic === 'dark' || generic === 'system') return generic

    // Default: follow system preference
    return 'system'
  }

  function getInitialColor(): PrimaryColor {
    const defaultColor = themeConfig.defaultColor ?? 'indigo'
    const userKey = themeConfig.getUserKey?.() ?? null

    if (userKey) {
      const saved = localStorage.getItem(`primary_color:${userKey}`)
      if (saved && validColors.includes(saved as PrimaryColor)) return saved as PrimaryColor
    }

    const generic = localStorage.getItem('primary_color')
    if (generic && validColors.includes(generic as PrimaryColor)) return generic as PrimaryColor

    return defaultColor
  }

  function applyTheme(t: Theme) {
    if (typeof document === 'undefined') return
    const isDark =
      t === 'dark' ||
      (t === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function applyColor(color: PrimaryColor) {
    if (typeof document === 'undefined') return
    const classes = document.documentElement.classList
    classes.forEach((cls) => {
      if (cls.startsWith('theme-')) classes.remove(cls)
    })
    if (color !== 'indigo') {
      classes.add(`theme-${color}`)
    }
  }

  function toggle() {
    if (theme.value === 'system') {
      theme.value = 'light'
    } else if (theme.value === 'light') {
      theme.value = 'dark'
    } else {
      theme.value = 'system'
    }
  }

  function setColor(color: PrimaryColor) {
    primaryColor.value = color
  }

  /** Reload preferences for current user (call after login) */
  function loadForUser() {
    const userKey = getUserKey()
    if (!userKey) return

    const savedTheme = localStorage.getItem(`theme:${userKey}`) as Theme | null
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      theme.value = savedTheme
    }

    const savedColor = localStorage.getItem(`primary_color:${userKey}`)
    if (savedColor && validColors.includes(savedColor as PrimaryColor)) {
      primaryColor.value = savedColor as PrimaryColor
    }
  }

  // Listen for system theme changes when mode is 'system'
  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    })
  }

  // Watch & apply
  watch(
    theme,
    (val) => {
      const key = getStorageKey('theme')
      localStorage.setItem(key, val)
      applyTheme(val)
    },
    { immediate: true },
  )

  watch(
    primaryColor,
    (val) => {
      const key = getStorageKey('primary_color')
      localStorage.setItem(key, val)
      applyColor(val)
    },
    { immediate: true },
  )

  return { theme, primaryColor, colorOptions, toggle, setColor, loadForUser }
})
