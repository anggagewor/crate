<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github.css'

// Register languages we need
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import yaml from 'highlight.js/lib/languages/yaml'
import ini from 'highlight.js/lib/languages/ini'
import markdown from 'highlight.js/lib/languages/markdown'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('toml', ini)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('plaintext', plaintext)

const props = withDefaults(defineProps<{
  code: string
  language?: string
}>(), {
  language: 'plaintext',
})

const highlighted = ref('')

function highlight() {
  if (!props.code) {
    highlighted.value = ''
    return
  }
  try {
    if (props.language && hljs.getLanguage(props.language)) {
      highlighted.value = hljs.highlight(props.code, { language: props.language }).value
    } else {
      highlighted.value = hljs.highlightAuto(props.code).value
    }
  } catch {
    highlighted.value = escapeHtml(props.code)
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const lines = computed(() => {
  if (!highlighted.value) return []
  return highlighted.value.split('\n')
})

watch(() => props.code, highlight)
watch(() => props.language, highlight)
onMounted(highlight)
</script>

<template>
  <div class="w-full h-full overflow-auto font-mono text-sm">
    <table class="w-full border-collapse">
      <tbody>
        <tr v-for="(line, idx) in lines" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <td class="select-none text-right pr-3 pl-4 py-0 text-gray-400 dark:text-gray-600 w-[1%] whitespace-nowrap align-top leading-6 text-xs">{{ idx + 1 }}</td>
          <td class="pr-4 py-0 whitespace-pre-wrap break-words leading-6"><code v-html="line || '&nbsp;'" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
