<script setup lang="ts">
import { ref, watch } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseCard, BaseButton } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

const hex = ref('#6366f1')
const r = ref(99)
const g = ref(102)
const b = ref(241)
const h = ref(239)
const s = ref(84)
const l = ref(67)

function hexToRgb(hexStr: string): [number, number, number] | null {
  const match = hexStr.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!match) return null
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
}

function rgbToHex(rv: number, gv: number, bv: number): string {
  return '#' + [rv, gv, bv].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(rv: number, gv: number, bv: number): [number, number, number] {
  const rn = rv / 255, gn = gv / 255, bn = bv / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const lv = (max + min) / 2
  let hv = 0, sv = 0
  if (max !== min) {
    const d = max - min
    sv = lv > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: hv = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: hv = ((bn - rn) / d + 2) / 6; break
      case bn: hv = ((rn - gn) / d + 4) / 6; break
    }
  }
  return [Math.round(hv * 360), Math.round(sv * 100), Math.round(lv * 100)]
}

function hslToRgb(hv: number, sv: number, lv: number): [number, number, number] {
  const sn = sv / 100, ln = lv / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((hv / 60) % 2) - 1))
  const m = ln - c / 2
  let rn = 0, gn = 0, bn = 0
  if (hv < 60) { rn = c; gn = x }
  else if (hv < 120) { rn = x; gn = c }
  else if (hv < 180) { gn = c; bn = x }
  else if (hv < 240) { gn = x; bn = c }
  else if (hv < 300) { rn = x; bn = c }
  else { rn = c; bn = x }
  return [Math.round((rn + m) * 255), Math.round((gn + m) * 255), Math.round((bn + m) * 255)]
}

function updateFromHex() {
  const rgb = hexToRgb(hex.value)
  if (!rgb) return
  ;[r.value, g.value, b.value] = rgb
  ;[h.value, s.value, l.value] = rgbToHsl(...rgb)
}

function updateFromRgb() {
  hex.value = rgbToHex(r.value, g.value, b.value)
  ;[h.value, s.value, l.value] = rgbToHsl(r.value, g.value, b.value)
}

function updateFromHsl() {
  const rgb = hslToRgb(h.value, s.value, l.value)
  ;[r.value, g.value, b.value] = rgb
  hex.value = rgbToHex(...rgb)
}

watch(hex, updateFromHex)
</script>

<template>
  <ToolLayout tool-id="color-converter" title="Color Converter" description="Convert between HEX, RGB, and HSL">
    <div class="space-y-6">
      <!-- Preview -->
      <div class="flex items-center gap-4">
        <div class="w-24 h-24 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner" :style="{ backgroundColor: hex }" />
        <input v-model="hex" type="color" class="w-12 h-12 rounded cursor-pointer border-0" @input="updateFromHex" />
      </div>

      <!-- HEX -->
      <BaseCard variant="bordered">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500">HEX</span>
          <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(hex)" />
        </div>
        <input v-model="hex" type="text" class="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" @change="updateFromHex" />
      </BaseCard>

      <!-- RGB -->
      <BaseCard variant="bordered">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500">RGB</span>
          <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(`rgb(${r}, ${g}, ${b})`)" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-gray-400">R</label>
            <input v-model.number="r" type="number" min="0" max="255" class="w-full px-2 py-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded" @change="updateFromRgb" />
          </div>
          <div>
            <label class="text-xs text-gray-400">G</label>
            <input v-model.number="g" type="number" min="0" max="255" class="w-full px-2 py-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded" @change="updateFromRgb" />
          </div>
          <div>
            <label class="text-xs text-gray-400">B</label>
            <input v-model.number="b" type="number" min="0" max="255" class="w-full px-2 py-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded" @change="updateFromRgb" />
          </div>
        </div>
      </BaseCard>

      <!-- HSL -->
      <BaseCard variant="bordered">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500">HSL</span>
          <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(`hsl(${h}, ${s}%, ${l}%)`)" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-gray-400">H</label>
            <input v-model.number="h" type="number" min="0" max="360" class="w-full px-2 py-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded" @change="updateFromHsl" />
          </div>
          <div>
            <label class="text-xs text-gray-400">S%</label>
            <input v-model.number="s" type="number" min="0" max="100" class="w-full px-2 py-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded" @change="updateFromHsl" />
          </div>
          <div>
            <label class="text-xs text-gray-400">L%</label>
            <input v-model.number="l" type="number" min="0" max="100" class="w-full px-2 py-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded" @change="updateFromHsl" />
          </div>
        </div>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
