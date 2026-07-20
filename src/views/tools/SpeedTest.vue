<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Play, RotateCcw, Loader2 } from 'lucide-vue-next'

const testing = ref(false)
const completed = ref(false)
const progress = ref(0)
const currentPhase = ref('')

interface SpeedResult {
  downloadSpeed: number // Mbps
  uploadSpeed: number // Mbps
  latency: number // ms
  jitter: number // ms
  timestamp: string
}

const result = ref<SpeedResult | null>(null)
const history = ref<SpeedResult[]>([])

// Measure latency by fetching a small resource multiple times
async function measureLatency(): Promise<{ latency: number; jitter: number }> {
  const pings: number[] = []
  const url = 'https://www.cloudflare.com/cdn-cgi/trace'

  for (let i = 0; i < 5; i++) {
    const start = performance.now()
    await fetch(url + `?_=${Date.now()}_${i}`, { cache: 'no-store' })
    const end = performance.now()
    pings.push(end - start)
  }

  // Remove first ping (cold start)
  pings.shift()
  const avg = pings.reduce((a, b) => a + b, 0) / pings.length
  const jitter = Math.max(...pings) - Math.min(...pings)

  return { latency: Math.round(avg), jitter: Math.round(jitter) }
}

// Measure download speed using Cloudflare's speed test endpoint
async function measureDownload(): Promise<number> {
  const sizes = [1e5, 5e5, 1e6, 5e6, 1e7] // 100KB, 500KB, 1MB, 5MB, 10MB
  const speeds: number[] = []

  for (let i = 0; i < sizes.length; i++) {
    progress.value = 20 + (i / sizes.length) * 40
    const size = sizes[i]
    const start = performance.now()

    try {
      const res = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, {
        cache: 'no-store',
      })
      await res.arrayBuffer()
      const end = performance.now()
      const duration = (end - start) / 1000 // seconds
      const bitsLoaded = size * 8
      const speedMbps = bitsLoaded / duration / 1e6
      speeds.push(speedMbps)
    } catch {
      // Skip failed attempts
    }
  }

  if (speeds.length === 0) return 0
  // Use the average of the top 3 speeds for more accurate result
  speeds.sort((a, b) => b - a)
  const topSpeeds = speeds.slice(0, 3)
  return topSpeeds.reduce((a, b) => a + b, 0) / topSpeeds.length
}

// Measure upload speed using Cloudflare's speed test endpoint
async function measureUpload(): Promise<number> {
  const sizes = [1e5, 5e5, 1e6] // 100KB, 500KB, 1MB
  const speeds: number[] = []

  for (let i = 0; i < sizes.length; i++) {
    progress.value = 60 + (i / sizes.length) * 30
    const size = sizes[i]
    const data = new ArrayBuffer(size)
    const start = performance.now()

    try {
      await fetch('https://speed.cloudflare.com/__up', {
        method: 'POST',
        body: data,
        cache: 'no-store',
      })
      const end = performance.now()
      const duration = (end - start) / 1000
      const bitsLoaded = size * 8
      const speedMbps = bitsLoaded / duration / 1e6
      speeds.push(speedMbps)
    } catch {
      // Skip failed attempts
    }
  }

  if (speeds.length === 0) return 0
  speeds.sort((a, b) => b - a)
  const topSpeeds = speeds.slice(0, 2)
  return topSpeeds.reduce((a, b) => a + b, 0) / topSpeeds.length
}

async function runTest() {
  testing.value = true
  completed.value = false
  progress.value = 0
  result.value = null

  try {
    // Phase 1: Latency
    currentPhase.value = 'Measuring latency...'
    progress.value = 5
    const { latency, jitter } = await measureLatency()
    progress.value = 20

    // Phase 2: Download
    currentPhase.value = 'Testing download speed...'
    const downloadSpeed = await measureDownload()
    progress.value = 60

    // Phase 3: Upload
    currentPhase.value = 'Testing upload speed...'
    const uploadSpeed = await measureUpload()
    progress.value = 100

    const res: SpeedResult = {
      downloadSpeed: Math.round(downloadSpeed * 100) / 100,
      uploadSpeed: Math.round(uploadSpeed * 100) / 100,
      latency,
      jitter,
      timestamp: new Date().toLocaleString(),
    }

    result.value = res
    history.value.unshift(res)
    if (history.value.length > 10) history.value.pop()
    completed.value = true
  } catch {
    // test failed silently
  } finally {
    testing.value = false
    currentPhase.value = ''
  }
}

function reset() {
  result.value = null
  completed.value = false
  progress.value = 0
}

function getSpeedColor(speed: number): string {
  if (speed >= 100) return 'text-green-600 dark:text-green-400'
  if (speed >= 50) return 'text-blue-600 dark:text-blue-400'
  if (speed >= 20) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

const speedRating = computed(() => {
  if (!result.value) return ''
  const dl = result.value.downloadSpeed
  if (dl >= 100) return 'Excellent'
  if (dl >= 50) return 'Very Good'
  if (dl >= 20) return 'Good'
  if (dl >= 10) return 'Fair'
  return 'Slow'
})
</script>

<template>
  <ToolLayout tool-id="speed-test" title="Network Speed Test" description="Test your internet download and upload speed">
    <!-- Action buttons -->
    <div class="flex items-center gap-3 mb-6">
      <BaseButton v-if="!testing" size="sm" :icon="Play" @click="runTest">
        {{ completed ? 'Test Again' : 'Start Test' }}
      </BaseButton>
      <BaseButton v-if="completed && !testing" variant="secondary" size="sm" :icon="RotateCcw" @click="reset">Reset</BaseButton>
    </div>

    <!-- Progress -->
    <div v-if="testing" class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <Loader2 :size="16" class="animate-spin text-primary-500" />
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ currentPhase }}</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-primary-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <BaseCard variant="bordered" class="text-center">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Download</p>
        <p class="text-2xl font-bold" :class="getSpeedColor(result.downloadSpeed)">{{ result.downloadSpeed }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Mbps</p>
      </BaseCard>

      <BaseCard variant="bordered" class="text-center">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Upload</p>
        <p class="text-2xl font-bold" :class="getSpeedColor(result.uploadSpeed)">{{ result.uploadSpeed }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Mbps</p>
      </BaseCard>

      <BaseCard variant="bordered" class="text-center">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Latency</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ result.latency }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">ms</p>
      </BaseCard>

      <BaseCard variant="bordered" class="text-center">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Jitter</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ result.jitter }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">ms</p>
      </BaseCard>
    </div>

    <!-- Rating -->
    <div v-if="result" class="mb-6">
      <BaseCard variant="bordered">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Connection Rating</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Based on download speed</p>
          </div>
          <span class="text-lg font-bold" :class="getSpeedColor(result.downloadSpeed)">{{ speedRating }}</span>
        </div>
      </BaseCard>
    </div>

    <!-- History -->
    <div v-if="history.length > 1">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">History</h3>
      <div class="space-y-2">
        <BaseCard v-for="(item, idx) in history.slice(1)" :key="idx" variant="bordered">
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500 dark:text-gray-400">{{ item.timestamp }}</span>
            <div class="flex gap-4">
              <span>↓ {{ item.downloadSpeed }} Mbps</span>
              <span>↑ {{ item.uploadSpeed }} Mbps</span>
              <span>{{ item.latency }} ms</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!result && !testing" class="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
      Click "Start Test" to measure your internet speed.
    </div>
  </ToolLayout>
</template>
