<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Search } from 'lucide-vue-next'

const { copy } = useCopy()
const search = ref('')

interface MimeEntry {
  mime: string
  extensions: string[]
  description: string
}

const mimeTypes: MimeEntry[] = [
  { mime: 'text/html', extensions: ['.html', '.htm'], description: 'HTML document' },
  { mime: 'text/css', extensions: ['.css'], description: 'CSS stylesheet' },
  { mime: 'text/javascript', extensions: ['.js', '.mjs'], description: 'JavaScript' },
  { mime: 'text/plain', extensions: ['.txt'], description: 'Plain text' },
  { mime: 'text/csv', extensions: ['.csv'], description: 'CSV file' },
  { mime: 'text/xml', extensions: ['.xml'], description: 'XML document' },
  { mime: 'text/markdown', extensions: ['.md'], description: 'Markdown' },
  { mime: 'application/json', extensions: ['.json'], description: 'JSON data' },
  { mime: 'application/xml', extensions: ['.xml'], description: 'XML data' },
  { mime: 'application/pdf', extensions: ['.pdf'], description: 'PDF document' },
  { mime: 'application/zip', extensions: ['.zip'], description: 'ZIP archive' },
  { mime: 'application/gzip', extensions: ['.gz'], description: 'Gzip archive' },
  { mime: 'application/x-tar', extensions: ['.tar'], description: 'Tar archive' },
  { mime: 'application/javascript', extensions: ['.js'], description: 'JavaScript (legacy)' },
  { mime: 'application/typescript', extensions: ['.ts'], description: 'TypeScript' },
  { mime: 'application/wasm', extensions: ['.wasm'], description: 'WebAssembly' },
  { mime: 'application/octet-stream', extensions: ['.bin'], description: 'Binary data' },
  { mime: 'application/x-www-form-urlencoded', extensions: [], description: 'Form data (URL encoded)' },
  { mime: 'application/ld+json', extensions: ['.jsonld'], description: 'JSON-LD' },
  { mime: 'application/x-yaml', extensions: ['.yaml', '.yml'], description: 'YAML data' },
  { mime: 'application/toml', extensions: ['.toml'], description: 'TOML data' },
  { mime: 'application/sql', extensions: ['.sql'], description: 'SQL script' },
  { mime: 'application/graphql', extensions: ['.graphql'], description: 'GraphQL query' },
  { mime: 'multipart/form-data', extensions: [], description: 'Multipart form data' },
  { mime: 'image/png', extensions: ['.png'], description: 'PNG image' },
  { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'], description: 'JPEG image' },
  { mime: 'image/gif', extensions: ['.gif'], description: 'GIF image' },
  { mime: 'image/webp', extensions: ['.webp'], description: 'WebP image' },
  { mime: 'image/svg+xml', extensions: ['.svg'], description: 'SVG image' },
  { mime: 'image/avif', extensions: ['.avif'], description: 'AVIF image' },
  { mime: 'image/x-icon', extensions: ['.ico'], description: 'Icon' },
  { mime: 'audio/mpeg', extensions: ['.mp3'], description: 'MP3 audio' },
  { mime: 'audio/ogg', extensions: ['.ogg'], description: 'OGG audio' },
  { mime: 'audio/wav', extensions: ['.wav'], description: 'WAV audio' },
  { mime: 'audio/webm', extensions: ['.weba'], description: 'WebM audio' },
  { mime: 'video/mp4', extensions: ['.mp4'], description: 'MP4 video' },
  { mime: 'video/webm', extensions: ['.webm'], description: 'WebM video' },
  { mime: 'video/ogg', extensions: ['.ogv'], description: 'OGG video' },
  { mime: 'font/woff', extensions: ['.woff'], description: 'WOFF font' },
  { mime: 'font/woff2', extensions: ['.woff2'], description: 'WOFF2 font' },
  { mime: 'font/ttf', extensions: ['.ttf'], description: 'TrueType font' },
  { mime: 'font/otf', extensions: ['.otf'], description: 'OpenType font' },
]

const filtered = computed(() => {
  if (!search.value.trim()) return mimeTypes
  const q = search.value.toLowerCase()
  return mimeTypes.filter(
    (m) =>
      m.mime.toLowerCase().includes(q) ||
      m.extensions.some((ext) => ext.toLowerCase().includes(q)) ||
      m.description.toLowerCase().includes(q)
  )
})
</script>

<template>
  <ToolLayout tool-id="mime-lookup" title="MIME Type Lookup" description="Search MIME types by extension">
    <div class="mb-4">
      <div class="relative">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="text"
          class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Search by MIME type, extension, or description..."
        />
      </div>
    </div>

    <BaseCard variant="bordered" :padding="false" flush>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="entry in filtered"
          :key="entry.mime"
          class="flex items-center gap-3 px-4 py-2.5 group hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <code class="text-sm font-mono text-gray-900 dark:text-gray-100">{{ entry.mime }}</code>
              <span v-for="ext in entry.extensions" :key="ext" class="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">{{ ext }}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ entry.description }}</p>
          </div>
          <BaseButton variant="ghost" size="sm" :icon="Copy" class="opacity-0 group-hover:opacity-100" @click="copy(entry.mime)" />
        </div>
      </div>
    </BaseCard>

    <div v-if="filtered.length === 0" class="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
      No MIME types match your search.
    </div>
  </ToolLayout>
</template>
