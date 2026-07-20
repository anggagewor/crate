<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { getToolById } from '@/data/tools'
import { getToolIcon } from '@/composables/useToolIcon'
import { X } from 'lucide-vue-next'

const tabsStore = useTabsStore()
const router = useRouter()

function switchTab(tabId: string, route: string) {
  tabsStore.activeTabId = tabId
  router.push(route)
}

function closeTab(tabId: string, event: MouseEvent) {
  event.stopPropagation()
  const wasActive = tabsStore.activeTabId === tabId
  tabsStore.closeTab(tabId)

  if (wasActive && tabsStore.activeTab) {
    router.push(tabsStore.activeTab.route)
  } else if (wasActive && !tabsStore.activeTab) {
    router.push('/')
  }
}

function getTabIcon(toolId: string) {
  const tool = getToolById(toolId)
  return tool ? getToolIcon(tool.icon) : null
}
</script>

<template>
  <div v-if="tabsStore.tabs.length > 0" class="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 overflow-x-auto">
    <div
      v-for="tab in tabsStore.tabs"
      :key="tab.id"
      class="flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 cursor-pointer transition-colors shrink-0"
      :class="tabsStore.activeTabId === tab.id
        ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-gray-50 dark:bg-gray-700/50'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'"
      @click="switchTab(tab.id, tab.route)"
    >
      <component
        :is="getTabIcon(tab.toolId)"
        v-if="getTabIcon(tab.toolId)"
        :size="12"
        class="shrink-0"
      />
      <span class="truncate max-w-[120px]">{{ tab.title }}</span>
      <button
        class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        @click="closeTab(tab.id, $event)"
      >
        <X :size="12" />
      </button>
    </div>
  </div>
</template>
