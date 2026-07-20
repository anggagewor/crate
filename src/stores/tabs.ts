/**
 * Tab management store — allows opening multiple tools as tabs.
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getToolById } from '@/data/tools'

export interface Tab {
  id: string
  toolId: string
  title: string
  route: string
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([])
  const activeTabId = ref<string | null>(null)

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) || null)

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
    }
    tabs.value.push(tab)
    activeTabId.value = tab.id
  }

  function closeTab(tabId: string) {
    const idx = tabs.value.findIndex((t) => t.id === tabId)
    if (idx === -1) return

    tabs.value.splice(idx, 1)

    // If we closed the active tab, switch to adjacent
    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        activeTabId.value = tabs.value[Math.min(idx, tabs.value.length - 1)].id
      } else {
        activeTabId.value = null
      }
    }
  }

  function closeOtherTabs(tabId: string) {
    tabs.value = tabs.value.filter((t) => t.id === tabId)
    activeTabId.value = tabId
  }

  function closeAllTabs() {
    tabs.value = []
    activeTabId.value = null
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
  }
})
