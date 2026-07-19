<script setup lang="ts">
import { computed } from 'vue'

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'button' | 'avatar' | 'badge' | 'input'

interface Props {
  variant?: SkeletonVariant
  width?: string
  height?: string
  rounded?: boolean
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  rounded: true,
  count: 1,
})

const classes = computed(() => {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700'

  const variantMap: Record<SkeletonVariant, string> = {
    text: `h-4 ${props.rounded ? 'rounded' : ''} w-full`,
    circle: 'rounded-full w-10 h-10',
    rect: `${props.rounded ? 'rounded-lg' : ''} w-full h-24`,
    button: 'rounded-md h-9 w-24',
    avatar: 'rounded-full w-10 h-10',
    input: 'rounded-md h-10 w-full',
    badge: 'rounded-full h-5 w-16',
  }

  return [base, variantMap[props.variant]]
})

const style = computed(() => {
  const s: Record<string, string> = {}
  if (props.width) s.width = props.width
  if (props.height) s.height = props.height
  return s
})
</script>

<template>
  <template v-if="count === 1">
    <div :class="classes" :style="style" />
  </template>
  <template v-else>
    <div class="space-y-2">
      <div v-for="i in count" :key="i" :class="classes" :style="style" />
    </div>
  </template>
</template>
