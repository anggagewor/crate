<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  keys: string | string[]
}

const props = defineProps<Props>()

const keyList = computed(() => (Array.isArray(props.keys) ? props.keys : [props.keys]))
</script>

<template>
  <span class="inline-flex items-center gap-1" aria-label="Keyboard shortcut">
    <template v-for="(key, index) in keyList" :key="index">
      <kbd
        class="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 text-xs font-medium font-mono text-gray-700 bg-gray-100 border border-gray-300 rounded shadow-sm dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600"
      >
        {{ key }}
      </kbd>
      <span v-if="index < keyList.length - 1" class="text-xs text-gray-400 dark:text-gray-500">
        +
      </span>
    </template>
  </span>
</template>
