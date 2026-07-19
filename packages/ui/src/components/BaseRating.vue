<script setup lang="ts">
import { ref, computed } from 'vue'

export type RatingSize = 'sm' | 'md' | 'lg'
export type RatingVariant = 'star' | 'heart'

interface Props {
  modelValue: number
  max?: number
  size?: RatingSize
  readonly?: boolean
  variant?: RatingVariant
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  size: 'md',
  readonly: false,
  variant: 'star',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverValue = ref<number>(0)

const displayValue = computed(() => (hoverValue.value > 0 ? hoverValue.value : props.modelValue))

function handleMouseMove(index: number, event: MouseEvent) {
  if (props.readonly) return
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const half = x < rect.width / 2
  hoverValue.value = half ? index + 0.5 : index + 1
}

function handleMouseLeave() {
  if (props.readonly) return
  hoverValue.value = 0
}

function handleClick() {
  if (props.readonly) return
  emit('update:modelValue', hoverValue.value)
}

const sizeClasses: Record<RatingSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5"
    :class="{ 'cursor-pointer': !readonly, 'cursor-default': readonly }"
    role="slider"
    :aria-valuenow="modelValue"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="`Rating: ${modelValue} out of ${max}`"
    @mouseleave="handleMouseLeave"
  >
    <span
      v-for="index in max"
      :key="index"
      class="relative inline-flex"
      :class="sizeClasses[size]"
      @mousemove="handleMouseMove(index - 1, $event)"
      @click="handleClick"
    >
      <!-- Star variant -->
      <template v-if="variant === 'star'">
        <!-- Empty star -->
        <svg
          class="absolute inset-0 text-gray-300 dark:text-gray-600"
          :class="sizeClasses[size]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clip-rule="evenodd"
          />
        </svg>
        <!-- Filled star (clipped) -->
        <svg
          class="absolute inset-0 text-amber-400"
          :class="sizeClasses[size]"
          :style="{
            clipPath: `inset(0 ${100 - Math.min((displayValue - (index - 1)) * 100, 100)}% 0 0)`,
          }"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clip-rule="evenodd"
          />
        </svg>
      </template>

      <!-- Heart variant -->
      <template v-else>
        <!-- Empty heart -->
        <svg
          class="absolute inset-0 text-gray-300 dark:text-gray-600"
          :class="sizeClasses[size]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
          />
        </svg>
        <!-- Filled heart (clipped) -->
        <svg
          class="absolute inset-0 text-red-500"
          :class="sizeClasses[size]"
          :style="{
            clipPath: `inset(0 ${100 - Math.min((displayValue - (index - 1)) * 100, 100)}% 0 0)`,
          }"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
          />
        </svg>
      </template>
    </span>
  </div>
</template>
