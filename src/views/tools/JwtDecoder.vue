<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseCard, BaseButton } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

const token = ref('')

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return decodeURIComponent(escape(atob(padded)))
}

const decoded = computed(() => {
  if (!token.value.trim()) return null
  const parts = token.value.trim().split('.')
  if (parts.length !== 3) return { error: 'Invalid JWT format (expected 3 parts)' }
  try {
    const header = JSON.parse(decodeBase64Url(parts[0]))
    const payload = JSON.parse(decodeBase64Url(parts[1]))
    const expDate = payload.exp ? new Date(payload.exp * 1000) : null
    const iatDate = payload.iat ? new Date(payload.iat * 1000) : null
    const isExpired = expDate ? expDate < new Date() : false
    return { header, payload, signature: parts[2], expDate, iatDate, isExpired }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
})
</script>

<template>
  <ToolLayout tool-id="jwt-decoder" title="JWT Decoder" description="Decode and inspect JWT tokens">
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">JWT Token</label>
        <textarea v-model="token" class="w-full h-24 p-4 font-mono text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Paste your JWT token here..." spellcheck="false" />
      </div>

      <div v-if="decoded && 'error' in decoded" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
        {{ decoded.error }}
      </div>

      <div v-else-if="decoded" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BaseCard variant="bordered">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500">Header</span>
            <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(JSON.stringify(decoded.header, null, 2))" />
          </div>
          <CodeBlock :code="JSON.stringify(decoded.header, null, 2)" language="json" />
        </BaseCard>
        <BaseCard variant="bordered">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500">Payload</span>
            <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(JSON.stringify(decoded.payload, null, 2))" />
          </div>
          <CodeBlock :code="JSON.stringify(decoded.payload, null, 2)" language="json" />
          <div v-if="decoded.expDate" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
            <span class="text-gray-500">Expires:</span>
            <span :class="decoded.isExpired ? 'text-red-500' : 'text-green-500'" class="ml-1">
              {{ decoded.expDate.toLocaleString() }} {{ decoded.isExpired ? '(expired)' : '(valid)' }}
            </span>
          </div>
        </BaseCard>
      </div>
    </div>
  </ToolLayout>
</template>
