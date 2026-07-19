<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDown, X, Search, Loader2 } from '@lucide/vue'

export type SelectVariant = 'default' | 'filled' | 'underlined'
export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | (string | number)[]
  options?: SelectOption[]
  variant?: SelectVariant
  size?: SelectSize
  placeholder?: string
  disabled?: boolean
  label?: string
  error?: string
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  // Ajax support
  remote?: boolean
  remoteMethod?: (query: string) => Promise<SelectOption[]>
  loadingText?: string
  noResultsText?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  variant: 'default',
  size: 'md',
  placeholder: 'Select...',
  disabled: false,
  multiple: false,
  searchable: true,
  clearable: true,
  remote: false,
  loadingText: 'Loading...',
  noResultsText: 'No results found',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const remoteOptions = ref<SelectOption[]>([])
const containerRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()

// Dropdown positioning (teleported to body)
const dropdownStyle = ref<Record<string, string>>({})

function updateDropdownPosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth

  // Start aligned left with trigger
  let left = rect.left

  // After render, check if it overflows right — if so, align to right edge of trigger
  // Use rect.width as minimum, but dropdown may be wider (max-content)
  const estimatedWidth = Math.max(rect.width, 200)
  if (left + estimatedWidth > viewportWidth - 8) {
    // Right-align: dropdown right edge = trigger right edge
    left = rect.right - estimatedWidth
    if (left < 8) left = 8 // don't go off-screen left either
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    right: `${viewportWidth - rect.right}px`,
    minWidth: `${rect.width}px`,
    width: 'max-content',
    maxWidth: '320px',
    zIndex: '9999',
  }
}

// Merged options (local + remote)
const availableOptions = computed(() => {
  if (props.remote) return remoteOptions.value
  return props.options
})

// Filtered options based on search
const filteredOptions = computed(() => {
  if (props.remote) return availableOptions.value
  if (!searchQuery.value.trim()) return availableOptions.value
  const q = searchQuery.value.toLowerCase()
  return availableOptions.value.filter((opt) => opt.label.toLowerCase().includes(q))
})

// Selected values as array (normalize single/multiple)
const selectedValues = computed<(string | number)[]>(() => {
  if (props.modelValue == null) return []
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (props.modelValue === '') return []
  return [props.modelValue]
})

// Selected options objects
const selectedOptions = computed(() => {
  const allOpts = [...props.options, ...remoteOptions.value]
  return selectedValues.value
    .map((v) => allOpts.find((o) => o.value === v))
    .filter(Boolean) as SelectOption[]
})

// Display text for single select
const displayText = computed(() => {
  if (selectedOptions.value.length === 0) return ''
  if (!props.multiple) return selectedOptions.value[0]?.label || ''
  return ''
})

function isSelected(opt: SelectOption) {
  return selectedValues.value.includes(opt.value)
}

function toggleOption(opt: SelectOption) {
  if (opt.disabled) return

  if (props.multiple) {
    const current = [...selectedValues.value]
    const idx = current.indexOf(opt.value)
    if (idx > -1) {
      current.splice(idx, 1)
    } else {
      current.push(opt.value)
    }
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', opt.value)
    isOpen.value = false
    searchQuery.value = ''
  }
}

function removeTag(value: string | number) {
  if (props.multiple) {
    const current = selectedValues.value.filter((v) => v !== value)
    emit('update:modelValue', current)
  }
}

function clear() {
  emit('update:modelValue', props.multiple ? [] : '')
  searchQuery.value = ''
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  updateDropdownPosition()
  nextTick(() => searchInputRef.value?.focus())
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    // Also check if click is inside the teleported dropdown
    const dropdown = document.getElementById('select-dropdown-portal')
    if (dropdown && dropdown.contains(e.target as Node)) return
    isOpen.value = false
    searchQuery.value = ''
  }
}

function handleScroll() {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

// Remote search
let debounceTimer: ReturnType<typeof setTimeout>

watch(searchQuery, (q) => {
  if (!props.remote || !props.remoteMethod) return
  clearTimeout(debounceTimer)
  if (!q.trim()) {
    remoteOptions.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    isLoading.value = true
    try {
      remoteOptions.value = await props.remoteMethod!(q)
    } catch {
      remoteOptions.value = []
    } finally {
      isLoading.value = false
    }
  }, 300)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})

