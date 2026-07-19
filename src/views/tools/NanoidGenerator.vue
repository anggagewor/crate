<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, RefreshCw, Plus } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const length = ref(21)
const count = ref(5)
const alphabet = ref('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-')
const ids = ref<string[]>([])

function generateNanoid(): string {
  const chars = alphabet.value
  const len = length.value
  const values = crypto.getRandomValues(new Uint8Array(len))
  let result = ''
  for (let i = 0; i < len; i++) {
    result += chars[values[i] % chars.length]
  }
  return result
}

function generate() {
  ids.value = Array.from({ length: count.value }, () => generateNanoid())
}

function addOne() {
  ids.value.push(generateNanoid())
}

function copyAll() {
  copy(ids.value.join('\n'))
}

generate()
</script>

<template>
  <ToolLayout tool-id="nanoid-generator" title="NanoID Generator" description="Generate compact unique IDs">
    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <BaseButton size="sm" :icon="RefreshCw" @click="generate">Generate</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Plus" @click="addOne">Add one</BaseButton>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500 dark:text-gray-400">Length:</label>
        <input
          v-model.number="length"
          type="number"
          min="1"
          max="256"
          class="w-16 text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500 dark:text-gray-400">Count:</label>
        <input
          v-model.number="count"
          type="number"
          min="1"
          max="100"
          class="w-16 text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
        />
      </div>
      <BaseButton
        v-if="ids.length > 0"
        variant="ghost"
        size="sm"
        :icon="copied ? Check : Copy"
        class="ml-auto"
        @click="copyAll"
      >
        {{ copied ? 'Copied!' : 'Copy all' }}
      </BaseButton>
    </div>

    <div class="mb-4">
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Alphabet</label>
      <input
        v-model="alphabet"
        type="text"
        class="w-full text-xs px-3 py-2 font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
      />
    </div>

    <BaseCard variant="bordered" :padding="false" flush>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="(id, index) in ids"
          :key="index"
          class="flex items-center gap-2 px-4 py-2.5 group hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <code class="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100">{{ id }}</code>
          <BaseButton variant="ghost" size="sm" :icon="Copy" class="opacity-0 group-hover:opacity-100" @click="copy(id)" />
        </div>
      </div>
    </BaseCard>
  </ToolLayout>
</template>
