<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import { TAB_ACTIVE_KEY } from './tabs-key'

export type TabVariant = 'default' | 'pills' | 'underline' | 'bordered'
export type TabPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TabSize = 'sm' | 'md' | 'lg'

export interface TabItem {
  key: string
  label: string
  icon?: object
  disabled?: boolean
}

interface Props {
  modelValue?: string
  tabs: TabItem[]
  variant?: TabVariant
  placement?: TabPlacement
  size?: TabSize
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  placement: 'top',
  size: 'md',
  fullWidth: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = computed({
  get: () => props.modelValue || props.tabs[0]?.key || '',
  set: (val) => emit('update:modelValue', val),
})

function selectTab(tab: TabItem) {
  if (!tab.disabled) {
    activeTab.value = tab.key
  }
}

// Provide active tab to child TabPanel components
provide(TAB_ACTIVE_KEY, activeTab)

const isVertical = computed(() => props.placement === 'left' || props.placement === 'right')

const wrapperClasses = computed(() => {
  if (isVertical.value) {
    return props.placement === 'left' ? 'flex flex-row' : 'flex flex-row-reverse'
  }
  return props.placement === 'bottom' ? 'flex flex-col-reverse' : 'flex flex-col'
})

const navClasses = computed(() => {
  const base = 'flex shrink-0'

  if (isVertical.value) {
    return [
      base,
      'flex-col',
      props.placement === 'left'
        ? 'border-r border-gray-200 pr-0'
        : 'border-l border-gray-200 pl-0',
    ]
  }

  return [base, 'flex-row', props.fullWidth ? '' : '']
})

const tabClasses = computed(() => {
  return (tab: TabItem) => {
    const isActive = activeTab.value === tab.key
    const base =
      'inline-flex items-center gap-2 font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none'

    const sizes: Record<TabSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    }

    const variants: Record<TabVariant, { active: string; inactive: string }> = {
      default: {
        active: 'text-primary-600 border-primary-500 dark:text-primary-400',
        inactive:
          'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200',
      },
      pills: {
        active: 'bg-primary-500 text-white rounded-md',
        inactive:
          'text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-700',
      },
      underline: {
        active: 'text-primary-600 border-primary-500 dark:text-primary-400',
        inactive:
          'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
      },
      bordered: {
        active:
          'bg-white text-primary-600 border border-gray-200 border-b-white rounded-t-md -mb-px dark:bg-gray-800 dark:border-gray-700 dark:border-b-gray-800',
        inactive:
          'text-gray-500 border border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
      },
    }

    // Border direction for default/underline
    let borderDir = ''
    if (props.variant === 'default' || props.variant === 'underline') {
      if (isVertical.value) {
        borderDir = props.placement === 'left' ? 'border-r-2' : 'border-l-2'
      } else {
        borderDir = props.placement === 'bottom' ? 'border-t-2' : 'border-b-2'
      }
    }

    const disabled = tab.disabled ? 'opacity-40 cursor-not-allowed!' : ''

    return [
      base,
      sizes[props.size],
      borderDir,
      isActive ? variants[props.variant].active : variants[props.variant].inactive,
      props.fullWidth && !isVertical.value ? 'flex-1 justify-center' : '',
      disabled,
    ]
  }
})

const navBorderClasses = computed(() => {
  if (props.variant === 'pills') return ''
  if (props.variant === 'bordered')
    return isVertical.value ? '' : 'border-b border-gray-200 dark:border-gray-700'

  if (isVertical.value) {
    return '' // border already on nav wrapper
  }
  return props.placement === 'bottom'
    ? 'border-t border-gray-200 dark:border-gray-700'
    : 'border-b border-gray-200 dark:border-gray-700'
})
</script>

<template>
  <div :class="wrapperClasses">
    <!-- Tab Navigation -->
    <nav :class="[navClasses, navBorderClasses]" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="tabClasses(tab)"
        :disabled="tab.disabled"
        role="tab"
        :aria-selected="activeTab === tab.key"
        @click="selectTab(tab)"
      >
        <component v-if="tab.icon" :is="tab.icon" class="w-4 h-4 shrink-0" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Tab Content -->
    <div
      class="flex-1 min-w-0"
      :class="isVertical ? (placement === 'left' ? 'pl-4' : 'pr-4') : 'pt-4'"
    >
      <slot />
    </div>
  </div>
</template>
