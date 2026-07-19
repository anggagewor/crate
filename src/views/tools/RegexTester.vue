<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseCard, BaseAlert, BaseButton } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

const pattern = ref('')
const flags = ref('g')
const testString = ref('')
const error = ref('')

const matches = computed(() => {
  if (!pattern.value || !testString.value) return []
  try {
    const regex = new RegExp(pattern.value, flags.value)
    error.value = ''
    const results: { match: string; index: number; groups?: Record<string, string> }[] = []
    let m: RegExpExecArray | null
    let safety = 0
    while ((m = regex.exec(testString.value)) !== null && safety < 1000) {
      results.push({
        match: m[0],
        index: m.index,
        groups: m.groups,
      })
      if (!regex.global) break
      if (m[0].length === 0) regex.lastIndex++
      safety++
    }
    return results
  } catch (e: unknown) {
    error.value = (e as Error).message
    return []
  }
})

const highlightedText = computed(() => {
  if (!pattern.value || !testString.value || error.value) return ''
  try {
    const regex = new RegExp(pattern.value, flags.value)
    return testString.value.replace(regex, (match) =>
      `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">${escapeHtml(match)}</mark>`
    )
  } catch {
    return escapeHtml(testString.value)
  }
})

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
</script>

<template>
  <ToolLayout tool-id="regex-tester" title="Regex Tester" description="Test regular expressions with live matching">
    <div class="space-y-4">
      <!-- Pattern -->
      <BaseCard variant="bordered">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Pattern</label>
        <div class="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500">
          <span class="pl-3 text-gray-400 font-mono text-sm">/</span>
          <input
            v-model="pattern"
            type="text"
            class="flex-1 px-1 py-2 font-mono text-sm bg-transparent outline-none"
            placeholder="your regex here"
            spellcheck="false"
          />
          <span class="text-gray-400 font-mono text-sm">/</span>
          <input
            v-model="flags"
            type="text"
            class="w-12 px-1 py-2 font-mono text-sm bg-transparent outline-none text-primary-600"
            placeholder="flags"
          />
        </div>
      </BaseCard>

      <!-- Error -->
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>

      <!-- Test String -->
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Test String</span>
        </template>
        <textarea
          v-model="testString"
          class="w-full h-32 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="Enter text to test against..."
          spellcheck="false"
        />
      </BaseCard>

      <!-- Highlighted result -->
      <BaseCard v-if="highlightedText" variant="bordered">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Highlighted Matches</label>
        <div
          class="p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 rounded-lg whitespace-pre-wrap break-words"
          v-html="highlightedText"
        />
      </BaseCard>

      <!-- Match list -->
      <BaseCard v-if="matches.length > 0" variant="bordered" :padding="false">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ matches.length }} match{{ matches.length > 1 ? 'es' : '' }}</span>
            <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(matches.map(m => m.match).join('\n'))" />
          </div>
        </template>
        <div class="divide-y divide-gray-100 dark:divide-gray-700 max-h-40 overflow-y-auto">
          <div
            v-for="(m, idx) in matches"
            :key="idx"
            class="flex items-center gap-3 px-4 py-2 text-xs font-mono"
          >
            <span class="text-gray-400 w-6">{{ idx }}</span>
            <span class="text-gray-900 dark:text-gray-100">{{ m.match }}</span>
            <span class="text-gray-400 ml-auto">@{{ m.index }}</span>
          </div>
        </div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
