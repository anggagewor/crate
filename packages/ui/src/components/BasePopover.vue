<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'
export type PopoverAlign = 'start' | 'center' | 'end'
export type PopoverTrigger = 'click' | 'hover'

interface Props {
  position?: PopoverPosition
  align?: PopoverAlign
  trigger?: PopoverTrigger
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
  align: 'center',
  trigger: 'click',
})

const visible = ref(false)
const popoverRef = ref<HTMLElement | null>(null)

function toggle() {
  if (props.trigger === 'click') {
    visible.value = !visible.value
  }
}

function show() {
  if (props.trigger === 'hover') {
    visible.value = true
  }
}

function hide() {
  if (props.trigger === 'hover') {
    visible.value = false
  }
}

function onClickOutside(event: MouseEvent) {
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    visible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

const positionClasses: Record<PopoverPosition, Record<PopoverAlign, string>> = {
  top: {
    start: 'bottom-full left-0 mb-2',
    center: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    end: 'bottom-full right-0 mb-2',
  },
  bottom: {
    start: 'top-full left-0 mt-2',
    center: 'top-full left-1/2 -translate-x-1/2 mt-2',
    end: 'top-full right-0 mt-2',
  },
  left: {
    start: 'right-full top-0 mr-2',
    center: 'right-full top-1/2 -translate-y-1/2 mr-2',
    end: 'right-full bottom-0 mr-2',
  },
  right: {
    start: 'left-full top-0 ml-2',
    center: 'left-full top-1/2 -translate-y-1/2 ml-2',
    end: 'left-full bottom-0 ml-2',
  },
}
</script>

<template>
  <div ref="popoverRef" class="relative inline-block" @mouseenter="show" @mouseleave="hide">
    <div @click="toggle">
      <slot />
    </div>
    <Transition name="popover">
      <div
        v-if="visible"
        class="absolute z-50 min-w-[12rem] rounded-lg bg-white shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        :class="positionClasses[position][align]"
        role="dialog"
      >
        <slot name="content" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.popover-enter-active,
.popover-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
