<script setup lang="ts">
import { computed, type Component } from 'vue'

export type InputVariant = 'default' | 'filled' | 'underlined'
export type InputSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue?: string | number
  variant?: InputVariant
  size?: InputSize
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  hint?: string
  icon?: Component
  iconRight?: Component
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  variant: 'default',
  size: 'md',
  type: 'text',
  placeholder: '',
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const containerClasses = computed(() => {
  const base = 'flex items-center gap-2 transition-all duration-150'

  const variants: Record<InputVariant, string> = {
    default:
      'border border-gray-300 rounded-md bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:bg-gray-800 dark:border-gray-600 dark:focus-within:ring-primary-900/30',
    filled:
      'border border-transparent rounded-md bg-gray-100 focus-within:bg-white focus-within:border-primary-500 dark:bg-gray-700 dark:focus-within:bg-gray-800',
    underlined:
      'border-b-2 border-gray-300 rounded-none bg-transparent focus-within:border-primary-500 dark:border-gray-600',
  }

  const sizes: Record<InputSize, string> = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3',
  }

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.error ? 'border-red-500! focus-within:ring-red-100!' : '',
    props.disabled ? 'opacity-50 cursor-not-allowed' : '',
  ]
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
      label
    }}</label>
    <div :class="containerClasses">
      <component v-if="icon" :is="icon" class="w-4 h-4 text-gray-400 shrink-0 dark:text-gray-500" />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1 border-none outline-none bg-transparent text-gray-800 font-sans placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-500"
        :class="{ 'text-xs': size === 'sm', 'text-sm': size === 'md', 'text-base': size === 'lg' }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <component
        v-if="iconRight"
        :is="iconRight"
        class="w-4 h-4 text-gray-400 shrink-0 dark:text-gray-500"
      />
    </div>
    <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-gray-500 dark:text-gray-400">{{ hint }}</span>
  </div>
</template>
