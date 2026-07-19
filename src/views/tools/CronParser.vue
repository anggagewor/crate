<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy } from 'lucide-vue-next'

const { copy } = useCopy()

const expression = ref('0 9-17 * * *')

// Field names
const fieldNames = ['Minute', 'Hour', 'Day (month)', 'Month', 'Day (week)']
const fieldRanges = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 6 },
]

const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Parse cron expression into human-readable
function describeField(field: string, index: number): string {
  if (field === '*') return 'every ' + fieldNames[index].toLowerCase()

  // Step: */n
  if (field.startsWith('*/')) {
    const step = field.slice(2)
    return `every ${step} ${fieldNames[index].toLowerCase()}${Number(step) > 1 ? 's' : ''}`
  }

  // Range: n-m
  if (field.includes('-') && !field.includes(',') && !field.includes('/')) {
    const [start, end] = field.split('-')
    if (index === 4) return `${dayNames[Number(start)]} through ${dayNames[Number(end)]}`
    if (index === 3) return `${monthNames[Number(start)]} through ${monthNames[Number(end)]}`
    return `${start} through ${end}`
  }

  // Range with step: n-m/s
  if (field.includes('-') && field.includes('/')) {
    const [range, step] = field.split('/')
    const [start, end] = range.split('-')
    return `every ${step} ${fieldNames[index].toLowerCase()}${Number(step) > 1 ? 's' : ''} from ${start} through ${end}`
  }

  // List: n,m,o
  if (field.includes(',')) {
    const values = field.split(',')
    if (index === 4) return values.map(v => dayNames[Number(v)]).join(', ')
    if (index === 3) return values.map(v => monthNames[Number(v)]).join(', ')
    return values.join(', ')
  }

  // Single value
  if (index === 4) return dayNames[Number(field)] || field
  if (index === 3) return monthNames[Number(field)] || field
  return field
}

const parsed = computed(() => {
  const expr = expression.value.trim()
  if (!expr) return null

  // Handle special expressions
  const specials: Record<string, string> = {
    '@yearly': '0 0 1 1 *',
    '@annually': '0 0 1 1 *',
    '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0',
    '@daily': '0 0 * * *',
    '@midnight': '0 0 * * *',
    '@hourly': '0 * * * *',
  }

  const normalized = specials[expr.toLowerCase()] || expr
  const parts = normalized.split(/\s+/)

  if (parts.length !== 5) {
    return { error: 'Invalid cron expression. Expected 5 fields: minute hour day month weekday' }
  }

  // Validate each field
  for (let i = 0; i < 5; i++) {
    const field = parts[i]
    if (!isValidField(field, fieldRanges[i].min, fieldRanges[i].max)) {
      return { error: `Invalid value in ${fieldNames[i]} field: "${field}"` }
    }
  }

  return {
    fields: parts,
    description: buildDescription(parts),
    nextRuns: getNextRuns(parts, 5),
  }
})

function isValidField(field: string, min: number, max: number): boolean {
  if (field === '*') return true
  // Step
  if (field.match(/^\*\/\d+$/)) {
    const step = Number(field.slice(2))
    return step >= 1 && step <= max
  }
  // Range with optional step
  if (field.includes('-')) {
    const [range, step] = field.split('/')
    const [start, end] = range.split('-')
    if (isNaN(Number(start)) || isNaN(Number(end))) return false
    if (Number(start) < min || Number(end) > max) return false
    if (step && (isNaN(Number(step)) || Number(step) < 1)) return false
    return true
  }
  // List
  if (field.includes(',')) {
    return field.split(',').every(v => {
      const n = Number(v)
      return !isNaN(n) && n >= min && n <= max
    })
  }
  // Single value
  const n = Number(field)
  return !isNaN(n) && n >= min && n <= max
}

function buildDescription(parts: string[]): string {
  const [minute, hour, dom, month, dow] = parts
  const pieces: string[] = []

  // Minute
  if (minute === '*') {
    pieces.push('Every minute')
  } else if (minute.startsWith('*/')) {
    pieces.push(`Every ${minute.slice(2)} minutes`)
  } else {
    pieces.push(`At minute ${describeField(minute, 0)}`)
  }

  // Hour
  if (hour !== '*') {
    if (hour.includes('-')) {
      pieces.push(`past every hour from ${hour.replace('-', ' through ')}`)
    } else if (hour.startsWith('*/')) {
      pieces.push(`past every ${hour.slice(2)} hours`)
    } else {
      pieces.push(`past hour ${describeField(hour, 1)}`)
    }
  }

  // Day of month
  if (dom !== '*') {
    if (dom.startsWith('*/')) {
      pieces.push(`every ${dom.slice(2)} days`)
    } else {
      pieces.push(`on day-of-month ${describeField(dom, 2)}`)
    }
  }

  // Month
  if (month !== '*') {
    pieces.push(`in ${describeField(month, 3)}`)
  }

  // Day of week
  if (dow !== '*') {
    pieces.push(`on ${describeField(dow, 4)}`)
  }

  return pieces.join(' ') + '.'
}

function expandField(field: string, min: number, max: number): number[] {
  if (field === '*') {
    const arr: number[] = []
    for (let i = min; i <= max; i++) arr.push(i)
    return arr
  }

  const results = new Set<number>()

  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/')
      const step = Number(stepStr)
      let start = min
      let end = max
      if (range !== '*') {
        const [s, e] = range.split('-')
        start = Number(s)
        end = e !== undefined ? Number(e) : max
      }
      for (let i = start; i <= end; i += step) results.add(i)
    } else if (part.includes('-')) {
      const [s, e] = part.split('-')
      for (let i = Number(s); i <= Number(e); i++) results.add(i)
    } else {
      results.add(Number(part))
    }
  }

  return Array.from(results).sort((a, b) => a - b)
}

