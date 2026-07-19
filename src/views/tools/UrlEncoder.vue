<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, ArrowLeftRight } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const output = ref('')
const mode = ref<'encode' | 'decode'>('encode')

function convert() {
  try {
    if (mode.value === 'encode') {
      output.value = encodeURIComponent(input.value)
    } else {
      output.value = decodeURIComponent(input.value)
    }
  } catch (e: unknown) {
    output.value = `Error: ${(e as Error).message}`
  }
}

function swap() {
  const temp = input.value
  input.value = output.value
  output.value = temp
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}
</script>

<template>
  <ToolLayout tool-id="url-encoder" title="URL Encoder / Decoder" description="Encode and decode URL components">
    <div class="flex items-center gap-3 mb-4">
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button class="px-3 py-1.5 text-sm rounded-md transition-colors" :class="mode === 'encode' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'" @click="mode = 'encode'">Encode</button>
        <button class="px-3 py-1.5 text-sm rounded-md transition-colors" :class="mode === 'decode' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'" @click="mode = 'decode'">Decode</button>
      </div>
      <BaseButton size="sm" @click="convert">Convert</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="ArrowLeftRight" @click="swap">Swap</BaseButton>
    </div>
    <div class="space-y-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span>
        </template>
        <textarea v-model="input" class="w-full h-32 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none" placeholder="Enter text..." spellcheck="false" @input="convert" />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span>
            <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copy(output)">
              {{ copied ? 'Copied!' : 'Copy' }}
            </BaseButton>
          </div>
        </template>
        <pre class="w-full h-32 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">{{ output || 'Output...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
