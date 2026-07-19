<script setup lang="ts">
import { computed } from 'vue'

export type TagVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
export type TagSize = 'sm' | 'md' | 'lg'

interface Props {
  label: string
  variant?: TagVariant
  size?: TagSize
  removable?: boolean
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  removable: false,
  rounded: true,
})

defineEmits<{
  remove: []
}>()

const variantClasses: Record<TagVariant, string> = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
  secondary: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
}

const sizeClasses: Record<TagSize, string> = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

const classes = computed(() => [
  'inline-flex items-center gap-1 font-medium',
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.rounded ? 'rounded-full' : 'rounded',
])
</script>

<template>
  <span :class="classes">
    {{ label }}
    <button
      v-if="removable"
      type="button"
      class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-current/10 transition-colors cursor-pointer"
      aria-label="Remove tag"
      @click="$emit('remove')"
    >
      <svg
        class="w-2.5 h-2.5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        />
      </svg>
    </button>
  </span>
</template>
