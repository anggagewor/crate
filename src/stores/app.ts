/**
 * App-level store: favorites, recents, sidebar state.
 * Theme is handled by @purdia/theme's useThemeStore.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { loadJson, saveJson } from '@/services/storage'

export interface AppState {
  favorites: string[]
  recents: string[]
  sidebarCollapsed: boolean
}

const STORAGE_FILE = 'settings.json'

const defaults: AppState = {
  favorites: [],
  recents: [],
  sidebarCollapsed: false,
}

export const useAppStore = defineStore('app', () => {
  const favorites = ref<string[]>([])
  const recents = ref<string[]>([])
  const sidebarCollapsed = ref(false)
  const ready = ref(false)

  async function init() {
    const saved = await loadJson<AppState>(STORAGE_FILE, defaults)
    favorites.value = saved.favorites
    recents.value = saved.recents
    sidebarCollapsed.value = saved.sidebarCollapsed
    ready.value = true
  }

  async function persist() {
    await saveJson<AppState>(STORAGE_FILE, {
      favorites: favorites.value,
      recents: recents.value,
      sidebarCollapsed: sidebarCollapsed.value,
    })
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    persist()
  }

  function toggleFavorite(toolId: string) {
    const idx = favorites.value.indexOf(toolId)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push(toolId)
    }
    persist()
  }

  function addRecent(toolId: string) {
    recents.value = [toolId, ...recents.value.filter((id) => id !== toolId)].slice(0, 10)
    persist()
  }

  function isFavorite(toolId: string): boolean {
    return favorites.value.includes(toolId)
  }

  function exportSettings(): string {
    return JSON.stringify({
      favorites: favorites.value,
      recents: recents.value,
      sidebarCollapsed: sidebarCollapsed.value,
    }, null, 2)
  }

  function importSettings(json: string) {
    try {
      const data = JSON.parse(json) as Partial<AppState>
      if (data.favorites) favorites.value = data.favorites
      if (data.recents) recents.value = data.recents
      if (data.sidebarCollapsed !== undefined) sidebarCollapsed.value = data.sidebarCollapsed
      persist()
    } catch {
      // invalid JSON, ignore
    }
  }

  return {
    favorites,
    recents,
    sidebarCollapsed,
    ready,
    init,
    toggleSidebar,
    toggleFavorite,
    addRecent,
    isFavorite,
    exportSettings,
    importSettings,
  }
})
