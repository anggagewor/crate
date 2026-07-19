<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseCheckbox } from '@purdia/ui'
import { Copy, Check, RefreshCw } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const length = ref(16)
const uppercase = ref(true)
const lowercase = ref(true)
const numbers = ref(true)
const symbols = ref(true)
const count = ref(5)
const passwords = ref<string[]>([])

function generate() {
  let chars = ''
  if (lowercase.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (uppercase.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (numbers.value) chars += '0123456789'
  if (symbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'

  const results: string[] = []
  for (let i = 0; i < count.value; i++) {
    const array = new Uint32Array(length.value)
    crypto.getRandomValues(array)
    let pw = ''
    for (let j = 0; j < length.value; j++) {
      pw += chars[array[j] % chars.length]
    }
    results.push(pw)
  }
  passwords.value = results
}

function copyAll() {
  copy(passwords.value.join('\n'))
}

generate()
</script>

<template>
  <ToolLayout tool-id="password-generator" title="Password Generator" description="Generate secure random passwords">
    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <BaseButton size="sm" :icon="RefreshCw" @click="generate">Generate</BaseButton>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500">Length:</label>
        <input v-model.number="length" type="number" min="4" max="128" class="w-16 text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded" />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500">Count:</label>
        <input v-model.number="count" type="number" min="1" max="50" class="w-16 text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded" />
      </div>
    </div>
    <div class="flex flex-wrap gap-3 mb-4">
      <BaseCheckbox v-model="uppercase" label="A-Z" />
      <BaseCheckbox v-model="lowercase" label="a-z" />
      <BaseCheckbox v-model="numbers" label="0-9" />
      <BaseCheckbox v-model="symbols" label="Symbols" />
      <BaseButton
        v-if="passwords.length"
        variant="ghost"
        size="sm"
        :icon="copied ? Check : Copy"
        class="ml-auto"
        @click="copyAll"
      >
        {{ copied ? 'Copied!' : 'Copy all' }}
      </BaseButton>
    </div>

    <BaseCard variant="bordered" :padding="false" flush>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="(pw, idx) in passwords" :key="idx" class="flex items-center gap-2 px-4 py-2.5 group hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <code class="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{{ pw }}</code>
          <BaseButton variant="ghost" size="sm" :icon="Copy" class="opacity-0 group-hover:opacity-100" @click="copy(pw)" />
        </div>
      </div>
    </BaseCard>
  </ToolLayout>
</template>
