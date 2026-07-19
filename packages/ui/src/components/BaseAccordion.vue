<script setup lang="ts">
import { ref } from 'vue'

export type AccordionVariant = 'default' | 'bordered' | 'separated'

export interface AccordionItem {
  title: string
  content?: string
  disabled?: boolean
}

interface Props {
  items: AccordionItem[]
  multiple?: boolean
  variant?: AccordionVariant
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  variant: 'default',
})

const openItems = ref<Set<number>>(new Set())

function toggle(index: number) {
  if (props.items[index]?.disabled) return

  if (openItems.value.has(index)) {
    openItems.value.delete(index)
  } else {
    if (!props.multiple) {
      openItems.value.clear()
    }
    openItems.value.add(index)
  }
  // Trigger reactivity
  openItems.value = new Set(openItems.value)
}

function isOpen(index: number): boolean {
  return openItems.value.has(index)
}

const variantClasses: Record<AccordionVariant, { wrapper: string; item: string }> = {
  default: {
    wrapper: 'divide-y divide-gray-200 dark:divide-gray-700',
    item: '',
  },
  bordered: {
    wrapper:
      'border border-gray-200 rounded-lg divide-y divide-gray-200 dark:border-gray-700 dark:divide-gray-700',
    item: '',
  },
  separated: {
    wrapper: 'space-y-2',
    item: 'border border-gray-200 rounded-lg dark:border-gray-700',
  },
}
</script>

<template>
  <div :class="variantClasses[variant].wrapper">
    <div v-for="(item, index) in items" :key="index" :class="variantClasses[variant].item">
      <button
        type="button"
        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
        :class="{
          'opacity-50 cursor-not-allowed': item.disabled,
          'cursor-pointer': !item.disabled,
        }"
        :disabled="item.disabled"
        :aria-expanded="isOpen(index)"
        @click="toggle(index)"
      >
        <span>{{ item.title }}</span>
        <svg
          class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-gray-500"
          :class="{ 'rotate-180': isOpen(index) }"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <Transition
        enter-active-class="transition-all duration-200 ease-out overflow-hidden"
        leave-active-class="transition-all duration-200 ease-in overflow-hidden"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="isOpen(index)" class="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">
          <slot :item="item" :is-open="isOpen(index)">
            {{ item.content }}
          </slot>
        </div>
      </Transition>
    </div>
  </div>
</template>
