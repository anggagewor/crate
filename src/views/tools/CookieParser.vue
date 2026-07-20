<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, Trash2 } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')

interface CookieEntry {
  name: string
  value: string
  attributes: Record<string, string>
}

const cookies = computed<CookieEntry[]>(() => {
  const raw = input.value.trim()
  if (!raw) return []

  const results: CookieEntry[] = []

  // Handle both Set-Cookie (with attributes) and Cookie header (name=value pairs)
  // Detect if it's a Set-Cookie format (contains attributes like Path, Domain, Expires, etc)
  const isSetCookie = /;\s*(Path|Domain|Expires|Max-Age|Secure|HttpOnly|SameSite)/i.test(raw)

  if (isSetCookie) {
    // Parse Set-Cookie lines (possibly multiple)
    const lines = raw.split('\n').filter((l) => l.trim())
    for (const line of lines) {
      const cleaned = line.replace(/^Set-Cookie:\s*/i, '').trim()
      const parts = cleaned.split(';').map((p) => p.trim())
      if (parts.length === 0) continue

      // First part is name=value
      const firstEqual = parts[0].indexOf('=')
      const name = firstEqual > 0 ? parts[0].slice(0, firstEqual).trim() : parts[0].trim()
      const value = firstEqual > 0 ? parts[0].slice(firstEqual + 1).trim() : ''

      const attributes: Record<string, string> = {}
      for (let i = 1; i < parts.length; i++) {
        const attrEqual = parts[i].indexOf('=')
        if (attrEqual > 0) {
          const attrName = parts[i].slice(0, attrEqual).trim()
          const attrValue = parts[i].slice(attrEqual + 1).trim()
          attributes[attrName] = attrValue
        } else {
          // Boolean attributes like Secure, HttpOnly
          attributes[parts[i]] = 'true'
        }
      }

      results.push({ name, value, attributes })
    }
  } else {
    // Parse Cookie header format: name1=value1; name2=value2
    const pairs = raw.replace(/^Cookie:\s*/i, '').split(';')
    for (const pair of pairs) {
      const trimmed = pair.trim()
      if (!trimmed) continue
      const eqIdx = trimmed.indexOf('=')
      const name = eqIdx > 0 ? trimmed.slice(0, eqIdx).trim() : trimmed.trim()
      const value = eqIdx > 0 ? trimmed.slice(eqIdx + 1).trim() : ''
      results.push({ name, value, attributes: {} })
    }
  }

  return results
})

function clear() {
  input.value = ''
}

function copyAll() {
  copy(JSON.stringify(cookies.value, null, 2))
}

function decodedValue(val: string): string {
  try {
    return decodeURIComponent(val)
  } catch {
    return val
  }
}

function isExpired(attrs: Record<string, string>): boolean {
  const expires = attrs['Expires'] || attrs['expires']
  if (!expires) return false
  return new Date(expires) < new Date()
}

function getSecurityBadges(attrs: Record<string, string>): { label: string; color: string }[] {
  const badges: { label: string; color: string }[] = []
  if (attrs['Secure'] || attrs['secure']) {
    badges.push({ label: 'Secure', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' })
  }
  if (attrs['HttpOnly'] || attrs['httponly']) {
    badges.push({ label: 'HttpOnly', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' })
  }
  const sameSite = attrs['SameSite'] || attrs['samesite'] || ''
  if (sameSite) {
    badges.push({ label: `SameSite=${sameSite}`, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' })
  }
  return badges
}
</script>

<template>
  <ToolLayout tool-id="cookie-parser" title="Cookie Parser" description="Parse and inspect HTTP cookie strings">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-4">
      <BaseButton v-if="cookies.length > 0" variant="secondary" size="sm" :icon="copied ? Check : Copy" @click="copyAll">
        {{ copied ? 'Copied!' : 'Copy JSON' }}
      </BaseButton>
      <BaseButton variant="ghost" size="sm" :icon="Trash2" class="ml-auto" @click="clear">Clear</BaseButton>
    </div>

    <!-- Input -->
    <BaseCard variant="bordered" :padding="false" class="mb-4">
      <template #header>
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Cookie String (Cookie or Set-Cookie header)</span>
      </template>
      <textarea
        v-model="input"
        class="w-full h-32 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
        placeholder="Paste cookie string here...&#10;&#10;Examples:&#10;session_id=abc123; user=john; theme=dark&#10;&#10;Set-Cookie: id=a3fWa; Expires=Thu, 21 Oct 2025 07:28:00 GMT; Secure; HttpOnly"
        spellcheck="false"
      />
    </BaseCard>

    <!-- Results -->
    <div v-if="cookies.length > 0" class="space-y-2">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ cookies.length }} cookie{{ cookies.length > 1 ? 's' : '' }} found</p>

      <BaseCard v-for="(cookie, idx) in cookies" :key="idx" variant="bordered">
        <div class="space-y-2">
          <!-- Name & Value -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium font-mono text-gray-900 dark:text-gray-100">{{ cookie.name }}</p>
              <p class="text-xs font-mono text-gray-600 dark:text-gray-400 mt-0.5 break-all">{{ decodedValue(cookie.value) }}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span v-if="isExpired(cookie.attributes)" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                Expired
              </span>
              <span
                v-for="badge in getSecurityBadges(cookie.attributes)"
                :key="badge.label"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                :class="badge.color"
              >
                {{ badge.label }}
              </span>
            </div>
          </div>

          <!-- Attributes -->
          <div v-if="Object.keys(cookie.attributes).length > 0" class="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-gray-100 dark:border-gray-700">
            <div v-for="(val, key) in cookie.attributes" :key="key" class="text-xs">
              <span class="text-gray-500 dark:text-gray-400">{{ key }}:</span>
              <span class="text-gray-700 dark:text-gray-300 ml-1">{{ val === 'true' ? '✓' : val }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Empty state -->
    <div v-if="cookies.length === 0 && input.trim()" class="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
      Could not parse any cookies from the input.
    </div>
    <div v-if="!input.trim()" class="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
      Paste a Cookie or Set-Cookie header to parse.
    </div>
  </ToolLayout>
</template>
