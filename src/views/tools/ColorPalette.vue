<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, RefreshCw } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const baseColor = ref('#3B82F6')
const colorName = ref('primary')

interface Shade {
  level: number
  hex: string
  hsl: string
  rgb: string
}

// Convert hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

// Generate Tailwind-style shades from base color
const shades = computed<Shade[]>(() => {
  const [h, s, _l] = hexToHsl(baseColor.value)

  // Tailwind shade lightness targets (approximate)
  const targets: { level: number; lightness: number }[] = [
    { level: 50, lightness: 97 },
    { level: 100, lightness: 94 },
    { level: 200, lightness: 86 },
    { level: 300, lightness: 76 },
    { level: 400, lightness: 64 },
    { level: 500, lightness: 50 },
    { level: 600, lightness: 42 },
    { level: 700, lightness: 34 },
    { level: 800, lightness: 26 },
    { level: 900, lightness: 20 },
    { level: 950, lightness: 12 },
  ]

  // Adjust saturation based on lightness (lighter = less saturated, darker = slightly less saturated)
  return targets.map((t) => {
    let adjS = s
    if (t.lightness > 80) adjS = Math.max(s * 0.8, s - 10)
    else if (t.lightness < 30) adjS = Math.max(s * 0.85, s - 5)

    const hex = hslToHex(h, adjS, t.lightness)
    return {
      level: t.level,
      hex,
      hsl: `hsl(${h}, ${Math.round(adjS)}%, ${t.lightness}%)`,
      rgb: hexToRgb(hex),
    }
  })
})

function copyAsCSS() {
  const lines = shades.value.map((s) => `  --color-${colorName.value}-${s.level}: ${s.hex};`)
  copy(`:root {\n${lines.join('\n')}\n}`)
}

function copyAsTailwind() {
  const entries = shades.value.map((s) => `    '${s.level}': '${s.hex}',`)
  copy(`'${colorName.value}': {\n${entries.join('\n')}\n}`)
}

function copyAsTailwindV4() {
  const lines = shades.value.map((s) => `  --color-${colorName.value}-${s.level}: ${s.hex};`)
  copy(`@theme {\n${lines.join('\n')}\n}`)
}

function randomColor() {
  const h = Math.floor(Math.random() * 360)
  const s = 60 + Math.floor(Math.random() * 30)
  const l = 45 + Math.floor(Math.random() * 15)
  baseColor.value = hslToHex(h, s, l)
}
</script>

<template>
  <ToolLayout tool-id="color-palette" title="Color Palette Generator" description="Generate Tailwind CSS color shades from any base color">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-6">
      <div class="flex items-center gap-2">
        <input
          v-model="baseColor"
          type="color"
          class="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
        />
        <input
          v-model="baseColor"
          type="text"
          class="w-28 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="#3B82F6"
        />
      </div>
      <input
        v-model="colorName"
        type="text"
        class="w-36 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        placeholder="Color name"
      />
      <BaseButton variant="secondary" size="sm" :icon="RefreshCw" @click="randomColor">Random</BaseButton>
      <div class="ml-auto flex items-center gap-2">
        <BaseButton variant="secondary" size="sm" :icon="copied ? Check : Copy" @click="copyAsCSS">CSS</BaseButton>
        <BaseButton variant="secondary" size="sm" :icon="copied ? Check : Copy" @click="copyAsTailwind">Tailwind</BaseButton>
        <BaseButton variant="secondary" size="sm" :icon="copied ? Check : Copy" @click="copyAsTailwindV4">Tailwind v4</BaseButton>
      </div>
    </div>

    <!-- Palette preview (horizontal bar) -->
    <BaseCard variant="bordered" class="mb-6">
      <div class="flex rounded-lg overflow-hidden h-20">
        <div
          v-for="shade in shades"
          :key="shade.level"
          class="flex-1 flex items-end justify-center pb-1 cursor-pointer transition-transform hover:scale-y-110"
          :style="{ backgroundColor: shade.hex }"
          :title="`${shade.level}: ${shade.hex}`"
          @click="copy(shade.hex)"
        >
          <span class="text-xs font-mono font-medium" :class="shade.level >= 500 ? 'text-white/80' : 'text-black/60'">
            {{ shade.level }}
          </span>
        </div>
      </div>
    </BaseCard>

    <!-- Shade details -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <div
        v-for="shade in shades"
        :key="shade.level"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
        @click="copy(shade.hex)"
      >
        <div class="w-10 h-10 rounded-lg shrink-0 border border-gray-200 dark:border-gray-600" :style="{ backgroundColor: shade.hex }" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ colorName }}-{{ shade.level }}</span>
            <Copy :size="12" class="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ shade.hex }}</p>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>
