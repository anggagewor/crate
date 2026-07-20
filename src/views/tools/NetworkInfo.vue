<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert } from '@purdia/ui'
import { Copy, Check, RefreshCw, Loader2, Wifi } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const loading = ref(false)
const error = ref('')

interface NetworkResult {
  ip: string
  hostname: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal: string
  timezone: string
  userAgent: string
  onLine: boolean
  connectionType: string
  downlink: string
  rtt: string
  saveData: boolean
  language: string
  languages: string[]
  platform: string
  cookieEnabled: boolean
  doNotTrack: string
}

const result = ref<NetworkResult | null>(null)

async function fetchNetworkInfo() {
  loading.value = true
  error.value = ''

  try {
    // Fetch public IP info
    const res = await fetch('https://ipinfo.io/json')

    if (res.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}). Check your connection and try again.`)
    }

    const data = await res.json()

    // Get navigator/connection info
    const nav = navigator as any
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection

    result.value = {
      ip: data.ip || 'N/A',
      hostname: data.hostname || 'N/A',
      city: data.city || 'N/A',
      region: data.region || 'N/A',
      country: data.country || 'N/A',
      loc: data.loc || 'N/A',
      org: data.org || 'N/A',
      postal: data.postal || 'N/A',
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A',
      userAgent: navigator.userAgent,
      onLine: navigator.onLine,
      connectionType: conn?.effectiveType || 'N/A',
      downlink: conn?.downlink ? `${conn.downlink} Mbps` : 'N/A',
      rtt: conn?.rtt ? `${conn.rtt} ms` : 'N/A',
      saveData: conn?.saveData || false,
      language: navigator.language,
      languages: [...navigator.languages],
      platform: nav.userAgentData?.platform || navigator.platform || 'N/A',
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'N/A',
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Failed to fetch network information'
  } finally {
    loading.value = false
  }
}

function copyAll() {
  if (!result.value) return
  copy(JSON.stringify(result.value, null, 2))
}

onMounted(() => {
  fetchNetworkInfo()
})
</script>

<template>
  <ToolLayout tool-id="network-info" title="Network Information" description="View your network connection details and browser information">
    <!-- Actions -->
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="loading ? Loader2 : RefreshCw" :disabled="loading" @click="fetchNetworkInfo">
        Refresh
      </BaseButton>
      <BaseButton v-if="result" variant="secondary" size="sm" :icon="copied ? Check : Copy" @click="copyAll">
        {{ copied ? 'Copied!' : 'Copy All' }}
      </BaseButton>
    </div>

    <!-- Error -->
    <BaseAlert v-if="error" variant="danger" class="mb-4">
      <div class="flex items-center justify-between">
        <span>{{ error }}</span>
        <BaseButton variant="ghost" size="sm" :icon="RefreshCw" @click="fetchNetworkInfo">Retry</BaseButton>
      </div>
    </BaseAlert>

    <!-- Result -->
    <div v-if="result" class="space-y-4">
      <!-- Connection Status -->
      <BaseCard variant="bordered">
        <template #header>
          <div class="flex items-center gap-2">
            <Wifi :size="16" class="text-green-500" />
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Connection Status</span>
          </div>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1"
              :class="result.onLine ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'">
              {{ result.onLine ? 'Online' : 'Offline' }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{{ result.connectionType }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Type</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{{ result.downlink }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Downlink</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{{ result.rtt }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">RTT</p>
          </div>
        </div>
      </BaseCard>

      <!-- Public IP Info -->
      <BaseCard variant="bordered">
        <template #header>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Public IP Information</span>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">IP Address</p>
            <p class="text-sm font-mono text-gray-900 dark:text-gray-100 mt-0.5">{{ result.ip }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hostname</p>
            <p class="text-sm font-mono text-gray-900 dark:text-gray-100 mt-0.5">{{ result.hostname }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Organization</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.org }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.city }}, {{ result.region }}, {{ result.country }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Coordinates</p>
            <p class="text-sm font-mono text-gray-900 dark:text-gray-100 mt-0.5">{{ result.loc }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timezone</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.timezone }}</p>
          </div>
        </div>
      </BaseCard>

      <!-- Browser Info -->
      <BaseCard variant="bordered">
        <template #header>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Browser Information</span>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Platform</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.platform }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Language</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.language }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cookies Enabled</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.cookieEnabled ? 'Yes' : 'No' }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Do Not Track</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.doNotTrack }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">User Agent</p>
            <p class="text-xs font-mono text-gray-900 dark:text-gray-100 mt-0.5 break-all">{{ result.userAgent }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Supported Languages</p>
            <div class="flex flex-wrap gap-1.5 mt-1">
              <span
                v-for="lang in result.languages"
                :key="lang"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {{ lang }}
              </span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && !result" class="space-y-4">
      <BaseCard variant="bordered">
        <div class="animate-pulse">
          <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="n in 4" :key="n" class="text-center">
              <div class="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1" />
              <div class="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
          </div>
        </div>
      </BaseCard>
      <BaseCard variant="bordered">
        <div class="animate-pulse">
          <div class="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n">
              <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
              <div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
