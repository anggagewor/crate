<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown } from '@lucide/vue'

export type TableVariant = 'default' | 'striped' | 'bordered'
export type SortDirection = 'asc' | 'desc' | null

export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

interface Props {
  columns: TableColumn[]
  data: Record<string, unknown>[]
  variant?: TableVariant
  hoverable?: boolean
  compact?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  expandable?: boolean
  sortColumn?: string
  sortDirection?: SortDirection
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: true,
  compact: false,
  searchable: false,
  searchPlaceholder: 'Search...',
  expandable: false,
  sortDirection: null,
})

const emit = defineEmits<{
  sort: [column: string, direction: SortDirection]
}>()

const searchQuery = ref('')
const expandedRows = ref<Set<number>>(new Set())

const cellPadding = computed(() => (props.compact ? 'px-3 py-2' : 'px-4 py-3'))

// Internal sort state (used if no external sort control)
const internalSortCol = ref<string | null>(props.sortColumn || null)
const internalSortDir = ref<SortDirection>(props.sortDirection)

const activeSortCol = computed(() => props.sortColumn ?? internalSortCol.value)
const activeSortDir = computed(() => props.sortDirection ?? internalSortDir.value)

function handleSort(col: TableColumn) {
  if (!col.sortable) return

  let newDir: SortDirection
  if (activeSortCol.value === col.key) {
    newDir = activeSortDir.value === 'asc' ? 'desc' : activeSortDir.value === 'desc' ? null : 'asc'
  } else {
    newDir = 'asc'
  }

  internalSortCol.value = newDir ? col.key : null
  internalSortDir.value = newDir
  emit('sort', col.key, newDir)
}

const filteredData = computed(() => {
  let result = [...props.data]

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((row) =>
      props.columns.some((col) => {
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(q)
      }),
    )
  }

  // Sort
  if (activeSortCol.value && activeSortDir.value) {
    const key = activeSortCol.value
    const dir = activeSortDir.value === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const aVal = a[key] ?? ''
      const bVal = b[key] ?? ''
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir
      }
      return String(aVal).localeCompare(String(bVal)) * dir
    })
  }

  return result
})

function toggleRow(index: number) {
  if (expandedRows.value.has(index)) {
    expandedRows.value.delete(index)
  } else {
    expandedRows.value.add(index)
  }
}

function isExpanded(index: number) {
  return expandedRows.value.has(index)
}
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div
      v-if="searchable || $slots.toolbar"
      class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700"
    >
      <div v-if="searchable" class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-64 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:ring-primary-900/30"
        />
        <span
          v-if="searchQuery"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
        >
          {{ filteredData.length }} result{{ filteredData.length !== 1 ? 's' : '' }}
        </span>
      </div>
      <div v-if="$slots.toolbar" class="flex items-center gap-2">
        <slot name="toolbar" />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-if="expandable"
              :class="[cellPadding, 'w-10 border-b border-gray-200 dark:border-gray-700']"
            />
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width }"
              :class="[
                cellPadding,
                'font-semibold text-gray-600 uppercase text-[0.6875rem] tracking-wide border-b border-gray-200 dark:border-gray-700 dark:text-gray-400',
                col.align === 'center'
                  ? 'text-center'
                  : col.align === 'right'
                    ? 'text-right'
                    : 'text-left',
                col.sortable
                  ? 'cursor-pointer select-none hover:text-gray-900 transition-colors dark:hover:text-gray-200'
                  : '',
              ]"
              @click="handleSort(col)"
            >
              <div class="inline-flex items-center gap-1">
                {{ col.label }}
                <template v-if="col.sortable">
                  <ArrowUp
                    v-if="activeSortCol === col.key && activeSortDir === 'asc'"
                    class="w-3 h-3 text-primary-500"
                  />
                  <ArrowDown
                    v-else-if="activeSortCol === col.key && activeSortDir === 'desc'"
                    class="w-3 h-3 text-primary-500"
                  />
                  <span v-else class="w-3 h-3 opacity-0 group-hover:opacity-30">↕</span>
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, index) in filteredData" :key="index">
            <tr
              :class="[
                hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : '',
                variant === 'striped' && index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/50' : '',
                expandable ? 'cursor-pointer' : '',
              ]"
              @click="expandable ? toggleRow(index) : undefined"
            >
              <td
                v-if="expandable"
                :class="[
                  cellPadding,
                  'border-b border-gray-100 w-10 text-gray-400 dark:border-gray-700',
                ]"
              >
                <component
                  :is="isExpanded(index) ? ChevronDown : ChevronRight"
                  class="w-4 h-4 transition-transform duration-150"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                :class="[
                  cellPadding,
                  'border-b border-gray-100 text-gray-700 dark:border-gray-700 dark:text-gray-300',
                  variant === 'bordered' ? 'border border-gray-200 dark:border-gray-700' : '',
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left',
                ]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="index">
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
            <!-- Expanded Row -->
            <tr v-if="expandable && isExpanded(index)">
              <td
                :colspan="columns.length + 1"
                class="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-700"
              >
                <div class="px-4 py-3">
                  <slot name="expanded" :row="row" :index="index">
                    <pre class="text-xs text-gray-600 dark:text-gray-400">{{
                      JSON.stringify(row, null, 2)
                    }}</pre>
                  </slot>
                </div>
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-if="filteredData.length === 0">
            <td
              :colspan="columns.length + (expandable ? 1 : 0)"
              class="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
            >
              <slot name="empty">
                {{ searchQuery ? 'No results found.' : 'No data available.' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
