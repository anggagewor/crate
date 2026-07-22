<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@purdia/theme'
import { BaseButton } from '@purdia/ui'
import { Moon, Sun, Monitor, PanelLeftClose, PanelLeft, Search } from 'lucide-vue-next'

const appStore = useAppStore()
const themeStore = useThemeStore()

const sidebarIcon = computed(() => appStore.sidebarCollapsed ? PanelLeft : PanelLeftClose)
const themeIcon = computed(() => {
  if (themeStore.theme === 'system') return Monitor
  return themeStore.theme === 'light' ? Moon : Sun
})
const themeLabel = computed(() => {
  if (themeStore.theme === 'system') return 'System'
  return themeStore.theme === 'light' ? 'Light' : 'Dark'
})

function openCommandPalette() {
  // Dispatch Cmd+K to trigger the CommandPalette
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
}
</script>

<template>
  <header
    class="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 fixed top-0 right-0 z-30"
    :class="appStore.sidebarCollapsed ? 'left-16' : 'left-64'"
  >
    <div class="flex items-center gap-3">
      <BaseButton variant="ghost" size="sm" :icon="sidebarIcon" @click="appStore.toggleSidebar()" />

      <button
        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        @click="openCommandPalette"
      >
        <Search :size="14" />
        <span>Search tools...</span>
        <kbd class="ml-2 text-xs px-1.5 py-0.5 bg-white dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500">⌘K</kbd>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <BaseButton
        variant="ghost"
        size="sm"
        :icon="themeIcon"
        :title="`Theme: ${themeLabel}`"
        @click="themeStore.toggle()"
      />
    </div>
  </header>
</template>
