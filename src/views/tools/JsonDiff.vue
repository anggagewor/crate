<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { BaseButton, BaseCard } from '@purdia/ui'
import { GitCompare } from 'lucide-vue-next'

const left = ref('')
const right = ref('')
const error = ref('')

interface DiffEntry {
  path: string
  type: 'added' | 'removed' | 'changed'
  leftValue?: string
  rightValue?: string
}

const differences = ref<DiffEntry[]>([])

function compareObjects(
  obj1: unknown,
  obj2: unknown,
  path: string,
  diffs: DiffEntry[]
) {
  if (obj1 === obj2) return

  if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null) {
    diffs.push({
      path,
      type: 'changed',
      leftValue: JSON.stringify(obj1),
      rightValue: JSON.stringify(obj2),
    })
    return
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLen = Math.max(obj1.length, obj2.length)
    for (let i = 0; i < maxLen; i++) {
      const itemPath = `${path}[${i}]`
      if (i >= obj1.length) {
        diffs.push({ path: itemPath, type: 'added', rightValue: JSON.stringify(obj2[i]) })
      } else if (i >= obj2.length) {
        diffs.push({ path: itemPath, type: 'removed', leftValue: JSON.stringify(obj1[i]) })
      } else {
        compareObjects(obj1[i], obj2[i], itemPath, diffs)
      }
    }
    return
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const o1 = obj1 as Record<string, unknown>
    const o2 = obj2 as Record<string, unknown>
    const allKeys = new Set([...Object.keys(o1), ...Object.keys(o2)])
    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : `$.${key}`
      if (!(key in o1)) {
        diffs.push({ path: keyPath, type: 'added', rightValue: JSON.stringify(o2[key]) })
      } else if (!(key in o2)) {
        diffs.push({ path: keyPath, type: 'removed', leftValue: JSON.stringify(o1[key]) })
      } else {
        compareObjects(o1[key], o2[key], keyPath, diffs)
      }
    }
    return
  }

  if (obj1 !== obj2) {
    diffs.push({
      path,
      type: 'changed',
      leftValue: JSON.stringify(obj1),
      rightValue: JSON.stringify(obj2),
    })
  }
}

function compare() {
  if (!left.value.trim() || !right.value.trim()) return
  try {
    error.value = ''
    const obj1 = JSON.parse(left.value)
    const obj2 = JSON.parse(right.value)
    const diffs: DiffEntry[] = []
    compareObjects(obj1, obj2, '$', diffs)
    differences.value = diffs
  } catch (e: unknown) {
    error.value = (e as Error).message
    differences.value = []
  }
}
</script>

<template>
  <ToolLayout tool-id="json-diff" title="JSON Diff" description="Compare two JSON documents">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="GitCompare" @click="compare">Compare</BaseButton>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Left JSON</span></template>
        <textarea
          v-model="left"
          class="w-full h-64 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="Paste first JSON..."
          spellcheck="false"
        />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Right JSON</span></template>
        <textarea
          v-model="right"
          class="w-full h-64 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="Paste second JSON..."
          spellcheck="false"
        />
      </BaseCard>
    </div>

    <div v-if="differences.length > 0" class="mb-3 flex gap-3 text-xs">
      <span class="text-green-600">+{{ differences.filter(d => d.type === 'added').length }} added</span>
      <span class="text-red-600">-{{ differences.filter(d => d.type === 'removed').length }} removed</span>
      <span class="text-amber-600">~{{ differences.filter(d => d.type === 'changed').length }} changed</span>
    </div>

    <div v-if="differences.length === 0 && left && right && !error" class="p-4 text-center text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg">
      Documents are identical
    </div>

    <div v-if="differences.length > 0" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div
        v-for="(diff, idx) in differences"
        :key="idx"
        class="px-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 font-mono text-xs"
        :class="{
          'bg-green-50 dark:bg-green-900/10': diff.type === 'added',
          'bg-red-50 dark:bg-red-900/10': diff.type === 'removed',
          'bg-amber-50 dark:bg-amber-900/10': diff.type === 'changed',
        }"
      >
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ diff.path }}</span>
        <span v-if="diff.type === 'added'" class="ml-2 text-green-600">+ {{ diff.rightValue }}</span>
        <span v-else-if="diff.type === 'removed'" class="ml-2 text-red-600">- {{ diff.leftValue }}</span>
        <span v-else class="ml-2">
          <span class="text-red-600">{{ diff.leftValue }}</span>
          <span class="text-gray-400 mx-1">→</span>
          <span class="text-green-600">{{ diff.rightValue }}</span>
        </span>
      </div>
    </div>
  </ToolLayout>
</template>
