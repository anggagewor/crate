<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, type Component } from 'vue'

export interface CommandItem {
  id: string
  label: string
  shortcut?: string
  icon?: Component
  group?: string
  disabled?: boolean
}

interface Props {
  modelValue: boolean
  items: CommandItem[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type a command or search...',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [item: CommandItem]
}>()

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement>()
const listRef = ref<HTMLElement>()

const filteredItems = computed(() => {
  if (!query.value) return props.items.filter((i) => !i.disabled)
  const q = query.value.toLowerCase()
  return props.items.filter((i) => !i.disabled && i.label.toLowerCase().includes(q))
})

const groupedItems = computed(() => {
  const groups: Record<string, CommandItem[]> = {}
  for (const item of filteredItems.value) {
    const group = item.group || ''
    if (!groups[group]) groups[group] = []
    groups[group].push(item)
  }
  return groups
})

const flatItems = computed(() => filteredItems.value)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      query.value = ''
      activeIndex.value = 0
      nextTick(() => inputRef.value?.focus())
    }
  },
)

watch(query, () => {
  activeIndex.value = 0
})

function close() {
  emit('update:modelValue', false)
}

function selectItem(item: CommandItem) {
  emit('select', item)
  close()
}

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % flatItems.value.length
      scrollToActive()
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value =
        activeIndex.value <= 0 ? flatItems.value.length - 1 : activeIndex.value - 1
      scrollToActive()
      break
    case 'Enter': {
      e.preventDefault()
      const item = flatItems.value[activeIndex.value]
      if (item) selectItem(item)
      break
    }
    case 'Escape':
      e.preventDefault()
      close()
      break
  }
}

function scrollToActive() {
  nextTick(() => {
    const el = listRef.value?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function highlightMatch(label: string): string {
  if (!query.value) return label
  const regex = new RegExp(`(${escapeRegex(query.value)})`, 'gi')
  return label.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>',
  )
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="command-palette">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <!-- Palette -->
        <div
          class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden dark:bg-gray-800"
          @keydown="handleKeydown"
        >
          <!-- Search input -->
          <div
            class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700"
          >
            <svg
              class="w-5 h-5 shrink-0 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd"
              />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
              :placeholder="placeholder"
            />
            <kbd
              class="hidden sm:inline-flex items-center rounded border border-gray-200 px-1.5 py-0.5 text-[0.625rem] text-gray-400 font-mono dark:border-gray-600 dark:text-gray-500"
            >
              ESC
            </kbd>
          </div>

          <!-- Results -->
          <div ref="listRef" class="max-h-72 overflow-y-auto p-2" role="listbox">
            <template v-if="flatItems.length">
              <template v-for="(groupItems, group) in groupedItems" :key="group">
                <div
                  v-if="group"
                  class="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
                >
                  {{ group }}
                </div>
                <button
                  v-for="(item, idx) in groupItems"
                  :key="item.id"
                  type="button"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer"
                  :class="{
                    'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300':
                      flatItems.indexOf(item) === activeIndex,
                    'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50':
                      flatItems.indexOf(item) !== activeIndex,
                  }"
                  :data-active="flatItems.indexOf(item) === activeIndex"
                  role="option"
                  :aria-selected="flatItems.indexOf(item) === activeIndex"
                  @click="selectItem(item)"
                  @mouseenter="activeIndex = flatItems.indexOf(item)"
                >
                  <component
                    v-if="item.icon"
                    :is="item.icon"
                    class="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500"
                  />
                  <span class="flex-1 truncate" v-html="highlightMatch(item.label)" />
                  <kbd
                    v-if="item.shortcut"
                    class="ml-auto text-[0.625rem] text-gray-400 font-mono dark:text-gray-500"
                  >
                    {{ item.shortcut }}
                  </kbd>
                </button>
              </template>
            </template>
            <div v-else class="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found.
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.command-palette-enter-active,
.command-palette-leave-active {
  transition: opacity 150ms ease;
}
.command-palette-enter-active > div:last-child,
.command-palette-leave-active > div:last-child {
  transition: transform 150ms ease;
}
.command-palette-enter-from,
.command-palette-leave-to {
  opacity: 0;
}
.command-palette-enter-from > div:last-child,
.command-palette-leave-to > div:last-child {
  transform: scale(0.95) translateY(-10px);
}
</style>
