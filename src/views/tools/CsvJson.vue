<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, ArrowLeftRight } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const output = ref('')
const mode = ref<'csv-to-json' | 'json-to-csv'>('csv-to-json')
const error = ref('')

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function csvToJson() {
  const lines = input.value.trim().split('\n').filter((l) => l.trim())
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')
  const headers = parseCsvLine(lines[0])
  const result = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = values[i] || ''
    })
    return obj
  })
  return JSON.stringify(result, null, 2)
}

function jsonToCsv() {
  const data = JSON.parse(input.value)
  if (!Array.isArray(data) || data.length === 0) throw new Error('JSON must be an array of objects')
  const headers = Object.keys(data[0])
  const lines = [headers.join(',')]
  for (const row of data) {
    const values = headers.map((h) => {
      const val = String(row[h] ?? '')
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    lines.push(values.join(','))
  }
  return lines.join('\n')
}

function convert() {
  if (!input.value.trim()) return
  try {
    error.value = ''
    if (mode.value === 'csv-to-json') {
      output.value = csvToJson()
    } else {
      output.value = jsonToCsv()
    }
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function swap() {
  const temp = input.value
  input.value = output.value
  output.value = temp
  mode.value = mode.value === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json'
}
</script>

<template>
  <ToolLayout tool-id="csv-json" title="CSV ↔ JSON" description="Convert between CSV and JSON">
    <div class="flex items-center gap-3 mb-4">
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'csv-to-json' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'csv-to-json'"
        >CSV → JSON</button>
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'json-to-csv' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'json-to-csv'"
        >JSON → CSV</button>
      </div>
      <BaseButton size="sm" @click="convert">Convert</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="ArrowLeftRight" @click="swap">Swap</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'csv-to-json' ? 'CSV' : 'JSON' }}</span></template>
        <textarea
          v-model="input"
          class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          :placeholder="mode === 'csv-to-json' ? 'Paste CSV here (first row = headers)...' : 'Paste JSON array here...'"
          spellcheck="false"
        />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'csv-to-json' ? 'JSON' : 'CSV' }}</span></template>
        <pre class="w-full h-96 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">{{ output || 'Converted output...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
