<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'

const left = ref('')
const right = ref('')

const diff = computed(() => {
  if (!left.value && !right.value) return []
  const leftLines = left.value.split('\n')
  const rightLines = right.value.split('\n')
  const maxLen = Math.max(leftLines.length, rightLines.length)
  const result: { left: string; right: string; status: 'same' | 'changed' | 'added' | 'removed' }[] = []

  for (let i = 0; i < maxLen; i++) {
    const l = leftLines[i] ?? ''
    const r = rightLines[i] ?? ''
    if (l === r) {
      result.push({ left: l, right: r, status: 'same' })
    } else if (i >= leftLines.length) {
      result.push({ left: '', right: r, status: 'added' })
    } else if (i >= rightLines.length) {
      result.push({ left: l, right: '', status: 'removed' })
    } else {
      result.push({ left: l, right: r, status: 'changed' })
    }
  }
  return result
})

const stats = computed(() => {
  const added = diff.value.filter((d) => d.status === 'added').length
  const removed = diff.value.filter((d) => d.status === 'removed').length
  const changed = diff.value.filter((d) => d.status === 'changed').length
  return { added, removed, changed }
})
</script>

<template>
  <ToolLayout tool-id="diff-checker" title="Diff Checker" description="Compare two texts and see differences">
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Original</label>
        <textarea v-model="left" class="w-full h-48 p-3 font-mono text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Original text..." spellcheck="false" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Modified</label>
        <textarea v-model="right" class="w-full h-48 p-3 font-mono text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Modified text..." spellcheck="false" />
      </div>
    </div>

    <div v-if="diff.length > 0" class="mb-3 flex gap-3 text-xs">
      <span class="text-green-600">+{{ stats.added }} added</span>
      <span class="text-red-600">-{{ stats.removed }} removed</span>
      <span class="text-amber-600">~{{ stats.changed }} changed</span>
    </div>

    <div v-if="diff.length > 0" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div
        v-for="(line, idx) in diff"
        :key="idx"
        class="grid grid-cols-2 font-mono text-xs border-b border-gray-100 dark:border-gray-800 last:border-0"
        :class="{
          'bg-red-50 dark:bg-red-900/10': line.status === 'removed',
          'bg-green-50 dark:bg-green-900/10': line.status === 'added',
          'bg-amber-50 dark:bg-amber-900/10': line.status === 'changed',
        }"
      >
        <div class="px-3 py-1 border-r border-gray-200 dark:border-gray-700 whitespace-pre">
          <span class="text-gray-400 mr-2 select-none w-4 inline-block">{{ idx + 1 }}</span>{{ line.left }}
        </div>
        <div class="px-3 py-1 whitespace-pre">
          <span class="text-gray-400 mr-2 select-none w-4 inline-block">{{ idx + 1 }}</span>{{ line.right }}
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
