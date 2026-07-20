<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, Trash2, RefreshCw } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')

interface ParsedUA {
  browser: { name: string; version: string }
  engine: { name: string; version: string }
  os: { name: string; version: string }
  device: { type: string; vendor: string; model: string }
  cpu: { architecture: string }
  raw: string
}

const result = computed<ParsedUA | null>(() => {
  const ua = input.value.trim()
  if (!ua) return null
  return parseUserAgent(ua)
})

function parseUserAgent(ua: string): ParsedUA {
  const result: ParsedUA = {
    browser: { name: 'Unknown', version: '' },
    engine: { name: 'Unknown', version: '' },
    os: { name: 'Unknown', version: '' },
    device: { type: 'Desktop', vendor: '', model: '' },
    cpu: { architecture: '' },
    raw: ua,
  }

  // Browser detection
  if (/Edg(?:e|A|iOS)?\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: 'Microsoft Edge', version: RegExp.$1 }
  } else if (/OPR\/(\d[\d.]*)/i.test(ua) || /Opera.*Version\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: 'Opera', version: RegExp.$1 }
  } else if (/Vivaldi\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: 'Vivaldi', version: RegExp.$1 }
  } else if (/Brave\/(\d[\d.]*)/i.test(ua) || (/Chrome\/(\d[\d.]*)/i.test(ua) && /Brave/i.test(ua))) {
    result.browser = { name: 'Brave', version: RegExp.$1 }
  } else if (/Firefox\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: 'Firefox', version: RegExp.$1 }
  } else if (/(?:Chrome|CriOS)\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: 'Chrome', version: RegExp.$1 }
  } else if (/Version\/(\d[\d.]*).*Safari/i.test(ua)) {
    result.browser = { name: 'Safari', version: RegExp.$1 }
  } else if (/Safari\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: 'Safari', version: RegExp.$1 }
  } else if (/MSIE\s(\d[\d.]*)/i.test(ua) || /Trident.*rv:(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: 'Internet Explorer', version: RegExp.$1 }
  }

  // Engine detection
  if (/AppleWebKit\/(\d[\d.]*)/i.test(ua)) {
    result.engine = { name: 'WebKit', version: RegExp.$1 }
  } else if (/Gecko\/(\d[\d.]*)/i.test(ua)) {
    result.engine = { name: 'Gecko', version: RegExp.$1 }
  } else if (/Trident\/(\d[\d.]*)/i.test(ua)) {
    result.engine = { name: 'Trident', version: RegExp.$1 }
  } else if (/Blink/i.test(ua) || (/Chrome/i.test(ua) && /AppleWebKit/i.test(ua))) {
    result.engine = { name: 'Blink', version: result.browser.version }
  }

  // OS detection
  if (/Windows NT (\d[\d.]*)/i.test(ua)) {
    const ver = RegExp.$1
    const winVersions: Record<string, string> = {
      '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP',
    }
    result.os = { name: 'Windows', version: winVersions[ver] || ver }
  } else if (/Mac OS X (\d[_\d.]*)/i.test(ua)) {
    result.os = { name: 'macOS', version: RegExp.$1.replace(/_/g, '.') }
  } else if (/Android (\d[\d.]*)/i.test(ua)) {
    result.os = { name: 'Android', version: RegExp.$1 }
  } else if (/iPhone OS (\d[_\d.]*)/i.test(ua) || /iPad.*OS (\d[_\d.]*)/i.test(ua)) {
    result.os = { name: 'iOS', version: RegExp.$1.replace(/_/g, '.') }
  } else if (/Linux/i.test(ua)) {
    result.os = { name: 'Linux', version: '' }
  } else if (/CrOS/i.test(ua)) {
    result.os = { name: 'Chrome OS', version: '' }
  }

  // Device detection
  if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) {
    result.device.type = 'Mobile'
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    result.device.type = 'Tablet'
  } else if (/Smart-?TV|SmartTV|GoogleTV|AppleTV|BRAVIA|Xbox|PlayStation|Nintendo/i.test(ua)) {
    result.device.type = 'Smart TV'
  } else if (/bot|crawl|spider|slurp/i.test(ua)) {
    result.device.type = 'Bot'
  }

  // Device vendor
  if (/iPhone|iPad|iPod|Macintosh/i.test(ua)) result.device.vendor = 'Apple'
  else if (/Samsung/i.test(ua)) result.device.vendor = 'Samsung'
  else if (/Huawei/i.test(ua)) result.device.vendor = 'Huawei'
  else if (/Xiaomi|Redmi|POCO/i.test(ua)) result.device.vendor = 'Xiaomi'
  else if (/OPPO/i.test(ua)) result.device.vendor = 'OPPO'
  else if (/vivo/i.test(ua)) result.device.vendor = 'Vivo'

  // CPU architecture
  if (/x86_64|x64|Win64|WOW64|amd64/i.test(ua)) {
    result.cpu.architecture = 'x86_64'
  } else if (/arm64|aarch64/i.test(ua)) {
    result.cpu.architecture = 'ARM64'
  } else if (/arm/i.test(ua)) {
    result.cpu.architecture = 'ARM'
  } else if (/i[346]86|x86/i.test(ua)) {
    result.cpu.architecture = 'x86'
  }

  return result
}

function useCurrentUA() {
  input.value = navigator.userAgent
}

function clear() {
  input.value = ''
}

function copyResult() {
  if (!result.value) return
  copy(JSON.stringify(result.value, null, 2))
}

onMounted(() => {
  input.value = navigator.userAgent
})
</script>

<template>
  <ToolLayout tool-id="ua-parser" title="User Agent Parser" description="Parse and analyze user agent strings">
    <!-- Input -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1">
        <input
          v-model="input"
          type="text"
          class="w-full px-4 py-2 text-sm font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Paste a user agent string..."
        />
      </div>
      <BaseButton variant="secondary" size="sm" :icon="RefreshCw" @click="useCurrentUA">My UA</BaseButton>
      <BaseButton variant="ghost" size="sm" :icon="Trash2" @click="clear">Clear</BaseButton>
    </div>

    <!-- Result -->
    <div v-if="result" class="space-y-4">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BaseCard variant="bordered" class="text-center">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Browser</p>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ result.browser.name }}</p>
          <p class="text-xs text-gray-500">{{ result.browser.version }}</p>
        </BaseCard>
        <BaseCard variant="bordered" class="text-center">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">OS</p>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ result.os.name }}</p>
          <p class="text-xs text-gray-500">{{ result.os.version }}</p>
        </BaseCard>
        <BaseCard variant="bordered" class="text-center">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Device</p>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ result.device.type }}</p>
          <p class="text-xs text-gray-500">{{ result.device.vendor || '-' }}</p>
        </BaseCard>
        <BaseCard variant="bordered" class="text-center">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Engine</p>
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ result.engine.name }}</p>
          <p class="text-xs text-gray-500">{{ result.engine.version }}</p>
        </BaseCard>
      </div>

      <!-- Detailed info -->
      <BaseCard variant="bordered">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Details</span>
            <BaseButton variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copyResult">
              {{ copied ? 'Copied!' : 'Copy' }}
            </BaseButton>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Browser</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.browser.name }} {{ result.browser.version }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Engine</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.engine.name }} {{ result.engine.version }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Operating System</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.os.name }} {{ result.os.version }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Device Type</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.device.type }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">CPU Architecture</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.cpu.architecture || 'Unknown' }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Device Vendor</p>
            <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ result.device.vendor || 'Unknown' }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Empty state -->
    <div v-if="!result" class="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
      Paste a user agent string to analyze it.
    </div>
  </ToolLayout>
</template>
