<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, ArrowRight } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Toronto', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Singapore',
  'Asia/Dubai', 'Asia/Seoul', 'Asia/Jakarta', 'Australia/Sydney',
  'Australia/Melbourne', 'Pacific/Auckland', 'Africa/Cairo',
  'Africa/Johannesburg', 'America/Mexico_City',
]

const inputDatetime = ref(new Date().toISOString().slice(0, 16))
const sourceTimezone = ref('UTC')
const targetTimezone = ref('America/New_York')
const output = ref('')
const error = ref('')

function convert() {
  if (!inputDatetime.value) return
  try {
    error.value = ''
    // Parse the input as a date in the source timezone
    const dateStr = inputDatetime.value
    // Create date from input
    const date = new Date(dateStr)

    // Format in target timezone
    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone.value,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'long',
    })

    output.value = targetFormatter.format(date)
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

convert()
</script>

<template>
  <ToolLayout tool-id="timezone-converter" title="Timezone Converter" description="Convert time between timezones">
    <div class="space-y-4">
      <BaseCard variant="bordered">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date & Time</label>
            <input
              v-model="inputDatetime"
              type="datetime-local"
              class="w-full text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From Timezone</label>
            <select
              v-model="sourceTimezone"
              class="w-full text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Timezone</label>
            <select
              v-model="targetTimezone"
              class="w-full text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
          </div>
        </div>

        <BaseButton size="sm" :icon="ArrowRight" class="mt-4" @click="convert">Convert</BaseButton>
      </BaseCard>

      <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

      <BaseCard v-if="output" variant="bordered">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Converted Time</span>
            <p class="text-lg font-mono text-gray-900 dark:text-gray-100 mt-1">{{ output }}</p>
          </div>
          <BaseButton variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copy(output)" />
        </div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
