<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-vue-next'

const { copied, copy } = useCopy()
const input = ref('')
const output = ref('')
const error = ref('')

function format() {
  if (!input.value.trim()) return
  try {
    error.value = ''
    const lines = input.value.split('\n')
    const formatted: string[] = []

    for (const line of lines) {
      const trimmed = line.trimEnd()
      if (!trimmed) {
        formatted.push('')
        continue
      }

      // Preserve comments
      if (trimmed.startsWith('#')) {
        formatted.push(trimmed)
        continue
      }

      // Format key: value with consistent spacing
      const kvMatch = trimmed.match(/^(\s*)([\w.-]+)\s*:\s*(.*)$/)
      if (kvMatch) {
        const [, indent, key, value] = kvMatch
        formatted.push(`${indent}${key}: ${value}`.trimEnd())
      } else {
        // List items
        const listMatch = trimmed.match(/^(\s*)-\s*(.*)$/)
        if (listMatch) {
          const [, indent, value] = listMatch
          formatted.push(`${indent}- ${value}`.trimEnd())
        } else {
          formatted.push(trimmed)
        }
      }
    }

    output.value = formatted.join('\n').trimEnd()
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function minify() {
  if (!input.value.trim()) return
  try {
    error.value = ''
    const lines = input.value.split('\n')
    const result: string[] = []
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        result.push(trimmed)
      }
    }
    output.value = result.join('\n')
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}
</script>

<template>
  <ToolLayout tool-id="yaml-formatter" title="YAML Formatter" description="Format and validate YAML">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Maximize2" @click="format">Format</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Minimize2" @click="minify">Minify</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span></template>
        <textarea v-model="input" class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none" placeholder="Paste YAML here..." spellcheck="false" />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span></template>
        <pre class="w-full h-96 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">{{ output || 'Formatted output...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
