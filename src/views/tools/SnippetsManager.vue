<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { useCopy } from '@/composables/useCopy'
import { loadJson, saveJson } from '@/services/storage'
import { BaseButton, BaseCard, BaseSelect } from '@purdia/ui'
import { Plus, Trash2, Save, Copy } from 'lucide-vue-next'

const { copy } = useCopy()

interface Snippet {
  id: string
  title: string
  language: string
  code: string
  createdAt: number
}

const STORAGE_FILE = 'snippets.json'

const snippets = ref<Snippet[]>([])
const selectedId = ref<string | null>(null)

const languageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'SQL', value: 'sql' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Python', value: 'python' },
  { label: 'Bash', value: 'bash' },
  { label: 'Plain Text', value: 'plaintext' },
]

const selected = computed(() => snippets.value.find((s) => s.id === selectedId.value) || null)

onMounted(async () => {
  snippets.value = await loadJson<Snippet[]>(STORAGE_FILE, [])
  if (snippets.value.length) {
    selectedId.value = snippets.value[0].id
  }
})

async function persist() {
  await saveJson(STORAGE_FILE, snippets.value)
}

function addSnippet() {
  const snippet: Snippet = {
    id: crypto.randomUUID(),
    title: 'Untitled',
    language: 'plaintext',
    code: '',
    createdAt: Date.now(),
  }
  snippets.value.unshift(snippet)
  selectedId.value = snippet.id
  persist()
}

function deleteSnippet(id: string) {
  snippets.value = snippets.value.filter((s) => s.id !== id)
  if (selectedId.value === id) {
    selectedId.value = snippets.value.length ? snippets.value[0].id : null
  }
  persist()
}

function saveSnippet() {
  persist()
}
</script>

<template>
  <ToolLayout tool-id="snippets" title="Snippets Manager" description="Save and organize your code snippets">
    <div class="flex gap-4 h-[calc(100vh-220px)] min-h-[400px]">
      <!-- Left panel: snippet list -->
      <div class="w-64 flex-shrink-0 flex flex-col">
        <div class="mb-3">
          <BaseButton size="sm" :icon="Plus" @click="addSnippet">New Snippet</BaseButton>
        </div>
        <BaseCard variant="bordered" :padding="false" class="flex-1 overflow-hidden">
          <div class="overflow-y-auto h-full divide-y divide-gray-100 dark:divide-gray-700">
            <div
              v-for="snippet in snippets"
              :key="snippet.id"
              class="px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedId === snippet.id }"
              @click="selectedId = snippet.id"
            >
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ snippet.title }}</div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ snippet.language }}</span>
            </div>
            <div v-if="!snippets.length" class="px-3 py-6 text-center text-xs text-gray-400">
              No snippets yet
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Right panel: editor -->
      <div class="flex-1 flex flex-col min-w-0">
        <template v-if="selected">
          <div class="flex items-center gap-3 mb-3">
            <input
              v-model="selected.title"
              type="text"
              class="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Snippet title..."
            />
            <div class="w-40">
              <BaseSelect
                v-model="selected.language"
                :options="languageOptions"
                size="md"
                :clearable="false"
              />
            </div>
          </div>
          <div class="flex gap-2 mb-3">
            <BaseButton size="sm" :icon="Save" @click="saveSnippet">Save</BaseButton>
            <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(selected.code)">Copy</BaseButton>
            <BaseButton variant="ghost" size="sm" :icon="Trash2" class="ml-auto text-red-500" @click="deleteSnippet(selected.id)">Delete</BaseButton>
          </div>
          <BaseCard variant="bordered" :padding="false" class="flex-1 overflow-hidden flex flex-col">
            <textarea
              v-model="selected.code"
              class="flex-1 w-full p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
              placeholder="Paste your code here..."
              spellcheck="false"
            />
          </BaseCard>
          <BaseCard v-if="selected.code" variant="bordered" :padding="false" class="mt-3 max-h-48 overflow-auto">
            <template #header>
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</span>
            </template>
            <CodeBlock :code="selected.code" :language="selected.language" />
          </BaseCard>
        </template>
        <div v-else class="flex-1 flex items-center justify-center text-sm text-gray-400">
          Select or create a snippet to get started
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
