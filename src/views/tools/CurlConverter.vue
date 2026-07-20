<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert, BaseSelect } from '@purdia/ui'
import { Copy, Check, Trash2 } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const language = ref<string>('javascript-fetch')
const error = ref('')

const languageOptions = [
  { label: 'JavaScript (fetch)', value: 'javascript-fetch' },
  { label: 'JavaScript (axios)', value: 'javascript-axios' },
  { label: 'Python (requests)', value: 'python-requests' },
  { label: 'Go (net/http)', value: 'go' },
  { label: 'PHP (cURL)', value: 'php' },
  { label: 'Node.js (node-fetch)', value: 'node-fetch' },
]

interface ParsedCurl {
  method: string
  url: string
  headers: Record<string, string>
  data: string
}

function parseCurl(cmd: string): ParsedCurl {
  const result: ParsedCurl = { method: 'GET', url: '', headers: {}, data: '' }

  // Clean up the command
  let cleaned = cmd.trim()
  if (cleaned.startsWith('curl ')) cleaned = cleaned.slice(5)
  cleaned = cleaned.replace(/\\\n/g, ' ').replace(/\s+/g, ' ')

  const tokens: string[] = []
  let current = ''
  let inQuote = ''

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (!inQuote && (ch === '"' || ch === "'")) {
      inQuote = ch
    } else if (ch === inQuote) {
      inQuote = ''
    } else if (!inQuote && ch === ' ') {
      if (current) tokens.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current) tokens.push(current)

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '-X' || token === '--request') {
      result.method = tokens[++i]?.toUpperCase() || 'GET'
    } else if (token === '-H' || token === '--header') {
      const header = tokens[++i] || ''
      const colonIdx = header.indexOf(':')
      if (colonIdx > 0) {
        const key = header.slice(0, colonIdx).trim()
        const value = header.slice(colonIdx + 1).trim()
        result.headers[key] = value
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      result.data = tokens[++i] || ''
      if (!result.method || result.method === 'GET') result.method = 'POST'
    } else if (!token.startsWith('-') && !result.url) {
      result.url = token
    }
  }

  return result
}

function toJsFetch(p: ParsedCurl): string {
  const lines: string[] = []
  const hasHeaders = Object.keys(p.headers).length > 0
  const hasBody = !!p.data

  lines.push(`const response = await fetch('${p.url}', {`)
  lines.push(`  method: '${p.method}',`)
  if (hasHeaders) {
    lines.push('  headers: {')
    Object.entries(p.headers).forEach(([k, v]) => {
      lines.push(`    '${k}': '${v}',`)
    })
    lines.push('  },')
  }
  if (hasBody) {
    lines.push(`  body: ${JSON.stringify(p.data)},`)
  }
  lines.push('})')
  lines.push('')
  lines.push('const data = await response.json()')
  lines.push('console.log(data)')
  return lines.join('\n')
}

function toJsAxios(p: ParsedCurl): string {
  const lines: string[] = []
  lines.push(`const { data } = await axios({`)
  lines.push(`  method: '${p.method.toLowerCase()}',`)
  lines.push(`  url: '${p.url}',`)
  if (Object.keys(p.headers).length > 0) {
    lines.push('  headers: {')
    Object.entries(p.headers).forEach(([k, v]) => {
      lines.push(`    '${k}': '${v}',`)
    })
    lines.push('  },')
  }
  if (p.data) {
    lines.push(`  data: ${JSON.stringify(p.data)},`)
  }
  lines.push('})')
  lines.push('')
  lines.push('console.log(data)')
  return lines.join('\n')
}

function toPython(p: ParsedCurl): string {
  const lines: string[] = []
  lines.push('import requests')
  lines.push('')

  if (Object.keys(p.headers).length > 0) {
    lines.push('headers = {')
    Object.entries(p.headers).forEach(([k, v]) => {
      lines.push(`    '${k}': '${v}',`)
    })
    lines.push('}')
    lines.push('')
  }

  const method = p.method.toLowerCase()
  let call = `response = requests.${method}('${p.url}'`
  if (Object.keys(p.headers).length > 0) call += ', headers=headers'
  if (p.data) call += `, data='${p.data}'`
  call += ')'
  lines.push(call)
  lines.push('')
  lines.push('print(response.json())')
  return lines.join('\n')
}

