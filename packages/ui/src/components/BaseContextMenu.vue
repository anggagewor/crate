<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, type Component } from 'vue'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: Component
  disabled?: boolean
  divider?: boolean
  shortcut?: string
}

interface Props {
  items: ContextMenuItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [item: ContextMenuItem]
}>()

const isOpen = ref(false)
const position = ref({ x: 0, y: 0 })
const activeIndex = ref(-1)
const menuRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()

function open(e: MouseEvent) {
  e.preventDefault()
  position.value = { x: e.clientX, y: e.clientY }
  isOpen.value = true
  activeIndex.value = -1
  nextTick(adjustPosition)
}

function close() {
  isOpen.value = false
  activeIndex.value = -1
}

function adjustPosition() {
  if (!menuRef.value) return
  const rect = menuRef.value.getBoundingClientRect()
  const { innerWidth, innerHeight } = window

  if (position.value.x + rect.width > innerWidth) {
    position.value.x = innerWidth - rect.width - 8
  }
  if (position.value.y + rect.height > innerHeight) {
    position.value.y = innerHeight - rect.height - 8
  }
}

function selectItem(item: ContextMenuItem) {
  if (item.disabled || item.divider) return
  emit('select', item)
  close()
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    close()
  }
}

function getActionableIndices(): number[] {
  const indices: number[] = []
  props.items.forEach((item, index) => {
    if (!item.divider && !item.disabled) {
      indices.push(index)
    }
  })
  return indices
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return

  const actionable = getActionableIndices()

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault()
      const idx = actionable.indexOf(activeIndex.value)
      const next = idx < actionable.length - 1 ? actionable[idx + 1] : actionable[0]
      activeIndex.value = next ?? -1
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      const idx = actionable.indexOf(activeIndex.value)
      const prev = idx > 0 ? actionable[idx - 1] : actionable[actionable.length - 1]
      activeIndex.value = prev ?? -1
      break
    }
    case 'Enter': {
      e.preventDefault()
      const item = activeIndex.value >= 0 ? props.items[activeIndex.value] : undefined
      if (item) selectItem(item)
      break
    }
    case 'Escape':
      e.preventDefault()
      close()
      break
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

defineExpose({ open, close })
</script>

<template>
  <div ref="triggerRef" @contextmenu="open">
    <slot />
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="menuRef"
        class="fixed z-[9999] min-w-[10rem] bg-white border border-gray-200 rounded-lg shadow-lg py-1 dark:bg-gray-800 dark:border-gray-700"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }"
        role="menu"
      >
        <template v-for="(item, index) in items" :key="item.id">
          <div
            v-if="item.divider"
            class="h-px bg-gray-100 my-1 dark:bg-gray-700"
            role="separator"
          />
          <button
            v-else
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
            :class="[
              item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              activeIndex === index
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50',
            ]"
            :disabled="item.disabled"
            role="menuitem"
            @click="selectItem(item)"
            @mouseenter="activeIndex = index"
          >
            <component
              v-if="item.icon"
              :is="item.icon"
              class="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500"
            />
            <span class="flex-1">{{ item.label }}</span>
            <kbd
              v-if="item.shortcut"
              class="ml-auto text-[0.625rem] text-gray-400 font-mono dark:text-gray-500"
            >
              {{ item.shortcut }}
            </kbd>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
