<script setup lang="ts">
import { type Component } from 'vue'

export type EmptyStateSize = 'sm' | 'md' | 'lg'

interface Props {
  title?: string
  description?: string
  icon?: Component
  size?: EmptyStateSize
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses: Record<
  EmptyStateSize,
  { wrapper: string; icon: string; title: string; description: string }
> = {
  sm: {
    wrapper: 'py-6 px-4',
    icon: 'w-10 h-10',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    wrapper: 'py-10 px-6',
    icon: 'w-14 h-14',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    wrapper: 'py-16 px-8',
    icon: 'w-20 h-20',
    title: 'text-lg',
    description: 'text-base',
  },
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center"
    :class="sizeClasses[size].wrapper"
    role="status"
  >
    <!-- Icon -->
    <div
      class="flex items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-4"
      :class="sizeClasses[size].icon"
    >
      <slot name="icon">
        <component v-if="icon" :is="icon" class="w-1/2 h-1/2" />
        <svg
          v-else
          class="w-1/2 h-1/2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </slot>
    </div>

    <!-- Title -->
    <h3
      v-if="title"
      class="font-medium text-gray-900 dark:text-gray-100"
      :class="sizeClasses[size].title"
    >
      {{ title }}
    </h3>

    <!-- Description -->
    <p
      v-if="description"
      class="mt-1 text-gray-500 dark:text-gray-400 max-w-sm"
      :class="sizeClasses[size].description"
    >
      {{ description }}
    </p>

    <!-- Action slot -->
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
