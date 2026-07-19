<script setup lang="ts">
import { computed } from 'vue'

export type ToggleSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue: boolean
  size?: ToggleSize
  disabled?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const trackSize: Record<ToggleSize, string> = {
  sm: 'w-8 h-[1.125rem]',
  md: 'w-10 h-[1.375rem]',
  lg: 'w-12 h-[1.625rem]',
}

const thumbSize: Record<ToggleSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-[1.05rem] h-[1.05rem]',
  lg: 'w-[1.3rem] h-[1.3rem]',
}

const thumbTranslate: Record<ToggleSize, string> = {
  sm: 'translate-x-3.5',
  md: 'translate-x-[1.1rem]',
  lg: 'translate-x-[1.35rem]',
}
</script>

<template>
  <label
    class="inline-flex items-center gap-2"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only"
      @change="$emit('update:modelValue', !modelValue)"
    />
    <span
      class="relative rounded-full transition-colors duration-150"
      :class="[trackSize[size], modelValue ? 'bg-primary-500' : 'bg-gray-300']"
    >
      <span
        class="absolute top-[2px] left-[2px] bg-white rounded-full shadow-sm transition-transform duration-150"
        :class="[thumbSize[size], modelValue ? thumbTranslate[size] : '']"
      />
    </span>
    <span v-if="label" class="text-sm text-gray-700 select-none dark:text-gray-300">{{
      label
    }}</span>
  </label>
</template>
