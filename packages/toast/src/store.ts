import { ref } from 'vue'
import { defineStore } from 'pinia'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

export interface Toast {
  id: string
  variant: ToastVariant
  title?: string
  message: string
  duration: number
  dismissible: boolean
  createdAt: number
}

export interface ToastOptions {
  title?: string
  message: string
  variant?: ToastVariant
  /** Duration in ms (0 = persistent, default 5000) */
  duration?: number
  dismissible?: boolean
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  const position = ref<ToastPosition>('top-right')
  const maxVisible = ref(5)

  let counter = 0

  function add(options: ToastOptions): string {
    const id = `toast-${++counter}-${Date.now()}`

    const toast: Toast = {
      id,
      variant: options.variant ?? 'info',
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      dismissible: options.dismissible ?? true,
      createdAt: Date.now(),
    }

    toasts.value.push(toast)

    if (toasts.value.length > maxVisible.value) {
      toasts.value.splice(0, toasts.value.length - maxVisible.value)
    }

    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration)
    }

    return id
  }

  function dismiss(id: string) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      toasts.value.splice(idx, 1)
    }
  }

  function clear() {
    toasts.value = []
  }

  function success(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'variant'>>) {
    return add({ message, variant: 'success', ...options })
  }

  function error(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'variant'>>) {
    return add({ message, variant: 'error', duration: 8000, ...options })
  }

  function warning(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'variant'>>) {
    return add({ message, variant: 'warning', ...options })
  }

  function info(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'variant'>>) {
    return add({ message, variant: 'info', ...options })
  }

  return { toasts, position, maxVisible, add, dismiss, clear, success, error, warning, info }
})
