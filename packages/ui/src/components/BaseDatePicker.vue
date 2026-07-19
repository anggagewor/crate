<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from '@lucide/vue'

export type PickerMode = 'date' | 'time' | 'datetime' | 'range'

interface Props {
  modelValue?: string | [string, string]
  mode?: PickerMode
  format?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'date',
  format: 'YYYY-MM-DD',
  placeholder: '',
  disabled: false,
  clearable: true,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string]]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})

// Calendar state
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())
const hours = ref(0)
const minutes = ref(0)

// Range state
const rangeStart = ref('')
const rangeEnd = ref('')
const rangeSelecting = ref<'start' | 'end'>('start')

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// Format helpers
function padZero(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(date: Date, fmt: string): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours()
  const min = date.getMinutes()
  const s = date.getSeconds()

  return fmt
    .replace('YYYY', y.toString())
    .replace('YY', y.toString().slice(-2))
    .replace('MM', padZero(m))
    .replace('M', m.toString())
    .replace('DD', padZero(d))
    .replace('D', d.toString())
    .replace('HH', padZero(h))
    .replace('H', h.toString())
    .replace('hh', padZero(h > 12 ? h - 12 : h || 12))
    .replace('mm', padZero(min))
    .replace('ss', padZero(s))
    .replace('A', h >= 12 ? 'PM' : 'AM')
    .replace('a', h >= 12 ? 'pm' : 'am')
}

