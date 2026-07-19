<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, type Component } from 'vue'
import { ChevronDown } from '@lucide/vue'

export type DropdownVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost'
  | 'outline'
export type DropdownSize = 'sm' | 'md' | 'lg'
export type DropdownAlign = 'left' | 'right'

export interface DropdownItem {
  label: string
  value?: string
  icon?: Component
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

interface Props {
  items: DropdownItem[]
  variant?: DropdownVariant
  size?: DropdownSize
  align?: DropdownAlign
  disabled?: boolean
  icon?: Component
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  align: 'left',
  disabled: false,
})

const emit = defineEmits<{
  select: [item: DropdownItem]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})

function updatePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownHeight = 200 // approximate max height

  const top = spaceBelow < dropdownHeight ? `${rect.top - 4}px` : `${rect.bottom + 4}px`
  const transform = spaceBelow < dropdownHeight ? 'translateY(-100%)' : ''

  if (props.align === 'right') {
    dropdownStyle.value = {
      position: 'fixed',
      top,
      right: `${window.innerWidth - rect.right}px`,
      transform,
      zIndex: '9999',
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      top,
      left: `${rect.left}px`,
      transform,
      zIndex: '9999',
    }
  }
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(updatePosition)
  }
}

function select(item: DropdownItem) {
  if (!item.disabled && !item.divider) {
    emit('select', item)
    isOpen.value = false
  }
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    const portal = document.querySelector('[data-dropdown-portal]')
    if (portal && portal.contains(e.target as Node)) return
    isOpen.value = false
  }
}

function handleScroll() {
  if (isOpen.value) {
    updatePosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})

const variantClasses: Record<DropdownVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-200',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-200',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-200',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-200',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
  outline:
    'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
}

const sizeClasses: Record<DropdownSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block">
    <button
      ref="triggerRef"
      class="inline-flex items-center justify-center gap-2 font-medium rounded-md cursor-pointer transition-all duration-150 select-none focus:outline-none focus:ring-2"
      :class="[
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      :disabled="disabled"
      @click="toggle"
    >
      <component v-if="icon" :is="icon" class="w-4 h-4 shrink-0" />
      <slot name="trigger">
        <span><slot /></span>
      </slot>
      <ChevronDown
        class="w-4 h-4 shrink-0 transition-transform duration-150"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          data-dropdown-portal
          :style="dropdownStyle"
          class="min-w-[10rem] bg-white border border-gray-200 rounded-lg shadow-lg py-1 overflow-hidden dark:bg-gray-800 dark:border-gray-700"
        >
          <template v-for="(item, index) in items" :key="index">
            <div v-if="item.divider" class="h-px bg-gray-100 my-1 dark:bg-gray-700" />
            <button
              v-else
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-100"
              :class="[
                item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
              :disabled="item.disabled"
              @click="select(item)"
            >
              <component v-if="item.icon" :is="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.label }}</span>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
