<script setup lang="ts">
import { computed, type Component } from 'vue'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost'
  | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: Component
  iconRight?: Component
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-200',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-200',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-200',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-200',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
  outline:
    'bg-transparent text-primary-500 border border-primary-500 hover:bg-primary-50 focus:ring-primary-200 dark:hover:bg-primary-900/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 font-medium rounded-md cursor-pointer transition-all duration-150 select-none focus:outline-none focus:ring-2',
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.block ? 'w-full' : '',
  props.disabled || props.loading ? 'opacity-50 cursor-not-allowed' : '',
])
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" @click="$emit('click', $event)">
    <span
      v-if="loading"
      class="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"
    />
    <component v-if="icon && !loading" :is="icon" class="w-4 h-4 shrink-0" />
    <span :class="{ 'opacity-70': loading }">
      <slot />
    </span>
    <component v-if="iconRight" :is="iconRight" class="w-4 h-4 shrink-0" />
  </button>
</template>
