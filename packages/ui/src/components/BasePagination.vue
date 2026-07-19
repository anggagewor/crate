<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue'

export type PaginationVariant = 'default' | 'simple' | 'minimal' | 'jumper'
export type PaginationSize = 'sm' | 'md' | 'lg'

interface Props {
  currentPage: number
  totalPages: number
  totalItems?: number
  perPage?: number
  variant?: PaginationVariant
  size?: PaginationSize
  showInfo?: boolean
  siblings?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  showInfo: true,
  siblings: 1,
  perPage: 10,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

function goTo(page: number) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('update:currentPage', page)
}

const jumpInput = ref('')

function handleJump() {
  const page = parseInt(jumpInput.value, 10)
  if (!isNaN(page)) {
    goTo(page)
  }
  jumpInput.value = ''
}

const pages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const siblings = props.siblings

  const range: (number | 'dots')[] = []

  const showLeftDots = current - siblings > 2
  const showRightDots = current + siblings < total - 1

  if (total <= siblings * 2 + 5) {
    // Show all pages
    for (let i = 1; i <= total; i++) range.push(i)
  } else {
    range.push(1)

    if (showLeftDots) {
      range.push('dots')
    } else {
      for (let i = 2; i <= current - siblings; i++) range.push(i)
    }

    const start = Math.max(2, current - siblings)
    const end = Math.min(total - 1, current + siblings)
    for (let i = start; i <= end; i++) range.push(i)

    if (showRightDots) {
      range.push('dots')
    } else {
      for (let i = current + siblings + 1; i < total; i++) range.push(i)
    }

    range.push(total)
  }

  return range
})

const infoText = computed(() => {
  if (!props.totalItems) return ''
  const from = (props.currentPage - 1) * props.perPage + 1
  const to = Math.min(props.currentPage * props.perPage, props.totalItems)
  return `${from}–${to} of ${props.totalItems}`
})

const sizeClasses = computed(() => {
  const map: Record<PaginationSize, { btn: string; text: string }> = {
    sm: { btn: 'w-7 h-7 text-xs', text: 'text-xs' },
    md: { btn: 'w-8 h-8 text-sm', text: 'text-sm' },
    lg: { btn: 'w-10 h-10 text-base', text: 'text-sm' },
  }
  return map[props.size]
})
</script>

<template>
  <div class="flex items-center justify-between gap-4 flex-wrap">
    <!-- Info -->
    <p v-if="showInfo && totalItems" :class="['text-gray-500', sizeClasses.text]">
      {{ infoText }}
    </p>
    <div v-else />

    <!-- Pagination controls -->
    <nav class="flex items-center gap-1" aria-label="Pagination">
      <!-- Default variant -->
      <template v-if="variant === 'default'">
        <button
          :disabled="currentPage === 1"
          class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(currentPage - 1)"
          aria-label="Previous page"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>

        <template v-for="(page, idx) in pages" :key="idx">
          <span
            v-if="page === 'dots'"
            class="inline-flex items-center justify-center text-gray-400"
            :class="sizeClasses.btn"
          >
            …
          </span>
          <button
            v-else
            class="inline-flex items-center justify-center rounded-md font-medium cursor-pointer transition-colors"
            :class="[
              sizeClasses.btn,
              page === currentPage
                ? 'bg-primary-500 text-white'
                : 'text-gray-700 hover:bg-gray-100 border border-gray-200',
            ]"
            @click="goTo(page)"
            :aria-current="page === currentPage ? 'page' : undefined"
          >
            {{ page }}
          </button>
        </template>

        <button
          :disabled="currentPage === totalPages"
          class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(currentPage + 1)"
          aria-label="Next page"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </template>

      <!-- Simple variant (prev/next only with page indicator) -->
      <template v-if="variant === 'simple'">
        <button
          :disabled="currentPage === 1"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.text"
          @click="goTo(currentPage - 1)"
        >
          <ChevronLeft class="w-4 h-4" /> Previous
        </button>
        <span :class="['px-3 text-gray-600 font-medium', sizeClasses.text]">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.text"
          @click="goTo(currentPage + 1)"
        >
          Next <ChevronRight class="w-4 h-4" />
        </button>
      </template>

      <!-- Minimal variant (just arrows) -->
      <template v-if="variant === 'minimal'">
        <button
          :disabled="currentPage === 1"
          class="inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(1)"
          aria-label="First page"
        >
          <ChevronsLeft class="w-4 h-4" />
        </button>
        <button
          :disabled="currentPage === 1"
          class="inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(currentPage - 1)"
          aria-label="Previous page"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span :class="['px-2 text-gray-700 font-medium', sizeClasses.text]">
          {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          class="inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(currentPage + 1)"
          aria-label="Next page"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(totalPages)"
          aria-label="Last page"
        >
          <ChevronsRight class="w-4 h-4" />
        </button>
      </template>

      <!-- Jumper variant (prev/next + input to jump to page) -->
      <template v-if="variant === 'jumper'">
        <button
          :disabled="currentPage === 1"
          class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(currentPage - 1)"
          aria-label="Previous page"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span :class="['px-2 text-gray-700 font-medium', sizeClasses.text]">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          :class="sizeClasses.btn"
          @click="goTo(currentPage + 1)"
          aria-label="Next page"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
        <span class="mx-2 text-gray-400">|</span>
        <form class="inline-flex items-center gap-1.5" @submit.prevent="handleJump">
          <label :class="['text-gray-500', sizeClasses.text]">Go to</label>
          <input
            v-model="jumpInput"
            type="number"
            min="1"
            :max="totalPages"
            :placeholder="String(currentPage)"
            class="w-14 px-2 py-1 border border-gray-200 rounded-md text-center outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200"
            :class="sizeClasses.text"
            @keydown.enter="handleJump"
          />
          <button
            type="submit"
            class="px-2 py-1 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 cursor-pointer transition-colors"
            :class="sizeClasses.text"
          >
            Go
          </button>
        </form>
      </template>
    </nav>
  </div>
</template>
