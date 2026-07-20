<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert, BaseSelect } from '@purdia/ui'
import { Search, Copy, Check, Trash2, Loader2 } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const domain = ref('')
const recordType = ref<string>('A')
const loading = ref(false)
const error = ref('')

const recordTypes = [
  { label: 'A (IPv4)', value: 'A' },
  { label: 'AAAA (IPv6)', value: 'AAAA' },
  { label: 'CNAME', value: 'CNAME' },
  { label: 'MX (Mail)', value: 'MX' },
  { label: 'NS (Nameserver)', value: 'NS' },
  { label: 'TXT', value: 'TXT' },
  { label: 'SOA', value: 'SOA' },
  { label: 'SRV', value: 'SRV' },
  { label: 'CAA', value: 'CAA' },
  { label: 'PTR', value: 'PTR' },
]

interface DnsRecord {
  name: string
  type: number
  TTL: number
  data: string
}

const records = ref<DnsRecord[]>([])
const queryTime = ref(0)

async function lookup() {
  const host = domain.value.trim()
  if (!host) return

  loading.value = true
  error.value = ''
  records.value = []

  try {
    const start = performance.now()
    // Use Cloudflare DNS-over-HTTPS
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${recordType.value}`,
      {
        headers: { Accept: 'application/dns-json' },
      }
    )

    const data = await res.json()
    queryTime.value = Math.round(performance.now() - start)

    if (data.Status !== 0) {
      const statusMap: Record<number, string> = {
        1: 'Format error',
        2: 'Server failure',
        3: 'Non-existent domain (NXDOMAIN)',
        4: 'Not implemented',
        5: 'Query refused',
      }
      throw new Error(statusMap[data.Status] || `DNS query failed (status: ${data.Status})`)
    }

    if (!data.Answer || data.Answer.length === 0) {
      error.value = `No ${recordType.value} records found for ${host}`
      return
    }

    records.value = data.Answer.map((r: any) => ({
      name: r.name,
      type: r.type,
      TTL: r.TTL,
      data: r.data,
    }))
  } catch (e: unknown) {
    error.value = (e as Error).message || 'DNS lookup failed'
  } finally {
    loading.value = false
  }
}

function getRecordTypeName(type: number): string {
  const map: Record<number, string> = {
    1: 'A',
    2: 'NS',
    5: 'CNAME',
    6: 'SOA',
    12: 'PTR',
    15: 'MX',
    16: 'TXT',
    28: 'AAAA',
    33: 'SRV',
    257: 'CAA',
  }
  return map[type] || String(type)
}

function formatTTL(seconds: number): string {
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${seconds}s`
}

function clear() {
  domain.value = ''
  records.value = []
  error.value = ''
}

function copyRecords() {
  const text = records.value.map(r => `${r.name}\t${formatTTL(r.TTL)}\t${getRecordTypeName(r.type)}\t${r.data}`).join('\n')
  copy(text)
}
</script>

<template>
  <ToolLayout tool-id="dns-lookup" title="DNS Lookup" description="Query DNS records for any domain">
    <!-- Input -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="domain"
          type="text"
          class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Enter domain (e.g. google.com)"
          @keydown.enter="lookup"
        />
      </div>
      <BaseSelect
        v-model="recordType"
        :options="recordTypes"
        size="sm"
        placeholder="Type"
        :clearable="false"
        class="w-44"
      />
      <BaseButton size="sm" :icon="loading ? Loader2 : Search" :disabled="loading || !domain.trim()" @click="lookup">
        Lookup
      </BaseButton>
      <BaseButton variant="ghost" size="sm" :icon="Trash2" @click="clear">Clear</BaseButton>
    </div>

    <!-- Error -->
    <BaseAlert v-if="error" variant="danger" class="mb-4">
      {{ error }}
    </BaseAlert>

    <!-- Results -->
    <div v-if="records.length > 0">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ records.length }} record{{ records.length > 1 ? 's' : '' }} found · Query time: {{ queryTime }}ms
        </p>
        <BaseButton variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copyRecords">
          {{ copied ? 'Copied!' : 'Copy' }}
        </BaseButton>
      </div>

      <div class="space-y-2">
        <BaseCard v-for="(record, idx) in records" :key="idx" variant="bordered">
          <div class="flex items-start gap-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shrink-0">
              {{ getRecordTypeName(record.type) }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">{{ record.data }}</p>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ record.name }}</span>
                <span class="text-xs text-gray-400 dark:text-gray-500">TTL: {{ formatTTL(record.TTL) }}</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="records.length === 0 && !error && !loading" class="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
      Enter a domain name and select a record type to perform DNS lookup.
    </div>
  </ToolLayout>
</template>
