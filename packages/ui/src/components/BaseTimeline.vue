<script setup lang="ts">
import { type Component } from 'vue'

export type TimelineVariant = 'default' | 'alternate' | 'compact'

export interface TimelineItem {
  title: string
  description?: string
  date?: string
  icon?: Component
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

interface Props {
  items: TimelineItem[]
  variant?: TimelineVariant
  lineVariant?: 'solid' | 'dashed'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  lineVariant: 'solid',
})

const dotColors: Record<string, string> = {
  primary: 'bg-primary-500 dark:bg-primary-400',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-red-500 dark:bg-red-400',
  info: 'bg-cyan-500 dark:bg-cyan-400',
}

const iconColors: Record<string, string> = {
  primary: 'text-primary-500 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30',
  success: 'text-emerald-500 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30',
  warning: 'text-amber-500 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30',
  danger: 'text-red-500 bg-red-50 dark:text-red-300 dark:bg-red-900/30',
  info: 'text-cyan-500 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-900/30',
}
</script>

<template>
  <div
    class="relative"
    :class="{
      'space-y-6': variant !== 'compact',
      'space-y-3': variant === 'compact',
    }"
    role="list"
    aria-label="Timeline"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="relative flex"
      :class="{
        'flex-row-reverse text-right': variant === 'alternate' && index % 2 !== 0,
      }"
      role="listitem"
    >
      <!-- Line -->
      <div
        v-if="index < items.length - 1"
        class="absolute top-6 w-px h-full"
        :class="[
          variant === 'alternate' ? 'left-1/2 -translate-x-1/2' : 'left-3',
          lineVariant === 'dashed'
            ? 'border-l-2 border-dashed border-gray-200 dark:border-gray-700'
            : 'bg-gray-200 dark:bg-gray-700',
        ]"
      />

      <!-- Dot / Icon -->
      <div
        class="relative z-10 flex shrink-0 items-center justify-center"
        :class="[
          variant === 'alternate' ? 'mx-auto' : '',
          item.icon ? 'w-8 h-8 rounded-full' : 'w-6 h-6 rounded-full',
        ]"
      >
        <div
          v-if="item.icon"
          class="flex items-center justify-center w-8 h-8 rounded-full"
          :class="iconColors[item.variant || 'primary']"
        >
          <component :is="item.icon" class="w-4 h-4" />
        </div>
        <div
          v-else
          class="w-3 h-3 rounded-full ring-4 ring-white dark:ring-gray-900"
          :class="dotColors[item.variant || 'primary']"
        />
      </div>

      <!-- Content -->
      <div
        class="flex-1 pb-2"
        :class="[
          variant === 'alternate' && index % 2 !== 0 ? 'pr-6' : 'pl-4',
          variant === 'compact' ? 'pt-0' : 'pt-0.5',
        ]"
      >
        <div
          class="flex items-center gap-2"
          :class="{ 'flex-row-reverse': variant === 'alternate' && index % 2 !== 0 }"
        >
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ item.title }}
          </h3>
          <span
            v-if="item.date"
            class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          >
            {{ item.date }}
          </span>
        </div>
        <p v-if="item.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ item.description }}
        </p>
      </div>
    </div>
  </div>
</template>
