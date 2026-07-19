<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert, BaseSelect } from '@purdia/ui'
import { Copy, Check, Minimize2, Maximize2, Trash2 } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const indentSize = ref<string | number>(2)
const error = ref('')

const indentOptions = [
  { label: '2 spaces', value: 2 },
  { label: '4 spaces', value: 4 },
]

const output = computed(() => {
  if (!input.value.trim()) return ''
  try {
    const parsed = JSON.parse(input.value)
    error.value = ''
    return JSON.stringify(parsed, null, Number(indentSize.value))
  } catch (e: unknown) {
    error.value = (e as Error).message
    return ''
  }
})

function format() {
  if (!input.value.trim()) return
  try {
    const parsed = JSON.parse(input.value)
    input.value = JSON.stringify(parsed, null, Number(indentSize.value))
    error.value = ''
  } catch (e: unknown) {
    error.value = (e as Error).message
  }
}

function minify() {
  if (!input.value.trim()) return
  try {
    const parsed = JSON.parse(input.value)
    input.value = JSON.stringify(parsed)
    error.value = ''
  } catch (e: unknown) {
    error.value = (e as Error).message
  }
}

function clear() {
  input.value = ''
  error.value = ''
}
</script>

<template>
  <ToolLayout tool-id="json-formatter" title="JSON Formatter" description="Format, validate, and minify JSON">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="Maximize2" @click="format">Format</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="Minimize2" @click="minify">Minify</BaseButton>
      <BaseSelect
        v-model="indentSize"
        :options="indentOptions"
        size="sm"
        placeholder="Indent"
        :clearable="false"
        class="ml-auto w-52"
      />
      <BaseButton variant="ghost" size="sm" :icon="Trash2" @click="clear">Clear</BaseButton>
    </div>

    <!-- Error -->
    <BaseAlert v-if="error" variant="danger" class="mb-4">
      {{ error }}
    </BaseAlert>

    <!-- Editor -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input</span>
        </template>
        <textarea
          v-model="input"
          class="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="Paste your JSON here..."
          spellcheck="false"
        />
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
        <div v-if="output" class="h-96 overflow-auto">
          <CodeBlock :code="output" language="json" />
        </div>
        <pre v-else class="w-full h-96 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-400">Formatted output will appear here...</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