function parseDate(str: string): Date | null {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`
}

// Display value
const displayValue = computed(() => {
  if (props.mode === 'range') {
    const val = props.modelValue as [string, string] | undefined
    if (!val || (!val[0] && !val[1])) return ''
    const start = val[0] ? formatDate(new Date(val[0]), props.format) : ''
    const end = val[1] ? formatDate(new Date(val[1]), props.format) : ''
    return `${start} → ${end}`
  }

  const val = props.modelValue as string | undefined
  if (!val) return ''
  const d = parseDate(val)
  if (!d) return val
  return formatDate(d, props.format)
})

// Calendar days
const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(viewYear.value, viewMonth.value, 0).getDate()

  const days: { day: number; month: 'prev' | 'current' | 'next'; iso: string }[] = []

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const m = viewMonth.value - 1
    const y = m < 0 ? viewYear.value - 1 : viewYear.value
    days.push({ day: d, month: 'prev', iso: toISODate(y, m < 0 ? 11 : m, d) })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month: 'current', iso: toISODate(viewYear.value, viewMonth.value, i) })
  }

  // Next month
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const m = viewMonth.value + 1
    const y = m > 11 ? viewYear.value + 1 : viewYear.value
    days.push({ day: i, month: 'next', iso: toISODate(y, m > 11 ? 0 : m, i) })
  }

  return days
})

function isSelected(iso: string) {
  if (props.mode === 'range') {
    return iso === rangeStart.value || iso === rangeEnd.value
  }
  const val = props.modelValue as string
  return val?.startsWith(iso)
}

function isInRange(iso: string) {
  if (props.mode !== 'range' || !rangeStart.value || !rangeEnd.value) return false
  return iso > rangeStart.value && iso < rangeEnd.value
}

function isToday(iso: string) {
  const today = new Date()
  return iso === toISODate(today.getFullYear(), today.getMonth(), today.getDate())
}

function selectDay(iso: string) {
  if (props.mode === 'range') {
    if (rangeSelecting.value === 'start') {
      rangeStart.value = iso
      rangeEnd.value = ''
      rangeSelecting.value = 'end'
    } else {
      if (iso < rangeStart.value) {
        rangeEnd.value = rangeStart.value
        rangeStart.value = iso
      } else {
        rangeEnd.value = iso
      }
      rangeSelecting.value = 'start'
      emit('update:modelValue', [rangeStart.value, rangeEnd.value])
      isOpen.value = false
    }
    return
  }

  if (props.mode === 'time') return

  if (props.mode === 'datetime') {
    const datetime = `${iso}T${padZero(hours.value)}:${padZero(minutes.value)}:00`
    emit('update:modelValue', datetime)
  } else {
    emit('update:modelValue', iso)
    isOpen.value = false
  }
}

function confirmDateTime() {
  const val = props.modelValue as string
  const datePart =
    val?.slice(0, 10) || toISODate(viewYear.value, viewMonth.value, new Date().getDate())
  const datetime = `${datePart}T${padZero(hours.value)}:${padZero(minutes.value)}:00`
  emit('update:modelValue', datetime)
  isOpen.value = false
}

function setTimeOnly() {
  const time = `${padZero(hours.value)}:${padZero(minutes.value)}:00`
  emit('update:modelValue', time)
  isOpen.value = false
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewYear.value--
    viewMonth.value = 11
  } else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewYear.value++
    viewMonth.value = 0
  } else viewMonth.value++
}

function clear() {
  if (props.mode === 'range') {
    rangeStart.value = ''
    rangeEnd.value = ''
    emit('update:modelValue', ['', ''])
  } else {
    emit('update:modelValue', '')
  }
}

function updatePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    zIndex: '9999',
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  updatePosition()

  // Sync view to current value
  const val =
    props.mode === 'range'
      ? (props.modelValue as [string, string])?.[0]
      : (props.modelValue as string)
  if (val) {
    const d = parseDate(val)
    if (d) {
      viewYear.value = d.getFullYear()
      viewMonth.value = d.getMonth()
      if (props.mode === 'datetime' || props.mode === 'time') {
        hours.value = d.getHours()
        minutes.value = d.getMinutes()
      }
    }
  }

  if (props.mode === 'range') {
    const rv = props.modelValue as [string, string] | undefined
    rangeStart.value = rv?.[0] || ''
    rangeEnd.value = rv?.[1] || ''
  }
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    const portal = document.querySelector('[data-datepicker-portal]')
    if (portal && portal.contains(e.target as Node)) return
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updatePosition, true)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updatePosition, true)
})

const sizeClasses: Record<string, string> = {
  sm: 'min-h-[1.875rem] px-2 py-1 text-xs',
  md: 'min-h-[2.375rem] px-2.5 py-1.5 text-sm',
  lg: 'min-h-[2.875rem] px-3 py-2 text-base',
}
</script>

<template>
  <div ref="containerRef" class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
      label
    }}</label>

    <!-- Trigger -->
    <div
      ref="triggerRef"
      class="flex items-center gap-2 border border-gray-300 rounded-md bg-white cursor-pointer transition-all duration-150 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:bg-gray-800 dark:border-gray-600 dark:focus-within:ring-primary-900/30"
      :class="[
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        error ? 'border-red-500!' : '',
      ]"
      @click="open"
    >
      <Calendar class="w-4 h-4 text-gray-400 shrink-0" />
      <span v-if="displayValue" class="flex-1 text-gray-800 truncate dark:text-gray-200">{{
        displayValue
      }}</span>
      <span v-else class="flex-1 text-gray-400 truncate dark:text-gray-500">{{
        placeholder ||
        (mode === 'time' ? 'Select time' : mode === 'range' ? 'Select range' : 'Select date')
      }}</span>
      <button
        v-if="clearable && displayValue && !disabled"
        class="text-gray-400 hover:text-gray-600 cursor-pointer"
        @click.stop="clear"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Dropdown -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-1"
      >
        <div
          v-if="isOpen"
          data-datepicker-portal
          :style="dropdownStyle"
          class="bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-[18rem] dark:bg-gray-800 dark:border-gray-700"
        >
          <!-- Time Only -->
          <template v-if="mode === 'time'">
            <div class="flex items-center justify-center gap-2 py-4">
              <div class="text-center">
                <button
                  class="block mx-auto text-gray-400 hover:text-gray-700 cursor-pointer"
                  @click="hours = (hours + 1) % 24"
                >
                  <ChevronLeft class="w-4 h-4 rotate-90" />
                </button>
                <input
                  v-model.number="hours"
                  type="number"
                  min="0"
                  max="23"
                  class="w-12 text-center text-2xl font-semibold border border-gray-200 rounded-md py-1 outline-none focus:border-primary-500"
                />
                <button
                  class="block mx-auto text-gray-400 hover:text-gray-700 cursor-pointer"
                  @click="hours = (hours - 1 + 24) % 24"
                >
                  <ChevronLeft class="w-4 h-4 -rotate-90" />
                </button>
              </div>
              <span class="text-2xl font-bold text-gray-400">:</span>
              <div class="text-center">
                <button
                  class="block mx-auto text-gray-400 hover:text-gray-700 cursor-pointer"
                  @click="minutes = (minutes + 1) % 60"
                >
                  <ChevronLeft class="w-4 h-4 rotate-90" />
                </button>
                <input
                  v-model.number="minutes"
                  type="number"
                  min="0"
                  max="59"
                  class="w-12 text-center text-2xl font-semibold border border-gray-200 rounded-md py-1 outline-none focus:border-primary-500"
                />
                <button
                  class="block mx-auto text-gray-400 hover:text-gray-700 cursor-pointer"
                  @click="minutes = (minutes - 1 + 60) % 60"
                >
                  <ChevronLeft class="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>
            <button
              class="w-full py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 cursor-pointer"
              @click="setTimeOnly"
            >
              Confirm
            </button>
          </template>

          <!-- Date / DateTime / Range -->
          <template v-else>
            <!-- Month/Year Nav -->
            <div class="flex items-center justify-between mb-3">
              <button class="p-1 rounded hover:bg-gray-100 cursor-pointer" @click="prevMonth">
                <ChevronLeft class="w-4 h-4 text-gray-600" />
              </button>
              <span class="text-sm font-semibold text-gray-800"
                >{{ MONTHS[viewMonth] }} {{ viewYear }}</span
              >
              <button class="p-1 rounded hover:bg-gray-100 cursor-pointer" @click="nextMonth">
                <ChevronRight class="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <!-- Range hint -->
            <p v-if="mode === 'range'" class="text-[0.6875rem] text-gray-400 text-center mb-2">
              {{ rangeSelecting === 'start' ? 'Select start date' : 'Select end date' }}
            </p>

            <!-- Day headers -->
            <div class="grid grid-cols-7 mb-1">
              <span
                v-for="d in DAYS"
                :key="d"
                class="text-center text-[0.625rem] font-medium text-gray-400 py-1"
                >{{ d }}</span
              >
            </div>

            <!-- Day grid -->
            <div class="grid grid-cols-7 gap-0.5">
              <button
                v-for="(cell, idx) in calendarDays"
                :key="idx"
                class="w-full aspect-square flex items-center justify-center text-xs rounded-md cursor-pointer transition-colors"
                :class="[
                  cell.month !== 'current' ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100',
                  isSelected(cell.iso) ? 'bg-primary-500! text-white! hover:bg-primary-600!' : '',
                  isInRange(cell.iso) ? 'bg-primary-50 text-primary-700' : '',
                  isToday(cell.iso) && !isSelected(cell.iso) ? 'ring-1 ring-primary-300' : '',
                ]"
                @click="selectDay(cell.iso)"
              >
                {{ cell.day }}
              </button>
            </div>

            <!-- Time section for datetime -->
            <div v-if="mode === 'datetime'" class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock class="w-3.5 h-3.5" /> Time
                </div>
                <div class="flex items-center gap-1">
                  <input
                    v-model.number="hours"
                    type="number"
                    min="0"
                    max="23"
                    class="w-10 text-center text-sm border border-gray-200 rounded py-0.5 outline-none focus:border-primary-500"
                  />
                  <span class="text-gray-400 font-bold">:</span>
                  <input
                    v-model.number="minutes"
                    type="number"
                    min="0"
                    max="59"
                    class="w-10 text-center text-sm border border-gray-200 rounded py-0.5 outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <button
                class="w-full mt-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 cursor-pointer"
                @click="confirmDateTime"
              >
                Confirm
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </Teleport>

    <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
  </div>
</template>