function toGo(p: ParsedCurl): string {
  const lines: string[] = []
  lines.push('package main')
  lines.push('')
  lines.push('import (')
  lines.push('    "fmt"')
  lines.push('    "io"')
  lines.push('    "net/http"')
  if (p.data) lines.push('    "strings"')
  lines.push(')')
  lines.push('')
  lines.push('func main() {')

  if (p.data) {
    lines.push(`    body := strings.NewReader(${JSON.stringify(p.data)})`)
    lines.push(`    req, err := http.NewRequest("${p.method}", "${p.url}", body)`)
  } else {
    lines.push(`    req, err := http.NewRequest("${p.method}", "${p.url}", nil)`)
  }
  lines.push('    if err != nil {')
  lines.push('        panic(err)')
  lines.push('    }')

  Object.entries(p.headers).forEach(([k, v]) => {
    lines.push(`    req.Header.Set("${k}", "${v}")`)
  })

  lines.push('')
  lines.push('    resp, err := http.DefaultClient.Do(req)')
  lines.push('    if err != nil {')
  lines.push('        panic(err)')
  lines.push('    }')
  lines.push('    defer resp.Body.Close()')
  lines.push('')
  lines.push('    respBody, _ := io.ReadAll(resp.Body)')
  lines.push('    fmt.Println(string(respBody))')
  lines.push('}')
  return lines.join('\n')
}

function toPhp(p: ParsedCurl): string {
  const lines: string[] = []
  lines.push('<?php')
  lines.push('')
  lines.push('$ch = curl_init();')
  lines.push('')
  lines.push(`curl_setopt($ch, CURLOPT_URL, '${p.url}');`)
  lines.push('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);')
  if (p.method !== 'GET') {
    lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${p.method}');`)
  }
  if (Object.keys(p.headers).length > 0) {
    lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, [')
    Object.entries(p.headers).forEach(([k, v]) => {
      lines.push(`    '${k}: ${v}',`)
    })
    lines.push(']);')
  }
  if (p.data) {
    lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${p.data}');`)
  }
  lines.push('')
  lines.push('$response = curl_exec($ch);')
  lines.push('curl_close($ch);')
  lines.push('')
  lines.push('echo $response;')
  return lines.join('\n')
}

function toNodeFetch(p: ParsedCurl): string {
  const lines: string[] = []
  lines.push("import fetch from 'node-fetch'")
  lines.push('')
  return lines.join('\n') + toJsFetch(p)
}

const output = computed(() => {
  if (!input.value.trim()) return ''
  try {
    const parsed = parseCurl(input.value)
    if (!parsed.url) {
      error.value = 'Could not parse URL from cURL command'
      return ''
    }
    error.value = ''
    switch (language.value) {
      case 'javascript-fetch': return toJsFetch(parsed)
      case 'javascript-axios': return toJsAxios(parsed)
      case 'python-requests': return toPython(parsed)
      case 'go': return toGo(parsed)
      case 'php': return toPhp(parsed)
      case 'node-fetch': return toNodeFetch(parsed)
      default: return toJsFetch(parsed)
    }
  } catch (e: unknown) {
    error.value = (e as Error).message
    return ''
  }
})

const outputLanguage = computed(() => {
  switch (language.value) {
    case 'javascript-fetch':
    case 'javascript-axios':
    case 'node-fetch':
      return 'javascript'
    case 'python-requests': return 'python'
    case 'go': return 'go'
    case 'php': return 'php'
    default: return 'javascript'
  }
})

function clear() {
  input.value = ''
  error.value = ''
}
</script>

<template>
  <ToolLayout tool-id="curl-converter" title="cURL ↔ Code Generator" description="Convert cURL commands to code in various languages">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-4">
      <BaseSelect
        v-model="language"
        :options="languageOptions"
        size="sm"
        placeholder="Language"
        :clearable="false"
        class="w-64"
      />
      <BaseButton variant="ghost" size="sm" :icon="Trash2" class="ml-auto" @click="clear">Clear</BaseButton>
    </div>

    <!-- Error -->
    <BaseAlert v-if="error" variant="danger" class="mb-4">
      {{ error }}
    </BaseAlert>

    <!-- Editor -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">cURL Command</span>
        </template>
        <textarea
          v-model="input"
          class="w-full h-80 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder="Paste your cURL command here...&#10;&#10;Example:&#10;curl -X POST https://api.example.com/data \&#10;  -H 'Content-Type: application/json' \&#10;  -d '{&quot;key&quot;: &quot;value&quot;}'"
          spellcheck="false"
        />
      </BaseCard>

      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Generated Code</span>
            <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copy(output)">
              {{ copied ? 'Copied!' : 'Copy' }}
            </BaseButton>
          </div>
        </template>
        <div v-if="output" class="h-80 overflow-auto">
          <CodeBlock :code="output" :language="outputLanguage" />
        </div>
        <pre v-else class="w-full h-80 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words text-gray-400">Generated code will appear here...</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
