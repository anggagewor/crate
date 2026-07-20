import { onMounted, onUnmounted } from 'vue'

export interface ShortcutMap {
  [key: string]: () => void
}

/**
 * Register keyboard shortcuts for a tool page.
 * Keys format: "ctrl+enter", "ctrl+shift+enter", "ctrl+shift+m", etc.
 */
export function useToolShortcuts(shortcuts: ShortcutMap) {
  function handler(e: KeyboardEvent) {
    const parts: string[] = []
    if (e.ctrlKey || e.metaKey) parts.push('ctrl')
    if (e.shiftKey) parts.push('shift')
    if (e.altKey) parts.push('alt')
    parts.push(e.key.toLowerCase())
    const combo = parts.join('+')

    if (shortcuts[combo]) {
      e.preventDefault()
      shortcuts[combo]()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handler)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handler)
  })
}
