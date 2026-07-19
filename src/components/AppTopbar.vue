<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@purdia/theme'
import { tools } from '@/data/tools'
import { BaseButton } from '@purdia/ui'
import { Moon, Sun, PanelLeftClose, PanelLeft, Search } from 'lucide-vue-next'

const appStore = useAppStore()
const themeStore = useThemeStore()
const router = useRouter()

const showSearch = ref(false)
const searchQuery = ref('')
const filteredTools = ref(tools)

const sidebarIcon = computed(() => appStore.sidebarCollapsed ? PanelLeft : PanelLeftClose)
const themeIcon = computed(() => themeStore.theme === 'light' ? Moon : Sun)

function onSearch() {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) {
    filteredTools.value = tools
    return
  }
  filteredTools.value = tools.filter(
    (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  )
}

function selectTool(route: string) {
  showSearch.value = false
  searchQuery.value = ''
  router.push(route)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    showSearch.value = !showSearch.value
    searchQuery.value = ''
    filteredTools.value = tools
  }
  if (e.key === 'Escape') {
    showSearch.value = false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
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
        @click="showSearch = true"
      >
        <Search :size="14" />
        <span>Search tools...</span>
        <kbd class="ml-2 text-xs px-1.5 py-0.5 bg-white dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500">⌘K</kbd>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <BaseButton variant="ghost" size="sm" :icon="themeIcon" @click="themeStore.toggle()" />
    </div>
  </header>

  <!-- Search modal / Command palette -->
  <Teleport to="body">
    <div
      v-if="showSearch"
      class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
    >
      <div class="fixed inset-0 bg-black/50" @click="showSearch = false" />
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search :size="18" class="text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tools..."
            class="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
            autofocus
            @input="onSearch"
          />
          <kbd class="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-gray-500">ESC</kbd>
        </div>
        <div class="max-h-80 overflow-y-auto p-2">
          <button
            v-for="tool in filteredTools"
            :key="tool.id"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
            @click="selectTool(tool.route)"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ tool.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ tool.description }}</div>
            </div>
            <span class="text-xs text-gray-400 capitalize">{{ tool.category }}</span>
          </button>
          <div v-if="filteredTools.length === 0" class="px-3 py-6 text-center text-sm text-gray-500">
            No tools found
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
