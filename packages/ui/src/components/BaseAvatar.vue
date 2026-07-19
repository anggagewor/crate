<script setup lang="ts">
import { computed } from 'vue'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarVariant = 'circle' | 'rounded' | 'square'

interface Props {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
  variant?: AvatarVariant
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  size: 'md',
  variant: 'circle',
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getColor(name: string): string {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]!
}

const initials = props.name ? getInitials(props.name) : ''
const bgColor = props.name ? getColor(props.name) : '#94a3b8'

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[0.5rem]',
  sm: 'w-8 h-8 text-[0.625rem]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
}

const variantClasses: Record<AvatarVariant, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
  square: 'rounded-sm',
}

const classes = computed(() => [
  'inline-flex items-center justify-center overflow-hidden shrink-0',
  sizeClasses[props.size],
  variantClasses[props.variant],
])
</script>

<template>
  <div :class="classes">
    <img v-if="src" :src="src" :alt="alt || name || ''" class="w-full h-full object-cover" />
    <span
      v-else
      class="w-full h-full flex items-center justify-center text-white font-semibold"
      :style="{ background: bgColor }"
    >
      {{ initials }}
    </span>
  </div>
</template>
