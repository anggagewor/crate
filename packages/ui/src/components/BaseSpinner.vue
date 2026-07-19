<script setup lang="ts">
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'primary' | 'white' | 'gray'

interface Props {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  label: 'Loading',
})

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'text-primary-500',
  white: 'text-white',
  gray: 'text-gray-400 dark:text-gray-500',
}
</script>

<template>
  <div role="status" :aria-label="label">
    <svg
      class="animate-spin"
      :class="[sizeClasses[size], variantClasses[variant]]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>
