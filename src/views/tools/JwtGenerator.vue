<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, Play } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const header = ref(JSON.stringify({ alg: 'none', typ: 'JWT' }, null, 2))
const payload = ref(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: 1516239022 }, null, 2))
const output = ref('')
const error = ref('')

function base64url(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function generate() {
  try {
    error.value = ''
    const h = JSON.parse(header.value)
    const p = JSON.parse(payload.value)
    const encodedHeader = base64url(JSON.stringify(h))
    const encodedPayload = base64url(JSON.stringify(p))
    output.value = `${encodedHeader}.${encodedPayload}.unsigned`
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

generate()
</script>

<template>
  <ToolLayout tool-id="jwt-generator" title="JWT Generator" description="Generate unsigned JWT tokens for testing">
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Play" @click="generate">Generate</BaseButton>
      <BaseButton
        v-if="output"
        variant="ghost"
        size="sm"
        :icon="copied ? Check : Copy"
        class="ml-auto"
        @click="copy(output)"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </BaseButton>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Header (JSON)</span></template>
        <textarea
          v-model="header"
          class="w-full h-40 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder='{"alg": "none", "typ": "JWT"}'
          spellcheck="false"
        />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Payload (JSON)</span></template>
        <textarea
          v-model="payload"
          class="w-full h-40 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder='{"sub": "123", "name": "Test"}'
          spellcheck="false"
        />
      </BaseCard>
    </div>

    <BaseCard v-if="output" variant="bordered">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Generated Token</span>
      </div>
      <code class="block text-sm font-mono text-gray-900 dark:text-gray-100 break-all">{{ output }}</code>
    </BaseCard>
  </ToolLayout>
</template>
