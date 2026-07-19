<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import CodeBlock from '@/components/CodeBlock.vue'
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
    let prevWasSection = false

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Comments
      if (trimmed.startsWith('#')) {
        formatted.push(trimmed)
        prevWasSection = false
        continue
      }

      // Section headers [section] or [[array]]
      if (trimmed.startsWith('[')) {
        if (formatted.length > 0 && !prevWasSection) {
          formatted.push('')
        }
        formatted.push(trimmed)
        prevWasSection = true
        continue
      }

      // Key = value pairs - normalize spacing around =
      const kvMatch = trimmed.match(/^([^=]+?)\s*=\s*(.*)$/)
      if (kvMatch) {
        const [, key, value] = kvMatch
        formatted.push(`${key.trim()} = ${value.trim()}`)
      } else {
        formatted.push(trimmed)
      }
      prevWasSection = false
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
  <ToolLayout tool-id="toml-formatter" title="TOML Formatter" description="Format TOML documents">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Maximize2" @click="format">Format</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Minimize2" @click="minify">Minify</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span></template>
        <textarea v-model="input" class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none" placeholder="Paste TOML here..." spellcheck="false" />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span></template>
        <div v-if="output" class="h-96 overflow-auto">
          <CodeBlock :code="output" language="toml" />
        </div>
        <pre v-else class="w-full h-96 p-4 font-mono text-sm text-gray-400">Formatted output...</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
