<script setup lang="ts">
import { computed } from 'vue'

export type DrawerPosition = 'left' | 'right'
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface Props {
  modelValue: boolean
  position?: DrawerPosition
  size?: DrawerSize
  title?: string
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  size: 'md',
  overlay: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[32rem]',
  xl: 'w-[42rem]',
  full: 'w-screen',
}

const positionClasses: Record<DrawerPosition, string> = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
}

const drawerClasses = computed(() => [
  'fixed z-[1001] flex flex-col bg-white shadow-xl dark:bg-gray-800',
  sizeClasses[props.size],
  positionClasses[props.position],
])

const enterFromClass = computed(() =>
  props.position === 'left' ? '-translate-x-full' : 'translate-x-full',
)
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-overlay">
      <div v-if="modelValue && overlay" class="fixed inset-0 bg-black/50 z-[1000]" @click="close" />
    </Transition>
    <Transition :name="`drawer-${position}`">
      <div v-if="modelValue" :class="drawerClasses" role="dialog" aria-modal="true">
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700"
        >
          <slot name="header">
            <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ title }}
            </h3>
          </slot>
          <button
            class="text-2xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded p-1 leading-none cursor-pointer dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Close drawer"
            @click="close"
          >
            &times;
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 dark:text-gray-300">
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          class="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end dark:border-gray-700"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 300ms ease;
}
.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 300ms ease;
}
.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}

.drawer-left-enter-active,
.drawer-left-leave-active {
  transition: transform 300ms ease;
}
.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(-100%);
}
</style>
