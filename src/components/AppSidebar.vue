<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { categories, getToolsByCategory, tools, type ToolCategory } from '@/data/tools'
import {
  Home,
  Star,
  Braces,
  Sparkles,
  ArrowLeftRight,
  RefreshCw,
  Lock,
  Type,
  Wifi,
  ChevronDown,
} from 'lucide-vue-next'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

// Track which categories are expanded (for wide sidebar) — all collapsed by default
const expandedCategories = ref<Set<ToolCategory>>(new Set())

// Track which category flyout is visible (for collapsed sidebar)
const hoveredCategory = ref<ToolCategory | null>(null)
const flyoutStyle = ref<Record<string, string>>({})
let hideTimer: ReturnType<typeof setTimeout> | null = null
const iconMap: Record<string, typeof Home> = {
  Braces,
  Sparkles,
  ArrowLeftRight,
  RefreshCw,
  Lock,
  Type,
  Wifi,
}

function getCategoryIcon(iconName: string) {
  return iconMap[iconName] || Braces
}

const favoriteTools = computed(() => {
  return appStore.favorites
    .map((id) => tools.find((t) => t.id === id))
    .filter(Boolean)
})

function navigateTo(path: string) {
  router.push(path)
  hoveredCategory.value = null
}

function isActive(path: string): boolean {
  return route.path === path
}

function isCategoryActive(catId: ToolCategory): boolean {
  const catTools = getToolsByCategory(catId)
  return catTools.some((t) => route.path === t.route)
}

function toggleCategory(catId: ToolCategory) {
  if (expandedCategories.value.has(catId)) {
    expandedCategories.value.delete(catId)
  } else {
    expandedCategories.value.add(catId)
  }
}

function isCategoryExpanded(catId: ToolCategory): boolean {
  return expandedCategories.value.has(catId)
}

function showFlyout(catId: ToolCategory, event: MouseEvent) {
  if (hideTimer) clearTimeout(hideTimer)
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  flyoutStyle.value = {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.right + 8}px`,
    zIndex: '9999',
  }
  hoveredCategory.value = catId
}

function hideFlyout() {
  hideTimer = setTimeout(() => {
    hoveredCategory.value = null
  }, 100)
}

function keepFlyoutOpen() {
  if (hideTimer) clearTimeout(hideTimer)
}
</script>

<template>
  <aside
    class="fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 flex flex-col transition-all duration-200"
    :class="appStore.sidebarCollapsed ? 'w-16' : 'w-64'"
  >
    <!-- Logo / Brand -->
    <div class="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">C</span>
        </div>
        <span v-if="!appStore.sidebarCollapsed" class="font-semibold text-lg">Crate</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-3 px-2">
      <!-- Home -->
      <button
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition-colors cursor-pointer"
        :class="[
          appStore.sidebarCollapsed ? 'justify-center' : '',
          isActive('/') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
        @click="navigateTo('/')"
      >
        <Home :size="18" />
        <span v-if="!appStore.sidebarCollapsed">Home</span>
      </button>

      <!-- Favorites (only in expanded mode) -->
      <div v-if="appStore.favorites.length > 0 && !appStore.sidebarCollapsed" class="mt-3 mb-1">
        <div class="flex items-center gap-2 px-3 mb-1">
          <Star :size="12" class="text-amber-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Favorites</span>
        </div>
        <button
          v-for="tool in favoriteTools"
          :key="tool!.id"
          class="w-full flex items-center gap-3 px-3 py-1.5 pl-7 rounded-lg text-sm transition-colors cursor-pointer"
          :class="isActive(tool!.route) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
          @click="navigateTo(tool!.route)"
        >
          <span class="truncate">{{ tool!.name }}</span>
        </button>
      </div>

      <!-- Categories -->
      <div v-for="cat in categories" :key="cat.id" class="mt-2">
        <!-- EXPANDED SIDEBAR: collapsible submenu -->
        <template v-if="!appStore.sidebarCollapsed">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            :class="isCategoryActive(cat.id) && !isCategoryExpanded(cat.id) ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            @click="toggleCategory(cat.id)"
          >
            <component :is="getCategoryIcon(cat.icon)" :size="16" class="shrink-0 text-gray-400" />
            <span class="flex-1 text-left font-medium text-xs uppercase tracking-wide">{{ cat.label }}</span>
            <ChevronDown
              :size="14"
              class="text-gray-400 transition-transform duration-200"
              :class="isCategoryExpanded(cat.id) ? 'rotate-0' : '-rotate-90'"
            />
          </button>

          <!-- Submenu items -->
          <transition
            enter-active-class="transition-all duration-200 ease-out overflow-hidden"
            leave-active-class="transition-all duration-150 ease-in overflow-hidden"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-if="isCategoryExpanded(cat.id)" class="mt-0.5 mb-1">
              <button
                v-for="tool in getToolsByCategory(cat.id)"
                :key="tool.id"
                class="w-full flex items-center gap-2 px-3 py-1.5 pl-9 rounded-lg text-sm transition-colors cursor-pointer"
                :class="isActive(tool.route) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
                @click="navigateTo(tool.route)"
              >
                <span class="truncate">{{ tool.name }}</span>
              </button>
            </div>
          </transition>
        </template>

        <!-- COLLAPSED SIDEBAR: icon with flyout on hover -->
        <template v-else>
          <button
            class="w-full flex justify-center py-2 rounded-lg transition-colors cursor-pointer"
            :class="isCategoryActive(cat.id) ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600'"
            @mouseenter="showFlyout(cat.id, $event)"
            @mouseleave="hideFlyout"
          >
            <component :is="getCategoryIcon(cat.icon)" :size="18" />
          </button>
        </template>
      </div>
    </nav>
  </aside>

  <!-- Flyout popup (teleported to body to avoid overflow clipping) -->
  <Teleport to="body">
    <div
      v-if="hoveredCategory && appStore.sidebarCollapsed"
      :style="flyoutStyle"
      class="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
      @mouseenter="keepFlyoutOpen"
      @mouseleave="hideFlyout"
    >
      <div class="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
        {{ categories.find(c => c.id === hoveredCategory)?.label }}
      </div>
      <button
        v-for="tool in getToolsByCategory(hoveredCategory)"
        :key="tool.id"
        class="w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer"
        :class="isActive(tool.route) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
        @click="navigateTo(tool.route)"
      >
        {{ tool.name }}
      </button>
    </div>
  </Teleport>
</template>
