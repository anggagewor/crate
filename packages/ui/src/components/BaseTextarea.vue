<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

export type TextareaVariant = 'default' | 'filled' | 'underlined'
export type TextareaSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
  variant?: TextareaVariant
  size?: TextareaSize
  disabled?: boolean
  error?: string
  hint?: string
  autosize?: boolean
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  variant: 'default',
  size: 'md',
  disabled: false,
  autosize: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const variantClasses: Record<TextareaVariant, string> = {
  default:
    'border border-gray-300 rounded-md bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:bg-gray-800 dark:border-gray-600 dark:focus-within:ring-primary-900/30',
  filled:
    'border border-transparent rounded-md bg-gray-100 focus-within:bg-white focus-within:border-primary-500 dark:bg-gray-700 dark:focus-within:bg-gray-800',
  underlined:
    'border-b-2 border-gray-300 rounded-none bg-transparent focus-within:border-primary-500 dark:border-gray-600',
}

const sizeClasses: Record<TextareaSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const containerClasses = computed(() => [
  'transition-all duration-150',
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.error ? 'border-red-500! focus-within:ring-red-100!' : '',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
])

function handleInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
}

function resize() {
  if (!props.autosize || !textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}

watch(
  () => props.modelValue,
  () => {
    if (props.autosize) {
      nextTick(resize)
    }
  },
)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
      label
    }}</label>
    <div :class="containerClasses">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :maxlength="maxlength"
        class="w-full border-none outline-none bg-transparent text-gray-800 font-sans placeholder:text-gray-400 resize-y dark:text-gray-200 dark:placeholder:text-gray-500"
        :class="{ 'resize-none': autosize }"
        :aria-invalid="error ? 'true' : undefined"
        @input="handleInput"
        @focus="resize"
      />
    </div>
    <div class="flex items-center justify-between">
      <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
      <span v-else-if="hint" class="text-xs text-gray-500 dark:text-gray-400">{{ hint }}</span>
      <span v-else />
      <span v-if="maxlength" class="text-xs text-gray-400 dark:text-gray-500">
        {{ modelValue.length }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>
