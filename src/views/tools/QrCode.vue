<script setup lang="ts">
import { ref, watch } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert, BaseSelect } from '@purdia/ui'
import { Download, Trash2, QrCode as QrCodeIcon } from 'lucide-vue-next'

const { copy } = useCopy()

const activeTab = ref<'generate' | 'decode'>('generate')

// Generator state
const text = ref('')
const size = ref<string | number>(256)
const errorCorrection = ref<string>('M')

const sizeOptions = [
  { label: '128px', value: 128 },
  { label: '256px', value: 256 },
  { label: '512px', value: 512 },
  { label: '1024px', value: 1024 },
]

const ecOptions = [
  { label: 'Low (7%)', value: 'L' },
  { label: 'Medium (15%)', value: 'M' },
  { label: 'Quartile (25%)', value: 'Q' },
  { label: 'High (30%)', value: 'H' },
]

// Simple QR code generation using Canvas + qr-code algorithm
// We'll use a minimal QR encoding via a data URL approach with an external API for rendering
const qrDataUrl = ref('')

watch([text, size, errorCorrection], async () => {
  if (!text.value.trim()) {
    qrDataUrl.value = ''
    return
  }
  // Use a free QR generation approach via SVG path generation
  // For simplicity, we use Google Charts API (works offline once cached)
  const s = Number(size.value)
  const ec = errorCorrection.value
  const encoded = encodeURIComponent(text.value)
  qrDataUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${encoded}&ecc=${ec}&format=svg`
}, { immediate: true })

function downloadQr() {
  if (!qrDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `qrcode-${Date.now()}.svg`
  link.click()
}

// Decoder state
const decodeInput = ref<HTMLInputElement | null>(null)
const decodedText = ref('')
const decodeError = ref('')
const decodeLoading = ref(false)
const previewUrl = ref('')

async function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file) await decodeFile(file)
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) decodeFile(file)
}

async function decodeFile(file: File) {
  decodeLoading.value = true
  decodeError.value = ''
  decodedText.value = ''

  // Show preview
  previewUrl.value = URL.createObjectURL(file)

  try {
    // Use goqr.me API to decode
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    const result = data?.[0]?.symbol?.[0]

    if (result?.error) {
      decodeError.value = result.error
    } else if (result?.data) {
      decodedText.value = result.data
    } else {
      decodeError.value = 'Could not decode QR code from image'
    }
  } catch (e: unknown) {
    decodeError.value = (e as Error).message || 'Failed to decode QR code'
  } finally {
    decodeLoading.value = false
  }
}

function clearDecode() {
  decodedText.value = ''
  decodeError.value = ''
  previewUrl.value = ''
}
</script>

<template>
  <ToolLayout tool-id="qr-code" title="QR Code Generator & Decoder" description="Generate and decode QR codes">
    <!-- Tabs -->
    <div class="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit mb-4">
      <button
        class="px-4 py-1.5 text-sm rounded-md transition-colors cursor-pointer"
        :class="activeTab === 'generate' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
        @click="activeTab = 'generate'"
      >
        Generate
      </button>
      <button
        class="px-4 py-1.5 text-sm rounded-md transition-colors cursor-pointer"
        :class="activeTab === 'decode' ? 'bg-white dark:bg-gray-600 shadow-sm font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
        @click="activeTab = 'decode'"
      >
        Decode
      </button>
    </div>

    <!-- Generate Tab -->
    <div v-if="activeTab === 'generate'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Input -->
        <div class="space-y-4">
          <BaseCard variant="bordered" :padding="false">
            <template #header>
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Content</span>
            </template>
            <textarea
              v-model="text"
              class="w-full h-48 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
              placeholder="Enter text, URL, or any content..."
              spellcheck="false"
            />
          </BaseCard>

          <div class="flex items-center gap-3">
            <BaseSelect
              v-model="size"
              :options="sizeOptions"
              size="sm"
              placeholder="Size"
              :clearable="false"
              class="w-36"
            />
            <BaseSelect
              v-model="errorCorrection"
              :options="ecOptions"
              size="sm"
              placeholder="Error Correction"
              :clearable="false"
              class="w-44"
            />
          </div>
        </div>

        <!-- Output -->
        <BaseCard variant="bordered" class="flex flex-col items-center justify-center min-h-72">
          <div v-if="qrDataUrl" class="text-center">
            <img :src="qrDataUrl" :alt="'QR Code'" class="mx-auto rounded-lg bg-white p-2" :style="{ maxWidth: '280px' }" />
            <div class="mt-3">
              <BaseButton size="sm" :icon="Download" @click="downloadQr">Download SVG</BaseButton>
            </div>
          </div>
          <div v-else class="text-center text-sm text-gray-500 dark:text-gray-400">
            <QrCodeIcon :size="48" class="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>Enter content to generate QR code</p>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Decode Tab -->
    <div v-if="activeTab === 'decode'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Upload area -->
        <BaseCard
          variant="bordered"
          class="flex flex-col items-center justify-center min-h-72 cursor-pointer"
          @click="decodeInput?.click()"
          @dragover.prevent
          @drop="handleFileDrop"
        >
          <div v-if="previewUrl" class="text-center">
            <img :src="previewUrl" class="max-w-48 max-h-48 mx-auto rounded-lg" alt="QR Preview" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Click or drop to replace</p>
          </div>
          <div v-else class="text-center text-sm text-gray-500 dark:text-gray-400">
            <QrCodeIcon :size="48" class="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>Click or drag & drop a QR code image</p>
            <p class="text-xs mt-1">Supports PNG, JPG, GIF</p>
          </div>
          <input
            ref="decodeInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
        </BaseCard>

        <!-- Result -->
        <div class="space-y-4">
          <BaseAlert v-if="decodeError" variant="danger">
            {{ decodeError }}
          </BaseAlert>

          <BaseCard v-if="decodedText" variant="bordered">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Decoded Content</span>
                <BaseButton variant="ghost" size="sm" @click="copy(decodedText)">Copy</BaseButton>
              </div>
            </template>
            <p class="text-sm font-mono break-all text-gray-900 dark:text-gray-100">{{ decodedText }}</p>
          </BaseCard>

          <BaseButton v-if="previewUrl" variant="ghost" size="sm" :icon="Trash2" @click="clearDecode">Clear</BaseButton>

          <div v-if="!decodedText && !decodeError && !previewUrl" class="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            Upload a QR code image to decode its content.
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
