<script setup lang="ts">
export type DividerOrientation = 'horizontal' | 'vertical'
export type DividerVariant = 'solid' | 'dashed' | 'dotted'
export type DividerPosition = 'left' | 'center' | 'right'

interface Props {
  label?: string
  orientation?: DividerOrientation
  variant?: DividerVariant
  position?: DividerPosition
}

withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  variant: 'solid',
  position: 'center',
})

const borderStyles: Record<DividerVariant, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
}
</script>

<template>
  <!-- Vertical -->
  <div
    v-if="orientation === 'vertical'"
    class="inline-flex self-stretch border-l border-gray-200 dark:border-gray-700"
    :class="borderStyles[variant]"
    role="separator"
    aria-orientation="vertical"
  />

  <!-- Horizontal with label -->
  <div
    v-else-if="label"
    class="flex items-center w-full"
    role="separator"
    aria-orientation="horizontal"
  >
    <div
      class="border-t border-gray-200 dark:border-gray-700"
      :class="[
        borderStyles[variant],
        position === 'left' ? 'w-[10%]' : position === 'right' ? 'flex-1' : 'flex-1',
      ]"
    />
    <span class="px-3 text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
      {{ label }}
    </span>
    <div
      class="border-t border-gray-200 dark:border-gray-700"
      :class="[
        borderStyles[variant],
        position === 'right' ? 'w-[10%]' : position === 'left' ? 'flex-1' : 'flex-1',
      ]"
    />
  </div>

  <!-- Horizontal plain -->
  <hr
    v-else
    class="border-t border-gray-200 dark:border-gray-700 w-full"
    :class="borderStyles[variant]"
    role="separator"
    aria-orientation="horizontal"
  />
</template>
