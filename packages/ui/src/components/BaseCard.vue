<script setup lang="ts">
import { computed } from 'vue'

export type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat'

interface Props {
  variant?: CardVariant
  padding?: boolean
  flush?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: true,
  flush: false,
  hoverable: false,
})

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700',
  bordered: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
  elevated: 'bg-white shadow-lg dark:bg-gray-800',
  flat: 'bg-gray-50 dark:bg-gray-800/50',
}

const classes = computed(() => [
  'rounded-xl overflow-hidden transition-all duration-200',
  variantClasses[props.variant],
  props.hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : '',
])

const bodyClasses = computed(() => {
  if (props.flush) return ''
  return props.padding ? 'p-6' : ''
})
</script>

<template>
  <div :class="classes">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
      <slot name="header" />
    </div>
    <div :class="bodyClasses">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <slot name="footer" />
    </div>
  </div>
</template>
