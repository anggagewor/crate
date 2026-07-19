<script setup lang="ts">
import { computed } from 'vue'
import { useToastStore, type ToastVariant } from './store'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from '@lucide/vue'
import type { Component } from 'vue'

const store = useToastStore()

const positionClasses = computed(() => {
  const map: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }
  return map[store.position] ?? map['top-right']
})

const variantConfig: Record<
  ToastVariant,
  { icon: Component; bg: string; border: string; iconColor: string; progress: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-emerald-200 dark:border-emerald-700',
    iconColor: 'text-emerald-500',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-red-200 dark:border-red-700',
    iconColor: 'text-red-500',
    progress: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-amber-200 dark:border-amber-700',
    iconColor: 'text-amber-500',
    progress: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-cyan-200 dark:border-cyan-700',
    iconColor: 'text-cyan-500',
    progress: 'bg-cyan-500',
  },
}
</script>

<template>
  <Teleport to="body">
    <div
      :class="[
        'fixed z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-sm',
        positionClasses,
      ]"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-x-4 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-4 scale-95"
        move-class="transition-all duration-300"
      >
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto relative flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg overflow-hidden',
            variantConfig[toast.variant].bg,
            variantConfig[toast.variant].border,
          ]"
          role="alert"
        >
          <component
            :is="variantConfig[toast.variant].icon"
            :class="['w-5 h-5 shrink-0 mt-0.5', variantConfig[toast.variant].iconColor]"
          />

          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ toast.title }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300 break-words">
              {{ toast.message }}
            </p>
          </div>

          <button
            v-if="toast.dismissible"
            class="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5 rounded transition-colors"
            aria-label="Tutup notifikasi"
            @click="store.dismiss(toast.id)"
          >
            <X class="w-4 h-4" />
          </button>

          <div
            v-if="toast.duration > 0"
            :class="['absolute bottom-0 left-0 h-0.5', variantConfig[toast.variant].progress]"
            :style="{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
