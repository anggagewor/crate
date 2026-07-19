<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, Slash, Dot } from '@lucide/vue'

export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: object
}

export type BreadcrumbSeparator = 'chevron' | 'slash' | 'dot'
export type BreadcrumbSize = 'sm' | 'md' | 'lg'

interface Props {
  items: BreadcrumbItem[]
  separator?: BreadcrumbSeparator
  size?: BreadcrumbSize
}

const props = withDefaults(defineProps<Props>(), {
  separator: 'chevron',
  size: 'md',
})

const separatorIcon = computed(() => {
  const map = {
    chevron: ChevronRight,
    slash: Slash,
    dot: Dot,
  }
  return map[props.separator]
})

const sizeClasses = computed(() => {
  const map: Record<BreadcrumbSize, { text: string; icon: string; gap: string }> = {
    sm: { text: 'text-xs', icon: 'w-3 h-3', gap: 'gap-1' },
    md: { text: 'text-sm', icon: 'w-4 h-4', gap: 'gap-1.5' },
    lg: { text: 'text-base', icon: 'w-5 h-5', gap: 'gap-2' },
  }
  return map[props.size]
})
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center" :class="sizeClasses.gap">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center"
        :class="sizeClasses.gap"
      >
        <!-- Separator -->
        <component
          v-if="index > 0"
          :is="separatorIcon"
          :class="[sizeClasses.icon, 'text-gray-400 shrink-0']"
          aria-hidden="true"
        />

        <!-- Breadcrumb item -->
        <router-link
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
          :class="sizeClasses.text"
        >
          <component v-if="item.icon" :is="item.icon" :class="[sizeClasses.icon, 'shrink-0']" />
          <span>{{ item.label }}</span>
        </router-link>

        <!-- Current (last item) -->
        <span
          v-else
          class="flex items-center gap-1 font-medium text-gray-900"
          :class="sizeClasses.text"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          <component v-if="item.icon" :is="item.icon" :class="[sizeClasses.icon, 'shrink-0']" />
          <span>{{ item.label }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>
