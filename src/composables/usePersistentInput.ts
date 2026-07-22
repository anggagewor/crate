import { ref, watch, onMounted, type Ref } from 'vue'
import { loadJson, saveJson } from '@/services/storage'

const STORAGE_FILE = 'tool-inputs.json'
let cache: Record<string, unknown> | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

async function loadCache(): Promise<Record<string, unknown>> {
  if (cache === null) {
    cache = await loadJson<Record<string, unknown>>(STORAGE_FILE, {})
  }
  return cache
}

function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (cache) {
      saveJson(STORAGE_FILE, cache)
    }
  }, 1000)
}

/**
 * Composable that persists a tool's input text to file storage.
 * Auto-loads on mount, auto-saves on change (debounced 1s).
 *
 * @param toolId - unique tool identifier
 * @param defaultValue - fallback if no saved value
 */
export function usePersistentInput(toolId: string, defaultValue = '') {
  const value = ref(defaultValue)
  let loaded = false

  onMounted(async () => {
    const data = await loadCache()
    if (data[toolId] && typeof data[toolId] === 'string') {
      value.value = data[toolId] as string
    }
    loaded = true
  })

  watch(value, (newVal) => {
    if (!loaded || !cache) return
    if (newVal) {
      cache[toolId] = newVal
    } else {
      delete cache[toolId]
    }
    debouncedSave()
  })

  return value
}

/**
 * Composable that persists a tool's state (multi-field) to file storage.
 * Auto-loads on mount, auto-saves on change (debounced 1s).
 * Data is retained as long as the tool's tab is open; cleared on tab close.
 *
 * @param toolId - unique tool identifier
 * @param defaults - object with default values for each field
 * @returns reactive refs for each field
 */
export function usePersistentState<T extends Record<string, unknown>>(
  toolId: string,
  defaults: T,
): { [K in keyof T]: Ref<T[K]> } {
  type Result = { [K in keyof T]: Ref<T[K]> }
  const storageKey = `state:${toolId}`
  const keys = Object.keys(defaults) as (keyof T & string)[]
  const refs = {} as Result
  let loaded = false

  for (const key of keys) {
    refs[key] = ref(defaults[key]) as unknown as Ref<T[typeof key]>
  }

  onMounted(async () => {
    const data = await loadCache()
    const saved = data[storageKey] as Record<string, unknown> | undefined
    if (saved && typeof saved === 'object') {
      for (const key of keys) {
        if (key in saved) {
          ;(refs[key] as Ref<unknown>).value = saved[key]
        }
      }
    }
    loaded = true
  })

  // Watch each field and persist on change
  for (const key of keys) {
    watch(refs[key] as Ref<unknown>, () => {
      if (!loaded || !cache) return
      const current: Record<string, unknown> = {}
      for (const k of keys) {
        current[k] = (refs[k] as Ref<unknown>).value
      }
      cache[storageKey] = current
      debouncedSave()
    })
  }

  return refs
}

/**
 * Remove persisted state for a tool. Call this on tab close.
 */
export async function clearPersistedState(toolId: string) {
  const data = await loadCache()
  delete data[toolId]
  delete data[`state:${toolId}`]
  debouncedSave()
}
