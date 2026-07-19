<script setup lang="ts">
import { computed } from 'vue'

export type CheckboxVariant = 'primary' | 'success' | 'warning' | 'danger'

interface Props {
  modelValue: boolean | unknown[]
  value?: unknown
  label?: string
  disabled?: boolean
  indeterminate?: boolean
  variant?: CheckboxVariant
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  indeterminate: false,
  variant: 'primary',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | unknown[]]
}>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue
})

function handleChange() {
  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    const index = newValue.indexOf(props.value)
    if (index > -1) {
      newValue.splice(index, 1)
    } else {
      newValue.push(props.value)
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', !props.modelValue)
  }
}

const variantClasses: Record<CheckboxVariant, string> = {
  primary: 'border-primary-500 bg-primary-500',
  success: 'border-emerald-500 bg-emerald-500',
  warning: 'border-amber-500 bg-amber-500',
  danger: 'border-red-500 bg-red-500',
}

const boxClasses = computed(() => [
  'relative w-4 h-4 shrink-0 rounded border-2 transition-colors duration-150 flex items-center justify-center',
  isChecked.value || props.indeterminate
    ? variantClasses[props.variant]
    : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
])
</script>

<template>
  <label
    class="inline-flex items-center gap-2"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
  >
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      :indeterminate="indeterminate"
      class="sr-only"
      @change="handleChange"
    />
    <span :class="boxClasses">
      <!-- Checkmark -->
      <svg
        v-if="isChecked && !indeterminate"
        class="w-3 h-3 text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <!-- Indeterminate dash -->
      <svg
        v-if="indeterminate"
        class="w-3 h-3 text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
    <span v-if="label" class="text-sm text-gray-700 select-none dark:text-gray-300">{{
      label
    }}</span>
  </label>
</template>
