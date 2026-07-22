/**
 * Tab management store — allows opening multiple tools as tabs.
 * Persisted data for each tool is cleared when its tab is closed.
 * Open tabs are saved to storage and restored on app restart.
 */

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { getToolById } from '@/data/tools'
import { clearPersistedState } from '@/composables/usePersistentInput'
import { loadJson, saveJson } from '@/services/storage'

export interface Tab {
  id: string
  toolId: string
  title: string
  route: string
  pinned?: boolean
}

interface TabSessionData {
  tabs: Tab[]
  activeTabId: string | null
}

const SESSION_FILE = 'tab-session.json'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([])
  const activeTabId = ref<string | null>(null)

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) || null)

  // Save session debounced
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  function persistSession() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveJson<TabSessionData>(SESSION_FILE, {
        tabs: tabs.value,
        activeTabId: activeTabId.value,
      })
    }, 500)
  }

  // Restore session on init
  async function restoreSession() {
    const saved = await loadJson<TabSessionData>(SESSION_FILE, { tabs: [], activeTabId: null })
    if (saved.tabs.length > 0) {
      tabs.value = saved.tabs
      activeTabId.value = saved.activeTabId
    }
  }

  // Watch for tab changes to auto-persist
  watch([tabs, activeTabId], () => persistSession(), { deep: true })

  function openTab(toolId: string, route: string) {
    // Check if already open
    const existing = tabs.value.find((t) => t.toolId === toolId)
    if (existing) {
      activeTabId.value = existing.id
      return
    }

    const tool = getToolById(toolId)
    const tab: Tab = {
      id: crypto.randomUUID(),
      toolId,
      title: tool?.name || toolId,
      route,
      pinned: false,
    }
    tabs.value.push(tab)
    activeTabId.value = tab.id
  }

  function closeTab(tabId: string) {
    const idx = tabs.value.findIndex((t) => t.id === tabId)
    if (idx === -1) return

    const closedTab = tabs.value[idx]
    // Don't close pinned tabs
    if (closedTab.pinned) return

    clearPersistedState(closedTab.toolId)
    tabs.value.splice(idx, 1)

    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        activeTabId.value = tabs.value[Math.min(idx, tabs.value.length - 1)].id
      } else {
        activeTabId.value = null
      }
    }
  }

  function closeOtherTabs(tabId: string) {
    const closedTabs = tabs.value.filter((t) => t.id !== tabId && !t.pinned)
    closedTabs.forEach((t) => clearPersistedState(t.toolId))
    tabs.value = tabs.value.filter((t) => t.id === tabId || t.pinned)
    activeTabId.value = tabId
  }

  function closeTabsToRight(tabId: string) {
    const idx = tabs.value.findIndex((t) => t.id === tabId)
    if (idx === -1) return
    const toClose = tabs.value.slice(idx + 1).filter((t) => !t.pinned)
    toClose.forEach((t) => clearPersistedState(t.toolId))
    tabs.value = tabs.value.filter((t, i) => i <= idx || t.pinned)
    if (!tabs.value.find((t) => t.id === activeTabId.value)) {
      activeTabId.value = tabId
    }
  }

  function closeAllTabs() {
    const unpinned = tabs.value.filter((t) => !t.pinned)
    unpinned.forEach((t) => clearPersistedState(t.toolId))
    tabs.value = tabs.value.filter((t) => t.pinned)
    activeTabId.value = tabs.value.length > 0 ? tabs.value[0].id : null
  }

  function togglePin(tabId: string) {
    const tab = tabs.value.find((t) => t.id === tabId)
    if (!tab) return
    tab.pinned = !tab.pinned
    // Move pinned tabs to the left
    if (tab.pinned) {
      const idx = tabs.value.indexOf(tab)
      tabs.value.splice(idx, 1)
      const lastPinnedIdx = tabs.value.filter((t) => t.pinned).length
      tabs.value.splice(lastPinnedIdx, 0, tab)
    }
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    restoreSession,
    openTab,
    closeTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs,
    togglePin,
  }
})
