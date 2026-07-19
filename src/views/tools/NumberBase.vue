<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseCard, BaseButton, BaseSelect } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

const input = ref('')
const inputBase = ref<string | number>(10)

const baseOptions = [
  { label: 'Binary (2)', value: 2 },
  { label: 'Octal (8)', value: 8 },
  { label: 'Decimal (10)', value: 10 },
  { label: 'Hex (16)', value: 16 },
]

const conversions = computed(() => {
  if (!input.value.trim()) return null
  try {
    const num = parseInt(input.value, Number(inputBase.value))
    if (isNaN(num)) return { error: 'Invalid number for selected base' }
    return {
      decimal: num.toString(10),
      hex: num.toString(16).toUpperCase(),
      octal: num.toString(8),
      binary: num.toString(2),
    }
  } catch {
    return { error: 'Invalid input' }
  }
})
</script>

<template>
  <ToolLayout tool-id="number-base" title="Number Base Converter" description="Convert between decimal, hex, octal, binary">
    <div class="space-y-4">
      <div class="flex gap-3 items-end">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Input</label>
          <input v-model="input" type="text" class="w-full px-3 py-2 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Enter a number..." spellcheck="false" />
        </div>
        <div class="w-44">
          <BaseSelect
            v-model="inputBase"
            :options="baseOptions"
            label="Base"
            size="md"
            :clearable="false"
            :searchable="false"
          />
        </div>
      </div>

      <div v-if="conversions && 'error' in conversions" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
        {{ conversions.error }}
      </div>

      <div v-else-if="conversions" class="space-y-3">
        <BaseCard v-for="(value, label) in conversions" :key="label" variant="bordered">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-gray-500 capitalize">{{ label }}</div>
              <code class="text-sm font-mono text-gray-900 dark:text-gray-100">{{ value }}</code>
            </div>
            <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(value as string)" />
          </div>
        </BaseCard>
      </div>
    </div>
  </ToolLayout>
</template>
