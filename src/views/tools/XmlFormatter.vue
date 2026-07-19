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
    let formatted = ''
    let indent = 0
    const xml = input.value.replace(/>\s*</g, '><').trim()
    const tokens = xml.match(/(<[^>]+>)|([^<]+)/g) || []

    for (const token of tokens) {
      if (token.startsWith('</')) {
        indent--
        formatted += '  '.repeat(Math.max(indent, 0)) + token + '\n'
      } else if (token.startsWith('<') && token.endsWith('/>')) {
        formatted += '  '.repeat(indent) + token + '\n'
      } else if (token.startsWith('<?') || token.startsWith('<!')) {
        formatted += '  '.repeat(indent) + token + '\n'
      } else if (token.startsWith('<') && !token.startsWith('</')) {
        formatted += '  '.repeat(indent) + token + '\n'
        indent++
      } else {
        const trimmed = token.trim()
        if (trimmed) {
          formatted += '  '.repeat(indent) + trimmed + '\n'
        }
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
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .replace(/>\s+/g, '>')
      .replace(/\s+</g, '<')
      .trim()
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}
</script>

<template>
  <ToolLayout tool-id="xml-formatter" title="XML Formatter" description="Format and prettify XML">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Maximize2" @click="format">Format</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Minimize2" @click="minify">Minify</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span></template>
        <textarea v-model="input" class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none" placeholder="Paste XML here..." spellcheck="false" />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span></template>
        <pre class="w-full h-96 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">{{ output || 'Formatted output...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
