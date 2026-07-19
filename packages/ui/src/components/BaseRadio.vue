<script setup lang="ts">
import { computed } from 'vue'

export type RadioVariant = 'primary' | 'success' | 'warning' | 'danger'
export type RadioSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue: string | number
  value: string | number
  label?: string
  disabled?: boolean
  variant?: RadioVariant
  size?: RadioSize
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  variant: 'primary',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isSelected = computed(() => props.modelValue === props.value)

function handleChange() {
  emit('update:modelValue', props.value)
}

const variantClasses: Record<RadioVariant, string> = {
  primary: 'border-primary-500',
  success: 'border-emerald-500',
  warning: 'border-amber-500',
  danger: 'border-red-500',
}

const dotVariantClasses: Record<RadioVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

const sizeClasses: Record<RadioSize, { outer: string; dot: string; label: string }> = {
  sm: { outer: 'w-3.5 h-3.5', dot: 'w-1.5 h-1.5', label: 'text-xs' },
  md: { outer: 'w-4 h-4', dot: 'w-2 h-2', label: 'text-sm' },
  lg: { outer: 'w-5 h-5', dot: 'w-2.5 h-2.5', label: 'text-base' },
}

const outerClasses = computed(() => [
  'relative shrink-0 rounded-full border-2 transition-colors duration-150 flex items-center justify-center',
  sizeClasses[props.size].outer,
  isSelected.value ? variantClasses[props.variant] : 'border-gray-300 dark:border-gray-600',
])
</script>

<template>
  <label
    class="inline-flex items-center gap-2"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
  >
    <input
      type="radio"
      :checked="isSelected"
      :value="value"
      :disabled="disabled"
      class="sr-only"
      @change="handleChange"
    />
    <span :class="outerClasses">
      <Transition name="radio-dot">
        <span
          v-if="isSelected"
          class="rounded-full"
          :class="[sizeClasses[size].dot, dotVariantClasses[variant]]"
        />
      </Transition>
    </span>
    <span
      v-if="label"
      class="text-gray-700 select-none dark:text-gray-300"
      :class="sizeClasses[size].label"
    >
      {{ label }}
    </span>
  </label>
</template>

<style scoped>
.radio-dot-enter-active,
.radio-dot-leave-active {
  transition:
    transform 150ms ease,
    opacity 150ms ease;
}
.radio-dot-enter-from,
.radio-dot-leave-to {
  transform: scale(0);
  opacity: 0;
}
</style>
