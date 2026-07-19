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
    const code = input.value.trim()
    let formatted = ''
    let indent = 0
    let inString: string | null = null
    let escaped = false

    for (let i = 0; i < code.length; i++) {
      const ch = code[i]
      const prev = i > 0 ? code[i - 1] : ''

      if (escaped) {
        formatted += ch
        escaped = false
        continue
      }

      if (ch === '\\' && inString) {
        formatted += ch
        escaped = true
        continue
      }

      if ((ch === '"' || ch === "'" || ch === '`') && !inString) {
        inString = ch
        formatted += ch
        continue
      }

      if (ch === inString) {
        inString = null
        formatted += ch
        continue
      }

      if (inString) {
        formatted += ch
        continue
      }

      if (ch === '{' || ch === '[') {
        formatted += ch + '\n'
        indent++
        formatted += '  '.repeat(indent)
        // Skip whitespace
        while (i + 1 < code.length && (code[i + 1] === ' ' || code[i + 1] === '\n' || code[i + 1] === '\r' || code[i + 1] === '\t')) i++
      } else if (ch === '}' || ch === ']') {
        formatted = formatted.trimEnd() + '\n'
        indent--
        formatted += '  '.repeat(Math.max(indent, 0)) + ch
        // Check if next non-space char is comma, semicolon, or closing
        const nextNonSpace = code.slice(i + 1).match(/^\s*(.)/)
        if (nextNonSpace && (nextNonSpace[1] === ',' || nextNonSpace[1] === ';')) {
          // let comma/semi be added next iteration
        } else {
          formatted += '\n' + '  '.repeat(Math.max(indent, 0))
        }
        while (i + 1 < code.length && (code[i + 1] === ' ' || code[i + 1] === '\n' || code[i + 1] === '\r' || code[i + 1] === '\t')) i++
      } else if (ch === ';') {
        formatted += ';\n' + '  '.repeat(indent)
        while (i + 1 < code.length && (code[i + 1] === ' ' || code[i + 1] === '\n' || code[i + 1] === '\r' || code[i + 1] === '\t')) i++
      } else if (ch === ',' && prev !== '\\') {
        formatted += ',\n' + '  '.repeat(indent)
        while (i + 1 < code.length && (code[i + 1] === ' ' || code[i + 1] === '\n' || code[i + 1] === '\r' || code[i + 1] === '\t')) i++
      } else if (ch === '\n' || ch === '\r') {
        // Skip existing newlines since we handle them
      } else if (ch === ' ' || ch === '\t') {
        if (formatted.length > 0 && !formatted.endsWith(' ') && !formatted.endsWith('\n')) {
          formatted += ' '
        }
      } else {
        formatted += ch
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
    let result = ''
    let inString: string | null = null
    let escaped = false
    const code = input.value

    for (let i = 0; i < code.length; i++) {
      const ch = code[i]

      if (escaped) {
        result += ch
        escaped = false
        continue
      }

      if (ch === '\\' && inString) {
        result += ch
        escaped = true
        continue
      }

      if ((ch === '"' || ch === "'" || ch === '`') && !inString) {
        inString = ch
        result += ch
        continue
      }

      if (ch === inString) {
        inString = null
        result += ch
        continue
      }

      if (inString) {
        result += ch
        continue
      }

      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
        // Keep single space between identifiers
        if (result.length > 0 && /[a-zA-Z0-9_$]/.test(result[result.length - 1])) {
          const next = code.slice(i).match(/^\s*(.)/)
          if (next && /[a-zA-Z0-9_$]/.test(next[1])) {
            result += ' '
          }
        }
      } else {
        result += ch
      }
    }

    output.value = result
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}
</script>

<template>
  <ToolLayout tool-id="js-formatter" title="JS/TS Formatter" description="Format JavaScript and TypeScript">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Maximize2" @click="format">Format</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Minimize2" @click="minify">Minify</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span></template>
        <textarea v-model="input" class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none" placeholder="Paste JavaScript or TypeScript here..." spellcheck="false" />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span></template>
        <pre class="w-full h-96 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">{{ output || 'Formatted output...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
