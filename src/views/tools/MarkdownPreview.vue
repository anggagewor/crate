<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { usePersistentInput } from '@/composables/usePersistentInput'
import { BaseButton } from '@purdia/ui'
import { Copy, Download, Columns2, Rows2 } from 'lucide-vue-next'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import java from 'highlight.js/lib/languages/java'
import php from 'highlight.js/lib/languages/php'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)
hljs.registerLanguage('java', java)
hljs.registerLanguage('php', php)

const { copy } = useCopy()

const input = usePersistentInput('markdown-preview', `# Hello World

This is a **Markdown** preview tool.

## Features
- Live preview
- Basic formatting
- Code blocks with syntax highlighting
- ~~Strikethrough~~
- [Links](https://example.com)

### Table Example

| Name | Role | Status |
|------|------|--------|
| Alice | Developer | Active |
| Bob | Designer | Away |

### Lists

1. First item
2. Second item
3. Third item

- [x] Task completed
- [ ] Task pending

---

\`\`\`javascript
const greet = (name) => {
  console.log(\`Hello, \${name}!\`)
}
greet('World')
\`\`\`

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
\`\`\`

> Blockquotes work too!

![Placeholder](https://via.placeholder.com/150)
`)

const layout = ref<'side' | 'stack'>('side')
const editorRef = ref<HTMLTextAreaElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)
let scrollSyncEnabled = true
let isEditorScrolling = false
let isPreviewScrolling = false

// Word count & reading time
const wordCount = computed(() => {
  const text = input.value.trim()
  if (!text) return { words: 0, chars: 0, lines: 0, readingTime: '0 min' }
  const words = text.split(/\s+/).filter(Boolean).length
  const chars = text.length
  const lines = text.split('\n').length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  return { words, chars, lines, readingTime: `${readingTime} min read` }
})

/**
 * Convert markdown table block into an HTML table.
 */
function parseTable(block: string): string {
  const lines = block.trim().split('\n')
  if (lines.length < 2) return block

  const parseRow = (line: string) =>
    line.split('|').map((c) => c.trim()).filter((c) => c !== '')

  const headers = parseRow(lines[0])
  const bodyLines = lines.slice(2)

  let html = '<table class="border-collapse w-full my-3 text-sm">'
  html += '<thead><tr>'
  for (const h of headers) {
    html += `<th class="border border-gray-300 dark:border-gray-600 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-left font-semibold">${h}</th>`
  }
  html += '</tr></thead><tbody>'
  for (const line of bodyLines) {
    const cells = parseRow(line)
    html += '<tr>'
    for (const cell of cells) {
      html += `<td class="border border-gray-300 dark:border-gray-600 px-3 py-1.5">${cell}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}

/**
 * Highlight code block with highlight.js
 */
function highlightCode(code: string, lang: string): string {
  const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  if (lang && hljs.getLanguage(lang)) {
    try {
      const result = hljs.highlight(code, { language: lang })
      return result.value
    } catch {
      return escaped
    }
  }
  return escaped
}

// Markdown to HTML converter
const html = computed(() => {
  let text = input.value

  // Code blocks (extract first to avoid processing content inside them)
  const codeBlocks: string[] = []
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const idx = codeBlocks.length
    const highlighted = highlightCode(code, lang)
    codeBlocks.push(
      `<pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto my-3"><code class="hljs text-sm leading-relaxed">${highlighted}</code></pre>`,
    )
    return `\x00CODEBLOCK${idx}\x00`
  })

  // Tables (must be processed before inline formatting)
  text = text.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (match) => {
    return parseTable(match)
  })

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">$1</code>')

  // Headers
  text = text.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>')
  text = text.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
  text = text.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2">$1</h2>')
  text = text.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')

  // Horizontal rule
  text = text.replace(/^---+$/gm, '<hr class="border-gray-300 dark:border-gray-600 my-4">')

  // Images (before links to avoid conflict)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2">')

  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, '<del class="text-gray-500 line-through">$1</del>')

  // Bold and italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 dark:text-primary-400 underline hover:no-underline" target="_blank" rel="noopener">$1</a>')

  // Blockquotes (multi-line support)
  text = text.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')

  // Task lists (must come before regular unordered lists)
  text = text.replace(/^- \[x\] (.+)$/gm, '<li class="ml-4 list-none flex items-center gap-2"><input type="checkbox" checked disabled class="accent-primary-500">$1</li>')
  text = text.replace(/^- \[ \] (.+)$/gm, '<li class="ml-4 list-none flex items-center gap-2"><input type="checkbox" disabled>$1</li>')

  // Unordered lists
  text = text.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  text = text.replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

  // Ordered lists
  text = text.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')

  // Paragraphs
  text = text.replace(/\n\n/g, '</p><p class="my-2">')

  // Line breaks
  text = text.replace(/\n/g, '<br>')

  // Restore code blocks
  text = text.replace(/\x00CODEBLOCK(\d+)\x00/g, (_match, idx) => codeBlocks[parseInt(idx)])

  return `<div class="prose dark:prose-invert max-w-none"><p class="my-2">${text}</p></div>`
})

