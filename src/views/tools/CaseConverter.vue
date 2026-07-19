<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

const input = ref('')

function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
}

const conversions = computed(() => {
  if (!input.value.trim()) return []
  const words = toWords(input.value)
  if (words.length === 0) return []

  return [
    {
      name: 'camelCase',
      value: words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
    },
    {
      name: 'PascalCase',
      value: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
    },
    {
      name: 'snake_case',
      value: words.join('_'),
    },
    {
      name: 'kebab-case',
      value: words.join('-'),
    },
    {
      name: 'SCREAMING_SNAKE_CASE',
      value: words.map((w) => w.toUpperCase()).join('_'),
    },
    {
      name: 'Title Case',
      value: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    },
  ]
})
</script>

<template>
  <ToolLayout tool-id="case-converter" title="Case Converter" description="Convert between camelCase, snake_case, kebab-case, PascalCase">
    <div class="space-y-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">Input text</span></template>
        <textarea
          v-model="input"
          class="w-full h-24 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="Enter text (e.g. myVariableName, my-variable-name, my_variable_name)..."
          spellcheck="false"
        />
      </BaseCard>

      <div v-if="conversions.length" class="space-y-2">
        <BaseCard v-for="c in conversions" :key="c.name" variant="bordered">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ c.name }}</span>
              <code class="block text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">{{ c.value }}</code>
            </div>
            <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(c.value)" />
          </div>
        </BaseCard>
      </div>
    </div>
  </ToolLayout>
</template>
