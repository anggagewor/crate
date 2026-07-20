import { ref, watch, onMounted } from 'vue'
import { loadJson, saveJson } from '@/services/storage'

const STORAGE_FILE = 'tool-inputs.json'
let cache: Record<string, string> | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

async function loadCache(): Promise<Record<string, string>> {
  if (cache === null) {
    cache = await loadJson<Record<string, string>>(STORAGE_FILE, {})
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

  onMounted(async () => {
    const data = await loadCache()
    if (data[toolId]) {
      value.value = data[toolId]
    }
  })

  watch(value, (newVal) => {
    if (cache) {
      if (newVal) {
        cache[toolId] = newVal
      } else {
        delete cache[toolId]
      }
      debouncedSave()
    }
  })

  return value
}
