<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, ArrowLeftRight } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const output = ref('')
const mode = ref<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml')
const error = ref('')

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (obj === null) return 'null'
  if (typeof obj === 'boolean') return obj ? 'true' : 'false'
  if (typeof obj === 'number') return String(obj)
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`
    }
    return obj
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map((item) => {
      const val = jsonToYaml(item, indent + 1)
      if (typeof item === 'object' && item !== null) {
        return `${pad}- ${val.trim()}`
      }
      return `${pad}- ${val}`
    }).join('\n')
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([key, val]) => {
      const yamlVal = jsonToYaml(val, indent + 1)
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return `${pad}${key}:\n${yamlVal}`
      }
      if (Array.isArray(val)) {
        return `${pad}${key}:\n${yamlVal}`
      }
      return `${pad}${key}: ${yamlVal}`
    }).join('\n')
  }
  return String(obj)
}

function yamlToJson(yaml: string): unknown {
  const lines = yaml.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'))
  const result: Record<string, unknown> = {}
  let currentKey = ''

  for (const line of lines) {
    const kvMatch = line.match(/^(\s*)([\w.-]+)\s*:\s*(.*)$/)
    if (kvMatch) {
      const [, , key, value] = kvMatch
      const trimVal = value.trim()
      if (!trimVal) {
        currentKey = key
        result[key] = {}
      } else if (trimVal === 'true') {
        result[key] = true
      } else if (trimVal === 'false') {
        result[key] = false
      } else if (trimVal === 'null') {
        result[key] = null
      } else if (/^-?\d+(\.\d+)?$/.test(trimVal)) {
        result[key] = Number(trimVal)
      } else if (trimVal.startsWith('"') && trimVal.endsWith('"')) {
        result[key] = trimVal.slice(1, -1)
      } else {
        result[key] = trimVal
      }
    } else {
      const listMatch = line.match(/^(\s*)-\s*(.*)$/)
      if (listMatch && currentKey) {
        if (!Array.isArray(result[currentKey])) {
          result[currentKey] = []
        }
        const val = listMatch[2].trim()
        ;(result[currentKey] as unknown[]).push(val)
      }
    }
  }
  return result
}

function convert() {
  if (!input.value.trim()) return
  try {
    error.value = ''
    if (mode.value === 'json-to-yaml') {
      const parsed = JSON.parse(input.value)
      output.value = jsonToYaml(parsed)
    } else {
      const parsed = yamlToJson(input.value)
      output.value = JSON.stringify(parsed, null, 2)
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
  mode.value = mode.value === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml'
}
</script>

<template>
  <ToolLayout tool-id="json-yaml" title="JSON ↔ YAML" description="Convert between JSON and YAML">
    <div class="flex items-center gap-3 mb-4">
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'json-to-yaml' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'json-to-yaml'"
        >JSON → YAML</button>
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'yaml-to-json' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'yaml-to-json'"
        >YAML → JSON</button>
      </div>
      <BaseButton size="sm" @click="convert">Convert</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="ArrowLeftRight" @click="swap">Swap</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'json-to-yaml' ? 'JSON' : 'YAML' }}</span></template>
        <textarea
          v-model="input"
          class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          :placeholder="mode === 'json-to-yaml' ? 'Paste JSON here...' : 'Paste YAML here...'"
          spellcheck="false"
        />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'json-to-yaml' ? 'YAML' : 'JSON' }}</span></template>
        <pre class="w-full h-96 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">{{ output || 'Converted output...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