// Export to HTML
function exportHtml() {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1f2937; }
    h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
    pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; color: #6b7280; font-style: italic; }
    hr { border: none; border-top: 1px solid #d1d5db; margin: 1.5em 0; }
    img { max-width: 100%; border-radius: 0.5rem; }
    a { color: #4f46e5; }
    del { color: #9ca3af; }
    li { margin-left: 1rem; }
  </style>
</head>
<body>
${html.value}
</body>
</html>`
  const blob = new Blob([fullHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'markdown-export.html'
  a.click()
  URL.revokeObjectURL(url)
}

// Scroll sync
function onEditorScroll() {
  if (!scrollSyncEnabled || isPreviewScrolling) return
  isEditorScrolling = true
  const editor = editorRef.value
  const preview = previewRef.value
  if (!editor || !preview) return
  const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
  preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
  requestAnimationFrame(() => { isEditorScrolling = false })
}

function onPreviewScroll() {
  if (!scrollSyncEnabled || isEditorScrolling) return
  isPreviewScrolling = true
  const editor = editorRef.value
  const preview = previewRef.value
  if (!editor || !preview) return
  const ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
  editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight)
  requestAnimationFrame(() => { isPreviewScrolling = false })
}
</script>

<template>
  <ToolLayout tool-id="markdown-preview" title="Markdown Preview" description="Preview Markdown with live rendering">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          :icon="layout === 'side' ? Rows2 : Columns2"
          @click="layout = layout === 'side' ? 'stack' : 'side'"
        >
          {{ layout === 'side' ? 'Stack' : 'Side by side' }}
        </BaseButton>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">
          {{ wordCount.words }} words · {{ wordCount.chars }} chars · {{ wordCount.readingTime }}
        </span>
        <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(input)">Copy MD</BaseButton>
        <BaseButton variant="ghost" size="sm" :icon="Download" @click="exportHtml">Export HTML</BaseButton>
      </div>
    </div>

    <!-- Editor + Preview -->
    <div
      class="grid gap-4"
      :class="layout === 'side' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'"
    >
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Markdown</label>
        <textarea
          ref="editorRef"
          v-model="input"
          class="w-full p-4 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          :class="layout === 'side' ? 'h-[500px]' : 'h-[300px]'"
          placeholder="Write Markdown here..."
          spellcheck="false"
          @scroll="onEditorScroll"
        />
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</label>
        </div>
        <div
          ref="previewRef"
          class="w-full p-4 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-y-auto"
          :class="layout === 'side' ? 'h-[500px]' : 'h-[400px]'"
          v-html="html"
          @scroll="onPreviewScroll"
        />
      </div>
    </div>
  </ToolLayout>
</template>
