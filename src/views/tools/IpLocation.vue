<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert } from '@purdia/ui'
import { Search, Copy, Check, MapPin, Loader2, RefreshCw } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const loading = ref(false)
const error = ref('')

interface IpLocationResult {
  ip: string
  city: string
  region: string
  country: string
  countryCode: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
}

const result = ref<IpLocationResult | null>(null)

async function lookup(ip?: string) {
  loading.value = true
  error.value = ''
  result.value = null

  try {
    const query = ip || input.value.trim()
    const url = query
      ? `http://ip-api.com/json/${query}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
      : `http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`

    const res = await fetch(url)

    if (res.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }

    const data = await res.json()

    if (data.status === 'fail') {
      throw new Error(data.message || 'Lookup failed')
    }

    result.value = {
      ip: data.query,
      city: data.city || 'N/A',
      region: data.regionName || data.region || 'N/A',
      country: data.country || 'N/A',
      countryCode: data.countryCode || '',
      zip: data.zip || 'N/A',
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone || 'N/A',
      isp: data.isp || 'N/A',
      org: data.org || 'N/A',
      as: data.as || 'N/A',
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Failed to lookup IP location'
  } finally {
    loading.value = false
  }
}

function lookupOwn() {
  input.value = ''
  lookup()
}

function copyResult() {
  if (!result.value) return
  copy(JSON.stringify(result.value, null, 2))
}

onMounted(() => {
  // Auto-lookup own IP on mount
  lookup()
})
</script>

<template>
  <ToolLayout tool-id="ip-location" title="IP Location" description="Geolocate any IP address or find your own location">
    <!-- Input -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1">
        <MapPin :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="input"
          type="text"
          class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Enter IP address (leave empty for your IP)"
          @keydown.enter="lookup(input.trim() || undefined)"
        />
      </div>
      <BaseButton size="sm" :icon="loading ? Loader2 : Search" :disabled="loading" @click="lookup(input.trim() || undefined)">
        Lookup
      </BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="RefreshCw" @click="lookupOwn">My IP</BaseButton>
    </div>

    <!-- Error -->
    <BaseAlert v-if="error" variant="danger" class="mb-4">
      <div class="flex items-center justify-between">
        <span>{{ error }}</span>
        <BaseButton variant="ghost" size="sm" :icon="RefreshCw" @click="lookup(input.trim() || undefined)">Retry</BaseButton>
      </div>
    </BaseAlert>

    <!-- Result -->
    <div v-if="result">
      <!-- IP Header -->
      <BaseCard variant="bordered" class="mb-4">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">{{ result.ip }}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                {{ result.countryCode }}
              </span>
            </div>
            <BaseButton variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copyResult">
              {{ copied ? 'Copied!' : 'Copy' }}
            </BaseButton>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">City</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.city }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Region</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.region }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.country }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ZIP Code</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.zip }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Coordinates</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.lat }}, {{ result.lon }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timezone</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.timezone }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ISP</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.isp }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Organization</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.org }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">AS Number</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.as }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && !result" class="space-y-4">
      <BaseCard variant="bordered">
        <div class="animate-pulse">
          <div class="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 9" :key="n">
              <div class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
              <div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
