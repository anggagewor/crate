<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, ArrowLeftRight } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const output = ref('')
const mode = ref<'escape' | 'unescape'>('escape')
const error = ref('')

function escape_unicode() {
  try {
    error.value = ''
    output.value = input.value
      .split('')
      .map((ch) => {
        const code = ch.charCodeAt(0)
        if (code > 127) {
          return '\\u' + code.toString(16).padStart(4, '0')
        }
        return ch
      })
      .join('')
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function unescape_unicode() {
  try {
    error.value = ''
    output.value = input.value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function convert() {
  if (mode.value === 'escape') escape_unicode()
  else unescape_unicode()
}

function swap() {
  const temp = input.value
  input.value = output.value
  output.value = temp
  mode.value = mode.value === 'escape' ? 'unescape' : 'escape'
}
</script>

<template>
  <ToolLayout tool-id="unicode-escape" title="Unicode Escape" description="Escape and unescape Unicode strings">
    <div class="flex items-center gap-3 mb-4">
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'escape' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'escape'"
        >Escape</button>
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'unescape' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'unescape'"
        >Unescape</button>
      </div>
      <BaseButton size="sm" @click="convert">Convert</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="ArrowLeftRight" @click="swap">Swap</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'escape' ? 'Plain text' : 'Escaped text' }}</span></template>
        <textarea
          v-model="input"
          class="w-full h-64 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          :placeholder="mode === 'escape' ? 'Enter text to escape...' : 'Enter escaped text...'"
          spellcheck="false"
          @input="convert"
        />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'escape' ? 'Escaped output' : 'Unescaped output' }}</span></template>
        <pre class="w-full h-64 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">{{ output || 'Output will appear here...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
