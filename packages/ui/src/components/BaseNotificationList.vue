<script setup lang="ts">
import { type Component } from 'vue'

export interface NotificationItem {
  id: string
  title: string
  description?: string
  time?: string
  read?: boolean
  icon?: Component
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

interface Props {
  items: NotificationItem[]
  emptyText?: string
}

withDefaults(defineProps<Props>(), {
  emptyText: 'No notifications',
})

const emit = defineEmits<{
  click: [item: NotificationItem]
  dismiss: [item: NotificationItem]
  'mark-all-read': []
}>()

function handleClick(item: NotificationItem) {
  emit('click', item)
}

function handleDismiss(item: NotificationItem, e: MouseEvent) {
  e.stopPropagation()
  emit('dismiss', item)
}

function markAllRead() {
  emit('mark-all-read')
}

const variantColors: Record<string, string> = {
  primary: 'text-primary-500 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30',
  success: 'text-emerald-500 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30',
  warning: 'text-amber-500 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30',
  danger: 'text-red-500 bg-red-50 dark:text-red-300 dark:bg-red-900/30',
  info: 'text-cyan-500 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-900/30',
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Header with mark all read -->
    <div
      v-if="items.some((i) => !i.read)"
      class="flex items-center justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-700"
    >
      <button
        type="button"
        class="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer dark:text-primary-400 dark:hover:text-primary-300"
        @click="markAllRead"
      >
        Mark all as read
      </button>
    </div>

    <!-- List -->
    <div class="overflow-y-auto max-h-96">
      <template v-if="items.length">
        <div
          v-for="item in items"
          :key="item.id"
          class="relative flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0 dark:border-gray-700/50"
          :class="{
            'bg-white dark:bg-gray-800': item.read,
            'bg-primary-50/30 dark:bg-primary-900/10': !item.read,
          }"
          @click="handleClick(item)"
        >
          <!-- Unread dot -->
          <span
            v-if="!item.read"
            class="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400"
          />

          <!-- Icon -->
          <div
            v-if="item.icon"
            class="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
            :class="variantColors[item.variant || 'primary']"
          >
            <component :is="item.icon" class="w-4 h-4" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm truncate"
              :class="{
                'font-semibold text-gray-900 dark:text-gray-100': !item.read,
                'font-medium text-gray-700 dark:text-gray-300': item.read,
              }"
            >
              {{ item.title }}
            </p>
            <p
              v-if="item.description"
              class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2"
            >
              {{ item.description }}
            </p>
            <span
              v-if="item.time"
              class="text-[0.625rem] text-gray-400 dark:text-gray-500 mt-1 inline-block"
            >
              {{ item.time }}
            </span>
          </div>

          <!-- Dismiss button -->
          <button
            type="button"
            class="shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Dismiss notification"
            @click="handleDismiss(item, $event)"
          >
            <svg
              class="w-3.5 h-3.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-10 px-4">
        <svg
          class="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ emptyText }}</p>
      </div>
    </div>
  </div>
</template>
