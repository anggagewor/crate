<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Plus, Trash2, Copy, Check } from 'lucide-vue-next'

const { copied, copy } = useCopy()

interface EnvLine {
  key: string
  value: string
  isComment: boolean
  raw?: string
}

const rawInput = ref('')
const lines = ref<EnvLine[]>([])

function parse() {
  const result: EnvLine[] = []
  const rawLines = rawInput.value.split('\n')
  for (const line of rawLines) {
    const trimmed = line.trim()
    if (trimmed === '') {
      result.push({ key: '', value: '', isComment: false, raw: '' })
    } else if (trimmed.startsWith('#')) {
      result.push({ key: '', value: '', isComment: true, raw: line })
    } else {
      const eqIdx = line.indexOf('=')
      if (eqIdx === -1) {
        result.push({ key: line, value: '', isComment: false })
      } else {
        result.push({ key: line.slice(0, eqIdx), value: line.slice(eqIdx + 1), isComment: false })
      }
    }
  }
  lines.value = result
}

function addRow() {
  lines.value.push({ key: '', value: '', isComment: false })
}

function deleteRow(index: number) {
  lines.value.splice(index, 1)
}

const output = computed(() => {
  return lines.value
    .map((line) => {
      if (line.isComment) return line.raw || ''
      if (line.key === '' && line.value === '' && line.raw === '') return ''
      return `${line.key}=${line.value}`
    })
    .join('\n')
})

function exportOutput() {
  copy(output.value)
}
</script>

<template>
  <ToolLayout tool-id="env-editor" title="Env Editor" description="Visual .env file editor — parse, edit, and export environment variables">
    <div class="space-y-4">
      <!-- Raw input -->
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Paste .env content</span>
            <BaseButton size="sm" @click="parse">Parse</BaseButton>
          </div>
        </template>
        <textarea
          v-model="rawInput"
          class="w-full h-32 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="DB_HOST=localhost&#10;DB_PORT=5432&#10;# This is a comment&#10;SECRET_KEY=my-secret"
          spellcheck="false"
        />
      </BaseCard>

      <!-- Editable rows -->
      <div v-if="lines.length">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Variables</span>
          <div class="flex gap-2">
            <BaseButton size="sm" :icon="Plus" @click="addRow">Add Row</BaseButton>
            <BaseButton size="sm" :icon="copied ? Check : Copy" @click="exportOutput">
              {{ copied ? 'Copied!' : 'Export & Copy' }}
            </BaseButton>
          </div>
        </div>
        <BaseCard variant="bordered" :padding="false">
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <div v-for="(line, idx) in lines" :key="idx" class="flex items-center gap-2 px-3 py-2">
              <!-- Comment row -->
              <template v-if="line.isComment">
                <div class="flex-1 font-mono text-xs text-gray-400 italic truncate">{{ line.raw }}</div>
              </template>
              <!-- Empty row -->
              <template v-else-if="line.key === '' && line.value === '' && line.raw === ''">
                <div class="flex-1 text-xs text-gray-300 italic">empty line</div>
              </template>
              <!-- Key-Value row -->
              <template v-else>
                <input
                  v-model="line.key"
                  type="text"
                  class="w-40 px-2 py-1 font-mono text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                  placeholder="KEY"
                />
                <span class="text-gray-400 text-xs">=</span>
                <input
                  v-model="line.value"
                  type="text"
                  class="flex-1 px-2 py-1 font-mono text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500/30"
                  placeholder="value"
                />
              </template>
              <BaseButton
                v-if="!line.isComment"
                variant="ghost"
                size="sm"
                :icon="Trash2"
                class="text-gray-400 hover:text-red-500"
                @click="deleteRow(idx)"
              />
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Output preview -->
      <BaseCard v-if="lines.length" variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span>
        </template>
        <pre class="p-4 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ output }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
