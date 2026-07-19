<script setup lang="ts">
import { computed } from 'vue'

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type ProgressSize = 'sm' | 'md' | 'lg'

interface Props {
  value: number
  max?: number
  variant?: ProgressVariant
  size?: ProgressSize
  showLabel?: boolean
  striped?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  variant: 'primary',
  size: 'md',
  showLabel: false,
  striped: false,
  animated: false,
})

const percentage = computed(() => Math.min(Math.round((props.value / props.max) * 100), 100))

const barColor: Record<ProgressVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-cyan-500',
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="flex-1 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700"
      :class="sizeClasses[size]"
    >
      <div
        class="h-full rounded-full transition-[width] duration-300"
        :class="[
          barColor[variant],
          striped ? 'progress-striped' : '',
          animated ? 'progress-animated' : '',
        ]"
        :style="{ width: `${percentage}%` }"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="0"
        :aria-valuemax="max"
      />
    </div>
    <span
      v-if="showLabel"
      class="text-xs font-medium text-gray-600 min-w-[2.5rem] text-right dark:text-gray-400"
    >
      {{ percentage }}%
    </span>
  </div>
</template>

<style scoped>
.progress-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%
  );
  background-size: 1rem 1rem;
}

.progress-animated {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
