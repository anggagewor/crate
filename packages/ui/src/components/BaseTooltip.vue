<script setup lang="ts">
import { ref } from 'vue'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'
export type TooltipVariant = 'dark' | 'light'

interface Props {
  text: string
  position?: TooltipPosition
  variant?: TooltipVariant
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  variant: 'dark',
  delay: 200,
})

const visible = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

function show() {
  timeout = setTimeout(() => {
    visible.value = true
  }, props.delay)
}

function hide() {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  visible.value = false
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-current border-x-transparent border-b-transparent',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-current border-y-transparent border-r-transparent',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-current border-y-transparent border-l-transparent',
}

const variantClasses: Record<TooltipVariant, string> = {
  dark: 'bg-gray-900 text-white dark:bg-gray-700',
  light:
    'bg-white text-gray-700 shadow-lg border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
}

const arrowVariantClasses: Record<TooltipVariant, string> = {
  dark: 'text-gray-900 dark:text-gray-700',
  light: 'text-white dark:text-gray-800',
}
</script>

<template>
  <div class="relative inline-block" @mouseenter="show" @mouseleave="hide">
    <slot />
    <Transition name="tooltip">
      <div
        v-if="visible"
        role="tooltip"
        class="absolute z-50 px-2 py-1 text-xs font-medium rounded whitespace-nowrap pointer-events-none"
        :class="[positionClasses[position], variantClasses[variant]]"
      >
        {{ text }}
        <span
          class="absolute w-0 h-0 border-4"
          :class="[arrowClasses[position], arrowVariantClasses[variant]]"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
