<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const output = ref('')
const mode = ref<'encode' | 'decode'>('encode')
const error = ref('')

function encode() {
  try {
    output.value = btoa(unescape(encodeURIComponent(input.value)))
    error.value = ''
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function decode() {
  try {
    output.value = decodeURIComponent(escape(atob(input.value)))
    error.value = ''
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function convert() {
  if (mode.value === 'encode') {
    encode()
  } else {
    decode()
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
  <ToolLayout tool-id="base64" title="Base64 Encode / Decode" description="Encode and decode Base64 strings">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-4">
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'encode' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'encode'"
        >Encode</button>
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'decode' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'decode'"
        >Decode</button>
      </div>
      <BaseButton size="sm" @click="convert">Convert</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="ArrowLeftRight" @click="swap">Swap</BaseButton>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Editor -->
    <div class="space-y-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ mode === 'encode' ? 'Plain text' : 'Base64 string' }}
          </span>
        </template>
        <textarea
          v-model="input"
          class="w-full h-40 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          :placeholder="mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'"
          spellcheck="false"
          @input="convert"
        />
      </BaseCard>

      <div class="flex justify-center">
        <ArrowDown v-if="mode === 'encode'" :size="20" class="text-gray-400" />
        <ArrowUp v-else :size="20" class="text-gray-400" />
      </div>

      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
              {{ mode === 'encode' ? 'Base64 output' : 'Decoded text' }}
            </span>
            <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copy(output)">
              {{ copied ? 'Copied!' : 'Copy' }}
            </BaseButton>
          </div>
        </template>
        <pre class="w-full h-40 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">{{ output || 'Output will appear here...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
