<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert } from '@purdia/ui'
import { Search, Copy, Check, Trash2, Loader2 } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const loading = ref(false)
const error = ref('')

interface WhoisResult {
  domain: string
  registrar: string
  createdDate: string
  expiresDate: string
  updatedDate: string
  nameServers: string[]
  status: string[]
  dnssec: string
}

const result = ref<WhoisResult | null>(null)

async function lookup() {
  const query = input.value.trim()
  if (!query) return

  loading.value = true
  error.value = ''
  result.value = null

  try {
    // Using rdap.org — free RDAP (Registration Data Access Protocol) API
    const cleanDomain = query.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
    const res = await fetch(`https://rdap.org/domain/${cleanDomain}`)

    if (!res.ok) {
      throw new Error(`Lookup failed: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    const nameServers = (data.nameservers || []).map((ns: any) => ns.ldhName || ns.unicodeName || '').filter(Boolean)

    const events = data.events || []
    const getEvent = (action: string) => {
      const ev = events.find((e: any) => e.eventAction === action)
      return ev ? new Date(ev.eventDate).toLocaleString() : 'N/A'
    }

    const statuses = (data.status || []) as string[]

    const entities = data.entities || []
    const registrarEntity = entities.find((e: any) => (e.roles || []).includes('registrar'))
    const registrar = registrarEntity?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || registrarEntity?.handle || 'N/A'

    result.value = {
      domain: data.ldhName || cleanDomain,
      registrar: registrar,
      createdDate: getEvent('registration'),
      expiresDate: getEvent('expiration'),
      updatedDate: getEvent('last changed'),
      nameServers: nameServers,
      status: statuses,
      dnssec: data.secureDNS?.delegationSigned ? 'Signed' : 'Unsigned',
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Failed to lookup domain'
  } finally {
    loading.value = false
  }
}

function clear() {
  input.value = ''
  result.value = null
  error.value = ''
}

function copyResult() {
  if (!result.value) return
  copy(JSON.stringify(result.value, null, 2))
}
</script>

<template>
  <ToolLayout tool-id="whois-lookup" title="Domain & IP WHOIS" description="Lookup WHOIS information for domains and IPs">
    <!-- Input -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="input"
          type="text"
          class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Enter domain (e.g. google.com)"
          @keydown.enter="lookup"
        />
      </div>
      <BaseButton size="sm" :icon="loading ? Loader2 : Search" :disabled="loading || !input.trim()" @click="lookup">
        {{ loading ? 'Looking up...' : 'Lookup' }}
      </BaseButton>
      <BaseButton variant="ghost" size="sm" :icon="Trash2" @click="clear">Clear</BaseButton>
    </div>

    <!-- Error -->
    <BaseAlert v-if="error" variant="danger" class="mb-4">
      {{ error }}
    </BaseAlert>

    <!-- Result -->
    <BaseCard v-if="result" variant="bordered">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ result.domain }}</span>
          <BaseButton variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copyResult">
            {{ copied ? 'Copied!' : 'Copy' }}
          </BaseButton>
        </div>
      </template>

      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Registrar</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.registrar }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">DNSSEC</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.dnssec }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.createdDate }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expires</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.expiresDate }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Updated</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.updatedDate }}</p>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Name Servers</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="ns in result.nameServers"
              :key="ns"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {{ ns }}
            </span>
            <span v-if="result.nameServers.length === 0" class="text-sm text-gray-500">N/A</span>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Status</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="s in result.status"
              :key="s"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            >
              {{ s }}
            </span>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Empty state -->
    <div v-if="!result && !error && !loading" class="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
      Enter a domain name to lookup WHOIS information.
    </div>
  </ToolLayout>
</template>
