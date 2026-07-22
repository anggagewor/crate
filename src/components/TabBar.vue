<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { getToolById } from '@/data/tools'
import { getToolIcon } from '@/composables/useToolIcon'
import { X, Pin } from 'lucide-vue-next'

const tabsStore = useTabsStore()
const router = useRouter()

// Context menu state
const contextMenu = ref<{ show: boolean; x: number; y: number; tabId: string }>({
  show: false,
  x: 0,
  y: 0,
  tabId: '',
})

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

function onContextMenu(e: MouseEvent, tabId: string) {
  e.preventDefault()
  contextMenu.value = { show: true, x: e.clientX, y: e.clientY, tabId }
  document.addEventListener('click', hideContextMenu, { once: true })
}

function hideContextMenu() {
  contextMenu.value.show = false
}

function ctxClose() {
  const wasActive = tabsStore.activeTabId === contextMenu.value.tabId
  tabsStore.closeTab(contextMenu.value.tabId)
  if (wasActive && tabsStore.activeTab) {
    router.push(tabsStore.activeTab.route)
  } else if (wasActive && !tabsStore.activeTab) {
    router.push('/')
  }
  hideContextMenu()
}

function ctxCloseOthers() {
  tabsStore.closeOtherTabs(contextMenu.value.tabId)
  const tab = tabsStore.tabs.find((t) => t.id === contextMenu.value.tabId)
  if (tab) router.push(tab.route)
  hideContextMenu()
}

function ctxCloseRight() {
  tabsStore.closeTabsToRight(contextMenu.value.tabId)
  hideContextMenu()
}

function ctxCloseAll() {
  tabsStore.closeAllTabs()
  router.push('/')
  hideContextMenu()
}

function ctxTogglePin() {
  tabsStore.togglePin(contextMenu.value.tabId)
  hideContextMenu()
}

function getContextTab() {
  return tabsStore.tabs.find((t) => t.id === contextMenu.value.tabId)
}
</script>

<template>
  <div v-if="tabsStore.tabs.length > 0" class="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 overflow-x-auto">
    <div
      v-for="tab in tabsStore.tabs"
      :key="tab.id"
      class="flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 cursor-pointer transition-colors shrink-0"
      :class="[
        tabsStore.activeTabId === tab.id
          ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-gray-50 dark:bg-gray-700/50'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30',
        tab.pinned ? 'italic' : ''
      ]"
      @click="switchTab(tab.id, tab.route)"
      @contextmenu="onContextMenu($event, tab.id)"
    >
      <Pin v-if="tab.pinned" :size="10" class="shrink-0 text-primary-500" />
      <component
        :is="getTabIcon(tab.toolId)"
        v-else-if="getTabIcon(tab.toolId)"
        :size="12"
        class="shrink-0"
      />
      <span class="truncate max-w-[120px]">{{ tab.title }}</span>
      <button
        v-if="!tab.pinned"
        class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        @click="closeTab(tab.id, $event)"
      >
        <X :size="12" />
      </button>
    </div>
  </div>

  <!-- Context Menu -->
  <Teleport to="body">
    <div
      v-if="contextMenu.show"
      class="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px] text-sm"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <button class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" @click="ctxTogglePin">
        {{ getContextTab()?.pinned ? 'Unpin Tab' : 'Pin Tab' }}
      </button>
      <hr class="my-1 border-gray-200 dark:border-gray-700">
      <button class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" @click="ctxClose">
        Close
      </button>
      <button class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" @click="ctxCloseOthers">
        Close Others
      </button>
      <button class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" @click="ctxCloseRight">
        Close to the Right
      </button>
      <hr class="my-1 border-gray-200 dark:border-gray-700">
      <button class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400" @click="ctxCloseAll">
        Close All
      </button>
    </div>
  </Teleport>
</template>
