<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, RefreshCw, Trash2 } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const count = ref(1)
const results = ref<{ ulid: string; timestamp: string }[]>([])

// Crockford's Base32 encoding
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function encodeTime(now: number, length: number): string {
  let str = ''
  for (let i = length; i > 0; i--) {
    const mod = now % 32
    str = CROCKFORD[mod] + str
    now = (now - mod) / 32
  }
  return str
}

function encodeRandom(length: number): string {
  let str = ''
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < length; i++) {
    str += CROCKFORD[bytes[i] % 32]
  }
  return str
}

function generateUlid(): string {
  const now = Date.now()
  const time = encodeTime(now, 10)
  const random = encodeRandom(16)
  return time + random
}

function ulidToTimestamp(ulid: string): string {
  let time = 0
  const timeStr = ulid.slice(0, 10)
  for (let i = 0; i < timeStr.length; i++) {
    const idx = CROCKFORD.indexOf(timeStr[i].toUpperCase())
    time = time * 32 + idx
  }
  return new Date(time).toISOString()
}

function generate() {
  const newResults: { ulid: string; timestamp: string }[] = []
  for (let i = 0; i < count.value; i++) {
    const ulid = generateUlid()
    newResults.push({
      ulid,
      timestamp: ulidToTimestamp(ulid),
    })
  }
  results.value = newResults
}

function copyAll() {
  copy(results.value.map((r) => r.ulid).join('\n'))
}

function clear() {
  results.value = []
}

// Generate one on mount
generate()
</script>

<template>
  <ToolLayout tool-id="ulid-generator" title="ULID Generator" description="Generate Universally Unique Lexicographically Sortable Identifiers">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="RefreshCw" @click="generate">Generate</BaseButton>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400">Count:</label>
        <input
          v-model.number="count"
          type="number"
          min="1"
          max="100"
          class="w-20 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      <BaseButton v-if="results.length > 0" variant="secondary" size="sm" :icon="copied ? Check : Copy" @click="copyAll">
        {{ copied ? 'Copied!' : 'Copy All' }}
      </BaseButton>
      <BaseButton variant="ghost" size="sm" :icon="Trash2" class="ml-auto" @click="clear">Clear</BaseButton>
    </div>

    <!-- Info -->
    <BaseCard variant="bordered" class="mb-4">
      <div class="flex items-start gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div>
          <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">ULID Format</p>
          <p class="font-mono">TTTTTTTTTTRRRRRRRRRRRRRRRRR</p>
          <p class="mt-1">T = Timestamp (48-bit, ms precision) · R = Randomness (80-bit)</p>
        </div>
        <div class="border-l border-gray-200 dark:border-gray-700 pl-4">
          <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Properties</p>
          <p>• 128-bit compatible with UUID</p>
          <p>• Lexicographically sortable</p>
          <p>• Crockford's Base32 encoded</p>
          <p>• 26 characters</p>
        </div>
      </div>
    </BaseCard>

    <!-- Results -->
    <div v-if="results.length > 0" class="space-y-2">
      <BaseCard v-for="(item, idx) in results" :key="idx" variant="bordered">
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
              <span class="text-blue-600 dark:text-blue-400">{{ item.ulid.slice(0, 10) }}</span><span class="text-gray-900 dark:text-gray-100">{{ item.ulid.slice(10) }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Timestamp: {{ item.timestamp }}
            </p>
          </div>
          <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(item.ulid)" />
        </div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