// Styling
const containerClasses = computed(() => {
  const variants: Record<SelectVariant, string> = {
    default:
      'border border-gray-300 rounded-md bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:bg-gray-800 dark:border-gray-600 dark:focus-within:ring-primary-900/30',
    filled:
      'border border-transparent rounded-md bg-gray-100 focus-within:bg-white focus-within:border-primary-500 dark:bg-gray-700 dark:focus-within:bg-gray-800',
    underlined:
      'border-b-2 border-gray-300 rounded-none focus-within:border-primary-500 dark:border-gray-600',
  }

  const sizes: Record<SelectSize, string> = {
    sm: 'min-h-[1.875rem]',
    md: 'min-h-[2.375rem]',
    lg: 'min-h-[2.875rem]',
  }

  return [
    'flex flex-wrap items-center gap-1 cursor-pointer transition-all duration-150',
    variants[props.variant],
    sizes[props.size],
    props.size === 'sm' ? 'px-2 py-1' : props.size === 'lg' ? 'px-3 py-2' : 'px-2.5 py-1.5',
    props.error ? 'border-red-500! focus-within:ring-red-100!' : '',
    props.disabled ? 'opacity-50 cursor-not-allowed' : '',
  ]
})
</script>

<template>
  <div ref="containerRef" class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
      label
    }}</label>

    <!-- Trigger -->
    <div ref="triggerRef" :class="containerClasses" @click="open">
      <!-- Tags (multiple) -->
      <template v-if="multiple">
        <span
          v-for="opt in selectedOptions"
          :key="opt.value"
          class="inline-flex items-center gap-1 bg-primary-50 text-primary-700 rounded px-1.5 py-0.5 text-xs font-medium dark:bg-primary-900/30 dark:text-primary-300"
        >
          {{ opt.label }}
          <button
            class="hover:text-primary-900 cursor-pointer dark:hover:text-primary-100"
            @click.stop="removeTag(opt.value)"
            aria-label="Remove"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
      </template>

      <!-- Single value text -->
      <span
        v-if="!multiple && displayText"
        class="text-sm text-gray-800 dark:text-gray-200"
      >
        {{ displayText }}
      </span>

      <!-- Placeholder -->
      <span v-if="selectedValues.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
        {{ placeholder }}
      </span>

      <div class="ml-auto flex items-center gap-1 shrink-0 pl-2">
        <!-- Clear button -->
        <button
          v-if="clearable && selectedValues.length > 0 && !disabled"
          class="text-gray-400 hover:text-gray-600 cursor-pointer dark:hover:text-gray-300"
          @click.stop="clear"
          aria-label="Clear"
        >
          <X class="w-3.5 h-3.5" />
        </button>
        <!-- Chevron -->
        <ChevronDown
          class="w-4 h-4 text-gray-400 transition-transform duration-150"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown (Teleported to body) -->
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
          id="select-dropdown-portal"
          :style="dropdownStyle"
          class="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700"
        >
          <!-- Search input -->
          <div
            v-if="searchable"
            class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700"
          >
            <Search class="w-4 h-4 text-gray-400 shrink-0 dark:text-gray-500" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="flex-1 text-sm border-none outline-none bg-transparent placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-500"
              :placeholder="remote ? 'Type to search...' : 'Search...'"
              @click.stop
            />
            <Loader2 v-if="isLoading" class="w-4 h-4 text-gray-400 animate-spin shrink-0" />
          </div>

          <!-- Options list -->
          <div class="max-h-60 overflow-y-auto py-1">
            <!-- Loading -->
            <div
              v-if="isLoading && filteredOptions.length === 0"
              class="px-3 py-3 text-sm text-gray-400 text-center"
            >
              {{ loadingText }}
            </div>

            <!-- No results -->
            <div
              v-else-if="filteredOptions.length === 0"
              class="px-3 py-3 text-sm text-gray-400 text-center"
            >
              {{ remote && !searchQuery ? 'Type to search...' : noResultsText }}
            </div>

            <!-- Options -->
            <button
              v-for="opt in filteredOptions"
              :key="opt.value"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-75"
              :class="[
                opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                isSelected(opt)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
              :disabled="opt.disabled"
              @click.stop="toggleOption(opt)"
            >
              <!-- Checkbox for multiple -->
              <span
                v-if="multiple"
                class="w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors"
                :class="
                  isSelected(opt)
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <svg
                  v-if="isSelected(opt)"
                  class="w-3 h-3 text-white"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="truncate">{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
  </div>
</template>
