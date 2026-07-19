<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, RefreshCw } from 'lucide-vue-next'

const { copy } = useCopy()

const unixInput = ref('')
const dateInput = ref('')
const now = ref(Date.now())

setInterval(() => {
  now.value = Date.now()
}, 1000)

const currentTimestamp = computed(() => Math.floor(now.value / 1000))
const currentISO = computed(() => new Date(now.value).toISOString())
const currentLocal = computed(() => new Date(now.value).toLocaleString())

const fromUnixResult = computed(() => {
  if (!unixInput.value.trim()) return null
  const num = Number(unixInput.value)
  if (isNaN(num)) return { error: 'Invalid number' }
  const ms = num > 9999999999 ? num : num * 1000
  const date = new Date(ms)
  if (isNaN(date.getTime())) return { error: 'Invalid timestamp' }
  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    utc: date.toUTCString(),
    relative: getRelative(date),
  }
})

const fromDateResult = computed(() => {
  if (!dateInput.value.trim()) return null
  const date = new Date(dateInput.value)
  if (isNaN(date.getTime())) return { error: 'Invalid date string' }
  return {
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
    iso: date.toISOString(),
  }
})

function getRelative(date: Date): string {
  const diff = Date.now() - date.getTime()
  const abs = Math.abs(diff)
  const future = diff < 0

  if (abs < 60000) return future ? 'in a few seconds' : 'a few seconds ago'
  if (abs < 3600000) {
    const mins = Math.floor(abs / 60000)
    return future ? `in ${mins} minute${mins > 1 ? 's' : ''}` : `${mins} minute${mins > 1 ? 's' : ''} ago`
  }
  if (abs < 86400000) {
    const hrs = Math.floor(abs / 3600000)
    return future ? `in ${hrs} hour${hrs > 1 ? 's' : ''}` : `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  }
  const days = Math.floor(abs / 86400000)
  return future ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`
}

function setNow() {
  unixInput.value = currentTimestamp.value.toString()
}
</script>

<template>
  <ToolLayout tool-id="timestamp" title="Timestamp Converter" description="Convert between Unix timestamps and human-readable dates">
    <!-- Current time -->
    <BaseCard class="mb-6">
      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">Current Time</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <div class="text-xs text-gray-400">Unix (seconds)</div>
          <div class="font-mono text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {{ currentTimestamp }}
            <button class="text-gray-400 hover:text-gray-600" @click="copy(currentTimestamp.toString())">
              <Copy :size="12" />
            </button>
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-400">ISO 8601</div>
          <div class="font-mono text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {{ currentISO }}
            <button class="text-gray-400 hover:text-gray-600" @click="copy(currentISO)">
              <Copy :size="12" />
            </button>
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-400">Local</div>
          <div class="text-sm text-gray-900 dark:text-gray-100">{{ currentLocal }}</div>
        </div>
      </div>
    </BaseCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Unix to Date -->
      <BaseCard>
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Unix → Date</h3>
        <div class="flex gap-2 mb-3">
          <input
            v-model="unixInput"
            type="text"
            placeholder="Enter Unix timestamp..."
            class="flex-1 px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
          <BaseButton variant="ghost" size="sm" :icon="RefreshCw" @click="setNow" />
        </div>
        <div v-if="fromUnixResult && !('error' in fromUnixResult)" class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-gray-500">ISO:</span><span class="font-mono text-gray-900 dark:text-gray-100">{{ fromUnixResult.iso }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Local:</span><span class="text-gray-900 dark:text-gray-100">{{ fromUnixResult.local }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">UTC:</span><span class="text-gray-900 dark:text-gray-100">{{ fromUnixResult.utc }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Relative:</span><span class="text-gray-900 dark:text-gray-100">{{ fromUnixResult.relative }}</span></div>
        </div>
        <div v-else-if="fromUnixResult && 'error' in fromUnixResult" class="text-sm text-red-500">{{ fromUnixResult.error }}</div>
      </BaseCard>

      <!-- Date to Unix -->
      <BaseCard>
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Date → Unix</h3>
        <input
          v-model="dateInput"
          type="text"
          placeholder="Enter date string (ISO, RFC, etc.)..."
          class="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 mb-3"
        />
        <div v-if="fromDateResult && !('error' in fromDateResult)" class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-gray-500">Seconds:</span><span class="font-mono text-gray-900 dark:text-gray-100">{{ fromDateResult.seconds }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Milliseconds:</span><span class="font-mono text-gray-900 dark:text-gray-100">{{ fromDateResult.milliseconds }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">ISO:</span><span class="font-mono text-gray-900 dark:text-gray-100">{{ fromDateResult.iso }}</span></div>
        </div>
        <div v-else-if="fromDateResult && 'error' in fromDateResult" class="text-sm text-red-500">{{ fromDateResult.error }}</div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
