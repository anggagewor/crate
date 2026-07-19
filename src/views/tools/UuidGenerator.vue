<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseCheckbox } from '@purdia/ui'
import { Copy, Check, RefreshCw, Plus } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const count = ref(5)
const uuids = ref<string[]>([])
const uppercase = ref(false)
const noDashes = ref(false)

function generateUUID(): string {
  const uuid = crypto.randomUUID()
  let result: string = uuid
  if (noDashes.value) result = result.replace(/-/g, '')
  if (uppercase.value) result = result.toUpperCase()
  return result
}

function generate() {
  uuids.value = Array.from({ length: count.value }, () => generateUUID())
}

function addOne() {
  uuids.value.push(generateUUID())
}

function copyAll() {
  copy(uuids.value.join('\n'))
}

generate()
</script>

<template>
  <ToolLayout tool-id="uuid-generator" title="UUID Generator" description="Generate UUID v4 strings">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <BaseButton size="sm" :icon="RefreshCw" @click="generate">Generate</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Plus" @click="addOne">Add one</BaseButton>
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
      <BaseCheckbox v-model="uppercase" label="Uppercase" />
      <BaseCheckbox v-model="noDashes" label="No dashes" />
      <BaseButton
        v-if="uuids.length > 0"
        variant="ghost"
        size="sm"
        :icon="copied ? Check : Copy"
        class="ml-auto"
        @click="copyAll"
      >
        {{ copied ? 'Copied!' : 'Copy all' }}
      </BaseButton>
    </div>

    <!-- Output -->
    <BaseCard variant="bordered" :padding="false" flush>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="(uuid, index) in uuids"
          :key="index"
          class="flex items-center gap-2 px-4 py-2.5 group hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <code class="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100">{{ uuid }}</code>
          <BaseButton variant="ghost" size="sm" :icon="Copy" class="opacity-0 group-hover:opacity-100" @click="copy(uuid)" />
        </div>
      </div>
    </BaseCard>
  </ToolLayout>
</template>
