<script setup lang="ts">
import { ref, computed } from 'vue'

export type CalendarVariant = 'default' | 'compact'

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

interface Props {
  modelValue?: Date
  events?: CalendarEvent[]
  variant?: CalendarVariant
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  events: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
  'event-click': [event: CalendarEvent]
  'date-click': [date: Date]
}>()

const today = new Date()
const currentMonth = ref(props.modelValue ? props.modelValue.getMonth() : today.getMonth())
const currentYear = ref(props.modelValue ? props.modelValue.getFullYear() : today.getFullYear())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthLabel = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
}

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startPadding = firstDay.getDay()
  const days: CalendarDay[] = []

  // Previous month padding
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i)
    days.push(buildDay(date, false))
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(currentYear.value, currentMonth.value, d)
    days.push(buildDay(date, true))
  }

  // Next month padding
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push(buildDay(date, false))
  }

  return days
})

function buildDay(date: Date, isCurrentMonth: boolean): CalendarDay {
  return {
    date,
    day: date.getDate(),
    isCurrentMonth,
    isToday: isSameDay(date, today),
    isSelected: props.modelValue ? isSameDay(date, props.modelValue) : false,
    events: getEventsForDate(date),
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getEventsForDate(date: Date): CalendarEvent[] {
  return props.events.filter((e) => isSameDay(new Date(e.date), date))
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectDate(day: CalendarDay) {
  emit('update:modelValue', day.date)
  emit('date-click', day.date)
}

function handleEventClick(event: CalendarEvent, e: MouseEvent) {
  e.stopPropagation()
  emit('event-click', event)
}

const eventDotColors: Record<string, string> = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-cyan-500',
}
</script>

<template>
  <div
    class="select-none"
    :class="{
      'w-full': variant === 'default',
      'w-64': variant === 'compact',
    }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <button
        type="button"
        class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        aria-label="Previous month"
        @click="prevMonth"
      >
        <svg
          class="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ monthLabel }}</span>
      <button
        type="button"
        class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        aria-label="Next month"
        @click="nextMonth"
      >
        <svg
          class="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Week day headers -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
      >
        {{ variant === 'compact' ? day.charAt(0) : day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="relative flex flex-col items-center justify-start py-1 cursor-pointer"
        :class="{
          'min-h-[2.5rem]': variant === 'default',
          'min-h-[2rem]': variant === 'compact',
        }"
        @click="selectDate(day)"
      >
        <span
          class="flex items-center justify-center rounded-full text-xs transition-colors"
          :class="[
            variant === 'compact' ? 'w-6 h-6' : 'w-7 h-7',
            {
              'bg-primary-500 text-white font-semibold': day.isSelected,
              'ring-2 ring-primary-300 dark:ring-primary-600': day.isToday && !day.isSelected,
              'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700':
                day.isCurrentMonth && !day.isSelected,
              'text-gray-400 dark:text-gray-600': !day.isCurrentMonth,
            },
          ]"
        >
          {{ day.day }}
        </span>

        <!-- Event dots -->
        <div v-if="day.events.length && variant === 'default'" class="flex gap-0.5 mt-0.5">
          <span
            v-for="event in day.events.slice(0, 3)"
            :key="event.id"
            class="w-1 h-1 rounded-full"
            :class="eventDotColors[event.variant || 'primary']"
            :title="event.title"
            @click="handleEventClick(event, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
