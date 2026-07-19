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

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'ON', 'ORDER BY', 'GROUP BY',
  'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'SET',
  'VALUES', 'INTO', 'LIMIT', 'OFFSET', 'UNION', 'INNER', 'LEFT', 'RIGHT',
  'OUTER', 'CROSS', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN',
  'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
]

const NEWLINE_BEFORE = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'ORDER BY', 'GROUP BY',
  'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'OUTER JOIN', 'CROSS JOIN', 'SET', 'VALUES', 'ON',
]

function format() {
  if (!input.value.trim()) return
  try {
    error.value = ''
    let sql = input.value.replace(/\s+/g, ' ').trim()

    // Uppercase keywords
    for (const kw of KEYWORDS) {
      const regex = new RegExp(`\\b${kw.replace(' ', '\\s+')}\\b`, 'gi')
      sql = sql.replace(regex, kw)
    }

    // Add newlines before major keywords
    for (const kw of NEWLINE_BEFORE) {
      const regex = new RegExp(`\\s+(?=${kw.replace(' ', '\\s+')}\\b)`, 'gi')
      sql = sql.replace(regex, '\n')
    }

    // Indent lines after SELECT, etc.
    const lines = sql.split('\n')
    let formatted = ''
    let indent = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (/^(FROM|WHERE|ORDER BY|GROUP BY|HAVING|LIMIT|SET|VALUES)\b/.test(trimmed)) {
        indent = 0
      } else if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/.test(trimmed)) {
        indent = 0
      } else if (/^(AND|OR|ON)\b/.test(trimmed)) {
        indent = 1
      } else if (/^(INNER|LEFT|RIGHT|OUTER|CROSS)?\s*JOIN\b/.test(trimmed)) {
        indent = 0
      }

      formatted += '  '.repeat(indent) + trimmed + '\n'

      if (/^(SELECT|WHERE)\b/.test(trimmed)) {
        indent = 1
      }
    }

    output.value = formatted.trimEnd()
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function minify() {
  if (!input.value.trim()) return
  try {
    error.value = ''
    output.value = input.value.replace(/\s+/g, ' ').trim()
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}
</script>

<template>
  <ToolLayout tool-id="sql-formatter" title="SQL Formatter" description="Format SQL queries">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Maximize2" @click="format">Format</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Minimize2" @click="minify">Minify</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span></template>
        <textarea v-model="input" class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none" placeholder="Paste SQL here..." spellcheck="false" />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span></template>
        <div v-if="output" class="h-96 overflow-auto">
          <CodeBlock :code="output" language="sql" />
        </div>
        <pre v-else class="w-full h-96 p-4 font-mono text-sm text-gray-400">Formatted output...</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
