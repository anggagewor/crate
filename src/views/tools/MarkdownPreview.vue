<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

const input = ref(`# Hello World

This is a **Markdown** preview tool.

## Features
- Live preview
- Basic formatting
- Code blocks

\`\`\`javascript
const x = 42
console.log(x)
\`\`\`

> Blockquotes work too!
`)

// Simple markdown to HTML converter (no external deps)
const html = computed(() => {
  let text = input.value

  // Code blocks
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto"><code>$2</code></pre>')

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')

  // Headers
  text = text.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
  text = text.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2">$1</h2>')
  text = text.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')

  // Bold and italic
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 underline">$1</a>')

  // Blockquotes
  text = text.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')

  // Unordered lists
  text = text.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

  // Paragraphs
  text = text.replace(/\n\n/g, '</p><p class="my-2">')

  // Line breaks
  text = text.replace(/\n/g, '<br>')

  return `<div class="prose dark:prose-invert max-w-none"><p class="my-2">${text}</p></div>`
})
</script>

<template>
  <ToolLayout tool-id="markdown-preview" title="Markdown Preview" description="Preview Markdown with live rendering">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Markdown</label>
        <textarea
          v-model="input"
          class="w-full h-[500px] p-4 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          placeholder="Write Markdown here..."
          spellcheck="false"
        />
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</label>
          <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(input)">Copy MD</BaseButton>
        </div>
        <div
          class="w-full h-[500px] p-4 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-y-auto"
          v-html="html"
        />
      </div>
    </div>
  </ToolLayout>
</template>
