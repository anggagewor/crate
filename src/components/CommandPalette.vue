<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { tools } from '@/data/tools'
import { getToolIcon } from '@/composables/useToolIcon'
import { useAppStore } from '@/stores/app'
import { Search } from 'lucide-vue-next'

const router = useRouter()
const appStore = useAppStore()

const show = ref(false)
const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const filteredTools = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) {
    // Show recents first, then the rest
    const recentTools = appStore.recents
      .map((id) => tools.find((t) => t.id === id))
      .filter(Boolean) as typeof tools
    const rest = tools.filter((t) => !appStore.recents.includes(t.id))
    return [...recentTools, ...rest].slice(0, 15)
  }
  return tools
    .filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    )
    .slice(0, 15)
})

watch(query, () => {
  selectedIndex.value = 0
})

function open() {
  show.value = true
  query.value = ''
  selectedIndex.value = 0
  nextTick(() => inputRef.value?.focus())
}

function close() {
  show.value = false
}

function selectTool(route: string) {
  router.push(route)
  close()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredTools.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const tool = filteredTools.value[selectedIndex.value]
    if (tool) selectTool(tool.route)
  } else if (e.key === 'Escape') {
    close()
  }
}

// Global shortcut: Cmd+K / Ctrl+K
function globalKeyHandler(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (show.value) {
      close()
    } else {
      open()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', globalKeyHandler)
})

onUnmounted(() => {
  document.removeEventListener('keydown', globalKeyHandler)
})

defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        @click="close"
      />
    </Transition>

    <!-- Palette -->
    <Transition name="scale">
      <div
        v-if="show"
        class="fixed z-50 top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search :size="18" class="text-gray-400 shrink-0" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              placeholder="Search tools..."
              @keydown="handleKeydown"
            >
            <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-[320px] overflow-y-auto py-1">
            <div v-if="filteredTools.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
              No tools found
            </div>
            <button
              v-for="(tool, idx) in filteredTools"
              :key="tool.id"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              :class="idx === selectedIndex
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
              @click="selectTool(tool.route)"
              @mouseenter="selectedIndex = idx"
            >
              <component
                :is="getToolIcon(tool.icon)"
                :size="16"
                class="shrink-0 opacity-60"
              />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium truncate">{{ tool.name }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ tool.description }}</div>
              </div>
              <span v-if="!query && appStore.recents.includes(tool.id)" class="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">recent</span>
            </button>
          </div>

          <!-- Footer -->
          <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-[10px] text-gray-400">
            <span><kbd class="font-mono">↑↓</kbd> navigate</span>
            <span><kbd class="font-mono">↵</kbd> open</span>
            <span><kbd class="font-mono">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scale-enter-active,
.scale-leave-active {
  transition: all 0.15s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: translate(-50%, 0) scale(0.95);
}
.scale-enter-to {
  transform: translate(-50%, 0) scale(1);
}
</style>
