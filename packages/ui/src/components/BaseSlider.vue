<script setup lang="ts">
import { computed } from 'vue'

export type SliderVariant = 'primary' | 'success' | 'warning' | 'danger'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
  variant?: SliderVariant
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: false,
  variant: 'primary',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const percentage = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)

const trackColors: Record<SliderVariant, string> = {
  primary: 'text-primary-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-red-500',
}

const thumbColors: Record<SliderVariant, string> = {
  primary: '[&::-webkit-slider-thumb]:bg-primary-500 [&::-moz-range-thumb]:bg-primary-500',
  success: '[&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:bg-emerald-500',
  warning: '[&::-webkit-slider-thumb]:bg-amber-500 [&::-moz-range-thumb]:bg-amber-500',
  danger: '[&::-webkit-slider-thumb]:bg-red-500 [&::-moz-range-thumb]:bg-red-500',
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="relative flex-1">
      <!-- Track background -->
      <div class="absolute inset-y-0 flex items-center w-full pointer-events-none">
        <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-full rounded-full transition-[width] duration-100"
            :class="trackColors[variant].replace('text-', 'bg-')"
            :style="{ width: `${percentage}%` }"
          />
        </div>
      </div>

      <!-- Range input -->
      <input
        type="range"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="relative w-full h-6 appearance-none bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:dark:ring-gray-800 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-white [&::-moz-range-thumb]:dark:ring-gray-800 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent"
        :class="thumbColors[variant]"
        :aria-valuenow="modelValue"
        :aria-valuemin="min"
        :aria-valuemax="max"
        aria-label="Slider"
        @input="handleInput"
      />
    </div>

    <!-- Value label -->
    <span
      v-if="showValue"
      class="text-sm font-medium text-gray-600 min-w-[2.5rem] text-right tabular-nums dark:text-gray-400"
    >
      {{ modelValue }}
    </span>
  </div>
</template>
