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
    let css = input.value.replace(/\s+/g, ' ').trim()
    let formatted = ''
    let indent = 0

    for (let i = 0; i < css.length; i++) {
      const ch = css[i]
      if (ch === '{') {
        formatted += ' {\n'
        indent++
        formatted += '  '.repeat(indent)
        // Skip whitespace after {
        while (i + 1 < css.length && css[i + 1] === ' ') i++
      } else if (ch === '}') {
        formatted = formatted.trimEnd() + '\n'
        indent--
        formatted += '  '.repeat(Math.max(indent, 0)) + '}\n\n'
        // Skip whitespace after }
        while (i + 1 < css.length && css[i + 1] === ' ') i++
      } else if (ch === ';') {
        formatted += ';\n'
        formatted += '  '.repeat(indent)
        // Skip whitespace after ;
        while (i + 1 < css.length && css[i + 1] === ' ') i++
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
    output.value = input.value
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*,\s*/g, ',')
      .trim()
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}
</script>

<template>
  <ToolLayout tool-id="css-formatter" title="CSS Formatter" description="Format and beautify CSS">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Maximize2" @click="format">Format</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Minimize2" @click="minify">Minify</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span></template>
        <textarea v-model="input" class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none" placeholder="Paste CSS here..." spellcheck="false" />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span></template>
        <div v-if="output" class="h-96 overflow-auto">
          <CodeBlock :code="output" language="css" />
        </div>
        <pre v-else class="w-full h-96 p-4 font-mono text-sm text-gray-400">Formatted output...</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
