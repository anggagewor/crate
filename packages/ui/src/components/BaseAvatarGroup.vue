<script setup lang="ts">
import { computed } from 'vue'
import BaseAvatar from './BaseAvatar.vue'
import type { AvatarSize, AvatarVariant } from './BaseAvatar.vue'

export type AvatarGroupSize = 'xs' | 'sm' | 'md' | 'lg'

export interface AvatarGroupItem {
  name: string
  src?: string
  variant?: AvatarVariant
}

interface Props {
  items: AvatarGroupItem[]
  max?: number
  size?: AvatarGroupSize
  overlap?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  size: 'md',
  overlap: 'md',
})

const visibleItems = computed(() => props.items.slice(0, props.max))
const overflowCount = computed(() => Math.max(props.items.length - props.max, 0))

const overlapClasses: Record<string, string> = {
  sm: '-ml-1',
  md: '-ml-2',
  lg: '-ml-3',
}

const avatarSizeMap: Record<AvatarGroupSize, AvatarSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

const badgeSizeClasses: Record<AvatarGroupSize, string> = {
  xs: 'w-6 h-6 text-[0.5rem]',
  sm: 'w-8 h-8 text-[0.625rem]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
}
</script>

<template>
  <div class="flex items-center" role="group" aria-label="Avatar group">
    <div
      v-for="(item, index) in visibleItems"
      :key="item.name"
      class="relative ring-2 ring-white dark:ring-gray-900 rounded-full"
      :class="index > 0 ? overlapClasses[overlap] : ''"
    >
      <BaseAvatar
        :name="item.name"
        :src="item.src"
        :size="avatarSizeMap[size]"
        :variant="item.variant || 'circle'"
      />
    </div>

    <!-- Overflow badge -->
    <div
      v-if="overflowCount > 0"
      class="relative flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium ring-2 ring-white dark:ring-gray-900 dark:bg-gray-700 dark:text-gray-300"
      :class="[overlapClasses[overlap], badgeSizeClasses[size]]"
      :aria-label="`${overflowCount} more`"
    >
      +{{ overflowCount }}
    </div>
  </div>
</template>
