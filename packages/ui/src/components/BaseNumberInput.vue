<script setup lang="ts">
import { computed } from 'vue'

export type NumberInputSize = 'sm' | 'md' | 'lg'
export type NumberInputVariant = 'default' | 'filled'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  size?: NumberInputSize
  disabled?: boolean
  label?: string
  variant?: NumberInputVariant
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  size: 'md',
  disabled: false,
  variant: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function clamp(value: number): number {
  let clamped = value
  if (props.min !== undefined) clamped = Math.max(clamped, props.min)
  if (props.max !== undefined) clamped = Math.min(clamped, props.max)
  return clamped
}

function increment() {
  if (props.disabled) return
  emit('update:modelValue', clamp(props.modelValue + props.step))
}

function decrement() {
  if (props.disabled) return
  emit('update:modelValue', clamp(props.modelValue - props.step))
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  if (!isNaN(value)) {
    emit('update:modelValue', clamp(value))
  }
}

const canDecrement = computed(() => props.min === undefined || props.modelValue > props.min)
const canIncrement = computed(() => props.max === undefined || props.modelValue < props.max)

const sizeClasses: Record<NumberInputSize, { wrapper: string; input: string; button: string }> = {
  sm: {
    wrapper: 'h-8',
    input: 'text-xs px-2',
    button: 'w-7 text-sm',
  },
  md: {
    wrapper: 'h-10',
    input: 'text-sm px-3',
    button: 'w-9 text-base',
  },
  lg: {
    wrapper: 'h-12',
    input: 'text-base px-4',
    button: 'w-11 text-lg',
  },
}

const variantClasses: Record<NumberInputVariant, string> = {
  default: 'border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900',
  filled: 'border border-transparent bg-gray-100 dark:bg-gray-800',
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }}
    </label>
    <div
      class="inline-flex items-center rounded-lg overflow-hidden"
      :class="[sizeClasses[size].wrapper, variantClasses[variant], { 'opacity-50': disabled }]"
    >
      <!-- Decrement button -->
      <button
        type="button"
        class="flex items-center justify-center h-full border-r border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed"
        :class="sizeClasses[size].button"
        :disabled="disabled || !canDecrement"
        aria-label="Decrease value"
        @click="decrement"
      >
        −
      </button>

      <!-- Input -->
      <input
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="w-16 h-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        :class="sizeClasses[size].input"
        :aria-label="label || 'Number input'"
        @input="handleInput"
      />

      <!-- Increment button -->
      <button
        type="button"
        class="flex items-center justify-center h-full border-l border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed"
        :class="sizeClasses[size].button"
        :disabled="disabled || !canIncrement"
        aria-label="Increase value"
        @click="increment"
      >
        +
      </button>
    </div>
  </div>
</template>
