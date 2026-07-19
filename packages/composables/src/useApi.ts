import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import type { ApiError } from '@purdia/http'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseApiReturn<T> {
  /** Reactive data result */
  data: ShallowRef<T | null>
  /** Loading state */
  loading: Ref<boolean>
  /** Error object (null when no error) */
  error: ShallowRef<ApiError | null>
  /**
   * Execute the request.
   * Optionally pass args that will be forwarded to the fetcher function.
   */
  execute: (...args: unknown[]) => Promise<T | null>
  /** Reset state back to initial */
  reset: () => void
}

export interface UseApiOptions<T> {
  /** Initial value for data (defaults to null) */
  initialData?: T | null
  /** Execute immediately on composable creation */
  immediate?: boolean
  /** Callback on success */
  onSuccess?: (data: T) => void
  /** Callback on error */
  onError?: (error: ApiError) => void
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Generic composable for API calls with loading/error/data state management.
 *
 * @example
 * ```ts
 * const { data: clients, loading, execute } = useApi(() => get<Client[]>('/clients'))
 * await execute()
 * ```
 */
export function useApi<T>(
  fetcher: (...args: unknown[]) => Promise<{ data: T } | T>,
  options: UseApiOptions<T> = {},
): UseApiReturn<T> {
  const { initialData = null, immediate = false, onSuccess, onError } = options

  const data = shallowRef<T | null>(initialData) as ShallowRef<T | null>
  const loading = ref(false)
  const error = shallowRef<ApiError | null>(null) as ShallowRef<ApiError | null>

  async function execute(...args: unknown[]): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await fetcher(...args)

      // Support both raw value and { data: T } shape (ApiResponse)
      const resolved =
        result && typeof result === 'object' && 'data' in result
          ? (result as { data: T }).data
          : (result as T)

      data.value = resolved
      onSuccess?.(resolved)
      return resolved
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError
      onError?.(apiError)
      return null
    } finally {
      loading.value = false
    }
  }

  function reset() {
    data.value = initialData
    loading.value = false
    error.value = null
  }

  if (immediate) {
    execute()
  }

  return { data, loading, error, execute, reset }
}
