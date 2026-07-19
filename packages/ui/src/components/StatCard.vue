<script setup lang="ts">
import type { Component } from 'vue'

export type StatTrend = 'up' | 'down' | 'neutral'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: Component
  trend?: StatTrend
  trendValue?: string
}

withDefaults(defineProps<Props>(), {
  trend: 'neutral',
})

const trendColor: Record<StatTrend, string> = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  neutral: 'text-gray-500 dark:text-gray-400',
}
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="flex justify-between items-start">
      <div>
        <p class="text-sm text-gray-500 mb-1 dark:text-gray-400">{{ title }}</p>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ value }}</h3>
      </div>
      <div
        v-if="icon"
        class="w-10 h-10 flex items-center justify-center bg-primary-50 rounded-lg text-primary-500 dark:bg-primary-900/30 dark:text-primary-400"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>
    <div v-if="trendValue || subtitle" class="mt-3 flex items-center gap-2 text-xs">
      <span v-if="trendValue" class="font-semibold" :class="trendColor[trend!]">
        <span v-if="trend === 'up'">↑</span>
        <span v-else-if="trend === 'down'">↓</span>
        {{ trendValue }}
      </span>
      <span v-if="subtitle" class="text-gray-500 dark:text-gray-400">{{ subtitle }}</span>
    </div>
  </div>
</template>
