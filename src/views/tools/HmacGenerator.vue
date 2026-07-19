<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, Play } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const secret = ref('')
const results = ref<{ algo: string; hash: string }[]>([])
const error = ref('')

const algorithms: { name: string; hash: string }[] = [
  { name: 'HMAC-SHA256', hash: 'SHA-256' },
  { name: 'HMAC-SHA512', hash: 'SHA-512' },
]

async function generate() {
  if (!input.value || !secret.value) {
    error.value = 'Please provide both input text and secret key'
    results.value = []
    return
  }

  try {
    error.value = ''
    const encoder = new TextEncoder()
    const data = encoder.encode(input.value)
    const keyData = encoder.encode(secret.value)

    const hashes = await Promise.all(
      algorithms.map(async (algo) => {
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: algo.hash },
          false,
          ['sign']
        )
        const signature = await crypto.subtle.sign('HMAC', key, data)
        const array = Array.from(new Uint8Array(signature))
        const hex = array.map((b) => b.toString(16).padStart(2, '0')).join('')
        return { algo: algo.name, hash: hex }
      })
    )
    results.value = hashes
  } catch (e: unknown) {
    error.value = (e as Error).message
    results.value = []
  }
}
</script>

<template>
  <ToolLayout tool-id="hmac-generator" title="HMAC Generator" description="Generate HMAC signatures">
    <div class="space-y-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input text</span></template>
        <textarea
          v-model="input"
          class="w-full h-32 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="Enter text to sign..."
          spellcheck="false"
        />
      </BaseCard>

      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Secret key</span></template>
        <input
          v-model="secret"
          type="text"
          class="w-full p-4 font-mono text-sm bg-transparent border-0 focus:outline-none"
          placeholder="Enter secret key..."
        />
      </BaseCard>

      <BaseButton size="sm" :icon="Play" @click="generate">Generate HMAC</BaseButton>

      <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

      <div v-if="results.length" class="space-y-3">
        <BaseCard v-for="r in results" :key="r.algo" variant="bordered">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ r.algo }}</span>
            <BaseButton variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copy(r.hash)" />
          </div>
          <code class="block text-xs font-mono text-gray-900 dark:text-gray-100 break-all">{{ r.hash }}</code>
        </BaseCard>
      </div>
    </div>
  </ToolLayout>
</template>
