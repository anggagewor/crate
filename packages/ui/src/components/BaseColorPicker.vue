<script setup lang="ts">
export type ColorPickerSize = 'sm' | 'md' | 'lg'

export interface ColorOption {
  name: string
  value: string
  label?: string
}

interface Props {
  modelValue: string
  colors: ColorOption[]
  size?: ColorPickerSize
  columns?: number
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  columns: 6,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const sizeClasses: Record<ColorPickerSize, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

const ringClasses: Record<ColorPickerSize, string> = {
  sm: 'ring-2 ring-offset-1',
  md: 'ring-2 ring-offset-2',
  lg: 'ring-3 ring-offset-2',
}
</script>

<template>
  <div
    class="grid gap-2"
    :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
    role="radiogroup"
    aria-label="Color picker"
  >
    <button
      v-for="color in colors"
      :key="color.value"
      type="button"
      class="rounded-full transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      :class="[
        sizeClasses[size],
        modelValue === color.value
          ? `${ringClasses[size]} ring-primary-500 dark:ring-offset-gray-900`
          : '',
      ]"
      :style="{ backgroundColor: color.value }"
      :title="color.label || color.name"
      :aria-label="color.label || color.name"
      :aria-checked="modelValue === color.value"
      role="radio"
      @click="emit('update:modelValue', color.value)"
    >
      <!-- Check mark for selected -->
      <svg
        v-if="modelValue === color.value"
        class="w-4 h-4 mx-auto text-white drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>
