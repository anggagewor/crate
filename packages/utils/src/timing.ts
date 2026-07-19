/**
 * Debounce a function — only execute after `ms` of inactivity.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms = 300): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as unknown as T
}

/**
 * Throttle a function — execute at most once every `ms`.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, ms = 300): T {
  let lastCall = 0
  return ((...args: unknown[]) => {
    const now = Date.now()
    if (now - lastCall >= ms) {
      lastCall = now
      fn(...args)
    }
  }) as unknown as T
}

/**
 * Promise-based sleep.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
