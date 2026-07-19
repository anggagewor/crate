<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, Play } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const jsonInput = ref('')
const pathInput = ref('$')
const output = ref('')
const error = ref('')

function evaluateJsonPath(obj: unknown, path: string): unknown[] {
  const parts = path.replace(/^\$\.?/, '').split('.').filter(Boolean)
  let current: unknown[] = [obj]

  for (const part of parts) {
    const next: unknown[] = []
    // Handle array index like [0] or [*]
    const bracketMatch = part.match(/^(\w*)\[([^\]]*)\]$/)
    if (bracketMatch) {
      const [, key, indexStr] = bracketMatch
      for (const item of current) {
        let target = item
        if (key) {
          target = (item as Record<string, unknown>)?.[key]
        }
        if (indexStr === '*') {
          if (Array.isArray(target)) {
            next.push(...target)
          }
        } else {
          const idx = parseInt(indexStr, 10)
          if (Array.isArray(target) && idx < target.length) {
            next.push(target[idx])
          }
        }
      }
    } else if (part === '*') {
      for (const item of current) {
        if (typeof item === 'object' && item !== null) {
          next.push(...Object.values(item))
        }
      }
    } else {
      for (const item of current) {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const val = (item as Record<string, unknown>)[part]
          if (val !== undefined) next.push(val)
        }
      }
    }
    current = next
  }

  return current
}

function evaluate() {
  if (!jsonInput.value.trim() || !pathInput.value.trim()) return
  try {
    error.value = ''
    const obj = JSON.parse(jsonInput.value)
    const results = evaluateJsonPath(obj, pathInput.value)
    output.value = JSON.stringify(results.length === 1 ? results[0] : results, null, 2)
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}
</script>

<template>
  <ToolLayout tool-id="jsonpath-tester" title="JSON Path Tester" description="Test JSONPath expressions">
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">JSONPath Expression</label>
          <input
            v-model="pathInput"
            type="text"
            class="w-full text-sm px-3 py-2 font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="$.store.book[0].title"
          />
        </div>
        <BaseButton size="sm" :icon="Play" class="mt-5" @click="evaluate">Evaluate</BaseButton>
      </div>

      <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BaseCard variant="bordered" :padding="false">
          <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">JSON Document</span></template>
          <textarea
            v-model="jsonInput"
            class="w-full h-80 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
            placeholder="Paste JSON document here..."
            spellcheck="false"
          />
        </BaseCard>
        <BaseCard variant="bordered" :padding="false">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Results</span>
              <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copy(output)">
                {{ copied ? 'Copied!' : 'Copy' }}
              </BaseButton>
            </div>
          </template>
          <pre class="w-full h-80 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">{{ output || 'Results will appear here...' }}</pre>
        </BaseCard>
      </div>
    </div>
  </ToolLayout>
</template>
