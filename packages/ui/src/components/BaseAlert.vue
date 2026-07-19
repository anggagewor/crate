<script setup lang="ts">
import { computed, type Component } from 'vue'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface Props {
  variant?: AlertVariant
  title?: string
  icon?: Component
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-300',
  success:
    'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300',
  warning:
    'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
  danger:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
}

const classes = computed(() => [
  'flex items-start gap-3 px-4 py-3 rounded-lg border text-sm',
  variantClasses[props.variant],
])
</script>

<template>
  <div :class="classes" role="alert">
    <component v-if="icon" :is="icon" class="w-5 h-5 shrink-0 mt-0.5" />
    <div class="flex-1">
      <strong v-if="title" class="block mb-0.5">{{ title }}</strong>
      <slot />
    </div>
    <button
      v-if="dismissible"
      class="text-xl leading-none opacity-60 hover:opacity-100 cursor-pointer"
      @click="emit('dismiss')"
      aria-label="Dismiss"
    >
      &times;
    </button>
  </div>
</template>