function getNextRuns(parts: string[], count: number): string[] {
  const [minField, hourField, domField, monthField, dowField] = parts
  const minutes = expandField(minField, 0, 59)
  const hours = expandField(hourField, 0, 23)
  const doms = expandField(domField, 1, 31)
  const months = expandField(monthField, 1, 12)
  const dows = expandField(dowField, 0, 6)

  const now = new Date()
  const results: string[] = []
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0)

  let iterations = 0
  const maxIterations = 525600 // 1 year of minutes

  while (results.length < count && iterations < maxIterations) {
    iterations++
    const m = candidate.getMinutes()
    const h = candidate.getHours()
    const d = candidate.getDate()
    const mo = candidate.getMonth() + 1
    const wd = candidate.getDay()

    if (
      minutes.includes(m) &&
      hours.includes(h) &&
      doms.includes(d) &&
      months.includes(mo) &&
      dows.includes(wd)
    ) {
      results.push(formatDate(candidate))
    }

    candidate.setMinutes(candidate.getMinutes() + 1)
  }

  return results
}

function formatDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

const cronReference = [
  { symbol: '*', meaning: 'any value' },
  { symbol: ',', meaning: 'value list separator' },
  { symbol: '-', meaning: 'range of values' },
  { symbol: '/', meaning: 'step values' },
  { symbol: '@yearly', meaning: '0 0 1 1 * (non-standard)' },
  { symbol: '@monthly', meaning: '0 0 1 * * (non-standard)' },
  { symbol: '@weekly', meaning: '0 0 * * 0 (non-standard)' },
  { symbol: '@daily', meaning: '0 0 * * * (non-standard)' },
  { symbol: '@hourly', meaning: '0 * * * * (non-standard)' },
]

const examples = [
  { expr: '* * * * *', desc: 'Every minute' },
  { expr: '0 * * * *', desc: 'Every hour' },
  { expr: '0 0 * * *', desc: 'Every day at midnight' },
  { expr: '0 9 * * 1-5', desc: 'Weekdays at 9am' },
  { expr: '*/5 * * * *', desc: 'Every 5 minutes' },
  { expr: '0 9-17 * * *', desc: 'Every hour 9am-5pm' },
  { expr: '0 0 1 * *', desc: 'First day of month' },
]

function useExample(expr: string) {
  expression.value = expr
}
</script>

<template>
  <ToolLayout tool-id="cron-parser" title="Cron Parser" description="Parse and explain cron expressions">
    <div class="space-y-4">
      <!-- Input -->
      <BaseCard variant="bordered">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Cron Expression</label>
        <div class="flex gap-3">
          <input
            v-model="expression"
            type="text"
            class="flex-1 px-4 py-2.5 font-mono text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="* * * * *"
            spellcheck="false"
          />
          <BaseButton variant="ghost" size="sm" :icon="Copy" @click="copy(expression)" />
        </div>
        <!-- Field labels -->
        <div class="flex gap-1 mt-2 font-mono text-xs text-gray-400 px-4">
          <span v-for="(name, i) in fieldNames" :key="i" class="flex-1 text-center">{{ name }}</span>
        </div>
      </BaseCard>

      <!-- Error -->
      <div v-if="parsed && 'error' in parsed" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
        {{ parsed.error }}
      </div>

      <!-- Result -->
      <template v-if="parsed && !('error' in parsed)">
        <!-- Human-readable description -->
        <BaseCard variant="bordered">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</div>
          <p class="text-lg font-medium text-gray-900 dark:text-gray-100 italic">
            "{{ parsed.description }}"
          </p>
        </BaseCard>

        <!-- Next runs -->
        <BaseCard variant="bordered">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Next scheduled runs</div>
          <div class="space-y-1">
            <div
              v-for="(run, idx) in parsed.nextRuns"
              :key="idx"
              class="flex items-center gap-3 font-mono text-sm"
            >
              <span class="text-gray-400 w-4">{{ idx + 1 }}.</span>
              <span class="text-gray-900 dark:text-gray-100">{{ run }}</span>
            </div>
            <div v-if="parsed.nextRuns.length === 0" class="text-sm text-gray-500">
              No upcoming runs found within the next year.
            </div>
          </div>
        </BaseCard>
      </template>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Reference -->
        <BaseCard variant="bordered">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Reference</div>
          <div class="space-y-1.5">
            <div
              v-for="ref in cronReference"
              :key="ref.symbol"
              class="flex items-center gap-3 text-sm"
            >
              <code class="w-20 shrink-0 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-900 dark:text-gray-100">{{ ref.symbol }}</code>
              <span class="text-gray-600 dark:text-gray-400">{{ ref.meaning }}</span>
            </div>
          </div>
        </BaseCard>

        <!-- Examples -->
        <BaseCard variant="bordered">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Examples</div>
          <div class="space-y-1.5">
            <button
              v-for="ex in examples"
              :key="ex.expr"
              class="w-full flex items-center gap-3 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1 -mx-2 cursor-pointer transition-colors"
              @click="useExample(ex.expr)"
            >
              <code class="w-28 shrink-0 font-mono text-xs text-primary-600 dark:text-primary-400">{{ ex.expr }}</code>
              <span class="text-gray-600 dark:text-gray-400">{{ ex.desc }}</span>
            </button>
          </div>
        </BaseCard>
      </div>
    </div>
  </ToolLayout>
</template>
